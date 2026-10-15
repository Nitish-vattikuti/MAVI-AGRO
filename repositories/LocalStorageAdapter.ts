import { Item, Order } from '@/data/types';
import { SEED_ITEMS } from '@/data/seed';
import { StorageAdapter } from './StorageAdapter';

const ITEMS_KEY = 'agro_items';
const ORDERS_KEY = 'agro_orders';

/* 
  TODO: UPGRADE PATH TO SUPABASE/FIREBASE
  1. Create a Keybase/Auth provider implementation.
  2. Maintain the 'StorageAdapter' interface but create 'SupabaseAdapter'.
  3. Replace the 'storage' export with the new adapter instance.
  
  Example Supabase Implementation:
  class SupabaseAdapter implements StorageAdapter {
     async getItems() { const { data } = await supabase.from('items').select('*'); return data; }
     // ...
  }
*/

export class LocalStorageAdapter implements StorageAdapter {
    getItems(): Item[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(ITEMS_KEY);
        if (!stored) {
            // Initialize with seed data
            this.saveItems(SEED_ITEMS);
            return SEED_ITEMS;
        }
        try {
            const parsedItems: Item[] = JSON.parse(stored);

            // Sync seed images to ensure high quality (fixes broken/old cache)
            const syncedItems = parsedItems.map(item => {
                const seedItem = SEED_ITEMS.find(s => s.id === item.id);
                if (seedItem) {
                    return { ...item, image: seedItem.image };
                }
                return item;
            });

            return syncedItems;
        } catch (e) {
            console.error('Failed to parse items', e);
            return [];
        }
    }

    saveItems(items: Item[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    }

    getOrders(): Order[] {
        if (typeof window === 'undefined') return [];

        const stored = localStorage.getItem(ORDERS_KEY);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse orders', e);
            return [];
        }
    }

    saveOrders(orders: Order[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
}

export const storage = new LocalStorageAdapter();
