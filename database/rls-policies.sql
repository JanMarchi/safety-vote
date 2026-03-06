-- Políticas RLS Avançadas para Safety Vote
-- Este arquivo contém políticas de segurança mais específicas

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura pública de empresas" ON companies;
DROP POLICY IF EXISTS "Permitir inserção de empresas" ON companies;
DROP POLICY IF EXISTS "Permitir atualização de empresas" ON companies;
DROP POLICY IF EXISTS "Permitir leitura pública de usuários" ON users;
DROP POLICY IF EXISTS "Permitir inserção de usuários" ON users;
DROP POLICY IF EXISTS "Permitir atualização de usuários" ON users;
DROP POLICY IF EXISTS "Permitir leitura pública de eleições" ON elections;
DROP POLICY IF EXISTS "Permitir inserção de eleições" ON elections;
DROP POLICY IF EXISTS "Permitir atualização de eleições" ON elections;
DROP POLICY IF EXISTS "Permitir leitura pública de candidatos" ON candidates;
DROP POLICY IF EXISTS "Permitir inserção de candidatos" ON candidates;
DROP POLICY IF EXISTS "Permitir atualização de candidatos" ON candidates;
DROP POLICY IF EXISTS "Permitir leitura pública de votos" ON votes;
DROP POLICY IF EXISTS "Permitir inserção de votos" ON votes;

-- Políticas para COMPANIES
-- Admins podem ver todas as empresas
CREATE POLICY "admin_view_all_companies" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Usuários podem ver apenas sua própria empresa
CREATE POLICY "user_view_own_company" ON companies
    FOR SELECT USING (
        id IN (
            SELECT u.company_id FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid()
        )
    );

-- Apenas admins podem inserir empresas
CREATE POLICY "admin_insert_companies" ON companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Admins e RH da empresa podem atualizar
CREATE POLICY "admin_rh_update_companies" ON companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND (
                u.role = 'admin' OR 
                (u.role = 'rh' AND u.company_id = companies.id)
            )
        )
    );

-- Apenas admins podem deletar empresas
CREATE POLICY "admin_delete_companies" ON companies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Políticas para USERS
-- Usuários podem ver outros usuários da mesma empresa
CREATE POLICY "user_view_company_users" ON users
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "user_update_own_profile" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() AND au.id = users.id
        )
    );

-- Admins e RH podem inserir novos usuários
CREATE POLICY "admin_rh_insert_users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND (
                u.role = 'admin' OR 
                (u.role = 'rh' AND u.company_id = users.company_id)
            )
        )
    );

-- Apenas admins podem deletar usuários
CREATE POLICY "admin_delete_users" ON users
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Políticas para ELECTIONS
-- Usuários podem ver eleições de sua empresa
CREATE POLICY "user_view_company_elections" ON elections
    FOR SELECT USING (
        company_id IN (
            SELECT u.company_id FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Apenas RH e admins podem criar eleições
CREATE POLICY "rh_admin_insert_elections" ON elections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND (
                u.role = 'admin' OR 
                (u.role = 'rh' AND u.company_id = elections.company_id)
            )
        )
    );

-- Apenas RH da empresa e admins podem atualizar eleições
CREATE POLICY "rh_admin_update_elections" ON elections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND (
                u.role = 'admin' OR 
                (u.role = 'rh' AND u.company_id = elections.company_id)
            )
        )
    );

-- Apenas admins podem deletar eleições
CREATE POLICY "admin_delete_elections" ON elections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Políticas para CANDIDATES
-- Usuários podem ver candidatos de eleições de sua empresa
CREATE POLICY "user_view_company_candidates" ON candidates
    FOR SELECT USING (
        election_id IN (
            SELECT e.id FROM elections e
            JOIN auth.users au ON true
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND (
                u.company_id = e.company_id OR u.role = 'admin'
            )
        )
    );

-- Apenas RH e admins podem gerenciar candidatos
CREATE POLICY "rh_admin_manage_candidates" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            JOIN elections e ON e.id = candidates.election_id
            WHERE au.id = auth.uid() AND (
                u.role = 'admin' OR 
                (u.role = 'rh' AND u.company_id = e.company_id)
            )
        )
    );

-- Políticas para VOTES
-- Usuários podem ver apenas seus próprios votos
CREATE POLICY "user_view_own_votes" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() AND au.id = votes.voter_id
        )
    );

-- Admins podem ver todos os votos (para auditoria)
CREATE POLICY "admin_view_all_votes" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Usuários podem votar apenas em eleições ativas de sua empresa
CREATE POLICY "user_vote_active_elections" ON votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() AND au.id = votes.voter_id
        ) AND
        EXISTS (
            SELECT 1 FROM elections e
            JOIN auth.users au ON true
            JOIN users u ON au.id = u.id
            WHERE e.id = votes.election_id
            AND au.id = auth.uid()
            AND u.company_id = e.company_id
            AND e.status = 'active'
            AND e.start_date <= NOW()
            AND e.end_date >= NOW()
        )
    );

-- Ninguém pode atualizar ou deletar votos (imutabilidade)
CREATE POLICY "votes_immutable" ON votes
    FOR UPDATE USING (false);

CREATE POLICY "votes_no_delete" ON votes
    FOR DELETE USING (false);

-- Políticas para AUDIT_LOGS
-- Apenas admins podem ver logs de auditoria
CREATE POLICY "admin_view_audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );

-- Sistema pode inserir logs (via triggers)
CREATE POLICY "system_insert_audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Logs são imutáveis
CREATE POLICY "audit_logs_immutable" ON audit_logs
    FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_delete" ON audit_logs
    FOR DELETE USING (false);

-- Políticas para AUTH_TOKENS
-- Usuários podem ver apenas seus próprios tokens
CREATE POLICY "user_view_own_tokens" ON auth_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() AND au.id = auth_tokens.user_id
        )
    );

-- Sistema pode gerenciar tokens
CREATE POLICY "system_manage_tokens" ON auth_tokens
    FOR ALL USING (true);

-- Políticas para USER_SESSIONS
-- Usuários podem ver apenas suas próprias sessões
CREATE POLICY "user_view_own_sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            WHERE au.id = auth.uid() AND au.id = user_sessions.user_id
        )
    );

-- Sistema pode gerenciar sessões
CREATE POLICY "system_manage_sessions" ON user_sessions
    FOR ALL USING (true);

-- Admins podem ver todas as sessões
CREATE POLICY "admin_view_all_sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users au
            JOIN users u ON au.id = u.id
            WHERE au.id = auth.uid() AND u.role = 'admin'
        )
    );