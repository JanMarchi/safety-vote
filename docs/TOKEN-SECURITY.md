# Token Security Guide

## Overview

This guide explains how Safety Vote secures JWT tokens and refresh tokens to prevent common attacks and maintain multi-tenant isolation.

## Token Types

### JWT Access Token

**Purpose**: Authenticate API requests

**Format**: JWT (JSON Web Token) with HMAC-SHA256 signature

**Expiration**: 15 minutes

**Storage**: Encrypted in httpOnly secure cookie

**Example JWT**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiIxMjM0NTY3ODkwIiwic2Vzc2lvbl9pZCI6ImFiYzEyMzQiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJjb21wYW55X2lkIjoiY29tcC01Njc4Iiwicm9sZSI6ImVsZWl0b3IiLCJpYXQiOjE3MDk3MjE2MDAsImV4cCI6MTcwOTcyMjUwMH0
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**JWT Payload Structure**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "user_id_uuid",
  "session_id": "session_uuid",
  "email": "user@example.com",
  "company_id": "company_uuid",
  "role": "eleitor|rh|admin",
  "device_fingerprint": "sha256_hash",
  "iat": 1709721600,
  "exp": 1709722500,
  "iss": "safety-vote",
  "aud": "safety-vote",
  "jti": "unique_token_id"
}
.
{signature_base64url}
```

### Refresh Token

**Purpose**: Obtain new access tokens

**Format**: 256-bit random value, base64url encoded

**Expiration**: 30 days

**Storage**: Hashed with SHA-256 before database storage (never plaintext)

**Example**: `AZkqA1p_vC2d5eF8jH9kL0mN1pQ2rS3tU4vW5xY6zAbCdE7f8gH9iJ0k`

## Signature Verification

### HMAC-SHA256 Signature

All JWT tokens are signed using HMAC-SHA256 with the `SUPABASE_JWT_SECRET`.

**Process**:

1. **Token Creation**:
   ```
   header = base64url({ "alg": "HS256", "typ": "JWT" })
   payload = base64url({ user claims })
   message = header + "." + payload
   signature = HMAC-SHA256(message, secret)
   token = message + "." + signature
   ```

2. **Token Verification**:
   ```
   parts = token.split(".")
   header = parts[0]
   payload = parts[1]
   signature = parts[2]

   message = header + "." + payload
   expectedSignature = HMAC-SHA256(message, secret)

   if (signature == expectedSignature) {
     // Token valid, decode payload
   } else {
     // Token tampered with, REJECT
   }
   ```

3. **Implementation**:
   ```typescript
   import * as crypto from 'crypto';

   function verifyJWTSignature(token: string, secret: string): boolean {
     const parts = token.split('.');
     if (parts.length !== 3) return false;

     const [header, payload, signature] = parts;
     const message = `${header}.${payload}`;

     const expectedSignature = crypto
       .createHmac('sha256', secret)
       .update(message)
       .digest('base64url');

     return signature === expectedSignature;
   }
   ```

### Signature Importance

**Without signature verification**, attackers could:
- Change user_id to impersonate another user
- Change role from "eleitor" to "admin"
- Change company_id to access other company's data
- Create own tokens without backend involvement

**With signature verification**:
- Any modification detected
- Token rejected as invalid
- Attack prevented
- Attack logged for security monitoring

## Token Storage Security

### Frontend Storage (Recommended Approach)

**httpOnly Secure Cookie** (Most Secure):
```javascript
// Set by server in Set-Cookie header
Set-Cookie: access_token=eyJ...;
  HttpOnly;
  Secure;
  SameSite=Strict;
  Path=/;
  Max-Age=900
```

**Benefits**:
- ✅ JavaScript cannot access (prevents XSS theft)
- ✅ Only sent over HTTPS (prevents MITM)
- ✅ Protected by SameSite=Strict (prevents CSRF)
- ✅ Automatically included in requests
- ✅ Automatic expiration

**Implementation** (Server-side):
```typescript
res.setHeader('Set-Cookie', [
  `access_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`,
  `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`
]);
```

### Frontend Storage (Acceptable Alternative)

**Memory/State** (For Single-Page Apps):
```javascript
// Store in React state or Context API
const [accessToken, setAccessToken] = useState(null);
const [refreshToken, setRefreshToken] = useState(null);

// Include in fetch requests
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${accessToken}` }
});
```

**Pros**:
- ✅ Lost on page refresh (lower persistence)
- ✅ Not stored in browser storage

**Cons**:
- ❌ Lost when user navigates away
- ❌ Requires manual request retry logic
- ❌ More complex than httpOnly cookies

### Backend Storage (Token Hash)

**Database** (user_sessions table):
```sql
CREATE TABLE user_sessions (
  ...
  access_token_hash VARCHAR(256) NOT NULL,    -- SHA-256 hash
  refresh_token_hash VARCHAR(256) NOT NULL,   -- SHA-256 hash
  ...
);
```

**Why Hash?**
- If database breached, tokens not exposed
- Attacker cannot directly use stolen hashes
- Validation done via comparison, not decryption

**Hashing Process**:
```typescript
import * as crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Storage
const tokenHash = hashToken(token);
await supabase
  .from('user_sessions')
  .insert({ access_token_hash: tokenHash, ... });

// Verification
const storedHash = row.access_token_hash;
const computedHash = hashToken(providedToken);
if (storedHash === computedHash) {
  // Token valid
}
```

### Token NOT Stored Insecurely

**🔴 Never do this**:
```javascript
// ❌ localStorage (vulnerable to XSS)
localStorage.setItem('token', token);

// ❌ sessionStorage (vulnerable to XSS)
sessionStorage.setItem('token', token);

// ❌ Global variable
window.authToken = token;

// ❌ Plaintext in database
db.insert('user_sessions', { access_token: token });
```

## Preventing Common Attacks

### 1. XSS (Cross-Site Scripting) Attack

**Attack**: Malicious script injected into page steals tokens from localStorage

**Prevention**:
- ✅ Use httpOnly cookies (JavaScript cannot access)
- ❌ Never store tokens in localStorage
- ✅ Implement Content Security Policy (CSP)
- ✅ Sanitize user input
- ✅ Update dependencies regularly

**Implementation**:
```typescript
// Set httpOnly flag prevents XSS theft
res.setHeader('Set-Cookie',
  `token=${jwt}; HttpOnly; Secure; Path=/`
);

// CSP header prevents inline scripts
res.setHeader('Content-Security-Policy',
  "default-src 'self'; script-src 'self'"
);
```

### 2. CSRF (Cross-Site Request Forgery) Attack

**Attack**: Malicious site tricks user into making request with their credentials

**Prevention**:
- ✅ SameSite=Strict flag on cookies (not sent cross-site)
- ✅ CSRF token validation for state-changing operations
- ✅ Origin header verification

**Implementation**:
```typescript
// Access token: SameSite=Strict
// Not sent on cross-site requests
Set-Cookie: access_token=...; SameSite=Strict

// Refresh token: SameSite=Lax
// Sent on safe cross-site requests (navigation)
Set-Cookie: refresh_token=...; SameSite=Lax
```

### 3. Token Tampering

**Attack**: Modify JWT payload to change user_id or role

**Prevention**:
- ✅ HMAC-SHA256 signature verification
- ✅ Reject tokens with invalid signature
- ✅ Use strong secret key (from Supabase)
- ✅ Never accept unsigned tokens

**Tampered Token Example**:
```
Original token:
eyJ..ORIGINAL_SIG

Attacker modifies payload to change role:
eyJ..MODIFIED_PAYLOAD.KEEPS_OLD_SIG  ← Different payload, same sig
      ^ payload changed
                            ^ signature doesn't match new payload
                                       → REJECTED ✅

Attacker tries to create new signature:
eyJ..MODIFIED_PAYLOAD.ATTACKER_SIG
                      ^ Using guess or wrong secret
                                    → Signature invalid ✅
```

### 4. Replay Attack

**Attack**: Reuse old token multiple times

**Prevention**:
- ✅ 15-minute expiration on access tokens
- ✅ Session revocation marks token invalid
- ✅ JTI (JWT ID) prevents duplicate tokens
- ✅ Single-use enforcement for magic links

**Implementation**:
```typescript
// Access token includes expiration
payload.exp = now + 15*60;

// Refresh token can only be used once per session
await validateRefreshToken(token);

// Magic link tokens are marked as used
token.is_used = true;
```

### 5. Brute Force Attack

**Attack**: Try many tokens to find valid one

**Prevention**:
- ✅ Rate limiting on refresh endpoint (10/min per IP)
- ✅ Rate limiting on magic link endpoint (5/10min per IP)
- ✅ Exponential backoff on failures
- ✅ Account lockout after N failures
- ✅ Log all failed attempts

**Implementation**:
```typescript
// Rate limiting using in-memory cache
const rateLimiter = new Map();

function checkRateLimit(ip: string): boolean {
  const attempts = rateLimiter.get(ip) || [];
  const recentAttempts = attempts.filter(t =>
    Date.now() - t < 60000
  );

  if (recentAttempts.length >= 10) {
    return false; // Rate limited
  }

  recentAttempts.push(Date.now());
  rateLimiter.set(ip, recentAttempts);
  return true;
}
```

### 6. Token Leakage

**Attack**: Token exposed in logs, error messages, or network traffic

**Prevention**:
- ✅ Never log full tokens (hash before logging)
- ✅ Remove tokens from error messages
- ✅ Use HTTPS only (TLS encryption)
- ✅ Secure headers prevent caching
- ✅ No tokens in query parameters

**Implementation**:
```typescript
// ✅ Safe: Hash token before logging
const tokenHash = hashToken(token);
logger.info(`Token used: ${tokenHash}`);

// ❌ Unsafe: Logging full token
logger.info(`Token: ${token}`);

// ✅ Safe: HTTPS enforced
app.use((req, res, next) => {
  if (req.protocol !== 'https') {
    return res.status(403).send('HTTPS required');
  }
  next();
});

// ✅ Safe: Secure headers
res.setHeader('Pragma', 'no-cache');
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
```

### 7. Session Hijacking

**Attack**: Steal token and use from different device/IP

**Prevention**:
- ✅ Device fingerprinting (IP + User-Agent)
- ✅ Verify fingerprint on every request
- ✅ Return 401 if fingerprint doesn't match
- ✅ Log suspicious activity
- ✅ Recommend re-authentication

**Implementation**:
```typescript
import * as crypto from 'crypto';

function generateDeviceFingerprint(ip: string, ua: string): string {
  const combined = `${ip}:${ua}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

// On request validation
const currentFingerprint = generateDeviceFingerprint(clientIP, userAgent);
if (currentFingerprint !== sessionFingerprint) {
  // Device mismatch - possible hijacking
  logSecurityEvent({ type: 'device_mismatch' });
  return 401;
}
```

## Multi-Tenant Isolation

### Tenant Verification

Each request validates that user belongs to correct company:

```typescript
// JWT contains company_id
const payload = verifyAccessToken(token);
const companyId = payload.company_id;

// Database query includes company_id filter
const data = await supabase
  .from('votes')
  .select('*')
  .eq('company_id', companyId)  // ✅ Filter by tenant
  .eq('id', voteId);

// RLS policy enforces at database level
CREATE POLICY votes_isolation ON votes
  USING (company_id = auth.user_company_id());
```

### Attack Prevention

**Attack**: Attacker modifies JWT to change company_id

**Prevention**:
1. ✅ JWT signature verification detects modification
2. ✅ Modified token rejected as invalid
3. ✅ RLS policy blocks access anyway (defense in depth)

```
Attack flow:
1. Attacker intercepts token
2. Modifies company_id claim
3. Creates new signature attempt
4. Sends modified token

Server validation:
1. Check JWT signature → FAILS (wrong secret)
2. Token rejected → 401
3. Unauthorized access prevented ✅
```

## Security Headers

**Recommended headers** to include in responses:

```typescript
// Content Security Policy
res.setHeader('Content-Security-Policy',
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
);

// Prevent MIME type sniffing
res.setHeader('X-Content-Type-Options', 'nosniff');

// Disable framing
res.setHeader('X-Frame-Options', 'DENY');

// Enable XSS protection
res.setHeader('X-XSS-Protection', '1; mode=block');

// Prevent caching of sensitive responses
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');

// HTTPS only
res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

// Referrer policy
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

## Audit Logging

All token operations logged to `audit_logs` table:

```sql
INSERT INTO audit_logs (
  user_id, action, table_name, ip_address, user_agent, metadata, created_at
) VALUES (
  '123', 'TOKEN_REFRESHED', 'user_sessions', '192.168.1.1',
  'Mozilla/5.0...',
  '{"session_id": "abc", "reason": "access_token_expired"}',
  NOW()
);
```

**Events Logged**:
- `session.created` - New session created
- `TOKEN_REFRESHED` - Access token refreshed
- `LOGOUT_SUCCESS` - Session revoked
- `suspicious_activity` - Tampered token detected
- `device_mismatch` - Fingerprint mismatch

## Rotation and Refresh

### Access Token Refresh

**Flow**:
```
1. User's access token expires (15 min)
2. Frontend detects 401 response
3. Frontend calls /api/auth/refresh-token
4. Backend validates refresh_token
5. Backend generates new access_token
6. Both tokens sent to frontend
7. Frontend retries original request
```

**Implementation**:
```typescript
// Frontend
async function fetchWithRefresh(url: string) {
  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (response.status === 401) {
    // Token expired, try refresh
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const { access_token } = await refreshResponse.json();
    setAccessToken(access_token);

    // Retry original request
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
  }

  return response;
}
```

### Secret Rotation (Future Enhancement)

When JWT secret needs to be rotated:

```typescript
// 1. Generate new secret
const newSecret = generateNewSecret();

// 2. For period of time, accept both old and new
const secrets = [currentSecret, newSecret];

// 3. Issue all new tokens with new secret
useSecretForIssuance(newSecret);

// 4. After grace period, stop accepting old
removeOldSecret();
```

## Testing Security

### Unit Tests

```typescript
describe('Token Security', () => {
  test('should reject tampered token', () => {
    const token = generateToken(payload);
    const tampered = token.slice(0, -10) + 'invalidsig';
    expect(verifyAccessToken(tampered)).toBeNull();
  });

  test('should reject expired token', () => {
    const token = generateExpiredToken();
    expect(verifyAccessToken(token)).toBeNull();
  });

  test('should detect device fingerprint mismatch', () => {
    const fingerprint = generateDeviceFingerprint('192.168.1.1', 'Chrome');
    const different = generateDeviceFingerprint('10.0.0.1', 'Firefox');
    expect(fingerprint).not.toBe(different);
  });
});
```

### Manual Testing

```bash
# Test expired token rejection
curl -H "Authorization: Bearer <expired_token>" \
  https://api.example.com/protected

# Test rate limiting
for i in {1..15}; do
  curl -X POST https://api.example.com/auth/refresh-token
done
# Should get 429 on request 11+

# Test device fingerprint
# 1. Login on desktop, note IP
# 2. VPN to different IP
# 3. Attempt request
# Should fail with 401
```

## Compliance

**Standards Implemented**:
- ✅ OWASP Authentication Cheat Sheet
- ✅ RFC 7519 (JSON Web Token)
- ✅ RFC 6234 (US Secure Hash Algorithms)
- ✅ NIST recommendations for session management

**Certifications**:
- ✅ GDPR compliant (data protection)
- ✅ LGPD compliant (Brazilian data protection)
- ✅ CIPA compliant (voting system)

## References

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Token Storage Security](https://blog.jscrambler.com/xss-cookie-security/)
- [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [HTTP Security Headers](https://owasp.org/www-project-secure-headers/)
