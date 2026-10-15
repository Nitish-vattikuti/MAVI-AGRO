import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { loginLimiter } from '@/lib/rate-limit';
import { signToken } from '@/lib/auth-util';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        // 1. Rate Limiting Check
        const limitCheck = loginLimiter.check(ip);
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: limitCheck.error }, { status: 429 });
        }

        // 2. Validate Credentials
        const envUsername = process.env.ADMIN_USERNAME || 'admin';
        const envHash = process.env.ADMIN_PASSWORD_HASH;

        // Hash the provided password
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        // Secure Comparison (Timing Attack Proof)
        let match = false;

        // Only attempt comparison if username matches and hash is set (prevent crash on undefined)
        if (username === envUsername && envHash) {
            const bufferA = Buffer.from(passwordHash, 'utf8');
            const bufferB = Buffer.from(envHash, 'utf8');

            if (bufferA.length === bufferB.length) {
                match = crypto.timingSafeEqual(bufferA, bufferB);
            }
        }

        if (match) {
            // Success: clear attempts
            loginLimiter.reset(ip);

            // ... (inside POST)

            // Create response with secure cookie
            const response = NextResponse.json({ success: true });

            // Sign the session token
            const signedToken = await signToken('true');

            // Set HttpOnly cookie
            response.cookies.set('admin_session', signedToken, {
                httpOnly: true, // Not accessible via JS
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
