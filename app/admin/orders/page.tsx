'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { orderService } from '@/services/OrderService';
import { Order, OrderStatus } from '@/data/types';
import { flattenOrders, exportOrdersSmart } from '@/utils/export';
import {
    Search,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
    ShoppingBag,
    Trash2,
    Printer,
    Download,
    ArrowLeft,
} from 'lucide-react';
import {
    format,
    isSameDay,
    subDays,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
    parseISO,
    startOfDay,
    endOfDay,
} from 'date-fns';

type DateFilter = 'all' | 'today' | 'yesterday' | 'this_month' | 'custom';
type ViewMode = 'cards' | 'preview';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('cards');

    const loadOrders = useCallback(async () => {
        const data = await orderService.getAllOrders();
        setOrders(data);
    }, []);

    useEffect(() => {
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
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                result = result.filter(o => isWithinInterval(parseISO(o.createdAt), { start, end }));
            }
        }

        return result;
    }, [orders, search, statusFilter, dateFilter, customStartDate, customEndDate]);

    // Flattened rows for spreadsheet preview
    const flattenedRows = useMemo(() => {
        return flattenOrders(filteredOrders);
    }, [filteredOrders]);

    const totalQuantity = useMemo(() => {
        return flattenedRows.reduce((acc, r) => acc + (Number(r.Quantity) || 0), 0);
    }, [flattenedRows]);

    const totalRevenue = useMemo(() => {
        return flattenedRows.reduce((acc, r) => acc + (Number(r['Item Total']) || 0), 0);
    }, [flattenedRows]);

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

    // Single-click download automatically formatted for user's OS
    const handleDownload = () => {
        if (filteredOrders.length === 0) return;
        exportOrdersSmart(filteredOrders);
    };

    const toggleExpand = (id: string) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    {viewMode === 'preview' ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode('cards')}
                                className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 transition-colors shadow-2xs border border-gray-200"
                                title="Back to Orders List"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Spreadsheet Preview</h1>
                                <p className="text-gray-500">Review all orders before downloading</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                            <p className="text-gray-500">Track and fulfill orders</p>
                        </div>
                    )}
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                    {viewMode === 'preview' ? (
                        <>
                            <button
                                onClick={() => setViewMode('cards')}
                                className="px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
                            >
                                Back to Orders
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={flattenedRows.length === 0}
                                className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-2.5 rounded-full hover:bg-brand-dark disabled:opacity-50 transition shadow-lg shadow-brand-primary/20 font-bold text-xs uppercase tracking-wider"
                            >
                                <Download size={18} />
                                <span>Download</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleClearData}
                                className="flex items-center space-x-2 bg-red-100 text-red-600 px-6 py-2.5 rounded-full hover:bg-red-200 transition font-bold text-xs uppercase tracking-wider border border-red-200 shadow-2xs"
                                title="Clear all orders history"
                            >
                                <Trash2 size={18} />
                                <span>Clear Data</span>
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-2.5 rounded-full hover:bg-brand-dark transition shadow-lg shadow-brand-primary/20 font-bold text-xs uppercase tracking-wider"
                            >
                                <FileSpreadsheet size={18} />
                                <span>Export Excel</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filters Bar (shared across both views) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search buyer, ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-sm font-medium"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    className="px-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white text-gray-800 text-sm font-medium"
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
                        className="px-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 bg-white text-gray-800 flex-[0.5] text-sm font-medium"
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
                                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-sm w-full"
                                placeholder="Start Date"
                            />
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-gray-800 text-sm w-full"
                                placeholder="End Date"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end text-sm text-gray-500 font-medium">
                    {filteredOrders.length} Order{filteredOrders.length !== 1 && 's'} Found
                </div>
            </div>

            {/* SPREADSHEET PREVIEW VIEW (Blends 100% naturally into the page) */}
            {viewMode === 'preview' ? (
                <div className="bg-white rounded-2xl shadow-soft border border-brand-cream overflow-hidden animate-in fade-in duration-200">
                    {/* Preview Info & Top Download */}
                    <div className="p-5 px-6 border-b border-brand-cream flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl">
                                <FileSpreadsheet size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-brand-dark text-base">Export Preview Data</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {flattenedRows.length} item rows • Total Revenue: ₹{totalRevenue.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* The single Download button */}
                        <button
                            onClick={handleDownload}
                            disabled={flattenedRows.length === 0}
                            className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-2.5 rounded-full hover:bg-brand-dark disabled:opacity-50 transition shadow-lg shadow-brand-primary/20 font-bold text-xs uppercase tracking-wider"
                        >
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                    </div>

                    {/* Table View */}
                    {flattenedRows.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No order items to preview matching filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-brand-cream/60 text-brand-dark font-bold text-xs uppercase tracking-wider border-b border-brand-cream">
                                    <tr>
                                        <th className="px-4 py-3.5 text-center w-12 text-gray-400 font-bold">#</th>
                                        <th className="px-4 py-3.5 font-bold">Order ID</th>
                                        <th className="px-4 py-3.5 font-bold">Date & Time</th>
                                        <th className="px-4 py-3.5 font-bold">Buyer</th>
                                        <th className="px-4 py-3.5 font-bold">Type</th>
                                        <th className="px-4 py-3.5 font-bold">Phone</th>
                                        <th className="px-4 py-3.5 font-bold">Item</th>
                                        <th className="px-4 py-3.5 text-right font-bold">Qty</th>
                                        <th className="px-4 py-3.5 font-bold">Unit</th>
                                        <th className="px-4 py-3.5 text-right font-bold">Price/Unit</th>
                                        <th className="px-4 py-3.5 text-right font-bold">Item Total</th>
                                        <th className="px-4 py-3.5 text-center font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {flattenedRows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-brand-cream/30 transition-colors">
                                            <td className="px-4 py-3 text-center text-xs font-mono text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-primary">#{row['Order ID']}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{row['Order Date']}</td>
                                            <td className="px-4 py-3 font-semibold text-brand-dark whitespace-nowrap">{row['Buyer Name']}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                    {row['Buyer Type']}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap font-mono">{row['Phone']}</td>
                                            <td className="px-4 py-3 font-medium text-brand-dark whitespace-nowrap">{row['Item Name']}</td>
                                            <td className="px-4 py-3 text-right font-mono font-semibold text-brand-dark whitespace-nowrap">{row.Quantity}</td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{row.Unit}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-gray-600 whitespace-nowrap">₹{Number(row['Price/Unit']).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-brand-primary whitespace-nowrap">₹{Number(row['Item Total']).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                    row.Status === 'PLACED' ? 'bg-brand-accent/10 text-brand-accent' :
                                                    row.Status === 'COLLECTED' ? 'bg-brand-primary/10 text-brand-primary' :
                                                    'bg-red-50 text-red-500'
                                                }`}>
                                                    {row.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-brand-cream/50 font-bold border-t border-brand-cream text-brand-dark">
                                    <tr>
                                        <td colSpan={7} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-gray-500">
                                            Totals ({flattenedRows.length} Rows):
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-brand-dark">
                                            {totalQuantity}
                                        </td>
                                        <td></td>
                                        <td></td>
                                        <td className="px-4 py-3 text-right font-mono font-extrabold text-brand-primary text-base">
                                            ₹{totalRevenue.toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="p-4 px-6 border-t border-brand-cream flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                        <span className="text-xs text-gray-400 font-medium">
                            Ready for export • {flattenedRows.length} items
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setViewMode('cards')}
                                className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Back to Orders
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={flattenedRows.length === 0}
                                className="flex items-center space-x-2 bg-brand-primary text-white px-6 py-2.5 rounded-full hover:bg-brand-dark disabled:opacity-50 transition shadow-lg shadow-brand-primary/20 font-bold text-xs uppercase tracking-wider"
                            >
                                <Download size={16} />
                                <span>Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* REGULAR ORDERS CARDS VIEW */
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
                                                    className="px-6 py-2.5 border border-red-100 text-red-500 rounded-full hover:bg-red-50 hover:border-red-200 font-bold text-xs uppercase tracking-wide transition-colors whitespace-nowrap shadow-2xs"
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
                                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 whitespace-nowrap shadow-2xs"
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
            )}
        </div>
    );
}
