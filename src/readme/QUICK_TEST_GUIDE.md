# 🚀 Quick Test Guide - Jitsi Video Call Integration

## ⚡ Fast Setup (5 minutes)

### Step 1: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add:

```env
REACT_APP_JITSI_DOMAIN=meet.yourdomain.com
REACT_APP_JITSI_USE_JWT=true
REACT_APP_JITSI_APP_ID=your-app-id
REACT_APP_BACKEND_URL=http://localhost:3001
```

### Step 2: Start Backend Server

Create a simple test server (`test-server.js`):

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JITSI_SECRET = 'your-jitsi-secret'; // Replace with your actual secret
const JITSI_APP_ID = 'your-app-id';      // Replace with your actual app ID
const JITSI_DOMAIN = 'meet.yourdomain.com'; // Replace with your domain

app.post('/api/jitsi/generate-token', (req, res) => {
  const { roomName, userName, userEmail, userId, isModerator } = req.body;
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    context: {
      user: {
        name: userName,
        email: userEmail,
        id: userId,
      },
    },
    aud: JITSI_APP_ID,
    iss: JITSI_APP_ID,
    sub: JITSI_DOMAIN,
    room: roomName,
    exp: now + 7200,
    moderator: isModerator,
  };

  const token = jwt.sign(payload, JITSI_SECRET, { algorithm: 'HS256' });

  res.json({
    token,
    roomName,
    joinUrl: `https://${JITSI_DOMAIN}/${roomName}`,
    expiresAt: new Date((now + 7200) * 1000).toISOString(),
  });
});

app.listen(3001, () => {
  console.log('✅ Test server running on http://localhost:3001');
});
```

Start it:

```bash
node test-server.js
```

### Step 3: Test in Application

1. **Start React app:**
   ```bash
   npm start
   ```

2. **Create appointment with video call:**
   - Navigate to Calendar
   - Click "New Appointment"
   - Fill in appointment details
   - ✅ Check "Enable Video Call"
   - Select "Video Call" or "Audio Only"
   - Click "Save"

3. **Join the call:**
   - Click on the appointment to open details panel
   - Look for "Scheduled Video Call" section
   - Click "Join Video Call" button
   - Jitsi interface should load

## 🔍 Verify It's Working

### Check Console Logs

You should see:

```
✅ Generating JWT for room: ataraxia-xxx-xxx
✅ JWT token received
✅ Loading Jitsi from: https://meet.yourdomain.com/external_api.js
✅ Jitsi room initialized
```

### Check Network Tab

1. Open Browser DevTools → Network
2. Look for API calls to:
   - `http://localhost:3001/api/jitsi/generate-token` ✅ Should return 200
   - `https://meet.yourdomain.com/external_api.js` ✅ Should load

### Check Appointment Data

In console, you should see appointment saved with:

```javascript
{
  isVideoCall: true,
  videoCallType: "video",
  videoCallRoomName: "ataraxia-xxx-xxx",
  videoCallUrl: "https://meet.yourdomain.com/ataraxia-xxx-xxx",
  videoCallJWT: "eyJhbGci..."
}
```

## 🐛 Troubleshooting

### Problem: "Failed to generate Jitsi token"

**Solution:**
```bash
# Check backend is running
curl http://localhost:3001/api/jitsi/generate-token

# Check CORS is enabled
# Check backend logs for errors
```

### Problem: "Invalid JWT" in Jitsi

**Solution:**
- Verify JWT secret matches Jitsi server configuration
- Check JWT payload structure
- Ensure `aud`, `iss`, `sub` match Jitsi config

### Problem: Mock tokens being used

**Solution:**
- Check browser console for warnings
- Verify `REACT_APP_BACKEND_URL` is correct
- Ensure backend server is running and accessible

## 📝 Testing Checklist

- [ ] Environment variables configured
- [ ] Backend server running
- [ ] Backend returns valid JWT tokens
- [ ] React app starts without errors
- [ ] Can create appointment with video call enabled
- [ ] Appointment shows "Scheduled Video Call" section
- [ ] "Join Video Call" button appears
- [ ] Jitsi interface loads when joining
- [ ] No JWT errors in console
- [ ] Video/audio works in call

## 🎉 Success!

If all checks pass, your Jitsi integration is working correctly!

## 📚 Next Steps

1. Review full documentation: `/readme/JITSI_BACKEND_SETUP.md`
2. Implement client-side join functionality
3. Add call history and logging
4. Set up production environment
5. Configure SSL/TLS for production

## 🔗 Helpful Commands

```bash
# Test JWT generation
curl -X POST http://localhost:3001/api/jitsi/generate-token \
  -H "Content-Type: application/json" \
  -d '{"roomName":"test-123","userName":"Test User","isModerator":true}'

# Decode JWT token (paste your token)
echo "YOUR_JWT_TOKEN" | jwt decode -

# Check Jitsi server is accessible
curl https://meet.yourdomain.com

# View React app logs
npm start | grep -i jitsi
```

---

**Need help?** Check the full setup guide in `/readme/JITSI_BACKEND_SETUP.md`
