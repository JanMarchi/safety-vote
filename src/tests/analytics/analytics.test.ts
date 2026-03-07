/**
 * Analytics Service Tests
 * Story 4.3: Analytics & Reports
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getElectionAnalytics,
  getCompanyAnalytics,
  getVotingTrends,
  generatePDFReport,
  exportToCSV,
} from '@/lib/analytics/analytics-service';

describe('Story 4.3: Analytics & Reports', () => {
  const mockSupabaseClient = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Election Analytics', () => {
    it('should calculate election analytics from votes', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T12:00:00Z', candidate_id: 'cand-2' },
        { created_at: '2026-04-01T13:00:00Z', candidate_id: null },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const analytics = await getElectionAnalytics('elec-123', mockSupabaseClient as any);

      expect(analytics).not.toBeNull();
      expect(analytics?.election_id).toBe('elec-123');
      expect(analytics?.total_votes).toBe(4);
      expect(analytics?.abstention_rate).toBe(25); // 1 out of 4
      expect(analytics?.most_voted_candidate).toBe('cand-1');
    });

    it('should return null when no votes exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const analytics = await getElectionAnalytics('elec-123', mockSupabaseClient as any);

      expect(analytics).toBeNull();
    });

    it('should calculate participation rate', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const analytics = await getElectionAnalytics('elec-123', mockSupabaseClient as any);

      expect(analytics?.participation_rate).toBe(100); // All votes are counted as participation
    });

    it('should identify least voted candidate', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T12:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T13:00:00Z', candidate_id: 'cand-2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const analytics = await getElectionAnalytics('elec-123', mockSupabaseClient as any);

      expect(analytics?.least_voted_candidate).toBe('cand-2');
    });
  });

  describe('Company Analytics', () => {
    it('should aggregate company-level statistics', async () => {
      const elections = [
        { id: 'elec-1', status: 'completed' },
        { id: 'elec-2', status: 'active' },
        { id: 'elec-3', status: 'draft' },
      ];

      const votes = [
        { id: 'vote-1' },
        { id: 'vote-2' },
        { id: 'vote-3' },
      ];

      const users = [
        { id: 'user-1' },
        { id: 'user-2' },
      ];

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: elections, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: votes, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: users, error: null }),
          }),
        });

      const analytics = await getCompanyAnalytics('company-123', mockSupabaseClient as any);

      expect(analytics).not.toBeNull();
      expect(analytics?.company_id).toBe('company-123');
      expect(analytics?.total_elections).toBe(3);
      expect(analytics?.completed_elections).toBe(1);
      expect(analytics?.total_voters).toBe(2);
      expect(analytics?.total_votes_cast).toBe(3);
    });

    it('should return null when company has no elections', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const analytics = await getCompanyAnalytics('company-123', mockSupabaseClient as any);

      expect(analytics).toBeNull();
    });

    it('should calculate average participation rate', async () => {
      const elections = [
        { id: 'elec-1', status: 'completed' },
      ];

      const votes = Array(50).fill({ id: 'vote-1' });

      const users = Array(100).fill({ id: 'user-1' });

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: elections, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: votes, error: null }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: users, error: null }),
          }),
        });

      const analytics = await getCompanyAnalytics('company-123', mockSupabaseClient as any);

      expect(analytics?.avg_participation).toBe(50); // 50 votes / 100 users
    });
  });

  describe('Voting Trends', () => {
    it('should group votes by hour', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T10:30:00Z', candidate_id: 'cand-2' },
        { created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T12:00:00Z', candidate_id: null },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const trends = await getVotingTrends('elec-123', mockSupabaseClient as any);

      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].votes_count).toBeGreaterThan(0);
    });

    it('should track abstentions separately', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T10:30:00Z', candidate_id: null },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const trends = await getVotingTrends('elec-123', mockSupabaseClient as any);

      const trend = trends.find((t) => t.timestamp.includes('2026-04-01T10'));
      expect(trend?.abstentions).toBeGreaterThan(0);
      expect(trend?.candidates_voted_for).toBeGreaterThan(0);
    });

    it('should return empty array when no votes', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const trends = await getVotingTrends('elec-123', mockSupabaseClient as any);

      expect(trends).toEqual([]);
    });
  });

  describe('PDF Report Generation', () => {
    it('should generate a PDF report buffer', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-1' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const report = await generatePDFReport('elec-123', mockSupabaseClient as any);

      expect(report).toBeTruthy();
      expect(report instanceof Buffer).toBe(true);
    });

    it('should include analytics data in report', async () => {
      const votes = [
        { created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const report = await generatePDFReport('elec-123', mockSupabaseClient as any);
      const reportText = report?.toString('utf-8') || '';

      expect(reportText).toContain('ELECTION ANALYTICS REPORT');
      expect(reportText).toContain('elec-123');
    });

    it('should return null when no analytics available', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const report = await generatePDFReport('elec-123', mockSupabaseClient as any);

      expect(report).toBeNull();
    });
  });

  describe('CSV Export', () => {
    it('should export votes to CSV format', async () => {
      const votes = [
        { id: 'vote-1', created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
        { id: 'vote-2', created_at: '2026-04-01T11:00:00Z', candidate_id: 'cand-2' },
        { id: 'vote-3', created_at: '2026-04-01T12:00:00Z', candidate_id: null },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const csv = await exportToCSV('elec-123', mockSupabaseClient as any);

      expect(csv).toBeTruthy();
      expect(csv).toContain('Vote ID');
      expect(csv).toContain('vote-1');
      expect(csv).toContain('abstain');
    });

    it('should format CSV with proper headers', async () => {
      const votes = [
        { id: 'vote-1', created_at: '2026-04-01T10:00:00Z', candidate_id: 'cand-1' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const csv = await exportToCSV('elec-123', mockSupabaseClient as any);
      const lines = csv?.split('\n') || [];
      const headers = lines[0];

      expect(headers).toContain('Vote ID');
      expect(headers).toContain('Timestamp');
      expect(headers).toContain('Candidate ID');
    });

    it('should return null when no votes', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const csv = await exportToCSV('elec-123', mockSupabaseClient as any);

      expect(csv).toBeNull();
    });

    it('should handle abstention votes correctly', async () => {
      const votes = [
        { id: 'vote-1', created_at: '2026-04-01T10:00:00Z', candidate_id: null },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: votes, error: null }),
        }),
      });

      const csv = await exportToCSV('elec-123', mockSupabaseClient as any);

      expect(csv).toContain('abstain');
    });
  });
});
