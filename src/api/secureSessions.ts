/**
 * Secure Session Management API
 * Enhanced with Firestore role verification for all moderator actions
 */

import { get, post, put } from './client';
import {
  verifyModeratorAccess,
  verifySessionAccess,
  logSecurityEvent,
  batchVerifyUsers,
  RoleVerificationResult
} from './roles';
import { getCurrentUser } from './auth';
import {
  Session,
  CreateSessionRequest,
  JoinSessionRequest,
  JoinSessionResponse,
  SessionSettings,
  UpdatePermissionsRequest
} from './sessions';

export interface SecureSessionResponse {
  session: Session;
  roleVerification: RoleVerificationResult;
}

export interface SecureJoinResponse extends JoinSessionResponse {
  roleVerification: RoleVerificationResult;
}

/**
 * Create session with role verification
 */
export async function createSecureSession(
  request: CreateSessionRequest
): Promise<SecureSessionResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify user has permission to create sessions (moderator role required)
    const roleVerification = await verifyModeratorAccess(user.id);

    // Verify all participants' roles from Firestore
    const participantIds = request.participants.map(p => p.userId);
    const participantRoles = await batchVerifyUsers(participantIds);

    // Update participant roles based on Firestore verification
    const verifiedParticipants = request.participants.map(p => {
      const verified = participantRoles.get(p.userId);
      return {
        ...p,
        role: verified?.videoRole || 'participant' // Use verified role from Firestore
      };
    });

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'create_session',
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: {
        title: request.title,
        participantCount: verifiedParticipants.length
      }
    });

    // Create session with verified participants
    const session = await post<Session>('/sessions', {
      ...request,
      participants: verifiedParticipants
    });

    return {
      session,
      roleVerification
    };
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'create_session',
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: error
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Join session with role verification
 */
export async function joinSecureSession(
  request: JoinSessionRequest
): Promise<SecureJoinResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify session access from Firestore
    const roleVerification = await verifySessionAccess(user.id, request.sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'join_session',
      sessionId: request.sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true
    });

    // Join session through backend
    const joinResponse = await post<JoinSessionResponse>('/sessions/join', request);

    return {
      ...joinResponse,
      roleVerification,
      isModerator: roleVerification.videoRole === 'moderator'
    };
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'join_session',
        sessionId: request.sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: error
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * End session with moderator verification
 */
export async function endSecureSession(sessionId: string): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'end_session',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true
    });

    // End session through backend
    return post(`/sessions/${sessionId}/end`, {});
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'end_session',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: error
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Remove participant with moderator verification
 */
export async function removeSecureParticipant(
  sessionId: string,
  targetUserId: string
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'remove_participant',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { targetUserId }
    });

    // Remove participant through backend
    return post(`/sessions/${sessionId}/remove`, { userId: targetUserId });
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'remove_participant',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: { targetUserId, error }
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Mute participant with moderator verification
 */
export async function muteSecureParticipant(
  sessionId: string,
  targetUserId: string,
  muted: boolean
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'mute_participant',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { targetUserId, muted }
    });

    // Mute participant through backend
    return post(`/sessions/${sessionId}/mute`, { userId: targetUserId, muted });
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'mute_participant',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: { targetUserId, muted, error }
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Update session settings with moderator verification
 */
export async function updateSecureSessionSettings(
  sessionId: string,
  settings: Partial<SessionSettings>
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'update_session_settings',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { settings }
    });

    // Update settings through backend
    return put(`/sessions/${sessionId}/state`, { settings });
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'update_session_settings',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: { settings, error }
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Grant moderator role with verification
 */
export async function grantSecureModerator(
  sessionId: string,
  targetUserId: string
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Verify target user's actual role from Firestore
    const targetVerification = await verifySessionAccess(targetUserId, sessionId);

    // Check if target user is eligible for moderator role
    if (targetVerification.role !== 'therapist' && targetVerification.role !== 'admin') {
      throw new Error('Cannot grant moderator privileges to non-therapist/admin users');
    }

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'grant_moderator',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { targetUserId, targetRole: targetVerification.role }
    });

    // Grant moderator through backend
    return post(`/sessions/${sessionId}/grant-moderator`, { userId: targetUserId });
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'grant_moderator',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: { targetUserId, error }
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Update participant permissions with moderator verification
 */
export async function updateSecureParticipantPermissions(
  sessionId: string,
  request: UpdatePermissionsRequest
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'update_participant_permissions',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { targetUserId: request.userId, permissions: request.permissions }
    });

    // Update permissions through backend
    return put(`/sessions/${sessionId}/permissions`, request);
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'update_participant_permissions',
        sessionId,
        role: 'client',
        videoRole: 'participant',
        success: false,
        details: { request, error }
      });
    } catch {
      // Ignore
    }

    throw error;
  }
}

/**
 * Get session with role verification
 * Includes user's verified role in response
 */
export async function getSecureSession(
  sessionId: string
): Promise<SecureSessionResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify session access from Firestore
    const roleVerification = await verifySessionAccess(user.id, sessionId);

    // Get session from backend
    const session = await get<Session>(`/sessions/${sessionId}`);

    return {
      session,
      roleVerification
    };
  } catch (error) {
    throw error;
  }
}
