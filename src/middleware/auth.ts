// Middleware de autenticação
// Sistema para proteger rotas e validar permissões

import type { NextApiRequest, NextApiResponse } from 'next';
import { MagicLinkAuth, getClientIP } from '../lib/auth/magic-link';
import { AuditSystem } from '../lib/audit/audit-system';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    company_id: string;
    email_verified: boolean;
  };
}

export interface AuthMiddlewareOptions {
  requiredRoles?: string[];
  requireEmailVerified?: boolean;
  logAccess?: boolean;
}

/**
 * Middleware de autenticação para APIs
 * Valida sessão e verifica permissões
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const clientIP = getClientIP(req);
      const userAgent = req.headers['user-agent'] || 'Unknown';
      
      // Extrair token da sessão
      let sessionToken: string | undefined;
      
      // Tentar obter token do header Authorization
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
      
      // Tentar obter token do body (para compatibilidade)
      if (!sessionToken && req.body && req.body.session_token) {
        sessionToken = req.body.session_token;
      }
      
      // Tentar obter token dos cookies
      if (!sessionToken && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'session_token') {
            sessionToken = value;
            break;
          }
        }
      }

      if (!sessionToken) {
        await AuditSystem.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'medium',
          ip_address: clientIP,
          description: 'Tentativa de acesso sem token de sessão',
          metadata: {
            endpoint: req.url,
            method: req.method,
            user_agent: userAgent
          }
        });

        return res.status(401).json({
          success: false,
          message: 'Token de autenticação necessário'
        });
      }

      // Validar sessão
      const sessionResult = await MagicLinkAuth.validateSession(sessionToken);
      
      if (!sessionResult.success || !sessionResult.user) {
        await AuditSystem.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'medium',
          ip_address: clientIP,
          description: 'Tentativa de acesso com sessão inválida',
          metadata: {
            endpoint: req.url,
            method: req.method,
            user_agent: userAgent,
            session_error: sessionResult.message
          }
        });

        return res.status(401).json({
          success: false,
          message: 'Sessão inválida ou expirada'
        });
      }

      const user = sessionResult.user;

      // Verificar se email está verificado (se necessário)
      if (options.requireEmailVerified && !user.email_verified) {
        await AuditSystem.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'low',
          user_id: user.id,
          ip_address: clientIP,
          description: 'Tentativa de acesso com email não verificado',
          metadata: {
            endpoint: req.url,
            method: req.method,
            user_agent: userAgent,
            user_email: user.email
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Email não verificado. Verifique seu email antes de continuar.'
        });
      }

      // Verificar roles necessárias
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!options.requiredRoles.includes(user.role)) {
          await AuditSystem.logSecurityEvent({
            type: 'unauthorized_access',
            severity: 'medium',
            user_id: user.id,
            ip_address: clientIP,
            description: 'Tentativa de acesso sem permissão adequada',
            metadata: {
              endpoint: req.url,
              method: req.method,
              user_agent: userAgent,
              user_role: user.role,
              required_roles: options.requiredRoles
            }
          });

          return res.status(403).json({
            success: false,
            message: 'Permissões insuficientes para acessar este recurso'
          });
        }
      }

      // Log de acesso (se habilitado)
      if (options.logAccess) {
        await AuditSystem.logAction({
          user_id: user.id,
          action: 'API_ACCESS',
          table_name: 'api_access',
          ip_address: clientIP,
          user_agent: userAgent,
          metadata: {
            endpoint: req.url,
            method: req.method,
            user_role: user.role,
            company_id: user.company_id
          }
        });
      }

      // Adicionar usuário ao request
      (req as AuthenticatedRequest).user = user;

      // Chamar handler original
      return await handler(req as AuthenticatedRequest, res);

    } catch (error) {
      console.error('Erro no middleware de autenticação:', error);

      await AuditSystem.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ip_address: getClientIP(req),
        description: 'Erro interno no middleware de autenticação',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: req.url,
          method: req.method,
          user_agent: req.headers['user-agent']
        }
      });

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
}

/**
 * Middleware específico para admins
 */
export function withAdminAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(handler, {
    requiredRoles: ['admin'],
    requireEmailVerified: true,
    logAccess: true
  });
}

/**
 * Middleware específico para RH
 */
export function withRHAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(handler, {
    requiredRoles: ['admin', 'rh'],
    requireEmailVerified: true,
    logAccess: true
  });
}

/**
 * Middleware específico para eleitores
 */
export function withEleitorAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(handler, {
    requiredRoles: ['admin', 'rh', 'eleitor'],
    requireEmailVerified: true,
    logAccess: false // Não logar acessos básicos de eleitores
  });
}

/**
 * Middleware básico (qualquer usuário autenticado)
 */
export function withBasicAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(handler, {
    requireEmailVerified: false,
    logAccess: false
  });
}