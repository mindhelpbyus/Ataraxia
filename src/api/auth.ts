/**
 * Authentication API
 * Handles user authentication, login, logout, and token management
 */

import { post, get, setAuthTokens, clearAuthTokens } from './client';

export interface LoginRequest {
  userId: string;
  email: string;
  role: 'therapist' | 'client' | 'admin' | 'superadmin';
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: 'therapist' | 'client' | 'admin' | 'superadmin';
    avatar?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SessionTokenRequest {
  sessionId: string;
}

export interface SessionTokenResponse {
  sessionToken: string;
  expiresAt: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'client' | 'admin' | 'superadmin';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: UserInfo;
  expiresAt?: string;
}

export interface TestLoginRequest {
  userId: string;
  role?: 'therapist' | 'client' | 'admin' | 'superadmin';
}

/**
 * Login user (using register-or-login endpoint)
 * Backend expects: { userId, email, role, firstName?, lastName? }
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Send exactly what backend expects - userId, email, role
  const requestBody = {
    userId: credentials.userId,
    email: credentials.email,
    role: credentials.role
  };

  // API client already unwraps the 'data' property, so response is already the inner data
  const response = await post<any>('/auth/register-or-login', requestBody, false);

  // Response is already unwrapped: { user, tokens }
  const loginResponse: LoginResponse = {
    tokens: response.tokens,
    user: response.user
  };

  // Store tokens
  setAuthTokens(loginResponse.tokens.accessToken, loginResponse.tokens.refreshToken);

  return loginResponse;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const response = await post<RefreshTokenResponse>(
    '/auth/refresh',
    { refreshToken },
    false
  );

  // Update stored tokens
  setAuthTokens(response.accessToken, response.refreshToken);

  return response;
}

/**
 * Generate session-specific JWT token
 */
export async function generateSessionToken(
  sessionId: string
): Promise<SessionTokenResponse> {
  return post<SessionTokenResponse>('/auth/session-token', { sessionId });
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await post('/auth/logout', {});
  } finally {
    // Always clear tokens even if API call fails
    clearAuthTokens();
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<UserInfo> {
  return get<UserInfo>('/auth/me');
}

/**
 * Validate token
 */
export async function validateToken(
  token?: string
): Promise<ValidateTokenResponse> {
  if (token) {
    return get<ValidateTokenResponse>(`/auth/validate?token=${token}`, false);
  }
  return get<ValidateTokenResponse>('/auth/validate');
}

/**
 * Generate test login tokens (dev only)
 */
export async function testLogin(request: TestLoginRequest): Promise<LoginResponse> {
  const response = await post<any>('/auth/test-login', request, false);

  // Store tokens - response structure matches LoginResponse
  if (response.tokens) {
    setAuthTokens(response.tokens.accessToken, response.tokens.refreshToken);
  }

  return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}
