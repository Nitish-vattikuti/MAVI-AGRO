export type Unit = 'kg' | 'g' | 'bundle' | 'piece' | 'liter' | 'ml' | 'packet' | string;

export interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: Unit;
  quantity: number; // Current stock level
  image?: string; // URL or base64
  inStock: boolean;
  allowFractional?: boolean; // Show 250g/500g options
  isDeleted?: boolean; // Soft delete
}

export type OrderStatus = 'placed' | 'collected' | 'cancelled';
export type BuyerType = 'staff' | 'student' | 'outsider';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  total: number;
}

export interface Order {
  id: string;
  createdAt: string; // ISO date string
  buyerName: string;
  buyerType: BuyerType;
  phone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  collectedAt?: string; // ISO date string
  cancelledAt?: string; // ISO date string
  note?: string;
}

export interface Announcement {
  id: string;
  message: string;
  type: string;
  expiresAt: string | null;
}
