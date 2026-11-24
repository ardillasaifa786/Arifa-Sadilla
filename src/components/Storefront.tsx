import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Menu,
  MessageCircle,
  Printer,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { Book, CartItem, Category, StoreSettings } from '../types/bookstore';
import { buildWhatsAppUrl, formatRupiah } from '../utils/storage';
import { BookCover } from './BookCover';

interface StorefrontProps {
  books: Book[];
  categories: Category[];
  cart: CartItem[];
  settings: StoreSettings;
  onAddToCart: (book: Book) => void;
  onOpenCart: () => void;
  onSelectBook: (book: Book) => void;
  onOpenPrint: (book: Book) => void;
  onGoToAdmin: () => void;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'title-asc';

export function Storefront({
  books,
  categories,
  cart,
  settings,
  onAddToCart,
  onOpenCart,
  onSelectBook,
  onOpenPrint,
  onGoToAdmin,
}: StorefrontProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeCategory = useMemo(() => {
    if (selectedCategory === 'Semua') return 'Semua';
    const exists = categories.some((c) => c.name === selectedCategory);
    return exists ? selectedCategory : 'Semua';
  }, [categories, selectedCategory]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = books.filter((book) => {
      const matchCat = activeCategory === 'Semua' || book.category === activeCategory;
      const matchSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title, 'id'));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return sorted;
  }, [books, activeCategory, searchQuery, sortBy]);

  const storeWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Halo ${settings.storeName}, saya ingin bertanya mengenai ketersediaan buku di katalog.`
  );

  const totalStockCount = useMemo(
    () => books.reduce((sum, b) => sum + Math.max(0, b.stock), 0),
    [books]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EC] text-[#3B2F2F]">
      {/* Top Navigation Bar (3-Zone Contract) */}
      <header className="sticky top-0 z-30 bg-[#FAF5EC]/95 backdrop-blur-xs border-b border-[#DFD3BE]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#beranda"
            className="font-serif-book text-xl font-bold tracking-tight text-[#3B2F2F] whitespace-nowrap shrink-0"
          >
            {settings.storeName}
          </a>

          {/* Zone 2: Nav Links */}
          <nav
            aria-label="Navigasi utama"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#7A6B5D]"
          >
            <a
              href="#katalog"
              className="hover:text-[#3B2F2F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Katalog
            </a>
            <a
              href="#tentang"
              className="hover:text-[#3B2F2F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Tentang Kami
            </a>
            <a
              href={storeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B2F2F] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Kontak WhatsApp
            </a>
            <button
              type="button"
              onClick={onGoToAdmin}
              className="hover:text-[#1B362B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Panel Admin
            </button>
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9E5A47] text-[#FFFDF8] text-xs font-semibold hover:bg-[#834737] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Keranjang</span>
              <span className="tabular-nums">({totalCartItems})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Menu navigasi"
              className="md:hidden p-2 rounded-lg border border-[#DFD3BE] bg-[#FFFDF8] text-[#3B2F2F] cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Nav */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#DFD3BE] bg-[#FFFDF8] px-5 py-4 space-y-2.5 text-sm font-medium">
            <a
              href="#katalog"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-[#3B2F2F]"
            >
              Katalog Buku
            </a>
            <a
              href="#tentang"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-[#3B2F2F]"
            >
              Tentang Kami
            </a>
            <a
              href={storeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileNavOpen(false)}
              className="block py-1.5 text-[#3B2F2F]"
            >
              Kontak WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                onGoToAdmin();
              }}
              className="block w-full text-left py-1.5 font-semibold text-[#1B362B] cursor-pointer"
            >
              Panel Admin
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="beranda" className="border-b border-[#DFD3BE] bg-[#FAF5EC]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <p className="font-archive-mono text-xs uppercase tracking-[2px] text-[#7A6B5D]">
                  Toko Buku Independen &amp; Ruang Kurasi Bacaan
                </p>
                <h1
                  className="font-serif-book text-3xl sm:text-5xl font-bold text-[#3B2F2F] leading-[1.15] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Menghimpun bacaan terpilih dalam kehangatan pustaka klasik
                </h1>
                <p className="text-base sm:text-lg text-[#5C4E43] max-w-2xl leading-relaxed">
                  Temukan karya sastra, fiksi sejarah, sains, hingga filsafat praktis. Setiap buku
                  dilengkapi penanda bacaan yang dapat dicetak dan layanan pemesanan cepat melalui
                  WhatsApp.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#katalog"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#9E5A47] text-[#FFFDF8] text-sm font-semibold hover:bg-[#834737] transition-colors whitespace-nowrap"
                  >
                    Jelajahi Katalog
                  </a>
                  <a
                    href={storeWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#DFD3BE] bg-[#FFFDF8] text-[#3B2F2F] text-sm font-semibold hover:bg-[#EFE6D5] transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 text-[#5E6F52]" />
                    Tanya Kurator via WhatsApp
                  </a>
                </div>
              </div>

              {/* Featured Archival Shelf Preview */}
              <div className="lg:col-span-5">
                <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl p-5 sm:p-6">
                  <p className="font-archive-mono text-xs uppercase tracking-wider text-[#7A6B5D] pb-3 border-b border-[#EFE6D5]">
                    Pilihan Kurator Pekan Ini
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    {books.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelectBook(b)}
                        className="group text-left cursor-pointer focus:outline-none"
                      >
                        <BookCover
                          src={b.coverUrl}
                          title={b.title}
                          author={b.author}
                          className="rounded-lg group-hover:-translate-y-0.5 transition-transform"
                        />
                        <p className="font-serif-book text-xs font-bold text-[#3B2F2F] mt-2 line-clamp-1">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-[#7A6B5D] tabular-nums">
                          {formatRupiah(b.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Archival Store Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-[#DFD3BE]">
              <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-xl px-5 py-4">
                <span className="text-xs uppercase tracking-wider text-[#7A6B5D] font-medium">
                  Judul dalam Katalog
                </span>
                <p className="font-serif-book text-2xl font-bold text-[#3B2F2F] mt-1 tabular-nums">
                  {books.length} Buku
                </p>
              </div>
              <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-xl px-5 py-4">
                <span className="text-xs uppercase tracking-wider text-[#7A6B5D] font-medium">
                  Kategori Kurasi
                </span>
                <p className="font-serif-book text-2xl font-bold text-[#3B2F2F] mt-1 tabular-nums">
                  {categories.length} Kategori
                </p>
              </div>
              <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-xl px-5 py-4">
                <span className="text-xs uppercase tracking-wider text-[#7A6B5D] font-medium">
                  Total Eksemplar Tersedia
                </span>
                <p className="font-serif-book text-2xl font-bold text-[#3B2F2F] mt-1 tabular-nums">
                  {totalStockCount} Eks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="katalog" className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
            <div>
              <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#3B2F2F]">
                Katalog Buku Pilihan
              </h2>
              <p className="text-sm text-[#7A6B5D] mt-1">
                Cari judul, saring kategori, atau cetak kartu penanda buku untuk koleksi Anda.
              </p>
            </div>
            <p className="text-xs font-medium text-[#7A6B5D] tabular-nums">
              Menampilkan {filteredBooks.length} dari {books.length} buku
            </p>
          </div>

          {/* Search, Category Filter & Sort Toolbar */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7A6B5D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul buku, nama penulis, atau kata kunci..."
                  aria-label="Cari buku"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD3BE] bg-[#FFFDF8] text-sm text-[#3B2F2F] placeholder:text-[#968779] focus:outline-none focus:border-[#9E5A47]"
                />
              </div>

              <div className="relative sm:w-56">
                <ArrowUpDown className="w-4 h-4 text-[#7A6B5D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Urutkan produk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DFD3BE] bg-[#FFFDF8] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#9E5A47] cursor-pointer"
                >
                  <option value="newest">Urutkan: Terbaru</option>
                  <option value="price-asc">Harga: Terendah</option>
                  <option value="price-desc">Harga: Tertinggi</option>
                  <option value="title-asc">Judul: A – Z</option>
                </select>
              </div>
            </div>

            {/* Dynamic Category Filter Buttons */}
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filter kategori buku"
            >
              <button
                type="button"
                onClick={() => setSelectedCategory('Semua')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === 'Semua'
                    ? 'bg-[#3B2F2F] text-[#FAF5EC] border-[#3B2F2F]'
                    : 'bg-[#FFFDF8] text-[#7A6B5D] border-[#DFD3BE] hover:text-[#3B2F2F] hover:bg-[#EFE6D5]'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.name
                      ? 'bg-[#3B2F2F] text-[#FAF5EC] border-[#3B2F2F]'
                      : 'bg-[#FFFDF8] text-[#7A6B5D] border-[#DFD3BE] hover:text-[#3B2F2F] hover:bg-[#EFE6D5]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Book Grid */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 px-6 bg-[#FFFDF8] border border-dashed border-[#DFD3BE] rounded-2xl">
              <h3 className="font-serif-book text-xl font-semibold text-[#3B2F2F]">
                Buku tidak ditemukan
              </h3>
              <p className="text-sm text-[#7A6B5D] mt-1.5">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#EFE6D5] text-[#3B2F2F] border border-[#DFD3BE] text-xs font-semibold hover:bg-[#E5D9C3] transition-colors cursor-pointer"
              >
                Reset Filter Katalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const isOutOfStock = book.stock <= 0;
                return (
                  <article
                    key={book.id}
                    className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl p-5 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="block w-full text-left cursor-pointer group focus:outline-none"
                      >
                        <BookCover
                          src={book.coverUrl}
                          title={book.title}
                          author={book.author}
                          className="rounded-xl mb-4"
                        />
                      </button>

                      {/* Clean unboxed metadata kicker */}
                      <div className="flex items-center gap-2 text-xs text-[#7A6B5D] mb-1.5">
                        <span>{book.category}</span>
                        {book.label && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-[#9E5A47] uppercase tracking-wider text-[11px]">
                              {book.label}
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="text-left cursor-pointer hover:underline underline-offset-2 focus:outline-none"
                      >
                        <h3 className="font-serif-book text-lg font-bold text-[#3B2F2F] leading-snug line-clamp-2">
                          {book.title}
                        </h3>
                      </button>
                      <p className="text-sm text-[#7A6B5D] mt-0.5">{book.author}</p>

                      {book.description && (
                        <p className="text-xs text-[#5C4E43] mt-2.5 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#EFE6D5] space-y-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-serif-book text-lg font-bold text-[#3B2F2F] tabular-nums">
                          {formatRupiah(book.price)}
                        </span>
                        <span
                          className={`text-xs font-semibold tabular-nums ${
                            isOutOfStock ? 'text-[#A94442]' : 'text-[#5E6F52]'
                          }`}
                        >
                          {isOutOfStock ? 'Stok Habis' : `Stok: ${book.stock}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => onAddToCart(book)}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            isOutOfStock
                              ? 'bg-[#E8E0D4] text-[#7A6B5D] cursor-not-allowed'
                              : 'bg-[#9E5A47] text-[#FFFDF8] hover:bg-[#834737] cursor-pointer'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {isOutOfStock ? 'Stok Habis' : 'Tambah Keranjang'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectBook(book)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#DFD3BE] bg-[#FAF5EC] text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Detail
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenPrint(book)}
                          title="Cetak Penanda Detail Buku"
                          aria-label={`Cetak penanda untuk ${book.title}`}
                          className="p-2 rounded-lg border border-[#DFD3BE] bg-[#FAF5EC] text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer shrink-0"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Tentang Kami Section */}
        <section id="tentang" className="border-t border-[#DFD3BE] bg-[#EFE6D5]/55">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3">
              <p className="font-archive-mono text-xs uppercase tracking-[2px] text-[#7A6B5D]">
                Tentang Toko Buku
              </p>
              <h2 className="font-serif-book text-2xl sm:text-3xl font-bold text-[#3B2F2F]">
                Merawat tradisi membaca dengan kurasi yang personal
              </h2>
              <p className="text-sm sm:text-base text-[#5C4E43] leading-relaxed">
                {settings.storeName} lahir dari kecintaan pada buku cetak, catatan pinggir halaman,
                dan pustaka independen. Setiap eksemplar dikemas dengan rapi beserta pilihan cetak
                pembatas buku dan kartu arsip koleksi pribadi.
              </p>
            </div>
            <div className="md:col-span-5 bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl p-6 space-y-3">
              <h3 className="font-serif-book text-lg font-bold text-[#3B2F2F]">
                Layanan Konsultasi &amp; Pesan Khusus
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Mencari edisi tertentu atau ingin memesan paket bacaan untuk komunitas? Hubungi meja
                kurator kami langsung melalui WhatsApp.
              </p>
              <a
                href={storeWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5E6F52] text-[#FFFDF8] text-xs font-semibold hover:bg-[#4B5A41] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat WhatsApp Toko ({settings.whatsappNumber})
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#DFD3BE] bg-[#FAF5EC]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6B5D]">
          <p>
            &copy; {new Date().getFullYear()} {settings.storeName} · Toko Buku Independen &amp;
            Katalog Bacaan
          </p>
          <div className="flex items-center gap-5">
            <a href="#katalog" className="hover:text-[#3B2F2F] transition-colors">
              Katalog
            </a>
            <a
              href={storeWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#3B2F2F] transition-colors"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={onGoToAdmin}
              className="hover:text-[#1B362B] font-semibold transition-colors cursor-pointer"
            >
              Login Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
