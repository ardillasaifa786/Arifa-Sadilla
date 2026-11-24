import type { Book, CartItem, Category, Order, OrderStatus, StoreSettings } from '../types/bookstore';

export const STORAGE_KEYS = {
  BOOKS: 'tra_books_v1',
  CATEGORIES: 'tra_categories_v1',
  CART: 'tra_cart_v1',
  ORDERS: 'tra_orders_v1',
  SETTINGS: 'tra_settings_v1',
  ADMIN_SESSION: 'tra_admin_session_v1',
} as const;

export const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu Konfirmasi',
  'Diproses',
  'Dikirim',
  'Selesai',
  'Dibatalkan',
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-fiksi', name: 'Fiksi' },
  { id: 'cat-sastra', name: 'Sastra' },
  { id: 'cat-sains', name: 'Sains & Teknologi' },
  { id: 'cat-sejarah', name: 'Sejarah' },
  { id: 'cat-nonfiksi', name: 'Nonfiksi' },
];

export const DEFAULT_BOOKS: Book[] = [
  {
    id: 'bk-1',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    category: 'Fiksi',
    price: 115000,
    stock: 14,
    description:
      'Novel fiksi sejarah yang mengisahkan persahabatan, pengkhianatan, dan perjuangan keluarga aktivis yang mencari kejelasan nasib orang-orang tercinta pada masa kelam 1998.',
    coverUrl: '/src/assets/images/cover_laut_bercerita_1795509287925.jpg',
    label: 'Bestseller',
    pages: 379,
    rating: 5,
    quote: 'Matilah engkau mati, kau akan lahir berkali-kali.',
    readingStatus: 'Sudah Dibaca',
    createdAt: '2026-10-14T09:00:00.000Z',
  },
  {
    id: 'bk-2',
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    category: 'Nonfiksi',
    price: 98000,
    stock: 18,
    description:
      'Pengantar filsafat Stoa Yunani-Romawi kuno yang dikemas relevan untuk mengatasi kecemasan modern, membangun ketangguhan mental, dan hidup lebih tenang.',
    coverUrl: '/src/assets/images/cover_filosofi_teras_1795509287835.jpg',
    label: 'Rekomendasi',
    pages: 320,
    rating: 4,
    quote: 'Fokus pada hal-hal yang berada di dalam kendali kita sendiri.',
    readingStatus: 'Sudah Dibaca',
    createdAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'bk-3',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    category: 'Sastra',
    price: 145000,
    stock: 9,
    description:
      'Roman pertama Tetralogi Buru yang merekam gejolak intelektual Minke di masa Hindia Belanda, mempertemukan cinta, martabat pribumi, dan kesadaran kebangsaan.',
    coverUrl: '/src/assets/images/cover_bumi_manusia_1795509288743.jpg',
    label: 'Bestseller',
    pages: 535,
    rating: 5,
    quote: 'Seorang terpelajar harus juga berlaku adil sejak dalam pikiran apalagi dalam perbuatan.',
    readingStatus: 'Sedang Dibaca',
    createdAt: '2026-11-18T11:30:00.000Z',
  },
  {
    id: 'bk-4',
    title: 'Kosmos & Tata Bintang',
    author: 'Carl Sagan',
    category: 'Sains & Teknologi',
    price: 165000,
    stock: 7,
    description:
      'Penjelajahan puitis tentang sejarah astronomi, evolusi peradaban manusia, dan posisi kita di tengah keluasan alam semesta yang penuh misteri.',
    coverUrl: '/src/assets/images/cover_kosmos_sains_1795509289726.jpg',
    label: 'Terbaru',
    pages: 412,
    rating: 5,
    quote: 'Di suatu tempat, sesuatu yang luar biasa sedang menunggu untuk diketahui.',
    readingStatus: 'Ingin Dibaca',
    createdAt: '2026-11-20T14:00:00.000Z',
  },
  {
    id: 'bk-5',
    title: 'Jejak Niaga Nusantara',
    author: 'Denys Lombard',
    category: 'Sejarah',
    price: 185000,
    stock: 6,
    description:
      'Telusur arsip jalur rempah, pelabuhan kuno, dan pertukaran budaya maritim yang membentuk wajah kepulauan Nusantara lintas abad.',
    coverUrl: '/src/assets/images/cover_jejak_sejarah_1795509289791.jpg',
    label: 'Rekomendasi',
    pages: 468,
    rating: 5,
    quote: 'Laut bukan pemisah pulau, melainkan jalan raya peradaban maritim.',
    readingStatus: 'Sudah Dibaca',
    createdAt: '2026-11-22T08:15:00.000Z',
  },
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-261120-101',
    customerName: 'Nadia Kusuma',
    customerWhatsapp: '081234567890',
    notes: 'Jl. Melati No. 14, Menteng, Jakarta Pusat. Mohon dibungkus kertas kraft.',
    items: [
      {
        bookId: 'bk-1',
        title: 'Laut Bercerita',
        author: 'Leila S. Chudori',
        price: 115000,
        quantity: 1,
      },
      {
        bookId: 'bk-2',
        title: 'Filosofi Teras',
        author: 'Henry Manampiring',
        price: 98000,
        quantity: 1,
      },
    ],
    totalPrice: 213000,
    status: 'Selesai',
    createdAt: '2026-11-20T10:15:00.000Z',
  },
  {
    id: 'ORD-261123-102',
    customerName: 'Bagas Pratama',
    customerWhatsapp: '085678901234',
    notes: 'Perumahan Taman Sari Blok C2, Bandung. Kirim via kurir reguler.',
    items: [
      {
        bookId: 'bk-3',
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        price: 145000,
        quantity: 1,
      },
    ],
    totalPrice: 145000,
    status: 'Menunggu Konfirmasi',
    createdAt: '2026-11-23T15:40:00.000Z',
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: '081360450088',
  storeName: 'The Reading Archive',
};

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadCategories(): Category[] {
  const stored = safeReadJson<Category[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadBooks(): Book[] {
  const stored = safeReadJson<Book[] | null>(STORAGE_KEYS.BOOKS, null);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(DEFAULT_BOOKS));
  return DEFAULT_BOOKS;
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

export function loadCart(): CartItem[] {
  const stored = safeReadJson<CartItem[] | null>(STORAGE_KEYS.CART, null);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  return [];
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

export function loadOrders(): Order[] {
  const stored = safeReadJson<Order[] | null>(STORAGE_KEYS.ORDERS, null);
  if (stored && Array.isArray(stored)) {
    return stored;
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
  return DEFAULT_ORDERS;
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

export function loadSettings(): StoreSettings {
  const stored = safeReadJson<StoreSettings | null>(STORAGE_KEYS.SETTINGS, null);
  if (stored && stored.whatsappNumber) {
    return stored;
  }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: StoreSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'authenticated';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(authenticated: boolean): void {
  try {
    if (authenticated) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'authenticated');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch {
    // Ignore storage restriction errors
  }
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatDateId(isoOrDate: string): string {
  if (!isoOrDate) return '-';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTimeId(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatWhatsAppNumberForLink(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '6281360450088';
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('8')) {
    return '62' + digits;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const formatted = formatWhatsAppNumberForLink(phone);
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

export function generateOrderId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return `ORD-${yy}${mm}${dd}-${rand}`;
}

export function compressImageFile(file: File, maxWidth = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('Gagal membaca file gambar.'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Format gambar tidak dapat dimuat.'));
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}
