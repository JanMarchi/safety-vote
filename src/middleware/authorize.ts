/**
 * Authorization Middleware
 * =======================
 *
 * Enforces role-based permissions on API endpoints.
 * Checks:
 * 1. User is authenticated (session valid)
 * 2. User's role has required permission
 * 3. Logs all authorization failures
 *
 * Story 1.4: API Authorization & Permissions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { hasPermission, Permission, describePermission, UserRole } from '@/lib/auth/permissions';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: UserRole;
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
    public context?: {
      userId?: string;
      permission?: string;
      reason?: string;
    }
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Check if user is authenticated
 * Returns 401 if not authenticated
 */
export async function requireAuth(
  userId: string | undefined,
  companyId: string | undefined,
  supabase: SupabaseClient
): Promise<AuthContext> {
  if (!userId || !companyId) {
    throw new AuthorizationError(401, 'Missing or invalid session');
  }

  // Verify user exists and get role
  const { data: user, error } = await supabase
    .from('users')
    .select('id, role, company_id')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new AuthorizationError(401, 'User not found or session expired');
  }

  // Verify user belongs to company (multi-tenant isolation)
  if (user.company_id !== companyId) {
    throw new AuthorizationError(403, 'Access denied: company mismatch');
  }

  return {
    userId: user.id,
    companyId: user.company_id,
    role: user.role as UserRole,
  };
}

/**
 * Check if user has required permission
 * Returns 403 if permission denied
 * Logs failure to audit_logs table
 */
export async function requirePermission(
  context: AuthContext,
  permission: Permission,
  supabase: SupabaseClient
): Promise<void> {
  if (!hasPermission(context.role, permission)) {
    // Log authorization failure (async, non-blocking)
    // Note: not awaiting, audit logging shouldn't block authorization
    supabase.from('audit_logs').insert({
      user_id: context.userId,
      company_id: context.companyId,
      action: 'authorization_failed',
      resource_type: 'api',
      details: {
        permission,
        userRole: context.role,
      },
      severity: 'medium',
    });  // Fire and forget

    const permissionDesc = describePermission(permission);
    throw new AuthorizationError(403, `Insufficient permissions to ${permissionDesc}`, {
      userId: context.userId,
      permission,
      reason: `Role '${context.role}' does not have permission '${permission}'`,
    });
  }
}

/**
 * Authorize user for a specific action
 * Combines authentication check + permission check
 *
 * Usage in API route:
 * ```typescript
 * const context = await authorize(userId, companyId, 'canCreateElections', supabase);
 * ```
 */
export async function authorize(
  userId: string | undefined,
  companyId: string | undefined,
  permission: Permission,
  supabase: SupabaseClient
): Promise<AuthContext> {
  const context = await requireAuth(userId, companyId, supabase);
  await requirePermission(context, permission, supabase);
  return context;
}

/**
 * Verify user is admin (for admin-only operations)
 */
export async function requireAdmin(
  context: AuthContext,
  supabase: SupabaseClient
): Promise<void> {
  if (context.role !== 'admin') {
    // Log admin access denial (async, non-blocking)
    // Note: not awaiting, audit logging shouldn't block authorization
    supabase.from('audit_logs').insert({
      user_id: context.userId,
      company_id: context.companyId,
      action: 'admin_access_denied',
      resource_type: 'api',
      details: { userRole: context.role },
      severity: 'high',
    });  // Fire and forget

    throw new AuthorizationError(403, 'Admin access required', {
      userId: context.userId,
      reason: `User has role '${context.role}', admin role required`,
    });
  }
}

/**
 * Handle authorization errors in API response
 */
export function handleAuthError(error: unknown, res: any) {
  if (error instanceof AuthorizationError) {
    return res.status(error.status).json({
      error: error.message,
      status: error.status,
    });
  }

  // Other errors
  console.error('Unexpected authorization error:', error);
  return res.status(500).json({
    error: 'Internal server error',
    status: 500,
  });
}
