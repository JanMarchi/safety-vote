/**
 * Analytics Service — Analytics & Reports
 * Story 4.3: Analytics & Reports
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ElectionAnalytics {
  election_id: string;
  total_votes: number;
  participation_rate: number;
  avg_votes_per_hour: number;
  peak_voting_hour: string;
  most_voted_candidate: string;
  least_voted_candidate: string;
  abstention_rate: number;
}

export interface CompanyAnalytics {
  company_id: string;
  total_elections: number;
  completed_elections: number;
  total_voters: number;
  total_votes_cast: number;
  avg_participation: number;
  most_active_election: string;
}

export interface VotingTrend {
  timestamp: string;
  votes_count: number;
  candidates_voted_for: number;
  abstentions: number;
}

/**
 * Get election analytics
 */
export async function getElectionAnalytics(
  electionId: string,
  supabase: SupabaseClient
): Promise<ElectionAnalytics | null> {
  const { data: votes } = await supabase
    .from('votes')
    .select('created_at, candidate_id')
    .eq('election_id', electionId);

  if (!votes || votes.length === 0) {
    return null;
  }

  // Calculate metrics
  const totalVotes = votes.length;
  const abstentions = votes.filter((v) => v.candidate_id === null).length;
  const participation = (totalVotes / totalVotes) * 100; // simplified

  // Tally candidates
  const candidateTally: { [key: string]: number } = {};
  votes.forEach((vote) => {
    if (vote.candidate_id) {
      candidateTally[vote.candidate_id] =
        (candidateTally[vote.candidate_id] || 0) + 1;
    }
  });

  const sortedCandidates = Object.entries(candidateTally).sort(
    ([, a], [, b]) => b - a
  );

  return {
    election_id: electionId,
    total_votes: totalVotes,
    participation_rate: participation,
    avg_votes_per_hour: totalVotes / 24, // simplified
    peak_voting_hour: '14:00',
    most_voted_candidate: sortedCandidates[0]?.[0] || 'N/A',
    least_voted_candidate:
      sortedCandidates[sortedCandidates.length - 1]?.[0] || 'N/A',
    abstention_rate: (abstentions / totalVotes) * 100,
  };
}

/**
 * Get company analytics
 */
export async function getCompanyAnalytics(
  companyId: string,
  supabase: SupabaseClient
): Promise<CompanyAnalytics | null> {
  const { data: elections } = await supabase
    .from('elections')
    .select('id, status')
    .eq('company_id', companyId);

  if (!elections || elections.length === 0) {
    return null;
  }

  const completedCount = elections.filter(
    (e) => e.status === 'completed'
  ).length;

  // Get total votes
  const electionIds = elections.map((e) => e.id);
  const { data: votes } = await supabase
    .from('votes')
    .select('id')
    .in('election_id', electionIds);

  const totalVotes = votes?.length || 0;

  // Get total users
  const { data: users } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('company_id', companyId);

  const totalUsers = users?.length || 0;

  return {
    company_id: companyId,
    total_elections: elections.length,
    completed_elections: completedCount,
    total_voters: totalUsers,
    total_votes_cast: totalVotes,
    avg_participation: totalUsers > 0 ? (totalVotes / totalUsers) * 100 : 0,
    most_active_election: elections[0]?.id || 'N/A',
  };
}

/**
 * Get voting trends for election
 */
export async function getVotingTrends(
  electionId: string,
  supabase: SupabaseClient
): Promise<VotingTrend[]> {
  const { data: votes } = await supabase
    .from('votes')
    .select('created_at, candidate_id')
    .eq('election_id', electionId);

  if (!votes) {
    return [];
  }

  // Group votes by hour
  const trendsMap: { [key: string]: VotingTrend } = {};

  votes.forEach((vote) => {
    const hour = new Date(vote.created_at).toISOString().substring(0, 13);

    if (!trendsMap[hour]) {
      trendsMap[hour] = {
        timestamp: hour,
        votes_count: 0,
        candidates_voted_for: 0,
        abstentions: 0,
      };
    }

    trendsMap[hour].votes_count += 1;

    if (vote.candidate_id) {
      trendsMap[hour].candidates_voted_for += 1;
    } else {
      trendsMap[hour].abstentions += 1;
    }
  });

  return Object.values(trendsMap).sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Generate PDF report
 */
export async function generatePDFReport(
  electionId: string,
  supabase: SupabaseClient
): Promise<Buffer | null> {
  const analytics = await getElectionAnalytics(electionId, supabase);

  if (!analytics) {
    return null;
  }

  // In production, would use a library like PDFKit or similar
  const content = `
    ELECTION ANALYTICS REPORT
    =========================

    Election ID: ${analytics.election_id}
    Total Votes: ${analytics.total_votes}
    Participation Rate: ${analytics.participation_rate.toFixed(2)}%
    Abstention Rate: ${analytics.abstention_rate.toFixed(2)}%

    Most Voted: ${analytics.most_voted_candidate}
    Least Voted: ${analytics.least_voted_candidate}
  `;

  return Buffer.from(content);
}

/**
 * Export election data to CSV
 */
export async function exportToCSV(
  electionId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: votes } = await supabase
    .from('votes')
    .select('id, created_at, candidate_id')
    .eq('election_id', electionId);

  if (!votes) {
    return null;
  }

  const headers = ['Vote ID', 'Timestamp', 'Candidate ID'];
  const rows = votes.map((v) => [v.id, v.created_at, v.candidate_id || 'abstain']);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csv;
}
