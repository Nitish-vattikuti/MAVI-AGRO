'use client';

import { useEffect, useState } from 'react';
import { inventoryService } from '@/services/InventoryService';
import { orderService } from '@/services/OrderService';
import { ShoppingBag, Package, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pendingOrders: 0,
        totalProducts: 0,
        lowStock: 0,
        totalRevenue: 0,
        farmStatus: 'open'
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            const orders = await orderService.getAllOrders();
            const items = await inventoryService.getAllItems();

            // Fetch Settings for Status
            let status = 'open';
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.settings?.farm_status) status = data.settings.farm_status;
            } catch (e) {
                console.error(e);
            }

            const activeItems = items.filter(i => !i.isDeleted);

            setStats({
                pendingOrders: orders.filter(o => o.status === 'placed').length,
                totalProducts: activeItems.length,
                lowStock: activeItems.filter(i => i.quantity < 10).length,
                totalRevenue: orders.filter(o => o.status === 'collected').reduce((acc, order) => acc + order.totalAmount, 0),
                farmStatus: status
            });
        };
        loadDashboardData();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Value Props / Welcome */}
            <div className="relative rounded-[2rem] bg-brand-dark p-6 md:p-8 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                            Welcome back, <span className="text-brand-primary">Admin</span>
                        </h1>
                        <p className="text-brand-secondary/80 text-base max-w-xl font-medium">
                            Here&apos;s what&apos;s happening on the farm today. You have <span className="text-white font-bold">{stats.pendingOrders} pending orders</span> to process.
                        </p>
                    </div>
                    <Link href="/admin/orders" className="bg-white text-brand-dark px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-brand-secondary transition-colors shadow-lg shadow-white/10 text-sm">
                        <span>Process Orders</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Orders', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-brand-accent', bg: 'bg-brand-accent/10', href: '/admin/orders' },
                    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: 'text-brand-primary', bg: 'bg-brand-primary/10', href: '/admin/orders' },
                    { label: 'Active Items', value: stats.totalProducts, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/inventory' },
                    { label: 'Low Stock Alerts', value: stats.lowStock, icon: Users, color: 'text-red-500', bg: 'bg-red-500/10', href: '/admin/inventory' },
                ].map((stat, i) => (
                    <Link key={i} href={stat.href} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] block">
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <h3 className="text-3xl font-black text-brand-dark mb-0.5 tracking-tight">{stat.value}</h3>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold text-brand-dark px-2">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/inventory" className="group bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-brand-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-brand-secondary/30 text-brand-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-brand-dark mb-1">Manage Inventory</h3>
                    <p className="text-gray-400 text-xs font-medium">Add new fresh produce or update stock levels.</p>
                </Link>

                <Link href="/admin/orders" className="group bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-brand-accent/30 hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-brand-dark mb-1">View Orders</h3>
                    <p className="text-gray-400 text-xs font-medium">Track and fulfill incoming orders from students.</p>
                </Link>

                <Link href="/admin/status" className={`group p-6 rounded-[1.5rem] shadow-lg text-white transition-all hover:-translate-y-1 ${stats.farmStatus === 'open' ? 'bg-gradient-to-br from-brand-dark to-brand-primary' : 'bg-gradient-to-br from-red-600 to-red-500'}`}>
                    <h3 className="text-xl font-bold mb-1">Farm Status</h3>
                    <p className="opacity-80 text-xs font-medium mb-4">
                        {stats.farmStatus === 'open' ? 'System is running smooth.' : 'Orders are currently stopped.'}
                    </p>
                    <div className="flex items-center space-x-2">
                        <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${stats.farmStatus === 'open' ? 'bg-green-400' : 'bg-white'}`}></span>
                        <span className="font-bold text-xs tracking-wide uppercase">
                            {stats.farmStatus === 'open' ? 'Operational' : 'Closed'}
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
