// API para exportação de logs de auditoria
// Endpoint para exportar logs em diferentes formatos

import type { NextApiRequest, NextApiResponse } from 'next';
import { AuditSystem } from '../../../lib/audit/audit-system';
import { MagicLinkAuth, getClientIP } from '../../../lib/auth/magic-link';

interface ExportRequest {
  session_token: string;
  format: 'json' | 'csv' | 'pdf';
  report_type: 'general' | 'security' | 'votes' | 'users' | 'elections';
  start_date?: string;
  end_date?: string;
  user_id?: string;
  company_id?: string;
  action_type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
      format,
      report_type,
      start_date,
      end_date,
      user_id,
      company_id,
      action_type,
      severity
    }: ExportRequest = req.body;

    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Validações básicas
    if (!session_token || typeof session_token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token de sessão é obrigatório'
      });
    }

    if (!format || !['json', 'csv', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de exportação inválido'
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

    // Verificar permissões - apenas admins e RH podem exportar
    if (user.role !== 'admin' && user.role !== 'rh') {
      await AuditSystem.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        user_id: user.id,
        ip_address: clientIP,
        description: 'Tentativa de exportação não autorizada de logs de auditoria',
        metadata: {
          user_role: user.role,
          requested_format: format,
          requested_report: report_type,
          user_agent: userAgent
        }
      });

      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores e RH podem exportar logs.'
      });
    }

    // Log da solicitação de exportação
    await AuditSystem.logAction({
      user_id: user.id,
      action: 'AUDIT_EXPORT_REQUEST',
      table_name: 'audit_logs',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        format,
        report_type,
        start_date,
        end_date,
        user_role: user.role,
        company_id: user.company_id
      }
    });

    // Preparar filtros para exportação
    const filters = {
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      user_id,
      company_id: user.role === 'admin' ? company_id : user.company_id,
      action_type,
      severity,
      report_type
    };

    // Exportar logs
    const exportResult = await AuditSystem.exportLogs(format, filters);

    if (!exportResult.success) {
      return res.status(500).json({
        success: false,
        message: exportResult.message || 'Erro na exportação'
      });
    }

    // Configurar headers para download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit-${report_type}-${timestamp}.${format}`;

    // Definir content-type baseado no formato
    let contentType: string;
    switch (format) {
      case 'json':
        contentType = 'application/json';
        break;
      case 'csv':
        contentType = 'text/csv';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Configurar headers de resposta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Log de sucesso
    await AuditSystem.logAction({
      user_id: user.id,
      action: 'AUDIT_EXPORT_SUCCESS',
      table_name: 'audit_logs',
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: {
        format,
        report_type,
        filename,
        file_size: exportResult.data ? exportResult.data.length : 0,
        user_role: user.role
      }
    });

    // Enviar arquivo
    return res.status(200).send(exportResult.data);

  } catch (error) {
    console.error('Erro na exportação:', error);

    // Log do erro
    await AuditSystem.logSecurityEvent({
      type: 'suspicious_activity',
      severity: 'high',
      ip_address: getClientIP(req),
      description: 'Erro interno na API de exportação de auditoria',
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
      sizeLimit: '10mb', // Exportações podem ser grandes
    },
    responseLimit: '50mb', // Permitir respostas grandes para arquivos
  },
};