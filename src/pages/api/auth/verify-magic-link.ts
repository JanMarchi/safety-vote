// API para verificação de Magic Links
// Endpoint para validar tokens e criar sessões

import type { NextApiRequest, NextApiResponse } from 'next';
import { MagicLinkAuth, getClientIP } from '../../../lib/auth/magic-link';
import { AuditSystem } from '../../../lib/audit/audit-system';

interface VerifyMagicLinkRequest {
  token: string;
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
  session_token?: string;
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
    const { token }: VerifyMagicLinkRequest = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Validações básicas
    if (!token || typeof token !== 'string') {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Tentativa de verificação sem token',
        metadata: {
          user_agent: userAgent,
          body: req.body
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório'
      });
    }

    // Validar formato do token (deve ser hexadecimal de 64 caracteres)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        ip_address: clientIP,
        description: 'Token com formato inválido',
        metadata: {
          token_length: token.length,
          user_agent: userAgent
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Log da tentativa de verificação
    await AuditSystem.logAction({
      action: 'MAGIC_LINK_VERIFY_ATTEMPT',
      table_name: 'auth_tokens',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        token_provided: true,
        token_length: token.length
      }
    });

    // Verificar magic link
    const result = await MagicLinkAuth.verifyMagicLink(token, clientIP);

    if (result.success && result.user) {
      // Log de sucesso
      await AuditSystem.logAction({
        user_id: result.user.id,
        action: 'LOGIN_SUCCESS',
        table_name: 'users',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          login_method: 'magic_link',
          user_role: result.user.role,
          company_id: result.user.company_id
        }
      });

      // Log de evento de segurança
      await AuditSystem.logSecurityEvent({
        type: 'login_attempt',
        severity: 'low',
        user_id: result.user.id,
        ip_address: clientIP,
        description: 'Login realizado com sucesso via magic link',
        metadata: {
          user_name: result.user.name,
          user_email: result.user.email,
          user_role: result.user.role,
          user_agent: userAgent
        }
      });

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
        },
        session_token: result.token
      });

    } else {
      // Log de falha
      await AuditSystem.logAction({
        action: 'LOGIN_FAILED',
        table_name: 'auth_tokens',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          login_method: 'magic_link',
          error: result.message,
          token_provided: true
        }
      });

      // Log de evento de segurança
      await AuditSystem.logSecurityEvent({
        type: 'failed_login',
        severity: 'medium',
        ip_address: clientIP,
        description: `Falha na verificação do magic link: ${result.message}`,
        metadata: {
          error: result.error,
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
    console.error('Erro na API de verificação:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: getClientIP(req),
      description: 'Erro interno na API de verificação de magic link',
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