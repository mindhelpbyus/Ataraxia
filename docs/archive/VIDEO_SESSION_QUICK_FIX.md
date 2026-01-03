# ⚡ Video Session API - Quick Fix

## 🎯 The Issue

You were getting a **500 error** because the session creation was missing/incorrect fields.

## ✅ The Solution

Your backend expects this EXACT format:

```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "BcQX81V80Q4JTf19ZEpB",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z",
  "recordingEnabled": false,
  "chatEnabled": true,
  "screenShareEnabled": true,
  "notes": "Test video call session"
}
```

⚠️ **CRITICAL:** `therapistId` and `clientId` **MUST be different users**!  
✅ **Using Real Backend ID:** `BcQX81V80Q4JTf19ZEpB` is an actual client ID from Firebase!

## 🔧 What I Fixed

### 1. Updated `/api/sessions.ts`

Changed the `createSession()` function to:
- ✅ Map `description` → `notes` (your backend uses "notes", not "description")
- ✅ Extract correct `therapistId` (moderator)
- ✅ Extract correct `clientId` (participant)
- ✅ **Ensures therapistId and clientId are DIFFERENT users** (uses default client if none provided)
- ✅ Calculate `endTime` properly from `startTime` + `duration`
- ✅ Include all required boolean fields
- ✅ Added debug logging and validation

### 2. Updated `/components/CreateSessionTest.tsx`

- ✅ Now includes both therapist AND client participants
- ✅ Uses `selectedUser.userId` instead of email prefix
- ✅ Adds `scheduledStartTime` and `duration`
- ✅ Properly formats all fields with different users

### 3. Created Test Script

Run this to test the complete flow:

```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

This will:
1. ✅ Login as Test User (therapist)
2. ✅ Create video session with correct format (therapist + client)
3. ✅ Get JWT token for Jitsi
4. ✅ Show all tokens and IDs

## 🚀 How to Use

### Option 1: Using the App UI
1. Open app → Click "🎥 Test Jitsi Video Calling"
2. Select "Test User (Backend Verified)"
3. Click "1. Login" → Get tokens
4. Click "2. Create Session" → Should work now! ✅
5. Click "3. Get JWT Token" → Get Jitsi token
6. Click "4. Join Video Call" → Start call

### Option 2: Using Code

```typescript
import { createSession } from './api/sessions';

const session = await createSession({
  title: 'Video Call',
  description: 'Test session', // Maps to "notes" in backend
  scheduledStartTime: '2025-11-16T15:00:00.000Z',
  duration: 60, // minutes
  participants: [
    {
      userId: 'USR-NEW-TEST-001',
      role: 'moderator',
      name: 'Test User'
    },
    {
      userId: 'user-176302',
      role: 'participant',
      name: 'Client'
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

### Option 3: Direct cURL

```bash
# 1. Login
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-NEW-TEST-001","email":"newtest@example.com","role":"therapist"}'

# 2. Create session (use token from step 1)
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "therapistId": "USR-NEW-TEST-001",
    "clientId": "BcQX81V80Q4JTf19ZEpB",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Test session"
  }'
```

## 📊 Required Fields

| Field | Type | Example |
|-------|------|---------|
| `therapistId` | string | "USR-NEW-TEST-001" (MUST be different from clientId) |
| `clientId` | string | "BcQX81V80Q4JTf19ZEpB" (MUST be different from therapistId) |
| `startTime` | ISO 8601 | "2025-11-16T15:00:00.000Z" |
| `endTime` | ISO 8601 | "2025-11-16T16:00:00.000Z" |
| `recordingEnabled` | boolean | false |
| `chatEnabled` | boolean | true |
| `screenShareEnabled` | boolean | true |
| `notes` | string (optional) | "Test session" |

## ⚠️ Important

1. **therapistId and clientId MUST be different users**: They cannot be the same userId
2. **Use full userId format**: `"USR-NEW-TEST-001"` (not `"newtest"`)
3. **Time format**: ISO 8601 with timezone (`"2025-11-16T15:00:00.000Z"`)
4. **endTime must be after startTime**: Calculate properly
5. **All boolean fields required**: recordingEnabled, chatEnabled, screenShareEnabled

## 🎉 Should Work Now!

The error should be fixed. The frontend now sends the correct format to your backend.

## 📖 Full Documentation

- `/VIDEO_SESSION_API_GUIDE.md` - Complete guide with examples
- `/test-video-session.sh` - Automated test script
- `/api/sessions.ts` - Updated session API

## 🐛 Still Getting Errors?

1. Check **API Debug Panel** (orange button in app)
2. Check **Error Panel** (red button in app)
3. Run test script: `./test-video-session.sh`
4. Look at the request body in logs
5. Verify user exists: `USR-NEW-TEST-001` and `user-176302`

The 500 error should be gone now! 🎉
