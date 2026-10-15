'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/services/OrderService';
import { inventoryService } from '@/services/InventoryService';
import { analyticsService, DailyRevenue, CategorySales, AiInsight, ItemSalesReport } from '@/services/AnalyticsService';
import { TrendingUp, ShoppingBag, AlertTriangle, IndianRupee, Sparkles, Download, PieChart as PieIcon, BarChart3, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        lowStockItems: 0,
        activeOrders: 0,
    });
    const [chartData, setChartData] = useState<{
        daily: DailyRevenue[];
        category: CategorySales[];
        itemSales: ItemSalesReport[];
    }>({ daily: [], category: [], itemSales: [] });

    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            const orders = await orderService.getAllOrders();
            const items = await inventoryService.getAllItems();

            const reports = analyticsService.generateReports(orders, items);

            // Summary Stats
            const totalRevenue = orders
                .filter(o => o.status === 'collected')
                .reduce((sum, o) => sum + o.totalAmount, 0);

            setStats({
                totalRevenue,
                totalOrders: orders.length,
                lowStockItems: reports.lowStockItems.length,
                activeOrders: orders.filter(o => o.status === 'placed').length,
            });

            setChartData({
                daily: reports.dailyData,
                category: reports.categoryData,
                itemSales: reports.itemSales,
            });

            setInsights(reports.insights);
            setLoading(false);
        };
        loadStats();
    }, []);

    const handleDownloadReport = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Daily Revenue
        const ws1 = XLSX.utils.json_to_sheet(chartData.daily);
        XLSX.utils.book_append_sheet(wb, ws1, "Daily Revenue");

        // Sheet 2: Category Sales
        const ws2 = XLSX.utils.json_to_sheet(chartData.category);
        XLSX.utils.book_append_sheet(wb, ws2, "Category Mix");

        const ws3 = XLSX.utils.json_to_sheet(insights);
        XLSX.utils.book_append_sheet(wb, ws3, "AI Insights");

        // Sheet 4: Item Sales
        const ws4 = XLSX.utils.json_to_sheet(chartData.itemSales.map(i => ({
            Item: i.name,
            Category: i.category,
            'Total Qty Sold': `${i.totalQty} ${i.unit}`,
            'Revenue': i.totalRevenue,
            'Buyers': i.buyers.join(', ')
        })));
        XLSX.utils.book_append_sheet(wb, ws4, "Item Sales Detail");

        XLSX.writeFile(wb, `MAVI_Farm_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Farm Intelligence</h1>
                    <p className="text-gray-500 font-medium">AI-powered analysis of your farm&apos;s performance.</p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    className="bg-brand-dark text-white px-7 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-brand-primary transition-colors shadow-lg shadow-brand-dark/20 text-sm"
                >
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 p-1 rounded-[2rem]">
                <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-[1.8rem] border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 animate-pulse-slow">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-brand-dark">AI Analyst Insights</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className={`w-1 min-h-full rounded-full ${insight.type === 'positive' ? 'bg-green-500' :
                                    insight.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}></div>
                                <div>
                                    <p className="text-gray-600 font-medium mb-1">{insight.message}</p>
                                    {insight.metric && (
                                        <span className={`text-sm font-black ${insight.type === 'positive' ? 'text-green-600' :
                                            insight.type === 'warning' ? 'text-red-600' : 'text-blue-600'
                                            }`}>{insight.metric}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {insights.length === 0 && (
                            <p className="text-gray-400 italic">No significant anomalies detected today.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <IndianRupee size={24} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Revenue</span>
                    </div>
                    <h3 className="text-3xl font-bold text-brand-dark">₹{stats.totalRevenue.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Orders</span>
                    </div>
                    <h3 className="text-3xl font-bold text-brand-dark">{stats.totalOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Active</span>
                    </div>
                    <h3 className="text-3xl font-bold text-brand-dark">{stats.activeOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Hazards</span>
                    </div>
                    <h3 className="text-3xl font-bold text-brand-dark">{stats.lowStockItems}</h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-soft border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-brand-light text-brand-primary rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">Revenue Trend (7 Days)</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6', radius: 4 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-soft border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                            <PieIcon size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-brand-dark">Sales by Category</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    data={chartData.category as any[]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.category.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Item Sales Table */}
            <div className="bg-white rounded-[2rem] shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <ShoppingBag size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark">Item Sales Performance</h3>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-8 py-4 font-bold">Item Name</th>
                                <th className="px-8 py-4 font-bold text-center">Category</th>
                                <th className="px-8 py-4 font-bold text-right">Qty Sold</th>
                                <th className="px-8 py-4 font-bold text-right">Revenue</th>
                                <th className="px-8 py-4 font-bold">Buyers</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {chartData.itemSales.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 font-bold text-brand-dark">{item.name}</td>
                                    <td className="px-8 py-4 text-center">
                                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right font-medium text-gray-600">
                                        {item.totalQty} <span className="text-xs text-gray-400 uppercase">{item.unit}</span>
                                    </td>
                                    <td className="px-8 py-4 text-right font-black text-brand-primary">
                                        ₹{item.totalRevenue.toFixed(0)}
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="group relative w-fit">
                                            <div className="flex items-center gap-2 cursor-help">
                                                <Users size={16} className="text-gray-400" />
                                                <span className="text-sm font-bold text-gray-500 underline decoration-dotted underline-offset-4">
                                                    {item.buyers.length} Buyers
                                                </span>
                                            </div>
                                            {/* Tooltip for Buyer Names */}
                                            {item.buyers.length > 0 && (
                                                <div className="absolute bottom-full left-0 mb-2 w-max max-w-xs bg-brand-dark text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                                    <p className="font-bold mb-1 border-b border-white/20 pb-1">Customers</p>
                                                    <div className="space-y-0.5">
                                                        {item.buyers.slice(0, 5).map((b, i) => (
                                                            <div key={i}>{b}</div>
                                                        ))}
                                                        {item.buyers.length > 5 && (
                                                            <div className="text-white/50 italic">+{item.buyers.length - 5} more</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {chartData.itemSales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic">
                                        No sales data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
