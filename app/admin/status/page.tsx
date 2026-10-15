'use client';

import { useState, useEffect } from 'react';
import { Power, Megaphone, Plus, Clock, AlertCircle, CheckCircle2, X, Palette, Eye, AlertTriangle } from 'lucide-react';
import { TICKER_COLOR_PRESETS, getTickerTheme, getDominantTickerTheme } from '@/utils/tickerTheme';

interface Announcement {
    id: string;
    message: string;
    type: string;
    expiresAt: string | null;
}

export default function StatusPage() {
    const [status, setStatus] = useState('open');
    const [reason, setReason] = useState('');
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [duration, setDuration] = useState('1');
    const [selectedColor, setSelectedColor] = useState('emergency'); // Default to emergency/red as requested
    const [customHex, setCustomHex] = useState('#DC2626');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
            setStatus(data.settings.farm_status || 'open');
            setReason(data.settings.farm_status_reason || '');
        }
        if (data.announcements) {
            setAnnouncements(data.announcements);
        }
    };

    const handleStatusSave = async () => {
        setIsSavingStatus(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'update_status',
                    data: { status, reason }
                })
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSavingStatus(false);
            // Simulate delay for feel
            setTimeout(() => { }, 500);
        }
    };

    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsAdding(true);
        try {
            const typeToSend = selectedColor === 'custom' ? customHex : selectedColor;
            const res = await fetch('/api/settings', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'add_announcement',
                    data: {
                        message: newMessage,
                        durationDays: duration,
                        type: typeToSend
                    }
                })
            });
            if (res.ok) {
                setNewMessage('');
                loadSettings();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm('Delete this announcement?')) return;

        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({
                type: 'delete_announcement',
                data: { id }
            })
        });
        loadSettings();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-brand-dark tracking-tighter mb-2">Operations Center</h1>
                <p className="text-gray-400 font-medium">Manage real-time farm availability and public broadcasts.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* 1. Farm Status Card - Premium Glass */}
                <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
                    {/* Status Glow Background */}
                    <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br ${status === 'open' ? 'from-green-400/20' : 'from-red-400/20'} to-transparent rounded-bl-full blur-3xl transition-colors duration-1000 -mr-20 -mt-20 pointer-events-none`} />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-10">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${status === 'open' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'}`} />
                                    <span className={`text-sm font-bold uppercase tracking-widest ${status === 'open' ? 'text-green-600' : 'text-red-500'}`}>
                                        {status === 'open' ? 'Operational' : 'Stopped'}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-brand-dark">Farm Status</h2>
                            </div>
                            <div className={`p-4 rounded-2xl ${status === 'open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'} transition-colors duration-500`}>
                                <Power size={28} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Segmented Control */}
                        <div className="bg-gray-50 p-1.5 rounded-full flex relative mb-8 border border-gray-100">
                            {/* Sliding Background (Simplified visually) */}
                            <button
                                onClick={() => setStatus('open')}
                                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-full font-bold transition-all duration-300 ${status === 'open' ? 'bg-white text-green-700 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <CheckCircle2 size={18} />
                                <span>Open Farm</span>
                            </button>
                            <button
                                onClick={() => setStatus('closed')}
                                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-full font-bold transition-all duration-300 ${status === 'closed' ? 'bg-white text-red-600 shadow-md scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <AlertCircle size={18} />
                                <span>Stop Orders</span>
                            </button>
                        </div>

                        {/* Reason Input (Conditional) */}
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${status === 'closed' ? 'max-h-[200px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider ml-1">Reason for Closure</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why are orders stopped? (e.g. Out of stock)"
                                className="w-full px-6 py-4 bg-white border-2 border-red-50 focus:border-red-100 focus:ring-4 focus:ring-red-500/10 rounded-full text-brand-dark font-bold placeholder:text-gray-300 outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={handleStatusSave}
                            disabled={isSavingStatus}
                            className={`w-full py-5 rounded-full font-bold text-white text-lg transition-all transform hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2 ${status === 'open' ? 'bg-green-600 shadow-green-200' : 'bg-red-600 shadow-red-200'}`}
                        >
                            {isSavingStatus ? (
                                <span className="animate-pulse">Updating System...</span>
                            ) : (
                                <span>Update Live Status</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* 2. Announcements Card */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-brand-secondary/30 to-transparent rounded-bl-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-brand-dark">Live Ticker</h2>
                                <p className="text-gray-400 text-sm font-medium mt-1">Broadcast custom alerts & emergency updates to the kiosk.</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-brand-cream text-brand-primary">
                                <Megaphone size={28} />
                            </div>
                        </div>

                        {/* Color & Alert Mode Selector */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                                Ticker Color & Alert Mode
                            </label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {TICKER_COLOR_PRESETS.map((preset) => {
                                    const isSelected = selectedColor === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => setSelectedColor(preset.id)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-2 border shadow-xs ${
                                                isSelected
                                                    ? 'ring-2 ring-offset-2 ring-brand-primary scale-105 border-transparent text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                            }`}
                                            style={isSelected ? { backgroundColor: preset.color } : undefined}
                                        >
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                                style={{ backgroundColor: preset.color }}
                                            />
                                            <span>{preset.label}</span>
                                        </button>
                                    );
                                })}

                                {/* Custom Color Picker */}
                                <div className="relative inline-flex items-center">
                                    <label
                                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 flex items-center space-x-2 border shadow-xs ${
                                            selectedColor === 'custom'
                                                ? 'ring-2 ring-offset-2 ring-brand-primary scale-105 border-transparent text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                                        }`}
                                        style={selectedColor === 'custom' ? { backgroundColor: customHex } : undefined}
                                    >
                                        <Palette size={13} />
                                        <span>Custom</span>
                                        <input
                                            type="color"
                                            value={customHex}
                                            onChange={(e) => {
                                                setCustomHex(e.target.value);
                                                setSelectedColor('custom');
                                            }}
                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Ticker Live Preview */}
                        {(() => {
                            const previewTheme = selectedColor === 'custom' ? getTickerTheme(customHex) : getTickerTheme(selectedColor);
                            const isEmergency = previewTheme.id === 'emergency';
                            return (
                                <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <div className="bg-gray-50 px-4 py-1.5 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                        <span className="flex items-center gap-1.5">
                                            <Eye size={12} />
                                            Live Ticker Preview
                                        </span>
                                        <span className="capitalize">{previewTheme.label}</span>
                                    </div>
                                    <div
                                        style={previewTheme.isCustom ? { backgroundColor: previewTheme.color } : undefined}
                                        className={`${previewTheme.bgClass} ${previewTheme.textClass} px-5 py-3 flex items-center justify-between transition-colors duration-300 font-bold text-xs md:text-sm`}
                                    >
                                        <div className="flex items-center space-x-2.5 truncate">
                                            {isEmergency ? (
                                                <span className="flex h-2.5 w-2.5 relative shrink-0">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                                </span>
                                            ) : (
                                                <Megaphone size={14} className={`${previewTheme.iconClass} shrink-0`} />
                                            )}
                                            <span className="truncate">
                                                {newMessage.trim() || 'Type your message below to see live broadcast preview...'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold opacity-75 shrink-0 ml-2">
                                            {duration} {parseInt(duration) === 1 ? 'day' : 'days'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Input Area */}
                        <form onSubmit={handleAddAnnouncement} className="mb-8">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-white rounded-full border border-gray-200 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
                                    <input
                                        required
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Announcement or emergency alert..."
                                        className="flex-1 px-5 py-3 bg-transparent border-none outline-none font-bold text-gray-700 placeholder:text-gray-300"
                                    />
                                    <div className="flex items-center gap-2 px-3 bg-gray-50 rounded-full border border-gray-100">
                                        <div className="h-6 w-px bg-gray-200 hidden sm:block mr-1"></div>
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-12 bg-transparent text-sm font-bold text-gray-700 outline-none text-center"
                                        />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-2">Days</span>

                                        <button
                                            type="submit"
                                            disabled={isAdding}
                                            className="bg-brand-dark text-white p-2.5 rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-brand-dark/20 ml-1"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Feed */}
                        <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] pr-2 custom-scrollbar">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Active Broadcasts ({announcements.length})</h3>

                            {announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[150px] border-2 border-dashed border-gray-100 rounded-2xl text-gray-300">
                                    <Megaphone size={24} className="mb-2 opacity-50" />
                                    <span className="font-bold text-sm">No active announcements</span>
                                </div>
                            ) : (
                                announcements.map((a) => {
                                    const theme = getTickerTheme(a.type);
                                    return (
                                        <div
                                            key={a.id}
                                            className="group relative bg-gray-50 hover:bg-white border-l-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5 border-t border-r border-b border-gray-100"
                                            style={{ borderLeftColor: theme.color }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-4">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                                            style={{ backgroundColor: theme.color }}
                                                            title={theme.label}
                                                        />
                                                        <div className="bg-brand-cream px-2 py-0.5 rounded-full flex items-center space-x-1.5 border border-brand-dark/5">
                                                            <Clock size={10} className="text-brand-primary" />
                                                            <span className="text-[10px] uppercase font-bold text-brand-primary">
                                                                {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Perm'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-gray-800 leading-snug">{a.message}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(a.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
