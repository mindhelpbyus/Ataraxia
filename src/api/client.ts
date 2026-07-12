/**
 * api/client.ts — Ataraxia HTTP API Client
 *
 * ✅ SECURITY ARCHITECTURE:
 * - Auth is AWS Cognito. The access token is attached as `Authorization: Bearer`
 *   on every request (token comes from the Cognito SDK session — see lib/cognito.ts).
 * - The shared API Gateway validates the JWT (HttpJwtAuthorizer, default-deny).
 * - Zero console.log of response data (PHI-safe).
 * - X-Request-ID on every request for backend trace correlation.
 * - 401 → clear session + redirect to /login (token expired / invalid).
 */

import { logger } from '../utils/secureLogger';
import { getAccessToken as getCognitoAccessToken } from '../lib/cognito';

/** Shared HTTP API Gateway — backend-initial (no /api prefix) + billing_payment (/api/*). */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
/** Separate video-service backend (LiveKit rooms/tokens/transcripts). */
export const VIDEO_API_BASE_URL = import.meta.env.VITE_VIDEO_API_BASE_URL || '';

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
  /** Override the base URL (e.g. video-service). Defaults to the shared gateway. */
  baseUrl?: string;
}

// ─── Core Request ─────────────────────────────────────────────────────────────

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, isFormData = false, baseUrl = API_BASE_URL } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    // ✅ X-Request-ID for backend trace correlation (HIPAA audit)
    'X-Request-ID': crypto.randomUUID(),
    ...headers,
  };

  // ✅ Attach the Cognito access token (the API Gateway validates this JWT).
  // A caller-supplied Authorization header wins — billing_payment requires the
  // ID token (its Lambda reads custom:* claims), which api/billing.ts supplies.
  if (!requestHeaders['Authorization']) {
    const accessToken = await getCognitoAccessToken();
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
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

// ─── video-service helpers (separate backend; same Bearer token) ────────────────
export function videoGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', baseUrl: VIDEO_API_BASE_URL });
}
export function videoPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body, baseUrl: VIDEO_API_BASE_URL });
}

export function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ─── Legacy compatibility shims ─────────────────────────────────────────────────
// Auth is now Cognito (lib/cognito.ts). The frontend does not manually store tokens;
// the SDK manages them. These remain only so older imports keep compiling.

/** @deprecated The Cognito SDK manages tokens. No-op. */
export function setAuthTokens(_access: string, _refresh?: string): void {}

/** @deprecated Use the async Cognito session instead. Returns null synchronously. */
export function getAccessToken(): string | null {
  return null;
}

/** @deprecated The Cognito SDK manages the refresh token. Returns null. */
export function getRefreshToken(): string | null {
  return null;
}

/** @deprecated Use auth.logout() (Cognito sign-out). No-op. */
export function clearAuthTokens(): void {}

/** @deprecated Use the auth store / getCurrentUser(). Intentionally unreliable. */
export function isAuthenticated(): boolean {
  return false;
}