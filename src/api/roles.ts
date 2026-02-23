/**
 * api/roles.ts — Roles API thin client
 * Role lookups are delegated to the backend — no client-side role tables.
 */

import { get, post } from './client';

export interface Role {
    id: number;
    name: string;
    displayName: string;
    description?: string;
}

export async function getAllRoles(): Promise<Role[]> {
    return get<Role[]>('/api/roles');
}

export async function getProfessionalRoles(): Promise<Role[]> {
    return get<Role[]>('/api/roles?type=professional');
}

export async function getUserRole(userId: string): Promise<{ primaryRole: Role; roles: Role[] }> {
    const role = await get<Role>(`/api/users/${userId}/role`);
    return { primaryRole: role, roles: [role] };
}

// Security & Session Role Verification (Migrated from deleted services/roleVerification.ts)
export interface RoleVerificationResult {
    userId: string;
    role: string;
    videoRole: 'participant' | 'moderator';
    verifiedAt: string;
    sessionId?: string;
}

export async function verifyModeratorAccess(userId: string, sessionId?: string): Promise<RoleVerificationResult> {
    return get<RoleVerificationResult>(`/api/verification/roles/moderator-access?userId=${userId}${sessionId ? `&sessionId=${sessionId}` : ''}`);
}

export async function verifySessionAccess(userId: string, sessionId: string): Promise<RoleVerificationResult> {
    return get<RoleVerificationResult>(`/api/verification/roles/session-access?userId=${userId}&sessionId=${sessionId}`);
}

export async function batchVerifyUsers(userIds: string[]): Promise<Map<string, RoleVerificationResult>> {
    const results = await get<Record<string, RoleVerificationResult>>(`/api/verification/roles/batch?userIds=${userIds.join(',')}`);
    return new Map(Object.entries(results));
}

export function logSecurityEvent(event: any): void {
    // Fire and forget security log to backend
    post('/api/security/events', event).catch(() => {
        // Silently fail if logging fails to prevent disruption
    });
}
