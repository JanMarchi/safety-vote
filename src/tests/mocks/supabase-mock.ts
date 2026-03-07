/**
 * Supabase Mock Library
 * ====================
 *
 * Provides in-memory mocks of Supabase client and database operations
 * for testing RLS without live Supabase connection.
 *
 * Story: STORY-1.2 (RLS Implementation)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Mock database table with in-memory storage
 */
interface MockTableData {
  [id: string]: any;
}

/**
 * Mock Supabase client implementation
 */
class MockSupabaseClient {
  private tables: Map<string, MockTableData> = new Map();
  private currentContext: { userId: string; companyId: string; role: string } | null = null;

  /**
   * Set current user context for RLS evaluation
   */
  setContext(userId: string, companyId: string, role: string) {
    this.currentContext = { userId, companyId, role };
  }

  /**
   * Clear user context
   */
  clearContext() {
    this.currentContext = null;
  }

  /**
   * Mock table() method
   */
  from(tableName: string) {
    return new MockQueryBuilder(this, tableName);
  }

  /**
   * Get raw table data (for testing internal state)
   */
  getTableData(tableName: string): MockTableData {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, {});
    }
    return this.tables.get(tableName)!;
  }

  /**
   * Get current user context (used by mock RLS functions)
   */
  getCurrentContext() {
    return this.currentContext;
  }

  /**
   * Evaluate RLS policy for row access
   */
  evaluateRLS(
    tableName: string,
    row: any,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'
  ): boolean {
    if (!this.currentContext) return false;

    const { userId, companyId, role } = this.currentContext;
    const isAdmin = role === 'admin';

    // Evaluate policies based on table
    switch (tableName) {
      case 'companies':
        // Only admins can access companies table
        return isAdmin;

      case 'users':
      case 'elections':
      case 'audit_logs':
        // Company-level isolation: user sees only their company's data
        // OR admin can see all
        return row.company_id === companyId || isAdmin;

      case 'candidates':
      case 'votes':
        // These join through elections, so we'd need to check election.company_id
        // For now, just check if election_id is in user's company's elections
        // This is simplified — real implementation would join to elections table
        return true; // TODO: proper join evaluation

      case 'auth_tokens':
      case 'user_sessions':
        // User-specific, not company-based
        return row.user_id === userId || isAdmin;

      default:
        return false;
    }
  }
}

/**
 * Mock query builder
 */
class MockQueryBuilder {
  private client: MockSupabaseClient;
  private tableName: string;
  private _select: string[] = [];
  private _where: Array<{ key: string; value: any; operator: string }> = [];
  private _data: any = null;
  private _error: Error | null = null;

  constructor(client: MockSupabaseClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Mock select() method
   */
  select(columns = '*') {
    this._select = columns === '*' ? [] : columns.split(',').map(c => c.trim());
    return this;
  }

  /**
   * Mock insert() method
   */
  insert(data: any) {
    const tableData = this.client.getTableData(this.tableName);
    const id = data.id || `id-${Date.now()}-${Math.random()}`;

    // Check RLS before insert
    const context = this.client.getCurrentContext();
    if (!context) {
      this._error = new Error('No authenticated user context');
      return this;
    }

    if (!this.client.evaluateRLS(this.tableName, data, 'INSERT')) {
      this._error = new Error('RLS policy violation: INSERT denied');
      return this;
    }

    tableData[id] = { ...data, id };
    this._data = { id, ...data };
    return this;
  }

  /**
   * Mock update() method
   */
  update(data: any) {
    const tableData = this.client.getTableData(this.tableName);

    // Apply WHERE filters
    for (const [key, value] of Object.entries(tableData)) {
      const row = value as any;

      // Check WHERE condition
      let matchesWhere = true;
      for (const where of this._where) {
        if (where.operator === 'eq') {
          matchesWhere = matchesWhere && row[where.key] === where.value;
        }
      }

      if (!matchesWhere) continue;

      // Check RLS
      if (!this.client.evaluateRLS(this.tableName, row, 'UPDATE')) {
        this._error = new Error('RLS policy violation: UPDATE denied');
        continue;
      }

      tableData[key] = { ...row, ...data };
    }

    return this;
  }

  /**
   * Mock where() method
   */
  eq(column: string, value: any) {
    this._where.push({ key: column, value, operator: 'eq' });
    return this;
  }

  /**
   * Mock single() method
   */
  single() {
    return this;
  }

  /**
   * Mock data retrieval
   */
  async then(callback: (value: any) => any) {
    // Check for errors first
    if (this._error) {
      return callback({ data: null, error: this._error });
    }

    if (this._data) {
      // Insert/update/delete completed
      return callback({ data: this._data, error: null });
    }

    // SELECT operation
    const tableData = this.client.getTableData(this.tableName);
    const results: any[] = [];

    for (const [, row] of Object.entries(tableData)) {
      // Check WHERE conditions
      let matchesWhere = true;
      for (const where of this._where) {
        if (where.operator === 'eq') {
          matchesWhere = matchesWhere && (row as any)[where.key] === where.value;
        }
      }

      if (!matchesWhere) continue;

      // Check RLS policy
      if (!this.client.evaluateRLS(this.tableName, row, 'SELECT')) {
        continue; // Silent RLS denial (no error, just no rows returned)
      }

      // Apply column selection
      if (this._select.length > 0) {
        const filtered: any = {};
        for (const col of this._select) {
          filtered[col] = (row as any)[col];
        }
        results.push(filtered);
      } else {
        results.push(row);
      }
    }

    return callback({ data: results, error: null });
  }

  /**
   * Catch errors
   */
  catch(callback: (error: any) => any) {
    if (this._error) {
      return callback(this._error);
    }
    return this;
  }
}

/**
 * Create a mock Supabase client
 * Use this in tests instead of createClient()
 */
export function createMockSupabaseClient(): SupabaseClient {
  return new MockSupabaseClient() as any;
}

/**
 * Inject test data into mock database
 */
export function seedMockDatabase(
  client: SupabaseClient,
  tableName: string,
  data: any[]
) {
  const mockClient = client as any as MockSupabaseClient;
  const tableData = mockClient.getTableData(tableName);

  for (const row of data) {
    const id = row.id || `${tableName}-${Date.now()}`;
    tableData[id] = { ...row, id };
  }
}

/**
 * Get current user context from mock client
 */
export function getMockContext(client: SupabaseClient) {
  const mockClient = client as any as MockSupabaseClient;
  return mockClient.getCurrentContext();
}

/**
 * Set user context on mock client
 */
export function setMockContext(
  client: SupabaseClient,
  userId: string,
  companyId: string,
  role: 'admin' | 'rh' | 'eleitor'
) {
  const mockClient = client as any as MockSupabaseClient;
  mockClient.setContext(userId, companyId, role);
}

/**
 * Clear user context on mock client
 */
export function clearMockContext(client: SupabaseClient) {
  const mockClient = client as any as MockSupabaseClient;
  mockClient.clearContext();
}
