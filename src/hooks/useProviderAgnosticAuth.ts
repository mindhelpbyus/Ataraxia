/**
 * Provider-Agnostic Authentication Hook
 * 
 * Unified authentication hook that works with both Firebase and Cognito
 * Auto-detects the current provider from backend configuration
 * 
 * Usage:
 *   const { user, login, logout, hasPermission, hasRole } = useProviderAgnosticAuth();
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword as firebaseSignIn, signOut as firebaseSignOut } from 'firebase/auth';
import { Amplify, Auth } from 'aws-amplify';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    account_status: string;
    currentProvider: 'firebase' | 'cognito';
    roles: Array<{
        id: number;
        name: string;
        displayName: string;
        isPrimary: boolean;
    }>;
    permissions: Array<{
        name: string;
        resource: string;
        action: string;
        description?: string;
    }>;
}

export interface AuthConfig {
    provider: 'firebase' | 'cognito';
    firebase?: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId?: string;
    };
    cognito?: {
        region: string;
        userPoolId: string;
        userPoolWebClientId: string;
    };
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

let authConfigCache: AuthConfig | null = null;
let firebaseInitialized = false;
let cognitoInitialized = false;

/**
 * Fetch auth configuration from backend
 */
async function fetchAuthConfig(): Promise<AuthConfig> {
    if (authConfigCache) {
        return authConfigCache;
    }

    try {
        const response = await fetch('/api/config/auth');
        const config = await response.json();
        authConfigCache = config;
        return config;
    } catch (error) {
        console.error('Failed to fetch auth config:', error);
        // Fallback to environment variables
        return {
            provider: (import.meta.env.VITE_AUTH_PROVIDER || 'firebase') as 'firebase' | 'cognito',
            firebase: {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
                messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
                appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
                measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
            },
            cognito: {
                region: import.meta.env.VITE_AWS_REGION || 'us-west-2',
                userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
                userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || ''
            }
        };
    }
}

/**
 * Initialize Firebase
 */
function initializeFirebase(config: AuthConfig['firebase']) {
    if (firebaseInitialized || !config) return;

    try {
        initializeApp(config);
        firebaseInitialized = true;
        console.log('✅ Firebase initialized');
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
    }
}

/**
 * Initialize Cognito
 */
function initializeCognito(config: AuthConfig['cognito']) {
    if (cognitoInitialized || !config) return;

    try {
        Amplify.configure({
            Auth: {
                region: config.region,
                userPoolId: config.userPoolId,
                userPoolWebClientId: config.userPoolWebClientId
            }
        });
        cognitoInitialized = true;
        console.log('✅ Cognito initialized');
    } catch (error) {
        console.error('Failed to initialize Cognito:', error);
    }
}

/**
 * Provider-Agnostic Authentication Hook
 */
export function useProviderAgnosticAuth(): AuthState & AuthActions {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);

    // Initialize auth providers on mount
    useEffect(() => {
        async function init() {
            try {
                const config = await fetchAuthConfig();
                setAuthConfig(config);

                // Initialize the appropriate provider
                if (config.provider === 'firebase' && config.firebase) {
                    initializeFirebase(config.firebase);
                } else if (config.provider === 'cognito' && config.cognito) {
                    initializeCognito(config.cognito);
                }

                // Check for existing session
                await checkSession(config);
            } catch (err) {
                console.error('Auth initialization error:', err);
                setError(err instanceof Error ? err.message : 'Authentication initialization failed');
            } finally {
                setLoading(false);
            }
        }

        init();
    }, []);

    /**
     * Check for existing session
     */
    const checkSession = async (config: AuthConfig) => {
        try {
            if (config.provider === 'firebase') {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const idToken = await currentUser.getIdToken();
                    await loginWithToken(idToken);
                }
            } else if (config.provider === 'cognito') {
                const session = await Auth.currentSession();
                const idToken = session.getIdToken().getJwtToken();
                await loginWithToken(idToken);
            }
        } catch (err) {
            // No existing session
            console.debug('No existing session');
        }
    };

    /**
     * Login with ID token (backend call)
     */
    const loginWithToken = async (idToken: string): Promise<User> => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        setUser(data.user);
        setError(null);
        return data.user;
    };

    /**
     * Login with email and password (provider-agnostic)
     */
    const login = useCallback(async (email: string, password: string): Promise<User> => {
        if (!authConfig) {
            throw new Error('Auth not initialized');
        }

        setLoading(true);
        setError(null);

        try {
            let idToken: string;

            if (authConfig.provider === 'firebase') {
                // Firebase login
                const auth = getAuth();
                const userCredential = await firebaseSignIn(auth, email, password);
                idToken = await userCredential.user.getIdToken();
            } else {
                // Cognito login
                await Auth.signIn(email, password);
                const session = await Auth.currentSession();
                idToken = session.getIdToken().getJwtToken();
            }

            // Login to backend
            const user = await loginWithToken(idToken);
            return user;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [authConfig]);

    /**
     * Logout (provider-agnostic)
     */
    const logout = useCallback(async (): Promise<void> => {
        if (!authConfig) return;

        setLoading(true);

        try {
            if (authConfig.provider === 'firebase') {
                const auth = getAuth();
                await firebaseSignOut(auth);
            } else {
                await Auth.signOut();
            }

            // Clear backend session
            await fetch('/api/auth/logout', { method: 'POST' });

            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    }, [authConfig]);

    /**
     * Check if user has a specific permission
     */
    const hasPermission = useCallback((permissionName: string): boolean => {
        if (!user) return false;
        return user.permissions.some(p => p.name === permissionName);
    }, [user]);

    /**
     * Check if user has a specific role
     */
    const hasRole = useCallback((roleName: string): boolean => {
        if (!user) return false;
        return user.roles.some(r => r.name === roleName);
    }, [user]);

    /**
     * Check if user has ANY of the specified permissions
     */
    const hasAnyPermission = useCallback((permissionNames: string[]): boolean => {
        if (!user) return false;
        return permissionNames.some(permName =>
            user.permissions.some(p => p.name === permName)
        );
    }, [user]);

    /**
     * Check if user has ALL of the specified permissions
     */
    const hasAllPermissions = useCallback((permissionNames: string[]): boolean => {
        if (!user) return false;
        return permissionNames.every(permName =>
            user.permissions.some(p => p.name === permName)
        );
    }, [user]);

    /**
     * Refresh user data from backend
     */
    const refreshUser = useCallback(async (): Promise<void> => {
        if (!authConfig) return;

        setLoading(true);

        try {
            let idToken: string;

            if (authConfig.provider === 'firebase') {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                if (!currentUser) throw new Error('Not authenticated');
                idToken = await currentUser.getIdToken(true); // Force refresh
            } else {
                const session = await Auth.currentSession();
                idToken = session.getIdToken().getJwtToken();
            }

            await loginWithToken(idToken);
        } catch (err) {
            console.error('Refresh user error:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh user');
        } finally {
            setLoading(false);
        }
    }, [authConfig]);

    return {
        // State
        user,
        loading,
        error,
        isAuthenticated: !!user,

        // Actions
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        refreshUser
    };
}
