// API para envio de Magic Links
// Endpoint seguro com rate limiting e validações

import type { NextApiRequest, NextApiResponse } from 'next';
import { MagicLinkAuth, getClientIP, createRateLimiter } from '../../../lib/auth/magic-link';
import { AuditSystem } from '../../../lib/audit/audit-system';

interface SendMagicLinkRequest {
  email: string;
  cpf?: string;
  redirectTo?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  token?: string; // Apenas em desenvolvimento
}

// Rate limiter: máximo 5 tentativas por IP por hora
const rateLimiter = createRateLimiter(60 * 60 * 1000, 5);

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
    // Aplicar rate limiting
    await new Promise<void>((resolve, reject) => {
      rateLimiter(req, res, (error?: any) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const { email, cpf, redirectTo }: SendMagicLinkRequest = req.body;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Validações básicas
    if (!email || typeof email !== 'string') {
      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'low',
        ip_address: clientIP,
        description: 'Tentativa de envio de magic link sem email',
        metadata: {
          user_agent: userAgent,
          body: req.body
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validar CPF se fornecido
    if (cpf && typeof cpf === 'string') {
      const cleanCPF = cpf.replace(/\D/g, '');
      if (cleanCPF.length !== 11) {
        return res.status(400).json({
          success: false,
          message: 'CPF deve ter 11 dígitos'
        });
      }
    }

    // Log da tentativa
    await AuditSystem.logAction({
      action: 'MAGIC_LINK_REQUEST',
      table_name: 'auth_tokens',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        email: email,
        has_cpf: !!cpf,
        redirect_to: redirectTo
      }
    });

    // Enviar magic link
    const result = await MagicLinkAuth.sendMagicLink({
      email: email.toLowerCase().trim(),
      cpf: cpf?.replace(/\D/g, ''),
      redirectTo: redirectTo || '/dashboard'
    }, clientIP);

    // Log do resultado
    if (result.success) {
      await AuditSystem.logAction({
        action: 'MAGIC_LINK_SENT',
        table_name: 'auth_tokens',
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: {
          email: email,
          success: true
        }
      });
    } else {
      await AuditSystem.logSecurityEvent({
        type: 'failed_login',
        severity: 'medium',
        ip_address: clientIP,
        description: `Falha ao enviar magic link: ${result.message}`,
        metadata: {
          email: email,
          error: result.error,
          user_agent: userAgent
        }
      });
    }

    // Retornar resposta (sem expor informações sensíveis)
    const response: ApiResponse = {
      success: result.success,
      message: result.message
    };

    // Em desenvolvimento, incluir token para testes
    if (process.env.NODE_ENV === 'development' && result.token) {
      response.token = result.token;
    }

    return res.status(result.success ? 200 : 400).json(response);

  } catch (error) {
    console.error('Erro na API de magic link:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: getClientIP(req),
      description: 'Erro interno na API de magic link',
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

// Configuração para aumentar o limite de payload se necessário
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};