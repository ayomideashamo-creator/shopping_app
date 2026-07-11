export interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  reservedStock: number;
}

export interface LineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  customerName: string;
  ticketNumber: number;
  items: LineItem[];
  total: number;
  status: 'pending' | 'fulfilled';
  createdAt: string;
}

export interface ShopOwner {
  id: string;
  name: string;
}

export interface Toast {
  message: string;
  type?: 'success' | 'error' | 'info';
}
