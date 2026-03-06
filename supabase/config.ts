// Configuração do Supabase com políticas RLS
// Configurações de segurança e conexão

import { createClient } from '@supabase/supabase-js';

// Configurações do ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público (para frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'safety-vote'
    }
  }
});

// Cliente administrativo (para backend/APIs)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Tipos de dados do banco
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          email: string;
          phone: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          email?: string;
          phone?: string;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string;
          cpf: string;
          role: 'admin' | 'rh' | 'eleitor';
          department: string;
          email_verified: boolean;
          last_login: string | null;
          login_attempts: number;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          email: string;
          cpf: string;
          role: 'admin' | 'rh' | 'eleitor';
          department: string;
          email_verified?: boolean;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          email?: string;
          cpf?: string;
          role?: 'admin' | 'rh' | 'eleitor';
          department?: string;
          email_verified?: boolean;
          last_login?: string | null;
          login_attempts?: number;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      elections: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          total_voters: number;
          votes_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          total_voters?: number;
          votes_count?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          total_voters?: number;
          votes_count?: number;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          election_id: string;
          name: string;
          cpf: string;
          department: string;
          position: 'titular' | 'suplente';
          photo_url: string | null;
          votes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          name: string;
          cpf: string;
          department: string;
          position: 'titular' | 'suplente';
          photo_url?: string | null;
          votes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          name?: string;
          cpf?: string;
          department?: string;
          position?: 'titular' | 'suplente';
          photo_url?: string | null;
          votes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          election_id: string;
          user_id: string;
          candidate_id: string;
          vote_hash: string;
          encrypted_vote: string;
          ip_address: string;
          user_agent: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          election_id: string;
          user_id: string;
          candidate_id: string;
          vote_hash?: string;
          encrypted_vote: string;
          ip_address: string;
          user_agent: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          election_id?: string;
          user_id?: string;
          candidate_id?: string;
          vote_hash?: string;
          encrypted_vote?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          table_name: string;
          record_id: string | null;
          old_values: any | null;
          new_values: any | null;
          ip_address: string;
          user_agent: string;
          metadata: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          table_name: string;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address: string;
          user_agent: string;
          metadata?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          table_name?: string;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string;
          user_agent?: string;
          metadata?: any | null;
          created_at?: string;
        };
      };
      auth_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          token_type: 'magic_link' | 'password_reset';
          expires_at: string;
          used_at: string | null;
          ip_address: string;
          user_agent: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          token_type: 'magic_link' | 'password_reset';
          expires_at: string;
          used_at?: string | null;
          ip_address: string;
          user_agent: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          token_type?: 'magic_link' | 'password_reset';
          expires_at?: string;
          used_at?: string | null;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          expires_at: string;
          ip_address: string;
          user_agent: string;
          created_at: string;
          last_activity: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          expires_at: string;
          ip_address: string;
          user_agent: string;
          created_at?: string;
          last_activity?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          expires_at?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
          last_activity?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      validate_cpf: {
        Args: { cpf_input: string };
        Returns: boolean;
      };
      generate_vote_hash: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      update_candidate_votes_count: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
    Enums: {
      user_role: 'admin' | 'rh' | 'eleitor';
      election_status: 'draft' | 'active' | 'completed' | 'cancelled';
      candidate_position: 'titular' | 'suplente';
      token_type: 'magic_link' | 'password_reset';
    };
  };
}

// Funções utilitárias para RLS
export const rlsHelpers = {
  // Verificar se usuário é admin
  isAdmin: (userId: string) => {
    return supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('role', 'admin')
      .single();
  },
  
  // Verificar se usuário pertence à empresa
  belongsToCompany: (userId: string, companyId: string) => {
    return supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .eq('company_id', companyId)
      .single();
  },
  
  // Obter empresa do usuário
  getUserCompany: (userId: string) => {
    return supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();
  }
};

// Configurações de segurança
export const securityConfig = {
  // Tempo de expiração de sessões (7 dias)
  sessionExpirationTime: 7 * 24 * 60 * 60 * 1000,
  
  // Tempo de expiração de magic links (15 minutos)
  magicLinkExpirationTime: 15 * 60 * 1000,
  
  // Máximo de tentativas de login
  maxLoginAttempts: 5,
  
  // Tempo de bloqueio após tentativas excessivas (30 minutos)
  lockoutTime: 30 * 60 * 1000,
  
  // Rate limiting para magic links (1 por minuto)
  magicLinkRateLimit: {
    maxRequests: 1,
    windowMs: 60 * 1000
  },
  
  // Configurações de criptografia
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  }
};

export default supabase;