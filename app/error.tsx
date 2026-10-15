'use client';

import { useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error boundary caught:', error);
        const msg = error?.message || String(error);
        if (
            msg.includes('Failed to load chunk') ||
            msg.includes('Loading chunk') ||
            msg.includes('ChunkLoadError') ||
            msg.includes('Failed to fetch dynamically imported module')
        ) {
            const key = 'mavi_chunk_reload';
            const last = sessionStorage.getItem(key);
            const now = Date.now();
            if (!last || now - parseInt(last, 10) > 8000) {
                sessionStorage.setItem(key, String(now));
                window.location.reload();
            }
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white px-4 text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">Updating Page Resources...</h2>
            <p className="text-white/60 max-w-md mb-8 font-medium">
                The application has been updated with fresh assets. Click reload to continue.
            </p>
            <button
                onClick={() => {
                    sessionStorage.removeItem('mavi_chunk_reload');
                    window.location.reload();
                }}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-glow active:scale-95 cursor-pointer"
            >
                <RefreshCcw className="w-5 h-5" />
                Reload Page
            </button>
        </div>
    );
}
