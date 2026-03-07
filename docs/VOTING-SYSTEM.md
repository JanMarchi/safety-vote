# Voting System API — Story 2.3

**API Version:** 1.0
**Status:** Complete
**Last Updated:** 2026-03-07

---

## Overview

The Voting System API enables secure, encrypted voting in elections. All votes are encrypted using AES-256-GCM to maintain voter privacy while ensuring vote integrity.

---

## Core Concepts

### Vote

A vote represents an election participant's choice. Votes are:
- **Encrypted**: AES-256-GCM encryption with IV and authentication tag
- **Anonymous**: Voter identity is separated from choice in encrypted data
- **Tamper-protected**: GCM authentication tag detects any modifications
- **Non-repudiable**: Voter cannot deny voting (audit logs track casting)

### Vote States

```
Available (election active, user hasn't voted)
    ↓
Vote Cast (encrypted and stored)
    ↓
Results Available (after election closes)
```

### Encryption

Each vote is encrypted with:
- **Algorithm**: AES-256-GCM (256-bit key, 96-bit IV)
- **Key**: Per-election encryption key (stored securely in environment)
- **IV**: Random initialization vector (12 bytes, unique per vote)
- **Auth Tag**: 16-byte authentication tag (detects tampering)

**Why GCM?**
- Provides both confidentiality (AES) and authentication (GCM tag)
- Detects any bit-flips or tampering during storage/transmission
- Fast and efficient

---

## API Endpoints

### POST /api/votes

**Cast a vote in an active election**

#### Authorization
- **Required Role:** Any authenticated user (eleitor, rh, admin)
- **Returns:** 201 Created | 403 Forbidden | 409 Conflict | 400 Bad Request | 404 Not Found

#### Request Body

```json
{
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "candidate_id": "cand-550e8400-e29b-41d4-a716-446655440000"
}
```

**Or to abstain (if allowed):**

```json
{
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "candidate_id": null
}
```

**Field Details:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| election_id | UUID | YES | Election to vote in |
| candidate_id | UUID \| null | YES | Candidate ID (null = abstain) |

#### Response (Success)

```json
{
  "id": "vote-550e8400-e29b-41d4-a716-446655440000",
  "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
  "voter_id": "user-550e8400-e29b-41d4-a716-446655440000",
  "candidate_id": "cand-550e8400-e29b-41d4-a716-446655440000",
  "encrypted_data": "a1b2c3d4e5f6...",
  "iv": "randomivvalue",
  "auth_tag": "authtag123...",
  "created_at": "2026-03-07T10:30:00Z"
}
```

HTTP Status: 201 Created

#### Response (Error - Election Not Active)

```json
{
  "error": "Election is not currently active"
}
```

HTTP Status: 403 Forbidden

#### Response (Error - Already Voted)

```json
{
  "error": "User has already voted in this election"
}
```

HTTP Status: 409 Conflict

#### Response (Error - Abstention Not Allowed)

```json
{
  "error": "Abstention is not allowed for this election"
}
```

HTTP Status: 400 Bad Request

#### Example: cURL

```bash
curl -X POST https://api.safetyvote.com/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <session_token>" \
  -d '{
    "election_id": "elec-550e8400-e29b-41d4-a716-446655440000",
    "candidate_id": "cand-550e8400-e29b-41d4-a716-446655440000"
  }'
```

#### Example: TypeScript

```typescript
async function castVote(
  electionId: string,
  candidateId: string,
  sessionToken: string
): Promise<void> {
  const response = await fetch('/api/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`,
    },
    body: JSON.stringify({
      election_id: electionId,
      candidate_id: candidateId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const vote = await response.json();
  console.log(`Vote cast successfully: ${vote.id}`);
}
```

---

### GET /api/votes?election_id=:id

**Check if user has voted**

#### Authorization
- **Required Role:** Any authenticated user
- **Returns:** 200 OK | 400 Bad Request

#### Query Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| election_id | UUID | YES | Election to check |

#### Response

```json
{
  "voted": true
}
```

or

```json
{
  "voted": false
}
```

#### Example: cURL

```bash
curl -X GET "https://api.safetyvote.com/api/votes?election_id=elec-550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <session_token>"
```

#### Example: JavaScript

```javascript
async function hasUserVoted(electionId, sessionToken) {
  const response = await fetch(
    `/api/votes?election_id=${electionId}`,
    {
      headers: { 'Authorization': `Bearer ${sessionToken}` },
    }
  );

  const { voted } = await response.json();
  return voted;
}
```

---

### GET /api/votes/results?election_id=:id

**Get preliminary vote results (after election closes)**

#### Authorization
- **Required Role:** Any authenticated user (company isolation via RLS)
- **Returns:** 200 OK | 403 Forbidden | 404 Not Found | 400 Bad Request

#### Query Parameters

| Parameter | Type | Required | Notes |
|-----------|------|----------|-------|
| election_id | UUID | YES | Election to get results for |

#### Response (Success)

```json
{
  "cand-550e8400-e29b-41d4-a716-446655440000": 5,
  "cand-660e8400-e29b-41d4-a716-446655440001": 3,
  "cand-770e8400-e29b-41d4-a716-446655440002": 2,
  "abstentions": 1
}
```

**Format:** Each candidate ID maps to vote count. `abstentions` shows null votes.

#### Response (Error - Access Denied)

```json
{
  "error": "Access denied to election from another company"
}
```

HTTP Status: 403 Forbidden

#### Example: cURL

```bash
curl -X GET "https://api.safetyvote.com/api/votes/results?election_id=elec-550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <session_token>"
```

#### Example: React Component

```typescript
import { useEffect, useState } from 'react';

export function ElectionResults({ electionId }: { electionId: string }) {
  const [results, setResults] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/votes/results?election_id=${electionId}`)
      .then(r => r.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [electionId]);

  if (loading) return <div>Loading results...</div>;

  const { abstentions, ...candidateVotes } = results;

  return (
    <div>
      <h2>Election Results</h2>
      {Object.entries(candidateVotes).map(([candId, votes]) => (
        <div key={candId}>
          <span>Candidate {candId}: {votes} votes</span>
        </div>
      ))}
      <div>Abstentions: {abstentions || 0}</div>
    </div>
  );
}
```

---

## Vote Encryption Details

### Encryption Flow

```
1. User selects candidate (or abstains)
2. Create vote JSON: { candidateId, timestamp }
3. Generate random 12-byte IV
4. Encrypt with AES-256-GCM
5. Get 16-byte authentication tag
6. Store: encrypted_data, iv, auth_tag
```

### Decryption Flow (Admin/Results)

```
1. Retrieve encrypted_data, iv, auth_tag
2. Verify authentication tag (detects tampering)
3. Decrypt with AES-256-GCM
4. Extract candidateId
5. Tally results
```

### Why Two Fields (voter_id + encrypted_data)?

- **voter_id (plaintext)**: Prevents duplicate voting, tracks who voted
- **encrypted_data**: What they voted for (kept private)
- **Separation**: Voter identity ≠ Vote content

Example:

```
Voter A: votes for Candidate X
→ DB row: voter_id=A, encrypted={X, timestamp}
→ Admin sees: "A voted" but not "A voted for X"
→ Results calculation: Count encrypted entries to tally
```

---

## Validation Rules

### Election Status Validation

```javascript
// ✅ Can vote
election.status === 'active' &&
now >= election.start_date &&
now <= election.end_date

// ❌ Cannot vote
election.status !== 'active' ||
now < election.start_date ||
now > election.end_date
```

### Candidate Validation

```javascript
// ✅ Valid vote
candidate_id in election.candidates ||
(candidate_id === null && election.allow_abstention)

// ❌ Invalid vote
candidate_id not in election.candidates ||
(candidate_id === null && !election.allow_abstention)
```

### Duplicate Vote Prevention

```sql
-- Unique constraint
UNIQUE(election_id, voter_id)

-- Prevents: INSERT same voter twice
```

---

## Status Codes

### 201 Created
Vote successfully cast and encrypted.

### 200 OK
Vote status retrieved or results returned.

### 400 Bad Request
- Missing required fields
- Abstention not allowed

### 403 Forbidden
- Election not currently active
- User from another company

### 404 Not Found
- Election or candidate not found

### 409 Conflict
- User already voted in this election

### 500 Internal Server Error
- Encryption key not configured
- Database error

---

## Best Practices

### 1. Always Check Election Status Before Voting

```typescript
async function canUserVote(electionId: string): Promise<boolean> {
  const response = await fetch(`/api/elections/${electionId}`);
  const election = await response.json();

  const now = new Date();
  const start = new Date(election.start_date);
  const end = new Date(election.end_date);

  return (
    election.status === 'active' &&
    now >= start &&
    now <= end
  );
}
```

### 2. Prevent Double Voting UI-Side

```typescript
export function VotingInterface({ electionId }: { electionId: string }) {
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetch(`/api/votes?election_id=${electionId}`)
      .then(r => r.json())
      .then(data => setVoted(data.voted));
  }, [electionId]);

  if (voted) {
    return <div>You have already voted in this election</div>;
  }

  return <VotingForm electionId={electionId} />;
}
```

### 3. Display Encryption Status to User

```typescript
// Show user their vote was encrypted
function VoteConfirmation({ vote }: { vote: Vote }) {
  return (
    <div>
      <h3>✓ Vote Cast Successfully</h3>
      <p>Your vote has been encrypted with AES-256.</p>
      <p>Vote ID: {vote.id}</p>
      <p>Timestamp: {vote.created_at}</p>
      <p>
        Status: Encrypted and secured
      </p>
    </div>
  );
}
```

### 4. Handle Abstention Gracefully

```typescript
async function castVote(
  electionId: string,
  candidateId: string | null
) {
  const response = await fetch('/api/votes', {
    method: 'POST',
    body: JSON.stringify({
      election_id: electionId,
      candidate_id: candidateId,
    }),
  });

  if (response.status === 400) {
    const error = await response.json();
    if (error.error.includes('not allowed')) {
      console.log('Abstention is disabled for this election');
    }
  }
}
```

### 5. Poll Results Only After Election Closes

```typescript
async function getResults(
  electionId: string,
  maxRetries: number = 0
): Promise<Record<string, number>> {
  const response = await fetch(
    `/api/votes/results?election_id=${electionId}`
  );

  if (!response.ok) {
    if (maxRetries > 0) {
      // Poll again in 5 seconds
      await new Promise(r => setTimeout(r, 5000));
      return getResults(electionId, maxRetries - 1);
    }
    throw new Error('Cannot fetch results yet');
  }

  return response.json();
}
```

---

## Integration Examples

### Complete Voting Workflow

```typescript
async function runVotingWorkflow(electionId: string, candidateId: string) {
  // 1. Check if election is active
  const canVote = await canUserVote(electionId);
  if (!canVote) {
    console.log('Election not active');
    return;
  }

  // 2. Check if user already voted
  const { voted } = await fetch(
    `/api/votes?election_id=${electionId}`
  ).then(r => r.json());

  if (voted) {
    console.log('User has already voted');
    return;
  }

  // 3. Cast vote
  const response = await fetch('/api/votes', {
    method: 'POST',
    body: JSON.stringify({
      election_id: electionId,
      candidate_id: candidateId,
    }),
  });

  const vote = await response.json();
  console.log(`Vote cast: ${vote.id}`);

  // 4. Show confirmation
  return vote;
}
```

---

## Security Considerations

### 1. Key Management

```
VOTE_ENCRYPTION_KEY environment variable:
- 32 bytes (256 bits) of random data
- Stored in secure environment variables
- Rotated periodically
- Different key per election (v2 feature)
```

### 2. Vote Privacy

```
- Voter identity (voter_id) is plaintext for audit
- Vote choice (candidate_id) is encrypted
- No way to link voter → candidate without decryption
- Results only available after decryption by admin
```

### 3. Vote Integrity

```
- AES-256-GCM provides authentication
- Any bit-flip detected (invalid auth tag)
- Tampering impossible without decryption key
- Audit logs track vote casting
```

### 4. Audit Trail

```
Event: vote_cast
Details: { abstained: true/false }
Impact: Immutable record of voting action
```

---

## Testing

### Using Jest

```typescript
import { encryptVote, decryptVote } from '@/lib/elections/vote-manager';

describe('Vote Encryption', () => {
  it('should encrypt and decrypt vote', () => {
    const key = generateEncryptionKey();
    const { encrypted, iv, authTag } = encryptVote('cand-1', key);

    const decrypted = decryptVote(encrypted, iv, authTag, key);
    expect(decrypted.candidateId).toBe('cand-1');
  });
});
```

### Using cURL

```bash
# Cast vote
curl -X POST https://api.safetyvote.com/api/votes \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"election_id":"'$ELEC'","candidate_id":"'$CAND'"}'

# Check if voted
curl -X GET "https://api.safetyvote.com/api/votes?election_id=$ELEC" \
  -H "Authorization: Bearer $TOKEN"

# Get results
curl -X GET "https://api.safetyvote.com/api/votes/results?election_id=$ELEC" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Appendix: Vote Schema

### Database Table: votes

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id),
  voter_id UUID NOT NULL REFERENCES users(id),
  candidate_id UUID REFERENCES candidates(id),
  encrypted_data TEXT NOT NULL,
  iv VARCHAR(24) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT single_vote_per_election UNIQUE(election_id, voter_id),
  CONSTRAINT valid_abstention CHECK (
    candidate_id IS NOT NULL OR
    (candidate_id IS NULL AND election_id IN (
      SELECT id FROM elections WHERE allow_abstention = true
    ))
  )
);

CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
```

---

## Support

For questions or issues:
- **Documentation**: `/docs/stories/epic-2-voting-system/2.3.story.md`
- **Tests**: `/src/tests/elections/voting-system.test.ts`
- **Implementation**: `/src/lib/elections/vote-manager.ts`
- **Encryption**: AES-256-GCM via Node.js `crypto` module

---

*Voting System API — Story 2.3 (Complete)*
