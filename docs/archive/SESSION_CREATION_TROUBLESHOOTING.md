# 🔧 Session Creation Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: "ApiException: Request failed"

This is a generic error that means the API request failed. Check the browser console for more details.

#### Possible Causes:

1. **Not Logged In / No Access Token**
   - **Solution:** Make sure you clicked "Login" first and received an access token
   - Check browser console for "Access Token (Bearer)" message
   - Verify the access token is being stored

2. **Invalid User IDs**
   - **Problem:** therapistId or clientId doesn't exist in backend
   - **Solution:** Use one of the registered test users
   - Run `./register-test-users.sh` to register all test users

3. **Same therapistId and clientId**
   - **Problem:** therapistId and clientId are the same user
   - **Solution:** Backend requires different users. The code should automatically use different IDs
   - Therapist: Your logged-in user
   - Client: USR-CLIENT-2025 (automatically added)

4. **Backend Server Down**
   - **Problem:** Firebase backend is not responding
   - **Solution:** Check if backend is deployed
   ```bash
   curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/health
   ```

5. **CORS Error**
   - **Problem:** Browser blocking request due to CORS
   - **Solution:** Check browser console for CORS errors
   - Backend should have CORS enabled for your domain

6. **Invalid Date Format**
   - **Problem:** startTime or endTime in wrong format
   - **Solution:** Use ISO 8601 format: `2025-11-16T15:00:00.000Z`

7. **Missing Required Fields**
   - **Problem:** Backend expects specific fields
   - **Required Fields:**
     - `therapistId` (string)
     - `clientId` (string)
     - `startTime` (ISO 8601 string)
     - `endTime` (ISO 8601 string)
     - `recordingEnabled` (boolean)
     - `chatEnabled` (boolean)
     - `screenShareEnabled` (boolean)

---

## Debugging Steps

### Step 1: Check Browser Console

Open browser console (F12) and look for detailed error logs:

```
═══════════════════════════════════════════
❌ SESSION CREATION FAILED
═══════════════════════════════════════════
Error type: ApiException
Error message: Request failed
Error code: HTTP_400
Error status: 400
Error details: { message: "...", ... }
Full error: ...
═══════════════════════════════════════════
```

### Step 2: Verify Login Status

Check if you have a valid access token:

1. Look for this message in console:
   ```
   ✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅
   ```

2. Token should be 200+ characters long

3. If no token, click "Login" button first

### Step 3: Check Request Payload

Look for this in console:

```
🎬 Creating session with request: {
  therapistId: "USR-THERAPIST-001",
  clientId: "USR-CLIENT-2025",
  startTime: "2025-11-16T15:00:00.000Z",
  endTime: "2025-11-16T16:00:00.000Z",
  ...
}
```

Verify:
- ✅ therapistId is valid user ID
- ✅ clientId is different from therapistId
- ✅ startTime is in future (or at least valid date)
- ✅ endTime is after startTime

### Step 4: Check API Response

Look for API error details:

```
❌ API Error Response: {
  status: 400,
  statusText: "Bad Request",
  error: { message: "..." }
}
```

Common error messages:
- "User not found" → User ID doesn't exist
- "Invalid date format" → Use ISO 8601
- "therapistId and clientId must be different" → Use different users
- "Unauthorized" → No access token or invalid token

### Step 5: Verify Users Exist

Test if users exist in backend:

```bash
# Check therapist
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/users/USR-THERAPIST-001 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check client
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/users/USR-CLIENT-2025 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

If 404 error, register users:
```bash
./register-test-users.sh
```

---

## Error Code Reference

| Error Code | Status | Meaning | Solution |
|------------|--------|---------|----------|
| AUTH_REQUIRED | 401 | No access token | Login first |
| SESSION_EXPIRED | 401 | Token expired | Login again |
| HTTP_400 | 400 | Bad request format | Check request payload |
| HTTP_401 | 401 | Unauthorized | Check access token |
| HTTP_404 | 404 | User/resource not found | Register users first |
| HTTP_500 | 500 | Server error | Check backend logs |
| NETWORK_ERROR | - | Network failure | Check internet connection |

---

## Quick Fixes

### Fix 1: Register All Test Users

```bash
chmod +x register-test-users.sh
./register-test-users.sh
```

This will create:
- 10 therapists (USR-THERAPIST-001 to 010)
- 10 clients (USR-CLIENT-001 to 010)

### Fix 2: Clear Tokens and Restart

If you're getting authentication errors:

1. Open browser console
2. Run:
   ```javascript
   localStorage.clear();
   ```
3. Refresh page
4. Login again

### Fix 3: Check Backend Health

```bash
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/health
```

Should return:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "..."
}
```

### Fix 4: Test with cURL

Test the exact request that's failing:

```bash
# 1. Login
curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USR-THERAPIST-001",
    "email": "therapist001@example.com",
    "role": "therapist"
  }'

# Save the accessToken from response

# 2. Create appointment
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
  }'
```

---

## API Debug Panel

The app includes an API Debug Panel (orange button, bottom-right) that shows:

- ✅ All API requests
- ✅ Request/response headers
- ✅ Request/response bodies
- ✅ Error messages
- ✅ Response times

Click it to see detailed API logs!

---

## Error Debug Panel

The app also includes an Error Debug Panel (red button, bottom-right) that shows:

- ✅ All errors and exceptions
- ✅ Stack traces
- ✅ Error timestamps
- ✅ Error context

Click it to see all errors!

---

## Still Having Issues?

### 1. Check Console Logs

Look for these key messages:

**Login Success:**
```
✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅
```

**Session Creation Start:**
```
🎬 STEP 2: CREATE SESSION
🎬 Creating session with request: { ... }
```

**Session Creation Success:**
```
✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅
```

### 2. Verify Request Format

The request should look exactly like this:

```json
{
  "therapistId": "USR-THERAPIST-001",
  "clientId": "USR-CLIENT-001",
  "startTime": "2025-11-16T15:00:00.000Z",
  "endTime": "2025-11-16T16:00:00.000Z",
  "recordingEnabled": false,
  "chatEnabled": true,
  "screenShareEnabled": true,
  "notes": "Test video call session"
}
```

### 3. Check Network Tab

Open browser DevTools → Network tab:

1. Filter by "appointments"
2. Look for POST request to `/appointments`
3. Check Request Headers → Should have `Authorization: Bearer ...`
4. Check Request Payload → Should match format above
5. Check Response → Look for error message

### 4. Common Mistakes

❌ **Wrong:** Using email as userId
```javascript
userId: 'therapist001@example.com' // WRONG
```

✅ **Correct:** Using actual userId
```javascript
userId: 'USR-THERAPIST-001' // CORRECT
```

❌ **Wrong:** Same user for therapist and client
```javascript
therapistId: 'USR-THERAPIST-001',
clientId: 'USR-THERAPIST-001' // WRONG - same user!
```

✅ **Correct:** Different users
```javascript
therapistId: 'USR-THERAPIST-001',
clientId: 'USR-CLIENT-001' // CORRECT - different users
```

❌ **Wrong:** Invalid date format
```javascript
startTime: '2025-11-16 15:00:00' // WRONG - no timezone
```

✅ **Correct:** ISO 8601 with timezone
```javascript
startTime: '2025-11-16T15:00:00.000Z' // CORRECT - ISO 8601
```

---

## Need More Help?

1. **Check Documentation:**
   - `/TEST_USERS_GUIDE.md` - Complete user guide
   - `/VIDEO_SESSION_API_GUIDE.md` - API documentation
   - `/UPDATED_USER_IDS.md` - User ID reference

2. **Run Test Scripts:**
   - `./register-test-users.sh` - Register all users
   - `./test-video-session.sh` - Complete end-to-end test

3. **Review Logs:**
   - Browser console (F12)
   - API Debug Panel (orange button)
   - Error Debug Panel (red button)

---

**Last Updated:** November 14, 2025  
**Status:** Enhanced error logging and debugging tools added
