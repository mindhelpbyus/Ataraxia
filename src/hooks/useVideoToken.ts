// hooks/useVideoToken.ts
// Fetches a short-lived JWT from your backend for a given appointment.
// The LiveKit URL is safe to hardcode — it's not a secret.

import { useState, useEffect } from 'react';

const LIVEKIT_URL = 'wss://ataraxia-ppdnqkly.livekit.cloud';

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

    const params = new URLSearchParams({
      appointmentId,
      name: participantName,
      role,
    });

    // In a production app, this would be your actual backend.
    // For testing/demo purposes, we try to hit the backend if available.
    fetch(`/api/video/token?${params}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(({ token, room }) => {
        setToken(token);
        setRoom(room);
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to get video token');
      })
      .finally(() => setLoading(false));
  }, [appointmentId, participantName, role]);

  return { token, url: LIVEKIT_URL, room, loading, error };
}
