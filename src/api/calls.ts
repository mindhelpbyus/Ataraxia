/**
 * callService.ts — Call Service
 *
 * ✅ All operations proxied to the Gravity Reunion backend.
 * ✅ Zero mock data. Zero console.warn stubs.
 */

import { get, post, patch } from '../api/client';

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

export async function createCallLog(
  callType: 'video' | 'audio',
  roomName: string,
  initiatorId: string,
  initiatorName: string,
  participantIds: string[],
  participantNames: Record<string, string>,
  appointmentId?: string
): Promise<string> {
  const log = await post<CallLog>('/api/v1/calls/logs', {
    callType, roomName, initiatorId, initiatorName,
    participantIds, participantNames, appointmentId,
  });
  return log.id;
}

export async function updateCallStatus(callId: string, status: CallLog['status']): Promise<void> {
  await patch<void>(`/api/v1/calls/logs/${callId}/status`, { status });
}

export async function endCall(callId: string, recordingUrl?: string): Promise<void> {
  await patch<void>(`/api/v1/calls/logs/${callId}/end`, { recordingUrl });
}

export async function addCallNotes(callId: string, notes: string): Promise<void> {
  await patch<void>(`/api/v1/calls/logs/${callId}/notes`, { notes });
}

/** Subscribe to call logs for a user via SSE. Returns unsubscribe function. */
export function subscribeToCallLogs(
  userId: string,
  callback: (logs: CallLog[]) => void
): () => void {
  get<CallLog[]>(`/api/v1/calls/logs?userId=${userId}`)
    .then(callback)
    .catch(() => callback([]));

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/calls/logs/stream?userId=${userId}`;
  const es = new EventSource(url, { withCredentials: true });
  es.onmessage = (event) => {
    try { callback(JSON.parse(event.data)); } catch { /* ignore */ }
  };
  return () => es.close();
}

export async function createCallInvitation(
  callType: 'video' | 'audio',
  roomName: string,
  initiatorId: string,
  initiatorName: string,
  recipientId: string,
  recipientName: string,
  appointmentId?: string
): Promise<string> {
  const inv = await post<CallInvitation>('/api/v1/calls/invitations', {
    callType, roomName, initiatorId, initiatorName,
    recipientId, recipientName, appointmentId,
  });
  return inv.id;
}

export async function updateCallInvitationStatus(
  invitationId: string,
  status: CallInvitation['status']
): Promise<void> {
  await patch<void>(`/api/v1/calls/invitations/${invitationId}/status`, { status });
}

/** Subscribe to call invitations via SSE. Returns unsubscribe function. */
export function subscribeToCallInvitations(
  userId: string,
  callback: (invitations: CallInvitation[]) => void
): () => void {
  get<CallInvitation[]>(`/api/v1/calls/invitations?userId=${userId}`)
    .then(callback)
    .catch(() => callback([]));

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/calls/invitations/stream?userId=${userId}`;
  const es = new EventSource(url, { withCredentials: true });
  es.onmessage = (event) => {
    try { callback(JSON.parse(event.data)); } catch { /* ignore */ }
  };
  return () => es.close();
}

export async function getCallStatistics(userId: string): Promise<{
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
}> {
  return get(`/api/v1/calls/statistics?userId=${userId}`);
}
