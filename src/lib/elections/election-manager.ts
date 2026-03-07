/**
 * Election Manager — Election Creation & Management
 * ==================================================
 *
 * Handles election CRUD operations, status management,
 * and business logic for election lifecycle.
 *
 * Story 2.1: Election Creation & Management
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type ElectionStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Election {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  status: ElectionStatus;
  start_date: string;
  end_date: string;
  max_votes_per_user: number;
  allow_abstention: boolean;
  is_secret: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new election
 */
export async function createElection(
  data: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    max_votes_per_user?: number;
    allow_abstention?: boolean;
    is_secret?: boolean;
  },
  companyId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<Election> {
  // Validate dates
  if (new Date(data.end_date) <= new Date(data.start_date)) {
    throw new Error('End date must be after start date');
  }

  // Create election
  const { data: election, error } = await supabase
    .from('elections')
    .insert({
      company_id: companyId,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      max_votes_per_user: data.max_votes_per_user ?? 1,
      allow_abstention: data.allow_abstention ?? true,
      is_secret: data.is_secret ?? true,
      created_by: userId,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create election: ${error.message}`);
  }

  return election as Election;
}

/**
 * Get election by ID
 */
export async function getElection(
  electionId: string,
  supabase: SupabaseClient
): Promise<Election> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single();

  if (error || !data) {
    throw new Error(`Election not found: ${electionId}`);
  }

  return data as Election;
}

/**
 * List elections for a company
 */
export async function listElections(
  companyId: string,
  supabase: SupabaseClient
): Promise<Election[]> {
  const { data, error } = await supabase
    .from('elections')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list elections: ${error.message}`);
  }

  return (data || []) as Election[];
}

/**
 * Update election
 */
export async function updateElection(
  electionId: string,
  data: Partial<Omit<Election, 'id' | 'company_id' | 'created_by' | 'created_at'>>,
  supabase: SupabaseClient
): Promise<Election> {
  // Prevent updating if already active
  const election = await getElection(electionId, supabase);

  if (election.status === 'active') {
    throw new Error('Cannot update active elections');
  }

  // Validate dates if provided
  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      throw new Error('End date must be after start date');
    }
  }

  const { data: updated, error } = await supabase
    .from('elections')
    .update({ ...data, updated_at: new Date() })
    .eq('id', electionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update election: ${error.message}`);
  }

  return updated as Election;
}

/**
 * Update election status
 */
export async function updateElectionStatus(
  electionId: string,
  newStatus: ElectionStatus,
  supabase: SupabaseClient
): Promise<Election> {
  // Log status change
  supabase.from('audit_logs').insert({
    action: 'election_status_change',
    resource_type: 'election',
    resource_id: electionId,
    details: { newStatus },
    severity: 'medium',
  });

  return updateElection(electionId, { status: newStatus }, supabase);
}

/**
 * Check if election can accept new candidates
 */
export function canRegisterCandidates(election: Election): boolean {
  return election.status === 'draft';
}

/**
 * Check if election is active for voting
 */
export function isElectionActive(election: Election): boolean {
  const now = new Date();
  const startDate = new Date(election.start_date);
  const endDate = new Date(election.end_date);

  return election.status === 'active' && now >= startDate && now <= endDate;
}

/**
 * Check if election is finished
 */
export function isElectionFinished(election: Election): boolean {
  const now = new Date();
  const endDate = new Date(election.end_date);

  return election.status === 'completed' || now > endDate;
}

/**
 * Get election statistics
 */
export async function getElectionStats(
  electionId: string,
  supabase: SupabaseClient
): Promise<{
  candidateCount: number;
  voteCount: number;
  eligibleVoters: number;
}> {
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id', { count: 'exact' })
    .eq('election_id', electionId);

  const { data: votes } = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('election_id', electionId);

  // Get election to find company
  const election = await getElection(electionId, supabase);

  // Count users in company
  const { data: users } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('company_id', election.company_id);

  return {
    candidateCount: candidates?.length || 0,
    voteCount: votes?.length || 0,
    eligibleVoters: users?.length || 0,
  };
}
