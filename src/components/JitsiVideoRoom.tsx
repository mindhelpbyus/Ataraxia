/**
 * Jitsi Video Room Component
 * 
 * Uses JitsiMeetExternalAPI to embed video calling with full control.
 * Integrates with Bearer token authentication flow.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Video, Mic, MicOff, VideoOff, Users, Settings, X, Maximize2, Minimize2 } from 'lucide-react';
import { logger } from '../services/secureLogger';


// Jitsi External API types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiVideoRoomProps {
  roomName: string;
  jwt: string;
  userName?: string;
  userEmail?: string;
  displayName?: string;
  onClose?: () => void;
  onReady?: () => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
}

export function JitsiVideoRoom({
  roomName,
  jwt,
  userName,
  userEmail,
  displayName,
  onClose,
  onReady,
  onParticipantJoined,
  onParticipantLeft
}: JitsiVideoRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Load Jitsi External API script
    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if already loaded
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.bedrockhealthsolutions.com/external_api.js';
        script.async = true;
        script.onload = () => {
          logger.info('✅ Jitsi External API script loaded');
          resolve();
        };
        script.onerror = () => {
          logger.error('❌ Failed to load Jitsi External API script');
          reject(new Error('Failed to load Jitsi script'));
        };
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.info('🎬 Initializing Jitsi Video Room...');
        logger.info('   Room:', roomName);
        logger.info('   JWT:', jwt.substring(0, 40) + '...');
        logger.info('   User:', displayName || userName || 'Guest');

        // Decode JWT to check if user is moderator
        let isModerator = false;
        try {
          const parts = jwt.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            isModerator = payload.moderator === true || payload.context?.user?.moderator === true;
            logger.info('   🔑 Moderator status from JWT:', isModerator);
            
            // Check expiration
            if (payload.exp) {
              const expiresAt = new Date(payload.exp * 1000);
              logger.info('   ⏰ JWT expires at:', expiresAt.toLocaleString());
              
              if (Date.now() >= payload.exp * 1000) {
                logger.error('   ❌ JWT HAS EXPIRED!');
                throw new Error('JWT token has expired. Please refresh and try again.');
              } else {
                logger.info('   ✅ JWT is valid');
              }
            }
          }
        } catch (jwtErr) {
          logger.warn('⚠️ Could not decode JWT:', jwtErr);
        }

        // Load script
        await loadJitsiScript();

        // Wait for container to be ready
        if (!containerRef.current) {
          throw new Error('Container not ready');
        }

        logger.info('🔧 Creating JitsiMeetExternalAPI instance...');
        logger.info('   📋 Config: prejoinPageEnabled=false, skipPrejoin=true');

        // Initialize Jitsi Meet API
        const domain = 'meet.bedrockhealthsolutions.com';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          jwt: jwt,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,          // ← Disable pre-join screen
            skipPrejoin: true,                  // ← Also skip prejoin
            disableDeepLinking: true,
            hideConferenceSubject: false,
            requireDisplayName: false,          // ← Don't require name entry
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
              'invite',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'videobackgroundblur',
              'download',
              'help',
              'mute-everyone',
              'security'
            ],
          },
          userInfo: {
            displayName: displayName || userName || 'Guest',
            email: userEmail
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        logger.info('✅ Jitsi API instance created');

        // Event listeners
        api.addEventListener('videoConferenceJoined', (event: any) => {
          logger.info('✅ Joined video conference:', event);
          setIsReady(true);
          setIsLoading(false);
          onReady?.();
        });

        api.addEventListener('participantJoined', (event: any) => {
          logger.info('👤 Participant joined:', event);
          setParticipantCount(prev => prev + 1);
          onParticipantJoined?.(event);
        });

        api.addEventListener('participantLeft', (event: any) => {
          logger.info('👋 Participant left:', event);
          setParticipantCount(prev => Math.max(1, prev - 1));
          onParticipantLeft?.(event);
        });

        api.addEventListener('audioMuteStatusChanged', (event: any) => {
          logger.info('🎤 Audio mute status:', event.muted);
          setIsAudioMuted(event.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (event: any) => {
          logger.info('📹 Video mute status:', event.muted);
          setIsVideoMuted(event.muted);
        });

        api.addEventListener('readyToClose', () => {
          logger.info('👋 User left the meeting');
          handleClose();
        });

        api.addEventListener('errorOccurred', (event: any) => {
          logger.error('❌ Jitsi error:', event);
          setError(event.error?.message || 'An error occurred');
        });

        // Ready after short delay
        setTimeout(() => {
          if (!isReady) {
            setIsLoading(false);
          }
        }, 3000);

      } catch (err: any) {
        logger.error('❌ Failed to initialize Jitsi:', err);
        setError(err.message || 'Failed to initialize video call');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (apiRef.current) {
        logger.info('🧹 Disposing Jitsi API instance');
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, jwt, userName, userEmail, displayName, onReady, onParticipantJoined, onParticipantLeft]);

  const handleClose = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    onClose?.();
  };

  const toggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleFullscreen = () => {
    if (apiRef.current) {
      if (!isFullscreen) {
        apiRef.current.executeCommand('toggleFilmStrip');
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5" />
            <div>
              <div className="font-medium">{roomName}</div>
              <div className="text-xs text-orange-100 flex items-center gap-2">
                <Users className="w-3 h-3" />
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Controls */}
            {isReady && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleAudio}
                  title={isAudioMuted ? 'Unmute' : 'Mute'}
                >
                  {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleVideo}
                  title={isVideoMuted ? 'Start video' : 'Stop video'}
                >
                  {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleClose}
              title="Leave call"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-gray-900 flex items-center justify-center" style={{ height: '500px' }}>
          <div className="text-center text-white space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
            <div className="text-lg">Connecting to video call...</div>
            <div className="text-sm text-gray-400">Setting up camera and microphone</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50 m-4">
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <div className="font-medium">Failed to load video call</div>
              <div className="text-sm">{error}</div>
              <div className="text-xs text-red-600">
                Check browser console for details
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Jitsi Container */}
      <div 
        ref={containerRef}
        className={`bg-black ${isLoading ? 'hidden' : ''}`}
        style={{ height: isFullscreen ? '80vh' : '500px' }}
      />

      {/* Footer Info */}
      {isReady && (
        <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Connected</span>
            </div>
            <div>Room: {roomName}</div>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Settings className="w-3 h-3" />
            <span>JWT Authenticated</span>
          </div>
        </div>
      )}
    </Card>
  );
}
