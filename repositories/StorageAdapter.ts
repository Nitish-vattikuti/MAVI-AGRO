import { Item, Order } from '@/data/types';

export interface StorageAdapter {
    getItems(): Item[];
    saveItems(items: Item[]): void;
    getOrders(): Order[];
    saveOrders(orders: Order[]): void;
    // Potentially async in future, but for prototype sync is fine or Promise based. 
    // Given instructions say "Next.js App Router" and "Prototype", usually better to use Promises to mimic real fetch.
    // But LocalStorage is sync. 
    // "Design adapters so backend can be swapped later." -> PROMISES ARE BETTER.
}

// Promisified version for better forward compatibility
export interface AsyncStorageAdapter {
    getItems(): Promise<Item[]>;
    saveItems(items: Item[]): Promise<void>;
    getOrders(): Promise<Order[]>;
    saveOrders(orders: Order[]): Promise<void>;
}
