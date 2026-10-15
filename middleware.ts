import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifyToken } from '@/lib/auth-util';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const cookieVal = request.cookies.get('admin_session')?.value;
    const isAdmin = await verifyToken(cookieVal);

    // 1. API Protection Rules
    if (path.startsWith('/api/')) {
        // Allow public access to Auth Login
        if (path === '/api/auth/login') return NextResponse.next();

        // Kiosk Public Access: GET Items (for menu), POST Orders (to buy), GET Settings (farm status & announcements)
        if (request.method === 'GET' && path === '/api/items') return NextResponse.next();
        if (request.method === 'POST' && path === '/api/orders') return NextResponse.next();
        if (request.method === 'GET' && path === '/api/settings') return NextResponse.next();

        // BLOCK everything else if not admin
        // - GET /api/database
        // - GET /api/orders (History)
        // - DELETE /api/orders
        // - POST/PUT/DELETE /api/items
        // - POST /api/settings
        // - POST /api/upload
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }
    }

    // 2. Admin Page Protection
    const isProtectedPage = path.startsWith('/admin') && !path.startsWith('/admin/login');
    if (isProtectedPage && !isAdmin) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 3. Prevent Login Page if already logged in
    if (path === '/admin/login' && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configure paths to match
export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
};
