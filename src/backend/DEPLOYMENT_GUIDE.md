# 🚀 Backend Deployment Guide

## Quick Deploy Checklist

- [ ] Copy backend files to Cloud Functions directory
- [ ] Update environment variable for localhost CORS
- [ ] Install dependencies
- [ ] Deploy to Firebase
- [ ] Test from localhost
- [ ] Done! 🎉

---

## Step 1: Copy Backend Files

### Your Firebase Project Structure

```
ataraxia-c150f/
├── functions/
│   ├── index.js              ← Copy backend/index.js here
│   ├── cors-config.js        ← Copy backend/cors-config.js here
│   ├── package.json          ← Update with backend/package.json
│   └── .env.production       ← You already have this! ✅
```

### Copy Commands

From your project root:

```bash
# Navigate to your Firebase functions directory
cd /path/to/ataraxia-c150f/functions

# Copy the backend files
cp /path/to/figma-project/backend/index.js ./index.js
cp /path/to/figma-project/backend/cors-config.js ./cors-config.js

# Backup your existing package.json first!
cp package.json package.json.backup

# Merge dependencies from backend/package.json into your package.json
# (See below for what to add)
```

---

## Step 2: Update package.json

### Add These Dependencies

Open your `functions/package.json` and add:

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "firebase-admin": "^11.11.0",
    "firebase-functions": "^4.5.0",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### Install Dependencies

```bash
cd functions
npm install
```

---

## Step 3: Enable Localhost CORS

### Update Your .env.production

Your current `.env.production`:

```bash
CORS_ORIGIN=https://ataraxia-c150f.web.app
CORS_ADDITIONAL_ORIGINS=https://ataraxia-c150f.firebaseapp.com
ENABLE_TEST_LOGIN=false
```

### ✅ Change to Enable Localhost:

```bash
CORS_ORIGIN=https://ataraxia-c150f.web.app
CORS_ADDITIONAL_ORIGINS=https://ataraxia-c150f.firebaseapp.com
ENABLE_TEST_LOGIN=true  # ← Change this to true
```

**Why?** The `cors-config.js` checks if `ENABLE_TEST_LOGIN=true` to allow localhost origins.

**Security:** This is safe! You still have:
- ✅ Firebase JWT authentication required
- ✅ Role verification from Firestore
- ✅ Only allows specific localhost ports
- ✅ Production origins always allowed

---

## Step 4: Set Environment Variables in Firebase

### Option A: Using Firebase CLI (Recommended)

```bash
# Set environment variables
firebase functions:config:set \
  cors.origin="https://ataraxia-c150f.web.app" \
  cors.additional_origins="https://ataraxia-c150f.firebaseapp.com" \
  enable.test_login="true" \
  jitsi.app_id="bedrock-video-conferencing" \
  jitsi.app_secret="demo-jitsi-secret-key-for-testing" \
  jitsi.domain="meet.bedrockhealthsolutions.com" \
  jitsi.room_prefix="bedrock-"

# View current config
firebase functions:config:get
```

### Option B: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select `ataraxia-c150f` project
3. Go to **Functions**
4. Click on **bedrockBackend** function
5. Click **Edit**
6. Add these environment variables:

| Name | Value |
|------|-------|
| `CORS_ORIGIN` | `https://ataraxia-c150f.web.app` |
| `CORS_ADDITIONAL_ORIGINS` | `https://ataraxia-c150f.firebaseapp.com` |
| `ENABLE_TEST_LOGIN` | `true` |
| `JITSI_APP_ID` | `bedrock-video-conferencing` |
| `JITSI_APP_SECRET` | `demo-jitsi-secret-key-for-testing` |
| `JITSI_DOMAIN` | `meet.bedrockhealthsolutions.com` |
| `JITSI_ROOM_PREFIX` | `bedrock-` |

### Option C: Use .env File (Development)

The function will automatically read from `.env.production` if you're using:

```javascript
require('dotenv').config({ path: '.env.production' });
```

Add this at the top of `index.js`:

```javascript
// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.production' });
}
```

---

## Step 5: Deploy to Firebase

### Full Deployment

```bash
# From your Firebase project root
firebase deploy --only functions:bedrockBackend
```

### Watch Deployment Logs

```bash
# In another terminal, watch logs
firebase functions:log --only bedrockBackend
```

### Expected Output

```
✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (X KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: updating Node.js 18 function bedrockBackend(us-central1)...
✔  functions[bedrockBackend(us-central1)]: Successful update operation.

✔  Deploy complete!
```

---

## Step 6: Test Deployment

### Test 1: Health Check

```bash
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackend/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "service": "bedrock-backend",
  "environment": "production",
  "version": "1.0.0"
}
```

### Test 2: CORS from Localhost

Open browser console at `http://localhost:5173`:

```javascript
fetch('https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackend/health', {
  method: 'GET'
})
.then(res => res.json())
.then(data => console.log('✅ CORS working!', data))
.catch(err => console.error('❌ CORS error:', err));
```

**Expected:** `✅ CORS working! { status: 'ok', ... }`

### Test 3: Full Video Session

```bash
# In your frontend
npm run dev

# Navigate to SecureVideoCallTest
# Login with: andrew.joseph@bedrock.health / therapist123
# Click "Create & Join Session"
# Should work! 🎉
```

---

## Step 7: Verify CORS Configuration

### Check Logs

```bash
firebase functions:log --only bedrockBackend | grep CORS
```

**Expected:**
```
CORS Configuration: {
  environment: 'production',
  allowedOrigins: [
    'https://ataraxia-c150f.web.app',
    'https://ataraxia-c150f.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ]
}
```

### Check Network Tab

1. Open DevTools → Network
2. Create a video session
3. Find request to `/api/sessions`
4. Check Response Headers:

**Should see:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

---

## 🔧 Troubleshooting

### Error: "Origin not allowed by CORS"

**Cause:** CORS not configured correctly

**Fix:**
1. Check `ENABLE_TEST_LOGIN=true` in environment variables
2. Redeploy: `firebase deploy --only functions:bedrockBackend`
3. Clear browser cache
4. Try again

### Error: "Authentication required"

**Cause:** User not logged in

**Fix:**
1. Use `SecureVideoCallTest` component (has login built-in)
2. Login with test credentials
3. Try again

### Error: "Failed to create session"

**Cause:** User role is not therapist/admin

**Fix:**
1. Check Firestore: `/users/{userId}`
2. Ensure `role` field is `"therapist"` or `"admin"`
3. Update if needed:
```javascript
db.collection('users').doc('NnAjFrv82ySHIKRTLX9FSrmhm7k2').update({
  role: 'therapist'
});
```

### Error: "Module not found: cors"

**Cause:** Dependencies not installed

**Fix:**
```bash
cd functions
npm install cors express jsonwebtoken
```

### Deployment Fails

**Cause:** Various reasons

**Debug:**
```bash
# Check logs
firebase functions:log --only bedrockBackend

# Try deploying with debug
firebase deploy --only functions:bedrockBackend --debug
```

---

## 🔐 Security Notes

### ✅ Safe Practices

1. **Localhost CORS enabled only when `ENABLE_TEST_LOGIN=true`**
   - Safe for development
   - Still requires authentication
   - Only specific ports allowed

2. **All requests require Firebase JWT**
   - User must be authenticated
   - Token verified by Firebase Admin SDK
   - Role read from Firestore

3. **Role-based access control**
   - Only therapists/admins can create sessions
   - Role verified from Firestore (source of truth)
   - Not trusted from request

### ❌ Don't Do This

```javascript
// ❌ NEVER allow all origins
app.use(cors({ origin: '*' }));

// ❌ NEVER disable authentication
// app.post('/api/sessions', async (req, res) => { ... });

// ❌ NEVER trust role from request
const role = req.body.role; // NO!
```

### ✅ Production Deployment

When deploying to production:

**Option 1: Keep localhost enabled**
- Safe because authentication still required
- Convenient for testing

**Option 2: Disable localhost**
```bash
firebase functions:config:set enable.test_login="false"
firebase deploy --only functions:bedrockBackend
```

Test on production URL: `https://ataraxia-c150f.web.app`

---

## 📊 What Gets Deployed

### Files Deployed:
```
functions/
├── index.js              ✅ Main Cloud Function
├── cors-config.js        ✅ CORS configuration
├── package.json          ✅ Dependencies
└── node_modules/         ✅ Installed packages
```

### Endpoints Available:
```
GET  /health                          - Health check
POST /api/sessions                    - Create session (auth required)
POST /api/sessions/:id/join           - Join session (auth required)
GET  /api/sessions/:id                - Get session (auth required)
GET  /api/sessions                    - List sessions (auth required)
```

### Environment Variables Used:
```
✅ CORS_ORIGIN
✅ CORS_ADDITIONAL_ORIGINS
✅ ENABLE_TEST_LOGIN
✅ JITSI_APP_ID
✅ JITSI_APP_SECRET
✅ JITSI_DOMAIN
✅ JITSI_ROOM_PREFIX
```

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Health check works
- [ ] CORS allows localhost
- [ ] Can login from frontend
- [ ] Can create session from SecureVideoCallTest
- [ ] Can join session
- [ ] Video interface loads
- [ ] Jitsi JWT token generated correctly
- [ ] Moderator status correct (therapist/admin = moderator)
- [ ] No CORS errors in console
- [ ] No authentication errors
- [ ] Logs show successful operations

---

## 🎯 Quick Commands Reference

```bash
# Deploy
firebase deploy --only functions:bedrockBackend

# View logs
firebase functions:log --only bedrockBackend

# Test health
curl https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackend/health

# Check config
firebase functions:config:get

# Set config
firebase functions:config:set enable.test_login="true"

# Shell (interactive testing)
firebase functions:shell
```

---

## 📚 Next Steps

After deployment:

1. **Test Video Calling**
   - Use `SecureVideoCallTest` component
   - Create and join sessions
   - Verify video works

2. **Update Frontend**
   - Ensure using `SecureVideoCallTest` not `DirectVideoCallTest`
   - Verify API endpoints are correct
   - Test all user roles

3. **Monitor Logs**
   - Watch for errors
   - Check CORS logs
   - Verify authentication working

4. **Production Testing**
   - Deploy frontend: `firebase deploy --only hosting`
   - Test at: `https://ataraxia-c150f.web.app`
   - Verify everything works

---

**Last Updated:** 2024-01-15  
**Status:** ✅ Ready to deploy
