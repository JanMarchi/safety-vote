# Row Level Security (RLS) — Complete Policy Reference

## Overview

This document lists all active Row Level Security policies in the Safety Vote system. Each policy enforces data isolation rules at the database layer.

**Total Policies:** 13 (6 company-isolated tables + auth_tokens/user_sessions)

## Policy Naming Convention

- **`{table}_{action}_policy`** — Company-isolated tables use standard naming
- **`{table}_{scope}_{action}`** — Auth-related tables use scope-based naming

## Active Policies by Table

### 1. COMPANIES Table

**RLS Enabled:** Yes
**Isolation Type:** Admin-only access
**Purpose:** Prevent non-admin users from accessing company records

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `companies_admin_only` | SELECT, INSERT, UPDATE, DELETE | `is_admin()` | Only admins can view/modify any company record |

**SQL:**
```sql
CREATE POLICY "companies_admin_only" ON companies
  USING (is_admin())
  WITH CHECK (is_admin());
```

**Intent:**
Companies table is sensitive organizational data. Regular users should never query the companies table, even their own company. Only system admins need company-wide access for configuration and reporting.

---

### 2. USERS Table

**RLS Enabled:** Yes
**Isolation Type:** Company-level (regular users) + Admin bypass
**Purpose:** Users see only colleagues from their company; admins see all

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `users_company_isolation` | SELECT, INSERT, UPDATE, DELETE | `same_company(company_id) OR is_admin()` | Users see company members; admins see all |

**SQL:**
```sql
CREATE POLICY "users_company_isolation" ON users
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));
```

**Intent:**
Users should only see colleagues (users with the same company_id) to prevent discovery of users from other companies. RH and admin roles can manage users within their authority (enforced by application logic combined with this RLS policy).

---

### 3. ELECTIONS Table

**RLS Enabled:** Yes
**Isolation Type:** Company-level
**Purpose:** Users see only voting events from their company

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `elections_company_isolation` | SELECT, INSERT, UPDATE, DELETE | `same_company(company_id) OR is_admin()` | Users see company elections; admins see all |

**SQL:**
```sql
CREATE POLICY "elections_company_isolation" ON elections
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));
```

**Intent:**
Elections are created per-company and contain sensitive organizational data (voting schedules, candidates, results). Users should only access elections belonging to their company. This prevents cross-tenant election discovery and manipulation.

---

### 4. CANDIDATES Table

**RLS Enabled:** Yes
**Isolation Type:** Company-level (via election foreign key)
**Purpose:** Users see candidates only for elections in their company

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `candidates_company_isolation` | SELECT, INSERT, UPDATE, DELETE | Subquery: `election_id IN (SELECT id FROM elections WHERE same_company(company_id))` | Users see candidates for company elections only |

**SQL:**
```sql
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
```

**Intent:**
Candidates are associated with elections, not companies directly. The policy uses a subquery to join elections and check company membership. This ensures users can only see/register candidates for elections in their company.

---

### 5. VOTES Table

**RLS Enabled:** Yes
**Isolation Type:** Company-level (via election foreign key)
**Purpose:** Users see votes only for elections in their company

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `votes_company_isolation` | SELECT, INSERT, UPDATE, DELETE | Subquery: `election_id IN (SELECT id FROM elections WHERE same_company(company_id))` | Users see votes for company elections only |

**SQL:**
```sql
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
```

**Intent:**
Voting data is the most sensitive. The policy ensures users cannot see or submit votes for elections outside their company. Even if a voter_id exists, they can only vote in elections belonging to their company. This is critical for audit trail isolation.

---

### 6. AUDIT_LOGS Table

**RLS Enabled:** Yes
**Isolation Type:** Company-level
**Purpose:** Users see only audit logs for their company's actions

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `audit_logs_company_isolation` | SELECT, INSERT, UPDATE, DELETE | `same_company(company_id) OR is_admin()` | Users see company logs; admins see all |

**SQL:**
```sql
CREATE POLICY "audit_logs_company_isolation" ON audit_logs
  USING (same_company(company_id))
  WITH CHECK (same_company(company_id));
```

**Intent:**
Audit logs contain sensitive information about user actions (logins, votes, configuration changes). Users should only access logs for their company. This ensures security and compliance audits are not exposed cross-tenant, and each company's activity history is isolated.

---

### 7. AUTH_TOKENS Table

**RLS Enabled:** Yes
**Isolation Type:** User-specific (NOT company-based)
**Purpose:** Users see/manage only their own authentication tokens

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `Users can view their own auth tokens` | SELECT | `user_id = auth.user_id()` | User can view their tokens |
| `Users can create their own auth tokens` | INSERT | `user_id = auth.user_id()` | User can create tokens for themselves |
| `Users can update their own auth tokens` | UPDATE | `user_id = auth.user_id()` | User can update their tokens |
| `Admins can manage all auth tokens` | SELECT, INSERT, UPDATE, DELETE | `is_admin()` | Admins can view/manage all tokens |

**SQL:**
```sql
-- Users can view their own tokens
CREATE POLICY "Users can view their own auth tokens" ON auth_tokens
  FOR SELECT USING (user_id = auth.user_id());

-- Users can create tokens for themselves (for magic links)
CREATE POLICY "Users can create their own auth tokens" ON auth_tokens
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Users can update their tokens
CREATE POLICY "Users can update their own auth tokens" ON auth_tokens
  FOR UPDATE USING (user_id = auth.user_id());

-- Admins can manage all tokens
CREATE POLICY "Admins can manage all auth tokens" ON auth_tokens
  FOR ALL USING (is_admin());
```

**Intent:**
Auth tokens are user-specific, not company-specific. Each user's magic link tokens should be accessible only to that user (and admins). This prevents users from intercepting other users' authentication tokens across company boundaries.

---

### 8. USER_SESSIONS Table

**RLS Enabled:** Yes
**Isolation Type:** User-specific (NOT company-based)
**Purpose:** Users see/manage only their own session records

| Policy Name | Type | Condition | Purpose |
|------------|------|-----------|---------|
| `Users can view their own sessions` | SELECT | `user_id = auth.user_id()` | User can view their sessions |
| `Users can create their own sessions` | INSERT | `user_id = auth.user_id()` | User can create sessions for themselves |
| `Users can update their own sessions` | UPDATE | `user_id = auth.user_id()` | User can update their sessions |
| `Users can delete their own sessions` | DELETE | `user_id = auth.user_id()` | User can delete (log out) their sessions |
| `Admins can manage all sessions` | SELECT, INSERT, UPDATE, DELETE | `is_admin()` | Admins can manage all sessions |

**SQL:**
```sql
-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.user_id());

-- Users can create sessions for themselves
CREATE POLICY "Users can create their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.user_id());

-- Users can update their sessions (extend expiry, etc.)
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (user_id = auth.user_id());

-- Users can delete their sessions (logout)
CREATE POLICY "Users can delete their own sessions" ON user_sessions
  FOR DELETE USING (user_id = auth.user_id());

-- Admins can manage all sessions (force logout, etc.)
CREATE POLICY "Admins can manage all sessions" ON user_sessions
  FOR ALL USING (is_admin());
```

**Intent:**
User sessions are user-specific, not company-specific. Each user can only access/modify their own sessions. This prevents users from viewing or terminating other users' sessions, even within the same company.

---

## Helper Functions Used in Policies

All policies rely on these helper functions defined in migrations:

### `auth.user_id()` → UUID
**Purpose:** Extract current user's ID from JWT
**Availability:** All requests with valid JWT
**Security:** Fails safely (returns NULL) if no JWT

```sql
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'user_id',
    current_setting('request.jwt.claims', true)::json->>'sub'
  )::UUID;
$$ LANGUAGE SQL STABLE;
```

### `auth.user_company_id()` → UUID
**Purpose:** Extract current user's company_id from users table
**Availability:** Requires valid user_id
**Security:** SECURITY DEFINER (executes as postgres role)

```sql
CREATE OR REPLACE FUNCTION auth.user_company_id() RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

### `is_admin()` → BOOLEAN
**Purpose:** Check if current user has 'admin' role
**Availability:** All requests
**Returns:** true only if role = 'admin'

```sql
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'admin';
$$ LANGUAGE SQL STABLE;
```

### `same_company(UUID)` → BOOLEAN
**Purpose:** Check if UUID belongs to user's company OR user is admin
**Availability:** All requests
**Logic:** `company_id = auth.user_company_id() OR is_admin()`

```sql
CREATE OR REPLACE FUNCTION same_company(company_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT company_uuid = auth.user_company_id() OR is_admin();
$$ LANGUAGE SQL STABLE;
```

---

## Policy Execution Flow Example

### Scenario: User queries elections from their company

**User Context:**
- `user_id`: `12345678-1234-1234-1234-123456789012`
- `company_id`: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- `role`: `eleitor`

**Query:**
```sql
SELECT * FROM elections WHERE company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
```

**RLS Policy Execution:**
1. PostgreSQL checks `elections_company_isolation` policy
2. Evaluates: `same_company(company_id)`
3. Function checks: `company_id = auth.user_company_id() OR is_admin()`
4. Returns: TRUE (user's company_id matches)
5. **Result:** Rows are returned ✓

### Scenario: User attempts to query elections from another company

**User Context:** (Same as above)

**Query:**
```sql
SELECT * FROM elections WHERE company_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
```

**RLS Policy Execution:**
1. PostgreSQL checks `elections_company_isolation` policy
2. Evaluates: `same_company('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')`
3. Function checks: `'bbbbbbbb-...' = auth.user_company_id() OR is_admin()`
4. Returns: FALSE (different company, not admin)
5. **Result:** No rows returned / access denied ✓

---

## Performance Optimization

Each policy uses indexed columns to avoid sequential scans:

| Table | Index | Purpose |
|-------|-------|---------|
| users | `idx_users_company_isolation` | Filters by company_id for policy evaluation |
| elections | `idx_elections_company_isolation` | Filters by company_id for policy evaluation |
| elections | `idx_elections_for_candidates` | Subquery optimization in candidates policy |
| elections | `idx_elections_for_votes` | Subquery optimization in votes policy |
| audit_logs | `idx_audit_logs_company_isolation` | Filters by company_id for policy evaluation |
| audit_logs | `idx_audit_logs_company_created` | Composite index for time-range queries |

**Performance Impact:** < 5% overhead with proper indexing (verified by `rls-performance.test.ts`)

---

## Verification Queries

### List all active policies
```sql
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check if RLS is enabled on table
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('companies', 'users', 'elections', 'candidates', 'votes', 'audit_logs', 'auth_tokens', 'user_sessions');
```

### Verify grants for authenticated role
```sql
SELECT table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated'
AND table_schema = 'public'
ORDER BY table_name, privilege_type;
```

---

## Policy Changes & History

| Migration | Change | Reason |
|-----------|--------|--------|
| `20241201000000_initial_setup.sql` | Initial RLS policies created (28 policies, granular) | Foundation setup |
| `002_row_level_security.sql` | Simplified to 13 policies, unified company model | Reduce complexity, prevent ambiguous access |
| `003_user_sessions_table.sql` | Added user_sessions table with 5 new policies | Session management for Story 1.3 |

---

## Related Documentation

- [RLS Setup Guide](./RLS-SETUP.md) — How to configure RLS locally and run tests
- [Story 1.2 Implementation](./stories/epic-1-authentication/1.2-row-level-security.md) — Full development details
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — Official documentation

---

**Last Updated:** 2026-03-07
**Policies Count:** 13
**Coverage:** 8 tables (6 company-isolated + 2 user-specific)
