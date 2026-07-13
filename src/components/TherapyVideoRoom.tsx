'use client';

// TherapyVideoRoom.tsx
// Bedrock Health Solutions — LiveKit video session component
// Cloud project: ataraxia-ppdnqkly.livekit.cloud

import React from 'react';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useRemoteParticipants,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useVideoToken } from '../hooks/useVideoToken';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TherapyVideoRoomProps {
  appointmentId: string;       // UUID from your DB — used as room name
  participantName: string;     // Display name (no PHI in the room name itself)
  role: 'therapist' | 'client';
  onSessionEnd?: (durationSeconds: number) => void;
  onError?: (error: string) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function TherapyVideoRoom({
  appointmentId,
  participantName,
  role,
  onSessionEnd,
  onError,
}: TherapyVideoRoomProps) {
  const { token, url, loading, error } = useVideoToken(
    appointmentId,
    participantName,
    role
  );

  const startTimeRef = useRef<Date | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'connected' | 'ended'>('loading');

  useEffect(() => {
    if (!loading && !error && token) setStatus('ready');
    if (error) {
      onError?.(error);
    }
  }, [loading, error, token, onError]);

  const handleConnected = useCallback(() => {
    startTimeRef.current = new Date();
    setStatus('connected');
  }, []);

  const handleDisconnected = useCallback(() => {
    const duration = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current.getTime()) / 1000)
      : 0;
    onSessionEnd?.(duration);
    setStatus('ended');
  }, [onSessionEnd]);

  // ── Loading state ──
  if (status === 'loading' || loading) {
    return (
      <div style={s.overlay}>
        <div style={s.spinner} />
        <p style={s.overlayText}>Connecting to session…</p>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={s.overlay}>
        <p style={{ ...s.overlayText, color: '#fca5a5' }}>
          Could not join session: {error}
        </p>
        <button style={s.retryBtn} onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  // ── Session ended ──
  if (status === 'ended') {
    return (
      <div style={s.overlay}>
        <div style={s.endIcon}>✓</div>
        <p style={s.overlayText}>Session complete</p>
        <p style={{ ...s.overlayText, fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
          {role === 'therapist'
            ? 'Your AI-drafted notes are being prepared…'
            : 'Thank you. Your therapist will follow up soon.'}
        </p>
      </div>
    );
  }

  // ── Live room ──
  return (
    <div style={s.roomWrap}>
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect={true}
        video={true}
        audio={true}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <RoomContent role={role} />
        <RoomAudioRenderer />
        {/* Session header — shows room info */}
        <SessionHeader appointmentId={appointmentId} role={role} />
      </LiveKitRoom>
    </div>
  );
}

// ── Room content (video grid + controls) ─────────────────────────────────────

function RoomContent({ role }: { role: 'therapist' | 'client' }) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera,      withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  const remoteParticipants = useRemoteParticipants();
  const isWaiting = remoteParticipants.length === 0;

  return (
    <div style={s.roomInner}>
      <div style={s.gridWrap}>
        <GridLayout tracks={tracks} style={s.grid}>
          <ParticipantTile />
        </GridLayout>
        {isWaiting && <WaitingRoomOverlay role={role} />}
      </div>

      <ControlBar
        controls={{
          camera:      true,
          microphone:  true,
          screenShare: role === 'therapist', // only therapists can screen share
          leave:       true,
          chat:        false, // use your existing MessagesView instead
        }}
        style={s.controls}
      />
    </div>
  );
}

// ── Waiting room — shown until the other participant (therapist or client)
// actually joins the LiveKit room. Real presence via useRemoteParticipants(),
// not a fixed timer or fake "connecting" spinner. ──
function WaitingRoomOverlay({ role }: { role: 'therapist' | 'client' }) {
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d % 3) + 1), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={s.waitingOverlay}>
      <div style={s.waitingPulse} />
      <p style={s.waitingTitle}>
        {role === 'therapist' ? 'Waiting for your client to join' : 'Waiting for your therapist to join'}
        {'.'.repeat(dots)}
      </p>
      <p style={s.waitingSubtitle}>
        You're connected and ready — your camera and mic are on. The session begins as soon as they arrive.
      </p>
    </div>
  );
}

// ── Session header ────────────────────────────────────────────────────────────

function SessionHeader({
  role,
}: {
  appointmentId: string;
  role: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div style={s.sessionHeader}>
      <div style={s.brandDot}>B</div>
      <span style={s.headerLabel}>Bedrock Health · Secure session</span>
      <div style={s.timer}>{fmt(elapsed)}</div>
      {role === 'therapist' && (
        <div style={s.recBadge}>
          <span style={s.recDot} />
          Live
        </div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  roomWrap: {
    height: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  roomInner: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  gridWrap: {
    position: 'relative' as const,
    flex: 1,
    display: 'flex',
  },
  grid: {
    flex: 1,
  },
  waitingOverlay: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    background: 'rgba(15,23,42,0.92)',
    backdropFilter: 'blur(6px)',
    zIndex: 5,
    padding: '0 32px',
    textAlign: 'center' as const,
  },
  waitingPulse: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#0ea5e9',
    boxShadow: '0 0 0 0 rgba(14,165,233,0.6)',
    animation: 'lk-waiting-pulse 1.6s ease-out infinite',
  },
  waitingTitle: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: 600,
    fontFamily: 'sans-serif',
    margin: 0,
  },
  waitingSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontFamily: 'sans-serif',
    maxWidth: 360,
    margin: 0,
    lineHeight: 1.5,
  },
  controls: {
    background: 'rgba(15,23,42,0.9)',
    borderTop: '0.5px solid rgba(255,255,255,0.08)',
    padding: '12px 0',
  },
  sessionHeader: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    background: 'rgba(15,23,42,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 16px',
    zIndex: 10,
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  },
  brandDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#0ea5e9',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  headerLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'sans-serif',
    flex: 1,
  },
  timer: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  recBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: '#86efac',
    fontFamily: 'sans-serif',
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22c55e',
    display: 'inline-block',
  },
  overlay: {
    height: '100vh',
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontFamily: 'sans-serif',
  },
  overlayText: {
    color: '#e2e8f0',
    fontSize: 15,
    margin: 0,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid rgba(255,255,255,0.1)',
    borderTopColor: '#0ea5e9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  endIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#059669',
    color: '#fff',
    fontSize: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtn: {
    marginTop: 8,
    padding: '8px 20px',
    background: '#0ea5e9',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
};
