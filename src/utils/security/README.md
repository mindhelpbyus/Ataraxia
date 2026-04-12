# Security Infrastructure

This directory contains the core security utilities and configurations for the Ataraxia application.

## Overview

The security infrastructure provides:

1. **Security Constants** - Centralized configuration for all security features
2. **Security Utilities** - Common security functions (validation, sanitization, etc.)
3. **Input Sanitization** - XSS and injection prevention
4. **Secure Logging** - HIPAA-compliant logging with PHI redaction
5. **Property-Based Testing** - Test utilities and generators for security validation

## Files

### `securityConstants.ts`

Centralized security configuration including:

- API retry configuration
- Content Security Policy directives
- DOMPurify configuration
- Audit logging configuration
- PHI storage configuration
- Authentication configuration
- Rate limiting configuration
- Security headers
- Sensitive field patterns
- Error messages
- Feature flags

### `securityUtils.ts`

Common security utility functions:

- Field detection (sensitive data, PHI)
- Storage utilities (token/PHI detection)
- Nonce generation
- Retry logic helpers
- Error sanitization
- Validation functions
- CSP utilities
- Object redaction

### `sanitization.ts`

Input sanitization functions:

- HTML sanitization (XSS prevention)
- Text sanitization
- Email sanitization
- Phone sanitization
- URL sanitization
- File name sanitization
- Object sanitization
- Password validation
- Rate limiting

### `secureLogger.ts`

HIPAA-compliant logging service:

- PHI redaction
- Audit trail logging
- Environment-based log levels
- Pluggable storage backends
- Sensitive field detection

### `testHelpers.ts`

Property-based testing utilities:

- Custom arbitraries (email, phone, XSS payloads, etc.)
- Test utilities (XSS detection, SQL injection detection)
- Mock storage implementation
- Test environment setup
- Mock fetch responses

## Usage

### Import Security Utilities

```typescript
import {
  // Constants
  DEFAULT_RETRY_CONFIG,
  DOMPURIFY_CONFIG,
  AUDIT_CONFIG,
  
  // Utilities
  isSensitiveField,
  isPHIField,
  generateNonce,
  calculateBackoffDelay,
  isRetryableStatus,
  
  // Sanitization
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  
  // Logging
  logger,
  auditPHIAccess,
  AuditEventType,
} from './utils/security';
```

### Example: Sanitize User Input

```typescript
import { sanitizeHTML, sanitizeText } from './utils/security';

const userInput = '<script>alert("XSS")</script>';
const safe = sanitizeHTML(userInput); // Returns empty string or safe HTML
```

### Example: Check for PHI in Storage

```typescript
import { localStorageContainsPHI } from './utils/security';

if (localStorageContainsPHI()) {
  console.error('PHI detected in localStorage!');
}
```

### Example: Audit PHI Access

```typescript
import { auditPHIAccess } from './utils/security';

await auditPHIAccess(
  userId,
  clientId,
  'client_profile',
  'view'
);
```

### Example: Property-Based Testing

```typescript
import fc from 'fast-check';
import { xssPayloadArbitrary, containsXSS } from './utils/security';
import { sanitizeHTML } from './utils/security';

it('should sanitize all XSS payloads', () => {
  fc.assert(
    fc.property(
      xssPayloadArbitrary(),
      (payload) => {
        const sanitized = sanitizeHTML(payload);
        expect(containsXSS(sanitized)).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Security Properties

The security infrastructure enforces these properties:

1. **No Authentication Tokens in Browser Storage** - Tokens are never stored in localStorage or sessionStorage
2. **All User-Generated HTML is Sanitized** - XSS prevention through DOMPurify
3. **No PHI in Browser Storage** - PHI is only stored server-side
4. **Idempotent Requests Retry** - GET, PUT, DELETE retry with exponential backoff
5. **Non-Idempotent Requests Don't Retry** - POST, PATCH never retry automatically
6. **All PHI Access is Audited** - Every PHI access creates an audit log entry
7. **Production Builds Contain No Console Statements** - Console logs stripped in production
8. **CSP Nonces are Unique Per Request** - Each request gets a unique nonce
9. **Refactored Components Maintain Functionality** - Component refactoring preserves behavior

## Testing

Property-based tests validate security properties across all possible inputs:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Configuration

Security features can be configured via environment variables:

```env
# Enable/disable security features
VITE_STRICT_CSP=true
VITE_AUDIT_LOGGING=true
VITE_RATE_LIMITING=true
VITE_INPUT_SANITIZATION=true
```

## Best Practices

1. **Always sanitize user input** before rendering or storing
2. **Never store PHI in browser storage** - use server-side storage only
3. **Always audit PHI access** before displaying data
4. **Use HTTP-only cookies** for authentication tokens
5. **Validate all inputs** on both client and server
6. **Redact sensitive data** in logs and error messages
7. **Use property-based tests** to validate security properties
8. **Keep dependencies updated** and scan for vulnerabilities

## HIPAA Compliance

This security infrastructure helps maintain HIPAA compliance through:

- **Access Control** - HTTP-only cookies, session management
- **Audit Controls** - Comprehensive PHI access logging
- **Integrity** - Input sanitization, CSP
- **Transmission Security** - HTTPS enforced (backend)

## Support

For questions or issues with the security infrastructure, contact the security team or refer to the main design document at `.kiro/specs/security-fixes-mvp-blockers/design.md`.
