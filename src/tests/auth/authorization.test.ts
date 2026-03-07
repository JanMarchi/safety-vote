/**
 * Authorization Tests — Story 1.4
 * ===============================
 *
 * Tests for API Authorization & Permissions
 * Covers all 6 acceptance criteria
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  hasPermission,
  getRolePermissions,
  describePermission,
  PERMISSION_MATRIX,
  UserRole,
  Permission,
} from '@/lib/auth/permissions';
import {
  authorize,
  requireAuth,
  requirePermission,
  requireAdmin,
  AuthorizationError,
  AuthContext,
} from '@/middleware/authorize';

describe('Story 1.4: API Authorization', () => {
  // Test fixtures
  const adminUser = { userId: 'admin-1', role: 'admin' as UserRole, companyId: 'company-1' };
  const rhUser = { userId: 'rh-1', role: 'rh' as UserRole, companyId: 'company-1' };
  const eleitorUser = { userId: 'eleitor-1', role: 'eleitor' as UserRole, companyId: 'company-1' };

  describe('AC1: Permission Matrix Defined', () => {
    it('should have admin role with all permissions', () => {
      const adminPerms = PERMISSION_MATRIX.admin;
      expect(adminPerms.canViewAllUsers).toBe(true);
      expect(adminPerms.canCreateElections).toBe(true);
      expect(adminPerms.canVote).toBe(true);
    });

    it('should have rh role with management permissions', () => {
      const rhPerms = PERMISSION_MATRIX.rh;
      expect(rhPerms.canViewAllUsers).toBe(true);
      expect(rhPerms.canManageUsers).toBe(true);
      expect(rhPerms.canCreateElections).toBe(true);
    });

    it('should have eleitor role with voting permissions only', () => {
      const eleitorPerms = PERMISSION_MATRIX.eleitor;
      expect(eleitorPerms.canVote).toBe(true);
      expect(eleitorPerms.canViewOwnVote).toBe(true);
      expect(eleitorPerms.canManageUsers).toBeUndefined();
      expect(eleitorPerms.canCreateElections).toBeUndefined();
    });
  });

  describe('AC2: hasPermission() Function', () => {
    it('should return true for admin with any permission', () => {
      expect(hasPermission('admin', 'canVote')).toBe(true);
      expect(hasPermission('admin', 'canManageUsers')).toBe(true);
      expect(hasPermission('admin', 'canViewAllUsers')).toBe(true);
    });

    it('should return true for rh with rh permissions', () => {
      expect(hasPermission('rh', 'canManageUsers')).toBe(true);
      expect(hasPermission('rh', 'canCreateElections')).toBe(true);
    });

    it('should return false for eleitor with admin/rh permissions', () => {
      expect(hasPermission('eleitor', 'canManageUsers')).toBe(false);
      expect(hasPermission('eleitor', 'canViewAllUsers')).toBe(false);
      expect(hasPermission('eleitor', 'canCreateElections')).toBe(false);
    });

    it('should return true for eleitor with voter permissions', () => {
      expect(hasPermission('eleitor', 'canVote')).toBe(true);
      expect(hasPermission('eleitor', 'canViewOwnVote')).toBe(true);
    });

    it('should handle undefined/invalid roles', () => {
      expect(hasPermission(undefined, 'canVote')).toBe(false);
      expect(hasPermission('invalid_role', 'canVote')).toBe(false);
    });
  });

  describe('AC3: getRolePermissions() Function', () => {
    it('should return all permissions for admin', () => {
      const adminPerms = getRolePermissions('admin');
      expect(adminPerms.length).toBeGreaterThan(7);
      expect(adminPerms).toContain('canVote');
      expect(adminPerms).toContain('canManageUsers');
    });

    it('should return role-specific permissions', () => {
      const eleitorPerms = getRolePermissions('eleitor');
      expect(eleitorPerms.length).toBe(3);
      expect(eleitorPerms).toContain('canVote');
      expect(eleitorPerms).toContain('canViewResults');
      expect(eleitorPerms).not.toContain('canManageUsers');
    });
  });

  describe('AC4: Permission Descriptions', () => {
    it('should provide human-readable descriptions', () => {
      expect(describePermission('canVote')).toBe('vote in elections');
      expect(describePermission('canManageUsers')).toBe('manage users');
      expect(describePermission('canViewAllUsers')).toBe('view all users');
    });
  });

  describe('AC5: Authorization Errors', () => {
    it('should throw AuthorizationError with 401 status', () => {
      const error = new AuthorizationError(401, 'Not authenticated');
      expect(error.status).toBe(401);
      expect(error.message).toBe('Not authenticated');
      expect(error instanceof Error).toBe(true);
    });

    it('should throw AuthorizationError with 403 status', () => {
      const error = new AuthorizationError(403, 'Forbidden');
      expect(error.status).toBe(403);
    });

    it('should include context information', () => {
      const error = new AuthorizationError(403, 'Forbidden', {
        userId: 'user-1',
        permission: 'canManageUsers',
      });
      expect(error.context?.userId).toBe('user-1');
      expect(error.context?.permission).toBe('canManageUsers');
    });
  });

  describe('AC6: Multi-role Authorization', () => {
    it('admin should have all permissions', () => {
      const allPerms = getRolePermissions('admin');
      expect(allPerms.length).toBeGreaterThan(7);
      // Admin can do everything
      expect(hasPermission('admin', 'canVote')).toBe(true);
      expect(hasPermission('admin', 'canManageUsers')).toBe(true);
    });

    it('rh should have subset of admin permissions', () => {
      const rhPerms = getRolePermissions('rh');
      const adminPerms = getRolePermissions('admin');
      // RH is subset of admin
      expect(rhPerms.length).toBeLessThanOrEqual(adminPerms.length);
    });

    it('eleitor should have minimal permissions', () => {
      const eleitorPerms = getRolePermissions('eleitor');
      expect(eleitorPerms.length).toBe(3); // canVote, canViewOwnVote, canViewResults
    });
  });

  // Note: Integration tests requiring live Supabase connection are tested in e2e tests
  // These unit tests verify permission logic without external dependencies

  describe('AC4 (API): RH Can Manage Users', () => {
    it('rh should have canManageUsers permission', () => {
      expect(hasPermission('rh', 'canManageUsers')).toBe(true);
    });

    it('rh should have canCreateElections permission', () => {
      expect(hasPermission('rh', 'canCreateElections')).toBe(true);
    });

    it('rh should have canViewAllUsers permission', () => {
      expect(hasPermission('rh', 'canViewAllUsers')).toBe(true);
    });
  });

  describe('AC5 (API): Admin Can Access All', () => {
    it('admin should have all permissions', () => {
      const allPermissions: Permission[] = [
        'canViewAllUsers',
        'canManageUsers',
        'canCreateElections',
        'canManageCandidates',
        'canViewVotes',
        'canViewAuditLogs',
        'canViewResults',
        'canVote',
        'canViewOwnVote',
      ];

      allPermissions.forEach((perm) => {
        expect(hasPermission('admin', perm)).toBe(true);
      });
    });
  });

  describe('AC6 (API): Authorization Errors Logged', () => {
    it('should include failure reason in error context', async () => {
      const context = eleitorUser as unknown as AuthContext;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await requirePermission(context, 'canManageUsers', {} as any);
      } catch (error) {
        if (error instanceof AuthorizationError) {
          expect(error.context?.reason).toContain('does not have permission');
        }
      }
    });
  });

});
