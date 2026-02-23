/**
 * api/roles.ts — Roles API thin client
 * Role lookups are delegated to the backend — no client-side role tables.
 */

import { get } from './client';

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
