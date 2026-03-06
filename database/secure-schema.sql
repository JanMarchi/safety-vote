-- Safety Vote - Schema Seguro com RLS e Auditoria
-- Versão com melhorias de segurança implementadas

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Tabela de usuários com campos adicionais para segurança
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  role VARCHAR(20) CHECK (role IN ('admin', 'rh', 'eleitor')) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
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
  created_by UUID REFERENCES users(id),
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

-- Tabela de votos com criptografia
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote_hash VARCHAR(255) NOT NULL, -- Hash do voto para auditoria
  encrypted_vote TEXT, -- Voto criptografado
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário vote apenas uma vez por eleição
  UNIQUE(election_id, voter_id)
);

-- Tabela de auditoria para ações do sistema
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para tokens de autenticação (magic links)
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  token_type VARCHAR(20) CHECK (token_type IN ('magic_link', 'email_verification', 'password_reset')) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões de usuário
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_elections_company_id ON elections(company_id);
CREATE INDEX IF NOT EXISTS idx_elections_status ON elections(status);
CREATE INDEX IF NOT EXISTS idx_candidates_election_id ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token_hash ON auth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

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

-- Trigger para auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, ip_address)
        VALUES (
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address)
        VALUES (
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, ip_address)
        VALUES (
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            inet_client_addr()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Aplicar triggers de auditoria
CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON companies
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_elections AFTER INSERT OR UPDATE OR DELETE ON elections
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_candidates AFTER INSERT OR UPDATE OR DELETE ON candidates
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_votes AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

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

-- Função para gerar hash de voto
CREATE OR REPLACE FUNCTION generate_vote_hash()
RETURNS TRIGGER AS $$
BEGIN
    NEW.vote_hash = encode(digest(
        NEW.election_id::text || NEW.candidate_id::text || NEW.voter_id::text || NOW()::text,
        'sha256'
    ), 'hex');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_vote_hash_trigger BEFORE INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION generate_vote_hash();

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
CREATE POLICY "Admins podem ver todas as empresas" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Usuários podem ver sua própria empresa" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM users 
            WHERE users.id = auth.uid()
        )
    );

CREATE POLICY "Apenas admins podem inserir empresas" ON companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Apenas admins e RH podem atualizar empresas" ON companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 (users.role = 'rh' AND users.company_id = companies.id))
        )
    );

-- Políticas RLS para users
CREATE POLICY "Usuários podem ver perfis da mesma empresa" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Usuários podem atualizar próprio perfil" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins e RH podem inserir usuários" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR users.role = 'rh')
        )
    );

-- Políticas RLS para elections
CREATE POLICY "Usuários podem ver eleições da empresa" ON elections
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE users.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Apenas RH e admins podem criar eleições" ON elections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 (users.role = 'rh' AND users.company_id = elections.company_id))
        )
    );

CREATE POLICY "Apenas RH e admins podem atualizar eleições" ON elections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.role = 'admin' OR 
                 (users.role = 'rh' AND users.company_id = elections.company_id))
        )
    );

-- Políticas RLS para candidates
CREATE POLICY "Usuários podem ver candidatos de eleições da empresa" ON candidates
    FOR SELECT USING (
        election_id IN (
            SELECT elections.id FROM elections
            JOIN users ON users.company_id = elections.company_id
            WHERE users.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Apenas RH e admins podem gerenciar candidatos" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            JOIN elections ON elections.company_id = users.company_id
            WHERE users.id = auth.uid() 
            AND elections.id = candidates.election_id
            AND (users.role = 'admin' OR users.role = 'rh')
        )
    );

-- Políticas RLS para votes
CREATE POLICY "Usuários podem ver próprios votos" ON votes
    FOR SELECT USING (voter_id = auth.uid());

CREATE POLICY "Admins podem ver todos os votos" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Usuários podem votar em eleições ativas" ON votes
    FOR INSERT WITH CHECK (
        voter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM elections
            JOIN users ON users.company_id = elections.company_id
            WHERE elections.id = votes.election_id
            AND elections.status = 'active'
            AND elections.start_date <= NOW()
            AND elections.end_date >= NOW()
            AND users.id = auth.uid()
        )
    );

-- Políticas RLS para audit_logs
CREATE POLICY "Apenas admins podem ver logs de auditoria" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Políticas RLS para auth_tokens
CREATE POLICY "Usuários podem ver próprios tokens" ON auth_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sistema pode inserir tokens" ON auth_tokens
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar tokens" ON auth_tokens
    FOR UPDATE USING (true);

-- Políticas RLS para user_sessions
CREATE POLICY "Usuários podem ver próprias sessões" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sistema pode gerenciar sessões" ON user_sessions
    FOR ALL USING (true);

-- Funções auxiliares para validação
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cpf TEXT;
    sum1 INTEGER := 0;
    sum2 INTEGER := 0;
    digit1 INTEGER;
    digit2 INTEGER;
    i INTEGER;
BEGIN
    -- Remove caracteres não numéricos
    cpf := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica sequências inválidas
    IF cpf IN ('00000000000', '11111111111', '22222222222', '33333333333', 
               '44444444444', '55555555555', '66666666666', '77777777777',
               '88888888888', '99999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        sum1 := sum1 + (substring(cpf, i, 1)::INTEGER * (11 - i));
    END LOOP;
    
    digit1 := 11 - (sum1 % 11);
    IF digit1 >= 10 THEN
        digit1 := 0;
    END IF;
    
    -- Calcula segundo dígito verificador
    FOR i IN 1..10 LOOP
        sum2 := sum2 + (substring(cpf, i, 1)::INTEGER * (12 - i));
    END LOOP;
    
    digit2 := 11 - (sum2 % 11);
    IF digit2 >= 10 THEN
        digit2 := 0;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN (substring(cpf, 10, 1)::INTEGER = digit1 AND 
            substring(cpf, 11, 1)::INTEGER = digit2);
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar CPF
CREATE OR REPLACE FUNCTION validate_user_cpf()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cpf IS NOT NULL AND NOT validate_cpf(NEW.cpf) THEN
        RAISE EXCEPTION 'CPF inválido: %', NEW.cpf;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_cpf_trigger BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION validate_user_cpf();