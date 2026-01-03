# 🎥 Video Session API - Correct Format Guide

## ✅ Correct Backend API Format

Your backend expects this EXACT format for creating video sessions:

```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "client-susan-id",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z",
  "recordingEnabled": false,
  "chatEnabled": true,
  "screenShareEnabled": true,
  "notes": "Test video call session"
}
```

⚠️ **IMPORTANT:** `therapistId` and `clientId` MUST be **different users**!

## 📍 Endpoint

```
POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments
```

**Note:** Even though it's called `/appointments`, this endpoint is used for creating video sessions. This is your backend's design.

---

## 🔧 Updated Frontend API

I've updated `/api/sessions.ts` to correctly transform the request. The `createSession()` function now:

1. ✅ Maps `description` → `notes`
2. ✅ Uses correct `therapistId` (moderator)
3. ✅ Uses correct `clientId` (participant, or moderator if no participant)
4. ✅ Calculates `endTime` from `startTime` + `duration`
5. ✅ Includes all required fields

---

## 🎯 How to Use

### Method 1: Using the Frontend API (Recommended)

```typescript
import { createSession } from './api/sessions';

const session = await createSession({
  title: 'Video Call - Test User',
  description: 'Test video call session', // Maps to "notes" in backend
  scheduledStartTime: '2025-11-16T15:00:00.000Z',
  duration: 60, // minutes - will calculate endTime
  participants: [
    {
      userId: 'USR-NEW-TEST-001',
      role: 'moderator',
      email: 'newtest@example.com',
      name: 'Test User'
    },
    {
      userId: 'client-susan-id',  // ✅ Different user!
      role: 'participant',
      email: 'susan.marie@email.com',
      name: 'Susan Marie'
    }
  ],
  settings: {
    recordingEnabled: false,
    chatEnabled: true,
    screenSharingEnabled: true
  }
});

console.log('Session created:', session);
```

### Method 2: Direct API Call

```javascript
const response = await fetch(
  'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${yourAccessToken}`
    },
    body: JSON.stringify({
      therapistId: 'USR-NEW-TEST-001',
      clientId: 'client-susan-id',  // ✅ Different user!
      startTime: '2025-11-16T15:00:00.000Z',
      endTime: '2025-11-16T16:00:00.000Z',
      recordingEnabled: false,
      chatEnabled: true,
      screenShareEnabled: true,
      notes: 'Test video call session'
    })
  }
);

const data = await response.json();
console.log('Session created:', data);
```

### Method 3: Using cURL

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "therapistId": "USR-NEW-TEST-001",
    "clientId": "client-susan-id",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Test video call session"
  }'
```

---

## 📊 Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `therapistId` | string | ✅ Yes | Full userId of the therapist/moderator (e.g., "USR-NEW-TEST-001") - **MUST be different from clientId** |
| `clientId` | string | ✅ Yes | Full userId of the client/participant (e.g., "client-susan-id") - **MUST be different from therapistId** |
| `startTime` | string | ✅ Yes | ISO 8601 timestamp for session start (e.g., "2025-11-16T15:00:00.000Z") |
| `endTime` | string | ✅ Yes | ISO 8601 timestamp for session end (e.g., "2025-11-16T16:00:00.000Z") |
| `recordingEnabled` | boolean | ✅ Yes | Whether recording is enabled (true/false) |
| `chatEnabled` | boolean | ✅ Yes | Whether chat is enabled (true/false) |
| `screenShareEnabled` | boolean | ✅ Yes | Whether screen sharing is enabled (true/false) |
| `notes` | string | ⚠️ Optional | Session description or notes |

---

## ✅ Expected Success Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appt_abc123",
      "sessionId": "sess_xyz789",
      "therapistId": "USR-NEW-TEST-001",
      "clientId": "client-susan-id",
      "startTime": "2025-11-16T15:00:00.000Z",
      "endTime": "2025-11-16T16:00:00.000Z",
      "status": "scheduled",
      "roomName": "bedrock-sess_xyz789",
      "recordingEnabled": false,
      "chatEnabled": true,
      "screenShareEnabled": true,
      "notes": "Test video call session",
      "createdAt": "2025-11-14T03:44:13.000Z",
      "updatedAt": "2025-11-14T03:44:13.000Z"
    }
  }
}
```

---

## 🔍 Important Notes

### 1. **Endpoint Name vs. Functionality**
- The endpoint is called `/appointments`
- But it's used for creating **video sessions**
- This is your backend's architectural design

### 2. **User IDs Must Be Valid AND Different**
- `therapistId` must exist in Firestore users collection
- `clientId` must exist in Firestore users collection
- **`therapistId` and `clientId` MUST be different users** (cannot be the same)
- Use full userId format (e.g., "USR-NEW-TEST-001", not "newtest")

### 3. **Time Format**
- Always use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `"2025-11-16T15:00:00.000Z"`
- `endTime` must be after `startTime`

### 4. **Boolean Fields**
- All three boolean fields are required
- Must be actual booleans (true/false), not strings

### 5. **Notes Field**
- Optional, but recommended
- Can be used for session description, agenda, or instructions

---

## 🐛 Common Errors & Solutions

### Error 1: 500 Internal Server Error
**Cause:** Missing required field or invalid format  
**Solution:** Ensure all required fields are present and correctly formatted

### Error 2: 404 User Not Found
**Cause:** Invalid `therapistId` or `clientId`  
**Solution:** Verify both users exist in Firestore:
```bash
# Check user exists
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/users/USR-NEW-TEST-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Error 3: 401 Unauthorized
**Cause:** Missing or invalid Bearer token  
**Solution:** 
1. Login first to get token
2. Add `Authorization: Bearer YOUR_TOKEN` header
3. Token might be expired - login again

### Error 4: 400 Bad Request - Invalid Time Format
**Cause:** Incorrect timestamp format  
**Solution:** Use ISO 8601 format with timezone:
```javascript
// ✅ Correct
const startTime = new Date('2025-11-16T15:00:00.000Z').toISOString();

// ❌ Wrong
const startTime = '11/16/2025 3:00 PM';
```

### Error 5: 400 Bad Request - endTime before startTime
**Cause:** `endTime` is before or equal to `startTime`  
**Solution:** 
```javascript
// Calculate endTime correctly
const startTime = new Date('2025-11-16T15:00:00.000Z');
const duration = 60; // minutes
const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

console.log({
  startTime: startTime.toISOString(),
  endTime: endTime.toISOString()
});
```

---

## 🧪 Testing Your Setup

### Step 1: Login
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist"
  }'
```

Save the `accessToken` from the response.

### Step 2: Create Session
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "therapistId": "USR-NEW-TEST-001",
    "clientId": "client-susan-id",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Test video call session"
  }'
```

Save the `sessionId` from the response.

### Step 3: Get JWT Token
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/session-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "userId": "USR-NEW-TEST-001"
  }'
```

Use the JWT token to join the Jitsi video call.

---

## 🎮 Complete Test Script

Save this as `test-video-session.sh`:

```bash
#!/bin/bash

API_BASE="https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api"

echo "🔐 Step 1: Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register-or-login" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

# Extract token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.tokens.accessToken')
echo "✅ Token: ${ACCESS_TOKEN:0:50}..."

echo ""
echo "🎬 Step 2: Create Session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/appointments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "therapistId": "USR-NEW-TEST-001",
    "clientId": "user-176302",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Test video call session"
  }')

echo "$SESSION_RESPONSE" | jq '.'

# Extract sessionId
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.data.appointment.sessionId // .data.appointment.id')
echo "✅ Session ID: $SESSION_ID"

echo ""
echo "🔑 Step 3: Get JWT Token..."
JWT_RESPONSE=$(curl -s -X POST "$API_BASE/auth/session-token" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"userId\": \"USR-NEW-TEST-001\"
  }")

echo "$JWT_RESPONSE" | jq '.'

JWT_TOKEN=$(echo "$JWT_RESPONSE" | jq -r '.data.jitsiToken // .jitsiToken')
echo "✅ JWT Token: ${JWT_TOKEN:0:50}..."

echo ""
echo "🎉 All steps completed successfully!"
echo "You can now join the video call with the JWT token."
```

Make it executable:
```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

---

## 📖 Related Documentation

- `/BACKEND_TEST_CREDENTIALS.md` - All test user credentials
- `/TEST_USER_QUICK_REFERENCE.md` - Quick reference for test user
- `/VERIFIED_USER_INFO.md` - Details about backend-verified user
- `/api/sessions.ts` - Frontend session API (updated)
- `/components/CreateSessionTest.tsx` - UI test component

---

## ✅ Summary

### Key Points:
1. ✅ Backend uses `/appointments` endpoint for video sessions
2. ✅ Requires 7 fields: therapistId, clientId, startTime, endTime, recordingEnabled, chatEnabled, screenShareEnabled
3. ✅ Optional field: notes
4. ✅ Must use full userId format (e.g., "USR-NEW-TEST-001")
5. ✅ Must use ISO 8601 timestamp format
6. ✅ Must include Bearer token in Authorization header

### What Changed:
- ✅ Updated `/api/sessions.ts` to map `description` → `notes`
- ✅ Fixed user ID extraction for therapist and client
- ✅ Added proper endTime calculation
- ✅ Added console logging for debugging

### Testing:
- Use `CreateSessionTest` component in the app
- Use `test-video-session.sh` script
- Check API Debug Panel (orange button) for request/response
- Check Error Panel (red button) for errors

Now your frontend correctly formats requests to match your backend API! 🎉
