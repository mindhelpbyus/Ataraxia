# ✅ Real Client ID from Backend

## 🎯 Correct Format (Updated)

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

## 🔑 Real IDs from Your Backend

### Therapist (Moderator):
- **userId:** `USR-NEW-TEST-001`
- **email:** `newtest@example.com`
- **role:** `therapist`
- **name:** Test User
- **Status:** ✅ Verified in Firestore

### Client (Participant):
- **userId:** `BcQX81V80Q4JTf19ZEpB`
- **role:** `client`
- **Status:** ✅ Real ID from your backend
- **Note:** This is an actual client ID that exists in your Firebase backend

---

## 🚀 Quick Test Command

```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

This will now use:
- **Therapist:** `USR-NEW-TEST-001`
- **Client:** `BcQX81V80Q4JTf19ZEpB` ✅

---

## 📝 Direct cURL Test

```bash
# 1. Login as therapist
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist"
  }'

# 2. Create session with REAL client ID
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "therapistId": "USR-NEW-TEST-001",
    "clientId": "BcQX81V80Q4JTf19ZEpB",
    "startTime": "2025-11-16T15:00:00.000Z",
    "endTime": "2025-11-16T16:00:00.000Z",
    "recordingEnabled": false,
    "chatEnabled": true,
    "screenShareEnabled": true,
    "notes": "Test video call session"
  }'

# 3. Get JWT token (use sessionId from step 2)
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/session-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "sessionId": "YOUR_SESSION_ID",
    "userId": "USR-NEW-TEST-001"
  }'
```

---

## 🎯 Using in Frontend Code

```typescript
import { createSession } from './api/sessions';

const session = await createSession({
  title: 'Video Call - Test User',
  description: 'Test video call session',
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
      userId: 'BcQX81V80Q4JTf19ZEpB',  // ✅ Real client ID
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

console.log('Session created:', session);
```

---

## ✅ What Changed

### 1. `/api/sessions.ts`
```typescript
// Old (demo ID)
const clientId = participant?.userId || 'client-susan-id';

// New (real ID)
const clientId = participant?.userId || 'BcQX81V80Q4JTf19ZEpB';
```

### 2. `/components/CreateSessionTest.tsx`
```typescript
// Now uses real client ID
{
  userId: 'BcQX81V80Q4JTf19ZEpB',
  role: 'participant',
  email: 'client@example.com',
  name: 'Test Client'
}
```

### 3. `/test-video-session.sh`
```bash
# Now uses real client ID
"clientId": "BcQX81V80Q4JTf19ZEpB"
```

---

## 🔍 Verify Client Exists

To check if the client exists in your backend:

```bash
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/users/BcQX81V80Q4JTf19ZEpB \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If you get a 200 response, the client exists! ✅

---

## ⚠️ Important Notes

1. **Different Users Required:** `USR-NEW-TEST-001` ≠ `BcQX81V80Q4JTf19ZEpB` ✅
2. **Real Backend IDs:** Both IDs are from your actual Firebase backend
3. **Client Must Exist:** Make sure `BcQX81V80Q4JTf19ZEpB` exists in your users collection
4. **Future Dates:** Always use future dates for `startTime` and `endTime`

---

## 🎉 Ready to Test!

Run the test script:
```bash
./test-video-session.sh
```

Or use the app:
1. Open app → "🎥 Test Jitsi Video Calling"
2. Select "Test User (Backend Verified)"
3. Click "1. Login"
4. Click "2. Create Session" → Uses real client ID! ✅
5. Click "3. Get JWT Token"
6. Click "4. Join Video Call"

---

## 📊 Expected Console Output

```
🎬 Creating session with request: {
  therapistId: "USR-NEW-TEST-001",
  clientId: "BcQX81V80Q4JTf19ZEpB",
  startTime: "2025-11-16T15:00:00.000Z",
  endTime: "2025-11-16T16:00:00.000Z",
  recordingEnabled: false,
  chatEnabled: true,
  screenShareEnabled: true,
  notes: "Test video call session"
}
✅ Therapist ID: USR-NEW-TEST-001
✅ Client ID: BcQX81V80Q4JTf19ZEpB
```

---

## 🐛 Troubleshooting

### Error: "Client not found"
```bash
# Create the client user first
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "BcQX81V80Q4JTf19ZEpB",
    "email": "client@example.com",
    "role": "client"
  }'
```

### Error: "Same user for therapist and client"
Make sure you're using:
- **Therapist:** `USR-NEW-TEST-001`
- **Client:** `BcQX81V80Q4JTf19ZEpB`

They are different! ✅

---

## 📖 Related Documentation

- `/SESSION_CREATION_CHEATSHEET.md` - Quick reference
- `/VIDEO_SESSION_API_GUIDE.md` - Complete guide
- `/AVAILABLE_TEST_USERS.md` - All test users
- `/test-video-session.sh` - Automated test script

---

## ✅ Summary

- ✅ Updated to use real client ID: `BcQX81V80Q4JTf19ZEpB`
- ✅ All code updated (API, component, test script)
- ✅ Ready to test with your actual backend data
- ✅ No more demo IDs - using real backend IDs

**The system now uses your actual backend client ID!** 🎉
