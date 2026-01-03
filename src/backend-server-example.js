/**
 * Jitsi JWT Backend Server Example
 * For Bedrock Health Solutions - meet.bedrockhealthsolutions.com
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install dependencies: npm install express cors jsonwebtoken dotenv
 * 2. Create a .env file with your configuration (see below)
 * 3. Run the server: node backend-server-example.js
 * 4. Update JITSI_CONFIG.backendUrl in /config/jitsi.ts to point to this server
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Jitsi Configuration from environment variables
const JITSI_CONFIG = {
  appId: process.env.JITSI_APP_ID || 'bedrock-video-conferencing',
  appSecret: process.env.JITSI_APP_SECRET || 'demo-jitsi-secret-key-for-testing',
  domain: process.env.JITSI_DOMAIN || 'meet.bedrockhealthsolutions.com',
  roomPrefix: process.env.JITSI_ROOM_PREFIX || 'bedrock-',
};

/**
 * Generate JWT token for Jitsi room
 * POST /api/jitsi/generate-token
 * 
 * Request Body:
 * {
 *   roomName: string,
 *   userName: string,
 *   userEmail?: string,
 *   userId?: string,
 *   isModerator?: boolean,
 *   appointmentId?: string,
 *   expiresIn?: number (seconds, default 7200)
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
        error: 'Missing required fields: roomName and userName are required',
      });
    }

    // Generate JWT payload
    const payload = {
      context: {
        user: {
          name: userName,
          email: userEmail || undefined,
          id: userId || undefined,
          avatar: undefined,
        },
        features: {
          recording: isModerator,
          livestreaming: isModerator,
        },
      },
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      moderator: isModerator,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    };

    // Sign the token
    const token = jwt.sign(payload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    // Generate join URL
    const joinUrl = `https://${JITSI_CONFIG.domain}/${roomName}?jwt=${token}`;

    console.log(`✅ Token generated for ${userName} in room ${roomName} (moderator: ${isModerator})`);

    res.json({
      token,
      roomName,
      joinUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error('❌ Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      message: error.message,
    });
  }
});

/**
 * Create a new Jitsi room for an appointment
 * POST /api/jitsi/create-room
 * 
 * Request Body:
 * {
 *   appointmentId: string,
 *   therapistId: string,
 *   clientId: string,
 *   scheduledStartTime: string,
 *   callType: 'video' | 'audio'
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

    // Generate room name
    const roomName = `${JITSI_CONFIG.roomPrefix}${appointmentId}-${Date.now()}`;

    // Generate tokens for both therapist (moderator) and client
    const therapistPayload = {
      context: {
        user: {
          name: 'Therapist',
          id: therapistId,
        },
      },
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      moderator: true,
      exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
    };

    const clientPayload = {
      context: {
        user: {
          name: 'Client',
          id: clientId,
        },
      },
      aud: JITSI_CONFIG.appId,
      iss: JITSI_CONFIG.appId,
      sub: JITSI_CONFIG.domain,
      room: roomName,
      moderator: false,
      exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours
    };

    const therapistToken = jwt.sign(therapistPayload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    const clientToken = jwt.sign(clientPayload, JITSI_CONFIG.appSecret, {
      algorithm: 'HS256',
    });

    const joinUrl = `https://${JITSI_CONFIG.domain}/${roomName}`;

    console.log(`✅ Room created for appointment ${appointmentId}`);

    res.json({
      roomName,
      joinUrl,
      therapistToken,
      clientToken,
    });
  } catch (error) {
    console.error('❌ Error creating room:', error);
    res.status(500).json({
      error: 'Failed to create room',
      message: error.message,
    });
  }
});

/**
 * Validate a JWT token
 * POST /api/jitsi/validate-token
 * 
 * Request Body:
 * {
 *   token: string
 * }
 */
app.post('/api/jitsi/validate-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JITSI_CONFIG.appSecret, {
      algorithms: ['HS256'],
    });

    console.log('✅ Token validated successfully');

    res.json({
      valid: true,
      decoded,
    });
  } catch (error) {
    console.error('❌ Token validation failed:', error.message);
    res.json({
      valid: false,
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      domain: JITSI_CONFIG.domain,
      appId: JITSI_CONFIG.appId,
      roomPrefix: JITSI_CONFIG.roomPrefix,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       BEDROCK JITSI JWT BACKEND SERVER - RUNNING 🚀           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📡 Jitsi Domain: ${JITSI_CONFIG.domain}`);
  console.log(`🔑 App ID: ${JITSI_CONFIG.appId}`);
  console.log(`🏷️  Room Prefix: ${JITSI_CONFIG.roomPrefix}`);
  console.log('\n📋 Available Endpoints:');
  console.log('   POST /api/jitsi/generate-token');
  console.log('   POST /api/jitsi/create-room');
  console.log('   POST /api/jitsi/validate-token');
  console.log('   GET  /health');
  console.log('\n💡 Make sure to update JITSI_CONFIG.backendUrl in your frontend');
  console.log('   to point to: http://localhost:' + PORT);
  console.log('\n');
});

/**
 * ENVIRONMENT VARIABLES (.env file):
 * 
 * # Jitsi Configuration (Self-Hosted - GoDaddy Domain)
 * JITSI_APP_ID=bedrock-video-conferencing
 * JITSI_APP_SECRET=demo-jitsi-secret-key-for-testing
 * JITSI_DOMAIN=meet.bedrockhealthsolutions.com
 * JITSI_ROOM_PREFIX=bedrock-
 * PORT=3001
 * 
 * IMPORTANT NOTES:
 * 1. Replace JITSI_APP_SECRET with your actual secret from Jitsi server config
 * 2. The APP_ID must match the 'app_id' in your Jitsi server JWT configuration
 * 3. The APP_SECRET must match the 'app_secret' in your Jitsi server JWT configuration
 * 4. For production, use environment variables, not hardcoded values
 * 5. Enable HTTPS in production (use a reverse proxy like nginx)
 */
