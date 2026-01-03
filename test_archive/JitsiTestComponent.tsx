/**
 * Jitsi External API Test Component
 * Tests the integration with meet.bedrockhealthsolutions.com
 */

import React, { useState } from 'react';
import { Video, Phone, Users, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { VideoCallRoom } from './VideoCallRoom';
import { generateJitsiJWT } from '../services/jitsiService';
import { JITSI_CONFIG } from '../config/jitsi';

export function JitsiTestComponent() {
  const [inCall, setInCall] = useState(false);
  const [roomName, setRoomName] = useState('test-room-' + Date.now());
  const [userName, setUserName] = useState('Test User');
  const [userEmail, setUserEmail] = useState('test@bedrockhealthsolutions.com');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [error, setError] = useState<string>('');

  const generateToken = async () => {
    setIsGeneratingToken(true);
    setError('');
    
    try {
      const token = await generateJitsiJWT(
        roomName,
        userName,
        userEmail,
        'test-user-id',
        true, // isModerator
        undefined
      );
      
      setJwtToken(token);
      console.log('✅ JWT Token generated successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate token';
      setError(errorMsg);
      console.error('❌ Token generation error:', err);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const startCall = async () => {
    if (JITSI_CONFIG.useJWT && !jwtToken) {
      await generateToken();
    }
    setInCall(true);
  };

  if (inCall) {
    return (
      <VideoCallRoom
        roomName={roomName}
        userName={userName}
        userEmail={userEmail}
        userId="test-user-id"
        participantIds={['test-user-id']}
        participantNames={{ 'test-user-id': userName }}
        onClose={() => setInCall(false)}
        callType={callType}
        jwtToken={jwtToken || undefined}
        isModerator={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl text-gray-900 dark:text-white">
            🎥 Jitsi External API Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing integration with meet.bedrockhealthsolutions.com
          </p>
        </div>

        {/* Configuration Info */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Settings className="w-5 h-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Domain:</span>
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
                <span className="text-blue-700 dark:text-blue-300">App ID:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {JITSI_CONFIG.jwtAppId}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Backend URL:</span>
                <span className="ml-2 text-blue-900 dark:text-blue-100">
                  {JITSI_CONFIG.backendUrl}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Video Call Settings
            </CardTitle>
            <CardDescription>
              Configure your test call parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
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

            {/* JWT Token Section */}
            {JITSI_CONFIG.useJWT && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>JWT Token</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateToken}
                    disabled={isGeneratingToken}
                  >
                    {isGeneratingToken ? 'Generating...' : 'Generate Token'}
                  </Button>
                </div>
                {jwtToken && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-xs text-green-700 dark:text-green-300 break-all">
                      {jwtToken.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Start Call Button */}
            <Button
              onClick={startCall}
              className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white rounded-full"
              size="lg"
            >
              {callType === 'video' ? (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Start Video Call
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Start Audio Call
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-900 dark:text-green-100">
                ✅ External API Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <div>• Full programmatic control</div>
              <div>• Event listeners (join, leave, etc.)</div>
              <div>• Execute commands (mute, video, etc.)</div>
              <div>• Custom UI integration</div>
              <div>• Call logging & analytics</div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-100">
                🔧 What to Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <div>• Video/Audio toggle</div>
              <div>• Screen sharing</div>
              <div>• Chat functionality</div>
              <div>• Custom branding</div>
              <div>• JWT authentication</div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="text-orange-900 dark:text-orange-100">
              📋 Testing Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
            <ol className="list-decimal list-inside space-y-1">
              <li>Ensure your Jitsi server is running at meet.bedrockhealthsolutions.com</li>
              <li>If using JWT, make sure your backend API is running on port 3001</li>
              <li>Click "Generate Token" to create a JWT (if JWT is enabled)</li>
              <li>Click "Start Video Call" to join the meeting</li>
              <li>Open another browser/tab with the same room name to test multi-participant</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
