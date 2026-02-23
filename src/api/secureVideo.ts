/**
 * Secure Video Configuration API
 * Enhanced with Firestore role verification
 */

import { get, post } from './client';
import {
  verifyModeratorAccess,
  verifySessionAccess,
  logSecurityEvent,
  RoleVerificationResult
} from './roles';
import { getCurrentUser } from './auth';
import {
  VideoConfiguration,
  VideoCommand,
  RecordingStatus,
  VideoEvent
} from './video';

export interface SecureVideoConfigResponse {
  config: VideoConfiguration;
  roleVerification: RoleVerificationResult;
}

/**
 * Get video configuration with role verification
 * Verifies user role from Firestore before returning config
 */
export async function getSecureVideoConfig(
  sessionId: string
): Promise<SecureVideoConfigResponse> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify session access from Firestore (source of truth)
    const roleVerification = await verifySessionAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'get_video_config',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true
    });

    // Get video configuration from backend
    const config = await get<VideoConfiguration>(`/video/config/${sessionId}`);

    return {
      config,
      roleVerification
    };
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'get_video_config',
        sessionId,
        role: 'client', // Default since verification failed
        videoRole: 'participant',
        success: false,
        details: error
      });
    } catch {
      // Ignore logging errors
    }

    throw error;
  }
}

/**
 * Execute video command with moderator verification
 * CRITICAL: Always verifies from Firestore before executing commands
 */
export async function executeSecureVideoCommand(
  sessionId: string,
  command: VideoCommand
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // CRITICAL: Verify moderator access from Firestore (source of truth)
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'execute_video_command',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true,
      details: { command: command.command, target: command.target }
    });

    // Execute command through backend
    return post(`/video/commands/${sessionId}`, command);
  } catch (error) {
    // Log failed attempt - CRITICAL for security auditing
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'execute_video_command',
        sessionId,
        role: 'client', // Default since verification failed
        videoRole: 'participant',
        success: false,
        details: {
          command: command.command,
          target: command.target,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch {
      // Ignore logging errors
    }

    throw error;
  }
}

/**
 * Start recording with moderator verification
 */
export async function startSecureRecording(
  sessionId: string
): Promise<RecordingStatus> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'start_recording',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true
    });

    // Start recording through backend
    return post<RecordingStatus>(`/video/recording/${sessionId}/start`, {});
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'start_recording',
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
 * Stop recording with moderator verification
 */
export async function stopSecureRecording(
  sessionId: string
): Promise<RecordingStatus> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify moderator access from Firestore
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);

    // Log security event
    logSecurityEvent({
      userId: user.id,
      action: 'stop_recording',
      sessionId,
      role: roleVerification.role,
      videoRole: roleVerification.videoRole,
      success: true
    });

    // Stop recording through backend
    return post<RecordingStatus>(`/video/recording/${sessionId}/stop`, {});
  } catch (error) {
    // Log failed attempt
    try {
      const user = await getCurrentUser();
      logSecurityEvent({
        userId: user.id,
        action: 'stop_recording',
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
 * Send video event (allowed for all participants)
 */
export async function sendSecureVideoEvent(
  sessionId: string,
  event: Omit<VideoEvent, 'timestamp'>
): Promise<void> {
  try {
    // Get current user
    const user = await getCurrentUser();

    // Verify session access (not requiring moderator)
    await verifySessionAccess(user.id, sessionId);

    // Add userId to event if not present
    const eventWithUser = {
      ...event,
      userId: event.userId || user.id
    };

    // Send event through backend
    return post(`/video/events/${sessionId}`, eventWithUser);
  } catch (error) {
    throw error;
  }
}

/**
 * Check if current user has moderator access for a session
 * Useful for UI conditional rendering
 */
export async function checkModeratorAccess(sessionId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const roleVerification = await verifyModeratorAccess(user.id, sessionId);
    return roleVerification.videoRole === 'moderator';
  } catch (error) {
    return false;
  }
}

/**
 * Get user's video role for a session
 */
export async function getUserVideoRole(
  sessionId: string
): Promise<'moderator' | 'participant'> {
  try {
    const user = await getCurrentUser();
    const roleVerification = await verifySessionAccess(user.id, sessionId);
    return roleVerification.videoRole;
  } catch (error) {
    return 'participant'; // Default to least privileged
  }
}
