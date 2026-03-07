/**
 * Session Validation Middleware
 *
 * Applied to all protected routes to:
 * 1. Extract access token from Authorization header
 * 2. Verify JWT signature and expiration
 * 3. Load session from database
 * 4. Verify session is active and not revoked
 * 5. Verify device fingerprint matches
 * 6. Update session last_activity (sliding window)
 * 7. Inject user context into request
 *
 * If any check fails, returns 401 Unauthorized
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from '../lib/session/token-handler';
import { validateSession, extendSession } from '../lib/session/session-manager';
import {
  generateDeviceFingerprint,
  extractDeviceInfo,
  compareFingerprints
} from '../lib/session/device-fingerprint';

export interface SessionContext {
  userId: string;
  sessionId: string;
  companyId: string;
  email: string;
  role: string;
  deviceFingerprint: string;
}

/**
 * Extract and validate session from request
 *
 * @param request - Next.js request object
 * @returns SessionContext if valid, null if invalid
 */
export async function validateRequestSession(
  request: NextRequest
): Promise<SessionContext | null> {
  try {
    // Step 1: Extract Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.warn('Missing Authorization header');
      return null;
    }

    // Step 2: Extract token from "Bearer <token>" format
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      console.warn('Invalid Authorization header format');
      return null;
    }

    const accessToken = tokenMatch[1];

    // Step 3: Verify JWT signature and expiration
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      console.warn('Invalid or expired access token');
      return null;
    }

    // Step 4: Load and validate session from database
    const session = await validateSession(payload.session_id, payload.company_id);
    if (!session) {
      console.warn(`Session ${payload.session_id} not found or inactive`);
      return null;
    }

    // Step 5: Verify device fingerprint matches
    if (payload.device_fingerprint && session.device_fingerprint) {
      // Generate current device fingerprint
      const deviceInfo = extractDeviceInfo(
        Object.fromEntries(request.headers.entries())
      );
      const currentFingerprint = generateDeviceFingerprint(
        deviceInfo.ipAddress,
        deviceInfo.userAgent
      );

      // Compare fingerprints using constant-time comparison
      if (!compareFingerprints(currentFingerprint, payload.device_fingerprint)) {
        console.warn('Device fingerprint mismatch - potential session hijacking');
        return null;
      }
    }

    // Step 6: Update session last_activity (sliding window expiration)
    const extendSuccess = await extendSession(payload.session_id, payload.company_id);
    if (!extendSuccess) {
      console.error('Failed to extend session activity');
      // Don't fail the request, just log the error
      // Session will eventually expire naturally
    }

    // Step 7: Return validated session context
    const context: SessionContext = {
      userId: payload.sub,
      sessionId: payload.session_id,
      companyId: payload.company_id,
      email: payload.email,
      role: payload.role,
      deviceFingerprint: payload.device_fingerprint || ''
    };

    return context;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Protected route wrapper
 *
 * Use this to wrap API route handlers that require authentication.
 *
 * Example:
 * ```typescript
 * export const GET = protectedRoute(async (req, { session }) => {
 *   return NextResponse.json({ userId: session.userId });
 * });
 * ```
 *
 * @param handler - API route handler
 * @returns Wrapped handler with session validation
 */
export function protectedRoute(
  handler: (
    request: NextRequest,
    context: { session: SessionContext }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    // Validate session
    const session = await validateRequestSession(request);

    if (!session) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'Authentication required or session expired'
        },
        { status: 401 }
      );
    }

    // Call handler with session context
    try {
      return await handler(request, { session });
    } catch (error) {
      console.error('Error in protected route handler:', error);
      return NextResponse.json(
        {
          error: 'internal_server_error',
          message: 'An error occurred processing your request'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract session context from request (non-throwing)
 *
 * Use in API routes that need optional authentication.
 *
 * @param request - Next.js request object
 * @returns SessionContext if valid, undefined if no valid session
 */
export async function getSessionContext(
  request: NextRequest
): Promise<SessionContext | undefined> {
  const session = await validateRequestSession(request);
  return session || undefined;
}

/**
 * Create session context from JWT payload
 *
 * Useful for server-side operations where you have a payload
 * but haven't validated the full session yet.
 *
 * @param payload - JWT payload
 * @param companyId - Company ID for validation
 * @returns SessionContext
 */
export function createSessionContext(
  payload: JWTPayload,
  companyId: string
): SessionContext {
  return {
    userId: payload.sub,
    sessionId: payload.session_id,
    companyId,
    email: payload.email,
    role: payload.role,
    deviceFingerprint: payload.device_fingerprint || ''
  };
}
