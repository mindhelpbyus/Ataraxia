# 🐛 Complete Debug Error Guide

## Overview
This guide explains how to use the comprehensive debugging tools to capture and fix all errors in your wellness calendar application.

## 🎯 Two Debug Panels Available

### 1. **API Debug Panel** (Orange Button - Bottom Right)
- **Purpose**: Monitors ALL HTTP requests and responses
- **Shows**:
  - Request method, URL, headers, body
  - Response status, headers, body
  - Request duration
  - CORS errors
  - Network failures

### 2. **Error Debug Panel** (Red Button - Above API Panel)
- **Purpose**: Captures ALL JavaScript errors
- **Shows**:
  - Console errors (console.error)
  - Console warnings (console.warn)
  - Uncaught exceptions
  - Unhandled promise rejections
  - Stack traces
  - Component stacks

---

## 🔧 How to Use

### Step 1: Load the Application
1. Open your app in the browser
2. You'll see TWO floating buttons on the bottom-right:
   - 🐛 **Errors** (Red) - Error Debug Panel
   - 📡 **API Debug** (Orange) - API Debug Panel

### Step 2: Reproduce the Issue
1. Perform the action that causes the error
2. Watch both panels for activity:
   - **Red panel animates** → JavaScript error occurred
   - **Orange panel counter increases** → API call was made

### Step 3: Review Errors

#### API Errors (Orange Panel):
```
✅ Click "API Debug" button
✅ See all requests with:
   - Red border = Error (4xx, 5xx)
   - Green border = Success (2xx)
   - Click any request to expand details
   - Copy individual sections
   - Filter by: All | Success | Errors
```

#### JavaScript Errors (Red Panel):
```
✅ Click "Errors" button
✅ See all errors with:
   - Type (ERROR, WARNING, etc.)
   - Timestamp
   - Error message
   - Stack trace (expandable)
   - Full details (expandable)
   - "Copy All" button → Copy everything to clipboard
```

---

## 🚨 Common Error Patterns

### Pattern 1: CORS Errors
**Symptoms**:
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**In API Debug Panel**:
- Status: (empty or failed)
- Error: "Failed to fetch" or "Network error"

**Fix**:
1. Check `/api/client.ts` has:
   ```typescript
   mode: 'cors',
   credentials: 'omit',
   'Content-Type': 'application/json'
   ```
2. Backend must return proper CORS headers

---

### Pattern 2: Authentication Errors
**Symptoms**:
```
401 Unauthorized
Authentication required
```

**In API Debug Panel**:
- Status: 401
- Response body: `{ "error": "..." }`
- Request headers: Check "Authorization" header

**In Error Panel**:
- Type: ERROR
- Message: "AUTH_REQUIRED" or "Session expired"

**Fix**:
1. Check login flow sends correct data:
   ```typescript
   {
     userId: "USR-12345",
     email: "user@example.com",
     role: "therapist"
   }
   ```
2. Verify token is stored in localStorage
3. Check Authorization header format: `Bearer ${token}`

---

### Pattern 3: API Response Unwrapping Errors
**Symptoms**:
```
Cannot read property 'tokens' of undefined
```

**In Error Panel**:
- Type: ERROR
- Stack trace points to auth.ts or similar

**Fix**:
The API client auto-unwraps `data` property:
```typescript
// ❌ WRONG - double unwrapping
const tokens = response.data.tokens;

// ✅ CORRECT - already unwrapped
const tokens = response.tokens;
```

---

### Pattern 4: TypeScript Type Errors
**Symptoms**:
```
Argument of type 'X' is not assignable to parameter of type 'Y'
```

**In Error Panel**:
- Shows in console during development
- May cause runtime errors

**Fix**:
1. Check function signatures match:
   ```typescript
   // useAuth hook expects:
   login(userId: string, email: string, role: 'therapist' | 'client' | 'admin')
   
   // Not:
   login(email: string, password: string)
   ```

---

## 📋 Copying Errors for Support

### Option 1: Copy Individual Error
1. Open Error Debug Panel (Red button)
2. Click on error
3. Expand "Stack Trace" and "Details"
4. Right-click → Copy

### Option 2: Copy All Errors
1. Open Error Debug Panel
2. Click "Copy All" button
3. Paste into text file or support ticket

### Option 3: Copy API Requests
1. Open API Debug Panel
2. Expand the failed request
3. Click copy icons for:
   - Request Headers
   - Request Body
   - Response Body

---

## 🔍 Testing Authentication Flow

### Complete Test Procedure:

1. **Clear State**
   ```javascript
   // Open browser console
   localStorage.clear();
   location.reload();
   ```

2. **Open Both Debug Panels**
   - Click "Errors" (red button)
   - Click "API Debug" (orange button)

3. **Test Login**
   - Click "🎥 Test Jitsi Video Calling" on login page
   - Select a user (e.g., Dr. Sarah Mitchell)
   - Click "1. Login"

4. **Check API Panel**
   ```
   POST /auth/register-or-login
   ✅ Status: 200
   ✅ Response includes: { user: {...}, tokens: {...} }
   ```

5. **Check Error Panel**
   ```
   ✅ Should be EMPTY (no errors)
   ❌ If errors appear, read message and stack trace
   ```

6. **Create Session**
   - Click "2. Create Session"
   - Check API panel for:
     ```
     POST /sessions
     Authorization: Bearer eyJ...
     Status: 200
     ```

7. **Get JWT**
   - Click "3. Get JWT Token"
   - Check API panel for:
     ```
     GET /sessions/{id}/jwt
     Status: 200
     Response: { jwt: "...", roomName: "..." }
     ```

---

## 🛠️ Quick Fixes Reference

### Fix 1: Clear Console Filter
If you see: "Firebase warnings suppressed"
```typescript
// In /utils/consoleFilter.ts
// Comment out installConsoleFilter() temporarily
```

### Fix 2: Reset Debug Panels
```
1. Click "Clear" in both panels
2. Refresh page
3. Reproduce issue
```

### Fix 3: Check Network Tab
Sometimes errors don't show in panels:
```
1. Open DevTools (F12)
2. Go to Network tab
3. Look for red/failed requests
4. Click → Preview/Response tabs
```

---

## 📞 Reporting Issues

When reporting issues, include:

1. **Error Panel Output**
   - Click "Copy All" → Paste in report

2. **API Panel Output**
   - Expand failed request
   - Copy request/response bodies

3. **Steps to Reproduce**
   - What button did you click?
   - What page were you on?
   - What action caused the error?

4. **Expected vs Actual**
   - What should happen?
   - What actually happened?

5. **Environment**
   - Browser: Chrome/Firefox/Safari
   - Development or Production
   - Localhost or deployed URL

---

## 🎓 Advanced Debugging

### Combine Both Panels
```
Scenario: Login fails with 401

1. API Panel shows:
   POST /auth/register-or-login → 401
   Response: { error: "Invalid credentials" }

2. Error Panel shows:
   ERROR: ApiException: Authentication failed
   Stack: at login (auth.ts:75)

3. Root Cause:
   - API call succeeded (no network error)
   - Backend rejected credentials
   - Check request body in API panel
   - Compare with curl examples
```

### Use Browser DevTools
```
1. Open DevTools (F12)
2. Sources tab → Add breakpoints
3. Network tab → Check raw requests
4. Console tab → See all logs
5. Application tab → Check localStorage tokens
```

---

## ✅ Success Indicators

### Healthy Application Shows:
1. **API Panel**:
   - All requests show green status (200-299)
   - Response bodies contain expected data
   - Authorization headers present

2. **Error Panel**:
   - Empty or only warnings (yellow)
   - No red ERROR entries
   - No stack traces

3. **Console**:
   - Green checkmarks (✅)
   - "Login successful"
   - "Token received"

---

## 🆘 Emergency Debug Mode

If nothing works:

1. **Enable Full Logging**
   ```typescript
   // In /api/client.ts, add at top:
   const DEBUG = true;
   ```

2. **Disable Console Filter**
   ```typescript
   // In /App.tsx, comment out:
   // installConsoleFilter();
   ```

3. **Check All Storage**
   ```javascript
   // Browser console:
   console.log('Access Token:', localStorage.getItem('accessToken'));
   console.log('Refresh Token:', localStorage.getItem('refreshToken'));
   console.log('All Storage:', {...localStorage});
   ```

4. **Test Backend Directly**
   ```bash
   # Terminal:
   curl -X POST https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api/auth/register-or-login \
     -H "Content-Type: application/json" \
     -d '{"userId":"USR-TEST","email":"test@example.com","role":"therapist"}'
   ```

---

## 🎯 Next Steps

After capturing errors:
1. Read error messages carefully
2. Check stack traces for line numbers
3. Compare with working curl examples
4. Verify API request/response formats
5. Check this guide for common patterns
6. Copy error details for support

**Remember**: Both panels work together! Use them simultaneously for best results.
