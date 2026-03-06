// API para validação de sessões
// Endpoint para verificar se uma sessão é válida

import type { NextApiRequest, NextApiResponse } from 'next';
import { MagicLinkAuth, getClientIP } from '../../../lib/auth/magic-link';
import { AuditSystem } from '../../../lib/audit/audit-system';

interface ValidateSessionRequest {
  session_token: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company_id: string;
    email_verified: boolean;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas métodos POST são permitidos
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
  }

  try {
    const { session_token }: ValidateSessionRequest = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Validações básicas
    if (!session_token || typeof session_token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token de sessão é obrigatório'
      });
    }

    // Validar formato do token
    if (!/^[a-f0-9]{64}$/i.test(session_token)) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Token de sessão com formato inválido',
        metadata: {
          token_length: session_token.length,
          user_agent: userAgent
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Token de sessão inválido'
      });
    }

    // Validar sessão
    const result = await MagicLinkAuth.validateSession(session_token);

    if (result.success && result.user) {
      // Log de validação bem-sucedida (apenas em debug)
      if (process.env.NODE_ENV === 'development') {
        await AuditSystem.logAction({
          user_id: result.user.id,
          action: 'SESSION_VALIDATED',
          table_name: 'user_sessions',
          ip_address: clientIP,
          user_agent: userAgent,
          metadata: {
            user_role: result.user.role,
            company_id: result.user.company_id
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          company_id: result.user.company_id,
          email_verified: result.user.email_verified
        }
      });

    } else {
      // Log de sessão inválida
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'low',
        ip_address: clientIP,
        description: 'Tentativa de acesso com sessão inválida',
        metadata: {
          error: result.message,
          user_agent: userAgent
        }
      });

      return res.status(401).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Erro na validação de sessão:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: getClientIP(req),
      description: 'Erro interno na validação de sessão',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        user_agent: req.headers['user-agent']
      }
    });

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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