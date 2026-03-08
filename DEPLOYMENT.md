# Deployment Guide - Safety Vote

## Overview

Safety Vote suporta deployment em múltiplos ambientes:
1. **GitHub Pages** (Production) - automático ao push em `main`
2. **Staging** - automático ao push em `develop`
3. **Local/Docker** - para desenvolvimento
4. **Vercel/Netlify** - alternativas de hosting

## Environments

### Production (GitHub Pages)
- **Trigger**: Push em `main` ou manual via `workflow_dispatch`
- **URL**: `https://{owner}.github.io/safety-vote/`
- **Branch**: `main`
- **Checks**: ESLint, TypeScript, Tests, Security

### Staging
- **Trigger**: Push em `develop` ou manual
- **Build artifacts**: Salvos por 7 dias
- **Tests**: Passando (continue-on-error)
- **Branch**: `develop`

### Development (Local)
```bash
npm install
npm run dev
# Acessa em http://localhost:8080
```

## Pre-deployment Checklist

- [ ] Todos os testes passando (`npm test`)
- [ ] Linter sem erros (`npm run lint`)
- [ ] TypeScript compilando (`npm run type-check`)
- [ ] Build sem erros (`npm run build`)
- [ ] Sem vulnerabilidades críticas (`npm audit`)
- [ ] Changelog atualizado
- [ ] Version bumped em `package.json` (se release)

## GitHub Actions Workflows

### 1. CI Workflow (`ci.yml`)
Executa em: push/PR para `main` ou `develop`

```
├── test
│   ├── ESLint
│   ├── Type Check
│   ├── Build
│   └── Tests + Coverage
├── security
│   ├── npm audit
│   └── Dependency check
└── accessibility
    ├── Build
    └── axe-core tests
```

### 2. Staging Deployment (`deploy-staging.yml`)
Executa em: push para `develop`

```
├── Checkout
├── Setup Node
├── Install
├── Test
├── Build
├── Upload artifacts
└── Deployment notification
```

### 3. Production Deployment (`deploy-production.yml`)
Executa em: push para `main` ou tags `v*.*.*`

```
├── Build (com checks)
│   ├── ESLint
│   ├── Type check
│   ├── Tests
│   └── Build
├── Deploy (GitHub Pages)
└── Notification
```

## Manual Deployment

### Deploy to Production (GitHub Pages)

```bash
# 1. Ensure all checks pass
npm run lint
npm run type-check
npm test

# 2. Build
npm run build

# 3. Push to main
git push origin main

# GitHub Actions irá:
# - Correr CI checks
# - Fazer build
# - Fazer deploy automaticamente
```

### Deploy to Staging

```bash
# 1. Commit changes
git add .
git commit -m "feature: ..."

# 2. Push to develop
git push origin develop

# GitHub Actions irá:
# - Correr testes
# - Fazer build
# - Salvar artifacts
```

### Local Build & Test

```bash
# Build for production
npm run build

# Test build localmente
npm run preview
# Acessa em http://localhost:4173

# Executar testes
npm test
npm test -- --coverage

# Type check
npm run type-check
```

## Environment Variables

Criar `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...

# Optional - Feature flags
VITE_ENABLE_AUDIT=true
VITE_ENABLE_RLS=true
```

## Build Output

Artifacts são gerados em `dist/`:

```
dist/
├── index.html          # Entry point
├── assets/
│   ├── index-*.js      # Main bundle
│   ├── react-vendor-*.js
│   ├── vendor-*.js
│   └── *.css
└── safety-vote/        # Subpath (base: "/safety-vote/")
```

## Troubleshooting

### Build fails with "chunk too large"
```bash
# Já otimizado no vite.config.ts
# Chunks são split automaticamente:
# - react-vendor: ~520KB
# - vendor: ~800KB
# - main: ~915KB
```

### Tests fail in CI but pass locally
```bash
# Pode ser variáveis de ambiente
# Checar em .github/workflows/ci.yml
# Adicionar secrets se necessário
```

### GitHub Pages 404
```bash
# Checar base path em vite.config.ts
base: "/safety-vote/"

# Se mudar, atualizar em:
# - vite.config.ts
# - .github/workflows/deploy-production.yml
```

## Performance Monitoring

### Lighthouse Scores
Target: **≥ 90** em todos os scores
- Performance
- Accessibility
- Best Practices
- SEO

### Bundle Analysis
```bash
npm run build -- --analyze
# ou usar https://vitejs.github.io/guide/build.html
```

## Rollback Procedure

### GitHub Pages
1. Push commit anterior para `main`
2. GitHub Actions redeploy automaticamente

### Staging
1. Revert push em `develop`
2. GitHub Actions redeploy

## Release Process

```bash
# 1. Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 2. Push tag
git push origin v1.0.0

# 3. GitHub Actions automaticamente:
# - Corre CI
# - Deploy para production
# - Cria GitHub release
```

## Monitoring & Alerts

### Health Checks
- GitHub Actions status: https://github.com/owner/repo/actions
- GitHub Pages status: https://www.githubstatus.com/

### Security
- npm audit: Executado em cada CI run
- Dependabot: Configure em repo settings
- OWASP scanning: Considerar adicionar

## Contact & Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Security: security@example.com (configure)

---

**Last Updated**: 2026-03-08
**Maintained By**: Safety Vote Squad
