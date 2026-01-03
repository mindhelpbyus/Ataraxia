# 🚀 Quick cURL Tests - Copy & Paste

## Just copy and paste these into your terminal to test backend authentication

---

## ✅ Test 1: Dr. Sarah Mitchell (Therapist)

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"therapist-3-id","email":"therapist3@bedrock.test","role":"therapist"}'
```

---

## ✅ Test 2: Dr. James Chen (Therapist)

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"therapist-4-id","email":"therapist4@bedrock.test","role":"therapist"}'
```

---

## ✅ Test 3: Test User (Backend Verified) ⭐

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-NEW-TEST-001","email":"newtest@example.com","role":"therapist"}'
```

**Note:** This user exists in Firestore (created Nov 13, 2025)

---

## ✅ Test 4: System Admin

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin-3-id","email":"admin3@bedrock.test","role":"admin"}'
```

---

## ✅ Test 5: New User Registration

```bash
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"USR-NEW-001","email":"newuser@example.com","role":"therapist"}'
```

---

## 📋 With Full Details (firstName, lastName)

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

## 🎯 Run All Tests At Once

```bash
bash test-all-users.sh
```

---

## 📝 Quick Reference

**Valid UserIds:**
- `therapist-3-id` → therapist3@bedrock.test
- `therapist-4-id` → therapist4@bedrock.test
- `USR-NEW-TEST-001` → newtest@example.com ⭐ **Verified in Firestore**
- `admin-3-id` → admin3@bedrock.test
- `client-susan-id` → susan.marie@email.com
- `client-john-id` → john.paul@email.com

**Valid Roles:**
- `therapist` ✅
- `client` ✅ (for clients)
- `admin` ✅

**⚠️ NO PASSWORD FIELD!** The backend uses `userId + email + role` only.

---

## ✅ Expected Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "therapist-3-id",
      "email": "therapist3@bedrock.test",
      "name": "Sarah Mitchell",
      "role": "therapist"
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

## ❌ Common Error Responses

### Missing userId:
```json
{
  "success": false,
  "error": "userId is required"
}
```

### Missing email:
```json
{
  "success": false,
  "error": "email is required"
}
```

### Invalid role:
```json
{
  "success": false,
  "error": "role must be therapist, client, or admin"
}
```

### CORS error:
```
Access to fetch has been blocked by CORS policy
```
→ Backend needs to return proper CORS headers

---

## 🔐 Using the Token in Next Request

```bash
# Step 1: Get token (save the accessToken from response)
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Step 2: Use token in authenticated request
curl -X GET https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🐛 Quick Debug

If request fails:

1. **Check JSON syntax** - No trailing commas
2. **Check Content-Type header** - Must be `application/json`
3. **Check CORS** - Backend must allow cross-origin requests
4. **Check role value** - Must be "therapist", "client", or "admin" (NOT "client")
5. **No password field** - Backend doesn't use passwords

---

## 📞 More Help

See full documentation:
- `/BACKEND_TEST_CREDENTIALS.md` - Complete reference
- `/DEBUG_ERROR_GUIDE.md` - Error debugging
- `/API_DEBUG_GUIDE.md` - API debugging

Run the test script:
```bash
chmod +x test-all-users.sh
./test-all-users.sh
```
