-- ============================================================================
-- Migration: 003_user_sessions_table.sql
-- Purpose: Create user_sessions table for session management & token lifecycle
-- Date: 2026-03-06
-- Story: STORY-1.3 (Implement Session Management & Token Lifecycle)
-- ============================================================================
--
-- This migration creates the user_sessions table to track active user sessions,
-- manage JWT tokens, and support multiple concurrent sessions per user (multi-device).
--
-- Key Features:
--   1. Short-lived access tokens (15-minute expiration)
--   2. Long-lived refresh tokens (30-day expiration)
--   3. Device fingerprinting (IP address + user agent)
--   4. Sliding window session expiration (24-hour default)
--   5. Session revocation capability (logout)
--   6. Audit trail for all session events
--   7. Row-level security (RLS) for multi-tenant isolation
--
-- Security Implementation:
--   - All tokens stored as SHA-256 hashes (never plaintext)
--   - Refresh token marked UNIQUE to prevent duplicate sessions
--   - Timestamps use timezone-aware columns
--   - Constraints enforce valid state transitions
--   - Indexes optimized for common queries
--
-- ============================================================================

-- ============================================================================
-- CREATE user_sessions TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Token storage (SHA-256 hashes, never plaintext)
  access_token_hash VARCHAR(256) NOT NULL,
  refresh_token_hash VARCHAR(256) NOT NULL UNIQUE,

  -- Device information for fingerprinting & auditing
  ip_address INET,
  user_agent VARCHAR(500),
  device_fingerprint VARCHAR(256),  -- SHA-256(ip_address + user_agent)

  -- Timestamp tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Sliding window: last_activity + 24h
  revoked_at TIMESTAMP WITH TIME ZONE,  -- NULL if active, set on logout

  -- Computed column for active status
  is_active BOOLEAN GENERATED ALWAYS AS (revoked_at IS NULL) STORED,

  -- Constraints
  CONSTRAINT check_token_hashes CHECK (
    length(access_token_hash) = 64 AND
    length(refresh_token_hash) = 64
  ),
  CONSTRAINT check_timestamps CHECK (
    created_at <= last_activity AND
    last_activity <= expires_at AND
    (revoked_at IS NULL OR revoked_at >= created_at)
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Primary lookup: Find sessions by user
CREATE INDEX idx_user_sessions_user_id
  ON user_sessions(user_id)
  WHERE revoked_at IS NULL;

-- Multi-tenant isolation: Find sessions by company
CREATE INDEX idx_user_sessions_company_id
  ON user_sessions(company_id)
  WHERE revoked_at IS NULL;

-- Token validation: Lookup by refresh token hash
CREATE INDEX idx_user_sessions_refresh_token_hash
  ON user_sessions(refresh_token_hash)
  WHERE revoked_at IS NULL;

-- Token validation: Lookup by access token hash
CREATE INDEX idx_user_sessions_access_token_hash
  ON user_sessions(access_token_hash)
  WHERE revoked_at IS NULL;

-- Cleanup job: Find expired sessions
CREATE INDEX idx_user_sessions_expires_at
  ON user_sessions(expires_at)
  WHERE revoked_at IS NULL;

-- Activity tracking: Find active sessions
CREATE INDEX idx_user_sessions_is_active
  ON user_sessions(is_active)
  WHERE revoked_at IS NULL;

-- Combined index for common queries
CREATE INDEX idx_user_sessions_user_active
  ON user_sessions(user_id, is_active)
  WHERE revoked_at IS NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own sessions, admins can see all
CREATE POLICY "user_sessions_user_access" ON user_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.jwt()->>'role' = 'admin'
  );

-- Policy: Users can only revoke their own sessions, admins can revoke any
CREATE POLICY "user_sessions_revoke" ON user_sessions
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    auth.jwt()->>'role' = 'admin'
  )
  WITH CHECK (
    user_id = auth.uid() OR
    auth.jwt()->>'role' = 'admin'
  );

-- Policy: Prevent users from creating sessions (backend-only operation)
CREATE POLICY "user_sessions_no_insert" ON user_sessions
  FOR INSERT
  WITH CHECK (false);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to validate token hash format
CREATE OR REPLACE FUNCTION validate_token_hash(token_hash VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- Token hash should be 64 characters (SHA-256 in hex)
  RETURN token_hash IS NOT NULL AND length(token_hash) = 64;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to mark session as revoked
CREATE OR REPLACE FUNCTION revoke_session(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_sessions
  SET revoked_at = NOW()
  WHERE id = session_id AND revoked_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql STRICT;

-- Function to cleanup expired sessions
-- This is called by a background job or manually via API
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(deleted_count INTEGER, revoked_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_revoked_count INTEGER := 0;
BEGIN
  -- Delete sessions expired more than 24 hours ago
  DELETE FROM user_sessions
  WHERE expires_at < NOW() - INTERVAL '24 hours'
  AND revoked_at IS NOT NULL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- Delete sessions inactive for more than 24 hours
  DELETE FROM user_sessions
  WHERE last_activity < NOW() - INTERVAL '24 hours'
  AND revoked_at IS NULL;

  GET DIAGNOSTICS v_revoked_count = ROW_COUNT;

  RETURN QUERY SELECT v_deleted_count, v_revoked_count;
END;
$$ LANGUAGE plpgsql STRICT;

-- ============================================================================
-- AUDIT TRIGGER
-- ============================================================================

-- Function to log session events to audit_logs
CREATE OR REPLACE FUNCTION audit_session_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, metadata, ip_address, user_agent)
    VALUES (
      NEW.user_id,
      NEW.company_id,
      'SESSION_CREATED',
      'user_sessions',
      jsonb_build_object(
        'session_id', NEW.id,
        'device_fingerprint', NEW.device_fingerprint,
        'ip_address', NEW.ip_address
      ),
      NEW.ip_address::TEXT,
      NEW.user_agent
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' AND NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, metadata, ip_address, user_agent)
    VALUES (
      NEW.user_id,
      NEW.company_id,
      'SESSION_REVOKED',
      'user_sessions',
      jsonb_build_object(
        'session_id', NEW.id,
        'revoked_at', NEW.revoked_at,
        'device_fingerprint', NEW.device_fingerprint
      ),
      NEW.ip_address::TEXT,
      NEW.user_agent
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, company_id, action, table_name, metadata, ip_address, user_agent)
    VALUES (
      NEW.user_id,
      NEW.company_id,
      'SESSION_UPDATED',
      'user_sessions',
      jsonb_build_object(
        'session_id', NEW.id,
        'last_activity', NEW.last_activity,
        'expires_at', NEW.expires_at
      ),
      NEW.ip_address::TEXT,
      NEW.user_agent
    );
    RETURN NEW;

  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STRICT;

-- Create trigger for audit logging
CREATE TRIGGER trg_user_sessions_audit
AFTER INSERT OR UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION audit_session_changes();

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- Migration Dependencies:
--   - users table must exist (foreign key)
--   - companies table must exist (foreign key)
--   - audit_logs table must exist (for audit trigger)
--   - auth.uid() must be available (Supabase JWT)
--
-- Performance Considerations:
--   - Indexes created on frequently queried columns
--   - Partial indexes filter on is_active (reduces index size)
--   - Token hashes use indexed lookups for O(log n) validation
--   - Cleanup job should run off-peak (2 AM UTC recommended)
--
-- Security Considerations:
--   - All tokens stored as hashes, never plaintext
--   - RLS policies prevent unauthorized session access
--   - Revocation is immediate (no grace period)
--   - Device fingerprinting helps detect compromised sessions
--
-- Future Enhancements:
--   - Add refresh token rotation (new token on each refresh)
--   - Add concurrent token limit per user
--   - Add geographic location tracking
--   - Add suspicious activity detection
--   - Add session timeout warnings
--
-- ============================================================================
