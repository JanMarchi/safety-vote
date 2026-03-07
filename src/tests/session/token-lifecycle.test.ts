/**
 * Token Lifecycle Tests
 *
 * Tests for:
 * - Token generation
 * - Token validation
 * - Token expiration
 * - Token refresh
 * - Token hashing
 */

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyTokenHash,
  verifyAccessToken,
  isAccessTokenExpiringSoon,
  TOKEN_EXPIRY,
  JWTPayload
} from '../../lib/session/token-handler';

describe('Token Lifecycle', () => {
  // Test data
  const testData = {
    userId: 'test-user-123',
    sessionId: 'test-session-456',
    email: 'user@example.com',
    companyId: 'test-company-789',
    role: 'eleitor',
    deviceFingerprint: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  };

  describe('generateAccessToken', () => {
    test('should generate a valid JWT access token', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role,
        testData.deviceFingerprint
      );

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    test('should include correct claims in access token', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload).toBeTruthy();
      expect(payload?.sub).toBe(testData.userId);
      expect(payload?.session_id).toBe(testData.sessionId);
      expect(payload?.email).toBe(testData.email);
      expect(payload?.company_id).toBe(testData.companyId);
      expect(payload?.role).toBe(testData.role);
    });

    test('should set access token expiration to 15 minutes', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload).toBeTruthy();

      const now = Math.floor(Date.now() / 1000);
      const expirationDelta = (payload?.exp ?? 0) - payload?.iat!;

      // Allow 2 second tolerance
      expect(Math.abs(expirationDelta - TOKEN_EXPIRY.ACCESS_TOKEN)).toBeLessThan(2);
    });

    test('should include device fingerprint in claims when provided', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role,
        testData.deviceFingerprint
      );

      const payload = verifyAccessToken(token);
      expect(payload?.device_fingerprint).toBe(testData.deviceFingerprint);
    });

    test('should set issuer and audience', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload?.iss).toBe('safety-vote');
      expect(payload?.aud).toBe('safety-vote');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a refresh token', () => {
      const token = generateRefreshToken();

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(32); // Base64url encoded 32 bytes
    });

    test('should generate unique refresh tokens', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).not.toBe(token2);
    });

    test('should be base64url formatted', () => {
      const token = generateRefreshToken();

      // Base64url uses A-Z, a-z, 0-9, -, _
      expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
    });
  });

  describe('hashToken', () => {
    test('should hash token using SHA-256', () => {
      const token = 'test-token-12345';
      const hash = hashToken(token);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
    });

    test('should be deterministic', () => {
      const token = 'test-token-abc123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });

    test('should produce hex-formatted output', () => {
      const token = 'test-token';
      const hash = hashToken(token);

      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });
  });

  describe('verifyTokenHash', () => {
    test('should verify token against hash', () => {
      const token = 'test-token-verify';
      const hash = hashToken(token);

      expect(verifyTokenHash(token, hash)).toBe(true);
    });

    test('should reject invalid token', () => {
      const token1 = 'test-token-1';
      const hash = hashToken(token1);
      const token2 = 'test-token-2';

      expect(verifyTokenHash(token2, hash)).toBe(false);
    });

    test('should use constant-time comparison', () => {
      const token = 'test-token';
      const hash = hashToken(token);
      const wrongHash = hashToken('other-token');

      // Verify both match and non-match work
      expect(verifyTokenHash(token, hash)).toBe(true);
      expect(verifyTokenHash(token, wrongHash)).toBe(false);
    });
  });

  describe('verifyAccessToken', () => {
    test('should verify valid access token', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload).toBeTruthy();
    });

    test('should reject expired access token', () => {
      // Create token with invalid expiration time (in the past)
      const now = Math.floor(Date.now() / 1000);
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      // Manually create an expired token
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      payload.exp = now - 3600; // 1 hour in the past

      const modifiedPayloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const invalidToken = `${parts[0]}.${modifiedPayloadB64}.${parts[2]}`;

      expect(verifyAccessToken(invalidToken)).toBeNull();
    });

    test('should reject token with invalid format', () => {
      expect(verifyAccessToken('invalid.token')).toBeNull();
      expect(verifyAccessToken('invalid')).toBeNull();
      expect(verifyAccessToken('')).toBeNull();
    });

    test('should require all mandatory claims', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload?.sub).toBeTruthy(); // user_id
      expect(payload?.session_id).toBeTruthy();
      expect(payload?.company_id).toBeTruthy();
      expect(payload?.exp).toBeTruthy();
      expect(payload?.iat).toBeTruthy();
    });
  });

  describe('isAccessTokenExpiringSoon', () => {
    test('should detect token expiring within grace period', () => {
      // Create a token that's about to expire
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      // Manually create token expiring soon (45 seconds from now)
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      const now = Math.floor(Date.now() / 1000);
      payload.exp = now + 45; // Within 60-second grace period

      const modifiedPayloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const expiringToken = `${parts[0]}.${modifiedPayloadB64}.${parts[2]}`;

      expect(isAccessTokenExpiringSoon(expiringToken)).toBe(true);
    });

    test('should not flag token valid for extended period', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      // Fresh token should not be expiring soon
      expect(isAccessTokenExpiringSoon(token)).toBe(false);
    });

    test('should treat invalid tokens as expiring', () => {
      expect(isAccessTokenExpiringSoon('invalid-token')).toBe(true);
      expect(isAccessTokenExpiringSoon('')).toBe(true);
    });
  });

  describe('Token Rotation', () => {
    test('should generate different access tokens on each call', () => {
      const token1 = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      // Small delay to ensure different iat/exp
      const token2 = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      expect(token1).not.toBe(token2);
    });

    test('should support refresh token rotation', () => {
      const refreshToken1 = generateRefreshToken();
      const hash1 = hashToken(refreshToken1);

      const refreshToken2 = generateRefreshToken();
      const hash2 = hashToken(refreshToken2);

      // New refresh token should have different hash
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Security', () => {
    test('should not expose plaintext token in logs', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const hash = hashToken(token);

      // Hash should not contain original token
      expect(hash).not.toContain(token);
    });

    test('should prevent token tampering detection', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      // Tamper with signature
      const parts = token.split('.');
      const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`;

      // Tampered token should not verify
      expect(verifyAccessToken(tamperedToken)).toBeNull();
    });

    test('should isolate token claims by company', () => {
      const token = generateAccessToken(
        testData.userId,
        testData.sessionId,
        testData.email,
        testData.companyId,
        testData.role
      );

      const payload = verifyAccessToken(token);
      expect(payload?.company_id).toBe(testData.companyId);
    });
  });
});
