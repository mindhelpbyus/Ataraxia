/**
 * api/roles.ts — Roles API thin client.
 *
 * The backend owns roles (backend-initial clients Lambda):
 *   GET /roles          → platform role catalog
 *   GET /users/me/role  → caller's authoritative role (DB User.role + Cognito groups)
 * No role tables or role derivation live in the UI.
 *
 * Wire shape is { success: true, data } — apiRequest's auto-unwrap already
 * strips that down to bare `data` before this module sees it, so validating
 * against `{ success, data }` here (as the previous version did) always saw
 * `res.data` as `undefined` on an already-unwrapped array/object. Uses
 * apiFetch with the schema written for the *inner* payload (default
 * rawEnvelope: false) so the auto-unwrap and the schema agree on the same
 * layer — same class of bug as admin.ts, fixed the same way.
 */

import { z } from 'zod';
import { apiFetch } from './client';

const RoleSchema = z.object({
    id: z.number(),
    name: z.string(),
    displayName: z.string(),
    description: z.string().optional(),
});
export type Role = z.infer<typeof RoleSchema>;

const MyRoleSchema = z.object({
    userId: z.number(),
    role: z.string(),
    isAdmin: z.boolean(),
    groups: z.array(z.string()),
});
export type MyRole = z.infer<typeof MyRoleSchema>;

export function getAllRoles(): Promise<Role[]> {
    return apiFetch('/roles', { schema: z.array(RoleSchema) });
}

export async function getProfessionalRoles(): Promise<Role[]> {
    const roles = await getAllRoles();
    return roles.filter(r => r.name === 'therapist');
}

/** The CURRENT user's role, resolved server-side from their JWT + User record. */
export async function getUserRole(_userId: string): Promise<{ primaryRole: Role; roles: Role[] }> {
    const [me, catalog] = await Promise.all([
        apiFetch('/users/me/role', { schema: MyRoleSchema }),
        getAllRoles(),
    ]);
    const names = new Set<string>([me.role, ...me.groups.map(g => g.toLowerCase())]);
    const roles = catalog.filter(r => names.has(r.name) || names.has(r.displayName.toLowerCase()));
    const primary = catalog.find(r => r.name === me.role) ?? roles[0] ?? catalog[0];
    return { primaryRole: primary, roles: roles.length ? roles : [primary] };
}
