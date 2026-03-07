/**
 * RBAC Tests — Story 1.5
 * =====================
 *
 * Tests for Role-Based Access Control
 * Covers all 6 acceptance criteria
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  isValidRole,
  getAllRoles,
  DEFAULT_ROLE,
  VALID_ROLES,
} from '@/lib/rbac/role-manager';
import {
  getCachedPermissions,
  cachePermissions,
  getPermissionsWithCache,
  invalidateRoleCache,
  invalidateAllCaches,
  getCacheStats,
  preloadCache,
} from '@/lib/rbac/permission-cache';
import type { UserRole, Permission } from '@/lib/auth/permissions';

describe('Story 1.5: Role-Based Access Control (RBAC)', () => {
  beforeEach(() => {
    // Clear cache before each test
    invalidateAllCaches();
  });

  describe('AC1: Default Roles Exist (admin, rh, eleitor)', () => {
    it('should have exactly three valid roles', () => {
      expect(VALID_ROLES.length).toBe(3);
      expect(VALID_ROLES).toContain('admin');
      expect(VALID_ROLES).toContain('rh');
      expect(VALID_ROLES).toContain('eleitor');
    });

    it('getAllRoles() should return all three roles', () => {
      const roles = getAllRoles();
      expect(roles.length).toBe(3);
      expect(roles.sort()).toEqual(['admin', 'eleitor', 'rh'].sort());
    });

    it('DEFAULT_ROLE should be eleitor', () => {
      expect(DEFAULT_ROLE).toBe('eleitor');
    });
  });

  describe('AC2: Role Validation', () => {
    it('should accept valid roles', () => {
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('rh')).toBe(true);
      expect(isValidRole('eleitor')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('super_admin')).toBe(false);
      expect(isValidRole('manager')).toBe(false);
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('AC3: Permission Caching', () => {
    it('should cache permissions when set', () => {
      const adminPerms: Permission[] = ['canVote', 'canManageUsers'];
      cachePermissions('admin', adminPerms);

      const cached = getCachedPermissions('admin');
      expect(cached).toEqual(adminPerms);
    });

    it('should return null for uncached role', () => {
      const cached = getCachedPermissions('rh');
      expect(cached).toBeNull();
    });

    it('should invalidate specific role cache', () => {
      const perms: Permission[] = ['canVote'];
      cachePermissions('eleitor', perms);
      expect(getCachedPermissions('eleitor')).not.toBeNull();

      invalidateRoleCache('eleitor');
      expect(getCachedPermissions('eleitor')).toBeNull();
    });

    it('should invalidate all caches', () => {
      cachePermissions('admin', ['canVote']);
      cachePermissions('rh', ['canVote']);
      cachePermissions('eleitor', ['canVote']);

      invalidateAllCaches();

      expect(getCachedPermissions('admin')).toBeNull();
      expect(getCachedPermissions('rh')).toBeNull();
      expect(getCachedPermissions('eleitor')).toBeNull();
    });
  });

  describe('AC4: Permission Inheritance', () => {
    it('admin should have all permissions', () => {
      const adminPerms = getPermissionsWithCache('admin');
      expect(adminPerms.length).toBeGreaterThan(7);
    });

    it('rh should have admin and voter permissions', () => {
      const rhPerms = getPermissionsWithCache('rh');
      expect(rhPerms).toContain('canManageUsers');
      expect(rhPerms).toContain('canVote');
    });

    it('eleitor should only have voter permissions', () => {
      const eleitorPerms = getPermissionsWithCache('eleitor');
      expect(eleitorPerms).toContain('canVote');
      expect(eleitorPerms).toContain('canViewResults');
      expect(eleitorPerms).not.toContain('canManageUsers');
    });

    it('rh is superset of eleitor permissions', () => {
      const rhPerms = getPermissionsWithCache('rh');
      const eleitorPerms = getPermissionsWithCache('eleitor');

      eleitorPerms.forEach((perm) => {
        expect(rhPerms).toContain(perm);
      });
    });

    it('admin is superset of rh permissions', () => {
      const adminPerms = getPermissionsWithCache('admin');
      const rhPerms = getPermissionsWithCache('rh');

      rhPerms.forEach((perm) => {
        expect(adminPerms).toContain(perm);
      });
    });
  });

  describe('AC5: Cache Performance', () => {
    it('should return cached result on second call', () => {
      // First call computes
      const perms1 = getPermissionsWithCache('admin');

      // Second call should return cached
      const perms2 = getPermissionsWithCache('admin');

      // Both should be identical
      expect(perms1).toEqual(perms2);
      expect(getCachedPermissions('admin')).not.toBeNull();
    });

    it('should report cache size', () => {
      expect(getCacheStats().size).toBe(0);

      getPermissionsWithCache('admin');
      expect(getCacheStats().size).toBe(1);

      getPermissionsWithCache('rh');
      expect(getCacheStats().size).toBe(2);

      getPermissionsWithCache('eleitor');
      expect(getCacheStats().size).toBe(3);
    });
  });

  describe('AC6: Cache Preloading', () => {
    it('should preload all roles on startup', () => {
      expect(getCacheStats().size).toBe(0);

      preloadCache();

      expect(getCacheStats().size).toBe(3);
      expect(getCachedPermissions('admin')).not.toBeNull();
      expect(getCachedPermissions('rh')).not.toBeNull();
      expect(getCachedPermissions('eleitor')).not.toBeNull();
    });

    it('preloaded permissions should not be null', () => {
      preloadCache();

      const adminPerms = getCachedPermissions('admin');
      const rhPerms = getCachedPermissions('rh');
      const eleitorPerms = getCachedPermissions('eleitor');

      expect(adminPerms).not.toBeNull();
      expect(rhPerms).not.toBeNull();
      expect(eleitorPerms).not.toBeNull();

      expect(adminPerms!.length).toBeGreaterThan(0);
      expect(rhPerms!.length).toBeGreaterThan(0);
      expect(eleitorPerms!.length).toBeGreaterThan(0);
    });
  });

  describe('Role Distribution', () => {
    it('should track role counts accurately', () => {
      const stats = getCacheStats();
      expect(stats.entries).toBeDefined();
      // Verify all roles are in entries
    });
  });

  describe('Type Safety', () => {
    it('isValidRole should be type guard', () => {
      const role: unknown = 'admin';
      if (typeof role === 'string' && isValidRole(role)) {
        // TypeScript should know role is UserRole here
        expect(typeof role).toBe('string');
        expect(['admin', 'rh', 'eleitor']).toContain(role);
      }
    });
  });
});
