/**
 * Security Constants and Configurations
 * 
 * Centralized security configuration for the Ataraxia application
 * Used across all security-related features
 */

// ─── API Retry Configuration ──────────────────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  retryableMethods: string[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableMethods: ['GET', 'PUT', 'DELETE'], // Idempotent only
};

// ─── Content Security Policy ──────────────────────────────────────────────────

export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  // Hardened: scripts are 'self' external modules only — no 'unsafe-inline', no CDNs.
  scriptSrc: ["'self'"],
  // style-src keeps 'unsafe-inline' for React style={{}} attributes; fonts self-hosted.
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
  fontSrc: ["'self'", 'data:'],
  objectSrc: ["'none'"],
  // Allow the shared API Gateway (https), video-service, LiveKit (wss), Cognito (ap-south-1),
  // and the 3rd-party lookup APIs used by address/password utilities.
  connectSrc: [
    "'self'",
    'https://*.execute-api.ap-south-1.amazonaws.com',
    'https://cognito-idp.ap-south-1.amazonaws.com',
    'wss://*.livekit.cloud',
    'https://*.livekit.cloud',
    'https://api.pwnedpasswords.com',
    'https://api.zippopotam.us',
    'https://api.postalpincode.in',
  ],
  frameAncestors: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
} as const;

// ─── DOMPurify Configuration ──────────────────────────────────────────────────

export const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'span', 'div', 'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
} as const;

// ─── Audit Logging Configuration ──────────────────────────────────────────────

export const AUDIT_CONFIG = {
  // PHI access must be logged before display
  logBeforeDisplay: true,
  // Retry audit logging on failure
  retryOnFailure: true,
  maxAuditRetries: 3,
  // Alert threshold for failed audit attempts
  failedAuditThreshold: 5,
  failedAuditWindowMs: 5 * 60 * 1000, // 5 minutes
} as const;

// ─── PHI Storage Configuration ────────────────────────────────────────────────

export const PHI_STORAGE_CONFIG = {
  // Never store PHI in browser storage
  allowLocalStorage: false,
  allowSessionStorage: false,
  // Server-side storage only
  serverSideOnly: true,
} as const;

// ─── Authentication Configuration ─────────────────────────────────────────────

export const AUTH_CONFIG = {
  // Use HTTP-only cookies exclusively
  useHttpOnlyCookies: true,
  // Never store tokens in localStorage
  allowLocalStorageTokens: false,
  // Session timeout (matches backend)
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  // Refresh token before expiry
  refreshBeforeExpiryMs: 5 * 60 * 1000, // 5 minutes
} as const;

// ─── Rate Limiting Configuration ──────────────────────────────────────────────

export const RATE_LIMIT_CONFIG = {
  // Login attempts
  loginMaxAttempts: 5,
  loginWindowMs: 15 * 60 * 1000, // 15 minutes
  // API requests
  apiMaxRequests: 100,
  apiWindowMs: 60 * 1000, // 1 minute
  // PHI access
  phiMaxRequests: 50,
  phiWindowMs: 60 * 1000, // 1 minute
} as const;

// ─── Security Headers ─────────────────────────────────────────────────────────

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
} as const;

// ─── Sensitive Field Patterns ─────────────────────────────────────────────────

export const SENSITIVE_FIELD_PATTERNS = [
  'password',
  'ssn',
  'social',
  'dob',
  'dateofbirth',
  'diagnosis',
  'medical',
  'health',
  'treatment',
  'medication',
  'insurance',
  'creditcard',
  'cardnumber',
  'cvv',
  'token',
  'secret',
  'apikey',
  'privatekey',
] as const;

// ─── PHI Field Patterns ───────────────────────────────────────────────────────

export const PHI_FIELD_PATTERNS = [
  'name',
  'email',
  'phone',
  'address',
  'ssn',
  'dob',
  'diagnosis',
  'treatment',
  'medication',
  'notes',
  'session',
  'consent',
  'document',
] as const;

// ─── Error Messages ───────────────────────────────────────────────────────────

export const SECURITY_ERROR_MESSAGES = {
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  INVALID_TOKEN: 'Invalid authentication token.',
  AUDIT_FAILED: 'Failed to log access. Please contact support.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// ─── Feature Flags ────────────────────────────────────────────────────────────

export const SECURITY_FEATURES = {
  // Enable strict CSP
  strictCSP: true,
  // Enable audit logging
  auditLogging: true,
  // Enable rate limiting
  rateLimiting: true,
  // Enable input sanitization
  inputSanitization: true,
  // Strip console logs in production
  stripConsoleLogs: true,
  // Enable dependency scanning
  dependencyScanning: true,
} as const;

// ─── Environment Detection ────────────────────────────────────────────────────

export const isProduction = (): boolean => {
  return import.meta.env.PROD === true;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV === true;
};

export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test';
};
