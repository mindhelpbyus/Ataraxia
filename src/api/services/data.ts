import { IDataService } from '../types';
import { MockDataService } from '../mock/data';

const THERAPIST_API_URL = import.meta.env.VITE_THERAPIST_SERVICE_URL || 'http://localhost:3004/api';

export const RealDataService: IDataService = {
    get: async (collection: string, id: string) => {
        if (collection === 'therapists') {
            const response = await fetch(`${THERAPIST_API_URL}/therapists/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch therapist');
            }
            return await response.json();
        }
        // Fallback to mock for other collections not yet implemented
        return MockDataService.get(collection, id);
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
        return MockDataService.list(collection, filters);
    },

    create: async (collection: string, data: any) => {
        // Fallback to mock for now as per plan
        return MockDataService.create(collection, data);
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
        return MockDataService.update(collection, id, data);
    },

    delete: async (collection: string, id: string) => {
        // Fallback to mock for now
        return MockDataService.delete(collection, id);
    }
};
