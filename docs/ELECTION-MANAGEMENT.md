# Election Management API — Story 2.1

**API Version:** 1.0
**Status:** Complete
**Last Updated:** 2026-03-07

---

## Overview

The Election Management API enables authorized users (Admin/RH) to create, retrieve, update, and manage elections. Elections define voting events within a company, with configurable status, dates, voting rules, and participant limits.

---

## Core Concepts

### Election

An election is a voting event created by RH or Admin users. Elections have:

- **Status Lifecycle**: `draft` → `active` → `completed` (or `cancelled`)
- **Company Isolation**: Elections are isolated by company_id (RLS enforced)
- **Date Validation**: end_date must be after start_date
- **Configurable Rules**:
  - `max_votes_per_user`: Maximum number of votes each user can cast (default: 1)
  - `allow_abstention`: Whether users can abstain from voting (default: true)
  - `is_secret`: Whether vote tallying is private (default: true)

### Election Status

```
draft      →  active      →  completed  →  (archived)
  ↓              ↓               ↓
  Can modify     Cannot modify   Read-only
  Can add        Can remove      Results visible
  candidates     votes
```

---

## API Endpoints

### POST /api/elections

**Create a new election**

#### Authorization
- **Required Role:** admin, rh
- **Returns:** 201 Created | 403 Forbidden | 400 Bad Request

#### Request Body

```json
{
  "title": "Annual Board Election",
  "description": "Election for board positions 2026",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "max_votes_per_user": 3,
  "allow_abstention": true,
  "is_secret": true
}
```

**Field Details:**

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| title | string | YES | — | Election name (max 255 chars) |
| description | string | NO | null | Election details |
| start_date | ISO 8601 | YES | — | Election begins |
| end_date | ISO 8601 | YES | — | Election ends (must be > start_date) |
| max_votes_per_user | integer | NO | 1 | Voting limit per user |
| allow_abstention | boolean | NO | true | Allow "abstain" option |
| is_secret | boolean | NO | true | Hide vote details |

#### Response (Success)

```json
{
  "id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "company_id": "company-1",
  "title": "Annual Board Election",
  "description": "Election for board positions 2026",
  "status": "draft",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "max_votes_per_user": 3,
  "allow_abstention": true,
  "is_secret": true,
  "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-03-07T10:30:00Z",
  "updated_at": "2026-03-07T10:30:00Z"
}
```

#### Response (Error - Invalid Date)

```json
{
  "error": "End date must be after start date"
}
```

HTTP Status: 400 Bad Request

#### Response (Error - Unauthorized)

```json
{
  "error": "Only admin or rh can create elections"
}
```

HTTP Status: 403 Forbidden

#### Example: cURL

```bash
curl -X POST https://api.safetyvote.com/api/elections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session_token>" \
  -d '{
    "title": "Q1 Board Election",
    "description": "Elect board members for Q1",
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-15T23:59:59Z",
    "max_votes_per_user": 1,
    "allow_abstention": true,
    "is_secret": true
  }'
```

---

### GET /api/elections

**List all elections for company**

#### Authorization
- **Required Role:** Any authenticated user
- **Returns:** 200 OK | 401 Unauthorized

#### Query Parameters

None (filters by authenticated user's company via RLS)

#### Response (Success)

```json
[
  {
    "id": "elec-550e8400-e29b-41d4-a716-446655440000",
    "company_id": "company-1",
    "title": "Annual Board Election",
    "status": "draft",
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-15T23:59:59Z",
    "max_votes_per_user": 1,
    "allow_abstention": true,
    "is_secret": true,
    "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-03-07T10:30:00Z",
    "updated_at": "2026-03-07T10:30:00Z"
  },
  {
    "id": "elec-660e8400-e29b-41d4-a716-446655440000",
    "company_id": "company-1",
    "title": "CIPA Election 2026",
    "status": "active",
    "start_date": "2026-03-01T00:00:00Z",
    "end_date": "2026-03-31T23:59:59Z",
    "max_votes_per_user": 1,
    "allow_abstention": false,
    "is_secret": true,
    "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-02-28T09:00:00Z",
    "updated_at": "2026-03-01T08:00:00Z"
  }
]
```

#### Example: cURL

```bash
curl -X GET https://api.safetyvote.com/api/elections \
  -H "Authorization: Bearer <session_token>"
```

#### Example: JavaScript/TypeScript

```typescript
const response = await fetch('/api/elections', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${sessionToken}`,
  },
});

const elections = await response.json();
console.log(`Found ${elections.length} elections`);
```

---

### GET /api/elections/[id]

**Retrieve election by ID**

#### Authorization
- **Required Role:** Any authenticated user (RLS enforces company isolation)
- **Returns:** 200 OK | 404 Not Found | 403 Forbidden | 401 Unauthorized

#### Path Parameters

| Parameter | Type | Notes |
|-----------|------|-------|
| id | UUID | Election ID |

#### Response (Success)

```json
{
  "id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "company_id": "company-1",
  "title": "Annual Board Election",
  "description": "Election for board positions 2026",
  "status": "draft",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "max_votes_per_user": 3,
  "allow_abstention": true,
  "is_secret": true,
  "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-03-07T10:30:00Z",
  "updated_at": "2026-03-07T10:30:00Z"
}
```

#### Response (Error - Not Found)

```json
{
  "error": "Election not found: elec-invalid"
}
```

HTTP Status: 404 Not Found

#### Response (Error - Access Denied)

```json
{
  "error": "Access denied to election from another company"
}
```

HTTP Status: 403 Forbidden

#### Example: cURL

```bash
curl -X GET https://api.safetyvote.com/api/elections/elec-550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <session_token>"
```

---

### PUT /api/elections/[id]

**Update election**

#### Authorization
- **Required Role:** admin, rh
- **Returns:** 200 OK | 404 Not Found | 403 Forbidden | 409 Conflict | 400 Bad Request

#### Path Parameters

| Parameter | Type | Notes |
|-----------|------|-------|
| id | UUID | Election ID |

#### Request Body (Partial Update)

```json
{
  "title": "Updated Election Title",
  "max_votes_per_user": 2,
  "allow_abstention": false
}
```

Any field can be omitted (only provided fields are updated).

#### Constraints

- **Cannot update active elections**: Returns 409 if `status === 'active'`
- **Date validation**: If both `start_date` and `end_date` provided, end_date must be > start_date
- **Company isolation**: Can only update own company's elections

#### Response (Success)

```json
{
  "id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "company_id": "company-1",
  "title": "Updated Election Title",
  "description": "Election for board positions 2026",
  "status": "draft",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "max_votes_per_user": 2,
  "allow_abstention": false,
  "is_secret": true,
  "created_by": "user-550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-03-07T10:30:00Z",
  "updated_at": "2026-03-07T10:45:00Z"
}
```

#### Response (Error - Active Election)

```json
{
  "error": "Cannot update active elections"
}
```

HTTP Status: 409 Conflict

#### Response (Error - Invalid Dates)

```json
{
  "error": "End date must be after start date"
}
```

HTTP Status: 400 Bad Request

#### Example: cURL

```bash
curl -X PUT https://api.safetyvote.com/api/elections/elec-550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session_token>" \
  -d '{
    "title": "Updated Board Election",
    "max_votes_per_user": 2
  }'
```

---

## Status Transitions

### Draft → Active

**Purpose:** Open voting

**Endpoint:** PUT /api/elections/[id]

**Request:**
```json
{
  "status": "active"
}
```

**Constraints:**
- RH/Admin only
- Election must have ≥1 candidate (recommended)
- Start date must be ≤ now (server validates)

**After transition:**
- Users can vote
- Candidates cannot be added/removed
- Election cannot be modified (except status)

### Active → Completed

**Purpose:** Close voting and finalize results

**Endpoint:** PUT /api/elections/[id]

**Request:**
```json
{
  "status": "completed"
}
```

**Constraints:**
- RH/Admin only
- End date has passed (server validates)

**After transition:**
- Voting closed
- Results visible
- Read-only

### Any → Cancelled

**Purpose:** Cancel election

**Endpoint:** PUT /api/elections/[id]

**Request:**
```json
{
  "status": "cancelled"
}
```

**Constraints:**
- Admin only (or RH who created it)
- Any status allowed

**After transition:**
- Voting closed
- Marked as cancelled
- Read-only

---

## Data Validation

### Date Validation

```javascript
// ✅ Valid
start: "2026-04-01T00:00:00Z"
end:   "2026-04-15T23:59:59Z"

// ❌ Invalid (same time)
start: "2026-04-01T00:00:00Z"
end:   "2026-04-01T00:00:00Z"

// ❌ Invalid (end before start)
start: "2026-04-15T00:00:00Z"
end:   "2026-04-01T00:00:00Z"
```

### Title Validation

```javascript
// ✅ Valid (2-255 characters)
title: "Board Election 2026"

// ❌ Invalid (too short)
title: "A"

// ❌ Invalid (too long)
title: "X".repeat(256)
```

### Vote Limit Validation

```javascript
// ✅ Valid (1-5 votes typical)
max_votes_per_user: 3

// ❌ Invalid (zero or negative)
max_votes_per_user: 0

// ❌ Invalid (unreasonably high)
max_votes_per_user: 1000
```

---

## Company Isolation (RLS)

All election queries are automatically filtered by the authenticated user's company_id via Row Level Security policies:

```sql
-- RLS Policy: Users can only access elections from their company
SELECT * FROM elections
WHERE company_id = auth.user_company_id;
```

**Behavior:**
- Users from Company A cannot see/modify Company B's elections
- Database enforces this at query level (secure)
- API also validates and returns 403 if mismatched

**Example:**

```bash
# User from Company A
curl -H "Authorization: Bearer companyA_token" \
  /api/elections/elec-from-company-b

# Response: 403 Forbidden
# "Access denied to election from another company"
```

---

## Error Handling

### Standard Error Responses

#### 400 Bad Request

```json
{
  "error": "End date must be after start date"
}
```

**Possible causes:**
- Invalid date format
- Date validation failed
- Missing required fields
- Invalid field types

#### 401 Unauthorized

```json
{
  "error": "User not authenticated"
}
```

**Possible causes:**
- Missing session token
- Expired token
- Invalid token signature

#### 403 Forbidden

```json
{
  "error": "Only admin or rh can create elections"
}
```

**Possible causes:**
- Insufficient role (eleitor cannot create)
- Accessing another company's election
- Insufficient permissions for action

#### 404 Not Found

```json
{
  "error": "Election not found: elec-invalid"
}
```

**Possible causes:**
- Election ID does not exist
- Election was deleted

#### 409 Conflict

```json
{
  "error": "Cannot update active elections"
}
```

**Possible causes:**
- Trying to modify active election
- Status constraint violation

#### 500 Internal Server Error

```json
{
  "error": "Failed to create election: database error"
}
```

**Possible causes:**
- Database connection failure
- Unexpected server error

---

## Best Practices

### 1. Always validate dates in client before sending

```typescript
function validateElectionDates(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
}
```

### 2. Set appropriate defaults

```typescript
const electionData = {
  title: 'Board Election',
  start_date: futureDate,
  end_date: futureDate,
  max_votes_per_user: 1,        // Conservative default
  allow_abstention: true,         // Allow flexibility
  is_secret: true,                // Privacy-first
};
```

### 3. Plan election timeline carefully

```javascript
// Example timeline
const now = new Date();
const draftUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days for candidate registration
const activeUntil = new Date(draftUntil.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days for voting

{
  start_date: draftUntil.toISOString(),   // Transition to active
  end_date: activeUntil.toISOString(),    // Transition to completed
}
```

### 4. Handle status transitions sequentially

```typescript
// ❌ Don't do this
await updateElectionStatus(id, 'completed');

// ✅ Do this
await updateElectionStatus(id, 'active');
// ... wait for start_date
await updateElectionStatus(id, 'completed');
// ... after end_date
```

### 5. Cache election data client-side

```typescript
// Cache elections for 5 minutes
const cache = new Map<string, { data: Election[], timestamp: number }>();

async function getElections(companyId: string): Promise<Election[]> {
  const cached = cache.get(companyId);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }

  const response = await fetch('/api/elections');
  const data = await response.json();
  cache.set(companyId, { data, timestamp: Date.now() });
  return data;
}
```

---

## Integration Examples

### Create election and transition to active

```typescript
async function createAndActivateElection(
  title: string,
  startDate: Date,
  endDate: Date
): Promise<Election> {
  // 1. Create in draft
  const election = await createElection({
    title,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });

  console.log(`Created election: ${election.id}`);

  // 2. Add candidates (in Story 2.2)
  // await registerCandidate(election.id, candidateData);

  // 3. Wait for start date
  await waitUntil(startDate);

  // 4. Transition to active
  const active = await updateElectionStatus(election.id, 'active');
  console.log(`Election is now active`);

  return active;
}
```

### List and filter elections

```typescript
async function getActiveElections(): Promise<Election[]> {
  const allElections = await fetch('/api/elections').then(r => r.json());
  const now = new Date();

  return allElections.filter(election => {
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);
    return (
      election.status === 'active' &&
      now >= start &&
      now <= end
    );
  });
}
```

---

## Testing

### Using Jest

```typescript
import { createElection, getElection } from '@/lib/elections/election-manager';

describe('Election Management', () => {
  it('should create and retrieve election', async () => {
    const election = await createElection({
      title: 'Test Election',
      start_date: '2026-04-01T00:00:00Z',
      end_date: '2026-04-15T23:59:59Z',
    }, 'company-1', 'user-1', supabase);

    const retrieved = await getElection(election.id, supabase);
    expect(retrieved.title).toBe('Test Election');
  });
});
```

### Using cURL

```bash
#!/bin/bash

# Create election
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Election",
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-15T23:59:59Z"
  }' \
  https://api.safetyvote.com/api/elections)

ELECTION_ID=$(echo $RESPONSE | jq -r '.id')
echo "Created election: $ELECTION_ID"

# Retrieve election
curl -s -X GET \
  -H "Authorization: Bearer $TOKEN" \
  https://api.safetyvote.com/api/elections/$ELECTION_ID | jq
```

---

## Appendix: Election Schema

### Database Table: elections

```sql
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status election_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_votes_per_user INTEGER DEFAULT 1,
  allow_abstention BOOLEAN DEFAULT TRUE,
  is_secret BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT election_status_valid CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  CONSTRAINT dates_valid CHECK (end_date > start_date),
  CONSTRAINT votes_positive CHECK (max_votes_per_user > 0)
);

CREATE INDEX idx_elections_company_id ON elections(company_id);
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_created_at ON elections(created_at DESC);
```

---

## Support

For questions or issues:
- **Documentation**: `/docs/stories/epic-2-voting-system/2.1.story.md`
- **Tests**: `/src/tests/elections/election-management.test.ts`
- **Implementation**: `/src/lib/elections/election-manager.ts`

---

*Election Management API — Story 2.1 (Complete)*
