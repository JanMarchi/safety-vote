# Configuração do Banco de Dados Supabase

Este projeto utiliza o Supabase como banco de dados. Siga as instruções abaixo para configurar o banco de dados.

## 1. Configuração Inicial

As chaves de API já estão configuradas no arquivo `src/lib/supabase.ts`:
- **URL do Projeto**: `https://pnftxckzpiwyikjcpliwl.supabase.co`
- **Chave Pública (anon)**: Já configurada
- **Chave Secreta (service_role)**: Disponível para uso administrativo

## 2. Criação das Tabelas

Para criar as tabelas necessárias no seu projeto Supabase:

1. Acesse o painel do Supabase: https://app.supabase.com
2. Vá para o seu projeto
3. Navegue até **SQL Editor** no menu lateral
4. Copie e execute o conteúdo do arquivo `database/schema.sql`

Ou execute o script SQL diretamente:

```sql
-- O conteúdo completo está no arquivo database/schema.sql
-- Inclui criação de tabelas, índices, triggers e políticas de segurança
```

## 3. Estrutura do Banco de Dados

### Tabelas Criadas:

#### `companies` - Empresas
- `id` (UUID, PK)
- `razao_social` (VARCHAR, NOT NULL)
- `nome_fantasia` (VARCHAR)
- `cnpj` (VARCHAR, UNIQUE, NOT NULL)
- `cnae` (VARCHAR, NOT NULL)
- `grupo` (VARCHAR, NOT NULL) - Grupo CIPA
- `grau_risco` (VARCHAR, NOT NULL)
- `setor` (VARCHAR, NOT NULL)
- `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`
- `telefone`, `email`
- `created_at`, `updated_at`

#### `users` - Usuários
- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `role` (ENUM: 'admin', 'rh', 'eleitor')
- `company_id` (UUID, FK)
- `created_at`, `updated_at`

#### `elections` - Eleições
- `id` (UUID, PK)
- `title` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `company_id` (UUID, FK, NOT NULL)
- `start_date`, `end_date` (TIMESTAMP)
- `status` (ENUM: 'draft', 'active', 'finished')
- `created_at`, `updated_at`

#### `candidates` - Candidatos
- `id` (UUID, PK)
- `name` (VARCHAR, NOT NULL)
- `election_id` (UUID, FK, NOT NULL)
- `photo_url` (TEXT)
- `description` (TEXT)
- `votes_count` (INTEGER, DEFAULT 0)
- `created_at`, `updated_at`

#### `votes` - Votos
- `id` (UUID, PK)
- `election_id` (UUID, FK, NOT NULL)
- `candidate_id` (UUID, FK, NOT NULL)
- `voter_id` (UUID, FK, NOT NULL)
- `created_at`
- UNIQUE constraint: (election_id, voter_id)

## 4. Funcionalidades Implementadas

### Serviços Disponíveis:

- **`companyService`**: CRUD completo para empresas
- **`userService`**: CRUD completo para usuários
- **`electionService`**: CRUD completo para eleições
- **`candidateService`**: CRUD completo para candidatos
- **`voteService`**: Registro de votos e contagem de resultados

### Recursos Automáticos:

- **Triggers**: Atualização automática de `updated_at`
- **Contagem de votos**: Atualização automática do campo `votes_count` nos candidatos
- **Índices**: Otimização de consultas
- **RLS (Row Level Security)**: Políticas de segurança básicas
- **Validações**: Constraints de integridade referencial

## 5. Integração com o Frontend

### Cadastro de Empresas
O formulário de cadastro de empresas (`CompanyRegister.tsx`) já está integrado com o Supabase:

- ✅ Validação de CNPJ duplicado
- ✅ Auto-preenchimento via API CNPJá
- ✅ Mapeamento automático de CNAE para grupos CIPA
- ✅ Persistência no banco de dados
- ✅ Feedback visual com toasts
- ✅ Redirecionamento após sucesso

### Próximos Passos
Para completar a integração:

1. **Autenticação**: Implementar login/registro com Supabase Auth
2. **Listagem de Empresas**: Conectar a página de empresas ao banco
3. **Gestão de Usuários**: Implementar CRUD de usuários
4. **Sistema de Eleições**: Conectar eleições e votação
5. **Relatórios**: Implementar dashboards com dados reais

## 6. Segurança

### Políticas RLS
As políticas de Row Level Security estão configuradas de forma básica. Para produção, considere:

- Restringir acesso baseado em roles de usuário
- Implementar políticas específicas por empresa
- Configurar autenticação adequada
- Revisar permissões de leitura/escrita

### Variáveis de Ambiente
Para produção, mova as chaves para variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://pnftxckzpiwyikjcpliwl.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta
```

## 7. Monitoramento

No painel do Supabase você pode:
- Monitorar uso da API
- Visualizar logs de requisições
- Gerenciar dados via interface gráfica
- Configurar backups automáticos
- Analisar performance das consultas

---

**Nota**: O banco de dados está pronto para uso. Execute o script SQL e comece a testar o cadastro de empresas!