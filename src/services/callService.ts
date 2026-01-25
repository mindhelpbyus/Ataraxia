/**
 * Call Service - Refactored to use API Abstraction Layer
 */

// Define types locally since mock files are removed
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
  startTime: Date;
  endTime?: Date;
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
  createdAt: Date;
  expiresAt: Date;
}

// TODO: Implement real call service when needed
// For now, these are placeholder functions

export async function createCallLog(
  callType: 'video' | 'audio',
  roomName: string,
  initiatorId: string,
  initiatorName: string,
  participantIds: string[],
  participantNames: Record<string, string>,
  appointmentId?: string
): Promise<string> {
  console.warn('Call service not implemented yet - createCallLog');
  return 'placeholder-call-id';
}

export async function updateCallStatus(
  callId: string,
  status: CallLog['status']
): Promise<void> {
  console.warn('Call service not implemented yet - updateCallStatus');
  // No-op for now
}

export async function endCall(callId: string, recordingUrl?: string): Promise<void> {
  console.warn('Call service not implemented yet - endCall');
  // No-op for now
}

export async function addCallNotes(callId: string, notes: string): Promise<void> {
  console.warn('Call service not implemented yet - addCallNotes');
  // No-op for now
}

export function subscribeToCallLogs(
  userId: string,
  callback: (logs: CallLog[]) => void
): () => void {
  console.warn('Call service not implemented yet - subscribeToCallLogs');
  return () => {};
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
  console.warn('Call service not implemented yet - createCallInvitation');
  return 'placeholder-invitation-id';
}

export async function updateCallInvitationStatus(
  invitationId: string,
  status: CallInvitation['status']
): Promise<void> {
  console.warn('Call service not implemented yet - updateCallInvitationStatus');
  // No-op for now
}

export function subscribeToCallInvitations(
  userId: string,
  callback: (invitations: CallInvitation[]) => void
): () => void {
  console.warn('Call service not implemented yet - subscribeToCallInvitations');
  // Call callback with empty array to prevent errors
  callback([]);
  return () => {};
}

export async function getCallStatistics(userId: string): Promise<{
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
}> {
  return {
    totalCalls: 0,
    completedCalls: 0,
    missedCalls: 0,
    totalDuration: 0,
    averageDuration: 0
  };
}
