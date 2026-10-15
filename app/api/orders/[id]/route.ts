import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // We typically only update status, cancelledAt, collectedAt, items (for stock restoration logic if complex), etc.
        // For simplicity, we can update fields passed in.

        const fields = Object.keys(body).filter(key => key !== 'id');
        if (fields.length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // Validate Logic: Cannot Cancel a Collected Order
        if (body.status === 'cancelled') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const current = db.prepare('SELECT status FROM orders WHERE id = ?').get(id) as any;
            if (current && current.status === 'collected') {
                return NextResponse.json({ error: "Cannot cancel a collected order." }, { status: 400 });
            }
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => {
            const val = body[field];
            if (field === 'items') return JSON.stringify(val);
            return val;
        });

        const stmt = db.prepare(`UPDATE orders SET ${setClause} WHERE id = ?`);
        stmt.run(...values, id);

        // Fetch updated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedRaw = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
        const updated = {
            ...updatedRaw,
            items: JSON.parse(updatedRaw.items)
        };

        return NextResponse.json(updated);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
