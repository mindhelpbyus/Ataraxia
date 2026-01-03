# 🔑 Backend Test Credentials - Valid UserIds & Emails

## Overview
This document contains all valid `userId` and `email` combinations for testing the backend API authentication endpoint at:
```
https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login
```

---

## 🎯 Authentication Format

### Backend Expects (NO PASSWORD):
```json
{
  "userId": "string",
  "email": "string",
  "role": "therapist" | "client" | "admin"
}
```

### Optional Fields:
```json
{
  "userId": "string",
  "email": "string", 
  "role": "therapist",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## 👨‍⚕️ THERAPIST ACCOUNTS

### 1. Dr. Sarah Mitchell
```json
{
  "userId": "therapist-3-id",
  "email": "therapist3@bedrock.test",
  "role": "therapist",
  "firstName": "Sarah",
  "lastName": "Mitchell"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-3-id",
    "email": "therapist3@bedrock.test",
    "role": "therapist",
    "firstName": "Sarah",
    "lastName": "Mitchell"
  }'
```

---

### 2. Dr. James Chen
```json
{
  "userId": "therapist-4-id",
  "email": "therapist4@bedrock.test",
  "role": "therapist",
  "firstName": "James",
  "lastName": "Chen"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-4-id",
    "email": "therapist4@bedrock.test",
    "role": "therapist",
    "firstName": "James",
    "lastName": "Chen"
  }'
```

---

### 3. Test User (Backend Verified) ✅
```json
{
  "userId": "USR-NEW-TEST-001",
  "email": "newtest@example.com",
  "role": "therapist",
  "firstName": "Test",
  "lastName": "User"
}
```

**curl Command:**
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

**⭐ Special Note:** This user exists in Firestore database with:
- Firestore ID: `ll3Zs4qw6LBkVTJphzya`
- Created: November 13, 2025 at 5:44:03 PM UTC-8
- Last Login: November 13, 2025 at 5:53:14 PM UTC-8
- Status: Active (isActive: true)

---

## 👔 ADMIN ACCOUNT

### System Administrator
```json
{
  "userId": "admin-3-id",
  "email": "admin3@bedrock.test",
  "role": "admin",
  "firstName": "System",
  "lastName": "Administrator"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-3-id",
    "email": "admin3@bedrock.test",
    "role": "admin",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

---

## 👥 CLIENT/PATIENT ACCOUNTS

### 1. Susan Marie
```json
{
  "userId": "client-susan-id",
  "email": "susan.marie@email.com",
  "role": "client",
  "firstName": "Susan",
  "lastName": "Marie"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client-susan-id",
    "email": "susan.marie@email.com",
    "role": "client",
    "firstName": "Susan",
    "lastName": "Marie"
  }'
```

---

### 2. John Paul
```json
{
  "userId": "client-john-id",
  "email": "john.paul@email.com",
  "role": "client",
  "firstName": "John",
  "lastName": "Paul"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client-john-id",
    "email": "john.paul@email.com",
    "role": "client",
    "firstName": "John",
    "lastName": "Paul"
  }'
```

---

## 📋 Quick Reference Table

| User Name | userId | email | role | Status |
|-----------|--------|-------|------|--------|
| Dr. Sarah Mitchell | `therapist-3-id` | `therapist3@bedrock.test` | `therapist` | Demo |
| Dr. James Chen | `therapist-4-id` | `therapist4@bedrock.test` | `therapist` | Demo |
| Test User | `USR-NEW-TEST-001` | `newtest@example.com` | `therapist` | ✅ **Verified in Firestore** |
| System Administrator | `admin-3-id` | `admin3@bedrock.test` | `admin` | Demo |
| Susan Marie | `client-susan-id` | `susan.marie@email.com` | `client` | Demo |
| John Paul | `client-john-id` | `john.paul@email.com` | `client` | Demo |

---

## 🧪 Testing New Users

You can also test with new userIds that don't exist yet:

```json
{
  "userId": "USR-NEW-001",
  "email": "newuser@example.com",
  "role": "therapist",
  "firstName": "Test",
  "lastName": "User"
}
```

**curl Command:**
```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-NEW-001",
    "email": "newuser@example.com",
    "role": "therapist",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## ✅ Expected Response Format

### Success Response (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "therapist-3-id",
      "email": "therapist3@bedrock.test",
      "name": "Sarah Mitchell",
      "role": "therapist",
      "firstName": "Sarah",
      "lastName": "Mitchell"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "3600"
    }
  }
}
```

### Error Response (400/401):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid userId or email"
  }
}
```

---

## 🔐 Using the Access Token

After getting the access token, use it in subsequent requests:

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "therapistId": "therapist-3-id",
    "clientId": "client-susan-id",
    "scheduledTime": "2024-11-15T14:00:00Z"
  }'
```

---

## 🎯 Testing in the Application

### Method 1: Using CreateSessionTest Component
1. Click "🎥 Test Jitsi Video Calling" on login page
2. Select a user from dropdown (Dr. Sarah Mitchell, Dr. James Chen, or System Administrator)
3. Click "1. Login" button
4. Check API Debug Panel (orange button) for request/response
5. Check Error Panel (red button) for any errors

### Method 2: Using Direct API Calls
```javascript
// In browser console or your code:
const response = await fetch('https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
  credentials: 'omit',
  body: JSON.stringify({
    userId: 'therapist-3-id',
    email: 'therapist3@bedrock.test',
    role: 'therapist'
  })
});

const data = await response.json();
console.log('Response:', data);
```

---

## 🐛 Debugging Failed Logins

### Check These Common Issues:

1. **CORS Error**
   ```
   ❌ Access to fetch has been blocked by CORS policy
   ✅ Backend must return CORS headers
   ✅ Use mode: 'cors' and credentials: 'omit'
   ```

2. **Wrong Format**
   ```
   ❌ Sending password field (backend doesn't use passwords)
   ✅ Only send: userId, email, role
   ```

3. **Wrong Role Value**
   ```
   ❌ role: "client"
   ✅ role: "client" (backend uses "client" not "client")
   ```

4. **Missing Content-Type**
   ```
   ❌ No Content-Type header
   ✅ Add: 'Content-Type': 'application/json'
   ```

5. **Invalid JSON**
   ```
   ❌ Trailing commas, single quotes
   ✅ Use proper JSON with double quotes
   ```

---

## 📝 Backend Validation Logic

Your backend should validate:

1. **userId** - Must be a non-empty string
2. **email** - Must be a valid email format
3. **role** - Must be one of: "therapist", "client", "admin"
4. **firstName** (optional) - String
5. **lastName** (optional) - String

Example validation:
```javascript
// Backend validation
if (!userId || typeof userId !== 'string') {
  return res.status(400).json({ error: 'Invalid userId' });
}

if (!email || !email.includes('@')) {
  return res.status(400).json({ error: 'Invalid email' });
}

if (!['therapist', 'client', 'admin'].includes(role)) {
  return res.status(400).json({ error: 'Invalid role' });
}
```

---

## 🚀 Quick Test Script

Save this as `test-login.sh`:

```bash
#!/bin/bash

echo "Testing Login for Dr. Sarah Mitchell..."
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-3-id",
    "email": "therapist3@bedrock.test",
    "role": "therapist"
  }' | jq '.'

echo ""
echo "Testing Login for Dr. James Chen..."
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "therapist-4-id",
    "email": "therapist4@bedrock.test",
    "role": "therapist"
  }' | jq '.'

echo ""
echo "Testing Login for System Admin..."
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin-3-id",
    "email": "admin3@bedrock.test",
    "role": "admin"
  }' | jq '.'
```

Run with: `bash test-login.sh`

---

## 📞 Need Help?

If login fails:
1. Open both debug panels (red and orange buttons)
2. Try the login
3. Copy errors from red panel
4. Copy API request/response from orange panel
5. Check against this guide
6. Share error details for support

---

## 🔄 Updating Credentials

To add new users to the frontend:

1. Update `/data/demoUsers.ts`:
   ```typescript
   {
     id: 'new-user-id',
     email: 'newuser@example.com',
     name: 'New User',
     role: 'therapist'
   }
   ```

2. Update `/components/CreateSessionTest.tsx`:
   ```typescript
   {
     userId: 'new-user-id',
     email: 'newuser@example.com',
     name: 'New User',
     role: 'therapist',
     description: 'New test user'
   }
   ```

---

## ✅ Summary

**Valid UserIds:**
- `therapist-3-id`
- `therapist-4-id`
- `admin-3-id`
- `client-susan-id`
- `client-john-id`
- Any new `USR-XXX-XXX` format

**Valid Emails:**
- `therapist3@bedrock.test`
- `therapist4@bedrock.test`
- `admin3@bedrock.test`
- `susan.marie@email.com`
- `john.paul@email.com`
- Any valid email format

**Valid Roles:**
- `therapist` ✅
- `client` ✅ (NOT "client")
- `admin` ✅

**No Passwords Required!** 🎉
