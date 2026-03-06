-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'rh', 'eleitor');
CREATE TYPE election_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'vote', 'export');
CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'eleitor',
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elections table
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status election_status DEFAULT 'draft',
    max_votes_per_user INTEGER DEFAULT 1,
    allow_abstention BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_election_dates CHECK (end_date > start_date)
);

-- Candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    proposal TEXT,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(election_id, user_id)
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id),
    candidate_id UUID REFERENCES candidates(id),
    is_abstention BOOLEAN DEFAULT false,
    encrypted_vote TEXT NOT NULL,
    vote_hash VARCHAR(64) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(election_id, voter_id),
    CONSTRAINT vote_or_abstention CHECK (
        (candidate_id IS NOT NULL AND is_abstention = false) OR
        (candidate_id IS NULL AND is_abstention = true)
    )
);

-- Auth tokens table (for magic links)
CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    token_type VARCHAR(20) NOT NULL DEFAULT 'magic_link',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    session_id VARCHAR(64),
    action audit_action NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    severity audit_severity DEFAULT 'low',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_elections_company_id ON elections(company_id);
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX idx_candidates_election_id ON candidates(election_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_hash ON auth_tokens(token_hash);
CREATE INDEX idx_auth_tokens_expires ON auth_tokens(expires_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'user_id',
    current_setting('request.jwt.claims', true)::json->>'sub'
  )::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'eleitor'
  );
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.user_company_id() RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.user_id();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'admin';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_rh_or_admin() RETURNS BOOLEAN AS $$
  SELECT auth.user_role() IN ('admin', 'rh');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION same_company(company_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT company_uuid = auth.user_company_id() OR is_admin();
$$ LANGUAGE SQL STABLE;

-- RLS Policies for companies
CREATE POLICY "Admins can view all companies" ON companies
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT USING (id = auth.user_company_id());

CREATE POLICY "Admins can manage all companies" ON companies
  FOR ALL USING (is_admin());

-- RLS Policies for users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

CREATE POLICY "RH and admins can view users from same company" ON users
  FOR SELECT USING (is_rh_or_admin() AND same_company(company_id));

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (id = auth.user_id());

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (is_admin());

CREATE POLICY "RH can manage users from same company" ON users
  FOR ALL USING (auth.user_role() = 'rh' AND same_company(company_id));

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.user_id());

-- RLS Policies for elections
CREATE POLICY "Admins can view all elections" ON elections
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view elections from their company" ON elections
  FOR SELECT USING (same_company(company_id));

CREATE POLICY "Admins can manage all elections" ON elections
  FOR ALL USING (is_admin());

CREATE POLICY "RH can manage elections from same company" ON elections
  FOR ALL USING (auth.user_role() = 'rh' AND same_company(company_id));

-- RLS Policies for candidates
CREATE POLICY "Admins can view all candidates" ON candidates
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view candidates from elections in their company" ON candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_id AND same_company(e.company_id)
    )
  );

CREATE POLICY "Admins can manage all candidates" ON candidates
  FOR ALL USING (is_admin());

CREATE POLICY "RH can manage candidates from same company elections" ON candidates
  FOR ALL USING (
    auth.user_role() = 'rh' AND
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_id AND same_company(e.company_id)
    )
  );

CREATE POLICY "Users can register as candidates" ON candidates
  FOR INSERT WITH CHECK (
    user_id = auth.user_id() AND
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_id AND same_company(e.company_id) AND e.status = 'draft'
    )
  );

-- RLS Policies for votes
CREATE POLICY "Admins can view all votes" ON votes
  FOR SELECT USING (is_admin());

CREATE POLICY "RH can view votes from same company elections" ON votes
  FOR SELECT USING (
    auth.user_role() = 'rh' AND
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_id AND same_company(e.company_id)
    )
  );

CREATE POLICY "Users can view their own votes" ON votes
  FOR SELECT USING (voter_id = auth.user_id());

CREATE POLICY "Users can cast votes in their company elections" ON votes
  FOR INSERT WITH CHECK (
    voter_id = auth.user_id() AND
    EXISTS (
      SELECT 1 FROM elections e 
      WHERE e.id = election_id AND same_company(e.company_id) AND e.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all votes" ON votes
  FOR ALL USING (is_admin());

-- RLS Policies for auth_tokens
CREATE POLICY "Users can view their own auth tokens" ON auth_tokens
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can create their own auth tokens" ON auth_tokens
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update their own auth tokens" ON auth_tokens
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Admins can manage all auth tokens" ON auth_tokens
  FOR ALL USING (is_admin());

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "Users can create their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "Users can delete their own sessions" ON user_sessions
  FOR DELETE USING (user_id = auth.user_id());

CREATE POLICY "Admins can manage all sessions" ON user_sessions
  FOR ALL USING (is_admin());

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "RH can view audit logs from same company" ON audit_logs
  FOR SELECT USING (
    auth.user_role() = 'rh' AND same_company(company_id)
  );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all audit logs" ON audit_logs
  FOR ALL USING (is_admin());

-- Create triggers for updated_at timestamps
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

-- Create function to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Delete expired auth tokens
    DELETE FROM auth_tokens WHERE expires_at < NOW();
    
    -- Delete expired user sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Delete old audit logs (older than 1 year)
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate vote hash
CREATE OR REPLACE FUNCTION generate_vote_hash(
    p_election_id UUID,
    p_voter_id UUID,
    p_candidate_id UUID,
    p_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(
        digest(
            CONCAT(
                p_election_id::text,
                p_voter_id::text,
                COALESCE(p_candidate_id::text, 'abstention'),
                extract(epoch from p_timestamp)::text
            ),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to validate vote integrity
CREATE OR REPLACE FUNCTION validate_vote_integrity(
    p_vote_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_vote votes%ROWTYPE;
    v_calculated_hash VARCHAR(64);
BEGIN
    SELECT * INTO v_vote FROM votes WHERE id = p_vote_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    v_calculated_hash := generate_vote_hash(
        v_vote.election_id,
        v_vote.voter_id,
        v_vote.candidate_id,
        v_vote.created_at
    );
    
    RETURN v_vote.vote_hash = v_calculated_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user and company (for initial setup)
INSERT INTO companies (id, name, cnpj, email) VALUES 
('00000000-0000-0000-0000-000000000001', 'Sistema CIPA', '00.000.000/0001-00', 'admin@cipa-system.com');

INSERT INTO users (id, company_id, email, name, role, email_verified) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'admin@cipa-system.com', 'Administrador do Sistema', 'admin', true);