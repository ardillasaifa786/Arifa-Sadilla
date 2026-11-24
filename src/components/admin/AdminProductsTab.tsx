import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import type { Book, BookLabel, Category } from '../../types/bookstore';
import { compressImageFile, formatRupiah } from '../../utils/storage';
import { BookCover } from '../BookCover';

interface AdminProductsTabProps {
  books: Book[];
  categories: Category[];
  onSaveBook: (book: Book, isEdit: boolean) => void;
  onDeleteBook: (bookId: string) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

interface BookFormState {
  id: string;
  title: string;
  author: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  coverUrl: string;
  label: BookLabel;
  pages: string;
  quote: string;
}

export function AdminProductsTab({
  books,
  categories,
  onSaveBook,
  onDeleteBook,
  onNotify,
}: AdminProductsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [coverMode, setCoverMode] = useState<'url' | 'upload'>('url');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const emptyForm = (): BookFormState => ({
    id: '',
    title: '',
    author: '',
    category: categories[0]?.name || '',
    price: '',
    stock: '0',
    description: '',
    coverUrl: '',
    label: '',
    pages: '',
    quote: '',
  });

  const [form, setForm] = useState<BookFormState>(emptyForm);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const openAddModal = () => {
    setForm(emptyForm());
    setIsEditing(false);
    setCoverMode('url');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      price: String(book.price),
      stock: String(book.stock),
      description: book.description,
      coverUrl: book.coverUrl,
      label: book.label,
      pages: book.pages ? String(book.pages) : '',
      quote: book.quote || '',
    });
    setIsEditing(true);
    setCoverMode(book.coverUrl.startsWith('data:') ? 'upload' : 'url');
    setFormError('');
    setModalOpen(true);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }
    try {
      const compressedDataUrl = await compressImageFile(file);
      setForm((prev) => ({ ...prev, coverUrl: compressedDataUrl }));
      setFormError('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const title = form.title.trim();
    const author = form.author.trim();
    const category = form.category.trim();
    const priceNum = Number(form.price);
    const stockNum = Number(form.stock);
    const pagesNum = form.pages.trim() ? Number(form.pages) : undefined;

    if (!title) {
      setFormError('Judul buku wajib diisi.');
      return;
    }
    if (!author) {
      setFormError('Nama penulis wajib diisi.');
      return;
    }
    if (!category) {
      setFormError('Kategori buku wajib dipilih.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFormError('Harga harus berupa angka valid dan lebih dari nol.');
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setFormError('Stok harus berupa bilangan bulat nonnegatif (0 atau lebih).');
      return;
    }

    const existing = isEditing ? books.find((b) => b.id === form.id) : undefined;

    const bookPayload: Book = {
      id: isEditing ? form.id : `bk-${Date.now()}`,
      title,
      author,
      category,
      price: Math.round(priceNum),
      stock: stockNum,
      description: form.description.trim(),
      coverUrl: form.coverUrl.trim(),
      label: form.label,
      pages: pagesNum && pagesNum > 0 ? Math.round(pagesNum) : undefined,
      rating: existing?.rating ?? 5,
      quote: form.quote.trim() || undefined,
      readingStatus: existing?.readingStatus ?? 'Sudah Dibaca',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    onSaveBook(bookPayload, isEditing);
    setModalOpen(false);
    onNotify(
      'success',
      isEditing
        ? `Buku "${bookPayload.title}" berhasil diperbarui.`
        : `Buku "${bookPayload.title}" berhasil ditambahkan ke katalog.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-book text-2xl font-bold text-[#1B362B]">Kelola Produk</h2>
          <p className="text-sm text-[#5B6B62] mt-0.5">
            Tambah, ubah, dan hapus koleksi buku. Perubahan langsung tampil di halaman toko.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B362B] text-[#FFFFFF] text-sm font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Buku Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#D4E2D9] rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#5B6B62] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, penulis, atau kategori..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-[#D4E2D9] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-[#EBF3EE] border-b border-[#D4E2D9] text-xs font-semibold uppercase tracking-wider text-[#1B362B]">
                <th className="py-3.5 px-4">Buku</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Label</th>
                <th className="py-3.5 px-4 text-right">Harga</th>
                <th className="py-3.5 px-4 text-right">Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EFEA] text-sm">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5B6B62]">
                    Tidak ada buku yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#F7FBF8] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <BookCover
                          src={book.coverUrl}
                          title={book.title}
                          author={book.author}
                          className="w-11 rounded-md shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-serif-book font-bold text-[#1E2B24] line-clamp-1">
                            {book.title}
                          </p>
                          <p className="text-xs text-[#5B6B62] line-clamp-1">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#1E2B24]">{book.category}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#1B362B]">
                      {book.label || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-[#1E2B24]">
                      {formatRupiah(book.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums">
                      <span
                        className={`font-semibold ${
                          book.stock === 0 ? 'text-[#A94442]' : 'text-[#1B362B]'
                        }`}
                      >
                        {book.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(book)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#C8DDD0] bg-[#EBF3EE] text-[#1B362B] text-xs font-semibold hover:bg-[#DCEBE1] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(book)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6C7C6] bg-white text-[#A94442] text-xs font-semibold hover:bg-[#F9ECEC] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-heading"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E7EFEA]">
              <h3 id="product-modal-heading" className="font-serif-book text-xl font-bold text-[#1B362B]">
                {isEditing ? 'Edit Data Buku' : 'Tambah Buku Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup modal produk"
                className="p-2 rounded-lg text-[#5B6B62] hover:bg-[#EBF3EE] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-[#F9ECEC] border border-[#E6C7C6] text-xs font-medium text-[#8F2D2B]">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Contoh: Laut Bercerita"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Nama Penulis *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                    placeholder="Contoh: Leila S. Chudori"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Kategori *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    step={1}
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Contoh: 115000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] tabular-nums focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Stok (Eksemplar) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                    placeholder="Contoh: 10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] tabular-nums focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Label Produk
                  </label>
                  <select
                    value={form.label}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, label: e.target.value as BookLabel }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  >
                    <option value="">Tanpa Label</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Terbaru">Terbaru</option>
                    <option value="Rekomendasi">Rekomendasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Jumlah Halaman (Opsional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.pages}
                    onChange={(e) => setForm((p) => ({ ...p, pages: e.target.value }))}
                    placeholder="Contoh: 379"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] tabular-nums focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                {/* Cover Image Selector */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-[#F8FBF9] border border-[#D4E2D9] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#1E2B24]">Gambar Sampul Buku</span>
                    <div className="inline-flex rounded-lg border border-[#D4E2D9] bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setCoverMode('url')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          coverMode === 'url'
                            ? 'bg-[#1B362B] text-white'
                            : 'text-[#5B6B62] hover:text-[#1E2B24]'
                        }`}
                      >
                        URL Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverMode('upload')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          coverMode === 'upload'
                            ? 'bg-[#1B362B] text-white'
                            : 'text-[#5B6B62] hover:text-[#1E2B24]'
                        }`}
                      >
                        Unggah File
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <BookCover
                      src={form.coverUrl}
                      title={form.title || 'Pratinjau Sampul'}
                      author={form.author || 'Penulis'}
                      className="w-24 rounded-lg shrink-0"
                    />
                    <div className="flex-1 w-full space-y-2">
                      {coverMode === 'url' ? (
                        <div>
                          <input
                            type="text"
                            value={form.coverUrl}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, coverUrl: e.target.value }))
                            }
                            placeholder="https://... atau /src/assets/images/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-white text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                          />
                          <p className="text-[11px] text-[#5B6B62] mt-1">
                            Kosongkan jika ingin menggunakan sampul klasik otomatis.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8DDD0] bg-[#EBF3EE] text-[#1B362B] text-xs font-semibold hover:bg-[#DCEBE1] transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Pilih File Gambar Sampul
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[11px] text-[#5B6B62] mt-1.5">
                            Gambar otomatis dikompresi agar aman tersimpan di LocalStorage.
                          </p>
                        </div>
                      )}
                      {form.coverUrl && (
                        <button
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, coverUrl: '' }))}
                          className="text-xs font-semibold text-[#A94442] hover:underline cursor-pointer"
                        >
                          Hapus gambar sampul
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Deskripsi Buku
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Sinopsis singkat atau catatan kurator mengenai buku ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                    Kutipan Pilihan (untuk fitur Cetak Penanda)
                  </label>
                  <input
                    type="text"
                    value={form.quote}
                    onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
                    placeholder="Kutipan berkesan dari dalam buku..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E7EFEA]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4E2D9] bg-white text-[#1E2B24] text-sm font-semibold hover:bg-[#F4F8F5] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1B362B] text-white text-sm font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambahkan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus buku"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-serif-book text-lg font-bold text-[#1E2B24]">
              Hapus Buku dari Katalog?
            </h3>
            <p className="text-sm text-[#5B6B62] leading-relaxed">
              Anda yakin ingin menghapus{' '}
              <strong className="text-[#1E2B24]">"{deleteTarget.title}"</strong>? Buku yang dihapus
              tidak lagi tampil di halaman pengunjung.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#D4E2D9] bg-white text-[#1E2B24] text-xs font-semibold hover:bg-[#F4F8F5] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = deleteTarget.title;
                  onDeleteBook(deleteTarget.id);
                  setDeleteTarget(null);
                  onNotify('success', `Buku "${title}" telah dihapus.`);
                }}
                className="px-4 py-2 rounded-xl bg-[#A94442] text-white text-xs font-semibold hover:bg-[#8E3533] cursor-pointer"
              >
                Ya, Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
