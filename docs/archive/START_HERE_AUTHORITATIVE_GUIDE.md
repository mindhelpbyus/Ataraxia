# 🎯 START HERE - Complete Backend Integration Guide

**This is the ONLY guide you need.** All other documentation files are outdated.

---

## 🔐 The Correct Flow (4 Steps)

```
1. Login → Get Bearer Token (accessToken)
   ↓
2. Create Appointment → Get sessionId  
   ↓
3. Get JWT Token → Use sessionId to get jitsiToken
   ↓
4. Join Video Call → Use jitsiToken
```

**IMPORTANT:** You MUST create the appointment FIRST to get the `sessionId`, THEN use that `sessionId` to request the JWT token.

---

## 📋 Step-by-Step Integration

### Step 1: Login (Get Bearer Token)

**Endpoint:** `POST /api/auth/register-or-login`

**Request:**
```json
{
  "userId": "therapist-3-id",
  "email": "therapist3@bedrock.test",
  "role": "therapist"
}
```

**⚠️ IMPORTANT:** Backend does NOT use passwords! Only send `userId`, `email`, and `role`.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "firestore-doc-id",
      "userId": "therapist-3-id",
      "email": "therapist3@bedrock.test",
      "role": "therapist"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",  ← THIS IS YOUR BEARER TOKEN
      "refreshToken": "eyJhbGc...",
      "expiresIn": "2h"
    }
  }
}
```

**What to store:** Save `accessToken` - you'll use it as Bearer token for all subsequent requests.

---

### Step 2: Create Appointment (Get sessionId)

**Endpoint:** `POST /api/appointments`

**Headers:**
```
Authorization: Bearer eyJhbGc...  ← Use the accessToken from Step 1
Content-Type: application/json
```

**Request:**
```json
{
  "therapistId": "therapist-3-id",
  "clientId": "client-susan-id",
  "startTime": "2025-11-15T10:00:00Z",
  "endTime": "2025-11-15T11:00:00Z",
  "title": "Therapy Session",
  "recordingEnabled": true,
  "chatEnabled": true,
  "screenShareEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appt-123",
      "sessionId": "session-123",  ← YOU NEED THIS FOR STEP 3!
      "roomName": "bedrock-session-123",
      "meetingLink": "https://meet.bedrockhealthsolutions.com/bedrock-session-123",
      "startTime": "2025-11-15T10:00:00Z",
      "endTime": "2025-11-15T11:00:00Z",
      "createdAt": "2025-11-13T08:30:00Z"
    }
  }
}
```

**What to store:** Save `sessionId` - you'll use it to get the JWT token in Step 3.

---

### Step 3: Get JWT Token (For Video Calling)

**Endpoint:** `POST /api/auth/session-token`

**Headers:**
```
Authorization: Bearer eyJhbGc...  ← Use the accessToken from Step 1
Content-Type: application/json
```

**Request:**
```json
{
  "sessionId": "session-123",  ← Use the sessionId from Step 2
  "userId": "therapist-3-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jitsiToken": "eyJhbGc...",  ← THIS IS YOUR JITSI JWT TOKEN
    "sessionToken": "eyJhbGc...",
    "expiresIn": "4h",
    "role": "moderator"
  }
}
```

**What to store:** Save `jitsiToken` - you'll use it to join the video call in Step 4.

---

### Step 4: Join Video Call

**Use JitsiMeetExternalAPI:**

```javascript
const jitsiApi = new JitsiMeetExternalAPI('meet.bedrockhealthsolutions.com', {
  roomName: 'bedrock-session-123',  // From Step 2 response
  jwt: 'eyJhbGc...',                 // jitsiToken from Step 3
  parentNode: document.getElementById('jitsi-container'),
  configOverwrite: {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false
  }
});
```

---

## 🔗 All Backend Endpoints

Your backend base URL:
```
https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi
```

| Purpose | Full URL | Method | Auth Required |
|---------|----------|--------|---------------|
| **Health Check** | `/health` | GET | No |
| **Login/Register** | `/api/auth/register-or-login` | POST | No |
| **Get User Info** | `/api/auth/me` | GET | Yes (Bearer) |
| **Create Appointment** | `/api/appointments` | POST | Yes (Bearer) |
| **Get JWT Token** | `/api/auth/session-token` | POST | Yes (Bearer) |
| **Refresh Token** | `/api/auth/refresh` | POST | No |
| **Logout** | `/api/auth/logout` | POST | Yes (Bearer) |

**Note:** Health endpoint does NOT have `/api` prefix!
- ✅ Correct: `https://.../bedrockBackendApi/health`
- ❌ Wrong: `https://.../bedrockBackendApi/api/health`

---

## 🧪 Testing Your Integration

### Quick Test Script

Run this to verify your backend is working:

```bash
chmod +x test-backend-connection.sh
./test-backend-connection.sh
```

**Expected output:**
```
✅ PASS: Health endpoint is reachable
✅ PASS: Login endpoint is reachable
✅ PASS: Login successful!
✅ Access token received
✅ Backend is FULLY OPERATIONAL
```

### Manual Testing in Your App

1. **Test with ConnectionDiagnostic component:**
   - Open your app: `npm run dev`
   - Find the ConnectionDiagnostic component
   - Click "Run Diagnostics"
   - Should see ✅ green success messages

2. **Test with CreateSessionTest component:**
   - Select "Dr. Sarah Mitchell"
   - Click "Login" → Should get Bearer token
   - Click "Create Session" → Should get sessionId
   - Click "Get JWT Token" → Should get jitsiToken
   - Click "Join Video" → Should open Jitsi video call

---

## 👥 Test User Credentials

Make sure these users exist in your Firebase backend:

**⚠️ IMPORTANT:** Backend does NOT use passwords! Login only requires `userId`, `email`, and `role`.

### Therapists
```
UserId: therapist-3-id
Email: therapist3@bedrock.test
Name: Dr. Sarah Mitchell
Role: therapist

UserId: therapist-4-id
Email: therapist4@bedrock.test
Name: Dr. James Chen
Role: therapist
```

### Clients
```
UserId: client-susan-id
Email: susan.marie@email.com
Name: Susan Marie
Role: client

UserId: client-john-id
Email: john.paul@email.com
Name: John Paul
Role: client
```

### Admin
```
UserId: admin-3-id
Email: admin3@bedrock.test
Name: System Administrator
Role: admin
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Wrong: Trying to get JWT before creating appointment
```javascript
// DON'T DO THIS!
await login();
await getJWT('some-session-id');  // ❌ This will fail - session doesn't exist yet!
```

### ✅ Correct: Create appointment first, then get JWT
```javascript
// DO THIS!
await login();                          // Step 1: Get Bearer token
const appt = await createAppointment(); // Step 2: Get sessionId
const jwt = await getJWT(appt.sessionId); // Step 3: Get JWT using sessionId
await joinVideo(jwt);                   // Step 4: Join video call
```

### ❌ Wrong: Using wrong endpoint for health check
```javascript
// DON'T DO THIS!
fetch('https://.../bedrockBackendApi/api/health')  // ❌ Wrong!
```

### ✅ Correct: Health endpoint has NO /api prefix
```javascript
// DO THIS!
fetch('https://.../bedrockBackendApi/health')  // ✅ Correct!
```

### ❌ Wrong: Forgetting Bearer token in headers
```javascript
// DON'T DO THIS!
fetch('/api/appointments', {
  method: 'POST',
  body: JSON.stringify(data)  // ❌ Missing Authorization header!
})
```

### ✅ Correct: Include Bearer token
```javascript
// DO THIS!
fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,  // ✅ Correct!
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
```

---

## 🐛 Troubleshooting

### "Failed to fetch"
**Cause:** Backend not deployed or CORS issue  
**Fix:** 
1. Deploy backend: `firebase deploy --only functions:bedrockBackendApi`
2. Check CORS allows `http://localhost:5173`

### "401 Unauthorized" on /api/appointments
**Cause:** Missing or invalid Bearer token  
**Fix:** Make sure you're sending `Authorization: Bearer <token>` header

### "Session not found" when getting JWT
**Cause:** Trying to get JWT for non-existent session  
**Fix:** Create appointment FIRST, then use the returned `sessionId`

### "Invalid signature" on Jitsi
**Cause:** JWT token expired or backend signing with wrong key  
**Fix:** 
1. Make sure backend has correct Jitsi private key
2. Generate fresh JWT token (they expire after 4 hours)

### Health endpoint returns 404
**Cause:** Using `/api/health` instead of `/health`  
**Fix:** Health endpoint has NO `/api` prefix

---

## ✅ Files Updated

The following files have been updated with correct endpoints:

- ✅ `/api/auth.ts` - Uses `/auth/register-or-login`
- ✅ `/api/sessions.ts` - Uses `/appointments` and `/auth/session-token`
- ✅ `/api/health.ts` - Uses `/health` (no `/api`)
- ✅ `/components/ConnectionDiagnostic.tsx` - Tests correct endpoints
- ✅ `/components/CreateSessionTest.tsx` - Full flow demonstration
- ✅ `/test-backend-connection.sh` - Tests all endpoints

---

## 🎉 Success Checklist

You're ready when:

- ✅ Test script shows all green checkmarks
- ✅ Can login and get Bearer token
- ✅ Can create appointment and get sessionId
- ✅ Can get JWT token using sessionId
- ✅ Can join video call with JWT token
- ✅ Video call connects to Jitsi server

---

## 🚀 Next Steps

1. **Create users in Firebase** (see Test User Credentials section)
2. **Run test script:** `./test-backend-connection.sh`
3. **Test in your app:** Use ConnectionDiagnostic and CreateSessionTest
4. **Test full flow:** Login → Create → Get JWT → Join Video

---

**Questions?** Make sure you're following the 4-step flow in order:
1. Login → Bearer Token
2. Create Appointment → sessionId
3. Get JWT → jitsiToken (using sessionId)
4. Join Video → Use jitsiToken

**That's it!** Everything else is handled by the code.
