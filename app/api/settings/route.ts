import { NextResponse } from 'next/server';
import db from '@/lib/db';


export async function GET() {
    try {
        // Get Settings
        const settings = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
        const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        // Get Active Announcements (not expired)
        // SQLite doesn't have a robust date pivot, so we'll filter in JS for simplicity or use simple string comparison
        // Storing dates as ISO strings allows string comparison
        const now = new Date().toISOString();
        const announcements = db.prepare('SELECT * FROM announcements ORDER BY expiresAt ASC').all();

        // Filter out expired ones
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeAnnouncements = announcements.filter((a: any) => !a.expiresAt || a.expiresAt > now);

        return NextResponse.json({
            settings: settingsMap,
            announcements: activeAnnouncements
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (type === 'update_status') {
            const { status, reason } = data;
            const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (@key, @value)');
            const update = db.transaction(() => {
                stmt.run({ key: 'farm_status', value: status });
                stmt.run({ key: 'farm_status_reason', value: reason || '' });
            });
            update();
            return NextResponse.json({ success: true });
        }

        if (type === 'add_announcement') {
            const { message, durationDays, type: announcementType } = data;
            const id = Math.random().toString(36).substring(7);

            let expiresAt = null;
            if (durationDays) {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(durationDays));
                expiresAt = date.toISOString();
            }

            db.prepare('INSERT INTO announcements (id, message, type, expiresAt) VALUES (@id, @message, @type, @expiresAt)')
                .run({ id, message, type: announcementType || 'info', expiresAt });

            return NextResponse.json({ success: true, id });
        }

        if (type === 'delete_announcement') {
            const { id } = data;
            db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });

    } catch {
        console.error('Settings update failed');
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
