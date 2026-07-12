/**
 * api/roles.ts — Roles API thin client.
 *
 * The backend owns roles (backend-initial clients Lambda):
 *   GET /roles          → platform role catalog
 *   GET /users/me/role  → caller's authoritative role (DB User.role + Cognito groups)
 * No role tables or role derivation live in the UI.
 */

import { get } from './client';

export interface Role {
    id: number;
    name: string;
    displayName: string;
    description?: string;
}

export interface MyRole {
    userId: number;
    role: string;
    isAdmin: boolean;
    groups: string[];
}

interface Envelope<T> {
    success: boolean;
    data: T;
}

export async function getAllRoles(): Promise<Role[]> {
    const res = await get<Envelope<Role[]>>('/roles');
    return res.data;
}

export async function getProfessionalRoles(): Promise<Role[]> {
    const roles = await getAllRoles();
    return roles.filter(r => r.name === 'therapist');
}

/** The CURRENT user's role, resolved server-side from their JWT + User record. */
export async function getUserRole(_userId: string): Promise<{ primaryRole: Role; roles: Role[] }> {
    const [me, catalog] = await Promise.all([
        get<Envelope<MyRole>>('/users/me/role'),
        getAllRoles(),
    ]);
    const names = new Set<string>([me.data.role, ...me.data.groups.map(g => g.toLowerCase())]);
    const roles = catalog.filter(r => names.has(r.name) || names.has(r.displayName.toLowerCase()));
    const primary = catalog.find(r => r.name === me.data.role) ?? roles[0] ?? catalog[0];
    return { primaryRole: primary, roles: roles.length ? roles : [primary] };
}
