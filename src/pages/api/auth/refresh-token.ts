/**
 * POST /api/auth/refresh-token
 *
 * Refresh access token using refresh token
 *
 * Request:
 * {
 *   "refresh_token": "eyJ..."
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "access_token": "eyJ...",
 *   "access_token_expires_in": 900,
 *   "token_type": "Bearer"
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import {
  generateAccessToken,
  hashToken,
  validateRefreshToken,
  updateSessionActivity,
  TOKEN_EXPIRY
} from '../../../lib/session/token-handler';
import { AuditSystem } from '../../../lib/audit/audit-system';
import { extractClientIP } from '../../../lib/session/device-fingerprint';

interface RefreshTokenRequest {
  refresh_token: string;
}

interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  access_token_expires_in?: number;
  token_type?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefreshTokenResponse>
) {
  // Only POST requests allowed
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'only_post_allowed'
    });
  }

  const clientIP = extractClientIP(req.headers as Record<string, string | string[]>);
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const { refresh_token } = req.body as RefreshTokenRequest;

    // Validate input
    if (!refresh_token || typeof refresh_token !== 'string') {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Refresh token request with missing token',
        metadata: {
          user_agent: userAgent,
          endpoint: '/api/auth/refresh-token'
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'missing_refresh_token'
      });
    }

    // Validate token format (should be base64url)
    if (!isValidTokenFormat(refresh_token)) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Refresh token request with invalid token format',
        metadata: {
          user_agent: userAgent,
          token_length: refresh_token.length
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid token format',
        error: 'invalid_token_format'
      });
    }

    // Hash the refresh token to lookup in database
    const refreshTokenHash = hashToken(refresh_token);

    // Find the session by refresh token hash
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id, user_id, company_id, refresh_token_hash, expires_at, revoked_at, is_active, device_fingerprint')
      .eq('refresh_token_hash', refreshTokenHash)
      .single();

    if (sessionError || !sessionData) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Refresh token not found or invalid',
        metadata: {
          user_agent: userAgent,
          error: sessionError?.message
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        error: 'invalid_refresh_token'
      });
    }

    // Check if session is revoked
    if (!sessionData.is_active) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        user_id: sessionData.user_id,
        ip_address: clientIP,
        description: 'Attempt to refresh revoked session',
        metadata: {
          user_agent: userAgent,
          session_id: sessionData.id
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Session has been revoked',
        error: 'session_revoked'
      });
    }

    // Check if refresh token has expired
    const expiresAt = new Date(sessionData.expires_at);
    if (expiresAt < new Date()) {
      await AuditSystem.logSecurityEvent({
        type: 'token_expired',
        severity: 'low',
        user_id: sessionData.user_id,
        ip_address: clientIP,
        description: 'Refresh token has expired',
        metadata: {
          user_agent: userAgent,
          session_id: sessionData.id
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Refresh token has expired',
        error: 'refresh_token_expired'
      });
    }

    // Get user details for token generation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', sessionData.user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user for token refresh:', userError);

      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        user_id: sessionData.user_id,
        ip_address: clientIP,
        description: 'User not found during token refresh',
        metadata: {
          user_agent: userAgent,
          session_id: sessionData.id
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'internal_error'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(
      userData.id,
      sessionData.id,
      userData.email,
      sessionData.company_id,
      userData.role,
      sessionData.device_fingerprint || undefined
    );

    // Hash the new access token for storage
    const newAccessTokenHash = hashToken(newAccessToken);

    // Update session with new access token and refresh activity
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        access_token_hash: newAccessTokenHash,
        last_activity: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', sessionData.id)
      .is('revoked_at', null);

    if (updateError) {
      console.error('Error updating session:', updateError);

      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        user_id: sessionData.user_id,
        ip_address: clientIP,
        description: 'Error updating session during token refresh',
        metadata: {
          user_agent: userAgent,
          session_id: sessionData.id,
          error: updateError.message
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'internal_error'
      });
    }

    // Log successful token refresh
    await AuditSystem.logAction({
      user_id: userData.id,
      action: 'TOKEN_REFRESHED',
      table_name: 'user_sessions',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        session_id: sessionData.id,
        company_id: sessionData.company_id
      }
    });

    // Log security event
    await AuditSystem.logSecurityEvent({
      type: 'token_refreshed',
      severity: 'low',
      user_id: userData.id,
      ip_address: clientIP,
      description: 'Access token refreshed successfully',
      metadata: {
        user_agent: userAgent,
        session_id: sessionData.id
      }
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      access_token: newAccessToken,
      access_token_expires_in: TOKEN_EXPIRY.ACCESS_TOKEN,
      token_type: 'Bearer'
    });

  } catch (error) {
    console.error('Error in refresh-token endpoint:', error);

    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: clientIP,
      description: 'Unexpected error in refresh-token endpoint',
      metadata: {
        user_agent: userAgent,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'internal_error'
    });
  }
}

/**
 * Validate token format (base64url encoded)
 *
 * @param token - Token to validate
 * @returns true if format is valid
 */
function isValidTokenFormat(token: string): boolean {
  // Base64url tokens should match pattern: [A-Za-z0-9_-]+
  // Refresh tokens are typically 43+ characters
  return /^[A-Za-z0-9_-]{32,}$/.test(token);
}

// API configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};
