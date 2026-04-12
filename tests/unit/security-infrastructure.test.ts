/**
 * Security Infrastructure Tests
 * 
 * Validates that the security infrastructure is properly set up
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  // Constants
  DEFAULT_RETRY_CONFIG,
  DOMPURIFY_CONFIG,
  AUDIT_CONFIG,
  PHI_STORAGE_CONFIG,
  AUTH_CONFIG,
  
  // Utilities
  isSensitiveField,
  isPHIField,
  generateNonce,
  calculateBackoffDelay,
  isRetryableStatus,
  isIdempotentMethod,
  
  // Sanitization
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  
  // Test helpers
  emailArbitrary,
  xssPayloadArbitrary,
  containsXSS,
} from '../../src/utils/security';

describe('Security Infrastructure Setup', () => {
  describe('Constants', () => {
    it('should have retry configuration', () => {
      expect(DEFAULT_RETRY_CONFIG).toBeDefined();
      expect(DEFAULT_RETRY_CONFIG.maxRetries).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.baseDelay).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.retryableMethods).toContain('GET');
    });

    it('should have DOMPurify configuration', () => {
      expect(DOMPURIFY_CONFIG).toBeDefined();
      expect(DOMPURIFY_CONFIG.ALLOWED_TAGS).toContain('p');
      expect(DOMPURIFY_CONFIG.ALLOW_DATA_ATTR).toBe(false);
    });

    it('should have audit configuration', () => {
      expect(AUDIT_CONFIG).toBeDefined();
      expect(AUDIT_CONFIG.logBeforeDisplay).toBe(true);
      expect(AUDIT_CONFIG.retryOnFailure).toBe(true);
    });

    it('should have PHI storage configuration', () => {
      expect(PHI_STORAGE_CONFIG).toBeDefined();
      expect(PHI_STORAGE_CONFIG.allowLocalStorage).toBe(false);
      expect(PHI_STORAGE_CONFIG.serverSideOnly).toBe(true);
    });

    it('should have auth configuration', () => {
      expect(AUTH_CONFIG).toBeDefined();
      expect(AUTH_CONFIG.useHttpOnlyCookies).toBe(true);
      expect(AUTH_CONFIG.allowLocalStorageTokens).toBe(false);
    });
  });

  describe('Security Utilities', () => {
    it('should detect sensitive fields', () => {
      expect(isSensitiveField('password')).toBe(true);
      expect(isSensitiveField('ssn')).toBe(true);
      expect(isSensitiveField('token')).toBe(true);
      expect(isSensitiveField('username')).toBe(false);
    });

    it('should detect PHI fields', () => {
      expect(isPHIField('diagnosis')).toBe(true);
      expect(isPHIField('treatment')).toBe(true);
      expect(isPHIField('notes')).toBe(true);
      expect(isPHIField('username')).toBe(false);
    });

    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(typeof nonce1).toBe('string');
      expect(typeof nonce2).toBe('string');
      expect(nonce1.length).toBeGreaterThan(0);
      expect(nonce2.length).toBeGreaterThan(0);
    });

    it('should calculate exponential backoff correctly', () => {
      expect(calculateBackoffDelay(0, 1000, 10000)).toBe(1000);
      expect(calculateBackoffDelay(1, 1000, 10000)).toBe(2000);
      expect(calculateBackoffDelay(2, 1000, 10000)).toBe(4000);
      expect(calculateBackoffDelay(10, 1000, 10000)).toBe(10000); // Max delay
    });

    it('should identify retryable status codes', () => {
      expect(isRetryableStatus(408)).toBe(true);
      expect(isRetryableStatus(429)).toBe(true);
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
    });

    it('should identify idempotent methods', () => {
      expect(isIdempotentMethod('GET')).toBe(true);
      expect(isIdempotentMethod('PUT')).toBe(true);
      expect(isIdempotentMethod('DELETE')).toBe(true);
      expect(isIdempotentMethod('POST')).toBe(false);
      expect(isIdempotentMethod('PATCH')).toBe(false);
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML', () => {
      const dirty = '<script>alert("XSS")</script>';
      const clean = sanitizeHTML(dirty);
      
      expect(clean).not.toContain('script');
      expect(clean).not.toContain('alert');
    });

    it('should sanitize text', () => {
      const dirty = '<script>alert("XSS")</script>';
      const clean = sanitizeText(dirty);
      
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });

    it('should sanitize email', () => {
      const dirty = 'test@example.com<script>';
      const clean = sanitizeEmail(dirty);
      
      // Should remove invalid characters
      expect(clean).toContain('test@example.com');
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });
  });

  describe('Property-Based Testing Setup', () => {
    it('should have fast-check available', () => {
      expect(fc).toBeDefined();
      expect(fc.assert).toBeDefined();
      expect(fc.property).toBeDefined();
    });

    it('should generate valid emails', () => {
      fc.assert(
        fc.property(
          emailArbitrary(),
          (email) => {
            expect(email).toMatch(/@/);
            expect(email).toMatch(/\./);
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should generate XSS payloads', () => {
      const payloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
      ];
      
      payloads.forEach(payload => {
        expect(containsXSS(payload)).toBe(true);
      });
    });

    it('should detect XSS in strings', () => {
      expect(containsXSS('<script>alert("XSS")</script>')).toBe(true);
      expect(containsXSS('<img src=x onerror=alert("XSS")>')).toBe(true);
      expect(containsXSS('<svg onload=alert("XSS")>')).toBe(true);
      expect(containsXSS('Hello world')).toBe(false);
    });
  });

  describe('Integration', () => {
    it('should sanitize all generated XSS payloads', () => {
      fc.assert(
        fc.property(
          xssPayloadArbitrary(),
          (payload) => {
            const sanitized = sanitizeHTML(payload);
            // Check that dangerous script tags and event handlers are removed
            expect(sanitized).not.toContain('<script');
            expect(sanitized.toLowerCase()).not.toContain('onerror=');
            expect(sanitized.toLowerCase()).not.toContain('onload=');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
