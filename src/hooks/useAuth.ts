/**
 * Authentication Hook - Updated for Cognito Migration
 * React hook for managing authentication state with seamless Cognito migration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkAuth,
  UserInfo
} from '../api/auth';
import { ApiException } from '../api/client';
import * as authService from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiException | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSystem, setAuthSystem] = useState<'cognito' | 'firebase'>('cognito');

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      if (!checkAuth()) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Update auth system status
        const status = authService.getAuthSystemStatus();
        setAuthSystem(status.primary);
        
      } catch (err) {
        const apiError = err instanceof ApiException ? err : new ApiException({
          message: 'Failed to load user',
          code: 'USER_LOAD_ERROR'
        });
        setError(apiError);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = useCallback(async (userId: string, email: string, role: 'therapist' | 'client' | 'admin' = 'therapist') => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiLogin({ userId, email, role });
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Update auth system status
      const status = authService.getAuthSystemStatus();
      setAuthSystem(status.primary);
      
      return response;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      });
      setError(apiError);
      setIsAuthenticated(false);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await apiLogout();
      
      // Also sign out from auth service (Cognito/Firebase)
      try {
        await authService.signOut();
      } catch (authError) {
        console.warn('Auth service logout failed:', authError);
      }
      
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: 'Failed to refresh user',
        code: 'USER_REFRESH_ERROR'
      });
      setError(apiError);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // New Cognito-specific methods
  const signInWithCognito = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.signInWithEmailAndPassword(email, password);
      
      // Use the Cognito user data to login to our backend
      const response = await apiLogin({
        userId: result.user.uid,
        email: result.user.email || email,
        role: result.userProfile.role
      });
      
      setUser(response.user);
      setIsAuthenticated(true);
      setAuthSystem('cognito');
      
      return response;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: authService.getAuthErrorMessage(err),
        code: 'COGNITO_LOGIN_ERROR'
      });
      setError(apiError);
      setIsAuthenticated(false);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUpWithCognito = useCallback(async (email: string, password: string, firstName: string, lastName: string, role: 'therapist' | 'client' = 'client') => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.createUserWithEmailAndPassword(email, password);
      
      // Note: User will need to verify email before they can login
      return { needsVerification: true };
      
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: authService.getAuthErrorMessage(err),
        code: 'COGNITO_SIGNUP_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmEmail = useCallback(async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.confirmSignUp(email, code);
      
      return { verified: true };
      
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: authService.getAuthErrorMessage(err),
        code: 'EMAIL_CONFIRMATION_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.sendPasswordResetEmail(email);
      
      return { sent: true };
      
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: authService.getAuthErrorMessage(err),
        code: 'PASSWORD_RESET_ERROR'
      });
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Original interface (maintained for compatibility)
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    
    // New Cognito methods
    signInWithCognito,
    signUpWithCognito,
    confirmEmail,
    resetPassword,
    
    // Auth system info
    authSystem,
    authSystemStatus: authService.getAuthSystemStatus()
  };
}
