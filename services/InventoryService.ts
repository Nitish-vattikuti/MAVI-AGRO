import { Item } from '@/data/types';
import { apiAdapter } from '@/repositories/ApiAdapter';

export class InventoryService {
    async getAllItems(): Promise<Item[]> {
        const items = await apiAdapter.getItems();
        return items.filter(i => !i.isDeleted);
    }

    async getItemById(id: string): Promise<Item | undefined> {
        const items = await this.getAllItems();
        return items.find(i => i.id === id);
    }

    async addItem(itemData: Omit<Item, 'id' | 'isDeleted'>): Promise<Item> {
        // ID generation is now handled by the API/DB
        // We pass the data to the API adapter
        // But our API expects specific fields, let's assume itemData matches
        const newItem = {
            ...itemData,
            id: '', // Placeholder, will be ignored/overwritten by server
            isDeleted: false
        };
        return await apiAdapter.addItem(newItem);
    }

    async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
        // We need to pass the ID and updates to the adapter
        const payload = { ...updates, id };
        return await apiAdapter.updateItem(payload as Item);
    }

    async deleteItem(id: string): Promise<boolean> {
        try {
            await apiAdapter.deleteItem(id);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export const inventoryService = new InventoryService();
