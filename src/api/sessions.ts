/**
 * Session Management API
 * Handles video session creation, joining, and management
 */

import { get, post, put, del } from './client';
import { logger, AuditEventType } from '../services/secureLogger';

export interface CreateSessionRequest {
  appointmentId?: string;
  title: string;
  description?: string;
  scheduledStartTime?: string;
  duration?: number; // minutes
  participants: {
    userId: string;
    role: 'moderator' | 'participant';
    email?: string;
    name?: string;
  }[];
  settings?: {
    waitingRoomEnabled?: boolean;
    recordingEnabled?: boolean;
    chatEnabled?: boolean;
    screenSharingEnabled?: boolean;
    requireApproval?: boolean;
  };
}

export interface Session {
  id: string;
  roomName: string;
  title: string;
  description?: string;
  appointmentId?: string;
  createdBy: string;
  scheduledStartTime?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  participants: SessionParticipant[];
  settings: SessionSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SessionParticipant {
  userId: string;
  name: string;
  email?: string;
  role: 'moderator' | 'participant';
  joinedAt?: string;
  leftAt?: string;
  isOnline: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export interface SessionSettings {
  waitingRoomEnabled: boolean;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  screenSharingEnabled: boolean;
  requireApproval: boolean;
  maxParticipants?: number;
  autoApprove?: boolean;
}

export interface JoinSessionRequest {
  sessionId: string;
  userName: string;
  userEmail?: string;
}

export interface JoinSessionResponse {
  session: Session;
  jwt: string;
  joinUrl: string;
  isModerator: boolean;
  requiresApproval: boolean;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalDuration: number; // minutes
  averageDuration: number; // minutes
  participantCount: number;
  recordingCount: number;
}

export interface SessionState {
  sessionId: string;
  isRecording: boolean;
  isLocked: boolean;
  participantCount: number;
  moderators: string[];
  settings: SessionSettings;
}

export interface UpdatePermissionsRequest {
  userId: string;
  permissions: {
    canShare?: boolean;
    canChat?: boolean;
    canSpeak?: boolean;
  };
}

export interface SessionControls {
  canRecord: boolean;
  canLock: boolean;
  canMuteAll: boolean;
  canRemoveParticipants: boolean;
  canManageWaitingRoom: boolean;
}

/**
 * Create a new session
 * Uses /appointments endpoint as per backend API
 */
export async function createSession(
  request: CreateSessionRequest
): Promise<Session> {
  // Backend uses /appointments endpoint
  // Transform request to match backend format
  const moderator = request.participants.find(p => p.role === 'moderator');
  const participant = request.participants.find(p => p.role === 'participant');

  // Calculate endTime based on duration if not provided
  const startTime = request.scheduledStartTime || new Date().toISOString();
  const duration = request.duration || 60; // default 60 minutes
  const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 1000).toISOString();

  // ⚠️ IMPORTANT: therapistId and clientId MUST be different users!
  // If no participant is provided, use a default client userId
  const clientId = participant?.userId || 'USR-CLIENT-2025'; // Real client ID from backend

  if (!moderator?.userId) {
    throw new Error('Moderator (therapist) is required to create a session');
  }

  const appointmentRequest = {
    therapistId: moderator.userId,
    clientId: clientId, // ✅ Always use a different user
    startTime: startTime,
    endTime: endTime,
    recordingEnabled: request.settings?.recordingEnabled || false,
    chatEnabled: request.settings?.chatEnabled || true,
    screenShareEnabled: request.settings?.screenSharingEnabled || true,
    notes: request.description || '' // Map description to notes
  };


  logger.info('Creating video session', {
    therapistId: appointmentRequest.therapistId,
    clientId: appointmentRequest.clientId,
    startTime: appointmentRequest.startTime,
    endTime: appointmentRequest.endTime
  });

  if (appointmentRequest.therapistId === appointmentRequest.clientId) {
    logger.warn('therapistId and clientId are the same', { therapistId: appointmentRequest.therapistId });
    throw new Error('therapistId and clientId must be different users');
  }

  const response = await post<any>('/appointments', appointmentRequest);
  logger.info('Session created successfully', { appointmentId: response.data?.appointment?.id });


  const appointment = response.data?.appointment || response.appointment || response;

  logger.info('Backend response IDs', {
    appointmentId: appointment.id,
    sessionId: appointment.sessionId,
    roomName: appointment.roomName
  });

  if (!appointment.sessionId) {
    logger.error('No sessionId in backend response', { appointment });
    throw new Error('Backend did not return a sessionId. Cannot proceed with video session.');
  }

  // Audit log: Session created
  logger.audit({
    eventType: AuditEventType.SESSION_START,
    userId: appointmentRequest.therapistId,
    resourceId: appointment.sessionId,
    resourceType: 'video_session',
    action: 'Created video session',
    success: true,
    metadata: {
      appointmentId: appointment.id,
      clientId: appointmentRequest.clientId,
      roomName: appointment.roomName
    }
  });

  return {
    id: appointment.sessionId, // ✅ ALWAYS use sessionId for video operations
    appointmentId: appointment.id, // Store appointment ID separately
    roomName: appointment.roomName || `bedrock-${appointment.sessionId}`,
    title: request.title,
    description: request.description,
    createdBy: appointmentRequest.therapistId,
    scheduledStartTime: appointment.startTime,
    duration: request.duration,
    status: 'scheduled',
    participants: request.participants.map(p => ({
      userId: p.userId,
      name: p.name || '',
      email: p.email,
      role: p.role,
      isOnline: false
    })),
    settings: {
      waitingRoomEnabled: request.settings?.waitingRoomEnabled || false,
      recordingEnabled: request.settings?.recordingEnabled || false,
      chatEnabled: request.settings?.chatEnabled || true,
      screenSharingEnabled: request.settings?.screenSharingEnabled || true,
      requireApproval: request.settings?.requireApproval || false
    },
    createdAt: appointment.createdAt || new Date().toISOString(),
    updatedAt: appointment.updatedAt || new Date().toISOString()
  };
}

/**
 * Get session details
 */
export async function getSession(sessionId: string): Promise<Session> {
  return get<Session>(`/sessions/${sessionId}`);
}

/**
 * Check if therapist has joined session
 */
export async function getTherapistStatus(
  sessionId: string
): Promise<{ hasJoined: boolean; joinedAt?: string }> {
  return get(`/sessions/${sessionId}/therapist-status`, false);
}

/**
 * Check session ownership
 */
export async function checkSessionOwnership(
  sessionId: string
): Promise<{ isOwner: boolean; isModerator: boolean }> {
  return get(`/sessions/${sessionId}/ownership`);
}

/**
 * Join a session
 */
export async function joinSession(
  request: JoinSessionRequest
): Promise<JoinSessionResponse> {
  return post<JoinSessionResponse>('/sessions/join', request);
}

/**
 * Get Jitsi JWT token for session
 * Uses GET /sessions/{sessionId}/jwt endpoint
 * NOTE: This is a GET request with no body, only sessionId in URL
 */
export async function getSessionJWT(sessionId: string): Promise<{ jwt: string; serverUrl?: string }> {
  // GET request - sessionId is in the URL, no body needed
  const response = await get<any>(`/sessions/${sessionId}/jwt`);

  // Backend returns { success: true, data: { jitsiToken, serverUrl, ... } }
  // Map jitsiToken to jwt for consistency
  return {
    jwt: response.data?.jitsiToken || response.jitsiToken || response.jwt,
    serverUrl: response.data?.serverUrl || response.serverUrl
  };
}

/**
 * End a session (moderator only)
 */
export async function endSession(sessionId: string): Promise<void> {
  return post(`/sessions/${sessionId}/end`, {});
}

/**
 * Cancel a scheduled session (moderator only)
 */
export async function cancelSession(sessionId: string, reason?: string): Promise<void> {
  return post(`/sessions/${sessionId}/cancel`, { reason });
}

/**
 * Get user's sessions
 */
export async function getUserSessions(filters?: {
  status?: 'scheduled' | 'active' | 'ended' | 'cancelled';
  startDate?: string;
  endDate?: string;
}): Promise<Session[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const query = params.toString();
  return get<Session[]>(`/sessions${query ? `?${query}` : ''}`);
}

/**
 * Get session statistics
 */
export async function getSessionStats(
  startDate?: string,
  endDate?: string
): Promise<SessionStats> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const query = params.toString();
  return get<SessionStats>(`/sessions/stats${query ? `?${query}` : ''}`);
}

/**
 * Get session state
 */
export async function getSessionState(sessionId: string): Promise<SessionState> {
  return get<SessionState>(`/sessions/${sessionId}/state`, false);
}

/**
 * Update session settings (moderator only)
 */
export async function updateSessionSettings(
  sessionId: string,
  settings: Partial<SessionSettings>
): Promise<SessionState> {
  return put<SessionState>(`/sessions/${sessionId}/state`, { settings });
}

/**
 * Remove participant from session (moderator only)
 */
export async function removeParticipant(
  sessionId: string,
  userId: string
): Promise<void> {
  return post(`/sessions/${sessionId}/remove`, { userId });
}

/**
 * Mute/unmute participant (moderator only)
 */
export async function muteParticipant(
  sessionId: string,
  userId: string,
  muted: boolean
): Promise<void> {
  return post(`/sessions/${sessionId}/mute`, { userId, muted });
}

/**
 * Kick participant from session (moderator only)
 */
export async function kickParticipant(
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> {
  return post(`/sessions/${sessionId}/kick`, { userId, reason });
}

/**
 * Update participant permissions (moderator only)
 */
export async function updateParticipantPermissions(
  sessionId: string,
  request: UpdatePermissionsRequest
): Promise<void> {
  return put(`/sessions/${sessionId}/permissions`, request);
}

/**
 * Get session controls (moderator only)
 */
export async function getSessionControls(
  sessionId: string
): Promise<SessionControls> {
  return get<SessionControls>(`/sessions/${sessionId}/controls`);
}

/**
 * Grant moderator role to participant (moderator only)
 */
export async function grantModerator(
  sessionId: string,
  userId: string
): Promise<void> {
  return post(`/sessions/${sessionId}/grant-moderator`, { userId });
}

/**
 * Revoke moderator role from participant (moderator only)
 */
export async function revokeModerator(
  sessionId: string,
  userId: string
): Promise<void> {
  return post(`/sessions/${sessionId}/revoke-moderator`, { userId });
}
