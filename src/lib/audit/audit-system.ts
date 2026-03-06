// Sistema de Auditoria Completo para Safety Vote
// Implementação com logs detalhados e rastreabilidade

import { supabase } from '../supabase';
import crypto from 'crypto';

export interface AuditLogEntry {
  id?: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

export interface VoteAuditEntry {
  id?: string;
  election_id: string;
  voter_id: string;
  candidate_id: string;
  vote_hash: string;
  encrypted_vote: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  verification_code: string;
}

export interface AuditReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_actions: number;
    unique_users: number;
    actions_by_type: Record<string, number>;
    actions_by_table: Record<string, number>;
  };
  details: AuditLogEntry[];
  votes?: {
    total_votes: number;
    elections: Record<string, number>;
    integrity_check: boolean;
  };
}

export interface SecurityEvent {
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  description: string;
  metadata?: Record<string, any>;
}

// Classe principal do sistema de auditoria
export class AuditSystem {
  private static readonly ENCRYPTION_KEY = process.env.AUDIT_ENCRYPTION_KEY || 'default-key-change-in-production';
  
  /**
   * Registra uma ação no log de auditoria
   */
  public static async logAction(entry: AuditLogEntry): Promise<boolean> {
    try {
      const auditEntry = {
        ...entry,
        created_at: new Date().toISOString(),
        metadata: {
          ...entry.metadata,
          timestamp: Date.now(),
          session_id: this.generateSessionId()
        }
      };
      
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);
      
      if (error) {
        console.error('Erro ao registrar log de auditoria:', error);
        return false;
      }
      
      // Log crítico também em arquivo local para backup
      if (this.isCriticalAction(entry.action)) {
        await this.logToFile(auditEntry);
      }
      
      return true;
    } catch (error) {
      console.error('Erro no sistema de auditoria:', error);
      return false;
    }
  }

  /**
   * Registra um voto com criptografia e hash para auditoria
   */
  public static async logVote(voteData: {
    election_id: string;
    voter_id: string;
    candidate_id: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<VoteAuditEntry | null> {
    try {
      const timestamp = new Date().toISOString();
      const verificationCode = this.generateVerificationCode();
      
      // Criar dados do voto para criptografia
      const votePayload = {
        election_id: voteData.election_id,
        candidate_id: voteData.candidate_id,
        voter_id: voteData.voter_id,
        timestamp,
        verification_code
      };
      
      // Criptografar voto
      const encryptedVote = this.encryptData(JSON.stringify(votePayload));
      
      // Gerar hash para verificação de integridade
      const voteHash = this.generateVoteHash(votePayload);
      
      const auditEntry: VoteAuditEntry = {
        election_id: voteData.election_id,
        voter_id: voteData.voter_id,
        candidate_id: voteData.candidate_id,
        vote_hash: voteHash,
        encrypted_vote: encryptedVote,
        timestamp,
        ip_address: voteData.ip_address,
        user_agent: voteData.user_agent,
        verification_code: verificationCode
      };
      
      // Registrar no log de auditoria
      await this.logAction({
        user_id: voteData.voter_id,
        action: 'VOTE_CAST',
        table_name: 'votes',
        ip_address: voteData.ip_address,
        user_agent: voteData.user_agent,
        metadata: {
          election_id: voteData.election_id,
          vote_hash: voteHash,
          verification_code: verificationCode
        }
      });
      
      return auditEntry;
    } catch (error) {
      console.error('Erro ao registrar voto na auditoria:', error);
      return null;
    }
  }

  /**
   * Verifica a integridade de um voto
   */
  public static async verifyVoteIntegrity(voteHash: string): Promise<boolean> {
    try {
      const { data: vote, error } = await supabase
        .from('votes')
        .select('*')
        .eq('vote_hash', voteHash)
        .single();
      
      if (error || !vote) {
        return false;
      }
      
      // Descriptografar voto
      const decryptedVote = this.decryptData(vote.encrypted_vote);
      const voteData = JSON.parse(decryptedVote);
      
      // Recalcular hash
      const calculatedHash = this.generateVoteHash(voteData);
      
      return calculatedHash === voteHash;
    } catch (error) {
      console.error('Erro ao verificar integridade do voto:', error);
      return false;
    }
  }

  /**
   * Gera relatório de auditoria para um período
   */
  public static async generateAuditReport(
    startDate: string,
    endDate: string,
    includeVotes: boolean = false
  ): Promise<AuditReport | null> {
    try {
      // Buscar logs de auditoria
      const { data: logs, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (logsError) {
        console.error('Erro ao buscar logs:', logsError);
        return null;
      }
      
      // Calcular estatísticas
      const uniqueUsers = new Set(logs?.map(log => log.user_id).filter(Boolean)).size;
      const actionsByType: Record<string, number> = {};
      const actionsByTable: Record<string, number> = {};
      
      logs?.forEach(log => {
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
        if (log.table_name) {
          actionsByTable[log.table_name] = (actionsByTable[log.table_name] || 0) + 1;
        }
      });
      
      const report: AuditReport = {
        period: {
          start: startDate,
          end: endDate
        },
        summary: {
          total_actions: logs?.length || 0,
          unique_users: uniqueUsers,
          actions_by_type: actionsByType,
          actions_by_table: actionsByTable
        },
        details: logs || []
      };
      
      // Incluir dados de votos se solicitado
      if (includeVotes) {
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('election_id')
          .gte('created_at', startDate)
          .lte('created_at', endDate);
        
        if (!votesError && votes) {
          const electionVotes: Record<string, number> = {};
          votes.forEach(vote => {
            electionVotes[vote.election_id] = (electionVotes[vote.election_id] || 0) + 1;
          });
          
          // Verificar integridade de uma amostra de votos
          const sampleVotes = votes.slice(0, Math.min(10, votes.length));
          let integrityCheck = true;
          
          for (const vote of sampleVotes) {
            const isValid = await this.verifyVoteIntegrity(vote.vote_hash);
            if (!isValid) {
              integrityCheck = false;
              break;
            }
          }
          
          report.votes = {
            total_votes: votes.length,
            elections: electionVotes,
            integrity_check: integrityCheck
          };
        }
      }
      
      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de auditoria:', error);
      return null;
    }
  }

  /**
   * Registra evento de segurança
   */
  public static async logSecurityEvent(event: SecurityEvent): Promise<boolean> {
    try {
      const securityLog = {
        user_id: event.user_id,
        action: `SECURITY_${event.type.toUpperCase()}`,
        table_name: 'security_events',
        ip_address: event.ip_address,
        metadata: {
          type: event.type,
          severity: event.severity,
          description: event.description,
          ...event.metadata
        }
      };
      
      await this.logAction(securityLog);
      
      // Alertas para eventos críticos
      if (event.severity === 'critical' || event.severity === 'high') {
        await this.sendSecurityAlert(event);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
      return false;
    }
  }

  /**
   * Busca logs de auditoria com filtros
   */
  public static async searchAuditLogs(filters: {
    user_id?: string;
    action?: string;
    table_name?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      
      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar logs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro na busca de logs:', error);
      return [];
    }
  }

  /**
   * Exporta logs de auditoria para arquivo
   */
  public static async exportAuditLogs(
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string | null> {
    try {
      const logs = await this.searchAuditLogs({
        start_date: startDate,
        end_date: endDate
      });
      
      if (format === 'csv') {
        return this.convertToCSV(logs);
      }
      
      return JSON.stringify(logs, null, 2);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      return null;
    }
  }

  // Métodos privados
  private static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private static generateVerificationCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  private static generateVoteHash(voteData: Record<string, unknown>): string {
    const dataString = JSON.stringify(voteData, Object.keys(voteData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  private static encryptData(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private static decryptData(encryptedData: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private static isCriticalAction(action: string): boolean {
    const criticalActions = [
      'VOTE_CAST',
      'ELECTION_CREATE',
      'ELECTION_START',
      'ELECTION_END',
      'USER_DELETE',
      'COMPANY_DELETE',
      'SECURITY_DATA_BREACH',
      'SECURITY_UNAUTHORIZED_ACCESS'
    ];
    
    return criticalActions.includes(action);
  }

  private static async logToFile(entry: AuditLogEntry): Promise<void> {
    try {
      // TODO: Implementar log em arquivo local para backup
      console.log('Log crítico:', JSON.stringify(entry));
    } catch (error) {
      console.error('Erro ao salvar log em arquivo:', error);
    }
  }

  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // TODO: Implementar envio de alertas (email, Slack, etc.)
      console.log('Alerta de segurança:', event);
    } catch (error) {
      console.error('Erro ao enviar alerta de segurança:', error);
    }
  }

  private static convertToCSV(logs: AuditLogEntry[]): string {
    if (logs.length === 0) return '';
    
    const headers = Object.keys(logs[0]).join(',');
    const rows = logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'object' ? JSON.stringify(value) : String(value)
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Middleware para auditoria automática
export function createAuditMiddleware() {
  return async (req: Record<string, unknown>, res: Record<string, unknown>, next: (() => void) | undefined) => {
    const originalSend = (res as Record<string, unknown>).send as ((data: unknown) => void) | undefined;
    const startTime = Date.now();

    (res as Record<string, unknown>).send = function(data: unknown) {
      const duration = Date.now() - startTime;

      // Log da requisição
      AuditSystem.logAction({
        action: `API_${(req.method as string) || 'UNKNOWN'}`,
        table_name: 'api_requests',
        ip_address: (req.ip as string) || '127.0.0.1',
        user_agent: ((req.get as ((key: string) => string) | undefined)?('User-Agent')) || 'Unknown',
        metadata: {
          path: req.path,
          method: req.method,
          status_code: (res as Record<string, unknown>).statusCode,
          duration,
          user_id: (req.user as Record<string, string> | undefined)?.id
        }
      });

      originalSend?.call(this, data);
    };

    next?.();
  };
}

// Hook para auditoria de mudanças no banco
export function createDatabaseAuditHook() {
  return {
    beforeInsert: async (table: string, data: Record<string, unknown>, userId?: string) => {
      await AuditSystem.logAction({
        user_id: userId,
        action: 'INSERT',
        table_name: table,
        new_values: data
      });
    },

    beforeUpdate: async (table: string, id: string, oldData: Record<string, unknown>, newData: Record<string, unknown>, userId?: string) => {
      await AuditSystem.logAction({
        user_id: userId,
        action: 'UPDATE',
        table_name: table,
        record_id: id,
        old_values: oldData,
        new_values: newData
      });
    },

    beforeDelete: async (table: string, id: string, data: Record<string, unknown>, userId?: string) => {
      await AuditSystem.logAction({
        user_id: userId,
        action: 'DELETE',
        table_name: table,
        record_id: id,
        old_values: data
      });
    }
  };
}