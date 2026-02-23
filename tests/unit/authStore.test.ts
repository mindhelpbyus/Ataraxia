/**
 * tests/unit/authStore.test.ts
 *
 * Unit tests for the Zustand auth store — the single most critical
 * piece of state in the application (session, login, logout, PHI wipe).
 *
 * Chief Architect requirement: 70%+ coverage on critical paths.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock the API layer so tests don't make real network requests
vi.mock('../../src/api/auth', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
}));

// Mock the queryClient so logout can call queryClient.clear()
vi.mock('../../src/lib/queryClient', () => ({
    queryClient: {
        clear: vi.fn(),
    },
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────
import { useAuthStore } from '../../src/store/authStore';
import * as authApi from '../../src/api/auth';
import { queryClient } from '../../src/lib/queryClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockUser = {
    id: 'user-123',
    email: 'therapist@ataraxia.local',
    name: 'Test Therapist',
    phone: null,
    role: 'therapist' as const,
};

function resetStore() {
    // Reset Zustand store back to initial state between tests
    useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
    });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('authStore', () => {
    beforeEach(() => {
        resetStore();
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    // ─── Initial state ─────────────────────────────────────────────────────────
    describe('initial state', () => {
        it('starts with no user and unauthenticated', () => {
            const { user, isAuthenticated, isLoading } = useAuthStore.getState();
            expect(user).toBeNull();
            expect(isAuthenticated).toBe(false);
            expect(isLoading).toBe(false);
        });
    });

    // ─── login ─────────────────────────────────────────────────────────────────
    describe('login()', () => {
        it('sets user and isAuthenticated on success', async () => {
            vi.mocked(authApi.login).mockResolvedValueOnce(mockUser);

            await act(async () => {
                await useAuthStore.getState().login('therapist@ataraxia.local', 'correct-password');
            });

            const { user, isAuthenticated, isLoading } = useAuthStore.getState();
            expect(user).toEqual(mockUser);
            expect(isAuthenticated).toBe(true);
            expect(isLoading).toBe(false); // must reset after completion
        });

        it('resets isLoading to false even when login fails', async () => {
            vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'));

            await act(async () => {
                try {
                    await useAuthStore.getState().login('bad@example.com', 'wrong');
                } catch {
                    // expected to throw
                }
            });

            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('throws so the calling component can show an error', async () => {
            vi.mocked(authApi.login).mockRejectedValueOnce(new Error('Invalid credentials'));

            await expect(
                useAuthStore.getState().login('bad@email.com', 'wrong')
            ).rejects.toThrow('Invalid credentials');
        });

        it('calls the API with correct credentials', async () => {
            vi.mocked(authApi.login).mockResolvedValueOnce(mockUser);

            await act(async () => {
                await useAuthStore.getState().login('therapist@ataraxia.local', 'password123');
            });

            expect(authApi.login).toHaveBeenCalledWith('therapist@ataraxia.local', 'password123');
            expect(authApi.login).toHaveBeenCalledTimes(1);
        });
    });

    // ─── logout ────────────────────────────────────────────────────────────────
    describe('logout()', () => {
        beforeEach(() => {
            // Start each logout test logged in
            useAuthStore.setState({ user: mockUser, isAuthenticated: true });
        });

        it('clears user and isAuthenticated', async () => {
            vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

            await act(async () => {
                await useAuthStore.getState().logout();
            });

            const { user, isAuthenticated } = useAuthStore.getState();
            expect(user).toBeNull();
            expect(isAuthenticated).toBe(false);
        });

        it('calls queryClient.clear() to wipe PHI cache (HIPAA requirement)', async () => {
            vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

            await act(async () => {
                await useAuthStore.getState().logout();
            });

            // Wait for the dynamic import of queryClient to complete
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(queryClient.clear).toHaveBeenCalled();
        });

        it('clears sessionStorage on logout', async () => {
            sessionStorage.setItem('ataraxia-auth', JSON.stringify({ user: mockUser }));
            vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

            await act(async () => {
                await useAuthStore.getState().logout();
            });

            expect(sessionStorage.getItem('ataraxia-auth')).toBeNull();
        });

        it('still clears local state even if API logout fails (network offline)', async () => {
            vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('Network error'));

            await act(async () => {
                await useAuthStore.getState().logout(); // must NOT throw
            });

            expect(useAuthStore.getState().user).toBeNull();
            expect(useAuthStore.getState().isAuthenticated).toBe(false);
        });
    });

    // ─── refreshUser ───────────────────────────────────────────────────────────
    describe('refreshUser()', () => {
        it('sets user from backend on success', async () => {
            vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(mockUser);

            await act(async () => {
                await useAuthStore.getState().refreshUser();
            });

            expect(useAuthStore.getState().user).toEqual(mockUser);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
            expect(useAuthStore.getState().isLoading).toBe(false);
        });

        it('stays logged out if no valid session cookie', async () => {
            vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce(new Error('401 Unauthorized'));

            await act(async () => {
                await useAuthStore.getState().refreshUser();
            });

            expect(useAuthStore.getState().user).toBeNull();
            expect(useAuthStore.getState().isAuthenticated).toBe(false);
            expect(useAuthStore.getState().isLoading).toBe(false);
        });
    });

    // ─── _setUser ──────────────────────────────────────────────────────────────
    describe('_setUser()', () => {
        it('sets user and marks authenticated (used post-registration)', () => {
            useAuthStore.getState()._setUser(mockUser);

            expect(useAuthStore.getState().user).toEqual(mockUser);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
        });
    });

    // ─── Persistence ───────────────────────────────────────────────────────────
    describe('sessionStorage persistence', () => {
        it('only persists id and role — NOT email, name, or tokens (minimum necessary principle)', async () => {
            vi.mocked(authApi.login).mockResolvedValueOnce(mockUser);

            await act(async () => {
                await useAuthStore.getState().login('therapist@ataraxia.local', 'password');
            });

            const stored = JSON.parse(sessionStorage.getItem('ataraxia-auth') ?? '{}');
            const persistedUser = stored?.state?.user;

            // ✅ HIPAA: only id + role persisted
            expect(persistedUser).toHaveProperty('id', mockUser.id);
            expect(persistedUser).toHaveProperty('role', mockUser.role);

            // ✅ PII NOT persisted
            expect(persistedUser).not.toHaveProperty('email');
            expect(persistedUser).not.toHaveProperty('name');
            expect(persistedUser).not.toHaveProperty('phone');
        });
    });
});
