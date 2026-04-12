/**
 * Property-Based Testing Setup
 * 
 * Configuration and setup for fast-check property-based tests
 */

import { beforeEach, afterEach } from 'vitest';
import { setupTestEnvironment } from '../src/utils/testHelpers';

// Global test environment
let testEnv: ReturnType<typeof setupTestEnvironment>;

// Setup before each test
beforeEach(() => {
  testEnv = setupTestEnvironment();
});

// Cleanup after each test
afterEach(() => {
  if (testEnv) {
    testEnv.cleanup();
  }
});

// Export for use in tests
export { testEnv };
