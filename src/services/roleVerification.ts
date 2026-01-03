/**
 * Role Verification Service
 * Ensures user roles are verified from Firestore (source of truth)
 * before granting session permissions or moderator access
 */

import { getTherapistProfile, TherapistProfile } from './firestoreService';
import { ApiException } from '../api/client';
import { logger, AuditEventType } from './secureLogger';

export type UserRole = 'therapist' | 'admin' | 'client' | 'client';
export type VideoRole = 'moderator' | 'participant';

export interface RoleVerificationResult {
  userId: string;
  role: UserRole;
  videoRole: VideoRole;
  verified: boolean;
  source: 'firestore' | 'cache';
  timestamp: Date;
}

// Cache for role verification (5 minute TTL)
interface CachedRole {
  role: UserRole;
  timestamp: number;
}

const roleCache = new Map<string, CachedRole>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Verify user role from Firestore (source of truth)
 * This should ALWAYS be called before granting moderator privileges
 */
export async function verifyUserRoleFromFirestore(
  userId: string,
  requireModerator: boolean = false
): Promise<RoleVerificationResult> {
  try {
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      const videoRole = mapRoleToVideoRole(cached.role);

      // Verify moderator requirement
      if (requireModerator && videoRole !== 'moderator') {
        throw new ApiException({
          message: 'Moderator access required',
          code: 'INSUFFICIENT_PERMISSIONS',
          status: 403
        });
      }

      return {
        userId,
        role: cached.role,
        videoRole,
        verified: true,
        source: 'cache',
        timestamp: new Date()
      };
    }

    // Fetch from Firestore (source of truth)
    const profile = await getTherapistProfile(userId);

    if (!profile) {
      throw new ApiException({
        message: 'User profile not found',
        code: 'USER_NOT_FOUND',
        status: 404
      });
    }

    // Verify user has a valid role
    if (!profile.role) {
      throw new ApiException({
        message: 'User role not defined',
        code: 'ROLE_NOT_DEFINED',
        status: 403
      });
    }

    // Cache the role
    roleCache.set(userId, {
      role: profile.role,
      timestamp: Date.now()
    });

    const videoRole = mapRoleToVideoRole(profile.role);

    // Verify moderator requirement
    if (requireModerator && videoRole !== 'moderator') {
      throw new ApiException({
        message: 'Moderator access required. User role is not authorized.',
        code: 'INSUFFICIENT_PERMISSIONS',
        status: 403,
        details: {
          userId,
          currentRole: profile.role,
          requiredRole: 'therapist or admin'
        }
      });
    }

    return {
      userId,
      role: profile.role,
      videoRole,
      verified: true,
      source: 'firestore',
      timestamp: new Date()
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }

    throw new ApiException({
      message: 'Failed to verify user role',
      code: 'ROLE_VERIFICATION_FAILED',
      status: 500,
      details: error
    });
  }
}

/**
 * Map user role to video role
 * Therapists and admins get moderator privileges
 * Clients and clients are participants
 */
export function mapRoleToVideoRole(userRole: UserRole): VideoRole {
  switch (userRole) {
    case 'therapist':
    case 'admin':
      return 'moderator';
    case 'client':
    case 'client':
      return 'participant';
    default:
      return 'participant';
  }
}

/**
 * Verify session moderator access
 * MUST be called before allowing moderator-only actions
 */
export async function verifyModeratorAccess(
  userId: string,
  sessionId?: string
): Promise<RoleVerificationResult> {
  const result = await verifyUserRoleFromFirestore(userId, true);

  // Audit log: Moderator access verified
  logger.audit({
    eventType: AuditEventType.PERMISSION_CHANGE,
    userId,
    resourceId: sessionId,
    resourceType: 'video_session',
    action: 'Moderator access verified',
    success: true,
  });

  return result;
}

/**
 * Verify user can join session
 */
export async function verifySessionAccess(
  userId: string,
  sessionId: string
): Promise<RoleVerificationResult> {
  const result = await verifyUserRoleFromFirestore(userId, false);

  logger.info('Session access verified', { userId, sessionId });

  return result;
}

/**
 * Clear role cache for a specific user
 * Should be called when user role is updated
 */
export function clearRoleCache(userId: string): void {
  roleCache.delete(userId);
  logger.info('Role cache cleared', { userId });
}

/**
 * Clear all role cache
 * Use with caution - typically for admin operations
 */
export function clearAllRoleCache(): void {
  roleCache.clear();
  logger.info('All role cache cleared');
}

/**
 * Check if user has moderator privileges WITHOUT throwing errors
 * Useful for UI conditional rendering
 */
export async function hasModeratorPrivileges(userId: string): Promise<boolean> {
  try {
    const result = await verifyUserRoleFromFirestore(userId, false);
    return result.videoRole === 'moderator';
  } catch (error) {
    return false;
  }
}

/**
 * Batch verify multiple users
 * Useful for session participant lists
 */
export async function batchVerifyUsers(
  userIds: string[]
): Promise<Map<string, RoleVerificationResult>> {
  const results = new Map<string, RoleVerificationResult>();

  await Promise.all(
    userIds.map(async (userId) => {
      try {
        const result = await verifyUserRoleFromFirestore(userId, false);
        results.set(userId, result);
      } catch (error) {
        // Log error but continue with other users
        logger.error('Failed to verify role for user', error, { userId });
      }
    })
  );

  return results;
}

/**
 * Security audit log
 */
export interface SecurityAuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  sessionId?: string;
  role: UserRole;
  videoRole: VideoRole;
  success: boolean;
  details?: any;
}

const auditLogs: SecurityAuditLog[] = [];
const MAX_AUDIT_LOGS = 1000; // Keep last 1000 logs in memory

/**
 * Log security event for audit trail
 */
export function logSecurityEvent(log: Omit<SecurityAuditLog, 'timestamp'>): void {
  const auditLog: SecurityAuditLog = {
    ...log,
    timestamp: new Date()
  };

  auditLogs.push(auditLog);

  // Keep only last MAX_AUDIT_LOGS entries
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.shift();
  }

  // Send to secure logger
  logger.audit({
    eventType: AuditEventType.PERMISSION_CHANGE,
    userId: log.userId,
    resourceId: log.sessionId,
    resourceType: 'security_event',
    action: log.action,
    success: log.success,
    metadata: log.details,
  });
}

/**
 * Get recent security audit logs
 */
export function getSecurityAuditLogs(limit: number = 100): SecurityAuditLog[] {
  return auditLogs.slice(-limit);
}

/**
 * Get security audit logs for specific user
 */
export function getUserSecurityLogs(userId: string, limit: number = 50): SecurityAuditLog[] {
  return auditLogs
    .filter(log => log.userId === userId)
    .slice(-limit);
}
