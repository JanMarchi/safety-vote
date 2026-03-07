/**
 * POST /api/auth/logout
 *
 * Logout user and revoke session
 *
 * Request (with Authorization header):
 * Headers: Authorization: Bearer {access_token}
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "You have been logged out successfully"
 * }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { verifyAccessToken, hashToken } from '../../../lib/session/token-handler';
import { AuditSystem } from '../../../lib/audit/audit-system';
import { extractClientIP } from '../../../lib/session/device-fingerprint';

interface LogoutRequest {
  access_token?: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
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
    // Get access token from Authorization header
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Logout attempt without access token',
        metadata: {
          user_agent: userAgent,
          endpoint: '/api/auth/logout'
        }
      });

      return res.status(401).json({
        success: false,
        message: 'No active session found',
        error: 'not_authenticated'
      });
    }

    // Verify the access token
    const jwtPayload = verifyAccessToken(token);

    if (!jwtPayload) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Logout attempt with invalid access token',
        metadata: {
          user_agent: userAgent
        }
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
        error: 'invalid_token'
      });
    }

    const sessionId = jwtPayload.session_id;
    const userId = jwtPayload.sub;
    const companyId = jwtPayload.company_id;

    // Find and revoke the session
    const { data: sessionData, error: fetchError } = await supabase
      .from('user_sessions')
      .select('id, user_id, company_id, is_active')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !sessionData) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        user_id: userId,
        ip_address: clientIP,
        description: 'Logout attempt - session not found',
        metadata: {
          user_agent: userAgent,
          session_id: sessionId
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Session not found or already revoked',
        error: 'invalid_session'
      });
    }

    // Check if session is already revoked
    if (!sessionData.is_active) {
      return res.status(200).json({
        success: true,
        message: 'You have been logged out successfully'
      });
    }

    // Revoke the session
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        revoked_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error revoking session:', updateError);

      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        user_id: userId,
        ip_address: clientIP,
        description: 'Error revoking session during logout',
        metadata: {
          user_agent: userAgent,
          session_id: sessionId,
          error: updateError.message
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'internal_error'
      });
    }

    // Log successful logout
    await AuditSystem.logAction({
      user_id: userId,
      action: 'LOGOUT_SUCCESS',
      table_name: 'user_sessions',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        session_id: sessionId,
        company_id: companyId,
        logout_method: 'manual'
      }
    });

    // Log security event
    await AuditSystem.logSecurityEvent({
      type: 'logout',
      severity: 'low',
      user_id: userId,
      ip_address: clientIP,
      description: 'User logged out successfully',
      metadata: {
        user_agent: userAgent,
        session_id: sessionId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'You have been logged out successfully'
    });

  } catch (error) {
    console.error('Error in logout endpoint:', error);

    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: clientIP,
      description: 'Unexpected error in logout endpoint',
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

// Configuração da API
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};