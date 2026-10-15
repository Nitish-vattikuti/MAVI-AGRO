import * as XLSX from 'xlsx';
import { Order } from '@/data/types';
import { format } from 'date-fns';

export interface FlattenedOrderRow {
    'Order ID': string;
    'Order Date': string;
    'Buyer Name': string;
    'Buyer Type': string;
    'Phone': string;
    'Item Name': string;
    'Quantity': number;
    'Unit': string;
    'Price/Unit': number;
    'Item Total': number;
    'Order Total': number;
    'Status': string;
    'Collected At': string;
    'Cancelled At': string;
}

export type ClientOS = 'mac' | 'windows' | 'linux' | 'ios' | 'android' | 'other';

/**
 * Detect client operating system cleanly in browser environments
 */
export function detectClientOS(): ClientOS {
    if (typeof window === 'undefined' || !window.navigator) return 'other';

    const ua = window.navigator.userAgent || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = window.navigator as any;
    const platform = nav.userAgentData?.platform || nav.platform || '';
    const combined = `${ua} ${platform}`.toLowerCase();

    if (/iphone|ipad|ipod/.test(combined)) return 'ios';
    if (/macintosh|mac os x|macintel|macppc/.test(combined)) return 'mac';
    if (/windows|win32|win64/.test(combined)) return 'windows';
    if (/android/.test(combined)) return 'android';
    if (/linux/.test(combined)) return 'linux';

    return 'other';
}

/**
 * Flatten nested orders into one row per item
 */
export function flattenOrders(orders: Order[]): FlattenedOrderRow[] {
    return orders.flatMap(order => {
        return order.items.map(item => ({
            'Order ID': order.id.substring(0, 8),
            'Order Date': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
            'Buyer Name': order.buyerName,
            'Buyer Type': order.buyerType,
            'Phone': order.phone || '-',
            'Item Name': item.name,
            'Quantity': item.quantity,
            'Unit': item.unit,
            'Price/Unit': item.pricePerUnit,
            'Item Total': Number(item.total),
            'Order Total': Number(order.totalAmount),
            'Status': order.status.toUpperCase(),
            'Collected At': order.collectedAt ? format(new Date(order.collectedAt), 'dd/MM/yyyy HH:mm') : '-',
            'Cancelled At': order.cancelledAt ? format(new Date(order.cancelledAt), 'dd/MM/yyyy HH:mm') : '-',
        }));
    });
}

/**
 * Trigger clean browser download via standard Blob URL
 */
export function triggerFileDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 200);
}

/**
 * Export orders as universal UTF-8 CSV with BOM
 * Recommended for Mac (Apple Numbers, QuickLook, Mac Excel) & universal spreadsheets
 */
export function exportOrdersToCSV(
    orders: Order[] | FlattenedOrderRow[],
    customFilename?: string
): boolean {
    const rows: FlattenedOrderRow[] =
        orders.length > 0 && 'Order ID' in orders[0]
            ? (orders as FlattenedOrderRow[])
            : flattenOrders(orders as Order[]);

    if (rows.length === 0) return false;

    const headers = Object.keys(rows[0]) as (keyof FlattenedOrderRow)[];

    const escapeCSVCell = (val: unknown): string => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (/[",\n\r]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = headers.map(h => escapeCSVCell(h)).join(',');
    const dataLines = rows.map(row => headers.map(h => escapeCSVCell(row[h])).join(','));

    // UTF-8 BOM prefix '\uFEFF' ensures Apple Numbers and Excel open without encoding corruption
    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
    const fileName = customFilename || `Agro_Orders_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerFileDownload(blob, fileName);
    return true;
}

/**
 * Export orders as native .XLSX Excel workbook with column autosizing
 * Recommended for Windows (Microsoft Excel)
 */
export function exportOrdersToExcel(
    orders: Order[] | FlattenedOrderRow[],
    customFilename?: string
): boolean {
    const rows: FlattenedOrderRow[] =
        orders.length > 0 && 'Order ID' in orders[0]
            ? (orders as FlattenedOrderRow[])
            : flattenOrders(orders as Order[]);

    if (rows.length === 0) return false;

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Apply clean column widths so sheets are immediately readable
    worksheet['!cols'] = [
        { wch: 11 }, // Order ID
        { wch: 18 }, // Order Date
        { wch: 22 }, // Buyer Name
        { wch: 12 }, // Buyer Type
        { wch: 15 }, // Phone
        { wch: 22 }, // Item Name
        { wch: 10 }, // Quantity
        { wch: 8 },  // Unit
        { wch: 12 }, // Price/Unit
        { wch: 12 }, // Item Total
        { wch: 12 }, // Order Total
        { wch: 12 }, // Status
        { wch: 18 }, // Collected At
        { wch: 18 }, // Cancelled At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const fileName = customFilename || `Agro_Orders_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;

    // Generate ArrayBuffer and trigger clean standard download
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    triggerFileDownload(blob, fileName);
    return true;
}

/**
 * Smart OS-aware export:
 * - On macOS/iOS: defaults to CSV (with UTF-8 BOM, opens seamlessly in Apple Numbers & Excel for Mac)
 * - On Windows/other: defaults to XLSX (Microsoft Excel)
 */
export function exportOrdersSmart(
    orders: Order[] | FlattenedOrderRow[],
    forcedFormat?: 'csv' | 'xlsx'
): { format: 'csv' | 'xlsx'; os: ClientOS } {
    const os = detectClientOS();
    const targetFormat = forcedFormat || (os === 'mac' || os === 'ios' ? 'csv' : 'xlsx');

    if (targetFormat === 'csv') {
        exportOrdersToCSV(orders);
    } else {
        exportOrdersToExcel(orders);
    }

    return { format: targetFormat, os };
}

/**
 * Copy sheet data to clipboard as Tab-Separated Values (TSV)
 * Can be pasted directly (Cmd+V / Ctrl+V) into Excel, Google Sheets, or Numbers
 */
export async function copyOrdersToClipboard(
    orders: Order[] | FlattenedOrderRow[]
): Promise<boolean> {
    const rows: FlattenedOrderRow[] =
        orders.length > 0 && 'Order ID' in orders[0]
            ? (orders as FlattenedOrderRow[])
            : flattenOrders(orders as Order[]);

    if (rows.length === 0) return false;

    const headers = Object.keys(rows[0]) as (keyof FlattenedOrderRow)[];
    const headerLine = headers.join('\t');
    const dataLines = rows.map(row => headers.map(h => String(row[h] ?? '')).join('\t'));
    const tsvContent = [headerLine, ...dataLines].join('\n');

    try {
        await navigator.clipboard.writeText(tsvContent);
        return true;
    } catch {
        return false;
    }
}
