/**
 * devMockUser.ts — Development-only mock authentication
 *
 * Provides realistic test user personas for UI development and design review.
 * ONLY active in development mode (import.meta.env.DEV).
 * Completely stripped from production builds via Vite tree-shaking.
 */

import type { AuthUser } from '../api/auth';

// ─── Mock Personas ────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<string, { user: AuthUser; password: string; label: string }> = {
  'therapist@ataraxia.dev': {
    password: 'demo1234',
    label: '🌿 Dr. Sarah Chen — Therapist',
    user: {
      id: 'mock-therapist-001',
      email: 'therapist@ataraxia.dev',
      name: 'Dr. Sarah Chen',
      role: 'therapist',
      account_status: 'active',
      first_name: 'Sarah',
      last_name: 'Chen',
      phone: '+14155551234',
      avatar_url: null,
      is_verified: true,
      organization_id: 'org-mock-001',
    } as AuthUser,
  },
  'admin@ataraxia.dev': {
    password: 'demo1234',
    label: '🔑 Alex Morgan — Admin',
    user: {
      id: 'mock-admin-001',
      email: 'admin@ataraxia.dev',
      name: 'Alex Morgan',
      role: 'admin',
      account_status: 'active',
      first_name: 'Alex',
      last_name: 'Morgan',
      phone: '+14155559999',
      avatar_url: null,
      is_verified: true,
      organization_id: 'org-mock-001',
    } as AuthUser,
  },
  'client@ataraxia.dev': {
    password: 'demo1234',
    label: '💚 Jamie Rivera — Client',
    user: {
      id: 'mock-client-001',
      email: 'client@ataraxia.dev',
      name: 'Jamie Rivera',
      role: 'client',
      account_status: 'active',
      first_name: 'Jamie',
      last_name: 'Rivera',
      phone: '+14155554321',
      avatar_url: null,
      is_verified: true,
      organization_id: 'org-mock-001',
    } as AuthUser,
  },
};

/**
 * Attempt a mock login. Returns an AuthUser if the credentials match a test
 * persona, or null if not in dev mode / no match.
 */
export function tryMockLogin(email: string, password: string): AuthUser | null {
  if (!import.meta.env.DEV) return null;
  const entry = MOCK_USERS[email.toLowerCase().trim()];
  if (!entry) return null;
  if (entry.password !== password) return null;
  return entry.user;
}

/** Is mock login available for this email? (used by UI to show hint) */
export function isMockEmail(email: string): boolean {
  if (!import.meta.env.DEV) return false;
  return email.toLowerCase().trim() in MOCK_USERS;
}
