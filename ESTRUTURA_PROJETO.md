# 📁 Estrutura Completa do Projeto Safety Vote

## 📋 Visão Geral

Este documento apresenta a estrutura completa do projeto **Safety Vote**, um sistema de votação digital seguro para eleições da CIPA (Comissão Interna de Prevenção de Acidentes).

**Stack Principal:**
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router DOM v6
- **Estado**: TanStack Query (React Query)
- **Formulários**: React Hook Form + Zod
- **Testes**: Jest + Testing Library

---

## 🗂️ Estrutura de Diretórios Completa

```
safety-vote/
│
├── 📄 Arquivos de Configuração Raiz
│   ├── package.json                    # Dependências e scripts npm
│   ├── tsconfig.json                   # Configuração TypeScript principal
│   ├── tsconfig.app.json               # Config TypeScript para app
│   ├── tsconfig.node.json              # Config TypeScript para Node
│   ├── vite.config.ts                  # Configuração do Vite
│   ├── tailwind.config.ts              # Configuração do Tailwind CSS
│   ├── postcss.config.js               # Configuração do PostCSS
│   ├── jest.config.js                  # Configuração do Jest
│   ├── eslint.config.js                # Configuração do ESLint
│   ├── components.json                 # Configuração shadcn/ui
│   ├── index.html                      # HTML principal
│   ├── .env.example                    # Exemplo de variáveis de ambiente
│   ├── .gitignore                      # Arquivos ignorados pelo Git
│   │
│   └── 📄 Documentação
│       ├── README.md                    # Documentação principal
│       ├── README_SUPABASE.md           # Guia de configuração Supabase
│       └── SECURITY.md                  # Políticas de segurança
│
├── 📁 public/                          # Arquivos estáticos públicos
│   ├── robots.txt                      # Configuração para crawlers
│   └── placeholder.svg                 # Imagem placeholder
│
├── 📁 src/                             # Código-fonte principal
│   │
│   ├── 📄 Arquivos de Entrada
│   │   ├── main.tsx                    # Ponto de entrada da aplicação
│   │   ├── App.tsx                     # Componente raiz e rotas
│   │   ├── App.css                     # Estilos globais do App
│   │   ├── index.css                   # Estilos globais e variáveis CSS
│   │   └── vite-env.d.ts               # Tipos do Vite
│   │
│   ├── 📁 components/                  # Componentes React reutilizáveis
│   │   │
│   │   ├── 📁 ui/                      # Componentes de UI base (shadcn/ui)
│   │   │   ├── accordion.tsx           # Acordeão expansível
│   │   │   ├── alert.tsx               # Alertas
│   │   │   ├── alert-dialog.tsx        # Diálogos de alerta
│   │   │   ├── aspect-ratio.tsx        # Controle de proporção
│   │   │   ├── avatar.tsx              # Avatar de usuário
│   │   │   ├── badge.tsx               # Badges/etiquetas
│   │   │   ├── breadcrumb.tsx          # Navegação breadcrumb
│   │   │   ├── button.tsx              # Botões
│   │   │   ├── calendar.tsx            # Calendário
│   │   │   ├── card.tsx                # Cards
│   │   │   ├── carousel.tsx            # Carrossel
│   │   │   ├── chart.tsx               # Gráficos (Recharts)
│   │   │   ├── checkbox.tsx            # Checkboxes
│   │   │   ├── collapsible.tsx         # Elementos colapsáveis
│   │   │   ├── command.tsx             # Comando/pesquisa
│   │   │   ├── context-menu.tsx        # Menu de contexto
│   │   │   ├── dialog.tsx              # Diálogos modais
│   │   │   ├── drawer.tsx              # Gavetas laterais
│   │   │   ├── dropdown-menu.tsx       # Menus dropdown
│   │   │   ├── form.tsx                # Formulários (React Hook Form)
│   │   │   ├── hover-card.tsx          # Cards com hover
│   │   │   ├── input.tsx               # Campos de entrada
│   │   │   ├── input-otp.tsx           # Input OTP (One-Time Password)
│   │   │   ├── label.tsx               # Labels
│   │   │   ├── menubar.tsx             # Barra de menu
│   │   │   ├── navigation-menu.tsx     # Menu de navegação
│   │   │   ├── pagination.tsx          # Paginação
│   │   │   ├── popover.tsx             # Popovers
│   │   │   ├── progress.tsx            # Barras de progresso
│   │   │   ├── radio-group.tsx         # Grupos de radio
│   │   │   ├── resizable.tsx           # Painéis redimensionáveis
│   │   │   ├── scroll-area.tsx         # Áreas de scroll
│   │   │   ├── select.tsx              # Seletores dropdown
│   │   │   ├── separator.tsx           # Separadores
│   │   │   ├── sheet.tsx               # Painéis laterais
│   │   │   ├── sidebar.tsx             # Barra lateral
│   │   │   ├── skeleton.tsx            # Placeholders de carregamento
│   │   │   ├── slider.tsx              # Sliders/controles deslizantes
│   │   │   ├── sonner.tsx              # Sistema de notificações Sonner
│   │   │   ├── switch.tsx              # Interruptores toggle
│   │   │   ├── table.tsx               # Tabelas
│   │   │   ├── tabs.tsx                # Abas
│   │   │   ├── textarea.tsx            # Áreas de texto
│   │   │   ├── theme-toggle.tsx        # Alternador de tema
│   │   │   ├── toast.tsx               # Notificações toast
│   │   │   ├── toaster.tsx             # Container de toasts
│   │   │   ├── toggle.tsx               # Botões toggle
│   │   │   ├── toggle-group.tsx        # Grupos de toggle
│   │   │   ├── tooltip.tsx             # Tooltips
│   │   │   └── use-toast.ts            # Hook para toasts
│   │   │
│   │   ├── 📁 auth/                    # Componentes de autenticação
│   │   │   └── ProtectedRoute.tsx      # Rota protegida (HOC)
│   │   │
│   │   ├── 📁 accessibility/           # Componentes de acessibilidade
│   │   │   └── AccessibilityTester.tsx # Testador de acessibilidade
│   │   │
│   │   ├── 📁 index/                   # Componentes da página inicial
│   │   │   ├── Header.tsx              # Cabeçalho da landing page
│   │   │   ├── Footer.tsx              # Rodapé da landing page
│   │   │   ├── HeroSection.tsx         # Seção hero
│   │   │   ├── FeaturesSection.tsx     # Seção de características
│   │   │   ├── HowItWorksSection.tsx   # Seção "Como funciona"
│   │   │   └── PricingSection.tsx      # Seção de preços
│   │   │
│   │   └── 📄 Componentes Compartilhados
│   │       ├── DashboardLayout.tsx     # Layout do dashboard
│   │       ├── ProtectedRoute.tsx      # Rota protegida (alternativa)
│   │       └── PricingTable.tsx        # Tabela de preços
│   │
│   ├── 📁 pages/                       # Páginas da aplicação
│   │   │
│   │   ├── 📁 auth/                    # Páginas de autenticação
│   │   │   ├── login.tsx               # Página de login
│   │   │   └── verify.tsx              # Página de verificação
│   │   │
│   │   ├── 📁 api/                     # Rotas de API (server-side)
│   │   │   │
│   │   │   ├── 📁 auth/                # Endpoints de autenticação
│   │   │   │   ├── send-magic-link.ts  # Enviar magic link
│   │   │   │   ├── verify-magic-link.ts # Verificar magic link
│   │   │   │   ├── validate-session.ts # Validar sessão
│   │   │   │   └── logout.ts           # Logout
│   │   │   │
│   │   │   └── 📁 audit/               # Endpoints de auditoria
│   │   │       ├── reports.ts          # Relatórios de auditoria
│   │   │       └── export.ts           # Exportação de dados
│   │   │
│   │   └── 📄 Páginas Principais
│   │       ├── Index.tsx                # Landing page
│   │       ├── Login.tsx                # Login (alternativa)
│   │       ├── Register.tsx             # Registro
│   │       ├── ForgotPassword.tsx       # Recuperação de senha
│   │       ├── Plans.tsx                # Planos/preços
│   │       │
│   │       ├── 📁 Eleições
│   │       │   ├── Elections.tsx        # Lista de eleições
│   │       │   ├── NewElection.tsx      # Criar nova eleição
│   │       │   ├── PrepareElection.tsx  # Preparar eleição
│   │       │   ├── MonitorElection.tsx  # Monitorar eleição
│   │       │   ├── ElectionResults.tsx  # Resultados da eleição
│   │       │   ├── ElectionVoters.tsx   # Eleitores da eleição
│   │       │   └── Voting.tsx           # Página de votação
│   │       │
│   │       ├── 📁 Dashboards
│   │       │   ├── DashboardAdmin.tsx   # Dashboard do administrador
│   │       │   ├── DashboardRH.tsx      # Dashboard de RH
│   │       │   └── DashboardEleitor.tsx # Dashboard do eleitor
│   │       │
│   │       ├── 📁 Gestão
│   │       │   ├── Companies.tsx        # Lista de empresas
│   │       │   ├── CompanyRegister.tsx  # Cadastro de empresa
│   │       │   ├── Users.tsx            # Usuários
│   │       │   ├── SystemUsers.tsx      # Usuários do sistema
│   │       │   ├── Voters.tsx           # Eleitores
│   │       │   └── Candidates.tsx       # Candidatos
│   │       │
│   │       ├── 📁 Configurações
│   │       │   ├── Settings.tsx         # Configurações gerais
│   │       │   ├── SystemSettings.tsx   # Configurações do sistema
│   │       │   ├── RHSettings.tsx       # Configurações de RH
│   │       │   ├── Security.tsx         # Segurança
│   │       │   ├── Seguranca.tsx        # Segurança (alternativa)
│   │       │   └── MinhasChaves.tsx     # Gerenciamento de chaves
│   │       │
│   │       ├── 📁 Relatórios e Auditoria
│   │       │   ├── Reports.tsx          # Relatórios
│   │       │   ├── SystemReports.tsx    # Relatórios do sistema
│   │       │   └── Historico.tsx        # Histórico
│   │       │
│   │       ├── 📁 Público
│   │       │   └── ResultadosPublicos.tsx # Resultados públicos
│   │       │
│   │       ├── 📁 Compliance
│   │       │   ├── CipaCompliance.tsx   # Conformidade CIPA
│   │       │   ├── TermosServico.tsx    # Termos de serviço
│   │       │   └── PoliticaPrivacidade.tsx # Política de privacidade
│   │       │
│   │       └── NotFound.tsx             # Página 404
│   │
│   ├── 📁 hooks/                       # Hooks personalizados React
│   │   ├── useAuth.ts                  # Hook de autenticação
│   │   ├── useUserInfo.ts              # Hook de informações do usuário
│   │   ├── useMenuItems.ts             # Hook de itens de menu
│   │   ├── use-toast.ts                # Hook de toasts
│   │   └── use-mobile.tsx              # Hook para detectar mobile
│   │
│   ├── 📁 lib/                         # Bibliotecas e utilitários
│   │   │
│   │   ├── 📁 auth/                    # Sistema de autenticação
│   │   │   └── magic-link.ts           # Lógica de magic link
│   │   │
│   │   ├── 📁 audit/                   # Sistema de auditoria
│   │   │   └── audit-system.ts         # Lógica de auditoria
│   │   │
│   │   └── 📄 Utilitários
│   │       ├── supabase.ts             # Cliente Supabase
│   │       ├── utils.ts                # Funções utilitárias gerais
│   │       └── constants.ts            # Constantes da aplicação
│   │
│   ├── 📁 services/                    # Serviços de API
│   │   ├── supabaseService.ts          # Serviço base do Supabase
│   │   ├── authService.ts              # Serviço de autenticação
│   │   └── companyService.ts           # Serviço de empresas
│   │
│   ├── 📁 middleware/                  # Middlewares
│   │   └── auth.ts                     # Middleware de autenticação
│   │
│   ├── 📁 utils/                       # Utilitários adicionais
│   │   └── keyGenerator.ts             # Gerador de chaves
│   │
│   ├── 📁 test/                        # Configuração de testes
│   │   └── setup.ts                    # Setup do Jest
│   │
│   └── 📁 types/                       # Definições de tipos TypeScript
│       └── (tipos definidos inline nos arquivos)
│
├── 📁 supabase/                        # Configuração do Supabase
│   │
│   ├── config.toml                     # Configuração do Supabase local
│   ├── config.ts                       # Config TypeScript do Supabase
│   ├── seed.sql                        # Dados de seed para desenvolvimento
│   │
│   └── 📁 migrations/                  # Migrações do banco de dados
│       └── 20241201000000_initial_setup.sql # Migração inicial
│
├── 📁 database/                        # Scripts SQL adicionais
│   ├── schema.sql                      # Schema completo do banco
│   ├── secure-schema.sql               # Schema com segurança
│   └── rls-policies.sql                # Políticas RLS (Row Level Security)
│
└── 📁 .claude/                         # Configurações do Claude
    └── settings.local.json             # Configurações locais

```

---

## 📦 Dependências Principais

### Frontend Core
- `react` (^18.3.1) - Biblioteca React
- `react-dom` (^18.3.1) - React DOM
- `react-router-dom` (^6.26.2) - Roteamento
- `typescript` (^5.5.3) - TypeScript

### UI & Estilização
- `tailwindcss` (^3.4.11) - Framework CSS utilitário
- `@radix-ui/*` - Componentes acessíveis (múltiplos pacotes)
- `lucide-react` (^0.441.0) - Ícones
- `framer-motion` (^12.16.0) - Animações
- `next-themes` (^0.3.0) - Gerenciamento de tema

### Formulários & Validação
- `react-hook-form` (^7.53.0) - Gerenciamento de formulários
- `@hookform/resolvers` (^3.9.0) - Resolvers para validação
- `zod` (^3.23.8) - Validação de esquemas

### Estado & Dados
- `@tanstack/react-query` (^5.56.2) - Gerenciamento de estado servidor
- `@supabase/supabase-js` (^2.50.0) - Cliente Supabase

### Segurança & Criptografia
- `crypto-js` (^4.2.0) - Criptografia AES-256
- `uuid` (^9.0.1) - Geração de UUIDs
- `nodemailer` (^6.9.8) - Envio de emails

### Utilitários
- `date-fns` (^3.6.0) - Manipulação de datas
- `clsx` (^2.1.1) - Concatenação de classes
- `tailwind-merge` (^2.5.2) - Merge de classes Tailwind
- `class-variance-authority` (^0.7.1) - Variantes de componentes
- `sonner` (^1.5.0) - Sistema de notificações

### Gráficos & Visualização
- `recharts` (^2.12.7) - Gráficos React

### Build & Dev Tools
- `vite` (^5.4.1) - Build tool
- `@vitejs/plugin-react-swc` (^3.5.0) - Plugin React para Vite
- `eslint` (^9.9.0) - Linter
- `jest` (^29.7.0) - Framework de testes
- `@testing-library/react` (^14.1.2) - Testes de componentes

---

## 🔧 Scripts NPM Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia servidor de desenvolvimento (porta 8080)
npm run build            # Build para produção
npm run build:dev        # Build em modo desenvolvimento
npm run preview          # Preview da build de produção
npm run lint             # Executa ESLint
npm run type-check       # Verifica tipos TypeScript
```

### Testes
```bash
npm run test             # Executa testes Jest
npm run test:watch       # Modo watch dos testes
npm run test:coverage    # Cobertura de testes
npm run accessibility:test # Testes de acessibilidade (axe-core)
```

### Banco de Dados (Supabase)
```bash
npm run supabase:start   # Inicia Supabase local
npm run supabase:stop    # Para Supabase local
npm run supabase:status  # Status do Supabase
npm run db:migrate       # Executa migrações
npm run db:reset         # Reseta banco de dados
npm run db:seed          # Popula com dados de exemplo
```

### Segurança
```bash
npm run security:audit   # Auditoria de segurança (npm audit)
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `companies` - Empresas
- `id` (UUID, PK)
- `razao_social`, `nome_fantasia`, `cnpj` (UNIQUE)
- `cnae`, `grupo`, `grau_risco`, `setor`
- Endereço completo (endereco, numero, complemento, bairro, cidade, estado, cep)
- `telefone`, `email`
- `created_at`, `updated_at`

#### `users` - Usuários
- `id` (UUID, PK)
- `name`, `email` (UNIQUE)
- `role` (ENUM: 'admin', 'rh', 'eleitor')
- `company_id` (FK → companies)
- `created_at`, `updated_at`

#### `elections` - Eleições
- `id` (UUID, PK)
- `title`, `description`
- `company_id` (FK → companies)
- `start_date`, `end_date` (TIMESTAMP)
- `status` (ENUM: 'draft', 'active', 'finished')
- `created_at`, `updated_at`

#### `candidates` - Candidatos
- `id` (UUID, PK)
- `name`, `photo_url`, `description`
- `election_id` (FK → elections)
- `votes_count` (INTEGER, DEFAULT 0)
- `created_at`, `updated_at`

#### `votes` - Votos
- `id` (UUID, PK)
- `election_id` (FK → elections)
- `candidate_id` (FK → candidates)
- `voter_id` (FK → users)
- `created_at`
- UNIQUE: (election_id, voter_id)

#### `audit_logs` - Logs de Auditoria
- Registro de todas as ações do sistema
- Rastreamento de segurança
- Histórico completo

---

## 🔐 Segurança Implementada

### Autenticação
- **Magic Link**: Autenticação sem senha
- **JWT Tokens**: Tokens seguros
- **Session Management**: Gerenciamento de sessões
- **Rate Limiting**: Proteção contra força bruta

### Criptografia
- **AES-256**: Criptografia de votos
- **SHA-256**: Hash para integridade
- **Chaves Rotacionáveis**: Sistema de rotação de chaves

### Row Level Security (RLS)
- Políticas por empresa
- Controle de acesso baseado em roles
- Isolamento de dados

### Auditoria
- Log completo de ações
- Rastreamento de alterações
- Exportação de relatórios
- Alertas de segurança

---

## ♿ Acessibilidade

### Conformidade WCAG 2.1 AA
- Contraste adequado de cores
- Navegação por teclado completa
- Suporte a leitores de tela
- Textos alternativos em imagens
- Testes automatizados com axe-core

---

## 📊 Rotas da Aplicação

### Públicas
- `/` - Landing page
- `/login` - Login
- `/register` - Registro
- `/forgot-password` - Recuperação de senha
- `/plans` - Planos
- `/resultados-publicos` - Resultados públicos

### Autenticadas - Eleições
- `/elections` - Lista de eleições
- `/elections/new` - Nova eleição
- `/elections/:id/edit` - Editar eleição
- `/elections/:id/monitor` - Monitorar eleição
- `/elections/:id/results` - Resultados
- `/elections/:id/voters` - Eleitores
- `/voting` - Votação

### Dashboards
- `/dashboard-admin` - Dashboard Admin
- `/dashboard-rh` - Dashboard RH
- `/dashboard-eleitor` - Dashboard Eleitor

### Gestão
- `/companies` - Empresas
- `/company-register` - Cadastro de empresa
- `/users` - Usuários
- `/system-users` - Usuários do sistema
- `/voters` - Eleitores
- `/candidates` - Candidatos

### Configurações
- `/settings` - Configurações gerais
- `/system-settings` - Configurações do sistema
- `/rh-settings` - Configurações RH
- `/security` - Segurança
- `/minhas-chaves` - Gerenciamento de chaves

### Relatórios
- `/reports` - Relatórios
- `/system-reports` - Relatórios do sistema
- `/historico` - Histórico

### Compliance
- `/cipa-compliance` - Conformidade CIPA
- `/termos-servico` - Termos de serviço
- `/politica-privacidade` - Política de privacidade

---

## 🚀 Como Começar

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd safety-vote
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas configurações
   ```

4. **Inicie o Supabase local**
   ```bash
   npm run supabase:start
   ```

5. **Execute as migrações**
   ```bash
   npm run db:migrate
   ```

6. **Popule o banco com dados de exemplo**
   ```bash
   npm run db:seed
   ```

7. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

8. **Acesse a aplicação**
   ```
   http://localhost:8080
   ```

---

## 📝 Notas Importantes

- O projeto usa **Vite** como build tool (não Next.js, apesar do README mencionar)
- Porta padrão: **8080** (configurada em `vite.config.ts`)
- O projeto usa **React Router DOM** para roteamento (não Next.js Router)
- Componentes UI baseados em **shadcn/ui** e **Radix UI**
- Sistema de temas com **next-themes**
- Estado servidor gerenciado com **TanStack Query**

---

## 🔄 Próximos Passos para Refatoração

1. Organizar melhor a estrutura de pastas
2. Separar componentes por domínio
3. Criar tipos TypeScript centralizados
4. Implementar testes unitários e de integração
5. Documentar APIs e componentes
6. Otimizar performance
7. Melhorar acessibilidade
8. Implementar CI/CD

---

**Última atualização**: 2026-02-20
**Versão do Projeto**: 0.0.0
