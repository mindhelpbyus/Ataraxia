/**
 * Authentication Hook
 * React hook for managing authentication state
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

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiException | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser
  };
}
