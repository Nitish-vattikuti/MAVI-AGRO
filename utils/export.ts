import * as XLSX from 'xlsx';
import { Order } from '@/data/types';
import { format } from 'date-fns';

export function exportOrdersToExcel(orders: Order[]) {
    // Flatten orders for Excel (one row per item as requested)
    /*
      Columns:
      Order ID, Order Date (IST), Buyer Name, Buyer Type, Phone, Item Name, Category, 
      Quantity, Unit, Price per Unit, Total Amount, Order Status, Collected At, Created By
    */

    const rows = orders.flatMap(order => {
        return order.items.map(item => ({
            'Order ID': order.id.substring(0, 8), // Short ID for readability
            'Order Date': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
            'Buyer Name': order.buyerName,
            'Buyer Type': order.buyerType,
            'Phone': order.phone || '-',
            'Item Name': item.name,
            'Quantity': item.quantity,
            'Unit': item.unit,
            'Price/Unit': item.pricePerUnit,
            'Item Total': item.total,
            'Order Total': order.totalAmount, // Repeated for each item, standard in flat exports
            'Status': order.status.toUpperCase(),
            'Collected At': order.collectedAt ? format(new Date(order.collectedAt), 'dd/MM/yyyy HH:mm') : '-',
            'Cancelled At': order.cancelledAt ? format(new Date(order.cancelledAt), 'dd/MM/yyyy HH:mm') : '-',
        }));
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate filename with date
    const fileName = `Agro_Orders_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;

    XLSX.writeFile(workbook, fileName);
}
