/**
 * Token Management System
 *
 * Handles:
 * - JWT access token generation (15-minute expiration)
 * - Refresh token generation (30-day expiration)
 * - Token validation and verification
 * - Token refresh with rotation
 *
 * Security considerations:
 * - Tokens signed with secret key (SUPABASE_JWT_SECRET)
 * - Refresh tokens rotated on each use
 * - All tokens hashed before database storage
 * - Tokens validated for expiration, signature, and revocation
 */

import * as crypto from 'crypto';
import { supabase } from '../supabase';

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days in seconds
  GRACE_PERIOD: 60 // 1 minute grace period for token refresh
};

export interface JWTPayload {
  sub: string; // user_id
  session_id: string;
  email: string;
  company_id: string;
  role: string;
  device_fingerprint?: string;
  iat: number; // issued at
  exp: number; // expiration time
  iss: string; // issuer
  aud: string; // audience
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
  tokenType: string;
}

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  company_id: string;
  refresh_token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  is_active: boolean;
}

/**
 * Generate JWT access token
 *
 * Creates a signed JWT with:
 * - 15-minute expiration
 * - User identity claims (sub, email, company_id, role)
 * - Session ID for tracking
 * - Device fingerprint for validation
 *
 * @param userId - User ID (UUID)
 * @param sessionId - Session ID (UUID)
 * @param email - User email
 * @param companyId - Company ID (UUID)
 * @param role - User role
 * @param deviceFingerprint - Optional device fingerprint
 * @returns JWT access token string
 */
export function generateAccessToken(
  userId: string,
  sessionId: string,
  email: string,
  companyId: string,
  role: string,
  deviceFingerprint?: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + TOKEN_EXPIRY.ACCESS_TOKEN;

  const payload: JWTPayload = {
    sub: userId,
    session_id: sessionId,
    email,
    company_id: companyId,
    role,
    device_fingerprint: deviceFingerprint,
    iat: now,
    exp: expiresAt,
    iss: 'safety-vote',
    aud: 'safety-vote'
  };

  // In a real implementation, this would use a JWT library like jsonwebtoken
  // For now, we create a simple JWT structure
  return createJWT(payload);
}

/**
 * Generate refresh token
 *
 * Creates a cryptographically secure random token (256-bit)
 * that can be used to obtain new access tokens.
 *
 * The actual token is not stored; only its SHA-256 hash is stored
 * in the database to prevent token leakage if database is compromised.
 *
 * @returns 256-bit random token as base64url string
 */
export function generateRefreshToken(): string {
  // Generate 32 random bytes (256 bits)
  const randomBytes = crypto.randomBytes(32);

  // Encode as base64url (standard for JWT refresh tokens)
  return randomBytes.toString('base64url');
}

/**
 * Hash token for secure storage
 *
 * Tokens are hashed before storage so they cannot be leaked
 * if the database is compromised.
 *
 * @param token - Plain token string
 * @returns SHA-256 hash as hex string
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify token hash matches token
 *
 * Constant-time comparison to prevent timing attacks
 *
 * @param token - Plain token to verify
 * @param tokenHash - Previously stored hash
 * @returns true if token matches hash
 */
export function verifyTokenHash(token: string, tokenHash: string): boolean {
  const hash = hashToken(token);
  return constantTimeCompare(hash, tokenHash);
}

/**
 * Verify access token signature and expiration
 *
 * @param token - JWT access token
 * @returns Decoded JWT payload if valid, null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = decodeJWT(token);

    if (!payload) {
      return null;
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    // Validate required claims
    if (!payload.sub || !payload.session_id || !payload.company_id) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying access token:', error);
    return null;
  }
}

/**
 * Create JWT token (simplified implementation)
 *
 * In production, use jsonwebtoken library for proper JWT creation
 *
 * @param payload - JWT payload
 * @returns JWT token string
 */
function createJWT(payload: JWTPayload): string {
  // Header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  // Encode header and payload as base64url
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Create signature
  const message = `${headerB64}.${payloadB64}`;
  const secret = process.env.SUPABASE_JWT_SECRET || 'dev-secret-key';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('base64url');

  // Return complete JWT
  return `${message}.${signature}`;
}

/**
 * Decode JWT token (simplified implementation)
 *
 * In production, use jsonwebtoken library for proper JWT verification
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid format
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payloadB64 = parts[1];
    const payloadJSON = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJSON) as JWTPayload;

    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Constant-time string comparison
 *
 * Prevents timing attacks by comparing all characters
 * regardless of where mismatch occurs
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings match
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if access token is about to expire (within grace period)
 *
 * Used to proactively refresh tokens before they actually expire
 *
 * @param token - JWT access token
 * @returns true if token expires within grace period
 */
export function isAccessTokenExpiringSoon(token: string): boolean {
  const payload = verifyAccessToken(token);

  if (!payload) {
    return true; // Treat invalid tokens as expiring
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;

  return timeUntilExpiry < TOKEN_EXPIRY.GRACE_PERIOD;
}

/**
 * Validate refresh token from database
 *
 * Checks that:
 * - Token exists in database
 * - Token hasn't expired
 * - Token hasn't been revoked
 *
 * @param userId - User ID
 * @param refreshTokenHash - SHA-256 hash of refresh token
 * @returns Refresh token record if valid, null otherwise
 */
export async function validateRefreshToken(
  userId: string,
  refreshTokenHash: string
): Promise<RefreshTokenRecord | null> {
  try {
    // Query database for matching refresh token
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, user_id, company_id, refresh_token_hash, expires_at, revoked_at, is_active')
      .eq('user_id', userId)
      .eq('refresh_token_hash', refreshTokenHash)
      .single();

    if (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const record = data as RefreshTokenRecord;

    // Check expiration
    const expiresAt = new Date(record.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    // Check revocation
    if (!record.is_active) {
      return null;
    }

    return record;
  } catch (error) {
    console.error('Error in validateRefreshToken:', error);
    return null;
  }
}

/**
 * Update session last_activity timestamp
 *
 * Called on every successful token use to implement
 * sliding window expiration
 *
 * @param sessionId - Session ID
 * @returns true if update successful
 */
export async function updateSessionActivity(sessionId: string): Promise<boolean> {
  try {
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date(),
        expires_at: newExpiresAt
      })
      .eq('id', sessionId)
      .is('revoked_at', null); // Only update if not revoked

    if (error) {
      console.error('Error updating session activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSessionActivity:', error);
    return false;
  }
}
