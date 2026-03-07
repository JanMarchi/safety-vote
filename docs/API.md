# Safety Vote API Documentation

**Version:** 1.0.0
**Base URL:** `https://api.safetyvote.com`
**Status:** Complete

---

## Table of Contents

1. [Authentication](#authentication)
2. [Elections API](#elections-api)
3. [Candidates API](#candidates-api)
4. [Voting API](#voting-api)
5. [Results API](#results-api)
6. [Error Handling](#error-handling)

---

## Authentication

All endpoints require authentication via session token in the `Authorization` header.

```
Authorization: Bearer <session_token>
```

### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "token": "session_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "eleitor"
  }
}
```

---

## Elections API

### Create Election

```http
POST /api/elections
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Board Election 2026",
  "description": "Annual board election",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "max_votes_per_user": 1,
  "allow_abstention": true,
  "is_secret": true
}
```

**Response:** `201 Created`
```json
{
  "id": "elec-uuid",
  "company_id": "company-uuid",
  "title": "Board Election 2026",
  "status": "draft",
  "start_date": "2026-04-01T00:00:00Z",
  "end_date": "2026-04-15T23:59:59Z",
  "created_at": "2026-03-07T10:00:00Z"
}
```

### List Elections

```http
GET /api/elections
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "elec-uuid",
    "title": "Board Election 2026",
    "status": "active",
    "start_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-15T23:59:59Z"
  }
]
```

### Get Election

```http
GET /api/elections/{id}
Authorization: Bearer <token>
```

### Update Election

```http
PUT /api/elections/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "max_votes_per_user": 2
}
```

---

## Candidates API

### Register as Candidate

```http
POST /api/candidates
Authorization: Bearer <token>
Content-Type: application/json

{
  "election_id": "elec-uuid",
  "name": "John Doe",
  "proposal": "My platform for change"
}
```

**Response:** `201 Created`

### List Candidates

```http
GET /api/candidates?election_id={election_id}
Authorization: Bearer <token>
```

### Remove Candidate

```http
DELETE /api/candidates/{id}
Authorization: Bearer <token>
```

---

## Voting API

### Cast Vote

```http
POST /api/votes
Authorization: Bearer <token>
Content-Type: application/json

{
  "election_id": "elec-uuid",
  "candidate_id": "cand-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "vote-uuid",
  "election_id": "elec-uuid",
  "voter_id": "user-uuid",
  "candidate_id": "cand-uuid",
  "encrypted_data": "aes-encrypted-hex",
  "iv": "random-iv-hex",
  "auth_tag": "authentication-tag-hex",
  "created_at": "2026-03-07T10:30:00Z"
}
```

### Check if Voted

```http
GET /api/votes?election_id={election_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "voted": true
}
```

---

## Results API

### Get Results

```http
GET /api/elections/{id}/results
Authorization: Bearer <token>
```

**Response:**
```json
{
  "election_id": "elec-uuid",
  "total_votes": 150,
  "total_voters": 150,
  "abstentions": 5,
  "results": {
    "cand-1": {
      "name": "Alice",
      "votes": 80,
      "percentage": 53.33,
      "rank": 1
    },
    "cand-2": {
      "name": "Bob",
      "votes": 65,
      "percentage": 43.33,
      "rank": 2
    }
  },
  "winner_id": "cand-1",
  "winner_name": "Alice",
  "is_tied": false
}
```

### Get Results Report

```http
GET /api/elections/{id}/results?format=report
Authorization: Bearer <token>
```

### Get Winner

```http
GET /api/elections/{id}/results?format=winner
Authorization: Bearer <token>
```

### Validate Results

```http
GET /api/elections/{id}/results?format=validate
Authorization: Bearer <token>
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message here"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

### Common Errors

**401 Unauthorized**
```json
{
  "error": "User not authenticated"
}
```

**403 Forbidden**
```json
{
  "error": "Only admin or rh can create elections"
}
```

**409 Conflict**
```json
{
  "error": "User has already voted in this election"
}
```

---

## Rate Limiting

- API calls: 1000 per hour per user
- Burst: 100 calls per minute

---

## Webhooks

### Election Status Changed

```
POST {webhook_url}

{
  "event": "election.status_changed",
  "election_id": "elec-uuid",
  "old_status": "draft",
  "new_status": "active",
  "timestamp": "2026-03-07T10:00:00Z"
}
```

### Vote Cast

```
POST {webhook_url}

{
  "event": "vote.cast",
  "election_id": "elec-uuid",
  "vote_id": "vote-uuid",
  "timestamp": "2026-03-07T10:30:00Z"
}
```

---

## SDK Support

### JavaScript/TypeScript

```typescript
import { SafetyVoteAPI } from '@safetyvote/sdk';

const api = new SafetyVoteAPI({
  baseURL: 'https://api.safetyvote.com',
  token: 'session_token'
});

// Create election
const election = await api.elections.create({
  title: 'Board Election',
  start_date: new Date(),
  end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
});

// Cast vote
const vote = await api.votes.cast({
  election_id: election.id,
  candidate_id: 'cand-uuid'
});

// Get results
const results = await api.results.get(election.id);
```

---

## OpenAPI Schema

Complete OpenAPI 3.0 specification available at `/api/openapi.json`

---

*API Documentation — Safety Vote Platform v1.0*
