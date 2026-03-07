/**
 * Candidate Manager — Candidate Registration & Management
 * =======================================================
 *
 * Handles candidate registration, approval, and removal.
 * Supports both self-registration by users and admin/RH management.
 *
 * Story 2.2: Candidate Registration & Management
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface Candidate {
  id: string;
  election_id: string;
  user_id?: string; // null if registered by RH
  name: string;
  proposal?: string;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Register user as candidate in election
 * AC1: User can register as candidate in draft election
 */
export async function registerAsCandidate(
  electionId: string,
  userId: string,
  data: {
    name?: string;
    proposal?: string;
  },
  supabase: SupabaseClient
): Promise<Candidate> {
  // Check election status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  // AC2: Can't register in active election
  if (election.status !== 'draft') {
    throw new Error('Cannot register after election starts');
  }

  // AC3: Check if already registered
  const { data: existing, error: checkError } = await supabase
    .from('candidates')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .single();

  if (existing && !checkError) {
    throw new Error('Already registered as candidate');
  }

  // Register candidate
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      election_id: electionId,
      user_id: userId,
      name: data.name || 'Unnamed Candidate',
      proposal: data.proposal,
      status: 'approved', // Auto-approve self-registration
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to register candidate: ${error.message}`);
  }

  // Audit log
  supabase.from('audit_logs').insert({
    action: 'candidate_self_register',
    resource_type: 'candidate',
    resource_id: candidate.id,
    user_id: userId,
    election_id: electionId,
    severity: 'low',
  });

  return candidate as Candidate;
}

/**
 * Add candidate (RH/Admin)
 * AC4: RH can add candidates
 */
export async function addCandidate(
  electionId: string,
  data: {
    name: string;
    proposal?: string;
    photo_url?: string;
  },
  adminId: string,
  supabase: SupabaseClient
): Promise<Candidate> {
  // Check election status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  if (election.status !== 'draft') {
    throw new Error('Can only add candidates to draft elections');
  }

  // Add candidate (no user_id for admin-added candidates)
  const { data: candidate, error } = await supabase
    .from('candidates')
    .insert({
      election_id: electionId,
      name: data.name,
      proposal: data.proposal,
      photo_url: data.photo_url,
      status: 'approved',
      created_by: adminId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add candidate: ${error.message}`);
  }

  // Audit log
  supabase.from('audit_logs').insert({
    action: 'candidate_add',
    resource_type: 'candidate',
    resource_id: candidate.id,
    user_id: adminId,
    election_id: electionId,
    details: { name: data.name },
    severity: 'low',
  });

  return candidate as Candidate;
}

/**
 * Get candidate by ID
 */
export async function getCandidate(
  candidateId: string,
  supabase: SupabaseClient
): Promise<Candidate> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single();

  if (error || !data) {
    throw new Error(`Candidate not found: ${candidateId}`);
  }

  return data as Candidate;
}

/**
 * List candidates for election
 */
export async function listCandidates(
  electionId: string,
  supabase: SupabaseClient
): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('election_id', electionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list candidates: ${error.message}`);
  }

  return (data || []) as Candidate[];
}

/**
 * Remove candidate
 * AC5: RH can remove candidates
 */
export async function removeCandidate(
  candidateId: string,
  adminId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Get candidate to verify election status
  const candidate = await getCandidate(candidateId, supabase);

  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status')
    .eq('id', candidate.election_id)
    .single();

  if (electionError || !election) {
    throw new Error('Election not found');
  }

  if (election.status !== 'draft') {
    throw new Error('Can only remove candidates from draft elections');
  }

  // Delete candidate
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);

  if (error) {
    throw new Error(`Failed to remove candidate: ${error.message}`);
  }

  // Audit log
  supabase.from('audit_logs').insert({
    action: 'candidate_remove',
    resource_type: 'candidate',
    resource_id: candidateId,
    user_id: adminId,
    election_id: candidate.election_id,
    details: { name: candidate.name },
    severity: 'low',
  });
}

/**
 * Check if user is candidate in election
 */
export async function isUserCandidate(
  electionId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('candidates')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

/**
 * Get candidate count for election
 */
export async function getCandidateCount(
  electionId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('candidates')
    .select('id', { count: 'exact' })
    .eq('election_id', electionId);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Deregister user from candidacy
 */
export async function deregisterAsCandidate(
  electionId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Check election status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status, start_date')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error('Election not found');
  }

  const startDate = new Date(election.start_date);
  if (new Date() >= startDate) {
    throw new Error('Cannot deregister after election starts');
  }

  // Delete candidate registration
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('election_id', electionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to deregister: ${error.message}`);
  }

  // Audit log
  supabase.from('audit_logs').insert({
    action: 'candidate_deregister',
    resource_type: 'candidate',
    user_id: userId,
    election_id: electionId,
    severity: 'low',
  });
}
