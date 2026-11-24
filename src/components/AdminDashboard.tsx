import { useMemo, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Store,
  Wallet,
  X,
} from 'lucide-react';
import type {
  AdminTab,
  Book,
  Category,
  Order,
  OrderStatus,
  StoreSettings,
} from '../types/bookstore';
import { formatDateTimeId, formatRupiah } from '../utils/storage';
import { AdminCategoriesTab } from './admin/AdminCategoriesTab';
import { AdminOrdersTab, getOrderStatusStyle } from './admin/AdminOrdersTab';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminWhatsAppTab } from './admin/AdminWhatsAppTab';

interface AdminDashboardProps {
  books: Book[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  onSaveBook: (book: Book, isEdit: boolean) => void;
  onDeleteBook: (bookId: string) => void;
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string, reassignToName?: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onSaveSettings: (next: StoreSettings) => void;
  onGoToStorefront: () => void;
  onLogout: () => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function AdminDashboard({
  books,
  categories,
  orders,
  settings,
  onSaveBook,
  onDeleteBook,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSaveSettings,
  onGoToStorefront,
  onLogout,
  onNotify,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'Selesai')
        .reduce((sum, o) => sum + o.totalPrice, 0),
    [orders]
  );

  const completedOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'Selesai').length,
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [orders]
  );

  const navItems: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Kelola Produk', icon: BookOpen },
    { id: 'categories', label: 'Kelola Kategori', icon: FolderTree },
    { id: 'orders', label: 'Kelola Pesanan', icon: ClipboardList },
    { id: 'whatsapp', label: 'Pengaturan WhatsApp', icon: MessageCircle },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF7] text-[#1E2B24] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#1B362B] text-[#FAF5EC] px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div>
          <span className="font-serif-book font-bold text-lg">{settings.storeName}</span>
          <span className="block text-[11px] text-[#B8D0C2]">Panel Administrator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToStorefront}
            className="px-3 py-1.5 rounded-lg bg-[#254A3B] text-xs font-semibold text-[#FAF5EC] cursor-pointer"
          >
            Lihat Toko
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menu admin"
            className="p-2 rounded-lg bg-[#254A3B] text-[#FAF5EC] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal / Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1B362B] text-[#FAF5EC] border-t border-[#2E5242] px-4 py-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EBF3EE] text-[#1B362B] font-semibold'
                    : 'text-[#DCEADF] hover:bg-[#254A3B]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#F5C6C5] hover:bg-[#254A3B] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 bg-[#1B362B] text-[#FAF5EC] flex-col justify-between sticky top-0 h-screen p-5">
        <div>
          <div className="pb-5 mb-5 border-b border-[#2E5242]">
            <h1 className="font-serif-book text-xl font-bold leading-snug text-[#FAF5EC]">
              {settings.storeName}
            </h1>
            <p className="text-xs text-[#B8D0C2] mt-1">Dashboard Admin UMKM</p>
          </div>

          <nav aria-label="Menu administrator" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#EBF3EE] text-[#1B362B] font-semibold'
                      : 'text-[#DCEADF] font-medium hover:bg-[#254A3B] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 pt-5 border-t border-[#2E5242]">
          <button
            type="button"
            onClick={onGoToStorefront}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#DCEADF] hover:bg-[#254A3B] hover:text-white transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Lihat Halaman Toko</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#FAD2D0] hover:bg-[#3A2827] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#1B362B]">
                    Ringkasan Toko
                  </h2>
                  <p className="text-sm text-[#5B6B62] mt-0.5">
                    Pantau statistik katalog, kategori, pesanan masuk, dan pendapatan bersih.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2.5 rounded-xl bg-[#1B362B] text-white text-xs font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
                >
                  + Kelola Katalog Buku
                </button>
              </div>

              {/* 4 KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-[#D4E2D9] rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B62]">
                      Total Produk
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] text-[#1B362B] flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-book text-3xl font-bold text-[#1B362B] mt-3 tabular-nums">
                    {books.length}
                  </p>
                  <p className="text-xs text-[#5B6B62] mt-1 tabular-nums">
                    {books.filter((b) => b.stock > 0).length} tersedia ·{' '}
                    {books.filter((b) => b.stock === 0).length} habis
                  </p>
                </div>

                <div className="bg-white border border-[#D4E2D9] rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B62]">
                      Total Kategori
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] text-[#1B362B] flex items-center justify-center">
                      <FolderTree className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-book text-3xl font-bold text-[#1B362B] mt-3 tabular-nums">
                    {categories.length}
                  </p>
                  <p className="text-xs text-[#5B6B62] mt-1">Kategori aktif di katalog</p>
                </div>

                <div className="bg-white border border-[#D4E2D9] rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6B62]">
                      Total Pesanan
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] text-[#1B362B] flex items-center justify-center">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-book text-3xl font-bold text-[#1B362B] mt-3 tabular-nums">
                    {orders.length}
                  </p>
                  <p className="text-xs text-[#5B6B62] mt-1 tabular-nums">
                    {orders.filter((o) => o.status === 'Menunggu Konfirmasi').length} menunggu
                    konfirmasi
                  </p>
                </div>

                <div className="bg-[#1B362B] border border-[#1B362B] rounded-2xl p-5 text-[#FAF5EC]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#B8D0C2]">
                      Total Pendapatan
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#254A3B] text-[#EBF3EE] flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="font-serif-book text-2xl sm:text-3xl font-bold text-white mt-3 tabular-nums">
                    {formatRupiah(totalRevenue)}
                  </p>
                  <p className="text-xs text-[#B8D0C2] mt-1 tabular-nums">
                    Dari {completedOrdersCount} pesanan berstatus Selesai
                  </p>
                </div>
              </div>

              {/* Recent Orders & Catalog Summary */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Recent Orders */}
                <div className="xl:col-span-7 bg-white border border-[#D4E2D9] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E7EFEA] flex items-center justify-between">
                    <h3 className="font-serif-book text-lg font-bold text-[#1B362B]">
                      Pesanan Terbaru
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#1B362B] hover:underline cursor-pointer"
                    >
                      Lihat Semua &rarr;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[540px]">
                      <thead>
                        <tr className="bg-[#F8FBF9] border-b border-[#E7EFEA] text-[11px] font-semibold uppercase tracking-wider text-[#5B6B62]">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Pelanggan</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7EFEA] text-sm">
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-[#5B6B62]">
                              Belum ada pesanan tercatat.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#F7FBF8]">
                              <td className="py-3 px-4 font-archive-mono text-xs font-bold text-[#1B362B]">
                                {order.id}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-semibold text-[#1E2B24]">{order.customerName}</p>
                                <p className="text-[11px] text-[#5B6B62]">
                                  {formatDateTimeId(order.createdAt)}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold tabular-nums">
                                {formatRupiah(order.totalPrice)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${getOrderStatusStyle(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Catalog Summary by Category */}
                <div className="xl:col-span-5 bg-white border border-[#D4E2D9] rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-[#E7EFEA] flex items-center justify-between">
                    <h3 className="font-serif-book text-lg font-bold text-[#1B362B]">
                      Ringkasan Katalog
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('categories')}
                      className="text-xs font-semibold text-[#1B362B] hover:underline cursor-pointer"
                    >
                      Kelola Kategori &rarr;
                    </button>
                  </div>
                  <div className="p-5 space-y-3 flex-1">
                    {categories.map((cat) => {
                      const catBooks = books.filter((b) => b.category === cat.name);
                      const catStock = catBooks.reduce((s, b) => s + b.stock, 0);
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F8FBF9] border border-[#E7EFEA]"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1E2B24]">{cat.name}</p>
                            <p className="text-xs text-[#5B6B62] tabular-nums">
                              Total stok: {catStock} eksemplar
                            </p>
                          </div>
                          <span className="font-serif-book text-base font-bold text-[#1B362B] tabular-nums">
                            {catBooks.length} judul
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              books={books}
              categories={categories}
              onSaveBook={onSaveBook}
              onDeleteBook={onDeleteBook}
              onNotify={onNotify}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              books={books}
              onAddCategory={onAddCategory}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onNotify={onNotify}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onUpdateStatus={onUpdateOrderStatus}
              onDeleteOrder={onDeleteOrder}
              onNotify={onNotify}
            />
          )}

          {activeTab === 'whatsapp' && (
            <AdminWhatsAppTab
              settings={settings}
              onSaveSettings={onSaveSettings}
              onNotify={onNotify}
            />
          )}
        </div>
      </main>
    </div>
  );
}
