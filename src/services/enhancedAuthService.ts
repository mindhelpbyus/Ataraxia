/**
 * Enhanced Authentication Service with Full Session Management
 * 
 * Provides Firebase-like experience with Cognito:
 * ✅ Automatic token refresh
 * ✅ Session persistence
 * ✅ Auto-login after registration
 * ✅ Auth state management
 * ✅ Secure token storage
 */

import { tokenManager } from './tokenManager';
import { CognitoProvider } from '../../Ataraxia-Next/src/lib/auth/providers/CognitoProvider';

// Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role?: string;
  emailVerified?: boolean;
}

export interface UserCredential {
  user: User;
}

export interface AuthResult {
  user: User;
  isNewUser: boolean;
  requiresVerification?: boolean;
}

type AuthStateCallback = (user: User | null) => void;

class EnhancedAuthService {
  private cognitoProvider: CognitoProvider;

  constructor() {
    this.cognitoProvider = new CognitoProvider(
      import.meta.env.VITE_AWS_REGION || 'us-west-2',
      import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-west-2_xeXlyFBMH',
      import.meta.env.VITE_COGNITO_CLIENT_ID || '7ek8kg1td2ps985r21m7727q98'
    );
  }

  /**
   * 🚀 ENHANCED REGISTRATION WITH AUTO-LOGIN
   * Registers user and automatically logs them in (for therapists)
   */
  async createUserWithEmailAndPassword(
    email: string,
    password: string,
    additionalData?: {
      firstName?: string;
      lastName?: string;
      role?: string;
      phoneNumber?: string;
      countryCode?: string;
    }
  ): Promise<AuthResult> {
    try {
      console.log('📝 Starting enhanced registration...');
      
      const result = await tokenManager.registerAndLogin(email, password, additionalData);
      
      return {
        user: result.user,
        isNewUser: true,
        requiresVerification: result.requiresVerification
      };
    } catch (error: any) {
      console.error('❌ Enhanced registration failed:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'UsernameExistsException') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      if (error.name === 'InvalidPasswordException') {
        throw new Error('Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters.');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * 🔐 ENHANCED LOGIN WITH SESSION MANAGEMENT
   * Logs in user with automatic token management
   */
  async signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Starting enhanced login...');
      
      const user = await tokenManager.login(email, password);
      
      return {
        user,
        isNewUser: false
      };
    } catch (error: any) {
      console.error('❌ Enhanced login failed:', error);
      
      // Handle specific Cognito errors
      if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email address before signing in. Check your inbox for a verification code.');
      }
      
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      if (error.name === 'UserNotFoundException') {
        throw new Error('No account found with this email address. Please sign up first.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * ✅ EMAIL CONFIRMATION
   * Confirms user email with verification code
   */
  async confirmSignUp(email: string, confirmationCode: string): Promise<void> {
    try {
      console.log('✅ Confirming email...');
      await this.cognitoProvider.confirmSignUp(email, confirmationCode);
      console.log('✅ Email confirmed successfully');
    } catch (error: any) {
      console.error('❌ Email confirmation failed:', error);
      
      if (error.name === 'CodeMismatchException') {
        throw new Error('Invalid verification code. Please check the code and try again.');
      }
      
      if (error.name === 'ExpiredCodeException') {
        throw new Error('Verification code has expired. Please request a new code.');
      }
      
      throw new Error(error.message || 'Email confirmation failed');
    }
  }

  /**
   * 📧 RESEND CONFIRMATION CODE
   * Resends email verification code
   */
  async resendConfirmationCode(email: string): Promise<void> {
    try {
      console.log('📧 Resending confirmation code...');
      await this.cognitoProvider.resendConfirmationCode(email);
      console.log('✅ Confirmation code sent');
    } catch (error: any) {
      console.error('❌ Failed to resend confirmation code:', error);
      throw new Error(error.message || 'Failed to resend confirmation code');
    }
  }

  /**
   * 🔑 PASSWORD RESET
   * Initiates password reset flow
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log('🔑 Sending password reset email...');
      await this.cognitoProvider.forgotPassword(email);
      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * 🔑 CONFIRM PASSWORD RESET
   * Confirms password reset with code
   */
  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    try {
      console.log('🔑 Confirming password reset...');
      await this.cognitoProvider.confirmForgotPassword(email, code, newPassword);
      console.log('✅ Password reset successful');
    } catch (error: any) {
      console.error('❌ Password reset confirmation failed:', error);
      
      if (error.name === 'CodeMismatchException') {
        throw new Error('Invalid reset code. Please check the code and try again.');
      }
      
      if (error.name === 'ExpiredCodeException') {
        throw new Error('Reset code has expired. Please request a new reset email.');
      }
      
      if (error.name === 'InvalidPasswordException') {
        throw new Error('Password must be at least 12 characters long and contain uppercase, lowercase, numbers, and special characters.');
      }
      
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * 🚪 ENHANCED LOGOUT
   * Logs out user and cleans up all session data
   */
  async signOut(): Promise<void> {
    try {
      await tokenManager.logout();
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      // Don't throw on logout errors, just log them
    }
  }

  /**
   * 👤 GET CURRENT USER (Firebase-compatible)
   * Returns current authenticated user
   */
  getCurrentUser(): User | null {
    return tokenManager.getCurrentUser();
  }

  /**
   * 👂 AUTH STATE LISTENER (Firebase-compatible)
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: AuthStateCallback): () => void {
    return tokenManager.onAuthStateChanged(callback);
  }

  /**
   * 🎫 GET ID TOKEN (Firebase-compatible)
   * Returns valid ID token, refreshing if necessary
   */
  async getIdToken(): Promise<string | null> {
    return await tokenManager.getIdToken();
  }

  /**
   * 🎫 GET ACCESS TOKEN
   * Returns valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string | null> {
    return await tokenManager.getAccessToken();
  }

  /**
   * ✅ CHECK AUTHENTICATION STATUS
   * Returns true if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * 👤 GET USER ROLE
   * Returns current user's role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * 🔍 ROLE CHECKING UTILITIES
   */
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin') || this.hasRole('super_admin');
  }

  isTherapist(): boolean {
    return this.hasRole('therapist');
  }

  isClient(): boolean {
    return this.hasRole('client');
  }

  /**
   * 📊 GET AUTH SYSTEM INFO
   * Returns information about the authentication system
   */
  getAuthSystemInfo() {
    return {
      provider: 'cognito',
      features: [
        'automatic_token_refresh',
        'session_persistence',
        'auto_login_after_registration',
        'secure_token_storage',
        'auth_state_management',
        'email_verification',
        'password_reset',
        'role_based_access'
      ],
      tokenManager: 'enhanced',
      sessionManagement: 'automatic'
    };
  }

  /**
   * 🔧 ADVANCED FEATURES
   */

  // Check if user needs email verification
  needsEmailVerification(): boolean {
    const user = this.getCurrentUser();
    return user ? !user.emailVerified : false;
  }

  // Get token expiration info
  async getTokenInfo(): Promise<{
    expiresAt: Date | null;
    expiresIn: number | null;
    isExpired: boolean;
  }> {
    const tokens = (tokenManager as any).getStoredTokens();
    if (!tokens) {
      return { expiresAt: null, expiresIn: null, isExpired: true };
    }

    const expiresAt = new Date(tokens.expiresAt * 1000);
    const expiresIn = Math.max(0, tokens.expiresAt - Date.now() / 1000);
    const isExpired = expiresIn <= 0;

    return { expiresAt, expiresIn, isExpired };
  }

  // Force token refresh
  async forceTokenRefresh(): Promise<void> {
    try {
      await (tokenManager as any).refreshTokens();
    } catch (error) {
      console.error('❌ Force token refresh failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const enhancedAuthService = new EnhancedAuthService();

// Export individual functions for convenience (Firebase-compatible)
export const createUserWithEmailAndPassword = enhancedAuthService.createUserWithEmailAndPassword.bind(enhancedAuthService);
export const signInWithEmailAndPassword = enhancedAuthService.signInWithEmailAndPassword.bind(enhancedAuthService);
export const confirmSignUp = enhancedAuthService.confirmSignUp.bind(enhancedAuthService);
export const resendConfirmationCode = enhancedAuthService.resendConfirmationCode.bind(enhancedAuthService);
export const sendPasswordResetEmail = enhancedAuthService.sendPasswordResetEmail.bind(enhancedAuthService);
export const confirmPasswordReset = enhancedAuthService.confirmPasswordReset.bind(enhancedAuthService);
export const signOut = enhancedAuthService.signOut.bind(enhancedAuthService);
export const getCurrentUser = enhancedAuthService.getCurrentUser.bind(enhancedAuthService);
export const onAuthStateChanged = enhancedAuthService.onAuthStateChanged.bind(enhancedAuthService);
export const getIdToken = enhancedAuthService.getIdToken.bind(enhancedAuthService);
export const getAccessToken = enhancedAuthService.getAccessToken.bind(enhancedAuthService);

// Export utility functions
export const isAuthenticated = enhancedAuthService.isAuthenticated.bind(enhancedAuthService);
export const getUserRole = enhancedAuthService.getUserRole.bind(enhancedAuthService);
export const hasRole = enhancedAuthService.hasRole.bind(enhancedAuthService);
export const isAdmin = enhancedAuthService.isAdmin.bind(enhancedAuthService);
export const isTherapist = enhancedAuthService.isTherapist.bind(enhancedAuthService);
export const isClient = enhancedAuthService.isClient.bind(enhancedAuthService);

// Export the service instance
export default enhancedAuthService;