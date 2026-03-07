/**
 * Candidate Registration Tests — Story 2.2
 * ========================================
 *
 * Tests for candidate registration and management.
 *
 * Covers all 6 acceptance criteria
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  registerAsCandidate,
  addCandidate,
  getCandidate,
  listCandidates,
  removeCandidate,
  isUserCandidate,
  getCandidateCount,
  deregisterAsCandidate,
  type Candidate,
} from '@/lib/elections/candidate-manager';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Story 2.2: Candidate Registration & Management', () => {
  let mockSupabase: any;
  const companyId = 'company-1';
  const userId = 'user-1';
  const rhUserId = 'rh-1';
  const electionId = 'elec-1';

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    (createClient as any).mockReturnValue(mockSupabase);
  });

  describe('AC1: User Can Register As Candidate', () => {
    it('should register user as candidate in draft election', async () => {
      const mockElection = { id: electionId, status: 'draft' };
      const mockCandidate: Candidate = {
        id: 'cand-1',
        election_id: electionId,
        user_id: userId,
        name: 'John Doe',
        proposal: 'My proposal',
        status: 'approved',
        created_by: userId,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
      };

      // Check election status
      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      // Check if already registered (should return error/null)
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'No rows found' },
      });

      // Insert candidate
      mockSupabase.single.mockResolvedValueOnce({
        data: mockCandidate,
        error: null,
      });

      const result = await registerAsCandidate(
        electionId,
        userId,
        { name: 'John Doe', proposal: 'My proposal' },
        mockSupabase
      );

      expect(result.user_id).toBe(userId);
      expect(result.status).toBe('approved');
      expect(mockSupabase.from).toHaveBeenCalledWith('candidates');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should use default name if not provided', async () => {
      const mockElection = { id: electionId, status: 'draft' };
      const mockCandidate: Candidate = {
        id: 'cand-2',
        election_id: electionId,
        user_id: userId,
        name: 'Unnamed Candidate',
        status: 'approved',
        created_by: userId,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
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
        data: mockCandidate,
        error: null,
      });

      const result = await registerAsCandidate(
        electionId,
        userId,
        {},
        mockSupabase
      );

      expect(result.name).toBe('Unnamed Candidate');
    });
  });

  describe('AC2: Candidate Cant Register in Active Election', () => {
    it('should reject registration when election is active', async () => {
      const mockElection = { id: electionId, status: 'active' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        registerAsCandidate(electionId, userId, { name: 'John' }, mockSupabase)
      ).rejects.toThrow('Cannot register after election starts');
    });

    it('should reject registration when election is completed', async () => {
      const mockElection = { id: electionId, status: 'completed' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        registerAsCandidate(electionId, userId, { name: 'John' }, mockSupabase)
      ).rejects.toThrow('Cannot register after election starts');
    });
  });

  describe('AC3: One Candidate Per Election Per User', () => {
    it('should reject duplicate registration for same user', async () => {
      const mockElection = { id: electionId, status: 'draft' };
      const existingCandidate = { id: 'cand-1', user_id: userId };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: existingCandidate,
        error: null,
      });

      await expect(
        registerAsCandidate(electionId, userId, { name: 'John' }, mockSupabase)
      ).rejects.toThrow('Already registered as candidate');
    });

    it('should allow different users to register', async () => {
      const mockElection = { id: electionId, status: 'draft' };
      const userId2 = 'user-2';
      const mockCandidate: Candidate = {
        id: 'cand-1',
        election_id: electionId,
        user_id: userId2,
        name: 'Jane Doe',
        status: 'approved',
        created_by: userId2,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
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
        data: mockCandidate,
        error: null,
      });

      const result = await registerAsCandidate(
        electionId,
        userId2,
        { name: 'Jane Doe' },
        mockSupabase
      );

      expect(result.user_id).toBe(userId2);
    });
  });

  describe('AC4: RH Can Add Candidates', () => {
    it('should allow RH to add candidate with name and proposal', async () => {
      const mockElection = { id: electionId, status: 'draft' };
      const mockCandidate: Candidate = {
        id: 'cand-2',
        election_id: electionId,
        name: 'Admin Added Candidate',
        proposal: 'Professional proposal',
        photo_url: 'https://example.com/photo.jpg',
        status: 'approved',
        created_by: rhUserId,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCandidate,
        error: null,
      });

      const result = await addCandidate(
        electionId,
        {
          name: 'Admin Added Candidate',
          proposal: 'Professional proposal',
          photo_url: 'https://example.com/photo.jpg',
        },
        rhUserId,
        mockSupabase
      );

      expect(result.name).toBe('Admin Added Candidate');
      expect(result.proposal).toBe('Professional proposal');
      expect(result.created_by).toBe(rhUserId);
      expect(result.user_id).toBeUndefined();
    });

    it('should not allow adding candidate to active election', async () => {
      const mockElection = { id: electionId, status: 'active' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        addCandidate(
          electionId,
          { name: 'John Doe' },
          rhUserId,
          mockSupabase
        )
      ).rejects.toThrow('Can only add candidates to draft elections');
    });
  });

  describe('AC5: RH Can Remove Candidates', () => {
    it('should allow RH to remove candidate from draft election', async () => {
      const candidateId = 'cand-1';
      const mockCandidate: Candidate = {
        id: candidateId,
        election_id: electionId,
        name: 'To Remove',
        status: 'approved',
        created_by: userId,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
      };
      const mockElection = { id: electionId, status: 'draft' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCandidate,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      mockSupabase.delete.mockReturnThis();

      await removeCandidate(candidateId, rhUserId, mockSupabase);

      expect(mockSupabase.from).toHaveBeenCalledWith('candidates');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should not allow removing from active election', async () => {
      const candidateId = 'cand-1';
      const mockCandidate: Candidate = {
        id: candidateId,
        election_id: electionId,
        name: 'Cannot Remove',
        status: 'approved',
        created_by: userId,
        created_at: '2026-03-07T10:00:00Z',
        updated_at: '2026-03-07T10:00:00Z',
      };
      const mockElection = { id: electionId, status: 'active' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCandidate,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        removeCandidate(candidateId, rhUserId, mockSupabase)
      ).rejects.toThrow('Can only remove candidates from draft elections');
    });
  });

  describe('AC6: Candidates Isolated by Company', () => {
    it('should list only candidates for election in company', async () => {
      const mockCandidates: Candidate[] = [
        {
          id: 'cand-1',
          election_id: electionId,
          user_id: userId,
          name: 'Candidate 1',
          status: 'approved',
          created_by: userId,
          created_at: '2026-03-07T10:00:00Z',
          updated_at: '2026-03-07T10:00:00Z',
        },
      ];

      mockSupabase.order.mockReturnThis();
      mockSupabase.order.mockResolvedValueOnce({
        data: mockCandidates,
        error: null,
      });

      const result = await listCandidates(electionId, mockSupabase);

      expect(result).toHaveLength(1);
      expect(result[0].election_id).toBe(electionId);
      expect(mockSupabase.from).toHaveBeenCalledWith('candidates');
      expect(mockSupabase.eq).toHaveBeenCalledWith('election_id', electionId);
    });
  });

  describe('Helper Functions', () => {
    it('isUserCandidate should return true if user is candidate', async () => {
      const mockCandidate = { id: 'cand-1', user_id: userId };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCandidate,
        error: null,
      });

      const result = await isUserCandidate(electionId, userId, mockSupabase);

      expect(result).toBe(true);
    });

    it('isUserCandidate should return false if user is not candidate', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const result = await isUserCandidate(electionId, userId, mockSupabase);

      expect(result).toBe(false);
    });

    it('getCandidateCount should return count of candidates', async () => {
      mockSupabase.eq.mockReturnThis();
      mockSupabase.eq.mockResolvedValueOnce({
        data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        count: 3,
        error: null,
      });

      const result = await getCandidateCount(electionId, mockSupabase);

      expect(result).toBe(3);
    });

    it('deregisterAsCandidate should remove user registration before election starts', async () => {
      const mockElection = {
        status: 'draft',
        start_date: '2026-04-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      mockSupabase.delete.mockReturnThis();

      await deregisterAsCandidate(electionId, userId, mockSupabase);

      expect(mockSupabase.from).toHaveBeenCalledWith('candidates');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('deregisterAsCandidate should fail if election already started', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 86400000);
      const mockElection = {
        status: 'active',
        start_date: yesterday.toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockElection,
        error: null,
      });

      await expect(
        deregisterAsCandidate(electionId, userId, mockSupabase)
      ).rejects.toThrow('Cannot deregister after election starts');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing election gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        registerAsCandidate(electionId, userId, { name: 'John' }, mockSupabase)
      ).rejects.toThrow('Election not found');
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(
        getCandidate('cand-invalid', mockSupabase)
      ).rejects.toThrow('Candidate not found');
    });
  });
});
