/**
 * RLS Helper Functions
 * ===================
 *
 * This module provides utility functions for working with Row Level Security (RLS)
 * in the Safety Vote system. These functions help verify company access, check admin
 * status, and validate RLS enforcement.
 *
 * Story: STORY-1.2 (Implement Row Level Security Policies)
 *
 * All database operations should use these helpers to ensure RLS is properly
 * enforced and to provide consistent access control patterns across the application.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { RLSContext } from "./rls-context";

/**
 * Verify that a user has access to a specific company
 *
 * This checks if the user's company matches the target company, or if the
 * user is an admin (admins have access to all companies).
 *
 * @param userContext - User's RLS context
 * @param targetCompanyId - Company ID to verify access to
 * @returns true if user has access to the company
 */
export function verifyCompanyAccess(
  userContext: RLSContext,
  targetCompanyId: string
): boolean {
  // Admin can access any company
  if (userContext.userRole === "admin") {
    return true;
  }

  // Regular users can only access their own company
  return userContext.companyId === targetCompanyId;
}

/**
 * Verify that a user is an admin
 *
 * @param userContext - User's RLS context
 * @returns true if user is an admin
 */
export function verifyAdminAccess(userContext: RLSContext): boolean {
  return userContext.userRole === "admin";
}

/**
 * Verify that a user is HR or admin
 *
 * @param userContext - User's RLS context
 * @returns true if user is HR or admin
 */
export function verifyHROrAdminAccess(userContext: RLSContext): boolean {
  return userContext.userRole === "admin" || userContext.userRole === "rh";
}

/**
 * Build a query filter for company isolation
 *
 * This returns a filter object that can be used with Supabase `.select()` chains
 * to restrict results to the user's company.
 *
 * Example:
 *   const filter = getCompanyFilter(userContext);
 *   const { data } = await client
 *     .from('elections')
 *     .select()
 *     .match(filter)
 *     .order('created_at', { ascending: false });
 *
 * @param userContext - User's RLS context
 * @returns Filter object for company isolation
 */
export function getCompanyFilter(userContext: RLSContext): { company_id: string } {
  return {
    company_id: userContext.companyId,
  };
}

/**
 * Check if RLS is enforced for a table
 *
 * This queries the PostgreSQL system to verify that RLS is enabled for
 * a specific table and that policies are defined.
 *
 * @param client - Supabase client
 * @param tableName - Name of the table to check
 * @returns Object with RLS status information
 */
export async function checkRLSStatus(
  client: SupabaseClient,
  tableName: string
): Promise<{
  isEnabled: boolean;
  policyCount: number;
  policies: string[];
}> {
  try {
    // Query PostgreSQL system tables to check RLS status
    const { data, error } = await client
      .from("pg_policies")
      .select("policyname")
      .eq("tablename", tableName);

    if (error) {
      // pg_policies might not be accessible; fall back to basic check
      console.warn(
        `Could not check RLS status for ${tableName}: ${error.message}`
      );
      return {
        isEnabled: false,
        policyCount: 0,
        policies: [],
      };
    }

    const policies = data?.map((p: { policyname: string }) => p.policyname) || [];

    return {
      isEnabled: policies.length > 0,
      policyCount: policies.length,
      policies,
    };
  } catch (error) {
    console.error(`Error checking RLS status for ${tableName}:`, error);
    return {
      isEnabled: false,
      policyCount: 0,
      policies: [],
    };
  }
}

/**
 * Log RLS access for audit purposes
 *
 * This creates an audit log entry for important operations, especially
 * admin access that might bypass normal RLS restrictions.
 *
 * @param client - Supabase client
 * @param userContext - User's RLS context
 * @param action - Type of action performed
 * @param resourceType - Type of resource accessed (e.g., 'elections', 'users')
 * @param resourceId - ID of the specific resource
 * @param details - Additional details about the action
 */
export async function logRLSAccess(
  client: SupabaseClient,
  userContext: RLSContext,
  action: "read" | "create" | "update" | "delete",
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await client.from("audit_logs").insert({
      user_id: userContext.userId,
      company_id: userContext.companyId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      severity: userContext.userRole === "admin" ? "medium" : "low",
    });
  } catch (error) {
    console.error("Error logging RLS access:", error);
    // Don't throw error; logging should not block operations
  }
}

/**
 * Assert that user has company access (throws if not)
 *
 * Use this in API endpoints to fail-fast if a user doesn't have permission
 * to access a specific company's data.
 *
 * @param userContext - User's RLS context
 * @param targetCompanyId - Company ID to verify access to
 * @param operationName - Name of operation (for error message)
 * @throws Error if user does not have access
 */
export function assertCompanyAccess(
  userContext: RLSContext,
  targetCompanyId: string,
  operationName: string = "operation"
): void {
  if (!verifyCompanyAccess(userContext, targetCompanyId)) {
    throw new Error(
      `Access denied: User (${userContext.userId}) from company ${userContext.companyId} ` +
        `cannot perform ${operationName} on company ${targetCompanyId}`
    );
  }
}

/**
 * Assert that user is an admin (throws if not)
 *
 * Use this in API endpoints that require admin access.
 *
 * @param userContext - User's RLS context
 * @param operationName - Name of operation (for error message)
 * @throws Error if user is not an admin
 */
export function assertAdminAccess(
  userContext: RLSContext,
  operationName: string = "operation"
): void {
  if (!verifyAdminAccess(userContext)) {
    throw new Error(
      `Access denied: User (${userContext.userId}) does not have admin privileges ` +
        `to perform ${operationName}`
    );
  }
}

/**
 * Assert that user is HR or admin (throws if not)
 *
 * Use this in API endpoints that require HR-level or admin access.
 *
 * @param userContext - User's RLS context
 * @param operationName - Name of operation (for error message)
 * @throws Error if user is not HR or admin
 */
export function assertHROrAdminAccess(
  userContext: RLSContext,
  operationName: string = "operation"
): void {
  if (!verifyHROrAdminAccess(userContext)) {
    throw new Error(
      `Access denied: User (${userContext.userId}) does not have HR or admin privileges ` +
        `to perform ${operationName}`
    );
  }
}

/**
 * Get user's accessible companies
 *
 * For regular users, this returns only their own company.
 * For admins, this returns all companies.
 *
 * @param client - Supabase client
 * @param userContext - User's RLS context
 * @returns List of company IDs the user can access
 */
export async function getAccessibleCompanies(
  client: SupabaseClient,
  userContext: RLSContext
): Promise<string[]> {
  if (userContext.userRole === "admin") {
    // Admin can access all companies
    const { data, error } = await client.from("companies").select("id");

    if (error) {
      console.error("Error fetching all companies:", error);
      return [];
    }

    return data?.map((c: { id: string }) => c.id) || [];
  }

  // Regular users can only access their own company
  return [userContext.companyId];
}

/**
 * Type for RLS audit action
 */
export type RLSAuditAction = "read" | "create" | "update" | "delete";

/**
 * Type for audit severity level
 */
export type AuditSeverity = "low" | "medium" | "high" | "critical";

/**
 * Get appropriate severity level for an action and user role
 *
 * Admin operations that bypass RLS should be marked with higher severity
 * for audit purposes.
 *
 * @param userContext - User's RLS context
 * @param action - Action being performed
 * @returns Severity level for audit log
 */
export function getAuditSeverity(
  userContext: RLSContext,
  action: RLSAuditAction
): AuditSeverity {
  if (userContext.userRole === "admin") {
    // Admin operations are higher severity for audit trail
    if (action === "delete") return "high";
    if (action === "update") return "medium";
    return "low";
  }

  // Regular user operations
  if (action === "delete") return "medium";
  if (action === "create") return "low";
  return "low";
}
