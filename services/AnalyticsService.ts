
import { Order, Item } from '@/data/types';
import { subDays, format } from 'date-fns';

export interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategorySales {
    name: string;
    value: number;
}

export interface AiInsight {
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    message: string;
    metric?: string;
}

export interface ItemSalesReport {
    id: string;
    name: string;
    category: string;
    totalQty: number;
    unit: string;
    totalRevenue: number;
    buyers: string[]; // List of buyer names
}

export const analyticsService = {
    generateReports: (orders: Order[], items: Item[]) => {
        // ... (existing logic) ...
        // 1. Calculate Daily Revenue (Last 7 Days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = subDays(new Date(), 6 - i);
            return format(d, 'MMM dd');
        });

        const dailyData = last7Days.map(dateStr => {
            const dayOrders = orders.filter(o =>
                format(new Date(o.createdAt), 'MMM dd') === dateStr &&
                o.status !== 'cancelled'
            );
            return {
                date: dateStr,
                revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                orders: dayOrders.length
            };
        });

        // 2. Category Sales Mix
        const categoryMap = new Map<string, number>();
        orders.filter(o => o.status !== 'cancelled').forEach(o => {
            o.items.forEach(i => {
                const itemDef = items.find(x => x.id === i.itemId);
                const cat = itemDef ? itemDef.category : 'Other';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + i.total);
            });
        });
        const categoryData = Array.from(categoryMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // 3. AI Insights & Predictions
        const insights: AiInsight[] = [];

        // Revenue Trend
        const today = dailyData[6].revenue;
        const yesterday = dailyData[5].revenue;
        if (today > 0 && yesterday > 0 && today > yesterday * 1.2) {
            insights.push({
                type: 'positive',
                message: 'Revenue is trending up nicely today compared to yesterday.',
                metric: `+${Math.round(((today - yesterday) / yesterday) * 100)}%`
            });
        }

        // Low Stock / Stockout Predictions
        const criticalItems = items.filter(i => i.quantity < 10 && !i.isDeleted);
        if (criticalItems.length > 0) {
            insights.push({
                type: 'warning',
                message: `${criticalItems.length} items are critically low on stock. Restock suggested immediately.`,
                metric: 'Action Needed'
            });
        }

        // Best Seller
        if (categoryData.length > 0) {
            insights.push({
                type: 'neutral',
                message: `${categoryData[0].name} is your best-performing category this week.`,
                metric: `₹${categoryData[0].value.toFixed(0)}`
            });
        }

        // 4. Detailed Item Sales Report
        const itemSalesMap = new Map<string, ItemSalesReport>();

        // Initialize with all items (even 0 sales)
        items.filter(i => !i.isDeleted).forEach(item => {
            itemSalesMap.set(item.id, {
                id: item.id,
                name: item.name,
                category: item.category,
                totalQty: 0,
                unit: item.unit,
                totalRevenue: 0,
                buyers: []
            });
        });

        // Aggregate Sales
        orders.filter(o => o.status !== 'cancelled').forEach(order => {
            order.items.forEach(orderItem => {
                // Handle legacy data structure
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const i = orderItem as any;
                const itemId = i.itemId || i.id;

                const existing = itemSalesMap.get(itemId);
                if (existing) {
                    existing.totalQty += i.quantity;

                    // Handle revenue calculation with detailed fallbacks
                    const price = i.pricePerUnit || i.price || 0;
                    const revenue = i.total || (price * i.quantity);

                    existing.totalRevenue += revenue;

                    if (!existing.buyers.includes(order.buyerName)) {
                        existing.buyers.push(order.buyerName);
                    }
                }
            });
        });

        const itemSales = Array.from(itemSalesMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return {
            dailyData,
            categoryData,
            insights,
            lowStockItems: criticalItems,
            itemSales
        };
    }
};
