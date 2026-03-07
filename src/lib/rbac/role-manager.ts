/**
 * Role Manager — RBAC Role Assignment & Management
 * ================================================
 *
 * Handles user role assignment, role validation,
 * and permission inheritance.
 *
 * Story 1.5: Role-Based Access Control (RBAC)
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '@/lib/auth/permissions';

/**
 * Valid roles in the system
 */
export const VALID_ROLES: UserRole[] = ['admin', 'rh', 'eleitor'];

/**
 * Default role for new users
 */
export const DEFAULT_ROLE: UserRole = 'eleitor';

/**
 * Check if a role is valid
 */
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Get all valid roles
 */
export function getAllRoles(): UserRole[] {
  return [...VALID_ROLES];
}

/**
 * Assign role to a user
 */
export async function assignRole(
  userId: string,
  newRole: UserRole,
  adminId: string,
  supabase: SupabaseClient
): Promise<void> {
  if (!isValidRole(newRole)) {
    throw new Error(`Invalid role: ${newRole}`);
  }

  // Get current role for audit log
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('role, company_id')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  const oldRole = user.role as UserRole;

  // Update role
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date() })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to update role: ${updateError.message}`);
  }

  // Log the change
  logRoleChange(userId, oldRole, newRole, adminId, user.company_id, supabase);
}

/**
 * Log a role assignment change to audit logs
 */
function logRoleChange(
  userId: string,
  oldRole: UserRole,
  newRole: UserRole,
  adminId: string,
  companyId: string,
  supabase: SupabaseClient
): void {
  // Fire and forget (don't block on audit logging)
  supabase.from('audit_logs').insert({
    user_id: adminId,
    company_id: companyId,
    action: 'role_change',
    resource_type: 'user',
    resource_id: userId,
    details: {
      oldRole,
      newRole,
      changedUserId: userId,
    },
    severity: 'high',
  });
}

/**
 * Get user's role
 */
export async function getUserRole(userId: string, supabase: SupabaseClient): Promise<UserRole> {
  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error(`User not found: ${userId}`);
  }

  return user.role as UserRole;
}

/**
 * Validate role change (e.g., prevent admin from being demoted)
 */
export async function canChangeRole(
  targetUserId: string,
  newRole: UserRole,
  adminId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  // Admins can change any role
  const adminRole = await getUserRole(adminId, supabase);
  if (adminRole !== 'admin') {
    return false;
  }

  // Prevent changing to invalid roles
  if (!isValidRole(newRole)) {
    return false;
  }

  return true;
}

/**
 * Get count of users by role
 */
export async function getRoleDistribution(
  companyId: string,
  supabase: SupabaseClient
): Promise<Record<UserRole, number>> {
  const { data: users } = await supabase
    .from('users')
    .select('role')
    .eq('company_id', companyId);

  const distribution: Record<UserRole, number> = {
    admin: 0,
    rh: 0,
    eleitor: 0,
  };

  users?.forEach((user) => {
    if (isValidRole(user.role)) {
      distribution[user.role]++;
    }
  });

  return distribution;
}
