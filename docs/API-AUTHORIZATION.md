# API Authorization Guide — Story 1.4

## Overview

All API endpoints in the Safety Vote system require authorization. This guide explains how authorization works, which roles have which permissions, and how to integrate authorization checks into your API endpoints.

---

## Permission Model

### Three Fixed Roles

| Role | Description | Use Case |
|------|-------------|----------|
| **admin** | Full system access | System administrators, super users |
| **rh** | Human resources, manage elections | HR staff, election organizers |
| **eleitor** | Regular voter | All employees/members |

### Permission Hierarchy

```
Admin
  └─ All permissions (system-wide access)

RH
  └─ Manage users (within company)
  └─ Create/manage elections
  └─ View votes and results
  └─ View audit logs
  └─ Can also vote

Eleitor
  └─ Vote in elections
  └─ View own vote
  └─ View election results
```

---

## Permission Matrix

| Permission | Admin | RH | Eleitor |
|------------|-------|----|----|
| `canViewAllUsers` | ✅ | ✅ | ❌ |
| `canManageUsers` | ✅ | ✅ | ❌ |
| `canCreateElections` | ✅ | ✅ | ❌ |
| `canManageCandidates` | ✅ | ✅ | ❌ |
| `canViewVotes` | ✅ | ✅ | ❌ |
| `canViewAuditLogs` | ✅ | ✅ | ❌ |
| `canViewResults` | ✅ | ✅ | ✅ |
| `canVote` | ✅ | ✅ | ✅ |
| `canViewOwnVote` | ✅ | ✅ | ✅ |

---

## Authorization Flow

### Request → Authorization → Response

```
1. User makes API request with session token
   ↓
2. Middleware extracts user from session
   ↓
3. Check: Is user authenticated?
   YES → Continue
   NO  → 401 Unauthorized
   ↓
4. Check: Does user's role have permission?
   YES → Execute endpoint
   NO  → 403 Forbidden + Log to audit_logs
   ↓
5. Response with appropriate status
```

---

## Error Responses

### 401 Unauthorized

**When:** User is not authenticated or session is invalid

**Response:**
```json
{
  "error": "Missing or invalid session",
  "status": 401
}
```

**Common causes:**
- Missing Authorization header
- Expired session token
- Invalid/tampered token signature
- User not found in database

### 403 Forbidden

**When:** User is authenticated but lacks required permission

**Response:**
```json
{
  "error": "Insufficient permissions to create elections",
  "status": 403
}
```

**Common causes:**
- User role doesn't have required permission
- User trying to access another company's data
- User trying admin-only operation without admin role

---

## Using Authorization in API Routes

### Example 1: Simple Permission Check

```typescript
// POST /api/elections (create election — RH only)
import { authorize, handleAuthError } from '@/middleware/authorize';

export default async function handler(req, res) {
  try {
    // Extract user context from session (set by session middleware)
    const { userId, companyId } = req.user;

    // Check authentication + permission (throws on failure)
    const context = await authorize(
      userId,
      companyId,
      'canCreateElections',
      supabase
    );

    // User is authorized, proceed with creating election
    const { data: election, error } = await supabase
      .from('elections')
      .insert({
        company_id: context.companyId,
        created_by: context.userId,
        title: req.body.title,
        // ... other fields
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(election);
  } catch (error) {
    handleAuthError(error, res);
  }
}
```

### Example 2: Multiple Conditions

```typescript
// PUT /api/users/:id (update user — RH in same company)
export default async function handler(req, res) {
  try {
    const { userId, companyId } = req.user;
    const targetUserId = req.query.id as string;

    // Check authorization
    const context = await authorize(userId, companyId, 'canManageUsers', supabase);

    // Additional check: RH can only manage users in their company
    const { data: targetUser } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', targetUserId)
      .single();

    if (targetUser?.company_id !== context.companyId) {
      throw new AuthorizationError(403, 'Cannot manage users from other companies');
    }

    // Proceed with update
    const { data, error } = await supabase
      .from('users')
      .update({ ...req.body, updated_at: new Date() })
      .eq('id', targetUserId)
      .select()
      .single();

    res.json(data);
  } catch (error) {
    handleAuthError(error, res);
  }
}
```

### Example 3: Admin-only Endpoint

```typescript
// GET /api/admin/audit-logs (view all audit logs — admin only)
import { requireAdmin } from '@/middleware/authorize';

export default async function handler(req, res) {
  try {
    const { userId, companyId } = req.user;

    // Check authentication
    const context = await requireAuth(userId, companyId, supabase);

    // Check admin role
    await requireAdmin(context, supabase);

    // Admin is verified, return all audit logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    res.json(logs);
  } catch (error) {
    handleAuthError(error, res);
  }
}
```

---

## Testing Authorization

### Test Unauthenticated Request

```bash
# No session → 401
curl -X POST http://localhost:3000/api/elections \
  -H "Content-Type: application/json" \
  -d '{ "title": "Test" }'

# Response:
# 401 Unauthorized
# { "error": "Missing or invalid session" }
```

### Test Forbidden Role

```bash
# Eleitor trying to create election → 403
curl -X POST http://localhost:3000/api/elections \
  -H "Authorization: Bearer eleitor-session-token" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Test" }'

# Response:
# 403 Forbidden
# { "error": "Insufficient permissions to create elections" }
```

### Test Authorized Request

```bash
# RH creating election → 200
curl -X POST http://localhost:3000/api/elections \
  -H "Authorization: Bearer rh-session-token" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Annual Election" }'

# Response:
# 201 Created
# { "id": "...", "title": "Annual Election", ... }
```

---

## Audit Logging

All authorization failures are logged to the `audit_logs` table:

```
user_id: User who attempted the action
company_id: Company of the user
action: 'authorization_failed'
resource_type: 'api'
details: {
  permission: 'canManageUsers',
  userRole: 'eleitor',
  endpoint: '/api/users'
}
severity: 'medium'
timestamp: Current time
```

**View Authorization Failures:**
```sql
SELECT * FROM audit_logs
WHERE action = 'authorization_failed'
ORDER BY created_at DESC
LIMIT 50;
```

---

## Best Practices

### 1. Always Check Both Authentication AND Permission

```typescript
// ✅ GOOD
const context = await authorize(userId, companyId, 'canVote', supabase);

// ❌ BAD (only checks authentication)
const user = await getUser(userId);
```

### 2. Use Specific Permissions

```typescript
// ✅ GOOD - Clear what permission is needed
await authorize(userId, companyId, 'canCreateElections', supabase);

// ❌ BAD - Generic permission
await authorize(userId, companyId, 'canAccess', supabase);
```

### 3. Provide Clear Error Messages

```typescript
// ✅ GOOD
throw new AuthorizationError(
  403,
  'Insufficient permissions to manage users in other companies'
);

// ❌ BAD
throw new AuthorizationError(403, 'Forbidden');
```

### 4. Log Important Authorization Checks

The system automatically logs ALL failures. No need for manual logging.

### 5. Use Multi-tenant Checks

Always verify user's company matches the data's company:

```typescript
if (targetData.company_id !== context.companyId) {
  throw new AuthorizationError(403, 'Access denied: company mismatch');
}
```

---

## Troubleshooting

### Issue: All endpoints return 401

**Cause:** Session middleware not setting `req.user`

**Solution:** Ensure session middleware runs before authorization checks

```typescript
// In API route or Next.js _middleware.ts
app.use(sessionMiddleware); // Must run first
app.use(routes); // Then use it
```

### Issue: User has permission but gets 403

**Cause:** Additional authorization check (e.g., company match)

**Solution:** Log the error context to debug

```typescript
console.log('Authorization failed:', error.context);
// Will show which specific check failed
```

### Issue: Audit logs not recording failures

**Cause:** Audit logging error (network, DB down)

**Solution:** Errors in audit logging don't block requests (fail-safe design). Check logs for details:

```
console.error('Failed to log authorization failure:', err);
```

---

## Related Documentation

- [Session Management](./SESSION-MANAGEMENT.md) — How sessions work
- [RBAC Guide](./RBAC-GUIDE.md) — Flexible role management (Story 1.5)
- [RLS Policies](./RLS-POLICIES.md) — Database-level isolation
- [Security Guide](./docs/TOKEN-SECURITY.md) — Overall security model

---

**Story 1.4: API Authorization & Permissions**
**Date:** 2026-03-07
