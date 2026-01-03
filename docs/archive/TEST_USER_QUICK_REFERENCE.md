# 🚀 Test User - Quick Reference Card

## ⚡ Copy & Paste Ready

### Frontend Login
```
Email: newtest@example.com
Password: Test123!
```

### Backend API Call
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-NEW-TEST-001","email":"newtest@example.com","role":"therapist"}'
```

### JavaScript Fetch
```javascript
const response = await fetch(
  'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'USR-NEW-TEST-001',
      email: 'newtest@example.com',
      role: 'therapist'
    })
  }
);
const data = await response.json();
console.log(data);
```

---

## 📊 User Data

| Field | Value |
|-------|-------|
| **Firestore ID** | `ll3Zs4qw6LBkVTJphzya` |
| **userId** | `USR-NEW-TEST-001` |
| **email** | `newtest@example.com` |
| **firstName** | `Test` |
| **lastName** | `User` |
| **role** | `therapist` |
| **password** | `Test123!` (frontend only) |
| **isActive** | `true` |
| **Created** | Nov 13, 2025 @ 5:44 PM |
| **Last Login** | Nov 13, 2025 @ 5:53 PM |

---

## ✅ Status
🟢 **VERIFIED IN FIRESTORE** - This user exists in your production database!

---

## 🎯 Use This User For:
- ✅ Backend authentication testing
- ✅ Video call session creation
- ✅ JWT token generation
- ✅ Jitsi integration testing
- ✅ Full appointment workflow testing

---

## 📱 Quick Test in App
1. Open app → Click "🎥 Test Jitsi Video Calling"
2. Select "Test User (Backend Verified)" from dropdown
3. Click "1. Login"
4. See tokens in API Debug Panel (orange button)

---

## 📖 Full Documentation
- `/VERIFIED_USER_INFO.md` - Complete details
- `/BACKEND_TEST_CREDENTIALS.md` - All test users
- `/QUICK_CURL_TESTS.md` - More curl examples
