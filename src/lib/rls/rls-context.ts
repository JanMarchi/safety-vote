/**
 * RLS Context Management
 * =====================
 *
 * This module handles setting and managing Row Level Security (RLS) context
 * for PostgreSQL queries. RLS context is provided via JWT claims in the request
 * headers, which PostgreSQL reads to enforce row-level access control.
 *
 * Story: STORY-1.2 (Implement Row Level Security Policies)
 *
 * The RLS system depends on the PostgreSQL server being able to read the
 * current user's JWT claims to determine:
 * 1. Current user ID (for identifying the user)
 * 2. User's company ID (for company-level isolation)
 * 3. User's role (for admin bypass logic)
 *
 * These are provided automatically by Supabase through the Authorization header.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * User roles for RLS context
 */
export type UserRole = "admin" | "rh" | "eleitor";

/**
 * RLS Context interface
 * Represents the security context for a user's session
 */
export interface RLSContext {
  userId: string;
  companyId: string;
  userRole: UserRole;
  email: string;
}

/**
 * Get RLS context from a Supabase user object and their session
 *
 * This extracts the necessary information from the user object to set up
 * RLS context for subsequent database queries. The JWT claims embedded in
 * the session token will be read by PostgreSQL RLS policies.
 *
 * @param user - Supabase user object with metadata
 * @returns RLS context for the user
 * @throws Error if user or required fields are missing
 */
export function extractRLSContext(user: User): RLSContext {
  if (!user?.id) {
    throw new Error("User ID is required for RLS context");
  }

  const metadata = (user.user_metadata || {}) as Record<string, unknown>;
  const companyId = metadata.company_id as string;
  const userRole = (metadata.role || "eleitor") as UserRole;

  if (!companyId) {
    throw new Error("Company ID is required in user metadata for RLS context");
  }

  return {
    userId: user.id,
    companyId,
    userRole,
    email: user.email || "",
  };
}

/**
 * Verify that RLS context has been set up correctly
 *
 * This can be called after authentication to ensure the RLS context
 * is properly configured before executing queries.
 *
 * @param context - RLS context to verify
 * @throws Error if context is invalid
 */
export function validateRLSContext(context: RLSContext): void {
  if (!context.userId) {
    throw new Error("RLS context: User ID is required");
  }

  if (!context.companyId) {
    throw new Error("RLS context: Company ID is required");
  }

  if (!context.userRole || !["admin", "rh", "eleitor"].includes(context.userRole)) {
    throw new Error(`RLS context: Invalid user role '${context.userRole}'`);
  }

  // Validate UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(context.userId)) {
    throw new Error("RLS context: User ID must be a valid UUID");
  }

  if (!uuidRegex.test(context.companyId)) {
    throw new Error("RLS context: Company ID must be a valid UUID");
  }
}

/**
 * Check if user is an admin based on their role
 *
 * @param context - RLS context
 * @returns true if user is admin
 */
export function isAdmin(context: RLSContext): boolean {
  return context.userRole === "admin";
}

/**
 * Check if user is HR or admin
 *
 * @param context - RLS context
 * @returns true if user is HR or admin
 */
export function isHROrAdmin(context: RLSContext): boolean {
  return context.userRole === "admin" || context.userRole === "rh";
}

/**
 * Format RLS context for logging/debugging
 *
 * @param context - RLS context
 * @returns Formatted string for logging
 */
export function formatRLSContext(context: RLSContext): string {
  return `RLS[user=${context.userId}, company=${context.companyId}, role=${context.userRole}]`;
}

/**
 * Type guard to check if a user role is valid
 *
 * @param role - Role to check
 * @returns true if role is a valid UserRole
 */
export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && ["admin", "rh", "eleitor"].includes(role);
}
