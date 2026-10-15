'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, FileText, LogOut, Verified, X, Power, Database } from 'lucide-react';
import Cookies from 'js-cookie';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Inventory', icon: Package, path: '/admin/inventory' },
    { name: 'Reports', icon: FileText, path: '/admin/reports' },
    { name: 'Database', icon: Database, path: '/admin/database' },
    { name: 'Farm Status', icon: Power, path: '/admin/status' },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Close on route change (mobile)
    // Using a ref to track actual path changes prevents infinite loops from unstable onClose prop
    const prevPathRef = useRef(pathname);
    useEffect(() => {
        if (prevPathRef.current !== pathname) {
            onClose();
            prevPathRef.current = pathname;
        }
    }, [pathname, onClose]);

    // Close on click outside (mobile) handled by Overlay
    // Removed redundant mousedown listener that caused immediate closing on some devices

    const handleLogout = () => {
        Cookies.remove('admin_session');
        router.push('/');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    zIndex: isOpen ? 99998 : -1,
                    pointerEvents: isOpen ? 'auto' : 'none'
                }}
                onClick={onClose}
            />

            <aside
                className={`w-[280px] bg-white border-r border-gray-100 min-h-[100dvh] fixed top-0 left-0 flex flex-col font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{
                    zIndex: 99999
                }}
            >
                {/* Header */}
                <div className="p-8 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <Image
                                src="/mvgr-logo.png"
                                alt="MVGR College of Engineering"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-brand-dark tracking-tighter leading-none">MAVI</h1>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary/80">Admin Portal</span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors lg:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 py-4">
                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`relative group flex items-center space-x-3 px-5 py-4 rounded-full transition-all duration-300 ease-out ${isActive
                                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/25 translate-x-1'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
                                    }`}
                            >
                                <item.icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                />
                                <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.name}</span>

                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Profile */}
                <div className="p-4 mt-auto">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] p-1 border border-gray-100 shadow-lg shadow-gray-100/50">
                        <div className="bg-white rounded-[1.2rem] p-4 border border-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-md ring-2 ring-white">
                                    <span className="font-bold text-sm">AD</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <p className="text-sm font-bold text-brand-dark truncate">Admin</p>
                                        <Verified size={12} className="text-blue-500 fill-blue-500/10" />
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium truncate">Manager Access</p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full py-2.5 flex items-center justify-center space-x-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-xs font-bold uppercase tracking-wider"
                            >
                                <LogOut size={14} strokeWidth={2.5} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
