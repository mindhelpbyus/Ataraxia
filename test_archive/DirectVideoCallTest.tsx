/**
 * Direct Video Call Test Component
 * Creates video sessions by sending user details directly to backend
 * No authentication required - for testing purposes
 */

import React, { useState } from 'react';
import { Video, Phone, Users, Settings, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { VideoCallRoom } from './VideoCallRoom';
import { toast } from 'sonner@2.0.3';
import { JITSI_CONFIG } from '../config/jitsi';
import { post } from '../api/client';

// Test user presets matching your Firebase users
const TEST_USERS = {
  admin: {
    name: 'System Administrator',
    email: 'admin3@bedrock.test',
    role: 'admin' as const,
    userId: 'admin-3-id'
  },
  therapist1: {
    name: 'Dr. Sarah Mitchell',
    email: 'therapist3@bedrock.test',
    role: 'therapist' as const,
    userId: 'therapist-3-id'
  },
  therapist2: {
    name: 'Dr. James Chen',
    email: 'therapist4@bedrock.test',
    role: 'therapist' as const,
    userId: 'therapist-4-id'
  },
  therapist3: {
    name: 'System Administrator',
    email: 'admin3@bedrock.test',
    role: 'therapist' as const,
    userId: 'admin-3-id'
  }
};

interface VideoSession {
  sessionId: string;
  roomName: string;
  jwt: string;
  isModerator: boolean;
  joinUrl: string;
}

export function DirectVideoCallTest() {
  // User selection
  const [selectedUser, setSelectedUser] = useState<keyof typeof TEST_USERS>('therapist1');
  
  // Session details
  const [sessionTitle, setSessionTitle] = useState('Test Video Session');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // Video call state
  const [inCall, setInCall] = useState(false);
  const [videoSession, setVideoSession] = useState<VideoSession | null>(null);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'checking' | 'available' | 'unavailable'>('unknown');
  const [useTestMode, setUseTestMode] = useState(false);

  const currentUser = TEST_USERS[selectedUser];

  // Check backend health
  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`${JITSI_CONFIG.backendUrl}/health`);
      if (response.ok) {
        setBackendStatus('available');
        toast.success('Backend is available!');
      } else {
        setBackendStatus('unavailable');
        toast.error('Backend returned error. Check if the service is properly deployed.');
      }
    } catch (error) {
      setBackendStatus('unavailable');
      toast.error('Backend is not accessible. You can use Test Mode instead.');
    }
  };

  const createVideoSession = async () => {
    setIsCreating(true);
    
    try {
      console.log('📞 Creating video session with user details...');
      console.log('User:', currentUser);
      console.log('Backend URL:', `${JITSI_CONFIG.backendUrl}/api/sessions/create-with-user`);

      // Create session by sending user details directly to backend
      const response = await post<VideoSession>('/api/sessions/create-with-user', {
        // User details
        user: {
          userId: currentUser.userId,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        },
        // Session details
        session: {
          title: sessionTitle,
          description: 'Test session created from Direct Video Call Test',
          scheduledStartTime: new Date().toISOString(),
          duration: 60 // 60 minutes
        },
        // Session settings
        settings: {
          waitingRoomEnabled: false,
          recordingEnabled: true,
          chatEnabled: true,
          screenSharingEnabled: true,
          requireApproval: false
        }
      }, false); // Don't require authentication

      setVideoSession(response);

      console.log('✅ Session created:', {
        sessionId: response.sessionId,
        roomName: response.roomName,
        isModerator: response.isModerator
      });

      toast.success('Video session created successfully!');

      // Automatically join the call
      setInCall(true);
    } catch (error: any) {
      console.error('❌ Failed to create session:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
        toast.error('Cannot connect to backend. The endpoint may not exist yet. Try Test Mode instead.', {
          duration: 5000
        });
      } else if (error.status === 404) {
        toast.error('Backend endpoint not found. The /api/sessions/create-with-user route needs to be implemented.');
      } else if (error.status === 403) {
        toast.error('Permission denied. Only therapists and admins can create sessions.');
      } else {
        toast.error(`Failed to create session: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Create test session without backend (for testing Jitsi only)
  const createTestSession = () => {
    console.log('🧪 Creating test session (no backend)...');
    
    const sessionId = `test-${Date.now()}`;
    const roomName = `ataraxia-test-${sessionId}`;
    
    const mockSession: VideoSession = {
      sessionId: sessionId,
      roomName: roomName,
      jwt: '', // Empty JWT - will use Jitsi without authentication
      isModerator: true,
      joinUrl: `https://${JITSI_CONFIG.domain}/${roomName}`
    };

    setVideoSession(mockSession);
    setInCall(true);
    
    toast.success('Test session created! (No backend/JWT - testing Jitsi interface only)', {
      duration: 5000
    });
  };

  const handleEndCall = () => {
    setInCall(false);
    setVideoSession(null);
    toast.success('Call ended');
  };

  // If in call, show video interface
  if (inCall && videoSession) {
    return (
      <VideoCallRoom
        roomName={videoSession.roomName}
        userName={currentUser.name}
        userEmail={currentUser.email}
        userId={currentUser.userId}
        participantIds={[currentUser.userId]}
        participantNames={{ [currentUser.userId]: currentUser.name }}
        onClose={handleEndCall}
        callType={callType}
        jwtToken={videoSession.jwt}
        isModerator={videoSession.isModerator}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl text-gray-900 dark:text-white">
            🎥 Direct Video Call Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create video sessions by sending user details to backend
          </p>
        </div>

        {/* Current User Display */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Users className="w-5 h-5" />
              Selected User
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Name:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {currentUser.name}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Email:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {currentUser.email}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Role:</span>
                <Badge className="ml-2" variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser.role}
                </Badge>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">User ID:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100 text-xs">
                  {currentUser.userId.substring(0, 12)}...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Test User
            </CardTitle>
            <CardDescription>
              Choose which user to create the video session as
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
                <option value="admin">👑 System Administrator (admin3@bedrock.test)</option>
                <option value="therapist1">👩‍⚕️ Dr. Sarah Mitchell (therapist3@bedrock.test)</option>
                <option value="therapist2">👨‍⚕️ Dr. James Chen (therapist4@bedrock.test)</option>
                <option value="therapist3">👑 System Administrator (admin3@bedrock.test)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Session Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Session Configuration
            </CardTitle>
            <CardDescription>
              Configure your video session details
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
                  <option value="video">📹 Video Call</option>
                  <option value="audio">🎤 Audio Only</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ All test users have <strong>moderator</strong> privileges (therapist/admin roles)
              </p>
            </div>

            <Button
              onClick={createVideoSession}
              disabled={isCreating}
              className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-full"
              size="lg"
            >
              {isCreating ? (
                'Creating Session...'
              ) : callType === 'video' ? (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Create & Join Video Session (With Backend)
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Create & Join Audio Session (With Backend)
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-950 px-2 text-gray-500">
                  Or
                </span>
              </div>
            </div>

            <Button
              onClick={createTestSession}
              variant="outline"
              className="w-full rounded-full"
              size="lg"
            >
              <Video className="w-5 h-5 mr-2" />
              Test Jitsi Only (No Backend Required)
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Test mode: Joins Jitsi without JWT authentication (for testing UI only)
            </p>
          </CardContent>
        </Card>

        {/* Backend Health Check */}
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Settings className="w-5 h-5" />
              Backend Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-700 dark:text-purple-300">Status:</span>
                {backendStatus === 'unknown' && (
                  <Badge variant="outline">Unknown</Badge>
                )}
                {backendStatus === 'checking' && (
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                    Checking...
                  </Badge>
                )}
                {backendStatus === 'available' && (
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100">
                    ✅ Available
                  </Badge>
                )}
                {backendStatus === 'unavailable' && (
                  <Badge className="bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
                    ❌ Unavailable
                  </Badge>
                )}
              </div>
              <Button
                onClick={checkBackendHealth}
                disabled={backendStatus === 'checking'}
                variant="outline"
                size="sm"
              >
                Check Backend
              </Button>
            </div>
            
            {backendStatus === 'unavailable' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ Backend not accessible. The <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900 rounded">/api/sessions/create-with-user</code> endpoint may not be implemented yet. Use <strong>Test Mode</strong> to try Jitsi without backend.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Info */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Settings className="w-5 h-5" />
              Backend Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Backend URL:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100 text-xs break-all">
                  {JITSI_CONFIG.backendUrl}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Endpoint:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  /api/sessions/create-with-user
                </span>
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-900 dark:text-green-100">
              📋 How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <div>
              <strong>1. Select User:</strong> Choose which user to create the session as
            </div>
            <div>
              <strong>2. Configure Session:</strong> Set title and call type
            </div>
            <div>
              <strong>3. Send to Backend:</strong> POST request with user details
            </div>
            <div>
              <strong>4. Backend Creates Session:</strong> Verifies role from Firestore
            </div>
            <div>
              <strong>5. JWT Generated:</strong> Backend generates Jitsi JWT token
            </div>
            <div>
              <strong>6. Join Call:</strong> Video interface loads with JWT
            </div>
          </CardContent>
        </Card>

        {/* Backend Request Example */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">
              📤 Backend Request Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
{`POST ${JITSI_CONFIG.backendUrl}/api/sessions/create-with-user

Body:
{
  "user": {
    "userId": "${currentUser.userId}",
    "name": "${currentUser.name}",
    "email": "${currentUser.email}",
    "role": "${currentUser.role}"
  },
  "session": {
    "title": "${sessionTitle}",
    "description": "Test session",
    "scheduledStartTime": "2024-01-15T10:00:00Z",
    "duration": 60
  },
  "settings": {
    "waitingRoomEnabled": false,
    "recordingEnabled": true,
    "chatEnabled": true,
    "screenSharingEnabled": true
  }
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Backend Response Example */}
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">
              📥 Expected Backend Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
{`{
  "sessionId": "session-123abc",
  "roomName": "ataraxia-session-123abc-1234567890",
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "isModerator": true,
  "joinUrl": "https://meet.bedrockhealthsolutions.com/ataraxia-..."
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
