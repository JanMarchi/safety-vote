/**
 * Vote Manager — Voting System & Encryption
 * =========================================
 *
 * Handles vote casting, encryption, storage, and retrieval.
 * Implements AES-256 encryption for vote privacy.
 *
 * Story 2.3: Voting System
 */

import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface Vote {
  id: string;
  election_id: string;
  voter_id: string;
  candidate_id?: string; // null if abstention
  encrypted_data: string; // AES-256 encrypted vote
  iv: string; // Initialization vector
  auth_tag: string; // GCM authentication tag
  created_at: string;
}

/**
 * Encrypt vote using AES-256-GCM
 * Returns encrypted data, IV, and auth tag
 */
export function encryptVote(
  candidateId: string | null,
  encryptionKey: string
): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  // Generate random IV (96 bits for GCM)
  const iv = crypto.randomBytes(12);

  // Convert key from hex string to buffer
  const keyBuffer = Buffer.from(encryptionKey, 'hex');

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  // Encrypt vote data
  const voteData = JSON.stringify({ candidateId, timestamp: Date.now() });
  const encrypted = Buffer.concat([
    cipher.update(voteData, 'utf8'),
    cipher.final(),
  ]);

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt vote using AES-256-GCM
 */
export function decryptVote(
  encrypted: string,
  iv: string,
  authTag: string,
  encryptionKey: string
): { candidateId: string | null; timestamp: number } {
  const keyBuffer = Buffer.from(encryptionKey, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const tagBuffer = Buffer.from(authTag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'hex')),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString('utf8'));
}

/**
 * Cast vote
 * AC1: Eleitor can vote in active election
 */
export async function castVote(
  electionId: string,
  voterId: string,
  candidateId: string | null, // null = abstention
  encryptionKey: string,
  supabase: SupabaseClient
): Promise<Vote> {
  // Check election status and dates
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status, start_date, end_date, allow_abstention')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  // AC2: Can only vote in active election
  const now = new Date();
  const startDate = new Date(election.start_date);
  const endDate = new Date(election.end_date);

  if (election.status !== 'active' || now < startDate || now > endDate) {
    throw new Error('Election is not currently active');
  }

  // AC3: Check if abstention is allowed
  if (candidateId === null && !election.allow_abstention) {
    throw new Error('Abstention is not allowed for this election');
  }

  // Validate candidate exists if not abstaining
  if (candidateId) {
    const { data: candidate, error: candError } = await supabase
      .from('candidates')
      .select('id')
      .eq('id', candidateId)
      .eq('election_id', electionId)
      .single();

    if (candError || !candidate) {
      throw new Error('Candidate not found in this election');
    }
  }

  // Check if user already voted in this election
  const { data: existingVote, error: checkError } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', electionId)
    .eq('voter_id', voterId)
    .single();

  if (existingVote && !checkError) {
    throw new Error('User has already voted in this election');
  }

  // Encrypt vote
  const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);

  // Store vote
  const { data: vote, error } = await supabase
    .from('votes')
    .insert({
      election_id: electionId,
      voter_id: voterId,
      candidate_id: candidateId,
      encrypted_data: encrypted,
      iv,
      auth_tag: authTag,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cast vote: ${error.message}`);
  }

  // Audit log - fire-and-forget (non-blocking)
  supabase.from('audit_logs').insert({
    action: 'vote_cast',
    resource_type: 'vote',
    resource_id: vote.id,
    user_id: voterId,
    election_id: electionId,
    details: { abstained: candidateId === null },
    severity: 'low',
  });

  return vote as Vote;
}

/**
 * Get vote by ID (admin/results only)
 */
export async function getVote(
  voteId: string,
  supabase: SupabaseClient
): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('id', voteId)
    .single();

  if (error || !data) {
    throw new Error(`Vote not found: ${voteId}`);
  }

  return data as Vote;
}

/**
 * Check if user has voted in election
 */
export async function hasUserVoted(
  electionId: string,
  voterId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', electionId)
    .eq('voter_id', voterId)
    .single();

  return !error && !!data;
}

/**
 * Get vote count for candidate
 */
export async function getCandidateVoteCount(
  candidateId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('candidate_id', candidateId);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Get total votes for election
 */
export async function getElectionVoteCount(
  electionId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('election_id', electionId);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Get abstention count for election
 */
export async function getAbstentionCount(
  electionId: string,
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('election_id', electionId)
    .is('candidate_id', null);

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Get preliminary results (aggregated vote counts)
 * WARNING: This is public data after election closes
 * Do NOT expose voter identity
 */
export async function getPreliminaryResults(
  electionId: string,
  supabase: SupabaseClient
): Promise<{
  [candidateId: string]: number;
  abstentions: number;
}> {
  // Get all votes for election (only IDs and candidate_id)
  const { data: votes, error } = await supabase
    .from('votes')
    .select('candidate_id')
    .eq('election_id', electionId);

  if (error || !votes) {
    return { abstentions: 0 };
  }

  // Tally results
  const results: { [candidateId: string]: number; abstentions: number } = {
    abstentions: 0,
  };

  votes.forEach((vote: any) => {
    if (vote.candidate_id === null) {
      results.abstentions += 1;
    } else {
      if (!results[vote.candidate_id]) {
        results[vote.candidate_id] = 0;
      }
      results[vote.candidate_id] += 1;
    }
  });

  return results;
}

/**
 * Generate encryption key for election
 * Should be done once per election and stored securely
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify vote integrity (auth tag validation)
 */
export function verifyVoteIntegrity(
  encrypted: string,
  iv: string,
  authTag: string,
  encryptionKey: string
): boolean {
  try {
    decryptVote(encrypted, iv, authTag, encryptionKey);
    return true;
  } catch {
    return false;
  }
}
