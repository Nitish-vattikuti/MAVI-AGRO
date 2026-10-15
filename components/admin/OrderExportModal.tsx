'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Order } from '@/data/types';
import {
    flattenOrders,
    detectClientOS,
    exportOrdersToCSV,
    exportOrdersToExcel,
    copyOrdersToClipboard,
    FlattenedOrderRow,
    ClientOS,
} from '@/utils/export';
import {
    X,
    FileSpreadsheet,
    FileText,
    Download,
    Copy,
    Check,
    Search,
    Printer,
    Apple,
    Monitor,
    Sparkles,
    Info,
} from 'lucide-react';

interface OrderExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    filterSummary?: string;
}

export default function OrderExportModal({
    isOpen,
    onClose,
    orders,
    filterSummary,
}: OrderExportModalProps) {
    const [clientOS, setClientOS] = useState<ClientOS>('other');
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);
    const [downloadingFormat, setDownloadingFormat] = useState<'csv' | 'xlsx' | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Detect client OS on mount
    useEffect(() => {
        if (isOpen) {
            setClientOS(detectClientOS());
        }
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Flatten orders into spreadsheet rows
    const allRows = useMemo(() => {
        return flattenOrders(orders);
    }, [orders]);

    // Search/filter rows within the preview
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return allRows;
        const q = searchTerm.toLowerCase();
        return allRows.filter(row =>
            row['Order ID'].toLowerCase().includes(q) ||
            row['Buyer Name'].toLowerCase().includes(q) ||
            row['Item Name'].toLowerCase().includes(q) ||
            row['Buyer Type'].toLowerCase().includes(q) ||
            row['Phone'].toLowerCase().includes(q) ||
            row['Status'].toLowerCase().includes(q)
        );
    }, [allRows, searchTerm]);

    // Summary calculations
    const summary = useMemo(() => {
        const totalItemsCount = allRows.reduce((acc, r) => acc + (Number(r.Quantity) || 0), 0);
        const totalAmount = allRows.reduce((acc, r) => acc + (Number(r['Item Total']) || 0), 0);
        const uniqueOrders = new Set(allRows.map(r => r['Order ID'])).size;
        return {
            totalRows: allRows.length,
            uniqueOrders,
            totalItemsCount,
            totalAmount,
        };
    }, [allRows]);

    const isMacOrApple = clientOS === 'mac' || clientOS === 'ios';

    const handleDownloadCSV = () => {
        setDownloadingFormat('csv');
        setTimeout(() => {
            exportOrdersToCSV(allRows);
            setDownloadingFormat(null);
        }, 150);
    };

    const handleDownloadExcel = () => {
        setDownloadingFormat('xlsx');
        setTimeout(() => {
            exportOrdersToExcel(allRows);
            setDownloadingFormat(null);
        }, 150);
    };

    const handleCopy = async () => {
        const ok = await copyOrdersToClipboard(allRows);
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const tableHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Agro Orders Export Preview</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 20px; font-size: 11px; }
                    h2 { margin: 0 0 5px 0; font-size: 18px; color: #0F2A22; }
                    p { margin: 0 0 15px 0; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
                    th { background-color: #f2f7f4; font-weight: 600; font-size: 10px; text-transform: uppercase; }
                    .num { text-align: right; font-family: monospace; }
                    .status { text-align: center; font-weight: bold; }
                    .footer-row { font-weight: bold; background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h2>MAVI AGRO — Orders Export Report</h2>
                <p>Generated on ${new Date().toLocaleString()} | Total Rows: ${allRows.length} | Total Amount: ₹${summary.totalAmount.toFixed(2)}</p>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Buyer</th>
                            <th>Type</th>
                            <th>Phone</th>
                            <th>Item</th>
                            <th class="num">Qty</th>
                            <th>Unit</th>
                            <th class="num">Price</th>
                            <th class="num">Total</th>
                            <th class="status">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allRows.map((r, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${r['Order ID']}</td>
                                <td>${r['Order Date']}</td>
                                <td>${r['Buyer Name']}</td>
                                <td>${r['Buyer Type']}</td>
                                <td>${r['Phone']}</td>
                                <td>${r['Item Name']}</td>
                                <td class="num">${r.Quantity}</td>
                                <td>${r.Unit}</td>
                                <td class="num">₹${r['Price/Unit']}</td>
                                <td class="num">₹${r['Item Total'].toFixed(2)}</td>
                                <td class="status">${r.Status}</td>
                            </tr>
                        `).join('')}
                        <tr class="footer-row">
                            <td colspan="10" style="text-align: right;">Total Amount:</td>
                            <td class="num">₹${summary.totalAmount.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
                <script>window.onload = function() { window.print(); window.close(); };</script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(tableHTML);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    const columns: (keyof FlattenedOrderRow)[] = [
        'Order ID',
        'Order Date',
        'Buyer Name',
        'Buyer Type',
        'Phone',
        'Item Name',
        'Quantity',
        'Unit',
        'Price/Unit',
        'Item Total',
        'Order Total',
        'Status',
        'Collected At',
        'Cancelled At',
    ];

    // Alphabetical spreadsheet column indices (A, B, C...)
    const colLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-7xl h-[92vh] max-h-[900px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-6 py-4 flex items-center justify-between shadow-md flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                            <FileSpreadsheet className="text-emerald-300" size={22} />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Spreadsheet Preview & Export
                                </h2>
                                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                                    Live Preview
                                </span>
                            </div>
                            <p className="text-xs text-emerald-200/80 font-medium">
                                Review rows, verify columns, and download in your OS-optimized format
                                {filterSummary ? ` • (${filterSummary})` : ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
                        title="Close preview (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* OS Recommendation Banner */}
                <div className="bg-emerald-50/80 border-b border-emerald-100 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
                    <div className="flex items-center space-x-2.5 text-xs text-emerald-900 font-medium">
                        {isMacOrApple ? (
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200/60 text-emerald-800 flex-shrink-0">
                                <Apple size={14} />
                            </span>
                        ) : clientOS === 'windows' ? (
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                                <Monitor size={14} />
                            </span>
                        ) : (
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-200/60 text-emerald-800 flex-shrink-0">
                                <Info size={14} />
                            </span>
                        )}

                        <div>
                            {isMacOrApple ? (
                                <span>
                                    <strong className="text-emerald-950 font-bold">macOS Detected:</strong> Recommended format is{' '}
                                    <strong className="text-emerald-800 underline decoration-emerald-400">Universal CSV (.csv)</strong> for 100% native compatibility with{' '}
                                    <strong>Apple Numbers</strong>, QuickLook, and Mac Excel without file corruption or damage warnings.
                                </span>
                            ) : clientOS === 'windows' ? (
                                <span>
                                    <strong className="text-emerald-950 font-bold">Windows Detected:</strong> Recommended format is{' '}
                                    <strong className="text-emerald-800 underline decoration-emerald-400">Excel Workbook (.xlsx)</strong> for native opening in{' '}
                                    <strong>Microsoft Excel</strong>.
                                </span>
                            ) : (
                                <span>
                                    <strong className="text-emerald-950 font-bold">Universal Format:</strong> Both .CSV and .XLSX are available. CSV is recommended for seamless cross-platform opening.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto text-[11px] text-gray-500 font-semibold">
                        <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                            {summary.uniqueOrders} Orders
                        </span>
                        <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                            {summary.totalRows} Items
                        </span>
                        <span className="bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 font-bold shadow-2xs">
                            ₹{summary.totalAmount.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-white border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-shrink-0">
                    {/* Search inside preview */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter preview rows by buyer, item, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-800 placeholder-gray-400"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Actions: OS-Recommended Download + Alternative + Copy + Print */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Primary OS-Recommended Download */}
                        {isMacOrApple ? (
                            <button
                                onClick={handleDownloadCSV}
                                disabled={allRows.length === 0 || downloadingFormat !== null}
                                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                title="Recommended for Mac: Opens directly in Apple Numbers & Excel without errors"
                            >
                                <Apple size={16} />
                                <span>Download for Mac (.CSV)</span>
                                <span className="bg-emerald-700/60 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-normal">
                                    Numbers & Excel
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={handleDownloadExcel}
                                disabled={allRows.length === 0 || downloadingFormat !== null}
                                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                title="Recommended for Windows: Native Microsoft Excel format"
                            >
                                <Monitor size={16} />
                                <span>Download for Windows (.XLSX)</span>
                                <span className="bg-emerald-700/60 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded font-normal">
                                    Excel
                                </span>
                            </button>
                        )}

                        {/* Secondary Alternative Download */}
                        {isMacOrApple ? (
                            <button
                                onClick={handleDownloadExcel}
                                disabled={allRows.length === 0 || downloadingFormat !== null}
                                className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-xl font-semibold text-xs transition-colors border border-gray-200"
                                title="Download standard Excel .xlsx workbook"
                            >
                                <FileSpreadsheet size={15} className="text-emerald-700" />
                                <span>Download .XLSX</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleDownloadCSV}
                                disabled={allRows.length === 0 || downloadingFormat !== null}
                                className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-xl font-semibold text-xs transition-colors border border-gray-200"
                                title="Download universal UTF-8 CSV"
                            >
                                <FileText size={15} className="text-emerald-700" />
                                <span>Download .CSV</span>
                            </button>
                        )}

                        {/* Copy TSV to Clipboard */}
                        <button
                            onClick={handleCopy}
                            disabled={allRows.length === 0}
                            className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl font-semibold text-xs transition-colors border border-gray-200"
                            title="Copy sheet to clipboard (paste directly into Google Sheets or Excel)"
                        >
                            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                            <span>{copied ? 'Copied TSV!' : 'Copy Sheet'}</span>
                        </button>

                        {/* Print View */}
                        <button
                            onClick={handlePrint}
                            disabled={allRows.length === 0}
                            className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl font-semibold text-xs transition-colors border border-gray-200"
                            title="Print preview"
                        >
                            <Printer size={15} />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                    </div>
                </div>

                {/* Spreadsheet Table View */}
                <div
                    ref={tableContainerRef}
                    className="flex-1 overflow-auto bg-slate-100/50 p-2 md:p-4 select-text"
                >
                    {filteredRows.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                            <FileSpreadsheet size={48} className="mb-3 opacity-30 text-emerald-800" />
                            <p className="font-bold text-gray-600 text-sm">
                                {allRows.length === 0 ? 'No orders to display' : 'No rows match your preview search'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {allRows.length === 0
                                    ? 'Try adjusting date filters or search terms on the orders page.'
                                    : 'Clear the search box above to view all preview rows.'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-xs border border-gray-300 overflow-hidden min-w-[1100px]">
                            {/* Fake Excel Sheet Tab Bar */}
                            <div className="bg-slate-100 border-b border-gray-300 px-3 py-1.5 flex items-center justify-between text-[11px] text-gray-500 font-mono select-none">
                                <div className="flex items-center space-x-3">
                                    <span className="bg-white px-3 py-0.5 rounded-t font-semibold text-emerald-800 border-t-2 border-emerald-600 shadow-2xs">
                                        Sheet 1: Orders ({filteredRows.length} rows)
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-400">
                                    Scroll horizontally or vertically to inspect data
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    {/* Excel Column Letters Header: A, B, C... */}
                                    <thead>
                                        <tr className="bg-slate-100 text-gray-400 font-mono text-[10px] border-b border-gray-200 select-none">
                                            <th className="w-10 px-2 py-1 text-center font-normal border-r border-gray-200">#</th>
                                            {colLetters.slice(0, columns.length).map((letter, idx) => (
                                                <th key={idx} className="px-3 py-1 text-center font-normal border-r border-gray-200">
                                                    {letter}
                                                </th>
                                            ))}
                                        </tr>

                                        {/* Column Names Header */}
                                        <tr className="bg-emerald-900 text-white font-semibold text-[11px] uppercase tracking-wider sticky top-0 shadow-xs z-10">
                                            <th className="w-10 px-2 py-2 text-center bg-emerald-950 border-r border-emerald-800 font-mono">
                                                №
                                            </th>
                                            {columns.map((col, idx) => (
                                                <th
                                                    key={idx}
                                                    className={`px-3 py-2.5 border-r border-emerald-800/80 whitespace-nowrap ${
                                                        col === 'Quantity' || col === 'Price/Unit' || col === 'Item Total' || col === 'Order Total'
                                                            ? 'text-right'
                                                            : col === 'Status'
                                                            ? 'text-center'
                                                            : 'text-left'
                                                    }`}
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Data Rows */}
                                    <tbody className="divide-y divide-gray-200 font-sans">
                                        {filteredRows.map((row, rowIdx) => (
                                            <tr
                                                key={rowIdx}
                                                className={`hover:bg-emerald-50/50 transition-colors ${
                                                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                                                }`}
                                            >
                                                {/* Row Index */}
                                                <td className="px-2 py-2 text-center text-gray-400 font-mono text-[10px] border-r border-gray-200 bg-slate-50/90 select-none">
                                                    {rowIdx + 1}
                                                </td>

                                                {/* Order ID */}
                                                <td className="px-3 py-2 font-mono font-medium text-emerald-900 border-r border-gray-100 whitespace-nowrap">
                                                    #{row['Order ID']}
                                                </td>

                                                {/* Order Date */}
                                                <td className="px-3 py-2 text-gray-600 font-mono text-[11px] border-r border-gray-100 whitespace-nowrap">
                                                    {row['Order Date']}
                                                </td>

                                                {/* Buyer Name */}
                                                <td className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-100 whitespace-nowrap">
                                                    {row['Buyer Name']}
                                                </td>

                                                {/* Buyer Type */}
                                                <td className="px-3 py-2 text-gray-600 border-r border-gray-100 uppercase text-[10px] font-bold tracking-wider whitespace-nowrap">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                        {row['Buyer Type']}
                                                    </span>
                                                </td>

                                                {/* Phone */}
                                                <td className="px-3 py-2 text-gray-600 font-mono text-[11px] border-r border-gray-100 whitespace-nowrap">
                                                    {row['Phone']}
                                                </td>

                                                {/* Item Name */}
                                                <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-100 whitespace-nowrap">
                                                    {row['Item Name']}
                                                </td>

                                                {/* Quantity */}
                                                <td className="px-3 py-2 text-right font-mono font-semibold text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                                    {row.Quantity}
                                                </td>

                                                {/* Unit */}
                                                <td className="px-3 py-2 text-gray-500 text-[11px] border-r border-gray-100 whitespace-nowrap">
                                                    {row.Unit}
                                                </td>

                                                {/* Price/Unit */}
                                                <td className="px-3 py-2 text-right font-mono text-gray-600 border-r border-gray-100 whitespace-nowrap">
                                                    ₹{Number(row['Price/Unit']).toFixed(2)}
                                                </td>

                                                {/* Item Total */}
                                                <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700 border-r border-gray-100 whitespace-nowrap">
                                                    ₹{Number(row['Item Total']).toFixed(2)}
                                                </td>

                                                {/* Order Total */}
                                                <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-100 whitespace-nowrap">
                                                    ₹{Number(row['Order Total']).toFixed(2)}
                                                </td>

                                                {/* Status */}
                                                <td className="px-3 py-2 text-center border-r border-gray-100 whitespace-nowrap">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                            row.Status === 'PLACED'
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                : row.Status === 'COLLECTED'
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                        }`}
                                                    >
                                                        {row.Status}
                                                    </span>
                                                </td>

                                                {/* Collected At */}
                                                <td className="px-3 py-2 text-gray-500 font-mono text-[11px] border-r border-gray-100 whitespace-nowrap">
                                                    {row['Collected At']}
                                                </td>

                                                {/* Cancelled At */}
                                                <td className="px-3 py-2 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                                                    {row['Cancelled At']}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                    {/* Summary Footer Row */}
                                    <tfoot className="sticky bottom-0 bg-slate-100 text-gray-800 font-bold border-t-2 border-gray-300 shadow-md">
                                        <tr>
                                            <td className="px-2 py-2 text-center font-mono text-[10px] bg-slate-200">Σ</td>
                                            <td colSpan={6} className="px-3 py-2.5 text-right uppercase text-[11px] tracking-wider text-gray-600">
                                                Totals ({filteredRows.length} Rows):
                                            </td>
                                            <td className="px-3 py-2.5 text-right font-mono text-emerald-900">
                                                {filteredRows.reduce((acc, r) => acc + (Number(r.Quantity) || 0), 0)}
                                            </td>
                                            <td></td>
                                            <td></td>
                                            <td className="px-3 py-2.5 text-right font-mono text-emerald-800 text-sm">
                                                ₹{filteredRows.reduce((acc, r) => acc + (Number(r['Item Total']) || 0), 0).toFixed(2)}
                                            </td>
                                            <td colSpan={4}></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Footer */}
                <div className="bg-white border-t border-gray-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>
                            Previewing <strong>{filteredRows.length}</strong> of <strong>{allRows.length}</strong> rows
                        </span>
                        {isMacOrApple && (
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Apple Numbers & Excel ready
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold text-xs transition-colors"
                        >
                            Close Preview
                        </button>

                        {/* Direct Smart Download Button */}
                        <button
                            onClick={isMacOrApple ? handleDownloadCSV : handleDownloadExcel}
                            disabled={allRows.length === 0 || downloadingFormat !== null}
                            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <Download size={16} />
                            <span>
                                {isMacOrApple
                                    ? 'Download Mac Format (.csv)'
                                    : 'Download Windows Format (.xlsx)'}
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
