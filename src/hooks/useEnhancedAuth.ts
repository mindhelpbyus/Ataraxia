/**
 * Enhanced Auth Hook - Firebase-like Experience with Cognito
 * 
 * Provides all the session management features that Firebase handles automatically:
 * ✅ Automatic token refresh
 * ✅ Session persistence across page reloads
 * ✅ Real-time auth state updates
 * ✅ Loading states
 * ✅ Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import enhancedAuthService, { 
  User, 
  AuthResult,
  onAuthStateChanged,
  isAuthenticated,
  getUserRole
} from '../services/enhancedAuthService';

interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // User info
  role: string | null;
  isAdmin: boolean;
  isTherapist: boolean;
  isClient: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, additionalData?: {
    firstName?: string;
    lastName?: string;
    role?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<void>;
  
  // Token management
  getIdToken: () => Promise<string | null>;
  getAccessToken: () => Promise<string | null>;
  refreshTokens: () => Promise<void>;
  
  // Utility functions
  needsEmailVerification: () => boolean;
  getTokenInfo: () => Promise<{
    expiresAt: Date | null;
    expiresIn: number | null;
    isExpired: boolean;
  }>;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

export function useEnhancedAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('🔄 Initializing enhanced auth hook...');
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged((user) => {
      console.log('👤 Auth state changed:', user ? `${user.email} (${user.role})` : 'No user');
      setUser(user);
      setIsLoading(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Enhanced login with error handling
  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('🔐 Logging in user:', email);
      
      const result = await enhancedAuthService.signInWithEmailAndPassword(email, password);
      console.log('✅ Login successful');
      return result;
    } catch (err: any) {
      console.error('❌ Login failed:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced registration with error handling
  const register = useCallback(async (
    email: string, 
    password: string, 
    additionalData?: {
      firstName?: string;
      lastName?: string;
      role?: string;
      phoneNumber?: string;
      countryCode?: string;
    }
  ): Promise<AuthResult> => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('📝 Registering user:', email, additionalData?.role);
      
      const result = await enhancedAuthService.createUserWithEmailAndPassword(email, password, additionalData);
      console.log('✅ Registration successful');
      return result;
    } catch (err: any) {
      console.error('❌ Registration failed:', err.message);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced logout with error handling
  const logout = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      console.log('🚪 Logging out user');
      
      await enhancedAuthService.signOut();
      console.log('✅ Logout successful');
    } catch (err: any) {
      console.error('❌ Logout failed:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Email confirmation
  const confirmEmail = useCallback(async (email: string, code: string): Promise<void> => {
    try {
      setError(null);
      console.log('✅ Confirming email:', email);
      
      await enhancedAuthService.confirmSignUp(email, code);
      console.log('✅ Email confirmed successfully');
    } catch (err: any) {
      console.error('❌ Email confirmation failed:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Resend confirmation code
  const resendConfirmationCode = useCallback(async (email: string): Promise<void> => {
    try {
      setError(null);
      console.log('📧 Resending confirmation code:', email);
      
      await enhancedAuthService.resendConfirmationCode(email);
      console.log('✅ Confirmation code sent');
    } catch (err: any) {
      console.error('❌ Failed to resend confirmation code:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Password reset
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setError(null);
      console.log('🔑 Sending password reset email:', email);
      
      await enhancedAuthService.sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent');
    } catch (err: any) {
      console.error('❌ Failed to send password reset email:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Confirm password reset
  const confirmPasswordReset = useCallback(async (email: string, code: string, newPassword: string): Promise<void> => {
    try {
      setError(null);
      console.log('🔑 Confirming password reset:', email);
      
      await enhancedAuthService.confirmPasswordReset(email, code, newPassword);
      console.log('✅ Password reset successful');
    } catch (err: any) {
      console.error('❌ Password reset confirmation failed:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Get ID token
  const getIdToken = useCallback(async (): Promise<string | null> => {
    try {
      return await enhancedAuthService.getIdToken();
    } catch (err: any) {
      console.error('❌ Failed to get ID token:', err.message);
      setError(err.message);
      return null;
    }
  }, []);

  // Get access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      return await enhancedAuthService.getAccessToken();
    } catch (err: any) {
      console.error('❌ Failed to get access token:', err.message);
      setError(err.message);
      return null;
    }
  }, []);

  // Force token refresh
  const refreshTokens = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      console.log('🔄 Forcing token refresh');
      
      await enhancedAuthService.forceTokenRefresh();
      console.log('✅ Tokens refreshed successfully');
    } catch (err: any) {
      console.error('❌ Token refresh failed:', err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  // Check if user needs email verification
  const needsEmailVerification = useCallback((): boolean => {
    return enhancedAuthService.needsEmailVerification();
  }, []);

  // Get token information
  const getTokenInfo = useCallback(async () => {
    return await enhancedAuthService.getTokenInfo();
  }, []);

  // Computed values
  const currentIsAuthenticated = isAuthenticated();
  const currentRole = getUserRole();
  const currentIsAdmin = enhancedAuthService.isAdmin();
  const currentIsTherapist = enhancedAuthService.isTherapist();
  const currentIsClient = enhancedAuthService.isClient();

  return {
    // User state
    user,
    isAuthenticated: currentIsAuthenticated,
    isLoading,
    
    // User info
    role: currentRole,
    isAdmin: currentIsAdmin,
    isTherapist: currentIsTherapist,
    isClient: currentIsClient,
    
    // Auth actions
    login,
    register,
    logout,
    confirmEmail,
    resendConfirmationCode,
    resetPassword,
    confirmPasswordReset,
    
    // Token management
    getIdToken,
    getAccessToken,
    refreshTokens,
    
    // Utility functions
    needsEmailVerification,
    getTokenInfo,
    
    // Error state
    error,
    clearError
  };
}

export default useEnhancedAuth;