// hooks/useVideoToken.ts
// Joins the appointment's video room on the video-service backend and returns the
// short-lived LiveKit credentials. The LiveKit wss URL is not a secret.

import { useState, useEffect } from 'react';
import { videoPost } from '../api/client';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://ataraxia-ppdnqkly.livekit.cloud';

interface TokenResult {
  token: string;
  url: string;
  room: string;
  loading: boolean;
  error: string | null;
}

export function useVideoToken(
  appointmentId: string,
  participantName: string,
  role: 'therapist' | 'client'
): TokenResult {
  const [token, setToken]   = useState('');
  const [room, setRoom]     = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId || !participantName) return;

    setLoading(true);
    setError(null);

    // video-service: POST /appointments/:appointmentId/join → LiveKit credentials
    videoPost<{ token: string; roomName?: string; room?: string; url?: string }>(
      `/appointments/${appointmentId}/join`,
      { displayName: participantName, role }
    )
      .then((creds) => {
        setToken(creds.token);
        setRoom(creds.roomName ?? creds.room ?? appointmentId);
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to get video token');
      })
      .finally(() => setLoading(false));
  }, [appointmentId, participantName, role]);

  return { token, url: LIVEKIT_URL, room, loading, error };
}
