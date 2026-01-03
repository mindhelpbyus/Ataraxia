/**
 * Bedrock Backend - Firebase Cloud Function
 * Complete example with CORS configuration
 * 
 * DEPLOYMENT:
 * 1. Copy this to your Firebase Functions directory
 * 2. Copy cors-config.js to the same directory
 * 3. Update your .env.production with ENABLE_TEST_LOGIN=true for localhost CORS
 * 4. Deploy: firebase deploy --only functions:bedrockBackend
 */

const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const { createCorsMiddleware } = require('./cors-config');

// ============================================
// Initialize Firebase Admin
// ============================================
admin.initializeApp();
const db = admin.firestore();

// ============================================
// Express App Setup
// ============================================
const app = express();

// Apply CORS middleware (uses your environment variables)
app.use(createCorsMiddleware());

// Body parser
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'present' : 'missing'
  });
  next();
});

// ============================================
// Authentication Middleware
// ============================================
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found in database'
      });
    }

    // Attach user to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}

// ============================================
// Role Verification Helper
// ============================================
function getVideoRole(userRole) {
  // Map user roles to video roles
  const roleMapping = {
    'therapist': 'moderator',
    'admin': 'moderator',
    'client': 'participant',
    'client': 'participant'
  };
  
  return roleMapping[userRole] || 'participant';
}

// ============================================
// Jitsi JWT Generation
// ============================================
function generateJitsiToken(session, user, isModerator) {
  const payload = {
    context: {
      user: {
        id: user.uid,
        name: user.name || user.email,
        email: user.email,
        avatar: user.avatar || '',
        moderator: isModerator ? 'true' : 'false'
      },
      features: {
        livestreaming: isModerator ? 'true' : 'false',
        recording: isModerator ? 'true' : 'false',
        'outbound-call': 'false',
        'sip-outbound-call': 'false',
        transcription: 'false'
      }
    },
    aud: process.env.JITSI_APP_ID || 'bedrock-video-conferencing',
    iss: process.env.JITSI_APP_ID || 'bedrock-video-conferencing',
    sub: process.env.JITSI_DOMAIN || 'meet.bedrockhealthsolutions.com',
    room: session.roomName,
    exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 hours
    moderator: isModerator
  };

  const secret = process.env.JITSI_APP_SECRET || 'demo-jitsi-secret-key-for-testing';
  
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'bedrock-backend',
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// ============================================
// Session Endpoints
// ============================================

/**
 * POST /api/sessions
 * Create a new video session
 */
app.post('/api/sessions', authenticate, async (req, res) => {
  try {
    const { title, description, scheduledStartTime, duration, participants } = req.body;
    const user = req.user;

    // Verify user has moderator privileges
    const userRole = user.role || 'client';
    const videoRole = getVideoRole(userRole);
    
    if (videoRole !== 'moderator') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only therapists and admins can create sessions'
      });
    }

    // Generate unique session ID and room name
    const sessionId = db.collection('sessions').doc().id;
    const roomName = `${process.env.JITSI_ROOM_PREFIX || 'bedrock-'}${sessionId}`;

    // Create session document
    const session = {
      id: sessionId,
      roomName: roomName,
      title: title || 'Video Session',
      description: description || '',
      createdBy: user.uid,
      createdByName: user.name || user.email,
      scheduledStartTime: scheduledStartTime || new Date().toISOString(),
      duration: duration || 60,
      status: 'scheduled',
      participants: participants || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    await db.collection('sessions').doc(sessionId).set(session);

    console.log('Session created:', {
      sessionId,
      roomName,
      createdBy: user.uid,
      role: userRole
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create session'
    });
  }
});

/**
 * POST /api/sessions/:sessionId/join
 * Join an existing session
 */
app.post('/api/sessions/:sessionId/join', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    // Get session from Firestore
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Session not found'
      });
    }

    const session = sessionDoc.data();

    // Determine if user is moderator
    const userRole = user.role || 'client';
    const videoRole = getVideoRole(userRole);
    const isModerator = videoRole === 'moderator';

    // Generate Jitsi JWT token
    const jitsiToken = generateJitsiToken(session, user, isModerator);

    // Create participant record
    const participantId = db.collection('participants').doc().id;
    const participant = {
      id: participantId,
      sessionId: sessionId,
      userId: user.uid,
      name: user.name || user.email,
      email: user.email,
      role: videoRole,
      isModerator: isModerator,
      joinedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save participant
    await db.collection('participants').doc(participantId).set(participant);

    // Update session participants count
    await db.collection('sessions').doc(sessionId).update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('User joined session:', {
      sessionId,
      userId: user.uid,
      role: userRole,
      isModerator
    });

    res.json({
      sessionId: session.id,
      roomName: session.roomName,
      jwt: jitsiToken,
      isModerator: isModerator,
      participantId: participantId,
      joinUrl: `https://${process.env.JITSI_DOMAIN || 'meet.bedrockhealthsolutions.com'}/${session.roomName}`
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to join session'
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
app.get('/api/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Session not found'
      });
    }

    res.json(sessionDoc.data());
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get session'
    });
  }
});

/**
 * GET /api/sessions
 * List sessions for the authenticated user
 */
app.get('/api/sessions', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Get sessions created by or including this user
    const sessionsSnapshot = await db.collection('sessions')
      .where('createdBy', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());

    res.json({
      sessions: sessions,
      total: sessions.length
    });
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to list sessions'
    });
  }
});

// ============================================
// Error Handling
// ============================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ============================================
// Export Cloud Function
// ============================================
exports.bedrockBackend = functions
  .region('us-central1')
  .https.onRequest(app);
