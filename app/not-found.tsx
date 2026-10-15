'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white px-4 text-center">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <h1 className="text-4xl font-bold text-red-500">404</h1>
            </div>
            <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
            <p className="text-neutral-400 max-w-md mb-8">
                We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
            </p>

            <Link
                href="/"
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
                <Home className="w-5 h-5" />
                Return to Kiosk
            </Link>
        </div>
    );
}
