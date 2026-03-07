/**
 * RLS Isolation Tests — Mocked Version (No Supabase Required)
 * ===========================================================
 *
 * These tests verify RLS policies using in-memory mocks instead of
 * live Supabase connection. Tests run in isolation without external deps.
 *
 * Story: STORY-1.2 (Implement Row Level Security Policies)
 *
 * Migration: 002_row_level_security.sql
 *
 * Tests cover:
 * - User A cannot see User B's data (different companies)
 * - User A cannot see User B's elections
 * - RLS transparent denial (no error, just no rows)
 * - Admin bypass works correctly
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createMockSupabaseClient,
  seedMockDatabase,
  setMockContext,
  clearMockContext,
  getMockContext,
} from '../mocks/supabase-mock';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Test fixtures
 */
const COMPANY_A_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const COMPANY_B_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const USER_A_ID = '00000000-0000-0000-0000-000000000001';
const USER_B_ID = '00000000-0000-0000-0000-000000000002';
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000999';

const ELECTION_A_ID = '11111111-1111-1111-1111-111111111111';
const ELECTION_B_ID = '22222222-2222-2222-2222-222222222222';

/**
 * Test suite
 */
describe('RLS Isolation Tests (Mocked)', () => {
  let supabase: SupabaseClient;

  beforeEach(() => {
    // Create mock Supabase client
    supabase = createMockSupabaseClient();

    // Seed test data
    seedMockDatabase(supabase, 'companies', [
      {
        id: COMPANY_A_ID,
        name: 'Test Company A',
        cnpj: '12.345.678/0001-00',
        email: 'company-a@example.com',
        is_active: true,
      },
      {
        id: COMPANY_B_ID,
        name: 'Test Company B',
        cnpj: '98.765.432/0001-00',
        email: 'company-b@example.com',
        is_active: true,
      },
    ]);

    seedMockDatabase(supabase, 'users', [
      {
        id: USER_A_ID,
        company_id: COMPANY_A_ID,
        name: 'User A',
        email: 'user-a@example.com',
        role: 'eleitor',
        is_active: true,
      },
      {
        id: USER_B_ID,
        company_id: COMPANY_B_ID,
        name: 'User B',
        email: 'user-b@example.com',
        role: 'eleitor',
        is_active: true,
      },
      {
        id: ADMIN_USER_ID,
        company_id: COMPANY_A_ID,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        is_active: true,
      },
    ]);

    seedMockDatabase(supabase, 'elections', [
      {
        id: ELECTION_A_ID,
        company_id: COMPANY_A_ID,
        title: 'Company A Election',
        description: 'Election for Company A',
        status: 'draft',
        created_at: new Date(),
      },
      {
        id: ELECTION_B_ID,
        company_id: COMPANY_B_ID,
        title: 'Company B Election',
        description: 'Election for Company B',
        status: 'draft',
        created_at: new Date(),
      },
    ]);

    seedMockDatabase(supabase, 'audit_logs', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: USER_A_ID,
        company_id: COMPANY_A_ID,
        action: 'login',
        severity: 'low',
        created_at: new Date(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: USER_B_ID,
        company_id: COMPANY_B_ID,
        action: 'login',
        severity: 'low',
        created_at: new Date(),
      },
    ]);
  });

  afterEach(() => {
    // Clear context after each test
    clearMockContext(supabase);
  });

  describe('Users Table Isolation', () => {
    it('AC1: User A can see their own company users', async () => {
      // Set User A context (Company A, eleitor role)
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      // Query users table
      const { data, error } = await supabase.from('users').select();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      // User A should see User A and Admin User (both Company A)
      expect(data!.length).toBe(2);
      expect(data!.every(u => u.company_id === COMPANY_A_ID)).toBe(true);
    });

    it('AC2: RLS blocks cross-tenant access via explicit WHERE', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      // Try to query User B's company explicitly
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('company_id', COMPANY_B_ID);

      expect(error).toBeNull();
      // RLS prevents access — returns empty array (transparent denial)
      expect(data!.length).toBe(0);
    });

    it('RLS blocks direct ID access to cross-tenant user', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      // Try to access User B by ID
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', USER_B_ID);

      expect(error).toBeNull();
      // RLS denies (User B is in different company)
      expect(data!.length).toBe(0);
    });
  });

  describe('Elections Table Isolation', () => {
    it('User from Company A sees only Company A elections', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      const { data, error } = await supabase.from('elections').select();

      expect(error).toBeNull();
      expect(data!.length).toBe(1);
      expect(data![0].company_id).toBe(COMPANY_A_ID);
    });

    it('RLS filters elections even with explicit WHERE', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      // Try to query Company B election explicitly
      const { data, error } = await supabase
        .from('elections')
        .select()
        .eq('company_id', COMPANY_B_ID);

      expect(error).toBeNull();
      expect(data!.length).toBe(0); // RLS blocks access
    });
  });

  describe('Audit Logs Table Isolation', () => {
    it('User sees only their company audit logs', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      const { data, error } = await supabase.from('audit_logs').select();

      expect(error).toBeNull();
      expect(data!.length).toBe(1);
      expect(data![0].company_id).toBe(COMPANY_A_ID);
    });
  });

  describe('Admin Bypass', () => {
    it('Admin user can see all users (bypass RLS)', async () => {
      // Set Admin context
      setMockContext(supabase, ADMIN_USER_ID, COMPANY_A_ID, 'admin');

      const { data, error } = await supabase.from('users').select();

      expect(error).toBeNull();
      // Admin should see all 3 users (no RLS filtering)
      expect(data!.length).toBe(3);
    });

    it('Admin can see all elections (bypass RLS)', async () => {
      // Set Admin context
      setMockContext(supabase, ADMIN_USER_ID, COMPANY_A_ID, 'admin');

      const { data, error } = await supabase.from('elections').select();

      expect(error).toBeNull();
      // Admin sees both elections
      expect(data!.length).toBe(2);
    });

    it('Admin can see all audit logs', async () => {
      // Set Admin context
      setMockContext(supabase, ADMIN_USER_ID, COMPANY_A_ID, 'admin');

      const { data, error } = await supabase.from('audit_logs').select();

      expect(error).toBeNull();
      // Admin sees all logs
      expect(data!.length).toBe(2);
    });
  });

  describe('RLS Transparent Denial', () => {
    it('User receives no error when RLS blocks access (transparent)', async () => {
      // Set User A context
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      // Try to access User B
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', USER_B_ID);

      // RLS denial is transparent — returns success with empty results
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Context Validation', () => {
    it('Can retrieve and verify current RLS context', async () => {
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');

      const context = getMockContext(supabase);

      expect(context).toBeDefined();
      expect(context!.userId).toBe(USER_A_ID);
      expect(context!.companyId).toBe(COMPANY_A_ID);
      expect(context!.role).toBe('eleitor');
    });

    it('Clearing context resets to null', async () => {
      setMockContext(supabase, USER_A_ID, COMPANY_A_ID, 'eleitor');
      clearMockContext(supabase);

      const context = getMockContext(supabase);
      expect(context).toBeNull();
    });

    it('No context means no access', async () => {
      // Don't set context — should fail gracefully
      const { data } = await supabase.from('users').select();

      // Without context, mock returns empty (no access)
      expect(data).toEqual([]);
    });
  });
});

/**
 * Usage Guide for Refactoring Existing Tests
 * ===========================================
 *
 * To migrate existing tests from live Supabase to mocked version:
 *
 * 1. Replace createClient with createMockSupabaseClient:
 *    OLD: const client = createClient(url, key);
 *    NEW: const client = createMockSupabaseClient();
 *
 * 2. Seed test data instead of inserting to live DB:
 *    OLD: await client.from('users').insert(userData).single();
 *    NEW: seedMockDatabase(client, 'users', [userData]);
 *
 * 3. Set RLS context for each test scenario:
 *    OLD: Authorization header set in request
 *    NEW: setMockContext(client, userId, companyId, role);
 *
 * 4. Make queries as normal — RLS policies are enforced in mock:
 *    const { data } = await client.from('table').select();
 *
 * 5. Clear context after each test:
 *    afterEach(() => clearMockContext(client));
 *
 * Benefits:
 * ✓ Tests run instantly (no network calls)
 * ✓ Tests run offline (no Supabase required)
 * ✓ Tests are deterministic (same seed = same results)
 * ✓ Easier to test edge cases (inject any data)
 * ✓ RLS policies tested in isolation
 */
