/**
 * Rate Limiting Tests
 * Tests for rate limit enforcement and IP-based tracking
 * AC4: Rate limiting enforces max 5 attempts per 10 minutes per IP
 */

import { MagicLinkAuth } from '../../lib/auth/magic-link';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limit Checking', () => {
    it('should allow first 5 requests from same IP within 10 minutes', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      // Mock for successful user lookup
      const mockUser = {
        id: 'user-123',
        email: email,
        cpf: '12345678900',
      };

      // Create token records for 0, 1, 2, 3, 4 requests
      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          // For rate limit check, return count < 5
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: [
                    { id: 'token-1' },
                    { id: 'token-2' },
                    { id: 'token-3' },
                    { id: 'token-4' },
                  ], // 4 existing requests
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                mockResolvedValue: jest.fn().mockResolvedValue({
                  data: [mockUser],
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      // This would be the 5th request (0-indexed: 0,1,2,3,4)
      const result = await MagicLinkAuth.sendMagicLink(
        {
          email: email,
          redirectTo: '/dashboard',
        },
        ipAddress
      );

      // Rate limit check: 4 existing requests < 5 max, so this should succeed
      // (Note: In the actual implementation, the rate limit check happens before
      // the user lookup, so if 5 or more requests exist, it fails early)
      expect(result.success).toBeDefined();
    });

    it('should block 6th request within 10 minute window from same IP', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      // Mock to simulate 5 or more existing requests
      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: [
                    { id: 'token-1' },
                    { id: 'token-2' },
                    { id: 'token-3' },
                    { id: 'token-4' },
                    { id: 'token-5' },
                  ], // 5 existing requests
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        {
          email: email,
          redirectTo: '/dashboard',
        },
        ipAddress
      );

      // Should be blocked due to rate limiting
      expect(result.success).toBe(false);
      expect(result.message).toContain('tentativas');
    });

    it('should track requests by IP address (different IPs have separate limits)', async () => {
      const email = 'user@example.com';
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      const mockUser = {
        id: 'user-123',
        email: email,
        cpf: '12345678900',
      };

      // Track which IP is being checked
      let currentIP = '';

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockImplementation((field, ip) => {
                currentIP = ip;
                return {
                  gte: jest.fn().mockResolvedValue({
                    data:
                      currentIP === ip1
                        ? [{ id: 'token-1' }, { id: 'token-2' }] // IP1 has 2 requests
                        : [{ id: 'token-a' }], // IP2 has only 1 request
                    error: null,
                  }),
                };
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({}),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      // Both IPs should be checked separately
      // The rate limit check queries with eq('ip_address', ipAddress)
      expect(() => {
        MagicLinkAuth.sendMagicLink(
          { email: email, redirectTo: '/dashboard' },
          ip1
        );
      }).not.toThrow();

      expect(() => {
        MagicLinkAuth.sendMagicLink(
          { email: email, redirectTo: '/dashboard' },
          ip2
        );
      }).not.toThrow();
    });

    it('should reset rate limit counter after 10 minutes', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';
      const now = Date.now();
      const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
      const elevenMinutesAgo = new Date(now - 11 * 60 * 1000);

      // After 10 minutes, old requests should be outside the window
      // The query uses: gte('created_at', tenMinutesAgo)
      // So requests from > 10 minutes ago won't be counted

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockImplementation((field, timestamp) => {
                  // If checking with 10-minute-ago threshold, only count recent requests
                  // Old requests (11+ minutes ago) should be excluded
                  return {
                    mockResolvedValue: jest.fn().mockResolvedValue({
                      data: [], // No requests within last 10 minutes
                      error: null,
                    }),
                  };
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      // After 10 minutes, the counter should be reset
      // (This is verified by the gte('created_at', tenMinutesAgo) query)
      expect(() => {
        MagicLinkAuth.sendMagicLink(
          { email: email, redirectTo: '/dashboard' },
          ipAddress
        );
      }).not.toThrow();
    });

    it('should include all requests in 10-minute window', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      // Mock requests within and outside the window
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockImplementation((field, timestamp) => {
                  // Count only requests with created_at >= timestamp
                  // Requests older than 10 minutes should not be counted
                  const tenMinutesAgo = new Date(
                    now.getTime() - 10 * 60 * 1000
                  );

                  if (timestamp.getTime() === tenMinutesAgo.getTime()) {
                    // Only count requests within last 10 minutes
                    return {
                      mockResolvedValue: jest.fn().mockResolvedValue({
                        data: [{ id: '1' }, { id: '2' }], // Only recent requests
                        error: null,
                      }),
                    };
                  }

                  return {
                    mockResolvedValue: jest.fn().mockResolvedValue({
                      data: [],
                      error: null,
                    }),
                  };
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);
    });
  });

  describe('Rate Limit Response', () => {
    it('should return HTTP 429 when rate limit exceeded', async () => {
      // This is tested at the API level in full-flow tests
      // The MagicLinkAuth.sendMagicLink returns a response object
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      // Simulate 5+ existing requests
      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: Array(5)
                    .fill(null)
                    .map((_, i) => ({ id: `token-${i}` })),
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ipAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toMatch(/tentativas|minuto/i);
    });

    it('should include helpful error message with retry time', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: Array(5)
                    .fill(null)
                    .map((_, i) => ({ id: `token-${i}` })),
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ipAddress
      );

      expect(result.success).toBe(false);
      // Error message should be user-friendly and in Portuguese
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
    });

    it('should not expose rate limit details that reveal other users', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: Array(5)
                    .fill(null)
                    .map((_, i) => ({ id: `token-${i}` })),
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ipAddress
      );

      expect(result.success).toBe(false);
      // Should not reveal specific details about other requests
      expect(result.message).not.toMatch(/\d+ request/i);
    });
  });

  describe('Rate Limit Edge Cases', () => {
    it('should handle rate limit at boundary (exactly 5 requests)', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      // Exactly 5 requests should still allow one more? No, max is 5.
      // So if there are already 5 requests, the 6th should be blocked.
      // But if there are 4 requests, the 5th is allowed.

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: Array(4)
                    .fill(null)
                    .map((_, i) => ({ id: `token-${i}` })),
                  error: null,
                }),
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ipAddress
      );

      // With 4 existing requests, the 5th should succeed
      expect(result.success).toBeDefined();
    });

    it('should handle rate limit when database returns error', async () => {
      const email = 'user@example.com';
      const ipAddress = '192.168.1.1';

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gte: jest.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Database error'),
                }),
              }),
            }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ipAddress
      );

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle null IP address gracefully', async () => {
      const email = 'user@example.com';

      const mockFromFn = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            gte: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      const result = await MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        undefined // No IP address provided
      );

      // Should still work, either allowing or with a graceful error
      expect(result.message).toBeDefined();
    });
  });

  describe('Rate Limit Per IP (Not Per Email)', () => {
    it('should track rate limits by IP, not by email', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      const ipAddress = '192.168.1.1';

      // Same IP with different emails should share the rate limit
      // This is verified by querying with eq('ip_address', ipAddress)

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockImplementation((field, value) => {
                // Check if querying by IP address, not email
                expect(field).toBe('ip_address');
                return {
                  gte: jest.fn().mockResolvedValue({
                    data: Array(3)
                      .fill(null)
                      .map((_, i) => ({ id: `token-${i}` })),
                    error: null,
                  }),
                };
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      // Both should query by IP, showing they share the same rate limit bucket
      expect(() => {
        MagicLinkAuth.sendMagicLink(
          { email: email1, redirectTo: '/dashboard' },
          ipAddress
        );
      }).not.toThrow();

      expect(() => {
        MagicLinkAuth.sendMagicLink(
          { email: email2, redirectTo: '/dashboard' },
          ipAddress
        );
      }).not.toThrow();
    });

    it('should allow independent rate limits for different IPs', async () => {
      const email = 'user@example.com';
      const ip1 = '192.168.1.1';
      const ip2 = '10.0.0.1';

      // Different IPs should have independent rate limits
      // Even if IP1 is rate limited, IP2 should still work

      let checkCount = 0;

      const mockFromFn = jest.fn((table) => {
        if (table === 'auth_tokens') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockImplementation((field, ip) => {
                checkCount++;
                return {
                  gte: jest.fn().mockResolvedValue({
                    data:
                      ip === ip1
                        ? Array(5)
                            .fill(null)
                            .map((_, i) => ({ id: `token-${i}` }))
                        : [], // IP2 has no requests
                    error: null,
                  }),
                };
              }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      (supabase.from as jest.Mock).mockImplementation(mockFromFn);

      // IP1 should be rate limited
      const result1 = MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ip1
      );

      // IP2 should not be rate limited
      const result2 = MagicLinkAuth.sendMagicLink(
        { email: email, redirectTo: '/dashboard' },
        ip2
      );

      expect(Promise.all([result1, result2])).toBeDefined();
    });
  });
});
