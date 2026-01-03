# ✅ Updated User IDs

## 📋 Summary of Changes

We've updated the user IDs to be more consistent and memorable:

### Old → New

| Role | Old ID | New ID | Email | Status |
|------|--------|--------|-------|--------|
| **Therapist** | `USR-NEW-TEST-001` | `USR-THERAPIST-2025` | newtest@example.com | ✅ Updated |
| **Client** | `BcQX81V80Q4JTf19ZEpB` | `USR-CLIENT-2025` | client-test@example.com | ✅ Updated |

---

## 🎯 Current Test Users

### Therapist (Moderator)
```json
{
  "userId": "USR-THERAPIST-2025",
  "email": "newtest@example.com",
  "password": "Test123!",
  "role": "therapist",
  "firstName": "Test",
  "lastName": "User"
}
```

### Client (Participant)
```json
{
  "userId": "USR-CLIENT-2025",
  "email": "client-test@example.com",
  "password": "Test123!",
  "role": "client",
  "name": "Test Client"
}
```

---

## 🔧 Files Updated

### Code Files
- ✅ `/api/sessions.ts` - Default client ID
- ✅ `/components/CreateSessionTest.tsx` - Test component
- ✅ `/data/demoUsers.ts` - Demo user data
- ✅ `/App.tsx` - Console log messages

### Test Scripts
- ✅ `/test-video-session.sh` - Video session test script
- ✅ `/test-all-users.sh` - All users test script

### Documentation Files
*(Will be updated in next batch)*
- `/BACKEND_TEST_CREDENTIALS.md`
- `/VERIFIED_USER_INFO.md`
- `/TEST_USER_QUICK_REFERENCE.md`
- `/VIDEO_SESSION_API_GUIDE.md`
- `/VIDEO_SESSION_QUICK_FIX.md`
- `/QUICK_CURL_TESTS.md`
- And others...

---

## 🧪 Quick Test

### 1. Login as Therapist
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-2025",
    "email": "newtest@example.com",
    "role": "therapist"
  }'
```

### 2. Create Video Session
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "therapistId": "USR-THERAPIST-2025",
    "clientId": "USR-CLIENT-2025",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true
  }'
```

### 3. Get JWT Token
```bash
curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/{sessionId}/jwt \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎥 Video Call Flow

```
1. Login
   POST /api/auth/register-or-login
   Body: { userId: "USR-THERAPIST-2025", ... }
   → Returns: { accessToken }

2. Create Appointment/Session
   POST /api/appointments
   Headers: { Authorization: Bearer {accessToken} }
   Body: { 
     therapistId: "USR-THERAPIST-2025",
     clientId: "USR-CLIENT-2025",
     ...
   }
   → Returns: { sessionId }

3. Get JWT Token
   GET /api/sessions/{sessionId}/jwt
   Headers: { Authorization: Bearer {accessToken} }
   → Returns: { jitsiToken, serverUrl }

4. Join Video Call
   Use JitsiMeetExternalAPI with jitsiToken
```

---

## ⚠️ Important Notes

### ID Format
Both IDs follow the pattern: `USR-{ROLE}-{YEAR}`
- ✅ `USR-THERAPIST-2025` - Therapist user from 2025
- ✅ `USR-CLIENT-2025` - Client user from 2025

### Different Users Required
When creating video sessions:
- ❌ **WRONG:** `therapistId` and `clientId` are the same
- ✅ **CORRECT:** `therapistId` ≠ `clientId`

Example:
```json
{
  "therapistId": "USR-THERAPIST-2025",  // ✅ Different
  "clientId": "USR-CLIENT-2025"          // ✅ Different
}
```

### Firestore Backend
These users must exist in your Firestore `users` collection with these exact `userId` values:
- `USR-THERAPIST-2025`
- `USR-CLIENT-2025`

---

## 🚀 Testing

### Run Test Script
```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

This will:
1. ✅ Login as `USR-THERAPIST-2025`
2. ✅ Create session with `USR-CLIENT-2025`
3. ✅ Get JWT token for Jitsi
4. ✅ Display all results

---

## 📝 Console Log Output

When you run the app, you'll see:

```
THERAPISTS:
1. therapist3@bedrock.test / Therapist123!
2. therapist4@bedrock.test / Therapist123!
3. newtest@example.com / Test123! (ID: USR-THERAPIST-2025 Backend Verified ✅)
4. therapist-test@example.com / Test123! (ID: USR-THERAPIST-TEST 🆕)

CLIENTS:
5. client-test@example.com / Test123! (ID: USR-CLIENT-2025 🆕)

ADMIN:
6. admin3@bedrock.test / Admin123!
```

---

## ✅ Verification Checklist

Before using these IDs in production:

- [ ] Verify `USR-THERAPIST-2025` exists in Firestore users collection
- [ ] Verify `USR-CLIENT-2025` exists in Firestore users collection
- [ ] Both users have correct `role` field set
- [ ] Test login with both users
- [ ] Test creating a video session
- [ ] Test getting JWT token
- [ ] Test joining video call

---

**Last Updated:** November 14, 2025  
**Status:** ✅ All core files updated, documentation update in progress
