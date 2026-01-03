/**
 * Create Session Test Component
 * 
 * Tests the production authentication flow:
 * 1. Login to get access token (POST /auth/login)
 * 2. Create session with Bearer token (POST /sessions)
 * 3. Get Jitsi JWT from backend (GET /sessions/{sessionId}/jwt)
 * 4. Initialize Jitsi with backend's JWT
 * 
 * ⚠️ NO MOCK MODE - Always uses real backend API
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Video, Loader2, AlertCircle, CheckCircle2, LogIn, Lock } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { JitsiVideoRoom } from './JitsiVideoRoom';
import { login } from '../api/auth';
import { createSession, getSessionJWT } from '../api/sessions';
import { API_BASE_URL } from '../api/client';

// ✅ Using centralized API client - automatically handles dev proxy and production URLs
const JITSI_DOMAIN = 'meet.bedrockhealthsolutions.com';

// ✅ ALWAYS uses backend API - No mock mode!

// Demo users (NO passwords - backend uses userId + email + role)
interface TestUser {
  userId: string;
  email: string;
  name: string;
  role: 'therapist' | 'admin';
  description: string;
}

const TEST_USERS: TestUser[] = [
  // ✅ NEW: Registered test therapists (verified in backend)
  {
    userId: 'USR-THERAPIST-001',
    email: 'therapist001@example.com',
    name: 'Dr. Emily Johnson',
    role: 'therapist',
    description: '✅ Backend Verified - Family Therapy Specialist'
  },
  {
    userId: 'USR-THERAPIST-002',
    email: 'therapist002@example.com',
    name: 'Dr. Michael Brown',
    role: 'therapist',
    description: '✅ Backend Verified - Trauma Therapy Specialist'
  },
  {
    userId: 'USR-THERAPIST-003',
    email: 'therapist003@example.com',
    name: 'Dr. Sophia Davis',
    role: 'therapist',
    description: '✅ Backend Verified - Child Psychology Specialist'
  },
  {
    userId: 'USR-THERAPIST-004',
    email: 'therapist004@example.com',
    name: 'Dr. David Wilson',
    role: 'therapist',
    description: '✅ Backend Verified - Addiction Counseling Specialist'
  },
  {
    userId: 'USR-THERAPIST-005',
    email: 'therapist005@example.com',
    name: 'Dr. Olivia Martinez',
    role: 'therapist',
    description: '✅ Backend Verified - Couples Therapy Specialist'
  },
  // Original demo users (may not be in backend)
  {
    userId: 'therapist-3-id',
    email: 'therapist3@bedrock.test',
    name: 'Dr. Sarah Mitchell',
    role: 'therapist',
    description: '⚠️ Legacy Demo User - May not exist in backend'
  },
  {
    userId: 'USR-THERAPIST-2025',
    email: 'newtest@example.com',
    name: 'Test User',
    role: 'therapist',
    description: '✅ Backend Verified - Original test user'
  }
];

interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface SessionData {
  id: string;
  roomName?: string;
  createdAt?: string;
}

interface JWTData {
  jwt: string;
  roomName: string;
  expiresAt: string;
}

type TestStep = 'select-user' | 'logged-in' | 'session-created' | 'jwt-received' | 'in-call';

export function CreateSessionTest() {
  const [selectedUser, setSelectedUser] = useState<TestUser>(TEST_USERS[0]);
  const [currentStep, setCurrentStep] = useState<TestStep>('select-user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tokens, setTokens] = useState<LoginTokens | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [jwtData, setJwtData] = useState<JWTData | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const reset = () => {
    setCurrentStep('select-user');
    setTokens(null);
    setSession(null);
    setJwtData(null);
    setShowVideo(false);
    setError(null);
  };

  // Step 1: Login
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🔐 STEP 1: LOGGING IN');
      console.log('═══════════════════════════════════════════');
      console.log('👤 User ID:', selectedUser.userId);
      console.log('📧 Email:', selectedUser.email);
      console.log('🎭 Role:', selectedUser.role);
      console.log('📍 API Base:', API_BASE_URL);
      console.log('ℹ️  Backend does NOT use passwords - only userId + email + role');
      console.log('');

      // ✅ Use centralized API client (automatically handles proxy in dev)
      const response = await login({
        userId: selectedUser.userId,
        email: selectedUser.email,
        role: selectedUser.role
      });

      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('✅ ✅ ✅ BEARER TOKEN RECEIVED! ✅ ✅ ✅');
      console.log('═══════════════════════════════════════════');
      console.log('🎫 Access Token (Bearer):');
      console.log('   First 80 chars:', response.tokens.accessToken.substring(0, 80) + '...');
      console.log('   Length:', response.tokens.accessToken.length);
      console.log('');
      console.log('🔄 Refresh Token:');
      console.log('   First 80 chars:', response.tokens.refreshToken?.substring(0, 80) + '...' || 'N/A');
      console.log('   Length:', response.tokens.refreshToken?.length || 0);
      console.log('');
      console.log('✅ Login successful! Token saved in state.');
      console.log('✅ Ready to proceed to Step 2: Create Session');
      console.log('');
      
      // Store tokens in component state for display
      setTokens(response.tokens);
      setCurrentStep('logged-in');

    } catch (err: any) {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.error('❌ LOGIN FAILED');
      console.log('═══════════════════════════════════════════');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.log('═══════════════════════════════════════════');
      console.log('');
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Session
  const handleCreateSession = async () => {
    if (!tokens) {
      setError('No access token. Please login first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🎬 STEP 2: CREATE SESSION');
      console.log('═══════════════════════════════════════════');
      console.log('📍 API Base:', API_BASE_URL);
      console.log('');

      // ✅ Use centralized API client (automatically sends Bearer token)
      const sessionData = await createSession({
        title: `Video Call - ${selectedUser.name}`,
        description: 'Test video call session',
        scheduledStartTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Start in 5 minutes
        duration: 60, // 60 minutes
        participants: [
          {
            userId: selectedUser.userId, // ✅ Use full userId, not email prefix
            role: 'moderator',
            email: selectedUser.email,
            name: selectedUser.name
          },
          {
            // ✅ Add a client/participant (MUST be different from therapist)
            userId: 'USR-CLIENT-2025',
            role: 'participant',
            email: 'client@example.com',
            name: 'Test Client'
          }
        ],
        settings: {
          recordingEnabled: false,
          chatEnabled: true,
          screenSharingEnabled: true
        }
      });

      console.log('═══════════════════════════════════════════');
      console.log('✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅');
      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('📋 APPOINTMENT vs SESSION IDs:');
      console.log('   📋 Appointment ID:', sessionData.appointmentId || 'N/A', '(for appointment CRUD)');
      console.log('   🎥 Session ID:', sessionData.id, '(for video/JWT) ← USING THIS!');
      console.log('');
      if (sessionData.roomName) {
        console.log('🏠 Room Name:', sessionData.roomName);
      }
      console.log('📅 Created At:', sessionData.createdAt || 'N/A');
      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('✅ Bearer token authentication worked!');
      console.log('✅ Session ID extracted correctly from backend response');
      console.log('✅ Moving to Step 3 (Get JWT)...');
      console.log('');
      
      setSession(sessionData);
      setCurrentStep('session-created');

    } catch (err: any) {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.error('❌ SESSION CREATION FAILED');
      console.log('═══════════════════════════════════════════');
      console.error('Error type:', err.constructor.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error status:', err.status);
      console.error('Error details:', err.details);
      console.error('Full error:', err);
      console.log('═══════════════════════════════════════════');
      console.log('');
      
      // Build detailed error message
      let errorMsg = err.message || 'Failed to create session';
      if (err.status) {
        errorMsg = `${errorMsg} (Status: ${err.status})`;
      }
      if (err.code) {
        errorMsg = `${errorMsg} [${err.code}]`;
      }
      if (err.details && err.details.message) {
        errorMsg = `${err.details.message} (${err.status || 'Error'})`;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Get Jitsi JWT Token
  const handleGetJWT = async () => {
    if (!tokens || !session) {
      setError('Missing tokens or session. Please start over.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🎫 STEP 3: GET JITSI JWT TOKEN');
      console.log('═══════════════════════════════════════════');
      console.log('📍 API Base:', API_BASE_URL);
      console.log('📍 Endpoint:', `GET /sessions/${session.id}/jwt`);
      console.log('');
      console.log('🔑 Using Session ID (NOT Appointment ID):');
      console.log('   🎥 Session ID:', session.id, '← Correct!');
      if (session.appointmentId) {
        console.log('   📋 Appointment ID:', session.appointmentId, '← NOT using this for JWT');
      }
      console.log('');
      console.log('📝 Note: GET request with no body - sessionId in URL only');
      console.log('');

      // ✅ Use centralized API client (automatically sends Bearer token)
      // ✅ Using session.id which contains the sessionId from backend
      const jwtResponse = await getSessionJWT(session.id);

      const jwtData = {
        jwt: jwtResponse.jwt,
        roomName: session.roomName || `session-${session.id}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      };

      console.log('═══════════════════════════════════════════');
      console.log('✅ ✅ ✅ JITSI JWT TOKEN RECEIVED! ✅ ✅ ✅');
      console.log('═══════════════════════════════════════════');
      console.log('🎫 Jitsi JWT:');
      console.log('   First 80 chars:', jwtData.jwt.substring(0, 80) + '...');
      console.log('   Length:', jwtData.jwt.length);
      console.log('');
      console.log('🏠 Room Name:', jwtData.roomName);
      console.log('⏰ Expires At:', jwtData.expiresAt);
      console.log('═══════════════════════════════════════════');
      console.log('');
      console.log('✅ Backend JWT authentication worked!');
      console.log('✅ Ready to start video call with backend JWT');
      console.log('');
      
      setJwtData(jwtData);
      setCurrentStep('jwt-received');

    } catch (err: any) {
      console.error('❌ Join session error:', err);
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Join Video Call
  const handleJoinCall = () => {
    setShowVideo(true);
    setCurrentStep('in-call');
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'select-user': return 1;
      case 'logged-in': return 2;
      case 'session-created': return 3;
      case 'jwt-received': return 4;
      case 'in-call': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Video className="w-10 h-10 text-orange-500" />
            <h1 className="text-orange-500">Production Video Calling Test</h1>
          </div>
          <p className="text-gray-600">
            Complete authentication flow with Bearer tokens
          </p>
          <p className="text-gray-500">
            Base: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{API_BASE_URL}</code>
          </p>
        </div>

        {/* Production API Banner */}
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">✅ Production API Mode</p>
              <p className="text-sm">
                All API calls go to <code className="bg-green-100 px-1 rounded">{API_BASE_URL}</code> {API_BASE_URL.startsWith('/') ? '(via dev proxy)' : '(direct)'}
              </p>
              <p className="text-sm">
                JWT tokens are <strong>always</strong> generated and signed by backend (never in frontend).
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Progress Indicator */}
        <Card className="p-6">
          <div className="space-y-3">
            <h2 className="text-gray-700">Progress: Step {getStepNumber()} of 4</h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step < getStepNumber() ? 'bg-green-500' :
                    step === getStepNumber() ? 'bg-orange-500' :
                    'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span className={getStepNumber() >= 1 ? 'text-green-700' : ''}>1. Login</span>
              <span className={getStepNumber() >= 2 ? 'text-green-700' : ''}>2. Create Session</span>
              <span className={getStepNumber() >= 3 ? 'text-green-700' : ''}>3. Get JWT</span>
              <span className={getStepNumber() >= 4 ? 'text-green-700' : ''}>4. Video Call</span>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <div>{error}</div>
                <div className="text-red-700 text-xs">
                  Check browser console for detailed error information
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: Select User & Login */}
        {currentStep === 'select-user' && !showVideo && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                1
              </div>
              <h2 className="text-gray-700">Select User & Login</h2>
            </div>

            <div className="space-y-3">
              {TEST_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => setSelectedUser(user)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedUser.email === user.email
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-900">{user.name}</div>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-gray-600">{user.email}</div>
                      <div className="text-gray-500">{user.description}</div>
                    </div>
                    {selectedUser.email === user.email && (
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Login with {selectedUser.name}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 2: Create Session */}
        {currentStep === 'logged-in' && !showVideo && (
          <Card className="p-6 space-y-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-green-800">Login Successful! ✅</h3>
            </div>

            <div className="text-green-700 space-y-2">
              <p>Access token received. Now create a video session.</p>
              <div className="text-xs space-y-1 bg-green-100 p-3 rounded">
                <div><span className="font-medium">Token:</span> {tokens?.accessToken.substring(0, 40)}...</div>
                <div><span className="font-medium">Expires:</span> {tokens?.expiresIn}</div>
              </div>
            </div>

            <Button
              onClick={handleCreateSession}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Create Video Session
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 3: Get JWT */}
        {currentStep === 'session-created' && !showVideo && (
          <Card className="p-6 space-y-4 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
              <h3 className="text-blue-800">Session Created! ✅</h3>
            </div>

            <div className="text-blue-700 space-y-2">
              <p>Now get the Jitsi JWT token from backend.</p>
              <div className="text-xs space-y-1 bg-blue-100 p-3 rounded">
                <div><span className="font-medium">Session ID:</span> {session?.id}</div>
                {session?.roomName && (
                  <div><span className="font-medium">Room:</span> {session.roomName}</div>
                )}
                <div className="mt-2 pt-2 border-t border-blue-200 text-blue-600">
                  <div>→ GET /sessions/{session?.id}/jwt</div>
                  <div className="text-[10px] mt-1">Backend will sign JWT with proper secret</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGetJWT}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting JWT from Backend...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Get JWT Token
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 4: Join Call */}
        {currentStep === 'jwt-received' && !showVideo && (
          <Card className="p-6 space-y-4 border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
              <h3 className="text-purple-800">JWT Token Received! 🎉</h3>
            </div>

            <div className="text-purple-700 space-y-2">
              <p>Everything is ready. Join the video call!</p>
              <div className="text-xs space-y-1 bg-purple-100 p-3 rounded">
                <div><span className="font-medium">Room:</span> {jwtData?.roomName}</div>
                <div><span className="font-medium">JWT:</span> {jwtData?.jwt.substring(0, 40)}...</div>
                <div><span className="font-medium">Expires:</span> {jwtData?.expiresAt && new Date(jwtData.expiresAt).toLocaleString()}</div>
              </div>
            </div>

            <Button
              onClick={handleJoinCall}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call
            </Button>
          </Card>
        )}

        {/* Video Call using JitsiMeetExternalAPI */}
        {showVideo && jwtData && (
          <div className="space-y-4">
            <JitsiVideoRoom
              roomName={jwtData.roomName}
              jwt={jwtData.jwt}
              displayName={selectedUser.name}
              userEmail={selectedUser.email}
              onClose={() => setShowVideo(false)}
              onReady={() => {
                console.log('🎉 Video call ready!');
                console.log('   Using JitsiMeetExternalAPI');
                console.log('   Room:', jwtData.roomName);
                console.log('   Authenticated with JWT from Bearer token flow');
              }}
              onParticipantJoined={(participant) => {
                console.log('👤 New participant:', participant);
              }}
              onParticipantLeft={(participant) => {
                console.log('👋 Participant left:', participant);
              }}
            />

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <div className="font-medium">✅ Video call using JitsiMeetExternalAPI</div>
                  <div className="text-sm space-y-1 text-green-700">
                    <div>• Room: <code className="bg-green-100 px-1 rounded">{jwtData.roomName}</code></div>
                    <div>• Session: <code className="bg-green-100 px-1 rounded">{session?.id}</code></div>
                    <div>• JWT Authentication: ✅ Active</div>
                    <div>• Bearer Token Flow: ✅ Complete</div>
                  </div>
                  <div className="text-xs text-green-600 pt-2">
                    Full API control • Better than iframe • Production-ready
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={reset} variant="outline" className="flex-1">
                🔄 Start Over (Test Again)
              </Button>
            </div>
          </div>
        )}

        {/* How It Works */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-blue-800 mb-3">How It Works (Production Flow)</h3>
          <div className="text-blue-700 space-y-2 text-xs">
            <div><strong>1. POST /auth/login</strong></div>
            <div className="ml-4">Body: {`{ email, password }`}</div>
            <div className="ml-4">Returns: {`{ accessToken, refreshToken }`}</div>
            
            <div className="pt-2"><strong>2. POST /sessions</strong></div>
            <div className="ml-4">Headers: Authorization: Bearer {`{accessToken}`}</div>
            <div className="ml-4">Returns: {`{ session: { id, roomName } }`}</div>
            
            <div className="pt-2"><strong>3. GET /sessions/{`{id}`}/jwt</strong></div>
            <div className="ml-4">Headers: Authorization: Bearer {`{accessToken}`}</div>
            <div className="ml-4">Returns: {`{ jwt, roomName, expiresAt }`}</div>
            
            <div className="pt-2"><strong>4. Join Jitsi</strong></div>
            <div className="ml-4">URL: https://{JITSI_DOMAIN}/{`{room}`}?jwt={`{jwt}`}</div>
          </div>
        </Card>

        {/* Debug */}
        <Card className="p-6 bg-gray-50">
          <details>
            <summary className="cursor-pointer text-gray-700">Debug Info</summary>
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div>Current Step: {currentStep}</div>
              <div>Has Token: {tokens ? '✅' : '❌'}</div>
              <div>Has Session: {session ? '✅' : '❌'}</div>
              <div>Has JWT: {jwtData ? '✅' : '❌'}</div>
              {session && <div>Session ID: {session.id}</div>}
            </div>
          </details>
        </Card>
      </div>
    </div>
  );
}
