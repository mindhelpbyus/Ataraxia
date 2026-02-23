/**
 * api/client.ts — Ataraxia HTTP API Client
 *
 * ✅ SECURITY ARCHITECTURE:
 * - Auth tokens travel in HTTP-only cookies (set by backend, never touched by JS)
 * - credentials: 'include' sends cookies on every cross-origin request
 * - Zero localStorage / sessionStorage token storage
 * - Zero console.log of response data (PHI-safe)
 * - X-Request-ID on every request for backend trace correlation
 * - Automatic 401 handling → redirect to /login (session expired)
 */

import { logger } from '../utils/secureLogger';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export class ApiException extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  isFormData?: boolean;
}

// ─── Core Request ─────────────────────────────────────────────────────────────

const getCsrfToken = (): string => {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : '';
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, isFormData = false } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    // ✅ X-Request-ID for backend trace correlation (HIPAA audit)
    'X-Request-ID': crypto.randomUUID(),
    // ✅ CSRF protection (HIPAA / PCI-DSS)
    'X-CSRF-Token': getCsrfToken(),
    ...headers,
  };

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    // ✅ 'include' sends HTTP-only auth cookies on every request
    // This is required for the cookie-based session model
    credentials: 'include',
  };

  if (body !== undefined) {
    fetchOptions.body = isFormData ? (body as BodyInit) : JSON.stringify(body);
  }


  try {
    logger.debug('API Request', { method, url: endpoint });

    const response = await fetch(url, fetchOptions);

    // ✅ 401 = session expired — wipe state, redirect to login
    if (response.status === 401) {
      logger.info('Session expired — redirecting to login');
      // Give the app a chance to clear Zustand/React Query state via event
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      window.location.replace('/login?reason=session-expired');
      // Never resolves — browser is navigating away
      return new Promise<T>(() => undefined);
    }

    if (!response.ok) {
      let error: { message?: string; code?: string } = {};
      const text = await response.text().catch(() => '');
      try {
        error = text ? JSON.parse(text) : {};
      } catch {
        error = { message: text || `HTTP ${response.status}` };
      }

      // ✅ Log status only — never log body (could contain PHI)
      logger.error('API error', { status: response.status, code: error.code });

      throw new ApiException({
        message: error.message || `Request failed with status ${response.status}`,
        code: error.code || `HTTP_${response.status}`,
        status: response.status,
        details: error,
      });
    }

    // Parse response body
    const text = await response.text();
    if (!text) return {} as T;

    const parsed = JSON.parse(text) as Record<string, unknown>;

    // Unwrap standard backend envelope: { success, data, message }
    if (parsed.data !== undefined) {
      return parsed.data as T;
    }

    return parsed as T;
  } catch (err) {
    if (err instanceof ApiException) throw err;

    // Network / parse error — log sanitized message only
    logger.error('Network error', { endpoint, method });
    throw new ApiException({
      message: err instanceof Error ? err.message : 'Network error',
      code: 'NETWORK_ERROR',
    });
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

export function post<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body });
}

export function put<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PUT', body });
}

export function patch<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body });
}

export function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ─── Legacy shims (keep build passing during incremental migration) ────────────
// These were used by old files that stored tokens in localStorage.
// With HTTP-only cookies, the frontend never stores or reads tokens.

/** @deprecated Tokens are in HTTP-only cookies. This is a no-op. */
export function setAuthTokens(_access: string, _refresh?: string): void {
  // No-op: tokens are managed by the backend via Set-Cookie headers.
  // The frontend never stores, reads, or transmits tokens directly.
}

/** @deprecated Always returns null. Token is in HTTP-only cookie. */
export function getAccessToken(): string | null {
  return null;
}

/** @deprecated Always returns null. Refresh token is in HTTP-only cookie. */
export function getRefreshToken(): string | null {
  return null;
}

/** @deprecated No-op. Tokens cleared by backend on POST /auth/logout. */
export function clearAuthTokens(): void {
  // The backend clears the Set-Cookie on logout response.
  // Nothing to do on the frontend.
}

/** @deprecated Don't use. Auth state comes from GET /api/v1/auth/me. */
export function isAuthenticated(): boolean {
  // Can't check HTTP-only cookies from JS. Use the auth store instead.
  // This is intentionally unreliable.
  return false;
}