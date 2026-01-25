import { IDataService } from '../types';

const THERAPIST_API_URL = import.meta.env.VITE_THERAPIST_SERVICE_URL || 'http://localhost:3004/api';
const CLIENT_API_URL = import.meta.env.VITE_CLIENT_SERVICE_URL || 'http://localhost:3003/api';

export const RealDataService: IDataService = {
    get: async (collection: string, id: string) => {
        if (collection === 'therapists') {
            const response = await fetch(`${THERAPIST_API_URL}/therapists/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch therapist');
            }
            return await response.json();
        }
        
        if (collection === 'clients') {
            const response = await fetch(`${CLIENT_API_URL}/clients/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch client');
            }
            return await response.json();
        }
        
        throw new Error(`Collection '${collection}' not implemented yet`);
    },

    list: async (collection: string, filters?: any) => {
        if (collection === 'therapists') {
            const params = new URLSearchParams();
            if (filters) {
                Object.keys(filters).forEach(key => {
                    if (filters[key]) params.append(key, filters[key]);
                });
            }

            const response = await fetch(`${THERAPIST_API_URL}/therapists?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch therapists');
            }
            return await response.json();
        }
        
        if (collection === 'clients') {
            const params = new URLSearchParams();
            if (filters) {
                Object.keys(filters).forEach(key => {
                    if (filters[key]) params.append(key, filters[key]);
                });
            }

            const response = await fetch(`${CLIENT_API_URL}/clients?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            return await response.json();
        }
        
        throw new Error(`Collection '${collection}' not implemented yet`);
    },

    create: async (collection: string, data: any) => {
        throw new Error(`Create operation for collection '${collection}' not implemented yet`);
    },

    update: async (collection: string, id: string, data: any) => {
        if (collection === 'therapists') {
            const response = await fetch(`${THERAPIST_API_URL}/therapists/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update therapist');
            }

            return await response.json();
        }
        
        if (collection === 'clients') {
            const response = await fetch(`${CLIENT_API_URL}/clients/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update client');
            }

            return await response.json();
        }
        
        throw new Error(`Update operation for collection '${collection}' not implemented yet`);
    },

    delete: async (collection: string, id: string) => {
        throw new Error(`Delete operation for collection '${collection}' not implemented yet`);
    }
};
