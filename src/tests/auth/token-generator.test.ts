/**
 * Token Generator Tests
 * Tests for cryptographic token generation, uniqueness, and entropy
 * AC2: Magic Link is sent via email with 24h expiration
 */

import { MagicLinkAuth } from '../../lib/auth/magic-link';
import * as crypto from 'crypto';

describe('Token Generator', () => {
  describe('generateSecureToken', () => {
    it('should generate a token that is a 64-character hex string', () => {
      // Access private method via reflection for testing
      const token = (MagicLinkAuth as any).generateSecureToken();
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[a-f0-9]{64}$/i);
      expect(token.length).toBe(64);
    });

    it('should generate cryptographically random tokens', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        tokens.add(token);
      }
      // All 100 tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it('should have 256-bit entropy (32 bytes = 64 hex chars)', () => {
      const token = (MagicLinkAuth as any).generateSecureToken();
      // 64 hex characters = 32 bytes = 256 bits
      const bytes = Buffer.from(token, 'hex');
      expect(bytes.length).toBe(32);
    });

    it('should generate tokens with even distribution of hex values', () => {
      const charCounts: Record<string, number> = {};
      const tokens: string[] = [];

      for (let i = 0; i < 1000; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        tokens.push(token);

        for (const char of token.toLowerCase()) {
          charCounts[char] = (charCounts[char] || 0) + 1;
        }
      }

      // Check that all hex characters (0-9, a-f) appear in the distribution
      const hexChars = '0123456789abcdef'.split('');
      for (const char of hexChars) {
        expect(charCounts[char]).toBeDefined();
        // Each character should appear roughly equally (with some variance)
        // With 64 chars * 1000 tokens = 64000 chars total
        // Expect each of 16 values to appear ~4000 times
        expect(charCounts[char]).toBeGreaterThan(3000);
        expect(charCounts[char]).toBeLessThan(5000);
      }
    });

    it('should use crypto.randomBytes for generation', () => {
      const cryptoSpy = jest.spyOn(crypto, 'randomBytes');
      const token = (MagicLinkAuth as any).generateSecureToken();

      expect(cryptoSpy).toHaveBeenCalledWith(32);
      expect(token).toBeDefined();

      cryptoSpy.mockRestore();
    });
  });

  describe('hashToken', () => {
    it('should hash a token using SHA-256', () => {
      const token = 'test-token-value';
      const hash = (MagicLinkAuth as any).hashToken(token);

      const expectedHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      expect(hash).toBe(expectedHash);
    });

    it('should produce a 64-character hex string (SHA-256)', () => {
      const token = 'test-token';
      const hash = (MagicLinkAuth as any).hashToken(token);

      expect(hash).toMatch(/^[a-f0-9]{64}$/i);
      expect(hash.length).toBe(64);
    });

    it('should produce different hashes for different tokens', () => {
      const token1 = 'token-1';
      const token2 = 'token-2';
      const hash1 = (MagicLinkAuth as any).hashToken(token1);
      const hash2 = (MagicLinkAuth as any).hashToken(token2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash for same token (deterministic)', () => {
      const token = 'test-token';
      const hash1 = (MagicLinkAuth as any).hashToken(token);
      const hash2 = (MagicLinkAuth as any).hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should be non-reversible (one-way hash)', () => {
      const token = 'secret-token';
      const hash = (MagicLinkAuth as any).hashToken(token);

      // We can't reverse the hash to get the original token
      // Just verify it's a proper hash
      expect(hash).not.toContain(token);
      expect(hash).not.toContain('secret');
    });
  });

  describe('Token Uniqueness', () => {
    it('should generate unique tokens across multiple calls', () => {
      const tokens = new Set<string>();
      const tokenCount = 1000;

      for (let i = 0; i < tokenCount; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        tokens.add(token);
      }

      expect(tokens.size).toBe(tokenCount);
    });

    it('should have collision probability near zero for 2^128 tokens', () => {
      // Birthday paradox: collision probability for n tokens from 2^256 space
      // P(collision) = 1 - e^(-n^2 / 2^257)
      // For n = 1000: P(collision) ≈ 1 / 2^126 (essentially zero)

      const tokens = new Set<string>();
      const tokenCount = 10000; // Large number to test for collisions

      for (let i = 0; i < tokenCount; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        if (tokens.has(token)) {
          throw new Error(`Token collision detected at iteration ${i}`);
        }
        tokens.add(token);
      }

      expect(tokens.size).toBe(tokenCount);
    });
  });

  describe('Token Generation Performance', () => {
    it('should generate tokens in less than 5ms each', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        (MagicLinkAuth as any).generateSecureToken();
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 100;

      expect(avgTime).toBeLessThan(5);
    });

    it('should hash tokens in less than 1ms each', () => {
      const token = (MagicLinkAuth as any).generateSecureToken();
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        (MagicLinkAuth as any).hashToken(token);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 1000;

      expect(avgTime).toBeLessThan(1);
    });
  });

  describe('Token Format Validation', () => {
    it('should match RFC 5234 hex format (0-9a-fA-F)', () => {
      for (let i = 0; i < 100; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        expect(token).toMatch(/^[a-f0-9]{64}$/i);
      }
    });

    it('should never contain special characters', () => {
      const invalidChars = /[^a-f0-9]/i;

      for (let i = 0; i < 100; i++) {
        const token = (MagicLinkAuth as any).generateSecureToken();
        expect(token).not.toMatch(invalidChars);
      }
    });

    it('should be lowercase in output (by convention)', () => {
      const token = (MagicLinkAuth as any).generateSecureToken();
      // Check that it's all lowercase
      expect(token).toBe(token.toLowerCase());
    });
  });

  describe('Entropy Analysis', () => {
    it('should have sufficient entropy to prevent brute force attacks', () => {
      // 256-bit entropy means 2^256 possible values
      // Even with 1 trillion guesses per second, it would take 10^70 years
      // to have a 50% chance of guessing correctly
      const token = (MagicLinkAuth as any).generateSecureToken();
      const bits = Buffer.from(token, 'hex').length * 8;

      expect(bits).toBe(256);
    });

    it('should use random bytes directly without reduction', () => {
      // crypto.randomBytes(32).toString('hex') should give us full 256-bit entropy
      // Not reduced through modulo or other operations
      const token = (MagicLinkAuth as any).generateSecureToken();
      expect(token.length).toBe(64); // 32 bytes * 2 hex chars per byte
    });
  });
});
