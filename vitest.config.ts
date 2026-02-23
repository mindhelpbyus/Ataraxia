import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

/**
 * vitest.config.ts — Test Runner Configuration
 *
 * Chief Architect Prescribed: Phase 3 Testing (FRONTEND_ARCHITECTURE.md §1.5)
 * Target: 70%+ coverage on critical paths (auth, API, security)
 *
 * Run tests:
 *   npm test              — run all tests once
 *   npm run test:watch    — watch mode during development
 *   npm run test:coverage — generate coverage report (targets 70%+)
 *   npm run test:ui       — interactive Vitest UI
 */
export default defineConfig({
    plugins: [react()],
    test: {
        // Simulate browser DOM environment (required for React components)
        environment: 'jsdom',

        // Auto-import testing utilities (describe, it, expect, vi, etc.)
        globals: true,

        // Bootstrap @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
        setupFiles: ['./tests/setup.ts'],

        // ✅ Which files to treat as tests
        include: [
            'tests/**/*.{test,spec}.{ts,tsx}',
            'src/**/*.{test,spec}.{ts,tsx}',
        ],

        // ✅ Exclude non-test directories
        exclude: [
            'node_modules',
            'build',
            'dist',
            'src/backend/**',
        ],

        // ✅ Coverage configuration (Chief Architect target: 70%+)
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './tests/coverage',
            // Enforce minimum thresholds — fails CI if below
            thresholds: {
                statements: 70,
                branches: 65,
                functions: 70,
                lines: 70,
            },
            include: [
                'src/store/**',
                'src/api/**',
                'src/hooks/**',
                'src/services/**',
                'src/lib/**',
            ],
            exclude: [
                'src/**/*.d.ts',
                'src/assets/**',
                'src/backend/**',
                'src/components/ui/**', // Radix primitives — not our code
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
