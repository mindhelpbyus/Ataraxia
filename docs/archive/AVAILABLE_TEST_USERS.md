# 👥 Available Test Users for Video Sessions

## 🎯 Quick Reference

When creating video sessions, you need **TWO different users**:
1. **Therapist** (moderator) - The session creator
2. **Client** (participant) - The client/client

⚠️ **CRITICAL:** `therapistId` and `clientId` **MUST be different users**!

---

## 👨‍⚕️ Available Therapists

### 1. Test User (Backend Verified) ✅
```json
{
  "userId": "USR-NEW-TEST-001",
  "email": "newtest@example.com",
  "role": "therapist",
  "name": "Test User"
}
```
**Status:** ✅ Verified in Firestore backend

### 2. Dr. Sarah Mitchell
```json
{
  "userId": "therapist-3-id",
  "email": "therapist3@bedrock.test",
  "role": "therapist",
  "name": "Dr. Sarah Mitchell"
}
```

### 3. Dr. James Chen
```json
{
  "userId": "therapist-4-id",
  "email": "therapist4@bedrock.test",
  "role": "therapist",
  "name": "Dr. James Chen"
}
```

---

## 👥 Available Clients/Clients

### 1. Real Backend Client (Recommended) ✅
```json
{
  "userId": "BcQX81V80Q4JTf19ZEpB",
  "email": "client@example.com",
  "role": "client",
  "name": "Test Client"
}
```
**⭐ REAL FIREBASE ID - Use this for testing!**

### 2. Susan Marie (Demo)
```json
{
  "userId": "client-susan-id",
  "email": "susan.marie@email.com",
  "role": "client",
  "name": "Susan Marie"
}
```

### 3. John Paul (Demo)
```json
{
  "userId": "client-john-id",
  "email": "john.paul@email.com",
  "role": "client",
  "name": "John Paul"
}
```

---

## ✅ Recommended Combinations

### Combination 1: Test User + Real Client (Best!) ⭐
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "BcQX81V80Q4JTf19ZEpB"
}
```
**⭐ Best for testing!** Both are actual backend-verified IDs from Firebase.

### Combination 2: Test User + Demo Client
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "client-susan-id"
}
```

### Combination 3: Dr. Sarah + Demo Client
```json
{
  "therapistId": "therapist-3-id",
  "clientId": "client-john-id"
}
```

---

## 🚫 Invalid Combinations

### ❌ WRONG: Same User for Both
```json
{
  "therapistId": "USR-NEW-TEST-001",
  "clientId": "USR-NEW-TEST-001"  // ❌ SAME USER!
}
```
**This will fail!** Therapist and client must be different.

### ❌ WRONG: Email Prefix Instead of userId
```json
{
  "therapistId": "newtest",  // ❌ Wrong! Use "USR-NEW-TEST-001"
  "clientId": "client-susan-id"
}
```
**Use full userId format!**

---

## 📝 Complete Example Request

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

---

## 🔧 Using in Code

### Frontend API (Recommended)
```typescript
import { createSession } from './api/sessions';

const session = await createSession({
  title: 'Video Call',
  description: 'Test session',
  scheduledStartTime: '2025-11-16T15:00:00.000Z',
  duration: 60,
  participants: [
    {
      userId: 'USR-NEW-TEST-001',  // Therapist
      role: 'moderator',
      email: 'newtest@example.com',
      name: 'Test User'
    },
    {
      userId: 'BcQX81V80Q4JTf19ZEpB',  // Real Client (DIFFERENT!)
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

### Direct cURL
```bash
# 1. Login as therapist
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist"
  }'

# 2. Create session with DIFFERENT client
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

---

## 🎯 Default Fallback

If you don't specify a participant when using `createSession()`, the API will automatically use:
- **Default Client:** `BcQX81V80Q4JTf19ZEpB` (Real Backend Client) ✅

This ensures therapistId and clientId are always different, using real Firebase IDs.

---

## 📖 Related Documentation

- `/BACKEND_TEST_CREDENTIALS.md` - All test user credentials
- `/VIDEO_SESSION_API_GUIDE.md` - Complete API guide
- `/VIDEO_SESSION_QUICK_FIX.md` - Quick fix guide
- `/api/sessions.ts` - Session creation API

---

## 🔍 Checking if User Exists

To verify a user exists in the backend:

```bash
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/users/USR-NEW-TEST-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If you get a 404, the user doesn't exist yet. Login first to create it:

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist"
  }'
```

---

## ✅ Summary

**For testing video sessions:**
1. ✅ Use `USR-NEW-TEST-001` as therapist (Backend verified)
2. ✅ Use `BcQX81V80Q4JTf19ZEpB` as client (Real Firebase ID) ⭐
3. ✅ Make sure they are **DIFFERENT** users
4. ✅ Use **full userId format** (not email prefix)
5. ✅ Both users must exist in backend

**Quick Test Command:**
```bash
chmod +x test-video-session.sh
./test-video-session.sh
```

This will test with the correct user combination using REAL backend IDs! 🎉
