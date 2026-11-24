export type BookLabel = '' | 'Bestseller' | 'Terbaru' | 'Rekomendasi';

export type ReadingStatus = 'Sudah Dibaca' | 'Sedang Dibaca' | 'Ingin Dibaca';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  coverUrl: string;
  label: BookLabel;
  pages?: number;
  rating?: number;
  quote?: string;
  readingStatus?: ReadingStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem {
  bookId: string;
  quantity: number;
}

export type OrderStatus =
  | 'Menunggu Konfirmasi'
  | 'Diproses'
  | 'Dikirim'
  | 'Selesai'
  | 'Dibatalkan';

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  notes: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  storeName: string;
}

export type AppRoute = 'storefront' | 'admin-login' | 'admin-dashboard';

export type AdminTab = 'dashboard' | 'products' | 'categories' | 'orders' | 'whatsapp';
