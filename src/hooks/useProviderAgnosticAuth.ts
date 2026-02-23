/**
 * useProviderAgnosticAuth.ts
 *
 * ✅ ARCHITECTURE: The frontend has ONE auth provider: the Gravity Reunion backend.
 * There is no Firebase SDK, no Cognito SDK, no client-side token management.
 * Auth state comes from GET /auth/me (validated via HTTP-only cookie).
 *
 * This hook is a lightweight wrapper around the api/auth module.
 * It is kept for backwards compatibility with components that import it.
 *
 * Prefer importing from api/auth directly in new code.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getCurrentUser,
    logout as apiLogout,
    signInWithEmailAndPassword,
    type AuthUser,
} from '../api/auth';
import { logger } from '../utils/secureLogger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User extends Omit<AuthUser, 'permissions'> {
    currentProvider: 'backend';
    roles: Array<{ id: number; name: string; displayName: string; isPrimary: boolean }>;
    permissions: Array<{ name: string; resource: string; action: string }>;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export interface AuthActions {
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    hasPermission: (permissionName: string) => boolean;
    hasRole: (roleName: string) => boolean;
    hasAnyPermission: (permissionNames: string[]) => boolean;
    hasAllPermissions: (permissionNames: string[]) => boolean;
    refreshUser: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProviderAgnosticAuth(): AuthState & AuthActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const mapUser = (u: AuthUser): User => ({
        ...u,
        currentProvider: 'backend',
        // Role-based permission model — resolved server-side, cached here for UI checks
        roles: [{ id: 1, name: u.role, displayName: u.role, isPrimary: true }],
        permissions: [], // Loaded from backend on demand
    });

    useEffect(() => {
        getCurrentUser()
            .then((u) => setUser(mapUser(u)))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        setLoading(true);
        setError(null);
        try {
            const u = await signInWithEmailAndPassword(email, password);
            const mapped = mapUser(u);
            setUser(mapped);
            return mapped;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await apiLogout();
        } catch (err) {
            logger.error('Logout error', err);
        } finally {
            setUser(null);
        }
    }, []);

    const hasPermission = useCallback(
        (name: string) => user?.permissions.some((p) => p.name === name) ?? false,
        [user]
    );

    const hasRole = useCallback(
        (name: string) => user?.roles.some((r) => r.name === name) ?? false,
        [user]
    );

    const hasAnyPermission = useCallback(
        (names: string[]) => names.some((n) => user?.permissions.some((p) => p.name === n)) ?? false,
        [user]
    );

    const hasAllPermissions = useCallback(
        (names: string[]) => names.every((n) => user?.permissions.some((p) => p.name === n)) ?? false,
        [user]
    );

    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const u = await getCurrentUser();
            setUser(mapUser(u));
        } catch (err) {
            logger.error('Refresh user error', err);
        }
    }, []);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        refreshUser,
    };
}
