/**
 * Property-Based Testing Helpers
 * 
 * Utilities and generators for property-based testing with fast-check
 */

import fc from 'fast-check';

// ─── Custom Arbitraries ───────────────────────────────────────────────────────

/**
 * Generate valid email addresses
 */
export const emailArbitrary = (): fc.Arbitrary<string> => {
  return fc.tuple(
    fc.string({ minLength: 1, maxLength: 20, unit: fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')) }),
    fc.constantFrom('gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com'),
  ).map(([local, domain]) => `${local}@${domain}`);
};

/**
 * Generate valid phone numbers
 */
export const phoneArbitrary = (): fc.Arbitrary<string> => {
  return fc.tuple(
    fc.integer({ min: 200, max: 999 }),
    fc.integer({ min: 200, max: 999 }),
    fc.integer({ min: 1000, max: 9999 }),
  ).map(([area, prefix, line]) => `${area}-${prefix}-${line}`);
};

/**
 * Generate XSS attack payloads
 */
export const xssPayloadArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<div style="background:url(javascript:alert(\'XSS\'))">',
    '"><script>alert("XSS")</script>',
    '\';alert("XSS");//',
    '<script>eval(atob("YWxlcnQoIlhTUyIp"))</script>',
  );
};

/**
 * Generate SQL injection payloads
 */
export const sqlInjectionArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM users--",
    "admin'--",
    "' OR 1=1--",
    "1' AND '1'='1",
  );
};

/**
 * Generate potential PHI data
 */
export const phiDataArbitrary = (): fc.Arbitrary<Record<string, unknown>> => {
  return fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    email: emailArbitrary(),
    phone: phoneArbitrary(),
    ssn: fc.tuple(
      fc.integer({ min: 100, max: 999 }),
      fc.integer({ min: 10, max: 99 }),
      fc.integer({ min: 1000, max: 9999 }),
    ).map(([a, b, c]) => `${a}-${b}-${c}`),
    dob: fc.date({ min: new Date('1920-01-01'), max: new Date('2020-12-31') }),
    diagnosis: fc.constantFrom('Anxiety', 'Depression', 'PTSD', 'Bipolar Disorder'),
    notes: fc.lorem({ maxCount: 3 }),
  });
};

/**
 * Generate HTTP status codes
 */
export const httpStatusArbitrary = (): fc.Arbitrary<number> => {
  return fc.constantFrom(
    200, 201, 204, // Success
    400, 401, 403, 404, 422, // Client errors
    500, 502, 503, 504, // Server errors
    408, 429, // Retryable errors
  );
};

/**
 * Generate HTTP methods
 */
export const httpMethodArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
};

/**
 * Generate idempotent HTTP methods
 */
export const idempotentMethodArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom('GET', 'PUT', 'DELETE');
};

/**
 * Generate non-idempotent HTTP methods
 */
export const nonIdempotentMethodArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom('POST', 'PATCH');
};

/**
 * Generate API endpoints
 */
export const apiEndpointArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    '/api/v1/clients',
    '/api/v1/sessions',
    '/api/v1/notes',
    '/api/v1/consent',
    '/api/v1/documents',
    '/api/v1/auth/me',
    '/api/v1/audit/phi-access',
  );
};

/**
 * Generate user IDs
 */
export const userIdArbitrary = (): fc.Arbitrary<string> => {
  return fc.uuid();
};

/**
 * Generate resource IDs
 */
export const resourceIdArbitrary = (): fc.Arbitrary<string> => {
  return fc.uuid();
};

/**
 * Generate timestamps
 */
export const timestampArbitrary = (): fc.Arbitrary<string> => {
  return fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
    .map(d => d.toISOString());
};

/**
 * Generate audit event types
 */
export const auditEventTypeArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'PHI_ACCESS',
    'PHI_MODIFY',
    'PHI_DELETE',
    'PHI_EXPORT',
    'LOGIN',
    'LOGOUT',
  );
};

/**
 * Generate resource types
 */
export const resourceTypeArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom(
    'note',
    'consent',
    'document',
    'client_profile',
    'session_note',
  );
};

/**
 * Generate actions
 */
export const actionArbitrary = (): fc.Arbitrary<string> => {
  return fc.constantFrom('view', 'create', 'update', 'delete', 'download');
};

// ─── Test Utilities ───────────────────────────────────────────────────────────

/**
 * Check if a string contains any XSS patterns
 */
export const containsXSS = (str: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onfocus\s*=/i,
    /onstart\s*=/i,
    /eval\s*\(/i,
    /atob\s*\(/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(str));
};

/**
 * Check if a string contains SQL injection patterns
 */
export const containsSQLInjection = (str: string): boolean => {
  const sqlPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /DROP\s+TABLE/i,
    /UNION\s+SELECT/i,
    /--/,
    /;.*DROP/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
};

/**
 * Check if an object contains PHI fields
 */
export const containsPHI = (obj: Record<string, unknown>): boolean => {
  const phiFields = ['ssn', 'dob', 'diagnosis', 'treatment', 'medication', 'notes'];
  return Object.keys(obj).some(key => phiFields.includes(key.toLowerCase()));
};

/**
 * Check if storage contains any keys matching patterns
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
 * Mock localStorage for testing
 */
export class MockStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Setup test environment
 */
export const setupTestEnvironment = (): {
  localStorage: MockStorage;
  sessionStorage: MockStorage;
  cleanup: () => void;
} => {
  const mockLocalStorage = new MockStorage();
  const mockSessionStorage = new MockStorage();

  // Store original values
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;

  // Replace with mocks
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  Object.defineProperty(global, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  return {
    localStorage: mockLocalStorage,
    sessionStorage: mockSessionStorage,
    cleanup: () => {
      Object.defineProperty(global, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
      Object.defineProperty(global, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
      });
    },
  };
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Create a mock fetch response
 */
export const mockFetchResponse = <T>(
  data: T,
  status: number = 200,
  ok: boolean = true
): Response => {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: function() { return this; },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response;
};

/**
 * Property test configuration
 */
export const propertyTestConfig = {
  numRuns: 100,
  verbose: false,
  seed: undefined,
  path: undefined,
  endOnFailure: false,
};
