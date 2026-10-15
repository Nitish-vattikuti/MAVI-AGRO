'use client';

import { useState, useEffect } from 'react';
import { Database, RefreshCw, Table, AlertCircle, HardDrive } from 'lucide-react';

export default function DatabaseViewerPage() {
    const [tables, setTables] = useState<{ name: string }[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch list of tables on mount
    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch data when table is selected
    useEffect(() => {
        if (selectedTable) {
            fetchTableData(selectedTable);
        } else {
            setTableData([]);
        }
         
    }, [selectedTable]);

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/database?action=tables');
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTables(data);
            if (data.length > 0 && !selectedTable) {
                setSelectedTable(data[0].name);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        }
    };

    const fetchTableData = async (tableName: string) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/database?table=${tableName}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setTableData(data);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to render cell content nicely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCell = (value: any) => {
        if (value === null || value === undefined) return <span className="text-gray-300 italic">null</span>;
        if (typeof value === 'boolean') return value ? <span className="text-green-600 font-bold">TRUE</span> : <span className="text-red-500 font-bold">FALSE</span>;
        if (typeof value === 'object') {
            return (
                <pre className="text-[10px] bg-gray-50 p-1 rounded border border-gray-100 max-w-[200px] overflow-hidden truncate hover:overflow-visible hover:whitespace-pre-wrap hover:absolute hover:z-10 hover:bg-white hover:shadow-lg hover:max-w-md cursor-help">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }
        // Try parsing JSON strings for nicer display
        if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            try {
                const parsed = JSON.parse(value);
                return (
                    <pre className="text-[10px] bg-gray-50 p-1 rounded border border-gray-100 max-w-[200px] overflow-hidden truncate hover:overflow-visible hover:whitespace-pre-wrap hover:absolute hover:z-10 hover:bg-white hover:shadow-lg hover:max-w-md cursor-help">
                        {JSON.stringify(parsed, null, 2)}
                    </pre>
                );
            } catch {
                return <span className="truncate max-w-[200px] block" title={value}>{value}</span>;
            }
        }
        return <span className="truncate max-w-[200px] block" title={String(value)}>{value}</span>;
    };

    const getColumns = () => {
        if (tableData.length === 0) return [];
        return Object.keys(tableData[0]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Database className="text-brand-primary" />
                        Database Viewer
                    </h1>
                    <p className="text-gray-500">Inspect raw data in <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-700">agro.db</code></p>
                </div>
                <div className="flex items-center gap-4">
                    <a
                        href="/api/database/backup"
                        download
                        className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 text-sm font-bold hover:bg-emerald-100 transition-colors shadow-xs"
                    >
                        <Database size={16} />
                        <span>Backup DB</span>
                    </a>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 text-sm font-bold shadow-xs">
                        <HardDrive size={16} />
                        <span>SQLite Local DB</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Table size={18} className="text-gray-400" />
                        <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Select Table:</label>
                        <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-800 text-sm rounded-full focus:ring-brand-primary focus:border-brand-primary block w-full md:w-64 px-4 py-2 outline-none font-medium"
                        >
                            {tables.map(t => (
                                <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => fetchTableData(selectedTable)}
                        className="p-2.5 text-gray-500 hover:text-brand-primary hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-200"
                        title="Reload Data"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <RefreshCw size={40} className="animate-spin mb-4 opacity-50" />
                            <p>Loading records...</p>
                        </div>
                    ) : tableData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Database size={40} className="mb-4 opacity-20" />
                            <p>No records found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {tableData.map((row, i) => (
                                <div key={i} className="p-4 space-y-2 bg-white">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Row #{i + 1}</span>
                                    </div>
                                    <div className="space-y-1">
                                        {getColumns().map(col => (
                                            <div key={`${i}-${col}`} className="flex flex-col text-sm border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                                <span className="font-bold text-gray-600 text-xs uppercase tracking-wide mb-0.5">{col}</span>
                                                <div className="text-gray-800 break-words font-mono text-xs bg-gray-50 p-1.5 rounded">
                                                    {renderCell(row[col])}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <RefreshCw size={40} className="animate-spin mb-4 opacity-50" />
                            <p>Loading records...</p>
                        </div>
                    ) : tableData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Database size={40} className="mb-4 opacity-20" />
                            <p>No records found in this table.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                                <tr>
                                    {getColumns().map(header => (
                                        <th key={header} className="px-6 py-4 font-bold tracking-wider border-b border-gray-100">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        {getColumns().map(col => (
                                            <td key={`${i}-${col}`} className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono text-xs">
                                                {renderCell(row[col])}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="bg-gray-50 border-t border-gray-100 p-3 text-xs text-center text-gray-400">
                    Showing last 100 records • SQLite Database
                </div>
            </div>
        </div>
    );
}
