/**
 * API Client
 * Centralized HTTP client with authentication, error handling, and retry logic
 */


import { logger } from '../services/secureLogger';
import { sanitizeURL } from '../utils/sanitization';
import type { ApiLogEntry } from '../components/ApiDebugPanel';

// Use environment variable with localhost:3002 as development fallback
// Production should ALWAYS set VITE_API_BASE_URL in .env files
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

// Debug event emitter
type DebugListener = (entry: ApiLogEntry) => void;
const debugListeners: Set<DebugListener> = new Set();

export function addDebugListener(listener: DebugListener) {
  debugListeners.add(listener);
  return () => debugListeners.delete(listener);
}

function emitDebugEvent(entry: ApiLogEntry) {
  debugListeners.forEach(listener => listener(entry));
}

// Token storage
let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Set authentication tokens
 */
export function setAuthTokens(access: string, refresh?: string) {
  accessToken = access;
  if (refresh) {
    refreshToken = refresh;
  }

  // Store in localStorage
  localStorage.setItem('accessToken', access);
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  }
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (!refreshToken) {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

/**
 * Clear authentication tokens
 */
export function clearAuthTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ApiException extends Error {
  code?: string;
  status?: number;
  details?: any;

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
  body?: any;
  requireAuth?: boolean;
  isFormData?: boolean;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requireAuth = true,
    isFormData = false,
  } = options;

  // Build URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Always add Content-Type for proper CORS handling, unless it's FormData
  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Add Authorization header if required
  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new ApiException({
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        status: 401,
      });
    }
  }

  // Build request options
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    mode: 'cors',
    credentials: 'omit',
  };

  // Add body if present
  if (body) {
    if (isFormData) {
      fetchOptions.body = body;
    } else {
      fetchOptions.body = JSON.stringify(body);
    }
  }

  // Generate unique ID for this request
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  // Create initial log entry
  const logEntry: ApiLogEntry = {
    id: requestId,
    timestamp: startTime,
    method,
    url,
    requestHeaders: { ...requestHeaders },
    requestBody: body && !isFormData ? body : undefined,
  };

  try {
    logger.debug('API Request', { method, url: sanitizeURL(url) });

    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    logger.debug('API Response', {
      method,
      url: sanitizeURL(url),
      status: response.status,
      duration
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && requireAuth) {
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry the request with new token
        const retryHeaders = {
          ...requestHeaders,
          Authorization: `Bearer ${getAccessToken()}`,
        };
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        });

        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({
            message: `HTTP error! status: ${retryResponse.status}`,
          }));
          throw new ApiException({
            message: error.message || 'Request failed',
            code: error.code,
            status: retryResponse.status,
            details: error,
          });
        }

        // Empty response check
        const text = await retryResponse.text();
        const parsedResponse = text ? JSON.parse(text) : {};

        // Backend wraps responses in { data: {...} }, unwrap if present
        if (parsedResponse.data !== undefined) {
          return parsedResponse.data as T;
        }

        return parsedResponse as T;
      } else {
        // Refresh failed, clear tokens and throw error
        clearAuthTokens();
        throw new ApiException({
          message: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED',
          status: 401,
        });
      }
    }

    // Handle other errors
    if (!response.ok) {
      const errorText = await response.text();
      let error;

      try {
        error = JSON.parse(errorText);
      } catch (parseError) {
        error = {
          message: errorText || `HTTP error! status: ${response.status}`,
          rawResponse: errorText
        };
      }

      // Only log critical errors (not 500s which are expected during development)
      if (response.status !== 500) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: error,
          url: url,
          method: method
        });
      }

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Update log entry with error response
      logEntry.responseStatus = response.status;
      logEntry.responseHeaders = responseHeaders;
      logEntry.responseBody = error;
      logEntry.duration = duration;
      logEntry.error = error.message || error.error || 'Request failed';
      emitDebugEvent(logEntry);

      throw new ApiException({
        message: error.message || error.error || `Request failed with status ${response.status}`,
        code: error.code || `HTTP_${response.status}`,
        status: response.status,
        details: error,
      });
    }

    // Parse response
    const text = await response.text();
    const parsedResponse = text ? JSON.parse(text) : {};

    console.log('🔍 CLIENT DEBUG: parsedResponse:', parsedResponse);
    console.log('🔍 CLIENT DEBUG: parsedResponse.data:', parsedResponse.data);
    console.log('🔍 CLIENT DEBUG: parsedResponse.data !== undefined:', parsedResponse.data !== undefined);

    // Extract response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Update log entry with success response
    logEntry.responseStatus = response.status;
    logEntry.responseHeaders = responseHeaders;
    logEntry.responseBody = parsedResponse;
    logEntry.duration = duration;
    emitDebugEvent(logEntry);

    // Backend wraps responses in { data: {...} }, unwrap if present
    if (parsedResponse.data !== undefined) {
      console.log('🔍 CLIENT DEBUG: Unwrapping response.data:', parsedResponse.data);
      return parsedResponse.data as T;
    }

    console.log('🔍 CLIENT DEBUG: Returning full response:', parsedResponse);
    return parsedResponse as T;
  } catch (error) {
    if (error instanceof ApiException) {
      // Error already logged, just re-throw
      throw error;
    }

    // Network or parsing error
    console.error('❌ Network Error:', error);
    console.error('❌ URL:', url);
    console.error('❌ Method:', method);

    // Update log entry with network error
    const duration = Date.now() - startTime;
    logEntry.duration = duration;
    logEntry.error = error instanceof Error ? error.message : 'Network error';
    emitDebugEvent(logEntry);

    throw new ApiException({
      message: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
      details: error,
    });
  }
}

/**
 * Try to refresh the access token using refresh token
 */
async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!response.ok) {
      return false;
    }

    const responseBody = await response.json();
    // Handle wrapped response (standard backend format) or direct response
    const data = responseBody.data || responseBody;

    if (data.accessToken) {
      setAuthTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * GET request helper
 */
export async function get<T>(endpoint: string, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', requireAuth });
}

/**
 * POST request helper
 */
export async function post<T>(
  endpoint: string,
  body?: any,
  requireAuth = true
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'POST', body, requireAuth });
}

/**
 * PUT request helper
 */
export async function put<T>(
  endpoint: string,
  body?: any,
  requireAuth = true
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PUT', body, requireAuth });
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE', requireAuth });
}

/**
 * PATCH request helper
 */
export async function patch<T>(
  endpoint: string,
  body?: any,
  requireAuth = true
): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'PATCH', body, requireAuth });
}