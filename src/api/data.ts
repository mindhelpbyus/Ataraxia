import { get, post, put, del } from './client';
import type { IDataService } from './types';

/**
 * Generic data service. The `path` argument is the FULL gateway path — callers
 * must include the correct prefix per the route map in `.claude/context/domain-model.md`:
 *   - backend-initial routes have NO `/api/` prefix:  '/clients', '/appointments', '/therapists'
 *   - billing_payment routes DO use `/api/`:          '/api/wallet/me', '/api/invoices/:id'
 * (Legacy `/api/v1/*` paths do not exist on either backend.)
 */
function withQuery(path: string, filters?: Record<string, unknown>): string {
    if (!filters || Object.keys(filters).length === 0) return path;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, String(value));
    });
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
}

export const RealDataService: IDataService = {
    async get(path: string, id: string) {
        return get(`${path}/${id}`);
    },
    async list(path: string, filters?: any) {
        return get(withQuery(path, filters));
    },
    async create(path: string, data: any) {
        return post(path, data);
    },
    async update(path: string, id: string, data: any) {
        return put(`${path}/${id}`, data);
    },
    async delete(path: string, id: string) {
        return del(`${path}/${id}`);
    }
};
