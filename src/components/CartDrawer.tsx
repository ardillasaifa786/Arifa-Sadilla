import { useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { Book, CartItem, Order, StoreSettings } from '../types/bookstore';
import {
  buildWhatsAppUrl,
  formatRupiah,
  formatWhatsAppNumberForLink,
} from '../utils/storage';
import { BookCover } from './BookCover';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  books: Book[];
  settings: StoreSettings;
  onUpdateQty: (bookId: string, delta: number) => void;
  onRemoveItem: (bookId: string) => void;
  onCheckoutSubmit: (payload: {
    customerName: string;
    customerWhatsapp: string;
    notes: string;
  }) => Order | null;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  books,
  settings,
  onUpdateQty,
  onRemoveItem,
  onCheckoutSubmit,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const waAutoLinkRef = useRef<HTMLAnchorElement | null>(null);

  if (!isOpen) return null;

  const cartLines = cart
    .map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      if (!book) return null;
      return { item, book };
    })
    .filter((line): line is { item: CartItem; book: Book } => line !== null);

  const totalItems = cartLines.reduce((sum, l) => sum + l.item.quantity, 0);
  const totalPrice = cartLines.reduce(
    (sum, l) => sum + l.book.price * l.item.quantity,
    0
  );

  const buildOrderWhatsAppMessage = (order: Order): string => {
    const itemsList = order.items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.title} (${it.quantity}x @ ${formatRupiah(it.price)}) = ${formatRupiah(
            it.price * it.quantity
          )}`
      )
      .join('\n');

    return [
      `Halo *${settings.storeName}*, saya ingin mengonfirmasi pesanan buku berikut:`,
      '',
      `*ID Pesanan:* ${order.id}`,
      `*Nama:* ${order.customerName}`,
      `*WhatsApp:* ${order.customerWhatsapp}`,
      `*Status:* ${order.status}`,
      '',
      '*Daftar Buku:*',
      itemsList,
      '',
      `*Total Pembayaran:* ${formatRupiah(order.totalPrice)}`,
      `*Catatan / Alamat Pengiriman:* ${order.notes || '-'}`,
      '',
      'Terima kasih.',
    ].join('\n');
  };

  const handleClose = () => {
    setFormError('');
    if (step === 'confirmed') {
      setStep('cart');
      setConfirmedOrder(null);
    }
    onClose();
  };

  const handleCheckout = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = customerName.trim();
    const cleanWa = customerWhatsapp.trim();
    const cleanNotes = notes.trim();
    const waDigits = cleanWa.replace(/\D/g, '');

    if (!cleanName) {
      setFormError('Nama pelanggan wajib diisi.');
      return;
    }
    if (waDigits.length < 8) {
      setFormError('Masukkan nomor WhatsApp pelanggan yang valid (minimal 8 digit).');
      return;
    }
    if (!cleanNotes) {
      setFormError('Mohon isi alamat pengiriman atau catatan pesanan.');
      return;
    }

    const savedOrder = onCheckoutSubmit({
      customerName: cleanName,
      customerWhatsapp: cleanWa,
      notes: cleanNotes,
    });

    if (!savedOrder) {
      setFormError('Gagal menyimpan pesanan. Pastikan stok buku mencukupi.');
      return;
    }

    setConfirmedOrder(savedOrder);
    setStep('confirmed');
    setCustomerName('');
    setCustomerWhatsapp('');
    setNotes('');

    // Trigger anchor click after order is persisted to LocalStorage
    setTimeout(() => {
      waAutoLinkRef.current?.click();
    }, 150);
  };

  const confirmedWaUrl = confirmedOrder
    ? buildWhatsAppUrl(settings.whatsappNumber, buildOrderWhatsAppMessage(confirmedOrder))
    : '#';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2D221C]/55 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja"
    >
      <div className="w-full max-w-md bg-[#FFFDF8] border-l border-[#DFD3BE] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DFD3BE] flex items-center justify-between bg-[#FAF5EC]">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setStep('cart');
                }}
                aria-label="Kembali ke keranjang"
                className="p-1.5 rounded-lg text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-serif-book text-xl font-bold text-[#3B2F2F]">
                {step === 'cart' && `Keranjang Belanja (${totalItems})`}
                {step === 'checkout' && 'Formulir Pemesanan'}
                {step === 'confirmed' && 'Pesanan Tercatat'}
              </h2>
              <p className="text-xs text-[#7A6B5D]">
                {step === 'cart' && 'Periksa buku pilihan sebelum melanjutkan pemesanan'}
                {step === 'checkout' && 'Data disimpan sebelum diteruskan ke WhatsApp toko'}
                {step === 'confirmed' && 'Pesanan telah tersimpan di sistem toko'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup keranjang"
            className="p-2 rounded-lg text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {cartLines.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EFE6D5] text-[#7A6B5D] flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif-book text-lg font-semibold text-[#3B2F2F]">
                    Keranjang masih kosong
                  </h3>
                  <p className="text-sm text-[#7A6B5D] mt-1.5 max-w-xs mx-auto">
                    Tambahkan buku dari katalog The Reading Archive untuk memulai pemesanan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartLines.map(({ item, book }) => (
                    <div
                      key={book.id}
                      className="flex gap-3.5 p-3.5 rounded-xl bg-[#FAF5EC] border border-[#DFD3BE]"
                    >
                      <BookCover
                        src={book.coverUrl}
                        title={book.title}
                        author={book.author}
                        className="w-16 shrink-0 rounded-lg"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-serif-book font-bold text-sm text-[#3B2F2F] leading-snug line-clamp-2">
                              {book.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(book.id)}
                              aria-label={`Hapus ${book.title} dari keranjang`}
                              className="p-1 text-[#7A6B5D] hover:text-[#A94442] transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[#7A6B5D] mt-0.5">{book.author}</p>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-3">
                          <div className="inline-flex items-center border border-[#DFD3BE] rounded-lg bg-[#FFFDF8]">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(book.id, -1)}
                              aria-label="Kurangi jumlah"
                              className="p-1.5 text-[#3B2F2F] hover:bg-[#EFE6D5] rounded-l-lg transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold tabular-nums text-[#3B2F2F]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={item.quantity >= book.stock}
                              onClick={() => onUpdateQty(book.id, 1)}
                              aria-label="Tambah jumlah"
                              className={`p-1.5 rounded-r-lg transition-colors ${
                                item.quantity >= book.stock
                                  ? 'text-[#B8A992] cursor-not-allowed'
                                  : 'text-[#3B2F2F] hover:bg-[#EFE6D5] cursor-pointer'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[#3B2F2F] tabular-nums">
                            {formatRupiah(book.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-[#F9ECEC] border border-[#E6C7C6] text-xs font-medium text-[#8F2D2B]">
                  {formError}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#FAF5EC] border border-[#DFD3BE]">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D] mb-2">
                  Ringkasan Pesanan ({totalItems} buku)
                </p>
                <div className="space-y-1.5 text-sm">
                  {cartLines.map(({ item, book }) => (
                    <div key={book.id} className="flex justify-between gap-2 text-[#3B2F2F]">
                      <span className="truncate">
                        {book.title} <span className="text-[#7A6B5D]">× {item.quantity}</span>
                      </span>
                      <span className="font-medium tabular-nums shrink-0">
                        {formatRupiah(book.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-[#DFD3BE] flex justify-between font-bold text-[#3B2F2F]">
                    <span>Total Belanja</span>
                    <span className="tabular-nums">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-xs font-semibold text-[#3B2F2F] mb-1.5"
                >
                  Nama Lengkap Pelanggan *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Raka Pratama"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DFD3BE] bg-[#FFFDF8] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#9E5A47]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-wa"
                  className="block text-xs font-semibold text-[#3B2F2F] mb-1.5"
                >
                  Nomor WhatsApp Pelanggan *
                </label>
                <input
                  id="checkout-wa"
                  type="tel"
                  required
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DFD3BE] bg-[#FFFDF8] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#9E5A47] tabular-nums"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-notes"
                  className="block text-xs font-semibold text-[#3B2F2F] mb-1.5"
                >
                  Alamat Pengiriman &amp; Catatan *
                </label>
                <textarea
                  id="checkout-notes"
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan alamat lengkap pengiriman, kurir pilihan, atau catatan pembungkusan..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DFD3BE] bg-[#FFFDF8] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#9E5A47]"
                />
              </div>

              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Pesanan akan dicatat ke sistem toko dengan status{' '}
                <strong className="text-[#3B2F2F]">Menunggu Konfirmasi</strong> terlebih dahulu
                sebelum Anda diarahkan ke WhatsApp toko (
                <span className="tabular-nums">+{formatWhatsAppNumberForLink(settings.whatsappNumber)}</span>).
              </p>
            </form>
          )}

          {step === 'confirmed' && confirmedOrder && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EBF3EE] border border-[#C8DDD0] text-[#1B362B]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#2E6F4D]" />
                  <div>
                    <h3 className="font-serif-book font-bold text-base">
                      Pesanan Berhasil Disimpan
                    </h3>
                    <p className="text-xs mt-1 leading-relaxed">
                      ID Pesanan{' '}
                      <span className="font-archive-mono font-bold">{confirmedOrder.id}</span> telah
                      dicatat dengan status <strong>{confirmedOrder.status}</strong>. Silakan
                      lanjutkan konfirmasi pembayaran &amp; pengiriman via WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF5EC] border border-[#DFD3BE] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7A6B5D]">Pelanggan</span>
                  <span className="font-semibold text-[#3B2F2F]">
                    {confirmedOrder.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6B5D]">WhatsApp</span>
                  <span className="tabular-nums text-[#3B2F2F]">
                    {confirmedOrder.customerWhatsapp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7A6B5D]">Total Pesanan</span>
                  <span className="font-bold tabular-nums text-[#3B2F2F]">
                    {formatRupiah(confirmedOrder.totalPrice)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#DFD3BE]">
                  <p className="text-xs text-[#7A6B5D]">Catatan / Alamat:</p>
                  <p className="text-xs text-[#3B2F2F] mt-0.5">{confirmedOrder.notes}</p>
                </div>
              </div>

              <a
                ref={waAutoLinkRef}
                href={confirmedWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#1B362B] text-[#FFFDF8] hover:bg-[#254A3B] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim Rincian via WhatsApp
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#EFE6D5] text-[#3B2F2F] border border-[#DFD3BE] hover:bg-[#E5D9C3] transition-colors cursor-pointer"
              >
                Kembali ke Katalog
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step === 'cart' && cartLines.length > 0 && (
          <div className="p-6 border-t border-[#DFD3BE] bg-[#FAF5EC] space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#7A6B5D]">Total Belanja</span>
              <span className="font-serif-book text-xl font-bold text-[#3B2F2F] tabular-nums">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="w-full py-3 px-5 rounded-xl text-sm font-semibold bg-[#9E5A47] text-[#FFFDF8] hover:bg-[#834737] transition-colors cursor-pointer"
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-6 border-t border-[#DFD3BE] bg-[#FAF5EC] flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setStep('cart');
              }}
              className="px-4 py-3 rounded-xl text-sm font-semibold bg-[#EFE6D5] text-[#3B2F2F] border border-[#DFD3BE] hover:bg-[#E5D9C3] transition-colors cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="submit"
              form="checkout-form"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold bg-[#9E5A47] text-[#FFFDF8] hover:bg-[#834737] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Simpan &amp; Lanjut ke WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
