# RBAC Guide — Role-Based Access Control (Story 1.5)

## Overview

Role-Based Access Control (RBAC) enables flexible permission management in Safety Vote. Admins can assign roles to users, and the system enforces permissions consistently across the API layer (Story 1.4) and database layer (Story 1.2).

---

## Three Fixed Roles

### Admin
- **Description:** System administrator with full access
- **Permissions:** All system operations
- **Use Case:** System administrators, super users
- **Count Limit:** No limit (typical: 1-3 per system)

### RH (Human Resources)
- **Description:** Organization HR/administrator role
- **Permissions:** Manage users, create elections, view results
- **Use Case:** HR staff, election organizers
- **Count Limit:** Typically 1-5 per organization

### Eleitor (Voter)
- **Description:** Regular employee/member
- **Permissions:** Vote and view results only
- **Use Case:** All employees participating in elections
- **Count Limit:** 100% of organization members

---

## Role Hierarchy

```
Admin (highest privilege)
  ├─ All permissions
  └─ Can do everything

RH (medium privilege)
  ├─ Inherits all eleitor permissions
  ├─ Add: manage users, create elections
  └─ Can do voting + administrative tasks

Eleitor (lowest privilege)
  ├─ canVote
  ├─ canViewOwnVote
  ├─ canViewResults
  └─ Can only vote and view results
```

---

## Assigning Roles to Users

### API Endpoint

```
PUT /api/admin/users/:userId/role
Authorization: Bearer [admin-session-token]
Content-Type: application/json

{
  "role": "rh"
}
```

**Response (200 OK):**
```json
{
  "id": "user-123",
  "name": "Jane Doe",
  "role": "rh",
  "company_id": "company-456",
  "updated_at": "2026-03-07T15:30:00Z"
}
```

### Programmatic

```typescript
import { assignRole } from '@/lib/rbac/role-manager';

// Assign RH role to user
await assignRole(
  'user-123',           // targetUserId
  'rh',                 // newRole
  'admin-user-id',      // adminId (who made the change)
  supabase              // client
);
```

---

## Permission Caching

### How It Works

1. **First access:** Role permissions computed from matrix
2. **Cached:** Stored for 5 minutes
3. **Invalidation:** Immediate when role changes
4. **Fallback:** After 5 minutes, re-computed automatically

### Cache Statistics

```typescript
import { getCacheStats, preloadCache } from '@/lib/rbac/permission-cache';

// Check cache status
const stats = getCacheStats();
console.log(`Cache size: ${stats.size} roles`);
console.log(`Cached roles: ${stats.entries.join(', ')}`);

// Preload on startup for performance
preloadCache();
```

### Cache Behavior

```typescript
// First call: Computes + caches (slowest)
const perms1 = getPermissionsWithCache('admin');

// Second call: Returns from cache (instant)
const perms2 = getPermissionsWithCache('admin');

// After role change: Cache invalidated (recomputes)
await assignRole(userId, 'rh', adminId, supabase);
const perms3 = getPermissionsWithCache('rh'); // Fresh compute
```

---

## Audit Logging

All role changes are logged to the `audit_logs` table:

```sql
-- View all role changes
SELECT * FROM audit_logs
WHERE action = 'role_change'
ORDER BY created_at DESC;

-- Result:
-- user_id: admin-123
-- company_id: company-456
-- action: 'role_change'
-- resource_type: 'user'
-- resource_id: 'user-123'
-- details: {
--   "oldRole": "eleitor",
--   "newRole": "rh",
--   "changedUserId": "user-123"
-- }
-- severity: 'high'
-- created_at: 2026-03-07T15:30:00Z
```

---

## Permission Inheritance

### Eleitor Permissions (Base)
- canVote
- canViewOwnVote
- canViewResults

### RH Permissions (Eleitor +)
- canViewAllUsers
- canManageUsers
- canCreateElections
- canManageCandidates
- canViewVotes
- canViewAuditLogs
- canViewResults (inherited)
- canVote (inherited)
- canViewOwnVote (inherited)

### Admin Permissions (All)
- All permissions from both RH and Eleitor
- Full system access

---

## Best Practices

### 1. Assign Minimal Privileges
```typescript
// ✅ GOOD: Only RH privilege needed
await assignRole(userId, 'rh', adminId, supabase);

// ❌ BAD: Giving more privilege than needed
await assignRole(userId, 'admin', adminId, supabase);
```

### 2. Audit All Role Changes
Role changes are automatically logged. Review audit logs regularly:
```sql
SELECT COUNT(*) as role_changes_today
FROM audit_logs
WHERE action = 'role_change'
AND created_at > NOW() - INTERVAL '1 day';
```

### 3. Cache Preload on Startup
For better performance, preload cache when application starts:
```typescript
import { preloadCache } from '@/lib/rbac/permission-cache';

// In application startup
preloadCache();
console.log('Permission cache preloaded');
```

### 4. Monitor Cache Performance
Track cache hits vs. misses:
```typescript
import { getCacheStats } from '@/lib/rbac/permission-cache';

const stats = getCacheStats();
if (stats.size === 3) {
  // All roles cached = good performance
} else {
  // Some roles not cached = slower access
  preloadCache();
}
```

### 5. Handle Role Changes Gracefully
When user's role changes, they might have new/fewer permissions. Next request will see new role:
```typescript
// Step 1: Change role (cache invalidated)
await assignRole(userId, 'rh', adminId, supabase);

// Step 2: User's next request reads new permissions
// No reload needed - cache automatically refreshed
```

---

## Troubleshooting

### Issue: Permission Denied After Role Assignment

**Cause:** Cache not invalidated properly

**Solution:** Cache is automatically invalidated. If issue persists:
```typescript
import { invalidateAllCaches, preloadCache } from '@/lib/rbac/permission-cache';

// Force cache refresh
invalidateAllCaches();
preloadCache();
```

### Issue: Can't Assign Role to User

**Cause:** Invalid role or user not found

**Solution:** Verify role and user:
```typescript
import { isValidRole } from '@/lib/rbac/role-manager';

if (!isValidRole(newRole)) {
  throw new Error(`Invalid role: ${newRole}`);
}

// Check user exists
const user = await supabase.from('users').select().eq('id', userId).single();
if (!user) {
  throw new Error('User not found');
}
```

---

## Integration with Story 1.4 (API Authorization)

Role assignment (Story 1.5) works with API Authorization (Story 1.4):

```
User Role (Story 1.5)
       ↓
   Permission Matrix (Story 1.4)
       ↓
   API Authorization Check
       ↓
   Allow / Deny Request
```

Example flow:
```
1. Admin assigns role 'rh' to user
2. User's next request checked against permission matrix
3. If user has 'canManageUsers', request allowed
4. Audit logged if denied
```

---

## Integration with Story 1.2 (RLS)

Database-level isolation also respects roles:

```
User Role (Story 1.5)
       ↓
   RLS Policies (Story 1.2)
       ↓
   Database Row Access
       ↓
   Only see/modify company data
```

---

## Testing RBAC

### Unit Tests

```bash
# Run RBAC tests
npm test -- src/tests/auth/rbac.test.ts

# Expected:
# ✅ 28 tests PASS
# - Role validation
# - Cache behavior
# - Permission inheritance
```

### Manual Testing

```bash
# 1. List all roles
curl -X GET http://localhost:3000/api/admin/roles \
  -H "Authorization: Bearer admin-token"

# 2. Get user's current role
curl -X GET http://localhost:3000/api/admin/users/user-123 \
  -H "Authorization: Bearer admin-token"

# 3. Assign role
curl -X PUT http://localhost:3000/api/admin/users/user-123/role \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{ "role": "rh" }'

# 4. Verify role change
curl -X GET http://localhost:3000/api/admin/audit \
  -H "Authorization: Bearer admin-token"
```

---

## Related Documentation

- [API Authorization (Story 1.4)](./API-AUTHORIZATION.md) — How API authorization uses roles
- [RLS Policies (Story 1.2)](./RLS-POLICIES.md) — Database-level access control
- [Session Management (Story 1.3)](./SESSION-MANAGEMENT.md) — User identity & session

---

**Story 1.5: Role-Based Access Control (RBAC)**
**Date:** 2026-03-07
