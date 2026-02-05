
import { post, get, setAuthTokens, clearAuthTokens, isAuthenticated } from '../api/client';
import { logger } from './secureLogger';

/**
 * Standardized Auth Service
 * Uses the API Client (and thus the Backend) as the primary source of truth.
 * Handles token management via client.ts
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token?: string; // Legacy support
  accessToken?: string;
  refreshToken?: string;
  sessionId?: string;
  requiresVerification?: boolean;
}

import { RegisterRequest } from '../api/types';

class AuthService {

  /**
   * Register a new user (Email/Password)
   * Hybrid auth: Supports Firebase (primary), Cognito (fallback), and local DB
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Call the backend /auth/register endpoint which handles hybrid auth
      // Pass false for requireAuth since registration is public
      const response = await post<AuthResponse>('/auth/register', data, false);

      if (response.accessToken || response.token) {
        this.handleSessionStart(response.accessToken || response.token!, response.refreshToken);
      }

      return response;
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login with Email/Password
   */
  async login(data: any): Promise<AuthResponse> {
    try {
      const response = await post<AuthResponse>('/auth/login', data, false);

      if (response.accessToken || response.token) {
        this.handleSessionStart(response.accessToken || response.token!, response.refreshToken);
      }

      return response;
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Handle Social Login (Google/Phone exchange)
   * Exchanges a Firebase/Provider token for a Backend Access Token
   */
  async exchangeSocialToken(provider: 'google' | 'phone', token: string, profile?: any): Promise<AuthResponse> {
    try {
      const endpoint = provider === 'google' ? '/auth/google' : '/auth/phone-login';
      const payload = {
        token, // The ID token from Firebase/Google
        ...profile
      };

      const response = await post<AuthResponse>(endpoint, payload, false);

      if (response.accessToken || response.token) {
        this.handleSessionStart(response.accessToken || response.token!, response.refreshToken);
      }

      return response;
    } catch (error) {
      logger.error('Social auth exchange failed:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      if (isAuthenticated()) {
        await post('/auth/logout', {});
      }
    } catch (error) {
      // Ignore network errors on logout
    } finally {
      this.handleSessionEnd();
    }
  }

  /**
   * Get Current User Profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isAuthenticated()) return null;

    try {
      return await get<AuthUser>('/auth/me');
    } catch (error) {
      return null;
    }
  }

  // --- MFA Methods ---

  async setupMFA(method: 'totp' | 'sms', phoneNumber?: string): Promise<any> {
    try {
      const endpoint = method === 'totp' ? '/auth/mfa/setup-totp' : '/auth/mfa/setup-sms';
      const payload = method === 'sms' ? { phoneNumber } : {};
      return await post(endpoint, payload);
    } catch (error) {
      logger.error('MFA setup failed:', error);
      throw error;
    }
  }

  async verifyMFA(method: 'totp' | 'sms', code: string, phoneNumber?: string): Promise<any> {
    try {
      const endpoint = method === 'totp' ? '/auth/mfa/verify-totp' : '/auth/mfa/verify-sms';
      const payload = { code, phoneNumber };
      return await post(endpoint, payload);
    } catch (error) {
      logger.error('MFA verification failed:', error);
      throw error;
    }
  }

  async getMFAStatus(): Promise<any> {
    try {
      return await get('/auth/mfa/status');
    } catch (error) {
      logger.error('Failed to get MFA status:', error);
      throw error;
    }
  }

  // --- Session Management Methods ---

  async getActiveSessions(): Promise<any> {
    try {
      return await get('/auth/sessions/active');
    } catch (error) {
      logger.error('Failed to get active sessions:', error);
      throw error;
    }
  }

  async invalidateAllSessions(excludeCurrent: boolean = true): Promise<any> {
    try {
      return await post('/auth/sessions/invalidate-all', { excludeCurrent });
    } catch (error) {
      logger.error('Failed to invalidate sessions:', error);
      throw error;
    }
  }

  /**
   * Check if account is locked
   */
  async checkAccountLockout(email: string): Promise<any> {
    try {
      // This might be a public endpoint or part of login pre-check
      return await post('/auth/check-lockout', { email }, false);
    } catch (error) {
      return { locked: false }; // Default favor open
    }
  }

  // --- Internal Session Helpers ---

  private handleSessionStart(accessToken: string, refreshToken?: string) {
    setAuthTokens(accessToken, refreshToken);
  }

  private handleSessionEnd() {
    clearAuthTokens();
    localStorage.removeItem('therapistOnboardingSessionId');
  }

  // --- Mobile/Hybrid Support Helpers (Simulating Firebase/Cognito SDK interface) ---

  /**
   * Get current auth system status
   */
  getAuthSystemStatus() {
    return {
      primary: 'firebase',
      status: 'operational'
    };
  }

  /**
   * Facade for login (aliasing to our unified login)
   */
  async signInWithEmailAndPassword(email: string, password: string) {
    const response = await this.login({ email, password });
    return {
      user: {
        uid: response.user.id,
        email: response.user.email,
        ...response.user
      },
      userProfile: response.user
    };
  }

  /**
   * Facade for registration
   */
  async createUserWithEmailAndPassword(email: string, password: string) {
    return await this.register({
      email,
      password,
      firstName: 'User',
      lastName: 'N/A',
      role: 'client'
    });
  }

  /**
   * Facade for confirmation
   */
  async confirmSignUp(email: string, code: string) {
    return await post('/auth/confirm', { email, code }, false);
  }

  /**
   * Facade for password reset
   */
  async sendPasswordResetEmail(email: string) {
    return await post('/auth/forgot-password', { email }, false);
  }

  /**
   * Helper to format auth errors
   */
  getAuthErrorMessage(error: any): string {
    return error.message || error.msg || 'An authentication error occurred';
  }
}

export const authService = new AuthService();
export default authService;

// Standalone exports for backward compatibility/direct use
export const setupMFA = (method: 'totp' | 'sms', phoneNumber?: string) => authService.setupMFA(method, phoneNumber);
export const verifyMFA = (method: 'totp' | 'sms', code: string, phoneNumber?: string) => authService.verifyMFA(method, code, phoneNumber);
export const getMFAStatus = () => authService.getMFAStatus();

// Session Management Exports
export const getActiveSessions = () => authService.getActiveSessions();
export const invalidateAllSessions = (excludeCurrent?: boolean) => authService.invalidateAllSessions(excludeCurrent);
// Auth Exports (Legacy Support)
export const logout = () => authService.logout();
export const register = (data: any) => authService.register(data);
export const login = (data: any) => authService.login(data);
export const getCurrentUser = () => authService.getCurrentUser();
// Standalone exports for Backward Compatibility
export const getAuthSystemStatus = () => authService.getAuthSystemStatus();
export const signInWithEmailAndPassword = (e: string, p: string) => authService.signInWithEmailAndPassword(e, p);
export const createUserWithEmailAndPassword = (e: string, p: string) => authService.createUserWithEmailAndPassword(e, p);
export const confirmSignUp = (e: string, c: string) => authService.confirmSignUp(e, c);
export const sendPasswordResetEmail = (e: string) => authService.sendPasswordResetEmail(e);
export const getAuthErrorMessage = (err: any) => authService.getAuthErrorMessage(err);

export const signOut = logout; // Alias for compatibility