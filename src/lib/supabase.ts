import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://pnftxckzpiwyikjcpliwl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuZnR4Y2t6cGl3eWprY3BsaXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NzU5MTEsImV4cCI6MjA2NTA1MTkxMX0.qf2FqAJ5dPmzBQqWlwph55G_EM0K10GwLJr5Z8nK1BI'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco de dados
export interface Company {
  id?: string
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  cnae: string
  grupo: string
  grau_risco: string
  setor: string
  endereco: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  telefone?: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id?: string
  name: string
  email: string
  role: 'admin' | 'rh' | 'eleitor'
  company_id?: string
  created_at?: string
  updated_at?: string
}

export interface Election {
  id?: string
  title: string
  description?: string
  company_id: string
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'finished'
  created_at?: string
  updated_at?: string
}

export interface Candidate {
  id?: string
  name: string
  election_id: string
  photo_url?: string
  description?: string
  votes_count?: number
  created_at?: string
  updated_at?: string
}

export interface Vote {
  id?: string
  election_id: string
  candidate_id: string
  voter_id: string
  created_at?: string
}