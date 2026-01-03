/**
 * Secure Video Call Test Component
 * Tests video calling with Firebase authentication and role verification
 */

import React, { useState, useEffect } from 'react';
import { Video, Phone, Users, Settings, LogOut, UserCheck, Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { VideoCallRoom } from './VideoCallRoom';
import { BackendDiagnostic } from './BackendDiagnostic';
import { toast } from 'sonner@2.0.3';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getTherapistProfile } from '../services/firestoreService';
import { 
  verifyUserRoleFromFirestore,
  hasModeratorPrivileges,
  RoleVerificationResult 
} from '../services/roleVerification';
import {
  createSecureSession,
  joinSecureSession,
  SecureSessionResponse,
  SecureJoinResponse
} from '../api/secureSessions';
import { JITSI_CONFIG } from '../config/jitsi';

// Test user credentials from your Firebase setup
const TEST_USERS = {
  admin: {
    email: 'admin3@bedrock.test',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'admin'
  },
  therapist1: {
    email: 'therapist3@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. Sarah Mitchell',
    role: 'therapist'
  },
  therapist2: {
    email: 'therapist4@bedrock.test',
    password: 'Therapist123!',
    name: 'Dr. James Chen',
    role: 'therapist'
  },
  therapist3: {
    email: 'admin3@bedrock.test',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'therapist'
  }
};

interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  role: 'therapist' | 'admin' | 'client' | 'client';
  videoRole: 'moderator' | 'participant';
  verified: boolean;
}

export function SecureVideoCallTest() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Session state
  const [inCall, setInCall] = useState(false);
  const [sessionData, setSessionData] = useState<SecureSessionResponse | null>(null);
  const [joinData, setJoinData] = useState<SecureJoinResponse | null>(null);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState<keyof typeof TEST_USERS>('therapist1');
  const [sessionTitle, setSessionTitle] = useState('Test Video Session');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // UI state
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [roleVerification, setRoleVerification] = useState<RoleVerificationResult | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadUserData(user.uid, user.email || '', user.displayName || '');
      } else {
        setCurrentUser(null);
        setRoleVerification(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string, email: string, displayName: string) => {
    try {
      // Verify role from Firestore (source of truth)
      const verification = await verifyUserRoleFromFirestore(uid, false);
      
      setCurrentUser({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: verification.role,
        videoRole: verification.videoRole,
        verified: verification.verified
      });
      
      setRoleVerification(verification);
      
      console.log('✅ User loaded:', {
        uid,
        email,
        role: verification.role,
        videoRole: verification.videoRole,
        source: verification.source
      });
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      toast.error('Failed to load user profile');
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const user = TEST_USERS[selectedUser];
      
      console.log('🔐 Logging in as:', user.email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      
      await loadUserData(
        userCredential.user.uid,
        user.email,
        user.name
      );
      
      toast.success(`Logged in as ${user.name}`);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      toast.error(`Login failed: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setRoleVerification(null);
      setSessionData(null);
      setJoinData(null);
      setInCall(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const createSession = async () => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    setIsCreatingSession(true);
    try {
      console.log('📞 Creating secure session...');
      
      // Create session with role verification
      const response = await createSecureSession({
        title: sessionTitle,
        description: 'Test session created from Secure Video Call Test',
        participants: [
          {
            userId: currentUser.uid,
            role: 'moderator', // Will be verified from Firestore
            name: currentUser.displayName,
            email: currentUser.email
          }
        ],
        settings: {
          waitingRoomEnabled: false,
          recordingEnabled: true,
          chatEnabled: true,
          screenSharingEnabled: true,
          requireApproval: false
        }
      });

      setSessionData(response);
      
      console.log('✅ Session created:', {
        sessionId: response.session.id,
        roomName: response.session.roomName,
        userRole: response.roleVerification.role,
        videoRole: response.roleVerification.videoRole
      });

      toast.success('Session created successfully!');

      // Automatically join the session
      await joinCreatedSession(response.session.id);
    } catch (error: any) {
      console.error('❌ Failed to create session:', error);
      
      if (error.code === 'INSUFFICIENT_PERMISSIONS') {
        toast.error('You do not have permission to create sessions. Only therapists and admins can create sessions.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Cannot reach backend. Click "Check Backend Status" below.');
        setShowDiagnostic(true);
      } else {
        toast.error(`Failed to create session: ${error.message}`);
      }
      
      // Show detailed error in console with helpful instructions
      console.error('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-weight: bold;');
      console.error('%c❌ BACKEND CONNECTION FAILED', 'color: #ef4444; font-size: 16px; font-weight: bold;');
      console.error('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444; font-weight: bold;');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      console.log('%c\n📋 QUICK FIX:', 'color: #F97316; font-size: 14px; font-weight: bold;');
      console.log('%c\n1. Deploy backend files to Firebase Functions', 'color: #333; font-size: 12px;');
      console.log('%c   cd /path/to/ataraxia-c150f/functions', 'color: #666; font-size: 11px; font-family: monospace;');
      console.log('%c   cp /path/to/backend/*.js ./', 'color: #666; font-size: 11px; font-family: monospace;');
      console.log('%c   npm install cors express jsonwebtoken', 'color: #666; font-size: 11px; font-family: monospace;');
      console.log('%c\n2. Enable localhost in CORS', 'color: #333; font-size: 12px;');
      console.log('%c   In .env.production: ENABLE_TEST_LOGIN=true', 'color: #666; font-size: 11px; font-family: monospace;');
      console.log('%c\n3. Deploy', 'color: #333; font-size: 12px;');
      console.log('%c   firebase deploy --only functions:bedrockBackend', 'color: #666; font-size: 11px; font-family: monospace;');
      console.log('%c\n📖 Read QUICK_FIX.md for detailed instructions', 'color: #3b82f6; font-size: 12px;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'color: #ef4444; font-weight: bold;');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const joinCreatedSession = async (sessionId: string) => {
    if (!currentUser) return;

    try {
      console.log('🚪 Joining session...');
      
      const response = await joinSecureSession({
        sessionId,
        userName: currentUser.displayName,
        userEmail: currentUser.email
      });

      setJoinData(response);
      
      console.log('✅ Joined session:', {
        sessionId: response.session.id,
        jwt: response.jwt.substring(0, 20) + '...',
        isModerator: response.isModerator,
        videoRole: response.roleVerification.videoRole
      });

      // Start the video call
      setInCall(true);
    } catch (error: any) {
      console.error('❌ Failed to join session:', error);
      toast.error(`Failed to join session: ${error.message}`);
    }
  };

  // If in call, show the video room
  if (inCall && sessionData && joinData) {
    return (
      <VideoCallRoom
        roomName={sessionData.session.roomName}
        userName={currentUser!.displayName}
        userEmail={currentUser!.email}
        userId={currentUser!.uid}
        participantIds={[currentUser!.uid]}
        participantNames={{ [currentUser!.uid]: currentUser!.displayName }}
        onClose={() => setInCall(false)}
        callType={callType}
        jwtToken={joinData.jwt}
        isModerator={joinData.isModerator}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl text-gray-900 dark:text-white">
            🔐 Secure Video Call Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing with Firebase Authentication & Role Verification
          </p>
        </div>

        {/* Backend Status Alert (auto-shown on error) */}
        {showDiagnostic && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <p className="font-medium">⚠️ Cannot connect to backend</p>
                <p className="text-sm">
                  Your backend needs to be deployed or CORS needs to be configured for localhost.
                </p>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/QUICK_FIX.md', '_blank')}
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    View Quick Fix Guide
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Current User Status */}
        {currentUser ? (
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-green-900 dark:text-green-100">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Logged In
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-green-300 dark:border-green-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">Name:</span>
                  <span className="ml-2 text-green-900 dark:text-green-100">
                    {currentUser.displayName}
                  </span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Email:</span>
                  <span className="ml-2 text-green-900 dark:text-green-100">
                    {currentUser.email}
                  </span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">User Role:</span>
                  <Badge className="ml-2" variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                    {currentUser.role}
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Video Role:</span>
                  <Badge 
                    className="ml-2" 
                    variant={currentUser.videoRole === 'moderator' ? 'default' : 'secondary'}
                  >
                    {currentUser.videoRole === 'moderator' ? '👑 Moderator' : '👤 Participant'}
                  </Badge>
                </div>
              </div>
              
              {roleVerification && (
                <div className="pt-3 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                    <Shield className="w-3 h-3" />
                    <span>Role verified from Firestore ({roleVerification.source})</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Test User
              </CardTitle>
              <CardDescription>
                Login with one of the test users from your Firebase database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userSelect">Test User</Label>
                <select
                  id="userSelect"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value as keyof typeof TEST_USERS)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                >
                  <option value="admin">System Administrator (admin3@bedrock.test)</option>
                  <option value="therapist1">Dr. Sarah Mitchell (therapist3@bedrock.test)</option>
                  <option value="therapist2">Dr. James Chen (therapist4@bedrock.test)</option>
                  <option value="therapist3">System Administrator (admin3@bedrock.test)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Email:</strong> {TEST_USERS[selectedUser].email}<br />
                  <strong>Password:</strong> {TEST_USERS[selectedUser].password}<br />
                  <strong>Expected Role:</strong> {TEST_USERS[selectedUser].role}
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-full"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Session Creation (only if logged in) */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Create Video Session
              </CardTitle>
              <CardDescription>
                Create a secure session with role verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTitle">Session Title</Label>
                  <Input
                    id="sessionTitle"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Enter session title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callType">Call Type</Label>
                  <select
                    id="callType"
                    value={callType}
                    onChange={(e) => setCallType(e.target.value as 'video' | 'audio')}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Only</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {currentUser.videoRole === 'moderator' ? (
                    <>
                      ✅ You have <strong>moderator</strong> privileges and can create sessions.
                    </>
                  ) : (
                    <>
                      ⚠️ You have <strong>participant</strong> role. Only moderators (therapists/admins) can create sessions.
                    </>
                  )}
                </p>
              </div>

              <Button
                onClick={createSession}
                disabled={isCreatingSession}
                className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-full"
                size="lg"
              >
                {isCreatingSession ? (
                  'Creating Session...'
                ) : callType === 'video' ? (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Create & Join Video Session
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Create & Join Audio Session
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                variant="outline"
                className="w-full"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {showDiagnostic ? 'Hide Backend Status' : 'Check Backend Status'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Backend Diagnostic */}
        {showDiagnostic && <BackendDiagnostic />}

        {/* Configuration Info */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Settings className="w-5 h-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Jitsi Domain:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {JITSI_CONFIG.domain}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">JWT Enabled:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {JITSI_CONFIG.useJWT ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Backend URL:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {JITSI_CONFIG.backendUrl}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Auth Provider:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  Firebase Auth
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              🔐 Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <div>✅ Firestore role verification (source of truth)</div>
            <div>✅ Secure session creation with moderator check</div>
            <div>✅ JWT token generation with backend</div>
            <div>✅ Role-based access control</div>
            <div>✅ Security audit logging</div>
            <div>✅ Failed attempt tracking</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
