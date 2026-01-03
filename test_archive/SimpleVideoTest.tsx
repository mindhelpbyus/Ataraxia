/**
 * Simple Video Test Component
 * Creates and joins Jitsi video sessions without requiring frontend login
 * Uses the /api/sessions/create-with-user endpoint
 */

import React, { useState } from 'react';
import { Video, Phone, Users, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { JITSI_CONFIG } from '../config/jitsi';

// Test users with real Firebase UIDs
const TEST_USERS = [
  {
    userId: 'therapist-3',
    name: 'Dr. Sarah Mitchell',
    email: 'therapist3@bedrock.test',
    role: 'therapist' as const,
    description: 'Therapist (will be moderator)'
  },
  {
    userId: 'therapist-4',
    name: 'Dr. James Chen',
    email: 'therapist4@bedrock.test',
    role: 'therapist' as const,
    description: 'Therapist (will be moderator)'
  },
  {
    userId: 'admin-3',
    name: 'System Administrator',
    email: 'admin3@bedrock.test',
    role: 'admin' as const,
    description: 'Admin (will be moderator)'
  },
  {
    userId: 'test-client-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'client' as const,
    description: 'Client (will be participant)'
  }
];

interface SessionResponse {
  sessionId: string;
  roomName: string;
  jwt: string;
  isModerator: boolean;
  joinUrl: string;
}

export function SimpleVideoTest() {
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [sessionTitle, setSessionTitle] = useState('Test Video Session');
  const [isCreating, setIsCreating] = useState(false);
  const [sessionData, setSessionData] = useState<SessionResponse | null>(null);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedUser = TEST_USERS[selectedUserIndex];

  const createSession = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const requestBody = {
        user: {
          userId: selectedUser.userId,
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role
        },
        session: {
          title: sessionTitle,
          description: 'Testing video calling functionality',
          scheduledStartTime: new Date().toISOString(),
          duration: 60
        },
        settings: {
          waitingRoomEnabled: false,
          recordingEnabled: true,
          chatEnabled: true,
          screenSharingEnabled: true,
          requireApproval: false
        }
      };

      console.log('📤 Creating session with request:', requestBody);

      const response = await fetch(
        `${JITSI_CONFIG.backendUrl}/api/sessions/create-with-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || 
          errorData?.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: SessionResponse = await response.json();
      console.log('✅ Session created:', data);

      setSessionData(data);
      toast.success('Video session created successfully!');
      
      // Auto-join the session
      setTimeout(() => joinSession(data), 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error creating session:', err);
      setError(errorMessage);
      toast.error(`Failed to create session: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  const joinSession = (data: SessionResponse) => {
    if (!data) return;

    console.log('🚀 Joining video session:', data.roomName);
    setInCall(true);

    // Load Jitsi External API
    const script = document.createElement('script');
    script.src = 'https://meet.bedrockhealthsolutions.com/external_api.js';
    script.async = true;
    script.onload = () => {
      initJitsiMeet(data);
    };
    script.onerror = () => {
      toast.error('Failed to load Jitsi External API');
      setInCall(false);
    };
    document.body.appendChild(script);
  };

  const initJitsiMeet = (data: SessionResponse) => {
    const container = document.getElementById('jitsi-container');
    if (!container) {
      toast.error('Video container not found');
      return;
    }

    // @ts-ignore - JitsiMeetExternalAPI is loaded from external script
    const api = new window.JitsiMeetExternalAPI(JITSI_CONFIG.domain, {
      roomName: data.roomName,
      parentNode: container,
      jwt: data.jwt,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#1a1a1a',
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'profile',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'feedback',
          'stats',
          'shortcuts',
          'tileview',
          'videobackgroundblur',
          'download',
          'help',
          'mute-everyone'
        ]
      },
      userInfo: {
        displayName: selectedUser.name,
        email: selectedUser.email
      }
    });

    // Event listeners
    api.on('videoConferenceJoined', () => {
      console.log('✅ Joined video conference');
      toast.success(`Joined as ${selectedUser.name}`);
    });

    api.on('videoConferenceLeft', () => {
      console.log('👋 Left video conference');
      setInCall(false);
      api.dispose();
    });

    api.on('readyToClose', () => {
      setInCall(false);
      api.dispose();
    });
  };

  const leaveSession = () => {
    setInCall(false);
    setSessionData(null);
  };

  if (inCall && sessionData) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-white">{sessionData.roomName}</h3>
              <p className="text-gray-400 text-sm">
                Joined as {selectedUser.name} ({sessionData.isModerator ? 'Moderator' : 'Participant'})
              </p>
            </div>
          </div>
          <Button
            onClick={leaveSession}
            variant="destructive"
            size="sm"
          >
            Leave Call
          </Button>
        </div>

        {/* Video Container */}
        <div id="jitsi-container" className="flex-1" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl text-gray-900">
            🎥 Simple Video Test
          </h1>
          <p className="text-gray-600">
            Create and join Jitsi video sessions without login
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>No login required!</strong> Select a test user, create a session, and join instantly.
            The backend verifies user roles from Firestore automatically.
          </AlertDescription>
        </Alert>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create Video Session</CardTitle>
            <CardDescription>
              Using endpoint: <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                POST {JITSI_CONFIG.backendUrl}/api/sessions/create-with-user
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Selection */}
            <div className="space-y-3">
              <Label>Select Test User</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TEST_USERS.map((user, index) => (
                  <button
                    key={user.userId}
                    onClick={() => setSelectedUserIndex(index)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedUserIndex === index
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900">{user.name}</p>
                          {selectedUserIndex === index && (
                            <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.description}</p>
                      </div>
                      <Badge
                        variant={user.role === 'client' ? 'secondary' : 'default'}
                        className={
                          user.role === 'client'
                            ? ''
                            : 'bg-orange-100 text-orange-700 border-orange-200'
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Title */}
            <div className="space-y-2">
              <Label htmlFor="session-title">Session Title</Label>
              <Input
                id="session-title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title"
              />
            </div>

            {/* Selected User Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedUser.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>User ID:</strong> <code className="text-xs bg-white px-2 py-0.5 rounded">{selectedUser.userId}</code>
              </p>
              <p className="text-sm text-gray-600">
                <strong>Expected Role:</strong>{' '}
                {selectedUser.role === 'therapist' || selectedUser.role === 'admin' ? (
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    Moderator
                  </Badge>
                ) : (
                  <Badge variant="secondary">Participant</Badge>
                )}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Session Data Display */}
            {sessionData && !inCall && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Session Created!</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Session ID: <code className="bg-white px-2 py-0.5 rounded">{sessionData.sessionId}</code></p>
                    <p>Room: <code className="bg-white px-2 py-0.5 rounded">{sessionData.roomName}</code></p>
                    <p>Role: <strong>{sessionData.isModerator ? 'Moderator' : 'Participant'}</strong></p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={createSession}
                disabled={isCreating || !sessionTitle.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Create & Join Session
                  </>
                )}
              </Button>

              {sessionData && !inCall && (
                <Button
                  onClick={() => joinSession(sessionData)}
                  variant="outline"
                  size="lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Rejoin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Jitsi Server:</p>
                <p className="text-gray-900 break-all">{JITSI_CONFIG.domain}</p>
              </div>
              <div>
                <p className="text-gray-600">Backend API:</p>
                <p className="text-gray-900 break-all">{JITSI_CONFIG.backendUrl}</p>
              </div>
              <div>
                <p className="text-gray-600">JWT App ID:</p>
                <p className="text-gray-900">{JITSI_CONFIG.jwtAppId}</p>
              </div>
              <div>
                <p className="text-gray-600">Authentication:</p>
                <p className="text-gray-900">None (user details in request body)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
