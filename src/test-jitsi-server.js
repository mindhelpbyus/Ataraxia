/**
 * Simple Jitsi Backend Test Server
 * 
 * This is a minimal Express server for testing Jitsi JWT token generation.
 * Use this to test your integration before building your production backend.
 * 
 * Setup:
 * 1. Install dependencies: npm install express cors jsonwebtoken
 * 2. Update configuration below with your Jitsi server details
 * 3. Run: node test-jitsi-server.js
 * 4. Server will start on http://localhost:3001
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Enable CORS for all origins (restrict this in production!)
app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const JITSI_CONFIG = {
  // Your Jitsi server domain (without https://)
  domain: process.env.JITSI_DOMAIN || 'meet.yourdomain.com',
  
  // JWT App ID from your Jitsi configuration
  appId: process.env.JITSI_APP_ID || 'your-app-id',
  
  // JWT App Secret from your Jitsi configuration
  // ⚠️ IMPORTANT: Keep this secret secure! Never commit to git!
  appSecret: process.env.JITSI_APP_SECRET || 'your-app-secret',
};

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Jitsi Backend Test Server is running',
    config: {
      domain: JITSI_CONFIG.domain,
      appId: JITSI_CONFIG.appId,
      // Don't expose secret!
    }
  });
});

/**
 * Generate JWT Token for Jitsi
 * 
 * POST /api/jitsi/generate-token
 * 
 * Body:
 * {
 *   "roomName": "ataraxia-123-1699999999",
 *   "userName": "Dr. Sarah Johnson",
 *   "userEmail": "sarah@example.com",
 *   "userId": "therapist-123",
 *   "isModerator": true,
 *   "appointmentId": "appt-456",
 *   "expiresIn": 7200
 * }
 */
app.post('/api/jitsi/generate-token', (req, res) => {
  try {
    const {
      roomName,
      userName,
      userEmail,
      userId,
      isModerator = false,
      appointmentId,
      expiresIn = 7200, // 2 hours default
    } = req.body;

    // Validate required fields
    if (!roomName || !userName) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'roomName and userName are required fields',
      });
    }

    console.log(`🔐 Generating JWT token for: ${userName} (room: ${roomName})`);

    // Create JWT payload according to Jitsi spec
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      // User context
      context: {
        user: {
          name: userName,
          email: userEmail || undefined,
          id: userId || undefined,
        },
        group: 'ataraxia-wellness', // Your organization identifier
      },
      
      // JWT standard claims
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      
      // Timing
      exp: now + expiresIn, // Expiration time
      nbf: now - 10,        // Not before (10 seconds ago for clock skew)
      
      // Jitsi-specific
      moderator: isModerator,
    };

    // Sign the token
    const token = jwt.sign(payload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    const response = {
      token,
      roomName,
      joinUrl: `https://${JITSI_CONFIG.domain}/${roomName}`,
      expiresAt: new Date((now + expiresIn) * 1000).toISOString(),
    };

    console.log(`✅ Token generated successfully`);
    console.log(`   Room: ${roomName}`);
    console.log(`   User: ${userName} (${isModerator ? 'moderator' : 'participant'})`);
    console.log(`   Expires: ${response.expiresAt}`);

    res.json(response);

  } catch (error) {
    console.error('❌ Error generating JWT:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate token',
      details: error.message,
    });
  }
});

/**
 * Create Room with tokens for multiple participants
 * 
 * POST /api/jitsi/create-room
 * 
 * Body:
 * {
 *   "appointmentId": "appt-456",
 *   "therapistId": "therapist-123",
 *   "clientId": "client-789",
 *   "scheduledStartTime": "2024-11-14T10:00:00Z",
 *   "callType": "video"
 * }
 */
app.post('/api/jitsi/create-room', (req, res) => {
  try {
    const {
      appointmentId,
      therapistId,
      clientId,
      scheduledStartTime,
      callType = 'video',
    } = req.body;

    console.log(`🏠 Creating room for appointment: ${appointmentId}`);

    // Generate unique room name
    const roomName = `ataraxia-${appointmentId}-${Date.now()}`;
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 7200; // 2 hours

    // Generate therapist token (moderator)
    const therapistPayload = {
      context: {
        user: {
          name: 'Therapist', // In production, fetch from database
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
          name: 'Client', // In production, fetch from database
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

    const response = {
      roomName,
      joinUrl: `https://${JITSI_CONFIG.domain}/${roomName}`,
      therapistToken,
      clientToken,
    };

    console.log(`✅ Room created: ${roomName}`);

    res.json(response);

  } catch (error) {
    console.error('❌ Error creating room:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create room',
      details: error.message,
    });
  }
});

/**
 * Validate JWT Token
 * 
 * POST /api/jitsi/validate-token
 * 
 * Body:
 * {
 *   "token": "eyJhbGci..."
 * }
 */
app.post('/api/jitsi/validate-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'token is required',
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JITSI_CONFIG.appSecret, {
      algorithms: ['HS256'],
    });

    console.log(`✅ Token validated for room: ${decoded.room}`);

    res.json({
      valid: true,
      roomName: decoded.room,
      userName: decoded.context?.user?.name,
      isModerator: decoded.moderator,
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });

  } catch (error) {
    console.log(`❌ Token validation failed: ${error.message}`);
    res.json({
      valid: false,
      error: error.message,
    });
  }
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Jitsi Backend Test Server');
  console.log('========================================\n');
  console.log(`✅ Server running on: http://localhost:${PORT}`);
  console.log(`📡 Jitsi Domain: ${JITSI_CONFIG.domain}`);
  console.log(`🔑 App ID: ${JITSI_CONFIG.appId}`);
  console.log(`🔐 Secret: ${JITSI_CONFIG.appSecret.substring(0, 10)}...`);
  console.log('\n📚 Available Endpoints:');
  console.log(`   GET  /health`);
  console.log(`   POST /api/jitsi/generate-token`);
  console.log(`   POST /api/jitsi/create-room`);
  console.log(`   POST /api/jitsi/validate-token`);
  console.log('\n🧪 Test with curl:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log('\n⚠️  Remember to update JITSI_CONFIG with your actual values!');
  console.log('========================================\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});
