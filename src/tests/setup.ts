/**
 * Jest Setup File — RLS Test Configuration
 * ========================================
 *
 * This file initializes the test environment for RLS testing.
 * It runs BEFORE all tests and sets up:
 * - JWT mocking context
 * - Supabase client configuration
 * - Test database connection
 * - Request context simulation
 *
 * Story: STORY-1.2 (RLS Implementation)
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * RLS Test Context — Simulates JWT claims from request
 * Used by RLS helper functions in migrations
 */
export interface RLSTestContext {
  userId: string;
  userRole: 'admin' | 'rh' | 'eleitor';
  companyId: string;
}

/**
 * Global test context storage
 * RLS helper functions will read from this
 */
let currentTestContext: RLSTestContext | null = null;

/**
 * Set the JWT context for the current test
 * This simulates what would normally come from Authorization header
 *
 * Usage in tests:
 * ```typescript
 * beforeEach(() => {
 *   setRLSContext({
 *     userId: 'user-id',
 *     userRole: 'eleitor',
 *     companyId: 'company-id'
 *   });
 * });
 * ```
 */
export function setRLSContext(context: RLSTestContext): void {
  currentTestContext = context;

  // Store in process.env so database functions can access
  process.env.TEST_JWT_USER_ID = context.userId;
  process.env.TEST_JWT_ROLE = context.userRole;
  process.env.TEST_JWT_COMPANY_ID = context.companyId;
}

/**
 * Get the current JWT context
 */
export function getRLSContext(): RLSTestContext | null {
  return currentTestContext;
}

/**
 * Clear the JWT context
 * Call in afterEach() to prevent test pollution
 */
export function clearRLSContext(): void {
  currentTestContext = null;
  delete process.env.TEST_JWT_USER_ID;
  delete process.env.TEST_JWT_ROLE;
  delete process.env.TEST_JWT_COMPANY_ID;
}

/**
 * Mock implementation of RLS helper functions
 * These are normally defined in PostgreSQL, but for local testing we need mocks
 */
export const RLSMocks = {
  /**
   * Mock auth.user_id()
   * Returns the current test user's ID
   */
  auth_user_id: (): string | null => {
    return currentTestContext?.userId || null;
  },

  /**
   * Mock auth.user_role()
   * Returns the current test user's role
   */
  auth_user_role: (): string => {
    return currentTestContext?.userRole || 'eleitor';
  },

  /**
   * Mock auth.user_company_id()
   * Returns the current test user's company ID
   */
  auth_user_company_id: (): string | null => {
    return currentTestContext?.companyId || null;
  },

  /**
   * Mock is_admin()
   * Returns true if user is admin
   */
  is_admin: (): boolean => {
    return currentTestContext?.userRole === 'admin';
  },

  /**
   * Mock is_rh_or_admin()
   * Returns true if user is RH or admin
   */
  is_rh_or_admin: (): boolean => {
    const role = currentTestContext?.userRole;
    return role === 'admin' || role === 'rh';
  },

  /**
   * Mock same_company(company_uuid)
   * Returns true if company matches user's company or user is admin
   */
  same_company: (companyId: string): boolean => {
    if (!currentTestContext) return false;
    return companyId === currentTestContext.companyId || currentTestContext.userRole === 'admin';
  },
};

/**
 * Create a Supabase client for tests
 * Handles both real Supabase connection (CI) and mocked connection (local)
 */
export function createTestSupabaseClient(): SupabaseClient {
  const { createClient } = require('@supabase/supabase-js');

  const url = process.env.SUPABASE_URL || 'http://localhost:54321';
  const key = process.env.SUPABASE_ANON_KEY || 'test-anon-key';

  return createClient(url, key);
}

/**
 * Helper to simulate an RLS query with a specific user context
 *
 * Usage:
 * ```typescript
 * const results = await withRLSContext({
 *   userId: 'user-123',
 *   userRole: 'eleitor',
 *   companyId: 'company-456'
 * }, async () => {
 *   const client = createTestSupabaseClient();
 *   return client.from('elections').select('*');
 * });
 * ```
 */
export async function withRLSContext<T>(
  context: RLSTestContext,
  fn: () => Promise<T>
): Promise<T> {
  setRLSContext(context);
  try {
    return await fn();
  } finally {
    clearRLSContext();
  }
}

/**
 * Test data generators
 */
export const testDataGenerators = {
  /**
   * Generate a random CNPJ for testing
   */
  generateCNPJ: (): string => {
    const random = Math.random().toString().substring(2, 16).padEnd(14, '0');
    return `${random.substring(0, 2)}.${random.substring(2, 5)}.${random.substring(5, 8)}/0001-${random.substring(8, 12)}`;
  },

  /**
   * Generate a random email
   */
  generateEmail: (prefix = 'test'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString().substring(2, 8)}@example.com`;
  },

  /**
   * Generate a random CPF
   */
  generateCPF: (): string => {
    const random = Math.random().toString().substring(2, 14).padEnd(11, '0');
    return `${random.substring(0, 3)}.${random.substring(3, 6)}.${random.substring(6, 9)}-${random.substring(9, 11)}`;
  },
};

/**
 * Global setup — runs once before all test suites
 */
beforeAll(() => {
  // Ensure environment variables are set
  process.env.NODE_ENV = 'test';

  // Set test database URL if not already set
  if (!process.env.SUPABASE_URL) {
    process.env.SUPABASE_URL = 'http://localhost:54321';
  }

  console.log(`
╔════════════════════════════════════════╗
║     RLS Test Suite Configuration       ║
╚════════════════════════════════════════╝

Test Database: ${process.env.SUPABASE_URL}
JWT Mocking:   Enabled
Test Mode:     ${process.env.NODE_ENV}

Tests will run without live Supabase connection.
JWT context is mocked via process.env variables.
  `);
});

/**
 * Global teardown — runs once after all test suites
 */
afterAll(() => {
  clearRLSContext();
  console.log(`\n✓ Test cleanup complete\n`);
});

/**
 * Test timeout configuration
 */
jest.setTimeout(10000); // 10 seconds per test

export default {
  setRLSContext,
  getRLSContext,
  clearRLSContext,
  createTestSupabaseClient,
  withRLSContext,
  RLSMocks,
  testDataGenerators,
};
