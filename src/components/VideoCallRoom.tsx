import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize2, Minimize2, Phone } from 'lucide-react';
import { Button } from './ui/button';
// TODO: Replace with Zoom VideoSDK component (VideoRoomsView.tsx). Jitsi shim kept for build compatibility.
import { getJitsiConfig, getJitsiDomain } from '../api/jitsi';
import { createCallLog, endCall, updateCallStatus } from '../api/calls';
import { logger } from '../utils/secureLogger';


interface VideoCallRoomProps {
  roomName: string;
  userName: string;
  userEmail: string;
  userId: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  onClose: () => void;
  appointmentId?: string;
  callType?: 'video' | 'audio';
  jwtToken?: string; // JWT token for authentication
  isModerator?: boolean; // Whether user is moderator
}

export function VideoCallRoom({
  roomName,
  userName,
  userEmail,
  userId,
  participantIds,
  participantNames,
  onClose,
  appointmentId,
  callType = 'video',
  jwtToken,
  isModerator = false
}: VideoCallRoomProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Jitsi script
    const loadJitsi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }

      const domain = getJitsiDomain();
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = () => initJitsi();
      script.onerror = () => {
        logger.error('Failed to load Jitsi External API');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initJitsi = async () => {
      if (!jitsiContainerRef.current) return;

      try {
        // Create call log (will use mock if Firebase not configured)
        let logId = null;
        try {
          logId = await createCallLog(
            callType,
            roomName,
            userId,
            userName,
            participantIds,
            participantNames,
            appointmentId
          );
          setCallId(logId);
        } catch (error) {
          // Silently continue - expected when not authenticated
        }

        const config = getJitsiConfig(roomName, userName, userEmail);
        const domain = getJitsiDomain();

        // Add moderator settings if user is moderator
        if (isModerator && config.configOverwrite) {
          config.configOverwrite.startWithAudioMuted = false;
          config.configOverwrite.startWithVideoMuted = false;
        }

        const api = new (window as any).JitsiMeetExternalAPI(domain, {
          ...config,
          parentNode: jitsiContainerRef.current,
        });

        // Event listeners
        api.addEventListener('videoConferenceJoined', () => {
          logger.info('User joined the call');
          setIsLoading(false);
          if (logId && logId !== 'mock-call-log-id') {
            updateCallStatus(logId, 'in-progress');
          }

          // Start with audio muted if audio-only call
          if (callType === 'audio') {
            api.executeCommand('toggleVideo');
          }
        });

        api.addEventListener('videoConferenceLeft', () => {
          logger.info('User left the call');
          handleEndCall();
        });

        api.addEventListener('readyToClose', () => {
          handleEndCall();
        });

        api.addEventListener('recordingStatusChanged', (data: any) => {
          logger.info('Recording status:', data);
        });

        api.addEventListener('participantJoined', (data: any) => {
          logger.info('Participant joined:', data);
        });

        api.addEventListener('participantLeft', (data: any) => {
          logger.info('Participant left:', data);
        });

        setJitsiApi(api);
      } catch (error) {
        // Only log actual errors, not expected Firebase permission issues
        if (error && !String(error).includes('permission-denied')) {
          logger.error('Error initializing Jitsi:', error);
        }
        setIsLoading(false);
      }
    };

    loadJitsi();

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, []);

  const handleEndCall = async () => {
    if (callId && callId !== 'mock-call-log-id') {
      await endCall(callId);
    }
    if (jitsiApi) {
      jitsiApi.dispose();
    }
    onClose();
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        // Check if fullscreen is supported
        if (!jitsiContainerRef.current?.requestFullscreen) {
          logger.warn('Fullscreen API not supported in this browser');
          return;
        }
        jitsiContainerRef.current?.requestFullscreen().catch((err) => {
          logger.warn('Could not enable fullscreen:', err.message);
        });
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch((err) => {
          logger.warn('Could not exit fullscreen:', err.message);
        });
        setIsFullscreen(false);
      }
    } catch (error) {
      logger.warn('Fullscreen not available:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div>
            <h3 className="text-white text-sm font-medium">
              {callType === 'video' ? 'Video Call' : 'Audio Call'}
            </h3>
            <p className="text-gray-400 text-xs">
              {Object.values(participantNames).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:bg-gray-800"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div className="flex-1 relative bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white">Connecting to call...</p>
            </div>
          </div>
        )}
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}