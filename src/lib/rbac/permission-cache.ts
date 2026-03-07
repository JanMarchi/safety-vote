/**
 * Permission Cache — RBAC Permission Caching
 * ==========================================
 *
 * Caches role→permission mappings for performance.
 * 5-minute TTL or immediate invalidation on role change.
 *
 * Story 1.5: Role-Based Access Control (RBAC)
 */

import { UserRole } from '@/lib/auth/permissions';
import { Permission, PERMISSION_MATRIX } from '@/lib/auth/permissions';

interface CacheEntry {
  permissions: Permission[];
  timestamp: number;
}

/**
 * In-memory permission cache
 * (In production, use Redis for distributed cache)
 */
const permissionCache = new Map<string, CacheEntry>();

/**
 * Cache TTL: 5 minutes
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Get cached permissions for a role
 */
export function getCachedPermissions(role: UserRole): Permission[] | null {
  const entry = permissionCache.get(role);

  if (!entry) {
    return null;
  }

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL_MS) {
    // Cache expired
    permissionCache.delete(role);
    return null;
  }

  return entry.permissions;
}

/**
 * Cache permissions for a role
 */
export function cachePermissions(role: UserRole, permissions: Permission[]): void {
  permissionCache.set(role, {
    permissions,
    timestamp: Date.now(),
  });
}

/**
 * Get permissions with caching
 * Returns cached if available, else computes and caches
 */
export function getPermissionsWithCache(role: UserRole): Permission[] {
  // Check cache
  const cached = getCachedPermissions(role);
  if (cached) {
    return cached;
  }

  // Compute from matrix
  const permissions = Object.entries(PERMISSION_MATRIX[role] || {})
    .filter(([, hasPermission]) => hasPermission)
    .map(([permission]) => permission as Permission);

  // Cache result
  cachePermissions(role, permissions);

  return permissions;
}

/**
 * Invalidate cache for a specific role
 * Called when role permissions change
 */
export function invalidateRoleCache(role: UserRole): void {
  permissionCache.delete(role);
}

/**
 * Invalidate all permission caches
 * Use when permission matrix changes
 */
export function invalidateAllCaches(): void {
  permissionCache.clear();
}

/**
 * Get cache stats (for monitoring)
 */
export function getCacheStats(): {
  size: number;
  entries: string[];
} {
  return {
    size: permissionCache.size,
    entries: Array.from(permissionCache.keys()),
  };
}

/**
 * Preload cache on startup
 * Ensures all roles are cached at application start
 */
export function preloadCache(): void {
  const roles: UserRole[] = ['admin', 'rh', 'eleitor'];
  roles.forEach((role) => {
    getPermissionsWithCache(role);
  });
}
