# Safety Vote - Sistema de Votação Digital Seguro

Sistema completo de votação digital para eleições da CIPA (Comissão Interna de Prevenção de Acidentes) com foco em segurança, auditoria e acessibilidade.

## 🚀 Características Principais

### 🔐 Segurança Avançada
- **Autenticação Magic Link**: Sistema seguro sem senhas
- **Criptografia de Votos**: Votos criptografados com AES-256
- **Auditoria Completa**: Log detalhado de todas as ações
- **Row Level Security (RLS)**: Políticas de segurança no banco de dados
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Validação de Integridade**: Hash SHA-256 para verificação de votos

### ♿ Acessibilidade
- **WCAG 2.1 AA**: Conformidade com padrões de acessibilidade
- **Testes Automatizados**: Integração com axe-core
- **Navegação por Teclado**: Suporte completo
- **Leitores de Tela**: Compatibilidade total

### 📊 Auditoria e Relatórios
- **Logs Detalhados**: Registro de todas as ações do sistema
- **Relatórios Exportáveis**: CSV, JSON e PDF
- **Monitoramento de Segurança**: Alertas automáticos
- **Rastreabilidade Completa**: Histórico completo de ações

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com SSR
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Radix UI**: Componentes acessíveis
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de esquemas

### Backend
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Banco de dados relacional
- **Row Level Security**: Segurança a nível de linha
- **Edge Functions**: Funções serverless

### Segurança
- **crypto-js**: Criptografia AES-256
- **nodemailer**: Envio de emails seguros
- **uuid**: Geração de identificadores únicos
- **JWT**: Tokens de autenticação

### Testes e Qualidade
- **Jest**: Framework de testes
- **Testing Library**: Testes de componentes
- **axe-core**: Testes de acessibilidade
- **ESLint**: Análise estática de código

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Docker (para Supabase local)
- Git

## 🚀 Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd safety-vote
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Configure o Ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security Keys
JWT_SECRET=your-jwt-secret-32-chars-minimum
MAGIC_LINK_SECRET=your-magic-link-secret
ENCRYPTION_KEY=your-32-character-encryption-key

# Email Configuration
SMTP_HOST=localhost
SMTP_PORT=54325
SMTP_FROM=noreply@your-domain.com
```

### 4. Inicie o Supabase Local
```bash
npm run supabase:start
```

### 5. Execute as Migrações
```bash
npm run db:migrate
```

### 6. Popule o Banco com Dados de Exemplo
```bash
npm run db:seed
```

### 7. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📚 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev              # Inicia o servidor de desenvolvimento
npm run build            # Constrói a aplicação para produção
npm run preview          # Visualiza a build de produção
npm run lint             # Executa o linter
npm run type-check       # Verifica tipos TypeScript
```

### Testes
```bash
npm run test             # Executa os testes
npm run test:watch       # Executa os testes em modo watch
npm run test:coverage    # Executa os testes com cobertura
```

### Acessibilidade
```bash
npm run accessibility:test  # Executa testes de acessibilidade
```

### Banco de Dados
```bash
npm run db:migrate       # Executa migrações
npm run db:reset         # Reseta o banco de dados
npm run db:seed          # Popula com dados de exemplo
```

### Supabase
```bash
npm run supabase:start   # Inicia Supabase local
npm run supabase:stop    # Para Supabase local
npm run supabase:status  # Verifica status do Supabase
```

### Segurança
```bash
npm run security:audit   # Auditoria de segurança das dependências
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── auth/           # Componentes de autenticação
│   ├── accessibility/  # Componentes de acessibilidade
│   └── ui/             # Componentes de interface
├── hooks/              # Hooks personalizados
│   └── useAuth.ts      # Hook de autenticação
├── lib/                # Bibliotecas e utilitários
│   ├── auth/           # Sistema de autenticação
│   ├── audit/          # Sistema de auditoria
│   └── utils/          # Funções utilitárias
├── middleware/         # Middlewares de autenticação
├── pages/              # Páginas da aplicação
│   ├── api/            # API routes
│   ├── auth/           # Páginas de autenticação
│   └── dashboard/      # Páginas do dashboard
├── test/               # Configuração de testes
└── types/              # Definições de tipos TypeScript

supabase/
├── config.toml         # Configuração do Supabase
├── migrations/         # Migrações do banco de dados
└── seed.sql           # Dados de exemplo
```

## 🔐 Recursos de Segurança

### Autenticação Magic Link
- Tokens únicos com expiração
- Validação de CPF opcional
- Rate limiting por IP
- Logs de tentativas de acesso

### Criptografia de Votos
- Algoritmo AES-256 para criptografia
- Hash SHA-256 para integridade
- Chaves de criptografia rotacionáveis
- Verificação de integridade automática

### Row Level Security (RLS)
- Políticas por empresa
- Controle de acesso baseado em roles
- Isolamento de dados por organização
- Auditoria de acesso a dados

### Sistema de Auditoria
- Log de todas as ações
- Rastreamento de alterações
- Exportação de relatórios
- Alertas de segurança

## ♿ Recursos de Acessibilidade

### Conformidade WCAG 2.1 AA
- Contraste adequado de cores
- Navegação por teclado
- Suporte a leitores de tela
- Textos alternativos em imagens

### Testes Automatizados
- Integração com axe-core
- Verificação contínua de acessibilidade
- Relatórios detalhados de violações
- Sugestões de correção

## 📊 Monitoramento e Relatórios

### Tipos de Relatórios
- **Geral**: Visão geral do sistema
- **Segurança**: Eventos de segurança
- **Votos**: Análise de votações
- **Usuários**: Atividade dos usuários
- **Eleições**: Estatísticas eleitorais

### Formatos de Exportação
- **CSV**: Para análise em planilhas
- **JSON**: Para integração com sistemas
- **PDF**: Para documentação oficial

## 🔧 Configuração de Produção

### Variáveis de Ambiente Obrigatórias
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Security
JWT_SECRET=your-strong-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
MAGIC_LINK_SECRET=your-magic-link-secret

# Email
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

### Checklist de Segurança
- [ ] Configurar HTTPS
- [ ] Configurar CSP headers
- [ ] Configurar rate limiting
- [ ] Configurar backup automático
- [ ] Configurar monitoramento
- [ ] Configurar alertas de segurança
- [ ] Testar recuperação de desastres
- [ ] Configurar rotação de chaves

## 🧪 Testes

### Executar Todos os Testes
```bash
npm test
```

### Testes de Acessibilidade
```bash
npm run accessibility:test
```

### Cobertura de Testes
```bash
npm run test:coverage
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use TypeScript para tipagem estática
- Siga as convenções do ESLint
- Escreva testes para novas funcionalidades
- Documente APIs e componentes
- Mantenha acessibilidade em mente

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

### Documentação
- [Documentação de Segurança](SECURITY.md)
- [Guia de Acessibilidade](docs/accessibility.md)
- [API Reference](docs/api.md)

### Contato
- Email: suporte@safety-vote.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

### Reportar Vulnerabilidades
Para reportar vulnerabilidades de segurança, envie um email para:
security@safety-vote.com

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Next.js](https://nextjs.org) - Framework React
- [Radix UI](https://radix-ui.com) - Componentes acessíveis
- [axe-core](https://github.com/dequelabs/axe-core) - Testes de acessibilidade
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS

---

**Safety Vote** - Democratizando eleições com segurança e acessibilidade 🗳️✨
