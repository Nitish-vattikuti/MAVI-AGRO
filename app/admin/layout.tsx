'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-brand-cream min-h-screen font-sans selection:bg-brand-primary selection:text-white">
            {!isLoginPage && (
                <>
                    {/* Mobile Header */}
                    <header className="lg:hidden bg-white border-b border-gray-100 p-4 sticky top-0 z-[50] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 -ml-2 text-brand-dark hover:bg-gray-50 rounded-full transition-colors active:bg-gray-100"
                                aria-label="Open Menu"
                            >
                                <Menu size={28} strokeWidth={2.5} />
                            </button>
                            <span className="font-black text-xl text-brand-dark tracking-tight">MAVI Admin</span>
                        </div>
                    </header>

                    <AdminSidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </>
            )}

            <main className={`${isLoginPage ? 'w-full' : 'lg:ml-[280px]'} min-h-screen transition-all duration-300`}>
                <div className={isLoginPage ? '' : 'max-w-[1600px] mx-auto p-4 md:p-8'}>
                    {children}
                </div>
            </main>
        </div>
    );
}
