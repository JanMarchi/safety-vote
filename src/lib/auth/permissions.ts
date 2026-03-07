/**
 * Permission Matrix — RBAC Permission Definitions
 * ===============================================
 *
 * Defines which roles have which permissions.
 * Story 1.4: API Authorization & Permissions
 */

export type UserRole = 'admin' | 'rh' | 'eleitor';

export type Permission =
  | 'canViewAllUsers'
  | 'canManageUsers'
  | 'canCreateElections'
  | 'canManageCandidates'
  | 'canViewVotes'
  | 'canViewAuditLogs'
  | 'canViewResults'
  | 'canVote'
  | 'canViewOwnVote';

/**
 * Permission matrix: role → permissions
 */
export const PERMISSION_MATRIX: Record<UserRole, Partial<Record<Permission, boolean>>> = {
  admin: {
    // Admin has all permissions
    canViewAllUsers: true,
    canManageUsers: true,
    canCreateElections: true,
    canManageCandidates: true,
    canViewVotes: true,
    canViewAuditLogs: true,
    canViewResults: true,
    canVote: true,
    canViewOwnVote: true,
  },

  rh: {
    // HR can manage users and elections, view results
    canViewAllUsers: true,
    canManageUsers: true,
    canCreateElections: true,
    canManageCandidates: true,
    canViewVotes: true,
    canViewAuditLogs: true,
    canViewResults: true,
    canVote: true,
    canViewOwnVote: true,
  },

  eleitor: {
    // Regular voter: can only vote and view results
    canVote: true,
    canViewOwnVote: true,
    canViewResults: true,
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role || !PERMISSION_MATRIX[role as UserRole]) {
    return false;
  }

  const permissions = PERMISSION_MATRIX[role as UserRole];
  return permissions[permission] ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const permissions = PERMISSION_MATRIX[role];
  return Object.entries(permissions)
    .filter(([, hasPermission]) => hasPermission)
    .map(([permission]) => permission as Permission);
}

/**
 * Permission description for error messages
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  canViewAllUsers: 'view all users',
  canManageUsers: 'manage users',
  canCreateElections: 'create elections',
  canManageCandidates: 'manage candidates',
  canViewVotes: 'view all votes',
  canViewAuditLogs: 'view audit logs',
  canViewResults: 'view election results',
  canVote: 'vote in elections',
  canViewOwnVote: 'view own vote',
};

/**
 * Get human-readable description of a permission
 */
export function describePermission(permission: Permission): string {
  return PERMISSION_DESCRIPTIONS[permission] || permission;
}
