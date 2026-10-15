'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { orderService } from '@/services/OrderService';
import { Order, OrderStatus } from '@/data/types';
import { exportOrdersToExcel } from '@/utils/export';
import { Search, FileSpreadsheet, CheckCircle, XCircle, Clock, ChevronDown, ShoppingBag, Trash2, Printer } from 'lucide-react';
import { format, isSameDay, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

type DateFilter = 'all' | 'today' | 'yesterday' | 'this_month' | 'custom';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const loadOrders = useCallback(async () => {
        const data = await orderService.getAllOrders();
        setOrders(data);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(o =>
                o.buyerName.toLowerCase().includes(q) ||
                o.id.toLowerCase().includes(q) ||
                (o.phone && o.phone.includes(q))
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        // Date Filter
        const today = new Date();
        if (dateFilter === 'today') {
            result = result.filter(o => isSameDay(parseISO(o.createdAt), today));
        } else if (dateFilter === 'yesterday') {
            const yesterday = subDays(today, 1);
            result = result.filter(o => isSameDay(parseISO(o.createdAt), yesterday));
        } else if (dateFilter === 'this_month') {
            const start = startOfMonth(today);
            const end = endOfMonth(today);
            result = result.filter(o => isWithinInterval(parseISO(o.createdAt), { start, end }));
        } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const start = startOfDay(parseISO(customStartDate));
            const end = endOfDay(parseISO(customEndDate));
            // Check if valid dates
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                result = result.filter(o => isWithinInterval(parseISO(o.createdAt), { start, end }));
            }
        }

        return result;
    }, [orders, search, statusFilter, dateFilter, customStartDate, customEndDate]);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        if (window.confirm(`Change order status to ${newStatus.toUpperCase()}?`)) {
            await orderService.updateOrderStatus(orderId, newStatus);
            loadOrders();
        }
    };

    const handleClearData = async () => {
        if (window.confirm('⚠️ DANGER: This will PERMANENTLY DELETE ALL ORDERS.\n\nAre you sure you want to clear the entire database history? This cannot be undone.')) {
            if (window.confirm('Please confirm one last time: DELETE ALL DATA?')) {
                await orderService.clearAllOrders();
                loadOrders();
            }
        }
    };

    const handleExport = () => {
        exportOrdersToExcel(filteredOrders);
    };

    const toggleExpand = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                    <p className="text-gray-500">Track and fulfill orders</p>
                </div>
                <div className="flex flex-wrap gap-3 self-start md:self-auto">
                    <button
                        onClick={handleClearData}
                        className="flex items-center space-x-2 bg-red-100 text-red-600 px-6 py-2.5 rounded-full hover:bg-red-200 transition font-bold text-xs uppercase tracking-wider border border-red-200 shadow-xs"
                        title="Clear all orders history"
                    >
                        <Trash2 size={18} />
                        <span>Clear Data</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2.5 rounded-full hover:bg-green-700 transition shadow-lg shadow-green-200 font-bold text-xs uppercase tracking-wider"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Export Excel</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search buyer, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-800 text-sm font-medium"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="px-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white text-gray-800 text-sm font-medium"
                >
                    <option value="all">All Statuses</option>
                    <option value="placed">Placed</option>
                    <option value="collected">Collected</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <div className="col-span-1 md:col-span-2 flex space-x-2">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                        className="px-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 bg-white text-gray-800 flex-[0.5] text-sm font-medium"
                    >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this_month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {dateFilter === 'custom' && (
                        <div className="flex space-x-2 flex-1 animate-in fade-in slide-in-from-left-2 duration-200">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-800 text-sm w-full"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-800 text-sm w-full"
                                placeholder="End Date"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end text-sm text-gray-500 font-medium">
                    {filteredOrders.length} Order{filteredOrders.length !== 1 && 's'} Found
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No orders found matching filters.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-brand-cream overflow-hidden">
                            <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer bg-white gap-4" onClick={() => toggleExpand(order.id)}>
                                <div className="flex items-center space-x-4 md:space-x-5 w-full md:w-auto">
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${order.status === 'placed' ? 'bg-brand-accent/10 text-brand-accent' :
                                        order.status === 'collected' ? 'bg-brand-primary/10 text-brand-primary' :
                                            'bg-red-50 text-red-500'
                                        }`}>
                                        {order.status === 'placed' && <Clock size={24} />}
                                        {order.status === 'collected' && <CheckCircle size={24} />}
                                        {order.status === 'cancelled' && <XCircle size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-brand-dark text-lg truncate">{order.buyerName}</h3>
                                        {order.phone && (
                                            <p className="text-xs font-semibold text-gray-500 mt-0.5 flex items-center gap-1">
                                                <span>📱</span> {order.phone}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center text-xs font-medium text-gray-400 gap-2 mt-1">
                                            <span>{format(parseISO(order.createdAt), 'dd MMM, HH:mm')}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="uppercase tracking-wider">{order.buyerType}</span>
                                            <span className="hidden md:inline w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="hidden md:inline">{order.items.length} Items</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto md:space-x-8 pl-[68px] md:pl-0">
                                    <div className="text-left md:text-right">
                                        <span className="block font-extrabold text-brand-dark text-xl">₹{order.totalAmount}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${order.status === 'placed' ? 'text-brand-accent' :
                                            order.status === 'collected' ? 'text-brand-primary' :
                                                'text-red-500'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className={`transition-transform duration-300 ml-4 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={20} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {expandedOrderId === order.id && (
                                <div className="p-5 border-t border-brand-cream bg-brand-cream/30 animate-in slide-in-from-top-2 duration-200">
                                    <div className="overflow-x-auto scrollbar-hide">
                                        <table className="w-full text-sm text-left mb-6 min-w-[300px]">
                                            <thead className="text-gray-400 font-medium text-xs uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-3 py-2 pb-3 font-bold">Item</th>
                                                    <th className="px-3 py-2 pb-3 text-right font-bold">Qty</th>
                                                    <th className="px-3 py-2 pb-3 text-right font-bold">Price/Unit</th>
                                                    <th className="px-3 py-2 pb-3 text-right font-bold">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100/50">
                                                {order.items.map((item, idx) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    const i = item as any;


                                                    return (
                                                        <tr key={idx}>
                                                            <td className="px-3 py-3 font-medium text-brand-dark whitespace-nowrap">{i.name}</td>
                                                            <td className="px-3 py-3 text-right text-gray-500 whitespace-nowrap">{i.quantity} {i.unit}</td>
                                                            <td className="px-3 py-3 text-right text-gray-500 whitespace-nowrap">₹{i.pricePerUnit}</td>
                                                            <td className="px-3 py-3 text-right font-bold text-brand-primary whitespace-nowrap">₹{Number(i.total).toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {order.status === 'placed' && (
                                        <div className="flex space-x-3 pt-2 overflow-x-auto pb-2 scrollbar-hide text-left">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'cancelled'); }}
                                                className="px-6 py-2.5 border border-red-100 text-red-500 rounded-full hover:bg-red-50 hover:border-red-200 font-bold text-xs uppercase tracking-wide transition-colors whitespace-nowrap shadow-xs"
                                            >
                                                Cancel Order
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'collected'); }}
                                                className="px-6 py-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-dark font-bold text-xs uppercase tracking-wide shadow-lg shadow-brand-primary/20 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                                            >
                                                Mark as Collected
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const receiptContent = `
                                                        <html>
                                                            <head>
                                                                <title>Receipt - ${order.id.slice(0, 8)}</title>
                                                                <style>
                                                                    body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                                                                    .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                                                                    .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
                                                                    .total { border-top: 2px dashed #000; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; }
                                                                    .footer { margin-top: 20px; text-align: center; font-size: 10px; }
                                                                </style>
                                                            </head>
                                                            <body>
                                                                <div class="header">
                                                                    <h2>MAVI AGRO</h2>
                                                                    <p>Order #${order.id.slice(0, 6)}</p>
                                                                    <p>${format(parseISO(order.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                                                                    <p>Buyer: ${order.buyerName} (${order.buyerType})</p>
                                                                </div>
                                                                ${order.items.map(item => {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const i = item as any;
                                                        return `
                                                                    <div class="item">
                                                                        <span>${i.name} x${i.quantity}${i.unit}</span>
                                                                        <span>₹${Number(i.total).toFixed(2)}</span>
                                                                    </div>
                                                                `}).join('')}
                                                                <div class="total">
                                                                    <span>TOTAL</span>
                                                                    <span>₹${order.totalAmount}</span>
                                                                </div>
                                                                <div class="footer">
                                                                    <p>Thank you for supporting our farm!</p>
                                                                </div>
                                                                <script>window.print();</script>
                                                            </body>
                                                        </html>
                                                    `;
                                                    const win = window.open('', '', 'width=400,height=600');
                                                    win?.document.write(receiptContent);
                                                    win?.document.close();
                                                }}
                                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
                                            >
                                                <Printer size={16} />
                                                <span>Receipt</span>
                                            </button>
                                        </div>
                                    )}
                                    {order.status === 'collected' && (
                                        <div className="text-right text-xs font-medium text-brand-primary flex items-center justify-end">
                                            <CheckCircle size={14} className="mr-1" />
                                            Collected at: {format(parseISO(order.collectedAt!), 'dd MMM yyyy HH:mm')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
