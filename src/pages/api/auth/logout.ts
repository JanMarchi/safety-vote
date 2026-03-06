// API para logout
// Endpoint para encerrar sessões de usuários

import type { NextApiRequest, NextApiResponse } from 'next';
import { MagicLinkAuth, getClientIP } from '../../../lib/auth/magic-link';
import { AuditSystem } from '../../../lib/audit/audit-system';

interface LogoutRequest {
  session_token: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
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
    const { session_token }: LogoutRequest = req.body;
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
      return res.status(400).json({
        success: false,
        message: 'Token de sessão inválido'
      });
    }

    // Primeiro, validar a sessão para obter informações do usuário
    const sessionResult = await MagicLinkAuth.validateSession(session_token);
    
    let userId: string | undefined;
    if (sessionResult.success && sessionResult.user) {
      userId = sessionResult.user.id;
    }

    // Encerrar sessão
    const result = await MagicLinkAuth.endSession(session_token);

    if (result.success) {
      // Log de logout bem-sucedido
      await AuditSystem.logAction({
        user_id: userId,
        action: 'LOGOUT_SUCCESS',
        table_name: 'user_sessions',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          logout_method: 'manual',
          session_ended: true
        }
      });

      // Log de evento de segurança
      await AuditSystem.logSecurityEvent({
        type: 'logout',
        severity: 'low',
        user_id: userId,
        ip_address: clientIP,
        description: 'Logout realizado com sucesso',
        metadata: {
          logout_method: 'manual',
          user_agent: userAgent
        }
      });

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } else {
      // Log de falha no logout
      await AuditSystem.logAction({
        user_id: userId,
        action: 'LOGOUT_FAILED',
        table_name: 'user_sessions',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          error: result.message,
          logout_method: 'manual'
        }
      });

      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Erro no logout:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'medium',
      ip_address: getClientIP(req),
      description: 'Erro interno na API de logout',
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