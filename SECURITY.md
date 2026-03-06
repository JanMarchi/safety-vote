# Documentação de Segurança - Safety Vote

## Visão Geral

Este documento descreve as melhorias de segurança implementadas no sistema Safety Vote, incluindo autenticação segura, auditoria completa, políticas RLS e conformidade com acessibilidade.

## 🔐 Autenticação e Autorização

### Magic Link Authentication

**Implementação**: `src/lib/auth/magic-link.ts`

- **Tokens seguros**: Geração de tokens criptográficos de 256 bits
- **Expiração**: Magic links expiram em 15 minutos
- **Rate limiting**: Máximo 1 magic link por minuto por usuário
- **Validação CPF**: Verificação automática de CPF brasileiro
- **Sessões seguras**: Tokens de sessão com expiração de 7 dias

**Fluxo de autenticação**:
1. Usuário insere email (e opcionalmente CPF)
2. Sistema gera token seguro e envia por email
3. Usuário clica no link e é autenticado
4. Sessão é criada com token seguro

### Middleware de Autenticação

**Implementação**: `src/middleware/auth.ts`

- **Proteção de rotas**: Middleware automático para APIs
- **Verificação de roles**: Controle granular de permissões
- **Validação de sessão**: Verificação automática de tokens
- **Logging de acesso**: Auditoria de tentativas de acesso

**Tipos de proteção**:
- `withAdminAuth`: Apenas administradores
- `withRHAuth`: Administradores e RH
- `withEleitorAuth`: Todos os usuários autenticados
- `withBasicAuth`: Autenticação básica

### Hook de Autenticação React

**Implementação**: `src/hooks/useAuth.ts`

- **Estado global**: Gerenciamento de estado de autenticação
- **Proteção de rotas**: Hooks para proteger páginas
- **Verificação de roles**: Funções utilitárias para permissões
- **Logout seguro**: Limpeza completa de sessões

## 🛡️ Row Level Security (RLS)

### Políticas Implementadas

**Arquivo**: `database/secure-schema.sql`

#### Tabela `companies`
- **SELECT**: Usuários podem ver apenas sua própria empresa
- **INSERT**: Apenas admins podem criar empresas
- **UPDATE**: Apenas admins da própria empresa
- **DELETE**: Apenas super admins

#### Tabela `users`
- **SELECT**: Usuários veem apenas colegas da mesma empresa
- **INSERT**: Apenas admins e RH podem criar usuários
- **UPDATE**: Usuários podem atualizar próprios dados, admins/RH podem atualizar da empresa
- **DELETE**: Apenas admins podem deletar usuários

#### Tabela `elections`
- **SELECT**: Usuários veem apenas eleições da própria empresa
- **INSERT**: Apenas admins e RH podem criar eleições
- **UPDATE**: Apenas criadores e admins podem atualizar
- **DELETE**: Apenas admins podem deletar

#### Tabela `candidates`
- **SELECT**: Usuários veem candidatos de eleições da própria empresa
- **INSERT/UPDATE/DELETE**: Apenas admins e RH

#### Tabela `votes`
- **SELECT**: Apenas admins podem ver votos (para auditoria)
- **INSERT**: Usuários podem votar em eleições da própria empresa
- **UPDATE/DELETE**: Proibido (imutabilidade dos votos)

#### Tabela `audit_logs`
- **SELECT**: Apenas admins e RH
- **INSERT**: Sistema automático
- **UPDATE/DELETE**: Proibido (imutabilidade dos logs)

## 📊 Sistema de Auditoria

### Implementação Completa

**Arquivo**: `src/lib/audit/audit-system.ts`

#### Funcionalidades

1. **Logging de Ações**
   - Todas as operações CRUD são registradas
   - Metadados incluem IP, User-Agent, timestamps
   - Valores antigos e novos são armazenados

2. **Auditoria de Votos**
   - Votos são criptografados antes do armazenamento
   - Hash SHA-256 para verificação de integridade
   - Impossibilidade de alteração após criação

3. **Eventos de Segurança**
   - Tentativas de login falhadas
   - Acessos não autorizados
   - Atividades suspeitas
   - Alterações de permissões

4. **Relatórios de Auditoria**
   - Relatórios por período, usuário, ação
   - Exportação em JSON, CSV, PDF
   - Filtros avançados por severidade

#### Triggers Automáticos

```sql
-- Trigger para auditoria automática
CREATE TRIGGER audit_trigger_companies
  AFTER INSERT OR UPDATE OR DELETE ON companies
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### APIs de Auditoria

1. **Relatórios**: `/api/audit/reports`
   - Geração de relatórios personalizados
   - Controle de acesso por role
   - Filtros por data, usuário, ação

2. **Exportação**: `/api/audit/export`
   - Exportação em múltiplos formatos
   - Logs de exportação para auditoria
   - Controle de tamanho de arquivo

## 🔒 Criptografia e Hashing

### Votos Criptografados

```typescript
// Criptografia AES-256-GCM
const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Hash SHA-256 para integridade
const voteHash = crypto
  .createHash('sha256')
  .update(`${electionId}:${userId}:${candidateId}:${timestamp}`)
  .digest('hex');
```

### Tokens Seguros

```typescript
// Geração de tokens criptográficos
const token = crypto.randomBytes(32).toString('hex');
const tokenHash = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');
```

## ♿ Acessibilidade (WCAG 2.1 AA)

### Implementação

**Arquivo**: `src/components/accessibility/AccessibilityTester.tsx`

#### Funcionalidades

1. **Testes Automáticos**
   - Integração com axe-core
   - Verificação automática em desenvolvimento
   - Relatórios detalhados de violações

2. **Conformidade WCAG 2.1 AA**
   - Contraste de cores adequado
   - Navegação por teclado
   - Rótulos ARIA apropriados
   - Estrutura semântica correta

3. **Indicadores Visuais**
   - Painel flutuante com resultados
   - Contadores de violações
   - Links para documentação

#### Regras Verificadas

- `color-contrast`: Contraste mínimo 4.5:1
- `keyboard-navigation`: Todos os elementos navegáveis
- `aria-labels`: Rótulos para leitores de tela
- `focus-order`: Ordem lógica de foco
- `button-name`: Botões com nomes descritivos
- `image-alt`: Imagens com texto alternativo
- `form-labels`: Formulários com rótulos

## 🚀 APIs de Segurança

### Endpoints Implementados

1. **Autenticação**
   - `POST /api/auth/send-magic-link`: Envio de magic link
   - `POST /api/auth/verify-magic-link`: Verificação de token
   - `POST /api/auth/validate-session`: Validação de sessão
   - `POST /api/auth/logout`: Encerramento de sessão

2. **Auditoria**
   - `POST /api/audit/reports`: Geração de relatórios
   - `POST /api/audit/export`: Exportação de logs

### Rate Limiting

```typescript
// Configuração de rate limiting
const rateLimits = {
  magicLink: { max: 1, window: 60000 }, // 1 por minuto
  login: { max: 5, window: 300000 },    // 5 por 5 minutos
  api: { max: 100, window: 60000 }      // 100 por minuto
};
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Email (para magic links)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Criptografia
ENCRYPTION_KEY=your_32_byte_encryption_key
JWT_SECRET=your_jwt_secret

# Ambiente
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Configuração do Supabase

1. **Aplicar Schema Seguro**
   ```bash
   psql -h your-db-host -U postgres -d your-db < database/secure-schema.sql
   ```

2. **Verificar RLS**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

3. **Testar Políticas**
   ```sql
   SET ROLE authenticated;
   SELECT * FROM companies; -- Deve retornar apenas empresa do usuário
   ```

## 📋 Checklist de Segurança

### ✅ Implementado

- [x] Autenticação por Magic Link
- [x] Row Level Security (RLS)
- [x] Sistema de auditoria completo
- [x] Criptografia de votos
- [x] Hashing de tokens
- [x] Rate limiting
- [x] Validação de CPF
- [x] Middleware de autenticação
- [x] Proteção de rotas frontend
- [x] Testes de acessibilidade
- [x] Conformidade WCAG 2.1 AA
- [x] Logging de segurança
- [x] Exportação de relatórios
- [x] Limpeza automática de tokens expirados

### 🔄 Próximos Passos

- [ ] Implementar 2FA opcional
- [ ] Adicionar CAPTCHA em formulários
- [ ] Implementar CSP (Content Security Policy)
- [ ] Adicionar monitoramento de segurança
- [ ] Implementar backup automático de logs
- [ ] Adicionar alertas de segurança por email
- [ ] Implementar rotação automática de chaves

## 🆘 Resposta a Incidentes

### Procedimentos

1. **Detecção**
   - Monitoramento automático de logs
   - Alertas de atividades suspeitas
   - Relatórios de auditoria regulares

2. **Contenção**
   - Bloqueio automático de usuários suspeitos
   - Invalidação de sessões comprometidas
   - Isolamento de dados afetados

3. **Investigação**
   - Análise de logs de auditoria
   - Rastreamento de atividades
   - Identificação de vetores de ataque

4. **Recuperação**
   - Restauração de dados se necessário
   - Atualização de políticas de segurança
   - Comunicação com usuários afetados

## 📞 Contato de Segurança

Para reportar vulnerabilidades de segurança:
- Email: security@safety-vote.com
- Processo: Divulgação responsável
- Tempo de resposta: 24-48 horas

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Responsável**: Equipe de Desenvolvimento Safety Vote