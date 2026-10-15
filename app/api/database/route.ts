import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const table = searchParams.get('table');

        // 1. Get List of Tables
        if (action === 'tables') {
            const tables = db.prepare(`
                SELECT name 
                FROM sqlite_schema 
                WHERE type ='table' AND name NOT LIKE 'sqlite_%'
            `).all();
            return NextResponse.json(tables);
        }

        // 2. Get Data from Specific Table
        if (table) {
            // Validate table name to prevent SQL injection (simple allowlist check based on schema)
            const validContext = db.prepare(`
                SELECT name 
                FROM sqlite_schema 
                WHERE type ='table' AND name = ?
            `).get(table);

            if (!validContext) {
                return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
            }

            // Fetch data (limit 100 for performance)
            // We can't bind table names in prepared statements, but we safely validated it above.
            const data = db.prepare(`SELECT * FROM "${table}" ORDER BY rowid DESC LIMIT 100`).all();
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
