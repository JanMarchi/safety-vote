# Row Level Security (RLS) — Setup & Configuration Guide

## Overview

This guide explains how to set up Row Level Security (RLS) in the Safety Vote system, run tests locally, and configure the required environment variables.

Row Level Security is a PostgreSQL feature that enforces data access policies at the database layer, ensuring multi-tenant isolation. Users can only access data belonging to their company, regardless of application logic.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ with Supabase extension
- Docker (recommended for local Supabase setup)
- npm or yarn package manager

## Local Setup with Supabase (Docker)

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI (macOS/Linux)
brew install supabase/tap/supabase

# On Windows, use npm
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Start local Supabase instance (runs in Docker)
supabase start

# This will output connection details:
# - Database URL: postgresql://postgres:postgres@localhost:54322/postgres
# - API URL: http://localhost:54323
# - JWT Secret: (auto-generated)
```

### Option 2: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: safety_vote
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
psql -U postgres -h localhost -d safety_vote
```

## Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Local (for development)
SUPABASE_URL=http://localhost:54323
SUPABASE_ANON_KEY=<generated-by-supabase-cli>
SUPABASE_SERVICE_ROLE_KEY=<generated-by-supabase-cli>
SUPABASE_JWT_SECRET=<generated-by-supabase-cli>

# Database Direct Connection (for tests)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# For Production (do NOT commit to git)
# SUPABASE_URL=https://<project>.supabase.co
# SUPABASE_ANON_KEY=<production-key>
# SUPABASE_SERVICE_ROLE_KEY=<production-key>
```

### Obtaining Keys from Supabase CLI

After running `supabase start`:

```bash
# Display Supabase project details (including keys and URLs)
supabase status

# Save keys to environment file
supabase status > .env.local
```

## Migration & Schema Setup

### 1. Apply Migrations to Local Database

```bash
# Using Supabase CLI
supabase db push

# Or manually with psql
psql -U postgres -h localhost -d safety_vote \
  < supabase/migrations/20241201000000_initial_setup.sql \
  < supabase/migrations/002_row_level_security.sql \
  < supabase/migrations/003_user_sessions_table.sql
```

### 2. Verify RLS is Enabled

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should see:
-- companies          | t
-- users              | t
-- elections          | t
-- candidates         | t
-- votes              | t
-- audit_logs         | t
-- auth_tokens        | t
-- user_sessions      | t
```

### 3. Verify Policies are Created

```sql
-- Show all policies for each table
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Running Tests Locally

### 1. Install Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supabase  # If not already installed
```

### 2. Configure Jest

Ensure `jest.config.js` exists and includes:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
};
```

### 3. Create Test Setup File

Create `src/tests/setup.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for tests
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54323';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'test-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Mock JWT context for RLS testing
export const setTestUserContext = (userId: string, companyId: string, role: string) => {
  // This would be set via auth token in real environment
  // For tests, we mock the request.jwt.claims context
  process.env.TEST_USER_ID = userId;
  process.env.TEST_COMPANY_ID = companyId;
  process.env.TEST_USER_ROLE = role;
};

// Reset test context
export const clearTestContext = () => {
  delete process.env.TEST_USER_ID;
  delete process.env.TEST_COMPANY_ID;
  delete process.env.TEST_USER_ROLE;
};
```

### 4. Run RLS Tests

```bash
# Run all RLS tests
npm test -- src/tests/rls

# Run specific test file
npm test -- src/tests/rls/rls-isolation.test.ts

# Run with coverage
npm test -- --coverage src/tests/rls

# Run in watch mode (for development)
npm test -- --watch src/tests/rls
```

### 5. Test Output

Expected output:

```
PASS  src/tests/rls/rls-isolation.test.ts
  RLS Isolation
    ✓ User from Company A can only see Company A data (45ms)
    ✓ User from Company B cannot see Company A data (23ms)
    ✓ Admin can see data from all companies (18ms)
    ✓ Cross-tenant vote access is blocked (29ms)

Tests:       4 passed, 4 total
Time:        2.345 s
```

## JWT Context for Local Testing

### Understanding JWT Claims in RLS

RLS policies use `request.jwt.claims` to extract user information:

```sql
-- RLS functions use JWT claims
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'user_id',
    current_setting('request.jwt.claims', true)::json->>'sub'
  )::UUID;
$$ LANGUAGE SQL STABLE;
```

### Mocking JWT for Tests

For tests to work without a live Supabase instance, mock the JWT context:

```typescript
// Example test setup
describe('RLS Isolation', () => {
  beforeEach(async () => {
    // Create test user with company context
    const testUser = {
      id: '00000000-0000-0000-0000-000000000002',
      company_id: '00000000-0000-0000-0000-000000000001',
      role: 'eleitor'
    };

    // Mock the JWT context (implementation depends on test framework)
    setTestUserContext(
      testUser.id,
      testUser.company_id,
      testUser.role
    );
  });

  afterEach(clearTestContext);

  test('User can only see their company elections', async () => {
    // Test RLS policy
  });
});
```

## Troubleshooting

### Problem: "permission denied for schema public"

**Solution:** Check that migrations have been applied and auth role has GRANT permissions.

```sql
-- Verify grants
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
AND table_name = 'elections'
AND grantee = 'authenticated';
```

### Problem: "policy does not exist" error

**Solution:** Ensure migrations were applied in correct order:

```bash
supabase db reset  # Resets to initial state
supabase db push   # Reapplies all migrations
```

### Problem: "JWT claims not found" in tests

**Solution:** Set up proper JWT mocking in test setup:

```typescript
// Ensure process.env vars are set for test JWT context
process.env.SUPABASE_JWT_SECRET = 'test-secret-key';
```

### Problem: Tests fail locally but pass in CI

**Solution:** Verify environment variables match CI environment:

```bash
# Check local env
env | grep SUPABASE

# Compare with CI (.github/workflows/*.yml)
```

## Performance Verification

To verify RLS performance is acceptable:

```bash
npm test -- src/tests/rls/rls-performance.test.ts

# Expected: All queries < 100ms with RLS enabled
```

## Production Deployment

For production deployment:

1. **Use Supabase managed service:** No additional setup needed, RLS is handled server-side
2. **Set environment variables** in your deployment platform
3. **Run migrations** in production database
4. **Verify policies** with production data

```bash
# Deploy to Supabase
supabase link --project-ref <your-project-id>
supabase push
```

## Related Documentation

- [RLS Policies Reference](./RLS-POLICIES.md) — Complete list of all active policies
- [Story 1.2 Implementation](./stories/epic-1-authentication/1.2-row-level-security.md)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2026-03-07
