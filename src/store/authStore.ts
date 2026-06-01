/**
 * store/authStore.ts — Centralized Auth State (Chief Architect Prescribed)
 *
 * ✅ ARCHITECTURE:
 * - Zustand store replaces useState prop-drilling in App.tsx
 * - Identity is AWS Cognito (lib/cognito.ts). The SDK owns the token lifecycle;
 *   this store is the UI mirror of the current user.
 * - Only user.id + user.role persisted to sessionStorage (min necessary PII)
 * - sessionStorage cleared on tab close (safer than localStorage for PHI)
 * - queryClient.clear() on logout wipes all cached PHI from React Query
 *
 * ✅ HIPAA: Minimum necessary principle. No tokens, no passwords ever stored here.
 *
 * NOTE: this store's `login` is the non-MFA convenience path. MFA-gated sign-in
 * is handled in LoginPage (it catches MfaRequiredError and calls _setUser).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../api/auth';
import type { AuthUser } from '../api/auth';
import { logger } from '../utils/secureLogger';
import { queryClient } from '../lib/queryClient';

// Minimal persistent shape – only what's needed for UI routing decisions
type PersistedUser = Pick<AuthUser, 'id' | 'role'> | null;

interface AuthState {
    // ─── State ──────────────────────────────────────────────────────────────
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // ─── Actions ─────────────────────────────────────────────────────────────
    /** Called on mount – restores the user from the active Cognito session */
    refreshUser: () => Promise<void>;
    /** Email + password login */
    login: (email: string, password: string) => Promise<AuthUser>;
    /** Logout – revokes backend session + clears all local PHI */
    logout: () => Promise<void>;
    /** Internal: set user directly (used after registration) */
    _setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            refreshUser: async () => {
                set({ isLoading: true });
                try {
                    const user = await getCurrentUser();
                    set({ user, isAuthenticated: true });
                    logger.info('Session restored from Cognito');
                } catch {
                    // No valid session — stay logged out
                    set({ user: null, isAuthenticated: false });
                } finally {
                    set({ isLoading: false });
                }
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    // Cognito SRP sign-in (throws MfaRequiredError if MFA is on —
                    // use LoginPage for MFA-gated accounts).
                    const user = await apiLogin(email, password);
                    set({ user, isAuthenticated: true });
                    logger.info('Login successful');
                    return user;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                try {
                    await apiLogout();
                } catch (err) {
                    // Best-effort — clear local state regardless of network failure
                    logger.warn('Logout API call failed, clearing local state anyway', {
                        message: err instanceof Error ? err.message : String(err),
                    });
                } finally {
                    set({ user: null, isAuthenticated: false });
                    // ✅ HIPAA: wipe all React Query cached PHI from memory
                    try {
                        queryClient.clear();
                    } catch (e) {
                        logger.error('Failed to clear query cache', e);
                    }
                    sessionStorage.clear();
                    logger.info('Session cleared');
                }
            },

            _setUser: (user) => set({ user, isAuthenticated: true }),
        }),
        {
            name: 'ataraxia-auth',
            // ✅ sessionStorage (not localStorage) — cleared when tab closes
            storage: createJSONStorage(() => sessionStorage),
            // ✅ Persist ONLY the minimum: id + role for UI routing on refresh
            // Never persist email, name, permissions, PHI of any kind
            partialize: (state): { user: PersistedUser } => ({
                user: state.user ? { id: state.user.id, role: state.user.role } : null,
            }),
        }
    )
);
