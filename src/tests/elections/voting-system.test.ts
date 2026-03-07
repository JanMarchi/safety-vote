/**
 * Voting System Tests — Story 2.3
 * ==============================
 *
 * Tests for vote casting, encryption, and result aggregation.
 *
 * Covers encryption, vote management, and preliminary results
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  castVote,
  getVote,
  hasUserVoted,
  getCandidateVoteCount,
  getElectionVoteCount,
  getAbstentionCount,
  getPreliminaryResults,
  generateEncryptionKey,
  encryptVote,
  decryptVote,
  verifyVoteIntegrity,
  type Vote,
} from '@/lib/elections/vote-manager';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Story 2.3: Voting System', () => {
  let mockSupabase: any;
  const companyId = 'company-1';
  const userId = 'user-1';
  const electionId = 'elec-1';
  const candidateId = 'cand-1';
  const encryptionKey = generateEncryptionKey();

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
    };

    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('Encryption & Decryption', () => {
    it('should generate valid encryption key (32 bytes)', () => {
      const key = generateEncryptionKey();
      expect(key).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex chars
    });

    it('should encrypt vote with AES-256-GCM', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);

      expect(encrypted).toBeDefined();
      expect(iv).toBeDefined();
      expect(authTag).toBeDefined();
      expect(encrypted).toMatch(/^[0-9a-f]+$/);
      expect(iv).toMatch(/^[0-9a-f]{24}$/); // 12 bytes = 24 hex chars
      expect(authTag).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
    });

    it('should decrypt encrypted vote correctly', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);
      const decrypted = decryptVote(encrypted, iv, authTag, encryptionKey);

      expect(decrypted.candidateId).toBe(candidateId);
      expect(decrypted.timestamp).toBeDefined();
      expect(typeof decrypted.timestamp).toBe('number');
    });

    it('should handle abstention vote (null candidate)', () => {
      const { encrypted, iv, authTag } = encryptVote(null, encryptionKey);
      const decrypted = decryptVote(encrypted, iv, authTag, encryptionKey);

      expect(decrypted.candidateId).toBeNull();
    });

    it('should fail decryption with wrong key', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);
      const wrongKey = generateEncryptionKey();

      expect(() => {
        decryptVote(encrypted, iv, authTag, wrongKey);
      }).toThrow();
    });

    it('should fail decryption with corrupted auth tag', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);
      const corruptedTag = 'ffffffffffffffffffffffffffffffff';

      expect(() => {
        decryptVote(encrypted, iv, corruptedTag, encryptionKey);
      }).toThrow();
    });

    it('should verify vote integrity with correct credentials', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);

      const isValid = verifyVoteIntegrity(encrypted, iv, authTag, encryptionKey);
      expect(isValid).toBe(true);
    });

    it('should reject vote integrity with wrong key', () => {
      const { encrypted, iv, authTag } = encryptVote(candidateId, encryptionKey);
      const wrongKey = generateEncryptionKey();

      const isValid = verifyVoteIntegrity(encrypted, iv, authTag, wrongKey);
      expect(isValid).toBe(false);
    });
  });

  describe('AC1: Eleitor Can Vote in Active Election', () => {
    it('should cast vote in active election', async () => {
      const mockElection = {
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T23:59:59Z',
        allow_abstention: true,
      };

      const mockVote: Vote = {
        id: 'vote-1',
        election_id: electionId,
        voter_id: userId,
        candidate_id: candidateId,
        encrypted_data: 'encrypted_data',
        iv: 'iv_value',
        auth_tag: 'tag_value',
        created_at: '2026-03-07T10:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      // Candidate lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: candidateId },
        error: null,
      });

      // Existing vote check
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      // Insert result
      mockSupabase.single.mockResolvedValueOnce({
        data: mockVote,
        error: null,
      });

      const result = await castVote(
        electionId,
        userId,
        candidateId,
        encryptionKey,
        mockSupabase
      );

      expect(result.voter_id).toBe(userId);
      expect(result.election_id).toBe(electionId);
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should not cast vote if election is not active', async () => {
      const mockElection = {
        status: 'draft',
        start_date: '2026-04-01T00:00:00Z',
        end_date: '2026-04-15T23:59:59Z',
        allow_abstention: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        castVote(electionId, userId, candidateId, encryptionKey, mockSupabase)
      ).rejects.toThrow('not currently active');
    });

    it('should not cast vote before election starts', async () => {
      const future = new Date(Date.now() + 86400000); // tomorrow
      const mockElection = {
        status: 'active',
        start_date: future.toISOString(),
        end_date: new Date(future.getTime() + 86400000).toISOString(),
        allow_abstention: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        castVote(electionId, userId, candidateId, encryptionKey, mockSupabase)
      ).rejects.toThrow('not currently active');
    });

    it('should not cast vote after election ends', async () => {
      const past = new Date(Date.now() - 86400000); // yesterday
      const mockElection = {
        status: 'active',
        start_date: new Date(past.getTime() - 86400000).toISOString(),
        end_date: past.toISOString(),
        allow_abstention: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        castVote(electionId, userId, candidateId, encryptionKey, mockSupabase)
      ).rejects.toThrow('not currently active');
    });
  });

  describe('AC2: Abstention Handling', () => {
    it('should allow abstention if enabled', async () => {
      const mockElection = {
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T23:59:59Z',
        allow_abstention: true,
      };

      const mockVote: Vote = {
        id: 'vote-2',
        election_id: electionId,
        voter_id: userId,
        candidate_id: null, // abstention
        encrypted_data: 'encrypted_data',
        iv: 'iv_value',
        auth_tag: 'tag_value',
        created_at: '2026-03-07T10:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      // No candidate check for abstention
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockVote,
        error: null,
      });

      const result = await castVote(
        electionId,
        userId,
        null,
        encryptionKey,
        mockSupabase
      );

      expect(result.candidate_id).toBeNull();
    });

    it('should reject abstention if not allowed', async () => {
      const mockElection = {
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T23:59:59Z',
        allow_abstention: false,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        castVote(electionId, userId, null, encryptionKey, mockSupabase)
      ).rejects.toThrow('Abstention is not allowed');
    });
  });

  describe('AC3: Duplicate Vote Prevention', () => {
    it('should reject duplicate vote from same user', async () => {
      const mockElection = {
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T23:59:59Z',
        allow_abstention: true,
      };

      const existingVote = { id: 'vote-existing' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      // Check for candidate (will pass)
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: candidateId },
        error: null,
      });

      // Check for existing vote (will find one)
      mockSupabase.single.mockResolvedValueOnce({
        data: existingVote,
        error: null,
      });

      await expect(
        castVote(electionId, userId, candidateId, encryptionKey, mockSupabase)
      ).rejects.toThrow('already voted');
    });
  });

  describe('Vote Counting', () => {
    it('hasUserVoted should return true if user voted', async () => {
      const mockVote = { id: 'vote-1' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockVote,
        error: null,
      });

      const result = await hasUserVoted(electionId, userId, mockSupabase);
      expect(result).toBe(true);
    });

    it('hasUserVoted should return false if user has not voted', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await hasUserVoted(electionId, userId, mockSupabase);
      expect(result).toBe(false);
    });

    it('getCandidateVoteCount should return vote count', async () => {
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({
        data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        count: 3,
        error: null,
      });

      const result = await getCandidateVoteCount(candidateId, mockSupabase);
      expect(result).toBe(3);
    });

    it('getElectionVoteCount should return total votes', async () => {
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({
        data: Array(10).fill({ id: '1' }),
        count: 10,
        error: null,
      });

      const result = await getElectionVoteCount(electionId, mockSupabase);
      expect(result).toBe(10);
    });

    it('getAbstentionCount should return abstention count', async () => {
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockReturnThis();
      mockSupabase.is.mockResolvedValueOnce({
        data: Array(2).fill({ id: '1' }),
        count: 2,
        error: null,
      });

      const result = await getAbstentionCount(electionId, mockSupabase);
      expect(result).toBe(2);
    });
  });

  describe('Results & Tallying', () => {
    it('getPreliminaryResults should aggregate vote counts', async () => {
      const mockVotes = [
        { candidate_id: candidateId },
        { candidate_id: candidateId },
        { candidate_id: 'cand-2' },
        { candidate_id: null }, // abstention
      ];

      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({
        data: mockVotes,
        error: null,
      });

      const results = await getPreliminaryResults(electionId, mockSupabase);

      expect(results[candidateId]).toBe(2);
      expect(results['cand-2']).toBe(1);
      expect(results.abstentions).toBe(1);
    });

    it('should handle election with no votes', async () => {
      mockSupabase.select.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const results = await getPreliminaryResults(electionId, mockSupabase);

      expect(results.abstentions).toBe(0);
      expect(Object.keys(results).length).toBe(1); // only abstentions key
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing election gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        castVote(electionId, userId, candidateId, encryptionKey, mockSupabase)
      ).rejects.toThrow('Election not found');
    });

    it('should handle invalid candidate', async () => {
      const mockElection = {
        status: 'active',
        start_date: '2026-03-01T00:00:00Z',
        end_date: '2026-03-31T23:59:59Z',
        allow_abstention: true,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        castVote(electionId, userId, 'invalid-cand', encryptionKey, mockSupabase)
      ).rejects.toThrow('Candidate not found');
    });
  });
});
