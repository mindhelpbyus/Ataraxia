# 🎥 Video Session Creation - Quick Cheatsheet

## ⚡ TL;DR

```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "BcQX81V80Q4JTf19ZEpB",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z",
  "recordingEnabled": false,
  "chatEnabled": true,
  "screenShareEnabled": true,
  "notes": "Your notes here"
}
```

**POST** to: `https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments`

---

## ✅ Required Fields (All 8)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `therapistId` | string | `"USR-NEW-TEST-001"` | ⚠️ MUST be different from clientId |
| `clientId` | string | `"BcQX81V80Q4JTf19ZEpB"` | ⚠️ MUST be different from therapistId |
| `startTime` | ISO 8601 | `"2025-11-16T15:00:00.000Z"` | Must include timezone |
| `endTime` | ISO 8601 | `"2025-11-16T16:00:00.000Z"` | Must be after startTime |
| `recordingEnabled` | boolean | `false` | true or false |
| `chatEnabled` | boolean | `true` | true or false |
| `screenShareEnabled` | boolean | `true` | true or false |
| `notes` | string | `"Session notes"` | Optional but recommended |

---

## 🚫 Common Mistakes

### ❌ Same User for Both
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "USR-NEW-TEST-001"  // ❌ WRONG! Same user!
}
```

### ❌ Email Prefix Instead of Full userId
```json
{
  "therapistId": "newtest",  // ❌ WRONG! Use "USR-NEW-TEST-001"
  "clientId": "client-susan-id"
}
```

### ❌ Missing Timezone
```json
{
  "startTime": "2025-11-16 15:00:00"  // ❌ WRONG! Must be ISO 8601
}
```

### ❌ String Instead of Boolean
```json
{
  "recordingEnabled": "false"  // ❌ WRONG! Use boolean false
}
```

---

## ✅ Correct Examples

### Example 1: Test User + Real Client (Recommended) ✅
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "BcQX81V80Q4JTf19ZEpB",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z",
  "recordingEnabled": false,
  "chatEnabled": true,
  "screenShareEnabled": true,
  "notes": "Initial consultation"
}
```

### Example 2: With Recording Enabled
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "BcQX81V80Q4JTf19ZEpB",
  "startTime": "2025-11-16T14:00:00.000Z",
  "endTime": "2025-11-16T15:00:00.000Z",
  "recordingEnabled": true,
  "chatEnabled": true,
  "screenShareEnabled": false,
  "notes": "Follow-up session"
}
```

---

## 🧪 Quick Test Commands

### 1. Login
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-NEW-TEST-001","email":"newtest@example.com","role":"therapist"}'
```

### 2. Create Session
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "therapistId":"USR-NEW-TEST-001",
    "clientId":"BcQX81V80Q4JTf19ZEpB",
    "startTime":"2025-11-16T15:00:00.000Z",
    "endTime":"2025-11-16T16:00:00.000Z",
    "recordingEnabled":false,
    "chatEnabled":true,
    "screenShareEnabled":true,
    "notes":"Test session"
  }'
```

### 3. Get JWT Token
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/session-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sessionId":"YOUR_SESSION_ID","userId":"USR-NEW-TEST-001"}'
```

---

## 🎯 Available Test Users

### Therapists (Use for therapistId):
- `USR-NEW-TEST-001` - Test User ✅ **Recommended**
- `therapist-3-id` - Dr. Sarah Mitchell
- `therapist-4-id` - Dr. James Chen

### Clients (Use for clientId):
- `BcQX81V80Q4JTf19ZEpB` - Real Backend Client ✅ **Recommended** (Actual Firebase ID)

---

## 📝 Using Frontend API

```typescript
import { createSession } from './api/sessions';

const session = await createSession({
  title: 'Video Call',
  description: 'Session notes',
  scheduledStartTime: '2025-11-16T15:00:00.000Z',
  duration: 60,
  participants: [
    {
      userId: 'USR-NEW-TEST-001',
      role: 'moderator',
      email: 'newtest@example.com',
      name: 'Test User'
    },
    {
      userId: 'BcQX81V80Q4JTf19ZEpB',
      role: 'participant',
      email: 'client@example.com',
      name: 'Test Client'
    }
  ],
  settings: {
    recordingEnabled: false,
    chatEnabled: true,
    screenSharingEnabled: true
  }
});
```

---

## 🔍 Debugging Checklist

- [ ] therapistId and clientId are **different**
- [ ] Both userIds use **full format** (not email prefix)
- [ ] Both users **exist** in backend
- [ ] startTime and endTime are **ISO 8601** format
- [ ] endTime is **after** startTime
- [ ] All boolean fields are **actual booleans** (not strings)
- [ ] Authorization header includes **"Bearer "** prefix
- [ ] Token is **valid** (not expired)

---

## 🚀 Automated Test

Run this script to test everything:

```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

This tests:
1. ✅ Login
2. ✅ Create session with correct format
3. ✅ Get JWT token
4. ✅ Shows all IDs and tokens

---

## 📖 Full Documentation

- `/VIDEO_SESSION_QUICK_FIX.md` - Quick fix guide
- `/VIDEO_SESSION_API_GUIDE.md` - Complete API guide
- `/AVAILABLE_TEST_USERS.md` - All available users
- `/DIFFERENT_USERS_FIX.md` - Details about the different users fix
- `/BACKEND_TEST_CREDENTIALS.md` - All test credentials

---

## 💡 Pro Tips

1. **Always use different users** for therapistId and clientId
2. **Use `client-susan-id` as default client** for testing
3. **Check console logs** for detailed request/response info
4. **Use API Debug Panel** (orange button) to see actual requests
5. **Calculate endTime** from startTime + duration to avoid mistakes

---

## ✅ Success Response

```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appt_abc123",
      "sessionId": "sess_xyz789",
      "therapistId": "USR-NEW-TEST-001",
      "clientId": "BcQX81V80Q4JTf19ZEpB",
      "startTime": "2025-11-16T15:00:00.000Z",
      "endTime": "2025-11-16T16:00:00.000Z",
      "status": "scheduled",
      "roomName": "bedrock-sess_xyz789",
      "recordingEnabled": false,
      "chatEnabled": true,
      "screenShareEnabled": true,
      "notes": "Test session"
    }
  }
}
```

Save the `sessionId` to get JWT token and join the video call!

---

**That's it! Copy-paste the examples and you're good to go! 🎉**
