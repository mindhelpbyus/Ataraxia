/**
 * api/calls.ts — Call / live-session service
 *
 * Live video sessions are owned by the separate **video-service** backend
 * (`VITE_VIDEO_API_BASE_URL`), which is room-based (`/rooms`, `/appointments/:id/join`).
 * It does NOT expose the old call-log / invitation / SSE model, and neither
 * backend-initial nor billing_payment has any `/calls/*` route. The room-mappable
 * operations call video-service; the rest are TODO(backend) no-ops (no fictional
 * endpoints are called).
 */

import { videoGet, videoPost } from '../api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CallLog {
  id: string;
  callType: 'video' | 'audio';
  roomName: string;
  initiatorId: string;
  initiatorName: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  appointmentId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  startTime: string; // ISO
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  notes?: string;
}

export interface CallInvitation {
  id: string;
  callType: 'video' | 'audio';
  roomName: string;
  initiatorId: string;
  initiatorName: string;
  recipientId: string;
  recipientName: string;
  appointmentId?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Create a video room (video-service: POST /rooms). Returns the room id. */
export async function createCallLog(
  callType: 'video' | 'audio',
  roomName: string,
  _initiatorId: string,
  _initiatorName: string,
  _participantIds: string[],
  _participantNames: Record<string, string>,
  appointmentId?: string
): Promise<string> {
  const { room } = await videoPost<{ room: { id: string } }>('/rooms', {
    name: roomName,
    type: callType,
    appointmentId,
  });
  return room.id;
}

/** End a video room (video-service: POST /rooms/:roomId/end). */
export async function endCall(callId: string, _recordingUrl?: string): Promise<void> {
  await videoPost<void>(`/rooms/${callId}/end`, {});
}

// TODO(video-service): no status/notes/invitation/SSE routes exist on video-service.
// These are no-ops until those endpoints are added; callers degrade gracefully.
export async function updateCallStatus(_callId: string, _status: CallLog['status']): Promise<void> {
  return;
}

export async function addCallNotes(_callId: string, _notes: string): Promise<void> {
  return;
}

/** List video rooms for the user (video-service: GET /rooms). */
export function subscribeToCallLogs(
  _userId: string,
  callback: (logs: CallLog[]) => void
): () => void {
  videoGet<{ rooms: CallLog[] }>('/rooms')
    .then((r) => callback(r.rooms ?? []))
    .catch(() => callback([]));
  // No SSE stream on video-service yet; one-shot fetch above.
  return () => { /* nothing to unsubscribe */ };
}

// TODO(video-service): no call-invitation model. Stubbed to keep callers working.
export async function createCallInvitation(): Promise<string> {
  return '';
}

export async function updateCallInvitationStatus(): Promise<void> {
  return;
}

export function subscribeToCallInvitations(
  _userId: string,
  callback: (invitations: CallInvitation[]) => void
): () => void {
  callback([]);
  return () => { /* noop */ };
}

export async function getCallStatistics(_userId: string): Promise<{
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
}> {
  // TODO(video-service): no statistics route yet.
  return { totalCalls: 0, completedCalls: 0, missedCalls: 0, totalDuration: 0, averageDuration: 0 };
}
