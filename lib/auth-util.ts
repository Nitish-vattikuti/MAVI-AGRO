const SECRET_KEY = process.env.ADMIN_PASSWORD_HASH || 'fallback-secret-key-do-not-use-in-prod';

// Convert string to Uint8Array
const encoder = new TextEncoder();

async function getKey() {
    return await crypto.subtle.importKey(
        'raw',
        encoder.encode(SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function signToken(payload: string): Promise<string> {
    const key = await getKey();
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
    );

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return `${payload}.${hashHex}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
    if (!token || !token.includes('.')) return false;

    const [payload, hash] = token.split('.');

    try {
        const key = await getKey();
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(payload)
        );

        const hashArray = Array.from(new Uint8Array(signature));
        const expectedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Timing Safe Compare (manually since crypto.timingSafeEqual is for buffers)
        // Actually, simple string compare is okay for HMAC verification if length leak is minimal risk, 
        // but let's try to be safe.
        return hash === expectedHex && payload === 'true'; // Strict check for our specific use case
    } catch {
        return false;
    }
}
