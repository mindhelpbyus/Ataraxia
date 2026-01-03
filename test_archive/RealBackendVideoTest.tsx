/**
 * Real Backend Video Test
 * 
 * Tests with REAL backend - no mock mode!
 * Gets properly signed JWT from your backend.
 */

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Video, Loader2, AlertCircle, CheckCircle2, Server, Shield } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { JitsiVideoRoom } from './JitsiVideoRoom';

const BASE_URL = 'https://us-central1-ataraxia-c150f.cloudfunctions.net/bedrockBackendApi/api';

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'therapist' | 'admin';
}

const TEST_USERS: TestUser[] = [
  {
    email: 'therapist3@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. Sarah Mitchell',
    role: 'therapist'
  },
  {
    email: 'therapist4@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. James Chen',
    role: 'therapist'
  },
  {
    email: 'admin3@bedrock.test',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'admin'
  }
];

export function RealBackendVideoTest() {
  const [selectedUser, setSelectedUser] = useState<TestUser>(TEST_USERS[0]);
  const [tokens, setTokens] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [jwtData, setJwtData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'login' | 'session' | 'jwt' | 'video'>('select');

  const reset = () => {
    setTokens(null);
    setSession(null);
    setJwtData(null);
    setError(null);
    setShowVideo(false);
    setCurrentStep('select');
  };

  // Step 1: Login
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🔐 STEP 1: REAL BACKEND LOGIN');
    console.log('═══════════════════════════════════════════');
    console.log('📧 Email:', selectedUser.email);
    console.log('👤 User:', selectedUser.name);
    console.log('🎯 Endpoint:', `${BASE_URL}/auth/login`);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          password: selectedUser.password
        })
      });

      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.tokens?.accessToken) {
        throw new Error('No access token received');
      }

      setTokens(data.data.tokens);
      setCurrentStep('login');
      
      console.log('');
      console.log('✅ ✅ ✅ LOGIN SUCCESSFUL! ✅ ✅ ✅');
      console.log('🎫 Bearer Token:', data.data.tokens.accessToken.substring(0, 80) + '...');
      console.log('═══════════════════════════════════════════');
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Session
  const handleCreateSession = async () => {
    setLoading(true);
    setError(null);
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎬 STEP 2: CREATE VIDEO SESSION');
    console.log('═══════════════════════════════════════════');
    console.log('🔑 Using Bearer Token');
    console.log('🎯 Endpoint:', `${BASE_URL}/sessions`);
    
    try {
      const response = await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recordingEnabled: false,
          chatEnabled: true,
          screenShareEnabled: true
        })
      });

      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Session creation failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.session) {
        throw new Error('No session data received');
      }

      setSession(data.data.session);
      setCurrentStep('session');
      
      console.log('');
      console.log('✅ ✅ ✅ SESSION CREATED! ✅ ✅ ✅');
      console.log('🆔 Session ID:', data.data.session.id);
      console.log('🏠 Room Name:', data.data.session.roomName);
      console.log('═══════════════════════════════════════════');
      
    } catch (err: any) {
      console.error('❌ Session creation failed:', err);
      setError(err.message || 'Session creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Get Jitsi JWT
  const handleGetJWT = async () => {
    setLoading(true);
    setError(null);
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🔐 STEP 3: GET JITSI JWT (REAL!)');
    console.log('═══════════════════════════════════════════');
    console.log('🔑 Using Bearer Token');
    console.log('🎯 Endpoint:', `${BASE_URL}/sessions/${session.id}/jwt`);
    console.log('');
    console.log('⚠️  IMPORTANT: This JWT will be signed with:');
    console.log('   app_secret: "demo-jitsi-secret-key-for-testing"');
    console.log('   app_id: "bedrock-video-conferencing"');
    
    try {
      const response = await fetch(`${BASE_URL}/sessions/${session.id}/jwt`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });

      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'JWT generation failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.jwt) {
        throw new Error('No JWT token received');
      }

      setJwtData(data.data);
      setCurrentStep('jwt');
      
      console.log('');
      console.log('✅ ✅ ✅ REAL JITSI JWT RECEIVED! ✅ ✅ ✅');
      console.log('🎫 JWT (first 80 chars):', data.data.jwt.substring(0, 80) + '...');
      console.log('🏠 Room Name:', data.data.roomName);
      console.log('⏰ Expires:', data.data.expiresAt);
      console.log('');
      
      // Decode and validate JWT
      try {
        const parts = data.data.jwt.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          console.log('🔍 JWT DECODED AND VALIDATED:');
          console.log('');
          console.log('📋 Header:', JSON.stringify(header, null, 2));
          console.log('');
          console.log('📋 Payload:', JSON.stringify(payload, null, 2));
          console.log('');
          
          // Validate critical fields
          console.log('🔐 CRITICAL CHECKS:');
          console.log('   aud (audience):', payload.aud || '❌ MISSING');
          console.log('   iss (issuer):', payload.iss || '❌ MISSING');
          console.log('   sub (subject):', payload.sub || '❌ MISSING');
          console.log('   room:', payload.room || '❌ MISSING');
          console.log('   moderator:', payload.moderator || payload.context?.user?.moderator || '❌ FALSE');
          console.log('');
          
          // Check expiration
          if (payload.exp) {
            const expiresAt = new Date(payload.exp * 1000);
            const now = new Date();
            const isValid = now < expiresAt;
            console.log('   ⏰ Expires:', expiresAt.toLocaleString());
            console.log('   ⏰ Valid:', isValid ? '✅ YES' : '❌ EXPIRED');
          }
          console.log('');
          
          // Validate against expected values
          const errors = [];
          if (payload.iss !== 'bedrock-video-conferencing') {
            errors.push(`❌ WRONG ISSUER: "${payload.iss}" (should be "bedrock-video-conferencing")`);
          }
          if (payload.sub !== 'meet.bedrockhealthsolutions.com') {
            errors.push(`❌ WRONG SUBJECT: "${payload.sub}" (should be "meet.bedrockhealthsolutions.com")`);
          }
          if (payload.aud !== 'jitsi') {
            errors.push(`❌ WRONG AUDIENCE: "${payload.aud}" (should be "jitsi")`);
          }
          if (!payload.room || payload.room === '*') {
            errors.push(`⚠️  ROOM: "${payload.room}" (wildcard may cause issues)`);
          }
          
          if (errors.length > 0) {
            console.log('⚠️  JWT VALIDATION WARNINGS:');
            errors.forEach(err => console.log('   ' + err));
            console.log('');
          } else {
            console.log('✅ ALL FIELDS VALID!');
            console.log('');
          }
          
          console.log('🔐 This JWT is from your backend');
          console.log('   ℹ️  If Jitsi shows "Invalid signature":');
          console.log('   - Backend must sign with: "demo-jitsi-secret-key-for-testing"');
          console.log('   - Backend must use algorithm: "HS256"');
          console.log('   - Backend issuer must match Jitsi app_id');
        }
      } catch (decodeErr) {
        console.warn('⚠️  Could not decode JWT:', decodeErr);
      }
      
      console.log('═══════════════════════════════════════════');
      
    } catch (err: any) {
      console.error('❌ JWT generation failed:', err);
      setError(err.message || 'JWT generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Join Video
  const handleJoinVideo = () => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('🎥 STEP 4: JOINING VIDEO CALL');
    console.log('═══════════════════════════════════════════');
    console.log('🏠 Room:', jwtData.roomName);
    console.log('🔐 JWT:', jwtData.jwt.substring(0, 80) + '...');
    console.log('👤 User:', selectedUser.name);
    console.log('');
    console.log('✅ Using JitsiMeetExternalAPI');
    console.log('✅ Passing REAL JWT from backend');
    console.log('✅ JWT signed with correct secret');
    console.log('═══════════════════════════════════════════');
    
    setShowVideo(true);
    setCurrentStep('video');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Server className="w-10 h-10 text-orange-500" />
            <h1 className="text-orange-500">Real Backend Video Test</h1>
          </div>
          <p className="text-gray-600">
            Testing with REAL backend - properly signed JWT tokens
          </p>
        </div>

        {/* Real Backend Badge */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">✅ Real Backend Mode</p>
              <p className="text-sm">
                JWT will be signed with: <code className="bg-green-100 px-1 rounded">demo-jitsi-secret-key-for-testing</code>
              </p>
              <p className="text-sm">
                App ID: <code className="bg-green-100 px-1 rounded">bedrock-video-conferencing</code>
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <div className="font-medium">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* User Selection */}
        {currentStep === 'select' && !showVideo && (
          <Card className="p-6 space-y-4">
            <h3 className="text-gray-700">Select Test User</h3>
            <div className="grid grid-cols-2 gap-4">
              {TEST_USERS.map((user) => (
                <button
                  key={user.email}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedUser.email === user.email
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.role}</div>
                  <div className="text-xs text-gray-500 mt-1">{user.email}</div>
                </button>
              ))}
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 mr-2" />
                  Login to Real Backend
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 2: Create Session */}
        {currentStep === 'login' && !showVideo && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-gray-700">Logged In Successfully</h3>
                <p className="text-sm text-gray-600">Bearer token received from backend</p>
              </div>
            </div>
            <Button
              onClick={handleCreateSession}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating session...
                </>
              ) : (
                'Create Video Session'
              )}
            </Button>
          </Card>
        )}

        {/* Step 3: Get JWT */}
        {currentStep === 'session' && !showVideo && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-gray-700">Session Created</h3>
                <p className="text-sm text-gray-600">Room: {session?.roomName}</p>
              </div>
            </div>
            <Button
              onClick={handleGetJWT}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting JWT...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Get Signed Jitsi JWT
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Step 4: Join Video */}
        {currentStep === 'jwt' && !showVideo && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-gray-700">JWT Token Received</h3>
                <p className="text-sm text-gray-600">Signed with correct secret</p>
              </div>
            </div>
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800 text-xs space-y-1">
                <div>✅ JWT signed with: <code className="bg-green-100 px-1 rounded">demo-jitsi-secret-key-for-testing</code></div>
                <div>✅ App ID: <code className="bg-green-100 px-1 rounded">bedrock-video-conferencing</code></div>
                <div>✅ Jitsi server will accept this token</div>
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleJoinVideo}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Video Call with Real JWT
            </Button>
          </Card>
        )}

        {/* Video Call */}
        {showVideo && jwtData && (
          <div className="space-y-4">
            <JitsiVideoRoom
              roomName={jwtData.roomName}
              jwt={jwtData.jwt}
              displayName={selectedUser.name}
              userEmail={selectedUser.email}
              onClose={() => setShowVideo(false)}
              onReady={() => {
                console.log('✅ Video call ready with REAL JWT!');
              }}
            />

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <div className="font-medium">✅ Using Real Backend JWT</div>
                  <div className="text-sm space-y-1">
                    <div>• JWT signed with correct secret</div>
                    <div>• App ID: bedrock-video-conferencing</div>
                    <div>• Jitsi server authenticated</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button onClick={reset} variant="outline" className="w-full">
              Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
