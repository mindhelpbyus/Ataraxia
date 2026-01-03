import { IDataService } from '../types';

const getStorageKey = (collection: string) => `ataraxia_data_${collection}`;

export const MockDataService: IDataService = {
    async get(collection: string, id: string): Promise<any> {
        const items = await this.list(collection);
        return items.find((item: any) => item.id === id) || null;
    },

    async list(collection: string, filters?: any): Promise<any[]> {
        const key = getStorageKey(collection);
        const stored = localStorage.getItem(key);
        let items = stored ? JSON.parse(stored) : [];

        if (filters) {
            items = items.filter((item: any) => {
                return Object.keys(filters).every(key => item[key] === filters[key]);
            });
        }

        return items;
    },

    async create(collection: string, data: any): Promise<any> {
        const key = getStorageKey(collection);
        const items = await this.list(collection);

        const newItem = {
            id: data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        items.push(newItem);
        localStorage.setItem(key, JSON.stringify(items));
        return newItem;
    },

    async update(collection: string, id: string, data: any): Promise<any> {
        const key = getStorageKey(collection);
        const items = await this.list(collection);
        const index = items.findIndex((item: any) => item.id === id);

        if (index === -1) throw new Error('Document not found');

        const updatedItem = {
            ...items[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        items[index] = updatedItem;
        localStorage.setItem(key, JSON.stringify(items));
        return updatedItem;
    },

    async delete(collection: string, id: string): Promise<void> {
        const key = getStorageKey(collection);
        let items = await this.list(collection);
        items = items.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(items));
    }
};
