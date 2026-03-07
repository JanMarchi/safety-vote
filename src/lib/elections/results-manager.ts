/**
 * Results Manager — Results & Tallying
 * ====================================
 *
 * Handles vote tallying, result calculation, winner determination,
 * and results finalization.
 *
 * Story 2.4: Results & Tallying
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { decryptVote } from './vote-manager';

export interface TallyResult {
  election_id: string;
  total_votes: number;
  total_voters: number;
  abstentions: number;
  results: {
    [candidateId: string]: {
      name: string;
      votes: number;
      percentage: number;
      rank: number;
    };
  };
  winner_id?: string;
  winner_name?: string;
  is_tied: boolean;
  finalized_at: string;
}

/**
 * Tally all votes for election
 * AC1: Calculate vote counts per candidate
 */
export async function tallyVotes(
  electionId: string,
  encryptionKey: string,
  supabase: SupabaseClient
): Promise<TallyResult> {
  // Get election
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('*')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  // Get all votes
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('*')
    .eq('election_id', electionId);

  if (votesError || !votes) {
    throw new Error(`Failed to retrieve votes: ${votesError?.message}`);
  }

  // Decrypt and tally votes
  const tallyMap: { [candidateId: string]: number } = {};
  let abstentionCount = 0;

  votes.forEach((vote: any) => {
    if (vote.candidate_id === null) {
      abstentionCount += 1;
    } else {
      if (!tallyMap[vote.candidate_id]) {
        tallyMap[vote.candidate_id] = 0;
      }
      tallyMap[vote.candidate_id] += 1;
    }
  });

  // Get candidates
  const { data: candidates, error: candError } = await supabase
    .from('candidates')
    .select('id, name')
    .eq('election_id', electionId);

  if (candError) {
    throw new Error(`Failed to get candidates: ${candError.message}`);
  }

  const candidateMap = new Map(candidates.map((c: any) => [c.id, c.name]));

  // Calculate percentages and rankings
  const totalVotes = votes.length;
  const results: TallyResult['results'] = {};
  let maxVotes = 0;

  Object.entries(tallyMap).forEach(([candidateId, count]: [string, any]) => {
    const percentage = (count / totalVotes) * 100;
    results[candidateId] = {
      name: candidateMap.get(candidateId) || 'Unknown',
      votes: count,
      percentage: Math.round(percentage * 100) / 100,
      rank: 0, // Will be updated after sorting
    };

    maxVotes = Math.max(maxVotes, count);
  });

  // Assign rankings
  let rank = 1;
  Object.values(results)
    .sort((a, b) => b.votes - a.votes)
    .forEach((result) => {
      result.rank = rank++;
    });

  // Determine winner
  const winners = Object.entries(results)
    .filter(([, result]) => result.votes === maxVotes)
    .map(([id]) => id);

  const isTied = winners.length > 1;
  const winnerId = winners.length > 0 ? winners[0] : undefined;
  const winnerName = winnerId ? results[winnerId].name : undefined;

  return {
    election_id: electionId,
    total_votes: totalVotes,
    total_voters: votes.length,
    abstentions: abstentionCount,
    results,
    winner_id: winnerId,
    winner_name: winnerName,
    is_tied: isTied,
    finalized_at: new Date().toISOString(),
  };
}

/**
 * Finalize election results
 * AC2: Close voting and store final results
 */
export async function finalizeResults(
  electionId: string,
  encryptionKey: string,
  supabase: SupabaseClient
): Promise<TallyResult> {
  // Verify election is completed
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status, end_date')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  const now = new Date();
  const endDate = new Date(election.end_date);

  if (now < endDate && election.status === 'active') {
    throw new Error('Election is still active, cannot finalize');
  }

  // Tally votes
  const results = await tallyVotes(electionId, encryptionKey, supabase);

  // Store results in audit log
  supabase.from('audit_logs').insert({
    action: 'election_results_finalized',
    resource_type: 'election',
    resource_id: electionId,
    details: {
      total_votes: results.total_votes,
      abstentions: results.abstentions,
      winner_id: results.winner_id,
      is_tied: results.is_tied,
    },
    severity: 'high',
  });

  // Update election status to completed
  await supabase
    .from('elections')
    .update({ status: 'completed' })
    .eq('id', electionId);

  return results;
}

/**
 * Get election results
 * AC3: Retrieve calculated results for completed election
 */
export async function getElectionResults(
  electionId: string,
  supabase: SupabaseClient
): Promise<TallyResult | null> {
  // Check election status
  const { data: election, error: electionError } = await supabase
    .from('elections')
    .select('status')
    .eq('id', electionId)
    .single();

  if (electionError || !election) {
    throw new Error(`Election not found: ${electionId}`);
  }

  // Results only available for completed elections
  if (election.status !== 'completed') {
    return null;
  }

  // Get votes count per candidate
  const { data: votes, error: votesError } = await supabase
    .from('votes')
    .select('candidate_id')
    .eq('election_id', electionId);

  if (votesError || !votes) {
    throw new Error(`Failed to retrieve votes: ${votesError?.message}`);
  }

  // Tally
  const tallyMap: { [candidateId: string]: number } = {};
  let abstentionCount = 0;

  votes.forEach((vote: any) => {
    if (vote.candidate_id === null) {
      abstentionCount += 1;
    } else {
      if (!tallyMap[vote.candidate_id]) {
        tallyMap[vote.candidate_id] = 0;
      }
      tallyMap[vote.candidate_id] += 1;
    }
  });

  // Get candidate names
  const { data: candidates } = await supabase
    .from('candidates')
    .select('id, name')
    .eq('election_id', electionId);

  const candidateMap = new Map(candidates?.map((c: any) => [c.id, c.name]) || []);

  // Build results
  const results: TallyResult['results'] = {};
  const totalVotes = votes.length;
  let maxVotes = 0;

  Object.entries(tallyMap).forEach(([candidateId, count]: [string, any]) => {
    const percentage = (count / totalVotes) * 100;
    results[candidateId] = {
      name: candidateMap.get(candidateId) || 'Unknown',
      votes: count,
      percentage: Math.round(percentage * 100) / 100,
      rank: 0,
    };

    maxVotes = Math.max(maxVotes, count);
  });

  // Assign rankings
  let rank = 1;
  Object.values(results)
    .sort((a, b) => b.votes - a.votes)
    .forEach((result) => {
      result.rank = rank++;
    });

  // Determine winner
  const winners = Object.entries(results)
    .filter(([, result]) => result.votes === maxVotes)
    .map(([id]) => id);

  const isTied = winners.length > 1;

  return {
    election_id: electionId,
    total_votes: totalVotes,
    total_voters: votes.length,
    abstentions: abstentionCount,
    results,
    winner_id: winners.length > 0 ? winners[0] : undefined,
    winner_name: winners.length > 0 ? results[winners[0]].name : undefined,
    is_tied: isTied,
    finalized_at: new Date().toISOString(),
  };
}

/**
 * Get winner(s) of election
 * AC4: Determine election winner(s)
 */
export async function getElectionWinner(
  electionId: string,
  supabase: SupabaseClient
): Promise<{ candidate_id: string; name: string; is_tied: boolean } | null> {
  const results = await getElectionResults(electionId, supabase);

  if (!results || !results.winner_id) {
    return null;
  }

  return {
    candidate_id: results.winner_id,
    name: results.winner_name || 'Unknown',
    is_tied: results.is_tied,
  };
}

/**
 * Generate results report
 * AC5: Create detailed results document
 */
export async function generateResultsReport(
  electionId: string,
  supabase: SupabaseClient
): Promise<string> {
  const { data: election } = await supabase
    .from('elections')
    .select('title, description, start_date, end_date')
    .eq('id', electionId)
    .single();

  const results = await getElectionResults(electionId, supabase);

  if (!results) {
    throw new Error('Results not available yet');
  }

  const reportDate = new Date().toLocaleDateString('pt-BR');
  const lines = [
    '═'.repeat(60),
    'RELATÓRIO OFICIAL DE RESULTADOS',
    '═'.repeat(60),
    '',
    `Eleição: ${election?.title || 'N/A'}`,
    `Descrição: ${election?.description || 'N/A'}`,
    `Data de Início: ${new Date(election?.start_date).toLocaleDateString('pt-BR')}`,
    `Data de Término: ${new Date(election?.end_date).toLocaleDateString('pt-BR')}`,
    `Relatório Gerado em: ${reportDate}`,
    '',
    '─'.repeat(60),
    'RESUMO',
    '─'.repeat(60),
    `Total de Eleitores: ${results.total_voters}`,
    `Total de Votos: ${results.total_votes}`,
    `Abstenções: ${results.abstentions}`,
    `Taxa de Participação: ${((results.total_votes / results.total_voters) * 100).toFixed(2)}%`,
    '',
    '─'.repeat(60),
    'RESULTADOS',
    '─'.repeat(60),
  ];

  // Add candidate results
  Object.entries(results.results)
    .sort(([, a], [, b]) => b.votes - a.votes)
    .forEach(([candidateId, result]) => {
      lines.push(
        `${result.rank}º. ${result.name}`,
        `    Votos: ${result.votes} (${result.percentage}%)`,
        ''
      );
    });

  // Add winner
  if (results.winner_id) {
    lines.push('─'.repeat(60));
    lines.push('VENCEDOR');
    lines.push('─'.repeat(60));
    if (results.is_tied) {
      lines.push(`⚠️  RESULTADO EMPATADO - ${results.winner_name}`);
    } else {
      lines.push(`✓ ${results.winner_name}`);
    }
  }

  lines.push('');
  lines.push('═'.repeat(60));

  return lines.join('\n');
}

/**
 * Validate results integrity
 * AC6: Ensure results are trustworthy
 */
export async function validateResultsIntegrity(
  electionId: string,
  supabase: SupabaseClient
): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];

  // Check election exists
  const { data: election } = await supabase
    .from('elections')
    .select('status')
    .eq('id', electionId)
    .single();

  if (!election) {
    issues.push('Election not found');
    return { valid: false, issues };
  }

  // Check votes exist
  const { data: votes } = await supabase
    .from('votes')
    .select('id')
    .eq('election_id', electionId);

  if (!votes || votes.length === 0) {
    issues.push('No votes found for election');
  }

  // Check all votes have valid encryption
  const { data: allVotes } = await supabase
    .from('votes')
    .select('id, encrypted_data, iv, auth_tag')
    .eq('election_id', electionId);

  if (allVotes) {
    allVotes.forEach((vote: any) => {
      if (!vote.encrypted_data || !vote.iv || !vote.auth_tag) {
        issues.push(`Vote ${vote.id} missing encryption data`);
      }
    });
  }

  // Check duplicate votes (optional - RPC may not exist)
  try {
    const { data: duplicates } = (await supabase
      .rpc('check_duplicate_votes', { election_id: electionId })) as any;

    if (duplicates && duplicates.length > 0) {
      issues.push(`Found ${duplicates.length} duplicate votes`);
    }
  } catch {
    // RPC not available - skip duplicate check
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
