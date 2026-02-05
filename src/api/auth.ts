/**
 * Authentication API
 * Handles user authentication, login, logout, and token management
 * Updated to align with Cloud-Agnostic Backend (Standard REST)
 */

import { post, get, setAuthTokens, clearAuthTokens } from './client';

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken?: string;
    expiresIn?: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    role: 'therapist' | 'client' | 'admin' | 'superadmin' | string;
    avatar?: string;
    account_status?: string;
    is_verified?: boolean;
  };
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar?: string;
  phone?: string;
  account_status?: string;
  createdAt?: string;
}

/**
 * Login user (Standard Email/Password)
 */
/**
 * Login user (Standard Email/Password)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await post<any>('/auth/login', { email, password }, false);

  // Backend now returns the old format: { token, user }
  const loginResponse: LoginResponse = {
    tokens: {
      accessToken: response.token,
      refreshToken: response.token, // Use same token for now
      idToken: response.token,
      expiresIn: '3600'
    },
    user: response.user,
    message: 'Login successful'
  };

  // Store tokens
  if (loginResponse.tokens && loginResponse.tokens.accessToken) {
    setAuthTokens(loginResponse.tokens.accessToken, loginResponse.tokens.refreshToken || '');
  }

  return loginResponse;
}

/**
 * Register user
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const response = await post<any>('/auth/register', data, false);
  return response;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await post('/auth/logout', {});
  } finally {
    clearAuthTokens();
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<UserInfo> {
  const response = await get<any>('/auth/me');
  // Handle nested response format: { success: true, data: { user }, message }
  const responseData = response.data || response;
  return responseData.user || responseData;
}

/**
 * Check if user is authenticated (Local check)
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}

// --- Legacy / Unused Placeholders (Kept to prevent breaking imports) ---

export async function refreshAccessToken(refreshToken: string): Promise<any> {
  // TODO: Implement refresh endpoint in backend
  return { accessToken: refreshToken, refreshToken };
}

export async function generateSessionToken(sessionId: string): Promise<any> {
  return { sessionToken: 'mock', expiresAt: new Date().toISOString() };
}

export async function validateToken(token?: string): Promise<any> {
  // Use /auth/me to validate
  try {
    const user = await getCurrentUser();
    return { valid: true, user };
  } catch (e) {
    return { valid: false };
  }
}
