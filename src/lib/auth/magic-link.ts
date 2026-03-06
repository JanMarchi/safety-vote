// Sistema de Autenticação com Magic Links
// Implementação segura para Safety Vote

import { supabase } from '../supabase';
import crypto from 'crypto';

export interface MagicLinkOptions {
  email: string;
  cpf?: string;
  redirectTo?: string;
  type?: 'magic_link' | 'email_verification' | 'password_reset';
}

export interface AuthToken {
  id: string;
  user_id: string;
  token_hash: string;
  token_type: string;
  expires_at: string;
  used_at?: string;
  ip_address?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  error?: string;
}

// Classe principal para gerenciar autenticação com magic links
export class MagicLinkAuth {
  private static readonly TOKEN_EXPIRY_MINUTES = 15;
  private static readonly MAX_ATTEMPTS_PER_HOUR = 5;
  
  /**
   * Gera um token seguro para magic link
   */
  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Gera hash do token para armazenamento seguro
   */
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Valida formato de CPF
   */
  private static validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/[^0-9]/g, '');
    
    if (cleanCPF.length !== 11) return false;
    
    // Verifica sequências inválidas
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    
    return parseInt(cleanCPF[9]) === digit1 && parseInt(cleanCPF[10]) === digit2;
  }

  /**
   * Verifica limite de tentativas por IP
   */
  private static async checkRateLimit(ipAddress: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('auth_tokens')
      .select('id')
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo);
    
    if (error) {
      console.error('Erro ao verificar rate limit:', error);
      return false;
    }
    
    return (data?.length || 0) < this.MAX_ATTEMPTS_PER_HOUR;
  }

  /**
   * Envia magic link por email
   */
  public static async sendMagicLink(options: MagicLinkOptions, ipAddress?: string): Promise<AuthResponse> {
    try {
      const { email, cpf, redirectTo = '/dashboard', type = 'magic_link' } = options;
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Email inválido'
        };
      }
      
      // Validar CPF se fornecido
      if (cpf && !this.validateCPF(cpf)) {
        return {
          success: false,
          message: 'CPF inválido'
        };
      }
      
      // Verificar rate limit
      if (ipAddress && !(await this.checkRateLimit(ipAddress))) {
        return {
          success: false,
          message: 'Muitas tentativas. Tente novamente em 1 hora.'
        };
      }
      
      // Buscar usuário
      let userQuery = supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      if (cpf) {
        userQuery = userQuery.eq('cpf', cpf.replace(/[^0-9]/g, ''));
      }
      
      const { data: users, error: userError } = await userQuery;
      
      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }
      
      if (!users || users.length === 0) {
        return {
          success: false,
          message: 'Usuário não encontrado'
        };
      }
      
      const user = users[0];
      
      // Gerar token
      const token = this.generateSecureToken();
      const tokenHash = this.hashToken(token);
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);
      
      // Salvar token no banco
      const { error: tokenError } = await supabase
        .from('auth_tokens')
        .insert({
          user_id: user.id,
          token_hash: tokenHash,
          token_type: type,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress
        });
      
      if (tokenError) {
        console.error('Erro ao salvar token:', tokenError);
        return {
          success: false,
          message: 'Erro interno do servidor'
        };
      }
      
      // Construir URL do magic link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const magicLinkUrl = `${baseUrl}/auth/verify?token=${token}&redirect=${encodeURIComponent(redirectTo)}`;
      
      // Enviar email (integração com serviço de email)
      await this.sendEmail({
        to: email,
        subject: 'Acesso ao Safety Vote',
        html: this.generateEmailTemplate(user.name, magicLinkUrl, this.TOKEN_EXPIRY_MINUTES)
      });
      
      return {
        success: true,
        message: 'Link de acesso enviado para seu email',
        token: token // Retornar apenas em desenvolvimento
      };
      
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verifica e consome magic link
   */
  public static async verifyMagicLink(token: string, ipAddress?: string): Promise<AuthResponse> {
    try {
      const tokenHash = this.hashToken(token);
      
      // Buscar token no banco
      const { data: tokens, error: tokenError } = await supabase
        .from('auth_tokens')
        .select(`
          *,
          users (
            id,
            name,
            email,
            role,
            company_id,
            email_verified
          )
        `)
        .eq('token_hash', tokenHash)
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (tokenError || !tokens) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      }
      
      const authToken = tokens as AuthToken & { users: any };
      
      // Marcar token como usado
      const { error: updateError } = await supabase
        .from('auth_tokens')
        .update({
          used_at: new Date().toISOString(),
          ip_address: ipAddress
        })
        .eq('id', authToken.id);
      
      if (updateError) {
        console.error('Erro ao marcar token como usado:', updateError);
      }
      
      // Marcar email como verificado se necessário
      if (!authToken.users.email_verified) {
        await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('id', authToken.users.id);
      }
      
      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authToken.users.id);
      
      // Criar sessão
      const sessionToken = this.generateSecureToken();
      const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      
      await supabase
        .from('user_sessions')
        .insert({
          user_id: authToken.users.id,
          session_token: sessionToken,
          ip_address: ipAddress,
          expires_at: sessionExpiry.toISOString()
        });
      
      return {
        success: true,
        message: 'Autenticação realizada com sucesso',
        user: authToken.users,
        token: sessionToken
      };
      
    } catch (error) {
      console.error('Erro ao verificar magic link:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Valida sessão do usuário
   */
  public static async validateSession(sessionToken: string): Promise<AuthResponse> {
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          users (
            id,
            name,
            email,
            role,
            company_id,
            email_verified
          )
        `)
        .eq('session_token', sessionToken)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (error || !sessions) {
        return {
          success: false,
          message: 'Sessão inválida ou expirada'
        };
      }
      
      // Atualizar última atividade
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessions.id);
      
      return {
        success: true,
        message: 'Sessão válida',
        user: sessions.users
      };
      
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Encerra sessão do usuário
   */
  public static async logout(sessionToken: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      if (error) {
        console.error('Erro ao encerrar sessão:', error);
        return {
          success: false,
          message: 'Erro ao encerrar sessão'
        };
      }
      
      return {
        success: true,
        message: 'Sessão encerrada com sucesso'
      };
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Limpa tokens e sessões expirados
   */
  public static async cleanupExpired(): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Limpar tokens expirados
      await supabase
        .from('auth_tokens')
        .delete()
        .lt('expires_at', now);
      
      // Limpar sessões expiradas
      await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', now);
      
    } catch (error) {
      console.error('Erro ao limpar dados expirados:', error);
    }
  }

  /**
   * Envia email (implementação básica - integrar com serviço real)
   */
  private static async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    // TODO: Integrar com serviço de email real (SendGrid, AWS SES, etc.)
    console.log('Enviando email para:', options.to);
    console.log('Assunto:', options.subject);
    console.log('Conteúdo:', options.html);
  }

  /**
   * Gera template do email
   */
  private static generateEmailTemplate(userName: string, magicLinkUrl: string, expiryMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Acesso ao Safety Vote</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Safety Vote</h1>
          </div>
          <div class="content">
            <h2>Olá, ${userName}!</h2>
            <p>Você solicitou acesso ao sistema Safety Vote. Clique no botão abaixo para fazer login:</p>
            
            <a href="${magicLinkUrl}" class="button">Acessar Sistema</a>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este link expira em ${expiryMinutes} minutos</li>
                <li>Use apenas se você solicitou este acesso</li>
                <li>Não compartilhe este link com outras pessoas</li>
              </ul>
            </div>
            
            <p>Se você não solicitou este acesso, ignore este email.</p>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${magicLinkUrl}
            </p>
          </div>
          <div class="footer">
            <p>Safety Vote - Sistema Seguro de Votação</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Função utilitária para obter IP do cliente
export function getClientIP(req: any): string {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
}

// Middleware para rate limiting
export function createRateLimiter(windowMs: number = 60000, max: number = 5) {
  const requests = new Map();
  
  return (req: any, res: any, next: any) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpar requests antigos
    const userRequests = requests.get(ip) || [];
    const validRequests = userRequests.filter((time: number) => time > windowStart);
    
    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente mais tarde.'
      });
    }
    
    validRequests.push(now);
    requests.set(ip, validRequests);
    
    next();
  };
}