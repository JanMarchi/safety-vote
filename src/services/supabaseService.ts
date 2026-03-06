import { supabase, Company, User, Election, Candidate, Vote } from '../lib/supabase'

// Serviços para Empresas
export const companyService = {
  // Criar nova empresa
  async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar empresa por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar empresa por CNPJ
  async getByCnpj(cnpj: string) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('cnpj', cnpj)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  },

  // Listar todas as empresas
  async getAll() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar empresa
  async update(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Deletar empresa
  async delete(id: string) {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Usuários
export const userService = {
  // Criar novo usuário
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar usuário por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar usuário por email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Listar usuários por empresa
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar usuário
  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Deletar usuário
  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Eleições
export const electionService = {
  // Criar nova eleição
  async create(election: Omit<Election, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('elections')
      .insert([election])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar eleição por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Listar eleições por empresa
  async getByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar eleição
  async update(id: string, updates: Partial<Election>) {
    const { data, error } = await supabase
      .from('elections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Deletar eleição
  async delete(id: string) {
    const { error } = await supabase
      .from('elections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Candidatos
export const candidateService = {
  // Criar novo candidato
  async create(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('candidates')
      .insert([candidate])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar candidatos por eleição
  async getByElection(electionId: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Atualizar candidato
  async update(id: string, updates: Partial<Candidate>) {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Deletar candidato
  async delete(id: string) {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Serviços para Votos
export const voteService = {
  // Registrar voto
  async create(vote: Omit<Vote, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('votes')
      .insert([vote])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Verificar se usuário já votou na eleição
  async hasVoted(electionId: string, voterId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('election_id', electionId)
      .eq('voter_id', voterId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  },

  // Contar votos por candidato
  async getResultsByElection(electionId: string) {
    const { data, error } = await supabase
      .from('votes')
      .select('candidate_id')
      .eq('election_id', electionId)
    
    if (error) throw error
    
    // Contar votos por candidato
    const voteCounts = data.reduce((acc: Record<string, number>, vote) => {
      acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1
      return acc
    }, {})
    
    return voteCounts
  }
}