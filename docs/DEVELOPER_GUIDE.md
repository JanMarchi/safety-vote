# Safety Vote - Developer Guide

## Project Setup

### Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm 8+
- Git
- Docker & Docker Compose (for Supabase local)
- Visual Studio Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin
  - Tailwind CSS IntelliSense

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/owner/safety-vote.git
cd safety-vote
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Environment
```bash
cp .env.example .env.local
```

#### 4. Configure Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...

# Features (optional)
VITE_ENABLE_AUDIT=true
VITE_ENABLE_RLS=true
VITE_LOG_LEVEL=debug
```

#### 5. Start Development Server
```bash
npm run dev
# Opens http://localhost:8080
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── voting/         # Voting interface
│   ├── results/        # Results display
│   ├── admin/          # Admin dashboard
│   ├── audit/          # Audit UI
│   ├── accessibility/  # A11y components
│   └── ui/             # Base UI components (shadcn)
├── hooks/              # Custom React hooks
│   └── useAuth.tsx     # Authentication hook
├── lib/                # Utility functions
│   ├── auth/           # Auth utilities
│   ├── encryption/     # Vote encryption
│   ├── audit/          # Audit system
│   ├── web-vitals.ts   # Performance monitoring
│   └── utils/          # General utilities
├── pages/              # Page components (routing)
│   ├── api/            # API routes (Supabase Edge Functions)
│   └── auth/           # Auth pages
├── tests/              # Test files
│   ├── auth/           # Auth tests
│   ├── components/     # Component tests
│   ├── rls/            # RLS tests
│   └── setup.ts        # Test setup
├── App.tsx             # Root component
├── main.tsx            # Entry point
├── index.css           # Global styles
└── vite-env.d.ts       # Vite environment types
```

## Development Workflow

### Create New Feature

#### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature
# or
git switch -c feature/your-feature
```

#### 2. Development
```bash
npm run dev
# Make changes
# Test locally
```

#### 3. Test
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/components/voting.test.tsx

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

#### 4. Lint & Type Check
```bash
# ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix

# TypeScript
npm run type-check
```

#### 5. Build
```bash
npm run build
npm run preview
# Test production build
```

#### 6. Commit
```bash
git add .
git commit -m "feat: description of changes"
# Follow conventional commits
```

#### 7. Push & Create PR
```bash
git push origin feature/your-feature
# Create PR on GitHub
```

## Testing

### Unit Tests (Jest)

#### Write Tests
```typescript
// src/components/VotingForm.test.tsx
import { render, screen } from '@testing-library/react'
import VotingForm from './VotingForm'

describe('VotingForm', () => {
  it('should render candidates', () => {
    const candidates = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ]
    render(<VotingForm candidates={candidates} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
  })
})
```

#### Run Tests
```bash
# All tests
npm test

# Specific file
npm test -- VotingForm.test.tsx

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Integration Tests

#### Test with Supabase
```typescript
// src/tests/integration/election.test.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

describe('Election Integration', () => {
  it('should create election', async () => {
    const { data, error } = await supabase
      .from('elections')
      .insert({ title: 'Test Election' })

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

### E2E Tests (Playwright - Future)

```typescript
// e2e/voting.spec.ts
import { test, expect } from '@playwright/test'

test('voting flow', async ({ page }) => {
  await page.goto('http://localhost:8080')
  await page.fill('input[type="email"]', 'voter@test.com')
  await page.click('button:has-text("Send Magic Link")')

  // Check for success message
  await expect(page.locator('text=Link sent')).toBeVisible()
})
```

## Code Standards

### TypeScript

```typescript
// ✅ Good
interface ElectionProps {
  title: string
  description: string
  status: 'draft' | 'active' | 'finished'
}

const Election = ({ title, description, status }: ElectionProps) => {
  return <div>{title}</div>
}

// ❌ Bad
const Election = (props: any) => {
  return <div>{props.title}</div>
}
```

### Components

```typescript
// ✅ Good - Proper typing and naming
interface VotingFormProps {
  candidates: Candidate[]
  onVote: (candidateId: string) => Promise<void>
  isLoading?: boolean
}

export const VotingForm = memo(
  ({ candidates, onVote, isLoading }: VotingFormProps) => {
    // Implementation
  }
)

// ❌ Bad - No typing, unclear purpose
const VotingForm = (props) => {
  // Implementation
}
```

### Functions

```typescript
// ✅ Good - Pure function, no side effects
function calculateVotePercentage(votes: number, total: number): number {
  if (total === 0) return 0
  return (votes / total) * 100
}

// ❌ Bad - Side effects, global state
let totalVotes = 0
function calculatePercentage(votes: number) {
  totalVotes += votes
  return (votes / totalVotes) * 100
}
```

### React Hooks

```typescript
// ✅ Good - Proper dependency array
useEffect(() => {
  fetchElection(electionId)
}, [electionId])

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchElection(electionId)
}, [])
```

### Naming Conventions

```typescript
// Components
export function ElectionList() { }
export const VotingForm = () => { }

// Functions
function validateEmail(email: string) { }
export const encryptVote = (vote: string) => { }

// Constants
const MAX_CANDIDATES = 10
const DEFAULT_TIMEOUT = 5000

// Interfaces/Types
interface Election { }
type VoteStatus = 'pending' | 'cast' | 'verified'
```

## Git Workflow

### Branch Naming
```bash
feature/election-creation
fix/vote-encryption-bug
docs/api-documentation
chore/dependency-update
test/add-voting-tests
```

### Commit Messages
```bash
# Feature
feat: add election creation feature

# Bug fix
fix: prevent double voting

# Documentation
docs: update API documentation

# Tests
test: add voting flow tests

# Refactor
refactor: simplify encryption module

# Chore
chore: update dependencies
```

### Pull Request

1. **Create feature branch** from `develop`
2. **Make changes** with clean commits
3. **Push to GitHub**
4. **Create PR** with:
   - Descriptive title
   - Summary of changes
   - Screenshots (if UI)
   - Link to issue (if applicable)
5. **Wait for CI** (linting, tests, build)
6. **Address feedback** if needed
7. **Merge** when approved

### Merging
```bash
# Ensure branch is up to date
git pull origin develop

# Merge into develop
git merge feature/your-feature

# Delete branch
git branch -d feature/your-feature
```

## Debugging

### Browser DevTools

#### Console
```javascript
// Log Web Vitals
window.__WEB_VITALS__ // See monitoring data

// Debug encrypted votes
console.log(encryptedVote)
```

#### React DevTools
- Component tree inspection
- Props debugging
- State changes tracking

#### Network Tab
- API call inspection
- Response verification
- Performance analysis

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:8080",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverride": {
        "${webRoot}/*": "${workspaceFolder}/src/*"
      }
    }
  ]
}
```

### API Debugging

```bash
# Test Supabase queries
curl -H "Authorization: Bearer {token}" \
  https://xxxxx.supabase.co/rest/v1/elections

# Test Edge Functions
curl -X POST https://xxxxx.supabase.co/functions/v1/vote \
  -H "Authorization: Bearer {token}" \
  -d '{"vote":"encrypted"}'
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy load heavy components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Results = lazy(() => import('./pages/Results'))

// Use in routes
<Routes>
  <Route path="/admin" element={
    <Suspense fallback={<Loading />}>
      <AdminDashboard />
    </Suspense>
  } />
</Routes>
```

### Memoization

```typescript
// Memoize expensive components
const VotingForm = memo(({ candidates }) => {
  // Only re-renders if candidates change
  return <>{/* render */}</>
})

// Memoize callback functions
const handleVote = useCallback((candidateId) => {
  submitVote(candidateId)
}, [])
```

### Web Vitals

```typescript
// Monitor performance
import { initWebVitalsMonitoring } from '@/lib/web-vitals'

initWebVitalsMonitoring()
// Automatically tracks LCP, FID, CLS, etc.
```

## Security Best Practices

### Secrets Management

```bash
# Never commit .env files
echo ".env.local" >> .gitignore

# Use environment variables for secrets
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
```

### Authentication

```typescript
// ✅ Good - Use magic links
const { data } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})

// ❌ Bad - Store passwords
localStorage.setItem('password', password)
```

### Data Validation

```typescript
// ✅ Good - Validate input
import { z } from 'zod'

const emailSchema = z.string().email()
const validated = emailSchema.parse(userEmail)

// ❌ Bad - No validation
const email = userInput
```

### HTTPS Only

```typescript
// ✅ Good
const url = 'https://api.example.com'

// ❌ Bad
const url = 'http://api.example.com'
```

## Deployment

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

### GitHub Pages Deployment

```bash
# Automatic on push to main
git push origin main

# Check workflow status
gh run list
```

### Manual Deployment

```bash
# Build and preview locally first
npm run build
npm run preview

# Then push to trigger CI/CD
git push origin main
```

## Troubleshooting

### Common Issues

#### "Module not found"
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

#### "Port 8080 already in use"
```bash
# Use different port
npm run dev -- --port 3000
```

#### "Supabase connection failed"
```bash
# Check environment variables
cat .env.local | grep SUPABASE

# Test connection
curl https://{url}.supabase.co/rest/v1/
```

#### "Tests failing"
```bash
# Run with verbose output
npm test -- --verbose

# Debug specific test
npm test -- VotingForm.test.tsx --no-coverage
```

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Supabase Docs](https://supabase.io/docs)

### Tools
- [Jest Testing](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

### Learning
- [React Hooks Guide](https://react.dev/reference/react)
- [TypeScript Tips](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)
- [Web Performance](https://web.dev/performance/)

## Getting Help

### Community
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions
- Pull Requests: Contribute changes

### Contact
- Email: dev@example.com
- Slack: #development
- Documentation: docs/

## Contributing

### Code Review Checklist
- [ ] Code follows style guide
- [ ] Tests are added/updated
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] No security issues
- [ ] Performance acceptable

### Before Submitting PR
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm test`
- [ ] Type check: `npm run type-check`
- [ ] Build: `npm run build`
- [ ] Commit message follows convention
- [ ] PR description is clear

---

**Version**: 1.0
**Last Updated**: 2026-03-08
**Maintained By**: Development Team
