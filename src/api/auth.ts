/**
 * api/auth.ts — Auth API (thin wrappers over backend endpoints)
 *
 * ✅ All identity operations go to the Gravity Reunion backend.
 * ✅ No tokens stored on the frontend — HTTP-only cookies only.
 * ✅ No Firebase SDK, no Cognito SDK, no JWT signing.
 */

import { post, get } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Canonical user shape returned by all backend auth endpoints */
export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  first_name?: string;
  last_name?: string;
  role: 'therapist' | 'client' | 'admin' | 'superadmin' | string;
  avatar?: string;
  account_status?: string;
  is_verified?: boolean;
  mfaEnabled?: boolean;
  // api/types User compat
  additional_roles?: string[];
  permissions?: string[];
  organizationId?: string;
  onboardingStatus?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

// ─── Auth Endpoints ───────────────────────────────────────────────────────────

/** Email + password login. Backend sets HTTP-only access & refresh cookies. */
export async function login(email: string, password: string): Promise<AuthUser> {
  return post<AuthUser>('/auth/login', { email, password });
}

/** Alias for login — used by useProviderAgnosticAuth and similar hooks */
export const signInWithEmailAndPassword = login;

/** Register new user. */
export async function register(data: RegisterRequest): Promise<AuthUser> {
  return post<AuthUser>('/auth/register', data);
}

/** Logout. Backend revokes refresh token and clears cookies. */
export async function logout(): Promise<void> {
  return post<void>('/auth/logout');
}

/** Get current authenticated user (validates session cookie). */
export async function getCurrentUser(): Promise<AuthUser> {
  return get<AuthUser>('/auth/me');
}

/** Send OTP to phone via backend (Twilio / Firebase Admin). */
export async function sendPhoneOtp(
  phoneNumber: string
): Promise<{ sessionId: string }> {
  return post<{ sessionId: string }>('/auth/phone/send-otp', { phoneNumber });
}

/** Verify phone OTP. Backend sets auth cookies on success. */
export async function verifyPhoneOtp(
  sessionId: string,
  otp: string
): Promise<AuthUser> {
  return post<AuthUser>('/auth/phone/verify-otp', { sessionId, otp });
}

/** Get Google OAuth URL (backend-driven flow). */
export async function getGoogleOAuthUrl(): Promise<{ url: string }> {
  return get<{ url: string }>('/auth/google/url');
}

/** Verify email with code sent by backend. */
export async function verifyEmail(email: string, code: string): Promise<void> {
  return post<void>('/auth/verify-email', { email, code });
}

/** Trigger password reset email via backend. */
export async function forgotPassword(email: string): Promise<void> {
  return post<void>('/auth/forgot-password', { email });
}

/** Reset password with token from email. */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  return post<void>('/auth/reset-password', { token, newPassword });
}

// ─── MFA ─────────────────────────────────────────────────────────────────────

export async function setupMFA(method?: string, phone?: string): Promise<{ qrCodeUrl: string; secret: string; manualEntryKey?: string; backupCodes?: string[] }> {
  return post<{ qrCodeUrl: string; secret: string; manualEntryKey?: string; backupCodes?: string[] }>('/auth/mfa/setup', { method, phone });
}

export async function verifyMFA(methodOrCode: string, code?: string, secret?: string): Promise<{ verified: boolean }> {
  return post<{ verified: boolean }>('/auth/mfa/verify', { method: methodOrCode, code, secret });
}

export async function getMFAStatus(): Promise<{ enabled: boolean; type: string | null }> {
  return get<{ enabled: boolean; type: string | null }>('/auth/mfa/status');
}

// ─── Session Management ───────────────────────────────────────────────────────

export interface SessionInfo {
  id: string;
  deviceInfo: {
    userAgent: string;
    ipAddress: string;
    platform?: string;
    browser?: string;
    os?: string;
    deviceType?: string;
  };
  createdAt: string;
  lastAccessedAt: string;
  isActive: boolean;
  isCurrent?: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

export async function getActiveSessions(): Promise<{ sessions: SessionInfo[]; analytics?: any }> {
  return get<{ sessions: SessionInfo[]; analytics?: any }>('/auth/sessions');
}

export async function invalidateAllSessions(othersOnly: boolean = false): Promise<{ invalidatedCount: number }> {
  return post<{ invalidatedCount: number }>('/auth/sessions/invalidate', { othersOnly });
}

// ─── Legacy class export (used by LoginPage.tsx as RealAuthService) ───────────

export const RealAuthService = {
  login,
  logout,
  register,
  getCurrentUser,
  sendPhoneOtp,
  verifyPhoneOtp,
  getGoogleOAuthUrl,
  setupMFA,
  verifyMFA,
  getMFAStatus,
  getActiveSessions,

  // LoginPage.tsx call sites — mapped to new backend endpoints
  checkPhoneUserExists: (idToken: string) =>
    post<{ exists: boolean; role: string }>('/auth/check-phone', { idToken }),
  loginTherapistWithPhone: (idToken: string) =>
    post<AuthUser>('/auth/login/phone-therapist', { idToken }),
  loginWithFirebase: (idToken: string, role?: string) =>
    post<AuthUser>('/auth/login/firebase', { idToken, role }),
  checkEmailPhoneExists: (email: string | null) =>
    post<{ exists: boolean; role: string }>('/auth/check-email', { email }),

  registerTherapistWithGoogle: (idToken: string, firstName: string, lastName: string, email: string, password?: string) =>
    post<{ user: AuthUser & { account_status: string }; token: string }>('/auth/therapist-google-register', { idToken, first_name: firstName, last_name: lastName, email, password }),

  registerTherapistWithPhone: (idToken: string, firstName: string, lastName: string, email: string, password?: string) =>
    post<{ user: AuthUser & { account_status: string }; token: string }>('/auth/therapist-phone-register', { idToken, first_name: firstName, last_name: lastName, email, password }),
};

export const localAuthService = {
  isLocalMode: () => false,
  login: () => Promise.reject(new Error('Use backend API')),
  register: () => Promise.reject(new Error('Use backend API')),
};

export const firebasePhoneAuth = {
  sendPhoneVerification: sendPhoneOtp,
  verifyPhoneCode: (_session: any, otp: string, sessionId: string) => verifyPhoneOtp(sessionId, otp),
  cleanup: () => { },
};

export const firebaseGoogleAuth = {
  signInWithPopup: async () => {
    const { url } = await getGoogleOAuthUrl();
    window.location.href = url;
    return null as any; // redirects — never resolves
  },
};
