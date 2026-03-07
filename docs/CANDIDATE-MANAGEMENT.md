# Candidate Management API — Story 2.2

**API Version:** 1.0
**Status:** Complete
**Last Updated:** 2026-03-07

---

## Overview

The Candidate Management API enables users to register as candidates and allows RH/Admin users to manage candidate lists. Candidates represent individuals running in an election.

---

## Core Concepts

### Candidate

A candidate is a person registered to run in an election. Candidates can be:
- **Self-registered**: User registers themselves as a candidate
- **Admin-added**: RH/Admin adds candidate by name/proposal

### Candidate Status

```
pending     →  approved  →  (no other states yet)
```

- **pending**: Awaiting approval (future feature)
- **approved**: Approved and ready for voting (current)

### Self-Registration Flow

```
Election in DRAFT status
    ↓
User registers as candidate
    ↓
Candidate auto-approved
    ↓
User appears on ballot
    ↓
Election transitions to ACTIVE
    ↓
User can no longer deregister
```

---

## API Endpoints

### POST /api/candidates

**Register as candidate or add candidate (admin)**

#### Authorization
- **Required Role:** Any authenticated user (eleitor, rh, admin)
- **Returns:** 201 Created | 403 Forbidden | 409 Conflict | 400 Bad Request

#### Request Body

**For user self-registration (eleitor/rh/admin):**
```json
{
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "proposal": "I will bring transparency to the board"
}
```

**For RH/Admin adding candidate:**
```json
{
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "name": "Candidate Name",
  "proposal": "Professional proposal text",
  "photo_url": "https://example.com/photo.jpg"
}
```

**Field Details:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| election_id | UUID | YES | Election to register in |
| name | string | NO* | Candidate name (default: "Unnamed Candidate") |
| proposal | string | NO | Candidate platform/proposal |
| photo_url | string | NO | URL to candidate photo (RH only) |

*Self-registration: name optional. Admin: name required.

#### Response (Success)

```json
{
  "id": "cand-550e8400-e29b-41d4-a716-446655440000",
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "proposal": "I will bring transparency to the board",
  "photo_url": null,
  "status": "approved",
  "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-03-07T10:30:00Z",
  "updated_at": "2026-03-07T10:30:00Z"
}
```

HTTP Status: 201 Created

#### Response (Error - Active Election)

```json
{
  "error": "Cannot register after election starts"
}
```

HTTP Status: 403 Forbidden

#### Response (Error - Already Registered)

```json
{
  "error": "Already registered as candidate"
}
```

HTTP Status: 409 Conflict

#### Example: cURL (Self-Registration)

```bash
curl -X POST https://api.safetyvote.com/api/candidates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session_token>" \
  -d '{
    "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Silva",
    "proposal": "Sustainable workplace initiatives"
  }'
```

#### Example: TypeScript (Admin Add Candidate)

```typescript
async function addCandidateAsAdmin(
  electionId: string,
  candidateName: string,
  sessionToken: string
): Promise<Candidate> {
  const response = await fetch('/api/candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      election_id: electionId,
      name: candidateName,
      proposal: 'Professional nomination',
      photo_url: 'https://company.com/photo.jpg',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add candidate: ${response.statusText}`);
  }

  return response.json();
}
```

---

### GET /api/candidates?election_id=:id

**List candidates for election**

#### Authorization
- **Required Role:** Any authenticated user
- **Returns:** 200 OK | 403 Forbidden | 404 Not Found

#### Query Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| election_id | UUID | YES | Election ID to list candidates for |

#### Response (Success)

```json
[
  {
    "id": "cand-550e8400-e29b-41d4-a716-446655440000",
    "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Silva",
    "proposal": "Sustainable workplace initiatives",
    "photo_url": null,
    "status": "approved",
    "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-03-07T10:30:00Z",
    "updated_at": "2026-03-07T10:30:00Z"
  },
  {
    "id": "cand-660e8400-e29b-41d4-a716-446655440000",
    "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin Nominated Candidate",
    "proposal": "Professional management experience",
    "photo_url": "https://company.com/photo.jpg",
    "status": "approved",
    "created_by": "admin-550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-03-07T10:15:00Z",
    "updated_at": "2026-03-07T10:15:00Z"
  }
]
```

HTTP Status: 200 OK

#### Response (Error - Access Denied)

```json
{
  "error": "Access denied to candidates from another company"
}
```

HTTP Status: 403 Forbidden

#### Example: cURL

```bash
curl -X GET "https://api.safetyvote.com/api/candidates?election_id=elec-550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <session_token>"
```

#### Example: JavaScript

```javascript
async function listCandidates(electionId, sessionToken) {
  const url = new URL('https://api.safetyvote.com/api/candidates');
  url.searchParams.set('election_id', electionId);

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
    },
  });

  return response.json();
}
```

---

### GET /api/candidates/[id]

**Get candidate details**

#### Authorization
- **Required Role:** Any authenticated user (company isolation via RLS)
- **Returns:** 200 OK | 404 Not Found | 403 Forbidden

#### Path Parameters

| Parameter | Type | Notes |
|-----------|------|-------|
| id | UUID | Candidate ID |

#### Response (Success)

```json
{
  "id": "cand-550e8400-e29b-41d4-a716-446655440000",
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-550e8400-e29b-41d4-a716-446655440000",
  "name": "Maria Silva",
  "proposal": "Sustainable workplace initiatives",
  "photo_url": null,
  "status": "approved",
  "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-03-07T10:30:00Z",
  "updated_at": "2026-03-07T10:30:00Z"
}
```

HTTP Status: 200 OK

#### Example: cURL

```bash
curl -X GET https://api.safetyvote.com/api/candidates/cand-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <session_token>"
```

---

### DELETE /api/candidates/[id]

**Remove candidate**

#### Authorization
- **Required Role:** admin, rh
- **Returns:** 200 OK | 404 Not Found | 403 Forbidden | 409 Conflict

#### Path Parameters

| Parameter | Type | Notes |
|-----------|------|-------|
| id | UUID | Candidate ID to remove |

#### Constraints

- **Election must be draft**: Cannot remove candidates after election starts
- **Company isolation**: Can only remove candidates from own company's elections

#### Response (Success)

```json
{
  "message": "Candidate removed successfully"
}
```

HTTP Status: 200 OK

#### Response (Error - Active Election)

```json
{
  "error": "Can only remove candidates from draft elections"
}
```

HTTP Status: 409 Conflict

#### Example: cURL

```bash
curl -X DELETE https://api.safetyvote.com/api/candidates/cand-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <session_token>"
```

---

## Validation Rules

### Name Validation

```javascript
// ✅ Valid
name: "Maria Silva"
name: "João da Silva"
name: "Dr. José Antonio Pereira"

// ❌ Invalid (empty or very short)
name: ""
name: "A"
```

### Proposal Validation

```javascript
// ✅ Valid
proposal: "I will improve workplace safety standards"
proposal: null  // optional
proposal: ""    // optional, empty allowed

// ❌ Invalid (too long - implementation detail)
proposal: "X".repeat(10000)  // extremely long
```

### Election ID Validation

```javascript
// ✅ Valid (valid UUID)
election_id: "550e8400-e29b-41d4-a716-446655440000"

// ❌ Invalid
election_id: "invalid"
election_id: ""
```

---

## Company Isolation (RLS)

All candidate queries are automatically filtered by the authenticated user's company_id via Row Level Security:

```sql
-- RLS Policy: Users can only access candidates from elections in their company
SELECT * FROM candidates
WHERE election_id IN (
  SELECT id FROM elections
  WHERE company_id = auth.user_company_id
);
```

**Behavior:**
- Users from Company A cannot see/modify Company B's candidates
- Database enforces isolation at query level
- API validates and returns 403 if mismatched

---

## Status Codes

### 201 Created
Candidate successfully registered or added.

### 200 OK
Successfully retrieved or removed candidate.

### 400 Bad Request
Missing required fields or invalid data.
```json
{
  "error": "Missing required field: election_id"
}
```

### 403 Forbidden
- Insufficient role (eleitor cannot add candidates)
- Candidate registration in non-draft election
- Access denied to another company's candidates

### 404 Not Found
Candidate or election does not exist.

### 409 Conflict
- User already registered as candidate
- Trying to remove candidate from active election

### 500 Internal Server Error
Unexpected database or server error.

---

## Best Practices

### 1. Check Election Status Before Registering

```typescript
async function canRegister(electionId: string): Promise<boolean> {
  const response = await fetch(`/api/elections/${electionId}`);
  if (!response.ok) return false;

  const election = await response.json();
  return election.status === 'draft';
}
```

### 2. Handle Duplicate Registration Gracefully

```typescript
async function registerAsCandidate(
  electionId: string,
  candidateName: string
): Promise<Candidate | null> {
  try {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ election_id: electionId, name: candidateName }),
    });

    if (response.status === 409) {
      console.log('Already registered as candidate');
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
}
```

### 3. Display Candidates Organized by Status

```typescript
async function displayElectionCandidates(electionId: string) {
  const response = await fetch(`/api/candidates?election_id=${electionId}`);
  const candidates = await response.json();

  const byStatus = candidates.reduce((acc, cand) => {
    if (!acc[cand.status]) acc[cand.status] = [];
    acc[cand.status].push(cand);
    return acc;
  }, {});

  console.log(`Approved: ${byStatus.approved?.length || 0}`);
  console.log(`Pending: ${byStatus.pending?.length || 0}`);
}
```

### 4. Cache Candidate List with Expiration

```typescript
const candidateCache = new Map();

async function getCandidates(electionId: string): Promise<Candidate[]> {
  const cached = candidateCache.get(electionId);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }

  const response = await fetch(`/api/candidates?election_id=${electionId}`);
  const data = await response.json();
  candidateCache.set(electionId, { data, timestamp: Date.now() });
  return data;
}
```

### 5. Validate Photo URLs

```typescript
async function isValidPhotoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.includes('image');
  } catch {
    return false;
  }
}
```

---

## Integration Examples

### Register and View Candidates

```typescript
async function completeRegistrationFlow(
  electionId: string,
  candidateName: string
) {
  // 1. Register as candidate
  const candidate = await fetch('/api/candidates', {
    method: 'POST',
    body: JSON.stringify({
      election_id: electionId,
      name: candidateName,
    }),
  }).then(r => r.json());

  console.log(`Registered: ${candidate.name}`);

  // 2. List all candidates
  const all = await fetch(
    `/api/candidates?election_id=${electionId}`
  ).then(r => r.json());

  console.log(`Total candidates: ${all.length}`);
  all.forEach(c => console.log(`- ${c.name}`));
}
```

### Admin Workflow: Add and Remove

```typescript
async function adminManageCandidates(
  electionId: string,
  rhToken: string
) {
  // Add candidate
  const candidate = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${rhToken}` },
    body: JSON.stringify({
      election_id: electionId,
      name: 'Director Name',
      proposal: 'Leadership experience',
      photo_url: 'https://example.com/photo.jpg',
    }),
  }).then(r => r.json());

  console.log(`Added: ${candidate.name}`);

  // Later, remove if needed
  await fetch(`/api/candidates/${candidate.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${rhToken}` },
  });

  console.log('Candidate removed');
}
```

---

## Testing

### Using Jest

```typescript
import { registerAsCandidate, listCandidates } from '@/lib/elections/candidate-manager';

describe('Candidate Registration', () => {
  it('should register user as candidate', async () => {
    const candidate = await registerAsCandidate(
      'elec-1',
      'user-1',
      { name: 'John Doe' },
      supabase
    );

    expect(candidate.user_id).toBe('user-1');
    expect(candidate.status).toBe('approved');
  });

  it('should list candidates for election', async () => {
    const candidates = await listCandidates('elec-1', supabase);
    expect(candidates.length).toBeGreaterThan(0);
  });
});
```

### Using cURL

```bash
#!/bin/bash

# Register as candidate
CAND=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "election_id": "'$ELECTION_ID'",
    "name": "Test Candidate"
  }' \
  https://api.safetyvote.com/api/candidates)

CAND_ID=$(echo $CAND | jq -r '.id')
echo "Registered: $CAND_ID"

# List candidates
curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.safetyvote.com/api/candidates?election_id=$ELECTION_ID" | jq

# Remove candidate
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.safetyvote.com/api/candidates/$CAND_ID"
```

---

## Appendix: Candidate Schema

### Database Table: candidates

```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  proposal TEXT,
  photo_url VARCHAR(2048),
  status VARCHAR(50) NOT NULL DEFAULT 'approved',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT single_user_per_election UNIQUE NULLS NOT DISTINCT (election_id, user_id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_candidates_election_id ON candidates(election_id);
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_candidates_status ON candidates(status);
```

---

## Support

For questions or issues:
- **Documentation**: `/docs/stories/epic-2-voting-system/2.2.story.md`
- **Tests**: `/src/tests/elections/candidate-registration.test.ts`
- **Implementation**: `/src/lib/elections/candidate-manager.ts`

---

*Candidate Management API — Story 2.2 (Complete)*
