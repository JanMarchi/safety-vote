-- ============================================================================
-- Migration: 002_row_level_security.sql
-- Purpose: Implement Row Level Security (RLS) policies for multi-tenant isolation
-- Date: 2026-03-06
-- Story: STORY-1.2 (Implement Row Level Security Policies)
-- ============================================================================
--
-- This migration creates comprehensive RLS policies for the Safety Vote system,
-- ensuring that users can only access data belonging to their company (multi-tenant
-- isolation). RLS enforces data isolation at the database layer, preventing
-- unauthorized cross-tenant access even if application logic has bugs.
--
-- Tables covered:
--   1. companies - Admin-only access (prevent regular users from accessing company data)
--   2. users - Company-level isolation (users see only their company's users)
--   3. elections - Company-level isolation (users see only their company's elections)
--   4. candidates - Via elections → companies (users see only candidates for their elections)
--   5. votes - Via elections → companies (users see only votes for their elections)
--   6. audit_logs - Company-level tracking (users see only their company's logs)
--
-- RLS Policy Pattern:
--   - Regular users see only rows matching their company_id
--   - Admin users with elevated privileges can access all rows
--   - Policies use auth.user_company_id() and is_admin() helper functions
--   - Performance optimized with indexes on company_id columns
--
-- ============================================================================

-- ============================================================================
-- 1. COMPANIES TABLE
-- Description: Admin-only access. Regular users should not be able to query
--              other companies' information. Only admins can access all rows.
-- ============================================================================

-- Policy: Only admins can access companies table
-- Rationale: Companies table is sensitive and should be restricted to admins
--            who need system-wide access for configuration and reporting
CREATE POLICY "companies_admin_only" ON companies
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- 2. USERS TABLE
-- Description: Company-level isolation. Users can see only users from their
--              own company. Admins can see all users.
-- ============================================================================

-- Policy: Users see only their own company's users
-- Rationale: Regular users should only see colleagues from their company
--            This prevents discovery of users from other companies
CREATE POLICY "users_company_isolation" ON users
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));

-- ============================================================================
-- 3. ELECTIONS TABLE
-- Description: Company-level isolation. Users see only elections from their
--              company. Admins can see all elections.
-- Rationale: Elections are created by companies and should only be visible
--            to users within that company. Cross-tenant access would expose
--            confidential election information.
-- ============================================================================

-- Policy: Users see only elections from their company
-- Rationale: Elections table has direct company_id column, so we can filter
--            directly without needing to join to elections table
CREATE POLICY "elections_company_isolation" ON elections
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));

-- ============================================================================
-- 4. CANDIDATES TABLE
-- Description: Company-level isolation via elections. Users can see candidates
--              only for elections in their company. Admins can see all.
-- Rationale: Candidates are associated with elections, so we filter by checking
--            if the election belongs to the user's company.
-- ============================================================================

-- Policy: Users see candidates only for elections in their company
-- Rationale: Uses subquery to check if election belongs to user's company.
--            This provides isolation while allowing users to see all candidates
--            in their company's elections.
CREATE POLICY "candidates_company_isolation" ON candidates
  USING (
    election_id IN (
      SELECT id FROM elections
      WHERE same_company(company_id)
    )
  )
  WITH CHECK (
    election_id IN (
      SELECT id FROM elections
      WHERE same_company(company_id)
    )
  );

-- ============================================================================
-- 5. VOTES TABLE
-- Description: Company-level isolation via elections. Users can see votes
--              only for elections in their company. Admins can see all.
-- Rationale: Votes are associated with elections, so we filter by checking
--            if the election belongs to the user's company. This ensures
--            voting data isolation even though votes table doesn't have
--            direct company_id column.
-- ============================================================================

-- Policy: Users see votes only for elections in their company
-- Rationale: Votes must be isolated by company, but votes table only references
--            elections table, not companies directly. So we use a subquery
--            to check if the election belongs to the user's company.
--            This prevents users from seeing voting patterns of other companies.
CREATE POLICY "votes_company_isolation" ON votes
  USING (
    election_id IN (
      SELECT id FROM elections
      WHERE same_company(company_id)
    )
  )
  WITH CHECK (
    election_id IN (
      SELECT id FROM elections
      WHERE same_company(company_id)
    )
  );

-- ============================================================================
-- 6. AUDIT_LOGS TABLE
-- Description: Company-level tracking. Users see only audit logs for their
--              company's actions. Admins can see all logs.
-- Rationale: Audit logs contain sensitive information about user actions.
--            Users should only see logs related to their company.
--            Admins need to see all logs for security and compliance auditing.
-- ============================================================================

-- Policy: Users see only audit logs for their company
-- Rationale: Audit logs have company_id column directly, so we can filter
--            using the same company isolation pattern. This ensures that
--            security and compliance logs are not exposed to other companies.
CREATE POLICY "audit_logs_company_isolation" ON audit_logs
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));

-- ============================================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Description: Create indexes on company_id and related columns to ensure
--              RLS predicates can use index scans instead of sequential scans.
-- Performance Note: <5% overhead with proper indexing. Without indexes,
--                  RLS can cause significant performance degradation.
-- ============================================================================

-- Index on companies table (admin-only) - helps with admin queries
CREATE INDEX IF NOT EXISTS idx_companies_id ON companies(id);

-- Index on users company_id for RLS filtering
-- Used by: users_company_isolation policy
CREATE INDEX IF NOT EXISTS idx_users_company_isolation ON users(company_id)
  WHERE is_active = true;

-- Index on elections company_id for RLS filtering
-- Used by: elections_company_isolation policy
CREATE INDEX IF NOT EXISTS idx_elections_company_isolation ON elections(company_id)
  WHERE status != 'cancelled';

-- Index on elections for candidates subquery
-- Used by: candidates_company_isolation policy
CREATE INDEX IF NOT EXISTS idx_elections_for_candidates ON elections(id, company_id);

-- Index on elections for votes subquery
-- Used by: votes_company_isolation policy
CREATE INDEX IF NOT EXISTS idx_elections_for_votes ON elections(id, company_id);

-- Index on audit_logs company_id for RLS filtering
-- Used by: audit_logs_company_isolation policy
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_isolation ON audit_logs(company_id)
  WHERE created_at > NOW() - INTERVAL '90 days';

-- Composite index for common query patterns (querying by company and date)
-- Used by: audit_logs_company_isolation with time-range filters
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_created ON audit_logs(company_id, created_at DESC);

-- ============================================================================
-- RLS GRANTS FOR AUTHENTICATION ROLE
-- Description: Ensure authenticated users can access tables with RLS enabled
-- Note: RLS policies are defined above. These grants ensure the authenticated
--       role has permission to perform operations on the tables (policies will
--       then further restrict which rows can be accessed).
-- ============================================================================

-- Grant SELECT (read) permissions on tables for authenticated role
-- This allows authenticated users to query the tables; RLS policies will
-- then restrict which rows they can actually access
GRANT SELECT ON companies TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON elections TO authenticated;
GRANT SELECT ON candidates TO authenticated;
GRANT SELECT ON votes TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Grant INSERT/UPDATE/DELETE on tables where users should be able to modify
-- their own company's data (policies will prevent cross-tenant modification)
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON elections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON candidates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON votes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON audit_logs TO authenticated;

-- ============================================================================
-- TEST VERIFICATION QUERIES
-- Description: These queries can be used to verify RLS is working correctly
-- Note: Uncomment and run after migration is applied to verify policies
-- ============================================================================

/*
-- Verification Query 1: Verify policies are created
-- Expected: Should show all 6 RLS policies created above
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('companies', 'users', 'elections', 'candidates', 'votes', 'audit_logs')
ORDER BY tablename, policyname;

-- Verification Query 2: Verify indexes are created
-- Expected: Should show all indexes created for RLS performance
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('companies', 'users', 'elections', 'candidates', 'votes', 'audit_logs')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verification Query 3: Test isolation (from test script)
-- Set up test context: Company A user
SET request.jwt.claims = '{"user_id": "user-a-id", "role": "eleitor", "sub": "user-a-id"}';
SET search_path = public;

-- Query should return only Company A's elections
SELECT id, company_id, title FROM elections;

-- Clean up
RESET request.jwt.claims;
RESET search_path;
*/

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- 1. RLS is already enabled on all tables by the initial migration
--    (20241201000000_initial_setup.sql). This migration adds the policies.
--
-- 2. Helper functions used in policies are already defined:
--    - auth.user_id() - Gets current user's ID from JWT
--    - auth.user_company_id() - Gets current user's company_id
--    - is_admin() - Returns true if user role is 'admin'
--    - same_company(company_uuid) - Checks if UUID is user's company or admin
--
-- 3. The policies use SECURITY DEFINER functions for performance. These
--    functions execute with the privileges of their owner (postgres role)
--    and can access data even if the user's RLS policies would deny it.
--
-- 4. Performance: With proper indexing, RLS adds <5% overhead to queries.
--    All indexes are created to support the RLS predicates.
--
-- 5. Rollback: To remove all RLS policies, drop policies and disable RLS:
--    DROP POLICY "companies_admin_only" ON companies;
--    DROP POLICY "users_company_isolation" ON users;
--    ... (repeat for all policies)
--    ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
--    ... (repeat for all tables)
--
-- 6. Testing: After applying this migration:
--    - Run test suite to verify RLS enforcement (src/tests/rls/)
--    - Run performance benchmarks to verify <100ms query times
--    - Run security audit to verify no bypass vectors exist
--
-- ============================================================================

-- End of migration: 002_row_level_security.sql
