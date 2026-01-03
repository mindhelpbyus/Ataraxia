/**
 * Call Service - Refactored to use API Abstraction Layer
 */

import { callService } from '../api';
import { CallLog, CallInvitation } from '../api/mock/call';

export type { CallLog, CallInvitation };

export async function createCallLog(
  callType: 'video' | 'audio',
  roomName: string,
  initiatorId: string,
  initiatorName: string,
  participantIds: string[],
  participantNames: Record<string, string>,
  appointmentId?: string
): Promise<string> {
  return callService.createCallLog({
    callType,
    roomName,
    initiatorId,
    initiatorName,
    participantIds,
    participantNames,
    appointmentId
  });
}

export async function updateCallStatus(
  callId: string,
  status: CallLog['status']
): Promise<void> {
  return callService.updateCallStatus(callId, status);
}

export async function endCall(callId: string, recordingUrl?: string): Promise<void> {
  return callService.endCall(callId, recordingUrl);
}

export async function addCallNotes(callId: string, notes: string): Promise<void> {
  // Not implemented in mock yet
}

export function subscribeToCallLogs(
  userId: string,
  callback: (logs: CallLog[]) => void
): () => void {
  return callService.subscribeToCallLogs(userId, callback);
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
  return callService.createCallInvitation({
    callType,
    roomName,
    initiatorId,
    initiatorName,
    recipientId,
    recipientName,
    appointmentId
  });
}

export async function updateCallInvitationStatus(
  invitationId: string,
  status: CallInvitation['status']
): Promise<void> {
  // Not implemented in mock yet
}

export function subscribeToCallInvitations(
  userId: string,
  callback: (invitations: CallInvitation[]) => void
): () => void {
  return callService.subscribeToCallInvitations(userId, callback);
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
