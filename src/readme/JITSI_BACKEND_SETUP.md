# Jitsi Backend Integration Setup Guide

This guide explains how to configure and test the Jitsi video calling integration with your self-hosted Jitsi server.

## 📋 Prerequisites

1. **Self-hosted Jitsi Server** running and accessible
2. **JWT Authentication** configured on your Jitsi server
3. **Backend API** to generate JWT tokens
4. **App ID and Secret** from your Jitsi JWT configuration

---

## 🔧 Configuration Steps

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# Jitsi Server Configuration
REACT_APP_JITSI_DOMAIN=meet.yourdomain.com
REACT_APP_JITSI_USE_JWT=true
REACT_APP_JITSI_APP_ID=your-app-id

# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:3001
```

**Replace with your actual values:**
- `meet.yourdomain.com` → Your Jitsi server domain
- `your-app-id` → Your JWT App ID from Jitsi configuration
- `http://localhost:3001` → Your backend API URL

---

### 2. Update Jitsi Configuration

Edit `/config/jitsi.ts` if you need more control:

```typescript
export const JITSI_CONFIG = {
  domain: 'meet.yourdomain.com',
  useJWT: true,
  jwtAppId: 'your-app-id',
  backendUrl: 'http://localhost:3001',
  endpoints: {
    generateToken: '/api/jitsi/generate-token',
    createRoom: '/api/jitsi/create-room',
    validateToken: '/api/jitsi/validate-token',
  },
};
```

---

## 🔌 Backend API Requirements

Your backend needs to implement these endpoints:

### 1. Generate JWT Token

**Endpoint:** `POST /api/jitsi/generate-token`

**Request Body:**
```json
{
  "roomName": "ataraxia-12345-1699999999999",
  "userName": "Dr. Sarah Johnson",
  "userEmail": "sarah.johnson@example.com",
  "userId": "therapist-123",
  "isModerator": true,
  "appointmentId": "appt-456",
  "expiresIn": 7200
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roomName": "ataraxia-12345-1699999999999",
  "joinUrl": "https://meet.yourdomain.com/ataraxia-12345-1699999999999",
  "expiresAt": "2024-11-14T12:00:00Z"
}
```

**JWT Payload Structure:**
```json
{
  "context": {
    "user": {
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "id": "therapist-123",
      "avatar": "https://..."
    },
    "group": "ataraxia-wellness"
  },
  "aud": "your-app-id",
  "iss": "your-app-id",
  "sub": "meet.yourdomain.com",
  "room": "ataraxia-12345-1699999999999",
  "exp": 1699999999,
  "moderator": true,
  "nbf": 1699993999
}
```

### 2. Create Room (Optional - Advanced)

**Endpoint:** `POST /api/jitsi/create-room`

**Request Body:**
```json
{
  "appointmentId": "appt-456",
  "therapistId": "therapist-123",
  "clientId": "client-789",
  "scheduledStartTime": "2024-11-14T10:00:00Z",
  "callType": "video"
}
```

**Response:**
```json
{
  "roomName": "ataraxia-12345-1699999999999",
  "joinUrl": "https://meet.yourdomain.com/ataraxia-12345-1699999999999",
  "therapistToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "clientToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Validate Token (Optional)

**Endpoint:** `POST /api/jitsi/validate-token`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "expiresAt": "2024-11-14T12:00:00Z"
}
```

---

## 🔐 Backend Implementation Example (Node.js)

### Install Dependencies
```bash
npm install jsonwebtoken express cors
```

### Example Server Code

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration - Load from environment variables
const JITSI_CONFIG = {
  domain: process.env.JITSI_DOMAIN || 'meet.yourdomain.com',
  appId: process.env.JITSI_APP_ID || 'your-app-id',
  appSecret: process.env.JITSI_APP_SECRET || 'your-app-secret',
};

// Generate JWT Token
app.post('/api/jitsi/generate-token', (req, res) => {
  try {
    const {
      roomName,
      userName,
      userEmail,
      userId,
      isModerator = false,
      appointmentId,
      expiresIn = 7200,
    } = req.body;

    // Validate required fields
    if (!roomName || !userName) {
      return res.status(400).json({
        error: 'roomName and userName are required',
      });
    }

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      context: {
        user: {
          name: userName,
          email: userEmail || undefined,
          id: userId || undefined,
        },
        group: 'ataraxia-wellness',
      },
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      exp: now + expiresIn,
      nbf: now - 10, // Not before: 10 seconds ago to allow for clock skew
      moderator: isModerator,
    };

    // Sign the token
    const token = jwt.sign(payload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    // Return response
    res.json({
      token,
      roomName,
      joinUrl: `https://${JITSI_CONFIG.domain}/${roomName}`,
      expiresAt: new Date((now + expiresIn) * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error generating JWT:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message,
    });
  }
});

// Create Room (generates tokens for both participants)
app.post('/api/jitsi/create-room', (req, res) => {
  try {
    const {
      appointmentId,
      therapistId,
      clientId,
      scheduledStartTime,
      callType = 'video',
    } = req.body;

    const roomName = `ataraxia-${appointmentId}-${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 7200; // 2 hours

    // Generate therapist token (moderator)
    const therapistPayload = {
      context: {
        user: {
          name: 'Therapist', // Replace with actual therapist name from DB
          id: therapistId,
        },
        group: 'ataraxia-wellness',
      },
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      exp: now + expiresIn,
      nbf: now - 10,
      moderator: true,
    };

    // Generate client token (participant)
    const clientPayload = {
      ...therapistPayload,
      context: {
        user: {
          name: 'Client', // Replace with actual client name from DB
          id: clientId,
        },
        group: 'ataraxia-wellness',
      },
      moderator: false,
    };

    const therapistToken = jwt.sign(therapistPayload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    const clientToken = jwt.sign(clientPayload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    res.json({
      roomName,
      joinUrl: `https://${JITSI_CONFIG.domain}/${roomName}`,
      therapistToken,
      clientToken,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      error: 'Failed to create room',
      message: error.message,
    });
  }
});

// Validate Token
app.post('/api/jitsi/validate-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, JITSI_CONFIG.appSecret, {
      algorithms: ['HS256'],
    });

    res.json({
      valid: true,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });
  } catch (error) {
    res.json({ valid: false });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Jitsi Backend API running on port ${PORT}`);
  console.log(`📡 Jitsi Domain: ${JITSI_CONFIG.domain}`);
  console.log(`🔑 App ID: ${JITSI_CONFIG.appId}`);
});
```

---

## 🧪 Testing the Integration

### 1. Start Your Backend Server

```bash
cd backend
node server.js
```

### 2. Test Backend Endpoints

**Test Token Generation:**
```bash
curl -X POST http://localhost:3001/api/jitsi/generate-token \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room-123",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "isModerator": true
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roomName": "test-room-123",
  "joinUrl": "https://meet.yourdomain.com/test-room-123",
  "expiresAt": "2024-11-14T12:00:00Z"
}
```

### 3. Test in the Application

1. **Start your React app:**
   ```bash
   npm start
   ```

2. **Create a new appointment:**
   - Go to Calendar
   - Click "New Appointment"
   - Enable "Video Call"
   - Select "Video Call" or "Audio Only"
   - Save the appointment

3. **Check browser console:**
   - You should see logs showing JWT generation
   - Look for any errors from the backend API

4. **Join the video call:**
   - Open the appointment details
   - Click "Join Video Call"
   - The Jitsi interface should load

---

## 🔍 Troubleshooting

### Issue: "Failed to generate Jitsi token"

**Solution:**
- Check if backend server is running
- Verify `REACT_APP_BACKEND_URL` is correct
- Check browser console and backend logs
- Verify CORS is enabled on backend

### Issue: "Invalid JWT token" in Jitsi

**Solution:**
- Verify JWT secret matches Jitsi server configuration
- Check JWT payload structure matches Jitsi requirements
- Ensure `aud`, `iss`, and `sub` fields are correct
- Check token hasn't expired

### Issue: Can't connect to Jitsi room

**Solution:**
- Verify Jitsi server domain is accessible
- Check if JWT authentication is properly configured on Jitsi
- Test room access with a token manually
- Check browser console for CORS errors

### Issue: Using mock tokens

**Solution:**
- If you see "Using MOCK Jitsi token generation" warning:
  - This means backend API is not responding
  - Check backend server is running
  - Verify backend URL configuration
  - Check network tab in browser dev tools

---

## 📝 Environment Variables Checklist

Create a `.env` file:

```env
# Frontend (.env)
REACT_APP_JITSI_DOMAIN=meet.yourdomain.com
REACT_APP_JITSI_USE_JWT=true
REACT_APP_JITSI_APP_ID=your-app-id
REACT_APP_BACKEND_URL=http://localhost:3001

# Backend (.env for your Node.js server)
JITSI_DOMAIN=meet.yourdomain.com
JITSI_APP_ID=your-app-id
JITSI_APP_SECRET=your-app-secret
PORT=3001
```

---

## 🔒 Security Notes

1. **Never expose JWT secret in frontend code**
2. **Always generate tokens on backend server**
3. **Use HTTPS in production**
4. **Implement authentication for backend API endpoints**
5. **Set appropriate token expiration times**
6. **Validate user permissions before generating tokens**

---

## 📚 Additional Resources

- [Jitsi JWT Documentation](https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/tokens.md)
- [Jitsi External API Documentation](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/)
- [JWT.io Debugger](https://jwt.io/) - Debug and decode JWT tokens

---

## ✅ Quick Start Checklist

- [ ] Set up self-hosted Jitsi server
- [ ] Configure JWT authentication on Jitsi
- [ ] Get JWT App ID and Secret
- [ ] Create backend API server
- [ ] Implement `/api/jitsi/generate-token` endpoint
- [ ] Test token generation with curl
- [ ] Create `.env` file with configuration
- [ ] Start backend server
- [ ] Start React app
- [ ] Test creating appointment with video call
- [ ] Test joining video call
- [ ] Verify JWT authentication works

---

## 🎉 You're Ready!

Once you complete these steps, your Jitsi integration will be fully functional. Users will be able to schedule video/audio appointments and join secure video calls directly from the calendar system.

For questions or issues, check the troubleshooting section or review the backend logs.
