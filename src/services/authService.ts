/**
 * Ataraxia Authentication Service
 * 
 * Pure Cognito/Lambda authentication service without Firebase dependencies.
 * Uses hybrid approach: Lambda API (primary) + Direct Cognito (fallback)
 * 
 * FEATURES:
 * - Lambda API service (recommended for business logic)
 * - Direct AWS Cognito fallback (for reliability)
 * - Automatic token management
 * - Healthcare-grade security
 * - Therapist verification integration
 */

import hybridAuth, { 
  createUserWithEmailAndPassword as cognitoCreateUser,
  signInWithEmailAndPassword as cognitoSignIn,
  confirmSignUp as cognitoConfirmSignUp,
  resendConfirmationCode as cognitoResendCode,
  sendPasswordResetEmail as cognitoResetEmail,
  confirmPasswordReset as cognitoConfirmReset,
  signOut as cognitoSignOut,
  getCurrentUser as cognitoGetCurrentUser,
  onAuthStateChanged as cognitoOnAuthStateChanged,
  getTherapistStatus as cognitoGetTherapistStatus,
  isCognitoConfigured
} from './hybridAuth';

// Configuration
const USE_API_FIRST = import.meta.env.VITE_USE_API_FIRST !== 'false'; // Default to API first

// Types for Ataraxia
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
};

export type UserProfile = {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'therapist' | 'client';
  createdAt: any;
  updatedAt: any;
  mfaEnabled?: boolean;
};

export type UserCredential = {
  user: User;
};

export type AuthResult = {
  user: User;
  isNewUser: boolean;
  userProfile: UserProfile;
};

/**
 * Log auth system usage for monitoring
 */
function logAuthUsage(action: string, success: boolean, method?: string) {
  const methodInfo = method ? ` (${method})` : '';
  console.log(`[AUTH] COGNITO${methodInfo} - ${action} - ${success ? 'SUCCESS' : 'FAILED'}`);
}

/**
 * Configure authentication strategy
 */
function setAuthStrategy(useApiFirst: boolean): void {
  hybridAuth.setUseApiFirst(useApiFirst);
  console.log(`🔧 Auth strategy set to: ${useApiFirst ? 'Lambda API First' : 'Direct Cognito First'}`);
}

/**
 * Get current auth configuration
 */
function getAuthConfig() {
  return {
    useApiFirst: USE_API_FIRST,
    cognitoConfigured: isCognitoConfigured,
    hybridConfig: hybridAuth.getConfig()
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await cognitoSignIn(email, password);
    logAuthUsage('signIn', true, 'hybrid');
    
    // Convert to AuthResult format
    return {
      user: result.user,
      isNewUser: false, // Existing user logging in
      userProfile: {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        role: 'client', // Default, will be updated from database
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  } catch (error: any) {
    logAuthUsage('signIn', false, 'hybrid');
    throw error;
  }
}

/**
 * Create user with email and password
 */
export async function createUserWithEmailAndPassword(
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
    // Use our local API server for registration
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        role: additionalData?.role || 'therapist',
        phoneNumber: additionalData?.phoneNumber || '',
        countryCode: additionalData?.countryCode || '+91'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    logAuthUsage('createUser', true, 'api');
    
    // Convert API response to AuthResult format
    const user: User = {
      uid: result.user.auth_provider_id,
      email: result.user.email,
      displayName: result.user.name,
      phoneNumber: result.user.phone_number || null,
      photoURL: null
    };

    return {
      user,
      isNewUser: true,
      userProfile: {
        uid: result.user.auth_provider_id,
        email: result.user.email,
        displayName: result.user.name,
        firstName: additionalData?.firstName || '',
        lastName: additionalData?.lastName || '',
        role: (additionalData?.role as any) || 'therapist',
        phoneNumber: result.user.phone_number || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  } catch (error: any) {
    logAuthUsage('createUser', false, 'api');
    throw error;
  }
}

/**
 * Confirm email signup
 */
export async function confirmSignUp(email: string, confirmationCode: string): Promise<void> {
  try {
    await cognitoConfirmSignUp(email, confirmationCode);
    logAuthUsage('confirmSignUp', true, 'hybrid');
  } catch (error: any) {
    logAuthUsage('confirmSignUp', false, 'hybrid');
    throw error;
  }
}

/**
 * Resend confirmation code
 */
export async function resendConfirmationCode(email: string): Promise<void> {
  try {
    await cognitoResendCode(email);
    logAuthUsage('resendCode', true, 'hybrid');
  } catch (error: any) {
    logAuthUsage('resendCode', false, 'hybrid');
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    await cognitoResetEmail(email);
    logAuthUsage('resetEmail', true, 'hybrid');
  } catch (error: any) {
    logAuthUsage('resetEmail', false, 'hybrid');
    throw error;
  }
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
  try {
    await cognitoConfirmReset(email, code, newPassword);
    logAuthUsage('confirmReset', true, 'hybrid');
  } catch (error: any) {
    logAuthUsage('confirmReset', false, 'hybrid');
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  try {
    await cognitoSignOut();
    logAuthUsage('signOut', true, 'hybrid');
  } catch (error: any) {
    logAuthUsage('signOut', false, 'hybrid');
    // Don't throw on sign out errors, just log them
    console.error('Sign out error:', error);
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  try {
    return cognitoGetCurrentUser();
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return cognitoOnAuthStateChanged(callback);
}

/**
 * Get user profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    // For now, return basic profile from token
    const user = cognitoGetCurrentUser();
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      role: 'client', // Default, should be fetched from database
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Get therapist verification status
 */
export async function getTherapistStatus(uid: string): Promise<any> {
  try {
    return await cognitoGetTherapistStatus(uid);
  } catch (error: any) {
    logAuthUsage('getTherapistStatus', false, 'hybrid');
    throw error;
  }
}

/**
 * Check if user needs email verification
 */
export function needsEmailVerification(): boolean {
  return true; // Cognito always requires email verification
}

/**
 * Get authentication system info
 */
export function getAuthSystemInfo() {
  return {
    provider: 'cognito',
    cognitoConfigured: isCognitoConfigured,
    useApiFirst: USE_API_FIRST,
    features: [
      'email_password_auth',
      'email_verification',
      'password_reset',
      'therapist_verification',
      'jwt_tokens',
      'lambda_api_integration',
      'direct_cognito_fallback'
    ]
  };
}

/**
 * Utility function to check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Utility function to get user role
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  if (!user) return null;
  
  // Try to get role from stored token
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user?.role || 'client';
    }
  } catch (error) {
    console.error('Failed to get user role:', error);
  }
  
  return 'client'; // Default role
}

/**
 * Utility function to check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getUserRole();
  return userRole === role;
}

/**
 * Utility function to check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Utility function to check if user is therapist
 */
export function isTherapist(): boolean {
  return hasRole('therapist');
}

/**
 * Utility function to check if user is client
 */
export function isClient(): boolean {
  return hasRole('client');
}

// Export the hybrid auth instance for direct access
export { hybridAuth };

// Export configuration functions
export { setAuthStrategy, getAuthConfig };

// Default export for convenience
export default {
  // Core authentication
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  confirmSignUp,
  resendConfirmationCode,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  getUserProfile,
  getTherapistStatus,
  
  // Utility functions
  needsEmailVerification,
  getAuthSystemInfo,
  isAuthenticated,
  getUserRole,
  hasRole,
  isAdmin,
  isTherapist,
  isClient,
  
  // Configuration
  setAuthStrategy,
  getAuthConfig,
  
  // Direct access to hybrid auth
  hybridAuth
};