import { Order, OrderStatus } from '@/data/types';
import { apiAdapter } from '@/repositories/ApiAdapter';
import { inventoryService } from './InventoryService';

export class OrderService {
    async getAllOrders(): Promise<Order[]> {
        const orders = await apiAdapter.getOrders();
        return orders.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    async getOrderById(id: string): Promise<Order | undefined> {
        const orders = await this.getAllOrders();
        return orders.find(o => o.id === id);
    }

    // Create Order -> Server handles stock validation & deduction atomically
    async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'totalAmount' | 'cancelledAt' | 'collectedAt'>): Promise<Order> {
        // We pass a placeholder structure. The server validates items/stock and recalculates totals.
        const orderPayload: Order = {
            ...orderData,
            id: '', // Placeholder
            createdAt: new Date().toISOString(),
            status: 'placed',
            totalAmount: 0, // Placeholder
            collectedAt: undefined,
            cancelledAt: undefined
        };

        return await apiAdapter.createOrder(orderPayload);
    }

    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
        const orders = await this.getAllOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        const oldStatus = order.status;

        // Handle status transitions
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            // Restore stock
            for (const item of order.items) {
                const dbItem = await inventoryService.getItemById(item.itemId);
                if (dbItem) {
                    await inventoryService.updateItem(dbItem.id, {
                        quantity: dbItem.quantity + item.quantity
                    });
                }
            }
            order.cancelledAt = new Date().toISOString();
        } else if (status === 'collected' && oldStatus !== 'collected') {
            order.collectedAt = new Date().toISOString();
        } else if (status === 'placed' && oldStatus === 'cancelled') {
            // Re-deduct stock
            for (const item of order.items) {
                const dbItem = await inventoryService.getItemById(item.itemId);
                if (dbItem) {
                    await inventoryService.updateItem(dbItem.id, {
                        quantity: dbItem.quantity - item.quantity
                    });
                }
            }
            order.cancelledAt = undefined;
        }

        order.status = status;

        return await apiAdapter.updateOrder(order);
    }

    async clearAllOrders(): Promise<void> {
        await apiAdapter.clearOrders();
    }
}

export const orderService = new OrderService();
