/**
 * tests/unit/apiClient.test.ts
 *
 * Unit tests for the API client — security-critical code that
 * handles all HTTP communication, CSRF tokens, and X-Request-IDs.
 *
 * Chief Architect priorities: CSRF (GAP-5), X-Request-ID (GAP-12),
 * credentials:include (HTTP-only cookies), error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, ApiException } from '../../src/api/client';

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mockSuccessResponse(body: unknown = {}) {
    return Promise.resolve(
        new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    );
}

function mockErrorResponse(status: number, body = { error: 'Server error' }) {
    return Promise.resolve(
        new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': 'application/json' },
        })
    );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('apiRequest()', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // ✅ Clear cookies before each test
        document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        // ✅ Stub window.location.replace so 401-triggered redirects don't hang jsdom
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { ...window.location, replace: vi.fn(), href: '' },
        });
    });

    // ─── Request structure ─────────────────────────────────────────────────────
    describe('request headers', () => {
        it('sends credentials: include on every request (HTTP-only cookie support)', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/test');

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.credentials).toBe('include');
        });

        it('sends X-Request-ID header for backend trace correlation', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/test');

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.headers['X-Request-ID']).toBeTruthy();
            expect(typeof fetchOptions.headers['X-Request-ID']).toBe('string');
        });

        it('sends X-CSRF-Token header from cookie (CSRF protection)', async () => {
            // Set a CSRF token in the cookie
            document.cookie = 'csrf_token=test-csrf-token-abc123';
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/test', { method: 'POST', body: {} });

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.headers['X-CSRF-Token']).toBe('test-csrf-token-abc123');
        });

        it('sends empty X-CSRF-Token when no cookie is set (graceful degradation)', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/test');

            const [, fetchOptions] = mockFetch.mock.calls[0];
            // Should not throw — CSRF token is empty string if cookie absent
            expect(fetchOptions.headers['X-CSRF-Token']).toBe('');
        });

        it('sets Content-Type application/json for non-FormData requests', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/test', { method: 'POST', body: { name: 'Test' } });

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.headers['Content-Type']).toBe('application/json');
        });

        it('does NOT set Content-Type for FormData requests', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));
            const formData = new FormData();

            await apiRequest('/api/v1/upload', { method: 'POST', body: formData, isFormData: true });

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.headers['Content-Type']).toBeUndefined();
        });
    });

    // ─── URL construction ──────────────────────────────────────────────────────
    describe('URL construction', () => {
        it('prepends API_BASE_URL to relative endpoints', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('/api/v1/appointments');

            const [url] = mockFetch.mock.calls[0];
            expect(url).toMatch(/\/api\/v1\/appointments$/);
        });

        it('uses absolute URL as-is when endpoint starts with http', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));

            await apiRequest('https://custom.api.com/endpoint');

            const [url] = mockFetch.mock.calls[0];
            expect(url).toBe('https://custom.api.com/endpoint');
        });
    });

    // ─── Response handling ─────────────────────────────────────────────────────
    describe('response handling', () => {
        it('returns parsed JSON body on success', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ user: { id: '123' } }));

            const result = await apiRequest<{ user: { id: string } }>('/api/v1/me');

            expect(result).toEqual({ user: { id: '123' } });
        });

        it('throws ApiException on 4xx responses (non-401)', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse(422, { error: 'Unprocessable' }));

            await expect(apiRequest('/api/v1/protected')).rejects.toThrow(ApiException);
        });

        it('includes status code in ApiException', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse(403, { error: 'Forbidden' }));

            try {
                await apiRequest('/api/v1/admin');
            } catch (err) {
                expect(err).toBeInstanceOf(ApiException);
                expect((err as ApiException).status).toBe(403);
            }
        });

        it('throws ApiException on 5xx responses', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse(500, { error: 'Internal server error' }));

            await expect(apiRequest('/api/v1/test')).rejects.toThrow(ApiException);
        });

        it('dispatches auth:session-expired event on 401', async () => {
            mockFetch.mockResolvedValueOnce(mockErrorResponse(401));

            // The client returns a never-resolving promise after 401 dispatch (intentional,
            // so the browser can navigate away). Race it against a short timeout to confirm
            // the event fires before the promise stalls.
            const eventFired = new Promise<boolean>((resolve) => {
                window.addEventListener('auth:session-expired', () => resolve(true), { once: true });
            });
            const timedOut = new Promise<boolean>((resolve) =>
                setTimeout(() => resolve(false), 2000)
            );

            apiRequest('/api/v1/protected').catch(() => { }); // intentionally don't await

            const result = await Promise.race([eventFired, timedOut]);
            expect(result).toBe(true);
        });
    });

    // ─── HTTP methods ──────────────────────────────────────────────────────────
    describe('HTTP methods', () => {
        it('defaults to GET', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: [] }));

            await apiRequest('/api/v1/items');

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.method).toBe('GET');
        });

        it('serializes body to JSON for POST requests', async () => {
            mockFetch.mockResolvedValueOnce(mockSuccessResponse({ data: {} }));
            const payload = { name: 'Appointment', date: '2026-01-01' };

            await apiRequest('/api/v1/appointments', { method: 'POST', body: payload });

            const [, fetchOptions] = mockFetch.mock.calls[0];
            expect(fetchOptions.body).toBe(JSON.stringify(payload));
        });
    });
});
