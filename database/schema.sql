-- Criação das tabelas para o sistema Safety Vote

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  cnae VARCHAR(10) NOT NULL,
  grupo VARCHAR(10) NOT NULL,
  grau_risco VARCHAR(50) NOT NULL,
  setor VARCHAR(100) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'rh', 'eleitor')) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eleições
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'finished')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de candidatos
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  description TEXT,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de votos
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário vote apenas uma vez por eleição
  UNIQUE(election_id, voter_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_elections_company_id ON elections(company_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON elections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar contagem de votos dos candidatos
CREATE OR REPLACE FUNCTION update_candidate_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE candidates 
        SET votes_count = votes_count + 1 
        WHERE id = NEW.candidate_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE candidates 
        SET votes_count = votes_count - 1 
        WHERE id = OLD.candidate_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_votes_count AFTER INSERT OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_candidate_votes_count();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (podem ser ajustadas conforme necessário)
CREATE POLICY "Permitir leitura pública de empresas" ON companies FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de empresas" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de empresas" ON companies FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de usuários" ON users FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de usuários" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de usuários" ON users FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de eleições" ON elections FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de eleições" ON elections FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de eleições" ON elections FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de candidatos" ON candidates FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de candidatos" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de candidatos" ON candidates FOR UPDATE USING (true);

CREATE POLICY "Permitir leitura pública de votos" ON votes FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de votos" ON votes FOR INSERT WITH CHECK (true);