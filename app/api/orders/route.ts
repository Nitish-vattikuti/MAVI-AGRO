import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { orderLimiter } from '@/lib/rate-limit';

export async function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
        const orders = stmt.all();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedOrders = orders.map((o: any) => ({
            ...o,
            items: JSON.parse(o.items) // Parse JSON string back to object
        }));

        return NextResponse.json(formattedOrders);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const limitCheck = orderLimiter.check(ip);
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: limitCheck.error }, { status: 429 });
        }

        const body = await request.json();
        const { buyerName, buyerType, phone, items } = body;

        // 1. Sanitization & Validation
        // Truncate overly long inputs to prevent DOS/Buffer issues
        const safeBuyerName = buyerName.substring(0, 50).replace(/<[^>]*>?/gm, '');
        const safePhone = phone ? phone.substring(0, 15).replace(/[^0-9+]/g, '') : '';

        if (items.length > 50) throw new Error("Too many items in one order");

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const status = 'placed';

        let serverTotal = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanItems: any[] = [];

        // 2. Atomic Stock Check, Price Calc & Transaction
        const transaction = db.transaction(() => {
            // Check stock for all items
            for (const item of items) {
                const id = item.itemId || item.id;
                const qty = Math.max(0.01, parseFloat(item.quantity) || 1); // Allow decimals, min 0.01

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dbItem = db.prepare('SELECT name, price, unit, quantity, inStock FROM items WHERE id = ?').get(id) as any;

                if (!dbItem) throw new Error(`Item not found: ${id}`);
                if (!dbItem.inStock || dbItem.quantity < qty) {
                    throw new Error(`Insufficient stock for ${dbItem.name}. Available: ${dbItem.quantity}`);
                }

                // Add to trusted list
                cleanItems.push({
                    itemId: id, // Use itemId to match frontend type
                    name: dbItem.name,
                    pricePerUnit: dbItem.price, // Trust DB price
                    unit: dbItem.unit,
                    quantity: qty,
                    total: parseFloat((dbItem.price * qty).toFixed(2))
                });

                // Accumulate Total
                serverTotal += (dbItem.price * qty);

                // Deduct stock
                db.prepare('UPDATE items SET quantity = quantity - ? WHERE id = ?').run(qty, id);
            }

            // Insert Order with SERVER calculated values
            db.prepare(`
                INSERT INTO orders (id, createdAt, buyerName, buyerType, phone, items, totalAmount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, createdAt, safeBuyerName, buyerType, safePhone, JSON.stringify(cleanItems), serverTotal, status);
        });

        transaction();

        return NextResponse.json({
            id, createdAt, buyerName: safeBuyerName, buyerType, phone: safePhone, items: cleanItems, totalAmount: serverTotal, status
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE() {
    try {
        const stmt = db.prepare('DELETE FROM orders');
        stmt.run();
        return NextResponse.json({ success: true, message: 'All orders cleared' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
