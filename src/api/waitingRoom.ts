/**
 * Waiting Room API
 * Manages participants in the waiting room
 */

import { get, post } from './client';

export interface WaitingParticipant {
  userId: string;
  name: string;
  email?: string;
  joinedWaitingRoomAt: string;
  status: 'waiting' | 'approved' | 'denied';
}

export interface WaitingRoomStats {
  totalWaiting: number;
  totalApproved: number;
  totalDenied: number;
  averageWaitTime: number; // seconds
}

export interface WaitingRoomStatus {
  isInWaitingRoom: boolean;
  status: 'waiting' | 'approved' | 'denied';
  joinedAt?: string;
}

/**
 * Get waiting participants for a session
 */
export async function getWaitingParticipants(
  sessionId: string
): Promise<WaitingParticipant[]> {
  return get<WaitingParticipant[]>(`/waiting-room/${sessionId}`);
}

/**
 * Approve a participant from waiting room (moderator only)
 */
export async function approveParticipant(
  sessionId: string,
  userId: string
): Promise<void> {
  return post(`/waiting-room/${sessionId}/approve`, { userId });
}

/**
 * Deny a participant from waiting room (moderator only)
 */
export async function denyParticipant(
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> {
  return post(`/waiting-room/${sessionId}/deny`, { userId, reason });
}

/**
 * Bulk approve participants (moderator only)
 */
export async function bulkApproveParticipants(
  sessionId: string,
  userIds: string[]
): Promise<void> {
  return post(`/waiting-room/${sessionId}/bulk-approve`, { userIds });
}

/**
 * Bulk deny participants (moderator only)
 */
export async function bulkDenyParticipants(
  sessionId: string,
  userIds: string[],
  reason?: string
): Promise<void> {
  return post(`/waiting-room/${sessionId}/bulk-deny`, { userIds, reason });
}

/**
 * Get waiting room statistics (moderator only)
 */
export async function getWaitingRoomStats(
  sessionId: string
): Promise<WaitingRoomStats> {
  return get<WaitingRoomStats>(`/waiting-room/${sessionId}/stats`);
}

/**
 * Check user's waiting room status
 */
export async function getUserWaitingStatus(
  sessionId: string,
  userId: string
): Promise<WaitingRoomStatus> {
  return get<WaitingRoomStatus>(`/waiting-room/${sessionId}/user/${userId}/status`);
}

/**
 * Auto-approve eligible users (moderator only)
 */
export async function autoApproveEligibleUsers(
  sessionId: string
): Promise<{ approvedCount: number; approvedUsers: string[] }> {
  return post(`/waiting-room/${sessionId}/auto-approve`, {});
}
