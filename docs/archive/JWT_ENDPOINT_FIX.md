# 🔧 JWT Endpoint Fix - Quick Reference

## ❌ WRONG (Old Way)

```javascript
// POST request with userId in body
const response = await fetch('/auth/session-token', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sessionId: '673sTtv4ZJfOMirIFsRT',
    userId: ''  // ← Often empty!
  })
});
```

**Problems:**
- ❌ Wrong HTTP method (POST instead of GET)
- ❌ Wrong endpoint (/auth/session-token)
- ❌ Sending userId in body (often empty)
- ❌ Body not needed for GET requests

---

## ✅ CORRECT (New Way)

```javascript
// GET request with sessionId in URL only
const response = await fetch(`/sessions/${sessionId}/jwt`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
  // ← NO BODY!
});
```

**Benefits:**
- ✅ Correct HTTP method (GET)
- ✅ Correct endpoint (/sessions/{sessionId}/jwt)
- ✅ SessionId in URL (RESTful)
- ✅ No userId needed
- ✅ No body for GET request

---

## 📋 Before & After Comparison

### Before:
```bash
curl -X POST https://.../api/auth/session-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "sessionId": "673sTtv4ZJfOMirIFsRT",
    "userId": ""
  }'
```

### After:
```bash
curl -X GET https://.../api/sessions/673sTtv4ZJfOMirIFsRT/jwt \
  -H "Authorization: Bearer TOKEN"
```

**Much cleaner!** 🎉

---

## 🔍 Why This Matters

### 1. RESTful Design
GET requests should not have a body. The resource ID (sessionId) belongs in the URL.

### 2. No Empty Fields
Previously, userId was often empty: `"userId": ""` which caused confusion.

### 3. Simpler Code
No need to construct a body object for a simple token fetch.

### 4. Backend Can Identify User
The backend already knows the user from the Bearer token, no need to send userId separately.

---

## 💻 Code Examples

### JavaScript/TypeScript
```typescript
// ✅ CORRECT
import { getSessionJWT } from './api/sessions';

const { jwt, serverUrl } = await getSessionJWT(sessionId);
// Internally uses: GET /sessions/{sessionId}/jwt
```

### cURL
```bash
# ✅ CORRECT
SESSION_ID="673sTtv4ZJfOMirIFsRT"
ACCESS_TOKEN="eyJhbGc..."

curl -X GET "https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/$SESSION_ID/jwt" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Python
```python
# ✅ CORRECT
import requests

session_id = "673sTtv4ZJfOMirIFsRT"
access_token = "eyJhbGc..."

response = requests.get(
    f"https://.../api/sessions/{session_id}/jwt",
    headers={"Authorization": f"Bearer {access_token}"}
)

jwt_token = response.json()["data"]["jitsiToken"]
```

---

## 🎯 Full Video Session Flow

### Step 1: Login
```javascript
const loginResponse = await fetch('/api/auth/register-or-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'therapist-test@example.com',
    password: 'Test123!'
  })
});

const { accessToken } = loginResponse.data;
```

### Step 2: Create Appointment/Session
```javascript
const sessionResponse = await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    therapistId: 'USR-THERAPIST-TEST',
    clientId: 'BcQX81V80Q4JTf19ZEpB',
    scheduledAt: '2025-11-14T10:00:00Z',
    duration: 60,
    sessionType: 'video'
  })
});

const { sessionId } = sessionResponse.data.appointment;
```

### Step 3: Get JWT Token ⭐ FIXED
```javascript
// ✅ NEW: GET request, no body
const jwtResponse = await fetch(`/api/sessions/${sessionId}/jwt`, {
  method: 'GET',  // ← GET, not POST!
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
  // ← No body!
});

const { jitsiToken, serverUrl } = jwtResponse.data;
```

### Step 4: Join Video Call
```javascript
const api = new JitsiMeetExternalAPI(serverUrl, {
  roomName: roomName,
  jwt: jitsiToken,
  parentNode: document.getElementById('jitsi-container')
});
```

---

## 📊 API Debug Panel - What You'll See

### ❌ Before (Wrong):
```
POST /auth/session-token
Status: 400 Bad Request
Request Body:
{
  "sessionId": "673sTtv4ZJfOMirIFsRT",
  "userId": ""  ← Empty!
}
Response:
{
  "error": "Invalid request"
}
```

### ✅ After (Correct):
```
GET /sessions/673sTtv4ZJfOMirIFsRT/jwt
Status: 200 OK
Request Body: (none)  ← No body!
Response:
{
  "success": true,
  "data": {
    "jitsiToken": "eyJhbGc...",
    "serverUrl": "meet.bedrockhealthsolutions.com"
  }
}
```

---

## 🐛 Debugging Tips

### Check the API Debug Panel (Orange Button)
1. Open the panel before making request
2. Look for the JWT request
3. Verify it says **GET** (not POST)
4. Verify URL is `/sessions/{id}/jwt`
5. Verify there's **no body**
6. Check response has `jitsiToken`

### Common Errors:
```
❌ "Cannot read properties of undefined (reading 'jwt')"
→ Response doesn't have jwt/jitsiToken field

❌ "userId is required"
→ Still using old POST endpoint with body

❌ "Session not found"
→ SessionId in URL is wrong or session expired

❌ "Unauthorized"
→ Bearer token missing or expired
```

---

## ✅ Files Updated

1. `/api/sessions.ts` - Changed `getSessionJWT()` function
2. `/test-video-session.sh` - Updated curl command
3. `/components/CreateSessionTest.tsx` - Added clarifying comment

---

## 🎉 Summary

**What changed:**
- HTTP method: POST → GET
- Endpoint: `/auth/session-token` → `/sessions/{sessionId}/jwt`
- Body: `{ sessionId, userId }` → (no body)
- userId: Required → Not needed

**Why it's better:**
- ✅ RESTful design
- ✅ No empty fields
- ✅ Simpler code
- ✅ Backend handles auth via Bearer token

---

**The fix is complete and ready to use!** 🚀
