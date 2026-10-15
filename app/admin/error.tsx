'use client';

import { useEffect } from 'react';
import { RefreshCcw, ShieldAlert } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin error boundary caught:', error);
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
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-brand-dark px-4 text-center">
            <div className="w-20 h-20 bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <ShieldAlert size={36} />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Admin Portal Resource Sync</h2>
            <p className="text-gray-500 max-w-md mb-8 font-medium text-sm">
                A newer version of the admin portal is available. Reload to refresh the interface.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        sessionStorage.removeItem('mavi_chunk_reload');
                        window.location.reload();
                    }}
                    className="flex items-center gap-2 bg-brand-dark hover:bg-black text-white px-6 py-3 rounded-full font-bold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                    <RefreshCcw size={16} />
                    Refresh Admin
                </button>
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold text-sm transition-all active:scale-95 cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
