export interface TickerTheme {
    id: string;
    label: string;
    color: string; // hex representation
    bgClass: string;
    textClass: string;
    badgeClass: string;
    iconClass: string;
    borderClass: string;
    isCustom?: boolean;
}

export const TICKER_COLOR_PRESETS: TickerTheme[] = [
    {
        id: 'emergency',
        label: 'Emergency (Red)',
        color: '#DC2626',
        bgClass: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600',
        textClass: 'text-white',
        badgeClass: 'bg-white/25 text-white border-white/40',
        iconClass: 'text-white fill-white',
        borderClass: 'border-red-500',
    },
    {
        id: 'warning',
        label: 'Notice (Amber)',
        color: '#D97706',
        bgClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600',
        textClass: 'text-white',
        badgeClass: 'bg-black/20 text-white border-white/20',
        iconClass: 'text-amber-100 fill-amber-100',
        borderClass: 'border-amber-400',
    },
    {
        id: 'fresh',
        label: 'Fresh Harvest (Green)',
        color: '#16A34A',
        bgClass: 'bg-gradient-to-r from-emerald-600 via-brand-primary to-emerald-700',
        textClass: 'text-white',
        badgeClass: 'bg-white/25 text-white border-white/40',
        iconClass: 'text-emerald-100 fill-emerald-100',
        borderClass: 'border-emerald-500',
    },
    {
        id: 'info',
        label: 'Info (Blue)',
        color: '#2563EB',
        bgClass: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600',
        textClass: 'text-white',
        badgeClass: 'bg-white/25 text-white border-white/40',
        iconClass: 'text-blue-100 fill-blue-100',
        borderClass: 'border-blue-500',
    },
    {
        id: 'special',
        label: 'Special (Purple)',
        color: '#9333EA',
        bgClass: 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700',
        textClass: 'text-white',
        badgeClass: 'bg-white/25 text-white border-white/40',
        iconClass: 'text-purple-100 fill-purple-100',
        borderClass: 'border-purple-500',
    },
    {
        id: 'dark',
        label: 'Dark Emerald',
        color: '#0F2A22',
        bgClass: 'bg-[#0F2A22]',
        textClass: 'text-[#D4F5E1]',
        badgeClass: 'bg-white/10 text-emerald-200 border-white/15',
        iconClass: 'text-emerald-400 fill-emerald-400',
        borderClass: 'border-emerald-800',
    }
];

export function getTickerTheme(typeOrColor?: string): TickerTheme {
    const raw = (typeOrColor || 'info').trim().toLowerCase();

    // Check presets by ID or color
    const matched = TICKER_COLOR_PRESETS.find(p => p.id === raw || p.color.toLowerCase() === raw);
    if (matched) return matched;

    // Check aliases
    if (raw === 'red') return TICKER_COLOR_PRESETS[0];
    if (raw === 'amber' || raw === 'yellow' || raw === 'orange') return TICKER_COLOR_PRESETS[1];
    if (raw === 'green' || raw === 'success') return TICKER_COLOR_PRESETS[2];
    if (raw === 'blue') return TICKER_COLOR_PRESETS[3];
    if (raw === 'purple' || raw === 'violet') return TICKER_COLOR_PRESETS[4];

    // If it's a custom hex color code (#xxxxxx)
    if (raw.startsWith('#') && (raw.length === 7 || raw.length === 4)) {
        return {
            id: raw,
            label: 'Custom Color',
            color: raw,
            bgClass: '',
            textClass: 'text-white',
            badgeClass: 'bg-white/25 text-white border-white/40',
            iconClass: 'text-white fill-white',
            borderClass: 'border-white/30',
            isCustom: true,
        };
    }

    // Default to green harvest / info
    return TICKER_COLOR_PRESETS[2];
}

/**
 * Resolves the primary container theme for the whole marquee bar
 * Prioritizes emergency/red first, then warning/amber, then latest
 */
export function getDominantTickerTheme(announcements: { type?: string }[]): TickerTheme {
    if (!announcements || announcements.length === 0) return TICKER_COLOR_PRESETS[2];

    const hasEmergency = announcements.find(a => {
        const t = (a.type || '').toLowerCase();
        return t === 'emergency' || t === 'red' || t === '#dc2626' || t === '#ef4444';
    });
    if (hasEmergency) return getTickerTheme(hasEmergency.type);

    const hasWarning = announcements.find(a => {
        const t = (a.type || '').toLowerCase();
        return t === 'warning' || t === 'amber' || t === 'yellow' || t === '#d97706' || t === '#f59e0b';
    });
    if (hasWarning) return getTickerTheme(hasWarning.type);

    // Otherwise use the first/most recent announcement's theme
    return getTickerTheme(announcements[0]?.type);
}
