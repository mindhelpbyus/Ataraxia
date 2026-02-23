/**
 * tests/setup.ts — Vitest Global Test Setup
 *
 * Runs before every test suite. Extends matchers, mocks globals.
 */

import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ✅ Cleanup React Testing Library after each test
// Prevents DOM leakage between test suites
afterEach(() => {
    cleanup();
});

// ✅ Mock browser globals that don't exist in jsdom
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// ✅ Mock crypto.randomUUID (used in api/client.ts for X-Request-ID)
Object.defineProperty(globalThis, 'crypto', {
    value: {
        randomUUID: () => '00000000-0000-0000-0000-000000000000',
        getRandomValues: (arr: Uint8Array) => arr,
    },
});

// ✅ Suppress expected console.error in tests (ErrorBoundary tests throw intentionally)
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = (...args: unknown[]) => {
        // Suppress React ErrorBoundary caught error logging in tests
        if (typeof args[0] === 'string' && args[0].includes('ErrorBoundary')) return;
        if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) return;
        originalConsoleError(...args);
    };
});
afterEach(() => {
    console.error = originalConsoleError;
});
