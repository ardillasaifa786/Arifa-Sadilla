import { useMemo, useState } from 'react';
import { Eye, MessageCircle, Search, Trash2, X } from 'lucide-react';
import type { Order, OrderStatus } from '../../types/bookstore';
import {
  ORDER_STATUSES,
  buildWhatsAppUrl,
  formatDateTimeId,
  formatRupiah,
} from '../../utils/storage';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function getOrderStatusStyle(status: OrderStatus): string {
  switch (status) {
    case 'Selesai':
      return 'bg-[#E7EFE2] text-[#265239] border-[#C5DEC0]';
    case 'Dikirim':
      return 'bg-[#E6F0F7] text-[#1E4F75] border-[#C3DCEF]';
    case 'Diproses':
      return 'bg-[#F6ECD8] text-[#805B1B] border-[#E4D1A7]';
    case 'Dibatalkan':
      return 'bg-[#F9ECEC] text-[#8F2D2B] border-[#E6C7C6]';
    default:
      return 'bg-[#F3EFE8] text-[#5C4E43] border-[#DFD3BE]';
  }
}

export function AdminOrdersTab({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onNotify,
}: AdminOrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | OrderStatus>('Semua');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((order) => {
        const matchStatus = statusFilter === 'Semua' || order.status === statusFilter;
        const matchQuery =
          !q ||
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.customerWhatsapp.toLowerCase().includes(q);
        return matchStatus && matchQuery;
      });
  }, [orders, searchQuery, statusFilter]);

  const activeDetailOrder = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) || null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-book text-2xl font-bold text-[#1B362B]">Kelola Pesanan</h2>
        <p className="text-sm text-[#5B6B62] mt-0.5">
          Pantau pesanan masuk dari checkout WhatsApp. Pendapatan hanya menghitung pesanan berstatus{' '}
          <strong className="text-[#1B362B]">Selesai</strong>.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#D4E2D9] rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#5B6B62] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID pesanan, nama pelanggan, atau nomor WhatsApp..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'Semua' | OrderStatus)}
          aria-label="Filter status pesanan"
          className="md:w-60 px-3.5 py-2 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
        >
          <option value="Semua">Semua Status ({orders.length})</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st} ({orders.filter((o) => o.status === st).length})
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#D4E2D9] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-[#EBF3EE] border-b border-[#D4E2D9] text-xs font-semibold uppercase tracking-wider text-[#1B362B]">
                <th className="py-3.5 px-4">ID Pesanan</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Buku Dipesan</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EFEA] text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#5B6B62]">
                    Belum ada pesanan yang sesuai dengan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7FBF8] transition-colors">
                    <td className="py-3.5 px-4 font-archive-mono text-xs font-bold text-[#1B362B] whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#1E2B24]">{order.customerName}</p>
                      <p className="text-xs text-[#5B6B62] tabular-nums">{order.customerWhatsapp}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#1E2B24] max-w-[220px]">
                      <p className="line-clamp-2">
                        {order.items.map((it) => `${it.title} (${it.quantity}×)`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-[#1E2B24] whitespace-nowrap">
                      {formatRupiah(order.totalPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5B6B62] whitespace-nowrap tabular-nums">
                      {formatDateTimeId(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        aria-label={`Ubah status pesanan ${order.id}`}
                        onChange={(e) => {
                          const nextStatus = e.target.value as OrderStatus;
                          onUpdateStatus(order.id, nextStatus);
                          onNotify(
                            'success',
                            `Status pesanan ${order.id} diperbarui menjadi "${nextStatus}".`
                          );
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer focus:outline-none ${getOrderStatusStyle(
                          order.status
                        )}`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-[#1E2B24]">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#C8DDD0] bg-[#EBF3EE] text-[#1B362B] text-xs font-semibold hover:bg-[#DCEBE1] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(order)}
                          aria-label={`Hapus pesanan ${order.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6C7C6] bg-white text-[#A94442] text-xs font-semibold hover:bg-[#F9ECEC] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeDetailOrder && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-detail-heading"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7EFEA]">
              <div>
                <p className="font-archive-mono text-xs text-[#5B6B62]">
                  {activeDetailOrder.id} · {formatDateTimeId(activeDetailOrder.createdAt)}
                </p>
                <h3 id="order-detail-heading" className="font-serif-book text-xl font-bold text-[#1B362B] mt-1">
                  Detail Pesanan Pelanggan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Tutup detail pesanan"
                className="p-2 rounded-lg text-[#5B6B62] hover:bg-[#EBF3EE] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8FBF9] border border-[#D4E2D9] text-sm">
              <div>
                <span className="text-xs text-[#5B6B62] block">Nama Pelanggan</span>
                <strong className="text-[#1E2B24]">{activeDetailOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-xs text-[#5B6B62] block">WhatsApp Pelanggan</span>
                <strong className="text-[#1E2B24] tabular-nums">
                  {activeDetailOrder.customerWhatsapp}
                </strong>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-[#5B6B62] block">Catatan &amp; Alamat Pengiriman</span>
                <p className="text-[#1E2B24] mt-0.5">{activeDetailOrder.notes || '-'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B6B62] mb-2.5">
                Daftar Buku Dipesan
              </h4>
              <div className="border border-[#D4E2D9] rounded-xl divide-y divide-[#E7EFEA]">
                {activeDetailOrder.items.map((item, index) => (
                  <div
                    key={`${item.bookId}-${index}`}
                    className="p-3.5 flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="font-serif-book font-bold text-[#1E2B24]">{item.title}</p>
                      <p className="text-xs text-[#5B6B62] tabular-nums">
                        {item.quantity} × {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-bold text-[#1E2B24] tabular-nums">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="p-3.5 bg-[#EBF3EE] flex items-center justify-between font-bold text-[#1B362B]">
                  <span>Total Pesanan</span>
                  <span className="tabular-nums text-base">
                    {formatRupiah(activeDetailOrder.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E7EFEA]">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#1E2B24]">Status:</label>
                <select
                  value={activeDetailOrder.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as OrderStatus;
                    onUpdateStatus(activeDetailOrder.id, nextStatus);
                    onNotify(
                      'success',
                      `Status pesanan ${activeDetailOrder.id} diubah ke "${nextStatus}".`
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${getOrderStatusStyle(
                    activeDetailOrder.status
                  )}`}
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-white text-[#1E2B24]">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={buildWhatsAppUrl(
                  activeDetailOrder.customerWhatsapp,
                  `Halo ${activeDetailOrder.customerName}, terkait pesanan Anda (${activeDetailOrder.id}) di The Reading Archive saat ini berstatus: ${activeDetailOrder.status}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1B362B] text-white text-xs font-semibold hover:bg-[#254A3B] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Pelanggan via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus pesanan"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-book text-lg font-bold text-[#1E2B24]">
              Hapus Catatan Pesanan?
            </h3>
            <p className="text-sm text-[#5B6B62] leading-relaxed">
              Pesanan <strong className="font-archive-mono text-[#1E2B24]">{deleteTarget.id}</strong>{' '}
              atas nama <strong>{deleteTarget.customerName}</strong> akan dihapus permanen dari
              daftar pesanan.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#D4E2D9] text-xs font-semibold text-[#1E2B24] hover:bg-[#F4F8F5] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = deleteTarget.id;
                  onDeleteOrder(id);
                  setDeleteTarget(null);
                  onNotify('success', `Pesanan ${id} telah dihapus.`);
                }}
                className="px-4 py-2 rounded-xl bg-[#A94442] text-white text-xs font-semibold hover:bg-[#8E3533] cursor-pointer"
              >
                Ya, Hapus Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
