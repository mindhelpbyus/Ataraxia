# ✅ Backend Verified User - Test User

## 🎯 User Details (From Firestore)

This user has been successfully created and verified in your Firebase Firestore database.

### Firestore Document
```
Collection: users
Document ID: ll3Zs4qw6LBkVTJphzya
```

### Full User Data
```json
{
  "id": "ll3Zs4qw6LBkVTJphzya",
  "userId": "USR-NEW-TEST-001",
  "email": "newtest@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "therapist",
  "isActive": true,
  "createdAt": "2025-11-13T17:44:03-08:00",
  "lastLoginAt": "2025-11-13T17:53:14-08:00",
  "updatedAt": "2025-11-13T17:53:14-08:00"
}
```

---

## 🔑 Login Credentials

### Frontend Login (Email/Password)
```
Email: newtest@example.com
Password: Test123!
```

### Backend API Login (No Password)
```json
{
  "userId": "USR-NEW-TEST-001",
  "email": "newtest@example.com",
  "role": "therapist"
}
```

---

## 🧪 Test This User

### Method 1: Using the App UI
1. Open your wellness calendar app
2. Click "🎥 Test Jitsi Video Calling" on login page
3. Select "Test User (Backend Verified)" from dropdown
4. Click "1. Login" button
5. Should receive valid tokens from backend

### Method 2: Using cURL
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-TEST-001",
    "email": "newtest@example.com",
    "role": "therapist",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Method 3: Run Test Script
```bash
bash test-all-users.sh
```
Look for "Test 3: Test User (Backend Verified)"

---

## ✅ Expected Response

When authenticating this user, you should receive:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "ll3Zs4qw6LBkVTJphzya",
      "userId": "USR-NEW-TEST-001",
      "email": "newtest@example.com",
      "name": "Test User",
      "firstName": "Test",
      "lastName": "User",
      "role": "therapist",
      "isActive": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "3600"
    }
  }
}
```

---

## 📍 Where This User Is Used

### 1. `/data/demoUsers.ts`
Added to `DEMO_THERAPISTS` array:
```typescript
{
  id: 'll3Zs4qw6LBkVTJphzya',
  email: 'newtest@example.com',
  password: 'Test123!',
  name: 'Test User',
  role: 'therapist',
  specialization: 'General Practice',
  phoneNumber: '+1 (555) 103-1003'
}
```

### 2. `/components/CreateSessionTest.tsx`
Added to `TEST_USERS` array:
```typescript
{
  userId: 'USR-NEW-TEST-001',
  email: 'newtest@example.com',
  name: 'Test User',
  role: 'therapist',
  description: 'Backend Verified User - Real Firestore user created on Nov 13, 2025'
}
```

### 3. `/App.tsx`
Added to console credentials display:
```typescript
console.log('%c3. newtest@example.com / Test123! (Backend Verified ✅)');
```

### 4. Documentation Files
- `/BACKEND_TEST_CREDENTIALS.md` - Full reference
- `/QUICK_CURL_TESTS.md` - Quick test commands
- `/test-all-users.sh` - Automated test script

---

## 🔐 Security Notes

### What This User Can Do:
- ✅ Login to the application
- ✅ Create video call sessions
- ✅ Access therapist features
- ✅ View and manage appointments
- ✅ Join Jitsi video calls

### Firestore Security:
- User exists in Firestore database
- Has active status (`isActive: true`)
- Properly timestamped (created, updated, lastLogin)
- Follows the correct user schema

### Backend Validation:
Your backend should validate:
1. ✅ `userId` matches "USR-NEW-TEST-001"
2. ✅ `email` matches "newtest@example.com"
3. ✅ `role` is "therapist"
4. ✅ User exists in Firestore
5. ✅ User is active (`isActive: true`)

---

## 🎮 Complete Test Flow

### Step-by-Step Testing:

1. **Login Test**
   ```bash
   curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
     -H "Content-Type: application/json" \
     -d '{"userId":"USR-NEW-TEST-001","email":"newtest@example.com","role":"therapist"}'
   ```
   ✅ Should return: `{ success: true, data: { user: {...}, tokens: {...} } }`

2. **Save Access Token**
   ```javascript
   const response = await fetch(...);
   const data = await response.json();
   const accessToken = data.data.tokens.accessToken;
   localStorage.setItem('accessToken', accessToken);
   ```

3. **Create Session**
   ```bash
   curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "therapistId": "USR-NEW-TEST-001",
       "clientId": "client-susan-id",
       "scheduledTime": "2024-11-15T14:00:00Z"
     }'
   ```
   ✅ Should return: `{ success: true, data: { id: "...", sessionId: "..." } }`

4. **Get JWT Token**
   ```bash
   curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions/SESSION_ID/jwt \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```
   ✅ Should return: `{ jwt: "...", roomName: "...", serverUrl: "..." }`

5. **Join Video Call**
   Use the JWT token to join Jitsi video call

---

## 📊 Comparison with Other Users

| Field | Dr. Sarah Mitchell | Dr. James Chen | **Test User** ⭐ | System Admin |
|-------|-------------------|----------------|-----------------|--------------|
| **userId** | therapist-3-id | therapist-4-id | **USR-NEW-TEST-001** | admin-3-id |
| **email** | therapist3@bedrock.test | therapist4@bedrock.test | **newtest@example.com** | admin3@bedrock.test |
| **role** | therapist | therapist | **therapist** | admin |
| **Firestore ID** | Demo | Demo | **ll3Zs4qw6LBkVTJphzya** | Demo |
| **Created Date** | N/A | N/A | **Nov 13, 2025** | N/A |
| **Last Login** | N/A | N/A | **Nov 13, 2025** | N/A |
| **Status** | Demo User | Demo User | **✅ Verified in DB** | Demo User |

---

## 🐛 Troubleshooting

### Issue: Login fails with 404
**Problem:** User not found in Firestore  
**Solution:** Verify the user exists in Firestore console

### Issue: Login fails with 401
**Problem:** Invalid credentials  
**Solution:** Check userId and email match exactly:
- userId: `USR-NEW-TEST-001` (case-sensitive)
- email: `newtest@example.com` (lowercase)

### Issue: CORS error
**Problem:** Backend not returning CORS headers  
**Solution:** Check backend CORS configuration

### Issue: No tokens returned
**Problem:** Backend authentication logic issue  
**Solution:** Check backend logs for errors

---

## 📝 Notes for Backend Developers

When handling this user in your backend:

1. **User Lookup:**
   ```javascript
   // Look up by userId
   const user = await db.collection('users')
     .where('userId', '==', 'USR-NEW-TEST-001')
     .get();
   
   // OR look up by email
   const user = await db.collection('users')
     .where('email', '==', 'newtest@example.com')
     .get();
   ```

2. **Verify Active Status:**
   ```javascript
   if (!user.isActive) {
     throw new Error('User account is inactive');
   }
   ```

3. **Update Last Login:**
   ```javascript
   await db.collection('users').doc(user.id).update({
     lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
   });
   ```

4. **Generate Tokens:**
   ```javascript
   const accessToken = jwt.sign(
     { userId: user.userId, email: user.email, role: user.role },
     JWT_SECRET,
     { expiresIn: '1h' }
   );
   ```

---

## ✅ Summary

- **User ID (Firestore):** `ll3Zs4qw6LBkVTJphzya`
- **userId (Application):** `USR-NEW-TEST-001`
- **Email:** `newtest@example.com`
- **Password (Frontend only):** `Test123!`
- **Role:** `therapist`
- **Status:** ✅ Active and verified in Firestore
- **Created:** November 13, 2025 at 5:44:03 PM UTC-8
- **Last Login:** November 13, 2025 at 5:53:14 PM UTC-8

This user is now fully integrated into:
- Demo users list
- Test components
- Documentation
- Test scripts
- Login credentials display

You can use this user for all backend testing and integration validation! 🎉
