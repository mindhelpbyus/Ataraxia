# User Updates Summary

## ✅ Changes Completed

### 1. Added New Therapist User

**User Details:**
```json
{
  "id": "USR-THERAPIST-TEST",
  "userId": "USR-THERAPIST-TEST",
  "email": "therapist-test@example.com",
  "firstName": "User",
  "lastName": "USR-THERAPIST-TEST",
  "role": "therapist",
  "isActive": true,
  "password": "Test123!",
  "createdAt": "November 13, 2025 at 9:48:18 PM UTC-8",
  "lastLoginAt": "November 13, 2025 at 9:48:20 PM UTC-8",
  "updatedAt": "November 13, 2025 at 9:48:20 PM UTC-8"
}
```

**File Updated:**
- `/data/demoUsers.ts` - Added to `DEMO_THERAPISTS` array

**Login Credentials:**
- Email: `therapist-test@example.com`
- Password: `Test123!`

---

### 2. Added Real Client User

**User Details:**
```json
{
  "id": "USR-CLIENT-2025",
  "email": "client-test@example.com",
  "name": "Test Client",
  "role": "client",
  "password": "Test123!",
  "phoneNumber": "+1 (555) 106-1006"
}
```

**File Updated:**
- `/data/demoUsers.ts` - Added to `DEMO_PATIENTS` array

**Login Credentials:**
- Email: `client-test@example.com`
- Password: `Test123!`

**Note:** This uses the client ID `USR-CLIENT-2025` for your Firestore

---

### 3. Fixed JWT Token Endpoint Issue

**Problem:**
- JWT token request was using POST with userId in body
- userId was being sent empty: `{ "sessionId": "...", "userId": "" }`

**Solution:**
Changed from:
```javascript
// ❌ OLD: POST with body containing sessionId and userId
POST /auth/session-token
Body: {
  "sessionId": "673sTtv4ZJfOMirIFsRT",
  "userId": ""  // ← Empty!
}
```

To:
```javascript
// ✅ NEW: GET with sessionId in URL only
GET /sessions/{sessionId}/jwt
// No body at all!
```

**Files Updated:**
1. `/api/sessions.ts`
   - Changed `getSessionJWT()` to use GET instead of POST
   - Removed userId parameter from body
   - SessionId now in URL: `/sessions/{sessionId}/jwt`

2. `/test-video-session.sh`
   - Updated curl command to use GET
   - Removed userId from request body

3. `/components/CreateSessionTest.tsx`
   - Added clarifying comment about GET request with no body

---

## 📋 API Call Flow (Corrected)

### Step 1: Login
```bash
POST /api/auth/register-or-login
Body: {
  "email": "therapist-test@example.com",
  "password": "Test123!"
}
Response: {
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Step 2: Create Session/Appointment
```bash
POST /api/appointments
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}
Body: {
  "therapistId": "USR-THERAPIST-TEST",
  "clientId": "USR-CLIENT-2025",
  "scheduledAt": "2025-11-14T10:00:00Z",
  "duration": 60,
  "sessionType": "video"
}
Response: {
  "success": true,
  "data": {
    "appointment": {
      "id": "...",
      "sessionId": "673sTtv4ZJfOMirIFsRT"
    }
  }
}
```

### Step 3: Get JWT Token (CORRECTED)
```bash
GET /api/sessions/673sTtv4ZJfOMirIFsRT/jwt
Headers: {
  "Authorization": "Bearer eyJhbGc..."
}
# ← NO BODY!
Response: {
  "success": true,
  "data": {
    "jitsiToken": "eyJhbGc...",
    "serverUrl": "meet.bedrockhealthsolutions.com"
  }
}
```

### Step 4: Join Video Call
```javascript
const api = new JitsiMeetExternalAPI('meet.bedrockhealthsolutions.com', {
  roomName: roomName,
  jwt: jitsiToken,
  ...
});
```

---

## 🔧 Key Changes Summary

### Before:
```javascript
// POST with userId (often empty)
const response = await post('/auth/session-token', {
  sessionId: sessionId,
  userId: currentUserId  // ← Could be empty ""
});
```

### After:
```javascript
// GET with sessionId in URL only
const response = await get(`/sessions/${sessionId}/jwt`);
// No body, no userId!
```

---

## 🧪 Testing the Changes

### Test New Therapist:
```bash
# Login
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "therapist-test@example.com",
    "password": "Test123!"
  }'
```

### Test New Client:
```bash
# Login
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client-test@example.com",
    "password": "Test123!"
  }'
```

### Test JWT Token (with correct endpoint):
```bash
# 1. Get access token first
ACCESS_TOKEN="your_token_here"
SESSION_ID="your_session_id_here"

# 2. Get JWT token
curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/$SESSION_ID/jwt \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 📝 Updated Demo Users List

### Therapists:
1. **Dr. Sarah Mitchell**
   - Email: `therapist3@bedrock.test`
   - Password: `Therapist123!`

2. **Dr. James Chen**
   - Email: `therapist4@bedrock.test`
   - Password: `Therapist123!`

3. **Test User** (Backend Verified)
   - Email: `newtest@example.com`
   - Password: `Test123!`

4. **User USR-THERAPIST-TEST** (Firestore Verified) ⭐ NEW
   - Email: `therapist-test@example.com`
   - Password: `Test123!`
   - ID: `USR-THERAPIST-TEST`

### Clients/Clients:
5. **Susan Marie**
   - Email: `susan.marie@email.com`
   - Password: `client123`

6. **John Paul**
   - Email: `john.paul@email.com`
   - Password: `client123`

7. **Test Client** (Real Client ID) ⭐ NEW
   - Email: `client-test@example.com`
   - Password: `Test123!`
   - ID: `BcQX81V80Q4JTf19ZEpB`

### Admin:
8. **System Administrator**
   - Email: `admin3@bedrock.test`
   - Password: `Admin123!`

---

## ✅ Files Modified

1. `/data/demoUsers.ts`
   - Added therapist: `USR-THERAPIST-TEST`
   - Added client: `BcQX81V80Q4JTf19ZEpB`
   - Updated login instructions

2. `/api/sessions.ts`
   - Changed `getSessionJWT()` from POST to GET
   - Removed userId from request
   - Updated endpoint to `/sessions/{sessionId}/jwt`

3. `/test-video-session.sh`
   - Updated JWT fetch to use GET
   - Removed userId from curl command

4. `/components/CreateSessionTest.tsx`
   - Added clarifying comment about GET request

---

## 🎯 What This Fixes

### Issue 1: Empty userId
**Before:** `{ "sessionId": "...", "userId": "" }`  
**After:** No userId sent at all - sessionId in URL only

### Issue 2: Wrong HTTP Method
**Before:** POST `/auth/session-token`  
**After:** GET `/sessions/{sessionId}/jwt`

### Issue 3: Missing Test Users
**Before:** No user with ID `USR-THERAPIST-TEST` or `BcQX81V80Q4JTf19ZEpB`  
**After:** Both users added and ready to use

---

## 🚀 Next Steps

1. **Test the new users:**
   - Login with `therapist-test@example.com`
   - Login with `client-test@example.com`

2. **Test JWT endpoint:**
   - Create a session
   - Call GET `/sessions/{sessionId}/jwt`
   - Verify no userId is sent
   - Verify JWT token is returned

3. **Verify in API Debug Panel:**
   - Open the orange "API Debug" button
   - Watch the GET request
   - Confirm no body is sent
   - Confirm response includes JWT

---

**All changes are complete and ready to test!** 🎉
