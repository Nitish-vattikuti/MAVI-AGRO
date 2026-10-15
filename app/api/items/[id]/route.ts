import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Build dynamic update query
        const ALLOWED_FIELDS = ['name', 'category', 'price', 'unit', 'quantity', 'inStock', 'image', 'allowFractional'];
        const fields = Object.keys(body).filter(key => ALLOWED_FIELDS.includes(key));

        if (fields.length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => {
            let val = body[field];
            if (field === 'name' || field === 'category') {
                val = String(val).replace(/<[^>]*>?/gm, '');
            }
            if (field === 'quantity') {
                val = Math.max(0, parseFloat(val) || 0);
            }
            return typeof val === 'boolean' ? (val ? 1 : 0) : val;
        });

        const stmt = db.prepare(`UPDATE items SET ${setClause} WHERE id = ?`);
        stmt.run(...values, id);

        // Fetch updated
        const updated = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
        return NextResponse.json(updated);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const stmt = db.prepare('UPDATE items SET isDeleted = 1 WHERE id = ?');
        stmt.run(id);
        return NextResponse.json({ success: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
