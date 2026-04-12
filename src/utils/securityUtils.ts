/**
 * Security Utilities
 * 
 * Common security functions used across the application
 */

import { SENSITIVE_FIELD_PATTERNS, PHI_FIELD_PATTERNS } from './securityConstants';

// ─── Field Detection ──────────────────────────────────────────────────────────

/**
 * Check if a field name indicates sensitive data
 */
export const isSensitiveField = (fieldName: string): boolean => {
  const lowerField = fieldName.toLowerCase();
  return SENSITIVE_FIELD_PATTERNS.some(pattern => lowerField.includes(pattern));
};

/**
 * Check if a field name indicates PHI data
 */
export const isPHIField = (fieldName: string): boolean => {
  const lowerField = fieldName.toLowerCase();
  // Exact match or contains pattern, but exclude common false positives
  const excludePatterns = ['username', 'displayname'];
  if (excludePatterns.some(pattern => lowerField === pattern)) {
    return false;
  }
  return PHI_FIELD_PATTERNS.some(pattern => lowerField.includes(pattern));
};

/**
 * Check if an object contains any PHI fields
 */
export const containsPHI = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).some(key => isPHIField(key));
};

/**
 * Check if an object contains any sensitive fields
 */
export const containsSensitiveData = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).some(key => isSensitiveField(key));
};

// ─── Storage Utilities ────────────────────────────────────────────────────────

/**
 * Check if browser storage contains any keys matching patterns
 */
export const storageContainsPattern = (
  storage: Storage,
  patterns: string[]
): boolean => {
  const keys = Object.keys(storage);
  return keys.some(key =>
    patterns.some(pattern => key.toLowerCase().includes(pattern.toLowerCase()))
  );
};

/**
 * Check if localStorage contains authentication tokens
 */
export const localStorageContainsTokens = (): boolean => {
  const tokenPatterns = ['token', 'access', 'refresh', 'jwt', 'auth'];
  return storageContainsPattern(localStorage, tokenPatterns);
};

/**
 * Check if sessionStorage contains authentication tokens
 */
export const sessionStorageContainsTokens = (): boolean => {
  const tokenPatterns = ['token', 'access', 'refresh', 'jwt', 'auth'];
  return storageContainsPattern(sessionStorage, tokenPatterns);
};

/**
 * Check if localStorage contains PHI
 */
export const localStorageContainsPHI = (): boolean => {
  return storageContainsPattern(localStorage, Array.from(PHI_FIELD_PATTERNS));
};

/**
 * Check if sessionStorage contains PHI
 */
export const sessionStorageContainsPHI = (): boolean => {
  return storageContainsPattern(sessionStorage, Array.from(PHI_FIELD_PATTERNS));
};

// ─── Nonce Generation ─────────────────────────────────────────────────────────

/**
 * Generate a cryptographically secure nonce
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for test environments
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...array));
};

/**
 * Generate a unique request ID
 */
export const generateRequestId = (): string => {
  return crypto.randomUUID();
};

// ─── Retry Logic ──────────────────────────────────────────────────────────────

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoffDelay = (
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number => {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};

/**
 * Check if an HTTP status code is retryable
 */
export const isRetryableStatus = (status: number): boolean => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
};

/**
 * Check if an HTTP method is idempotent
 */
export const isIdempotentMethod = (method: string): boolean => {
  const idempotentMethods = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];
  return idempotentMethods.includes(method.toUpperCase());
};

// ─── Error Handling ───────────────────────────────────────────────────────────

/**
 * Sanitize error message to remove potential PHI
 */
export const sanitizeErrorMessage = (message: string): string => {
  // Remove email addresses
  let sanitized = message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
  
  // Remove SSN
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]');
  
  return sanitized;
};

/**
 * Create a safe error object for logging
 */
export const createSafeError = (error: unknown): {
  message: string;
  name?: string;
  code?: string;
} => {
  if (error instanceof Error) {
    return {
      message: sanitizeErrorMessage(error.message),
      name: error.name,
      code: (error as any).code,
    };
  }
  
  return {
    message: sanitizeErrorMessage(String(error)),
  };
};

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate that a string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Validate that a string is a valid ISO 8601 timestamp
 */
export const isValidTimestamp = (str: string): boolean => {
  const date = new Date(str);
  return !isNaN(date.getTime()) && date.toISOString() === str;
};

/**
 * Validate that an object has required fields
 */
export const hasRequiredFields = <T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): boolean => {
  return fields.every(field => obj[field] !== undefined && obj[field] !== null);
};

// ─── CSP Utilities ────────────────────────────────────────────────────────────

/**
 * Build a CSP header string from directives
 */
export const buildCSPHeader = (
  directives: Record<string, string[]>,
  nonce?: string
): string => {
  const parts: string[] = [];
  
  for (const [directive, values] of Object.entries(directives)) {
    const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
    let directiveValues = values.join(' ');
    
    // Add nonce to script-src if provided
    if (directive === 'scriptSrc' && nonce) {
      directiveValues += ` 'nonce-${nonce}'`;
    }
    
    parts.push(`${directiveName} ${directiveValues}`);
  }
  
  return parts.join('; ');
};

/**
 * Extract nonce from CSP header
 */
export const extractNonceFromCSP = (csp: string): string | null => {
  const match = csp.match(/nonce-([A-Za-z0-9+/=]+)/);
  return match ? match[1] : null;
};

// ─── Time Utilities ───────────────────────────────────────────────────────────

/**
 * Sleep for a specified duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create a timeout promise
 */
export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
  timeoutError?: Error
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(timeoutError || new Error('Timeout')), ms)
    ),
  ]);
};

// ─── Object Utilities ─────────────────────────────────────────────────────────

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Redact sensitive fields from an object
 */
export const redactSensitiveFields = <T extends Record<string, unknown>>(
  obj: T
): T => {
  const redacted: any = {};
  
  for (const key in obj) {
    if (isSensitiveField(key)) {
      redacted[key] = '[REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redacted[key] = redactSensitiveFields(obj[key] as Record<string, unknown>);
    } else {
      redacted[key] = obj[key];
    }
  }
  
  return redacted as T;
};

/**
 * Redact PHI fields from an object
 */
export const redactPHIFields = <T extends Record<string, unknown>>(
  obj: T
): T => {
  const redacted: any = {};
  
  for (const key in obj) {
    if (isPHIField(key)) {
      redacted[key] = '[PHI_REDACTED]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redacted[key] = redactPHIFields(obj[key] as Record<string, unknown>);
    } else {
      redacted[key] = obj[key];
    }
  }
  
  return redacted as T;
};
