import { Item, Order } from '@/data/types';
import { AsyncStorageAdapter } from './StorageAdapter';

export class ApiAdapter implements AsyncStorageAdapter {
    async getItems(): Promise<Item[]> {
        const res = await fetch('/api/items');
        if (!res.ok) throw new Error('Failed to fetch items');
        return res.json();
    }

    async saveItems(/* items: Item[] */): Promise<void> {
        // This method in local storage replaced the whole array.
        // For API/DB, we shouldn't replace everything.
        // But for compatibility with the existing Service logic which calls `saveItems` after modification,
        // we might need to change the Service logic to call specific API endpoints (updateItem, addItem, etc.)
        // INSTAD of saving the whole array.

        // REFACTOR STRATEGY: 
        // The Services shouldn't call saveItems() with the whole array anymore.
        // They should make granular calls.

        // For now, this primitive methods might not be used if we refactor Services correctly.
        console.warn('saveItems (bulk) called on ApiAdapter - likely inefficient or not implemented correctly for DB');
    }

    // Helper methods that Services should probably use instead:
    async addItem(item: Item): Promise<Item> {
        const res = await fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to add item');
        return res.json();
    }

    async updateItem(item: Item): Promise<Item> {
        const res = await fetch(`/api/items/${item.id}`, {
            method: 'PUT', // Or PATCH
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        if (!res.ok) throw new Error('Failed to update item');
        return res.json();
    }

    async deleteItem(id: string): Promise<void> {
        const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete item');
    }

    async getOrders(): Promise<Order[]> {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    }

    async updateOrder(order: Order): Promise<Order> {
        const res = await fetch(`/api/orders/${order.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Failed to update order');
        return res.json();
    }

    async saveOrders(/* orders: Order[] */): Promise<void> {
        console.warn('saveOrders (bulk) called on ApiAdapter');
    }

    async createOrder(order: Order): Promise<Order> {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Failed to create order');
        return res.json();
    }

    async clearOrders(): Promise<void> {
        const res = await fetch('/api/orders', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to clear orders');
    }
}

export const apiAdapter = new ApiAdapter();
