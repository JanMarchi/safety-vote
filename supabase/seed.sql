-- Seed data for Safety Vote System
-- This file contains sample data for testing and development

-- Insert sample companies
INSERT INTO companies (id, name, cnpj, email, phone, address, city, state, zip_code) VALUES 
('11111111-1111-1111-1111-111111111111', 'Empresa Exemplo LTDA', '12.345.678/0001-90', 'contato@empresaexemplo.com', '(11) 99999-9999', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567'),
('22222222-2222-2222-2222-222222222222', 'Indústria Modelo S.A.', '98.765.432/0001-10', 'rh@industriamodelo.com', '(21) 88888-8888', 'Av. Industrial, 456', 'Rio de Janeiro', 'RJ', '20000-000'),
('33333333-3333-3333-3333-333333333333', 'Comércio Teste ME', '11.222.333/0001-44', 'admin@comercioteste.com', '(31) 77777-7777', 'Praça Central, 789', 'Belo Horizonte', 'MG', '30000-000');

-- Insert sample users
INSERT INTO users (id, company_id, email, cpf, name, role, department, position, email_verified) VALUES 
-- Empresa Exemplo LTDA users
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'rh@empresaexemplo.com', '123.456.789-01', 'Maria Silva', 'rh', 'Recursos Humanos', 'Gerente de RH', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'joao@empresaexemplo.com', '234.567.890-12', 'João Santos', 'eleitor', 'Produção', 'Operador', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ana@empresaexemplo.com', '345.678.901-23', 'Ana Costa', 'eleitor', 'Administrativo', 'Assistente', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'carlos@empresaexemplo.com', '456.789.012-34', 'Carlos Oliveira', 'eleitor', 'Manutenção', 'Técnico', true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'lucia@empresaexemplo.com', '567.890.123-45', 'Lúcia Ferreira', 'eleitor', 'Qualidade', 'Analista', true),

-- Indústria Modelo S.A. users
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'admin@industriamodelo.com', '678.901.234-56', 'Roberto Admin', 'rh', 'Recursos Humanos', 'Diretor de RH', true),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '22222222-2222-2222-2222-222222222222', 'pedro@industriamodelo.com', '789.012.345-67', 'Pedro Almeida', 'eleitor', 'Engenharia', 'Engenheiro', true),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'fernanda@industriamodelo.com', '890.123.456-78', 'Fernanda Lima', 'eleitor', 'Segurança', 'Técnica de Segurança', true),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '22222222-2222-2222-2222-222222222222', 'marcos@industriamodelo.com', '901.234.567-89', 'Marcos Rocha', 'eleitor', 'Produção', 'Supervisor', true),

-- Comércio Teste ME users
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '33333333-3333-3333-3333-333333333333', 'gestor@comercioteste.com', '012.345.678-90', 'Sandra Gestora', 'rh', 'Administração', 'Gestora', true),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '33333333-3333-3333-3333-333333333333', 'vendedor@comercioteste.com', '123.456.789-02', 'Paulo Vendas', 'eleitor', 'Vendas', 'Vendedor', true);

-- Insert sample elections
INSERT INTO elections (id, company_id, title, description, start_date, end_date, status, max_votes_per_user, created_by) VALUES 
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Eleição CIPA 2024 - Empresa Exemplo', 'Eleição para escolha dos representantes da CIPA para o biênio 2024-2026', NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', 'draft', 3, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Eleição CIPA 2024 - Indústria Modelo', 'Processo eleitoral para formação da nova CIPA', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 'active', 2, 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
('e3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Eleição CIPA 2023 - Comércio Teste', 'Eleição finalizada do ano anterior', NOW() - INTERVAL '30 days', NOW() - INTERVAL '23 days', 'completed', 1, 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj');

-- Insert sample candidates
INSERT INTO candidates (id, election_id, user_id, proposal, is_active) VALUES 
-- Candidates for Empresa Exemplo election
('c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Proposta para melhorar a segurança na área de produção com foco em treinamentos regulares e equipamentos de proteção.', true),
('c2222222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Implementação de programa de ginástica laboral e campanhas de conscientização sobre ergonomia no trabalho.', true),
('c3333333-3333-3333-3333-333333333333', 'e1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Criação de comitê de segurança para análise mensal de riscos e implementação de melhorias contínuas.', true),
('c4444444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Desenvolvimento de sistema de sugestões de segurança com premiação para ideias implementadas.', true),

-- Candidates for Indústria Modelo election
('c5555555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'Modernização dos protocolos de segurança industrial com base nas melhores práticas do setor.', true),
('c6666666-6666-6666-6666-666666666666', 'e2222222-2222-2222-2222-222222222222', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Intensificação dos treinamentos de segurança e criação de simulados de emergência mensais.', true),
('c7777777-7777-7777-7777-777777777777', 'e2222222-2222-2222-2222-222222222222', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Implementação de tecnologia IoT para monitoramento em tempo real das condições de segurança.', true),

-- Candidates for completed election
('c8888888-8888-8888-8888-888888888888', 'e3333333-3333-3333-3333-333333333333', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Proposta focada em segurança no atendimento ao cliente e prevenção de acidentes no ambiente comercial.', true);

-- Insert sample votes for the completed election
INSERT INTO votes (id, election_id, voter_id, candidate_id, encrypted_vote, vote_hash, ip_address) VALUES 
('v1111111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'c8888888-8888-8888-8888-888888888888', 'encrypted_vote_data_1', 'hash1234567890abcdef', '192.168.1.100'),
('v2222222-2222-2222-2222-222222222222', 'e3333333-3333-3333-3333-333333333333', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'c8888888-8888-8888-8888-888888888888', 'encrypted_vote_data_2', 'hash2345678901bcdefg', '192.168.1.101');

-- Insert sample audit logs
INSERT INTO audit_logs (user_id, company_id, action, resource_type, resource_id, details, ip_address, severity) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'create', 'election', 'e1111111-1111-1111-1111-111111111111', '{"title": "Eleição CIPA 2024 - Empresa Exemplo"}', '192.168.1.10', 'medium'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'create', 'election', 'e2222222-2222-2222-2222-222222222222', '{"title": "Eleição CIPA 2024 - Indústria Modelo"}', '192.168.1.20', 'medium'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '33333333-3333-3333-3333-333333333333', 'vote', 'election', 'e3333333-3333-3333-3333-333333333333', '{"candidate_id": "c8888888-8888-8888-8888-888888888888"}', '192.168.1.100', 'low'),
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '33333333-3333-3333-3333-333333333333', 'vote', 'election', 'e3333333-3333-3333-3333-333333333333', '{"candidate_id": "c8888888-8888-8888-8888-888888888888"}', '192.168.1.101', 'low'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'create', 'candidate', 'c1111111-1111-1111-1111-111111111111', '{"election_id": "e1111111-1111-1111-1111-111111111111"}', '192.168.1.50', 'low'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'create', 'candidate', 'c2222222-2222-2222-2222-222222222222', '{"election_id": "e1111111-1111-1111-1111-111111111111"}', '192.168.1.51', 'low'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'login', 'user', '00000000-0000-0000-0000-000000000001', '{"login_method": "magic_link"}', '192.168.1.1', 'low');

-- Update vote hashes with proper calculated values
UPDATE votes SET vote_hash = generate_vote_hash(election_id, voter_id, candidate_id, created_at);

-- Insert some sample auth tokens (expired for security)
INSERT INTO auth_tokens (user_id, token_hash, expires_at, used_at, ip_address) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'expired_token_hash_1', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '59 minutes', '192.168.1.10'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'expired_token_hash_2', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '119 minutes', '192.168.1.50');

-- Insert some sample user sessions (some expired)
INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, last_activity) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'active_session_token_1', NOW() + INTERVAL '1 day', '192.168.1.10', NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'expired_session_token_1', NOW() - INTERVAL '1 hour', '192.168.1.50', NOW() - INTERVAL '2 hours'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'active_session_token_2', NOW() + INTERVAL '2 days', '192.168.1.20', NOW() - INTERVAL '30 minutes');

-- Add some additional audit logs for security events
INSERT INTO audit_logs (user_id, company_id, action, resource_type, details, ip_address, severity) VALUES 
(NULL, NULL, 'login', 'auth', '{"email": "invalid@example.com", "result": "failed", "reason": "user_not_found"}', '192.168.1.200', 'medium'),
(NULL, NULL, 'login', 'auth', '{"email": "admin@cipa-system.com", "result": "failed", "reason": "invalid_token"}', '192.168.1.201', 'high'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'export', 'audit_logs', '{"format": "csv", "date_range": "last_30_days"}', '192.168.1.10', 'medium');

-- Update last_login for some users
UPDATE users SET last_login = NOW() - INTERVAL '1 hour' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE users SET last_login = NOW() - INTERVAL '2 days' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
UPDATE users SET last_login = NOW() - INTERVAL '30 minutes' WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';