import { NextResponse } from 'next/server';
import db from '@/lib/db';


export async function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM items WHERE isDeleted = 0');
        const items = stmt.all();
        // SQLite stores booleans as 0/1, convert back if needed, but our type allows strict mapping if we handle it.
        // For simplicity in JS, 1 is truthy.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedItems = items.map((i: any) => ({
            ...i,
            inStock: i.inStock === 1,
            allowFractional: i.allowFractional === 1,
            isDeleted: i.isDeleted === 1
        }));
        return NextResponse.json(formattedItems);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, category, price, unit, quantity, inStock, image, allowFractional } = body;

        // Sanitization handled by parameterization and frontend escaping
        const safeQuantity = Math.max(0, parseFloat(quantity) || 0);

        const id = crypto.randomUUID();
        const stmt = db.prepare(`
            INSERT INTO items (id, name, category, price, unit, quantity, inStock, image, allowFractional, isDeleted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `);

        stmt.run(id, name, category, price, unit, safeQuantity, inStock ? 1 : 0, image, allowFractional ? 1 : 0);

        return NextResponse.json({
            id, name, category, price, unit, quantity, inStock, image, allowFractional: !!allowFractional, isDeleted: false
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
