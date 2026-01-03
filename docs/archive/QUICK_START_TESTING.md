# 🚀 Quick Start Testing Guide

**All 20 users are registered and ready!** Let's test the video session creation right now.

---

## ✅ Registration Confirmed

```
✅ 10 Therapists registered (USR-THERAPIST-001 to 010)
✅ 10 Clients registered (USR-CLIENT-001 to 010)
✅ All users in backend and ready for testing
```

---

## 🎯 Test Right Now (3 Minutes)

### Option 1: Using the UI

1. **Open the app** in your browser

2. **Click "🎥 Test Jitsi Video Calling"** on the login page
   - Or navigate to the Create Session Test page

3. **Select a therapist:**
   - Recommended: **Dr. Emily Johnson** (USR-THERAPIST-001)
   - Email: therapist001@example.com

4. **Click "Login"**
   - Watch console for: `✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅`

5. **Click "Create Video Session"**
   - Watch console for: `✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅`
   - Session auto-creates with USR-CLIENT-001

6. **Click "Get JWT Token"**
   - Watch console for: `✅ ✅ ✅ JITSI JWT TOKEN RECEIVED! ✅ ✅ ✅`

7. **Click "Join Video Call"**
   - Video call should load
   - You should see yourself (if camera is enabled)

---

### Option 2: Using cURL (Command Line)

**Step 1: Login**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "USR-THERAPIST-001",
      "email": "therapist001@example.com",
      "role": "therapist"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "...",
      "expiresIn": "24h"
    }
  }
}
```

**Copy the accessToken!**

**Step 2: Create Session**
```bash
# Replace YOUR_ACCESS_TOKEN with the token from step 1
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "therapistId": "USR-THERAPIST-001",
    "clientId": "USR-CLIENT-001",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment": {
      "id": "appt_...",
      "sessionId": "sess_...",
      "therapistId": "USR-THERAPIST-001",
      "clientId": "USR-CLIENT-001",
      "startTime": "2025-11-16T15:00:00.000Z",
      "endTime": "2025-11-16T16:00:00.000Z",
      "roomName": "bedrock-sess_...",
      "createdAt": "..."
    }
  }
}
```

**Copy the sessionId!**

**Step 3: Get JWT Token**
```bash
# Replace YOUR_ACCESS_TOKEN and SESSION_ID
curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/SESSION_ID/jwt \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "jitsiToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "serverUrl": "meet.bedrockhealthsolutions.com",
    "roomName": "bedrock-sess_...",
    "expiresAt": "..."
  }
}
```

**Done!** ✅

---

## 🔍 What to Look For

### In Browser Console

**When Login Succeeds:**
```
═══════════════════════════════════════════
✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅
═══════════════════════════════════════════
🎫 Access Token (Bearer):
   First 80 chars: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Length: 245
```

**When Session Created:**
```
═══════════════════════════════════════════
✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅
═══════════════════════════════════════════
🆔 Session ID: sess_abc123
🏠 Room Name: bedrock-sess_abc123
📅 Created At: 2025-11-16T14:30:00.000Z
```

**When JWT Received:**
```
═══════════════════════════════════════════
✅ ✅ ✅ JITSI JWT TOKEN RECEIVED! ✅ ✅ ✅
═══════════════════════════════════════════
🎫 Jitsi JWT:
   First 80 chars: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Length: 312
```

### In API Debug Panel (Orange Button)

Click the orange "API" button in bottom-right to see:
- All API requests/responses
- Request/response headers
- Request/response bodies
- Response times

### If Something Fails

**Check Error Debug Panel (Red Button):**
- Click the red "Errors" button in bottom-right
- See all errors with timestamps
- View stack traces

**Check Console for Detailed Error:**
```
═══════════════════════════════════════════
❌ SESSION CREATION FAILED
═══════════════════════════════════════════
Error type: ApiException
Error message: User not found
Error code: HTTP_404
Error status: 404
Error details: { message: "User with ID USR-CLIENT-001 not found" }
```

**If you see this error, re-run:**
```bash
./register-test-users.sh
```

---

## 💡 Pro Tips

### Tip 1: Use Recommended Users
**Best for testing:**
- **Therapist:** USR-THERAPIST-001 (Dr. Emily Johnson)
- **Client:** USR-CLIENT-001 (Alice Thompson)

These are the first registered users and most likely to work.

### Tip 2: Open Console First
Press **F12** before testing to see all logs in real-time.

### Tip 3: Check Debug Panels
The API and Error debug panels show everything happening behind the scenes.

### Tip 4: Test in Stages
Don't skip steps:
1. ✅ Login first
2. ✅ Then create session
3. ✅ Then get JWT
4. ✅ Then join video

### Tip 5: Use Test Scripts
For automated testing:
```bash
./test-video-session.sh      # Complete end-to-end test
./test-all-users.sh          # Test all 20 users
./test-appointment-flow.sh   # Test appointment CRUD
```

---

## 🎬 Expected Full Flow

```
1. Click "Login" 
   → 🔵 API Request: POST /auth/register-or-login
   → ✅ Response: Access token received
   → Console: ✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅

2. Click "Create Video Session"
   → 🔵 API Request: POST /appointments
   → ✅ Response: Session created
   → Console: ✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅

3. Click "Get JWT Token"
   → 🔵 API Request: GET /sessions/{id}/jwt
   → ✅ Response: JWT token received
   → Console: ✅ ✅ ✅ JITSI JWT TOKEN RECEIVED! ✅ ✅ ✅

4. Click "Join Video Call"
   → 🎥 Jitsi loads
   → 📹 Video/audio starts
   → ✅ You're in the call!
```

---

## ⚡ One-Line Complete Test

```bash
./test-video-session.sh && echo "✅ All tests passed!"
```

---

## 🎯 Success Checklist

After running test, you should have:

- [x] ✅ Logged in successfully
- [x] ✅ Access token received (200+ characters)
- [x] ✅ Session created (sessionId received)
- [x] ✅ JWT token received (300+ characters)
- [x] ✅ Video room loaded
- [x] ✅ Can see video/audio controls
- [x] ✅ No errors in console

---

## 🆘 Quick Fixes

### "User not found"
```bash
./register-test-users.sh
```

### "Unauthorized"
```javascript
localStorage.clear();
// Then refresh page and login again
```

### "Request failed"
```bash
# Check backend health
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/health
```

### Still stuck?
See `/SESSION_CREATION_TROUBLESHOOTING.md` for detailed help.

---

## 📚 More Testing

For comprehensive testing scenarios, see:
- `/TESTING_SCENARIOS_GUIDE.md` - All 10 testing scenarios
- `/TEST_USERS_GUIDE.md` - Complete user reference
- `/VIDEO_SESSION_API_GUIDE.md` - API documentation

---

**Ready? Let's test!** 🚀

Open the app → Click "🎥 Test Jitsi Video Calling" → Select Dr. Emily Johnson → Login → Create Session → Get JWT → Join Call

**That's it!** 🎉
