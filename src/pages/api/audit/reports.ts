// API para relatórios de auditoria
// Endpoint para gerar e consultar relatórios de auditoria

import type { NextApiRequest, NextApiResponse } from 'next';
import { AuditSystem } from '../../../lib/audit/audit-system';
import { MagicLinkAuth, getClientIP } from '../../../lib/auth/magic-link';

interface AuditReportRequest {
  session_token: string;
  report_type: 'general' | 'security' | 'votes' | 'users' | 'elections';
  start_date?: string;
  end_date?: string;
  user_id?: string;
  company_id?: string;
  action_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number;
  offset?: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  total_count?: number;
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
    const {
      session_token,
      report_type,
      start_date,
      end_date,
      user_id,
      company_id,
      action_type,
      severity,
      limit = 100,
      offset = 0
    }: AuditReportRequest = req.body;

    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Validações básicas
    if (!session_token || typeof session_token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token de sessão é obrigatório'
      });
    }

    if (!report_type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de relatório é obrigatório'
      });
    }

    // Validar sessão
    const sessionResult = await MagicLinkAuth.validateSession(session_token);
    
    if (!sessionResult.success || !sessionResult.user) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida'
      });
    }

    const user = sessionResult.user;

    // Verificar permissões - apenas admins e RH podem acessar relatórios
    if (user.role !== 'admin' && user.role !== 'rh') {
      await AuditSystem.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        user_id: user.id,
        ip_address: clientIP,
        description: 'Tentativa de acesso não autorizado aos relatórios de auditoria',
        metadata: {
          user_role: user.role,
          requested_report: report_type,
          user_agent: userAgent
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores e RH podem acessar relatórios de auditoria.'
      });
    }

    // Log da solicitação de relatório
    await AuditSystem.logAction({
      user_id: user.id,
      action: 'AUDIT_REPORT_REQUEST',
      table_name: 'audit_logs',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        report_type,
        start_date,
        end_date,
        user_role: user.role,
        company_id: user.company_id
      }
    });

    let reportData;
    let totalCount = 0;

    // Gerar relatório baseado no tipo
    switch (report_type) {
      case 'general':
        reportData = await AuditSystem.generateAuditReport({
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          user_id,
          company_id: user.role === 'admin' ? company_id : user.company_id,
          action_type,
          limit,
          offset
        });
        break;

      case 'security':
        const securityFilters = {
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          user_id,
          company_id: user.role === 'admin' ? company_id : user.company_id,
          severity,
          limit,
          offset
        };
        
        reportData = await AuditSystem.searchAuditLogs({
          ...securityFilters,
          event_type: 'security'
        });
        break;

      case 'votes':
        reportData = await AuditSystem.searchAuditLogs({
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          user_id,
          company_id: user.role === 'admin' ? company_id : user.company_id,
          table_name: 'votes',
          limit,
          offset
        });
        break;

      case 'users':
        reportData = await AuditSystem.searchAuditLogs({
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          user_id,
          company_id: user.role === 'admin' ? company_id : user.company_id,
          table_name: 'users',
          limit,
          offset
        });
        break;

      case 'elections':
        reportData = await AuditSystem.searchAuditLogs({
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          user_id,
          company_id: user.role === 'admin' ? company_id : user.company_id,
          table_name: 'elections',
          limit,
          offset
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de relatório inválido'
        });
    }

    // Log de sucesso
    await AuditSystem.logAction({
      user_id: user.id,
      action: 'AUDIT_REPORT_GENERATED',
      table_name: 'audit_logs',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        report_type,
        records_returned: Array.isArray(reportData) ? reportData.length : 0,
        user_role: user.role
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Relatório gerado com sucesso',
      data: reportData,
      total_count: totalCount
    });

  } catch (error) {
    console.error('Erro na geração de relatório:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: getClientIP(req),
      description: 'Erro interno na API de relatórios de auditoria',
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
      sizeLimit: '5mb', // Relatórios podem ser maiores
    },
  },
};