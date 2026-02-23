import { get, post, put, del } from './client';
import type { IDataService } from './types';

export const RealDataService: IDataService = {
    async get(collection: string, id: string) {
        return get(`/api/${collection}/${id}`);
    },
    async list(collection: string, filters?: any) {
        // Simple query string builder
        let queryStr = '';
        if (filters && Object.keys(filters).length > 0) {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            queryStr = `?${params.toString()}`;
        }
        return get(`/api/${collection}${queryStr}`);
    },
    async create(collection: string, data: any) {
        return post(`/api/${collection}`, data);
    },
    async update(collection: string, id: string, data: any) {
        return put(`/api/${collection}/${id}`, data);
    },
    async delete(collection: string, id: string) {
        return del(`/api/${collection}/${id}`);
    }
};
