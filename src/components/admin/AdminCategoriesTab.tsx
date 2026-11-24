import { useState, type FormEvent } from 'react';
import { AlertTriangle, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Book, Category } from '../../types/bookstore';

interface AdminCategoriesTabProps {
  categories: Category[];
  books: Book[];
  onAddCategory: (name: string) => void;
  onEditCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string, reassignToName?: string) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function AdminCategoriesTab({
  categories,
  books,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onNotify,
}: AdminCategoriesTabProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignCategoryName, setReassignCategoryName] = useState('');

  const getBookCount = (catName: string) =>
    books.filter((b) => b.category === catName).length;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      onNotify('error', 'Nama kategori tidak boleh kosong.');
      return;
    }
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      onNotify('error', `Kategori "${trimmed}" sudah ada.`);
      return;
    }
    onAddCategory(trimmed);
    setNewCategoryName('');
    onNotify('success', `Kategori "${trimmed}" berhasil ditambahkan.`);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      onNotify('error', 'Nama kategori tidak boleh kosong.');
      return;
    }
    const duplicate = categories.some(
      (c) => c.id !== editingCategory.id && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      onNotify('error', `Kategori "${trimmed}" sudah digunakan.`);
      return;
    }
    onEditCategory(editingCategory.id, trimmed);
    setEditingCategory(null);
    onNotify('success', `Kategori berhasil diubah menjadi "${trimmed}".`);
  };

  const openDeleteModal = (cat: Category) => {
    const remaining = categories.filter((c) => c.id !== cat.id);
    setReassignCategoryName(remaining[0]?.name || '');
    setDeleteTarget(cat);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const usedCount = getBookCount(deleteTarget.name);
    const remaining = categories.filter((c) => c.id !== deleteTarget.id);

    if (usedCount > 0 && remaining.length === 0) {
      onNotify(
        'error',
        'Tidak dapat menghapus satu-satunya kategori yang masih memiliki produk.'
      );
      return;
    }
    if (usedCount > 0 && !reassignCategoryName) {
      onNotify('error', 'Pilih kategori tujuan untuk memindahkan buku.');
      return;
    }

    const name = deleteTarget.name;
    onDeleteCategory(deleteTarget.id, usedCount > 0 ? reassignCategoryName : undefined);
    setDeleteTarget(null);
    onNotify(
      'success',
      usedCount > 0
        ? `Kategori "${name}" dihapus dan ${usedCount} buku dipindahkan ke "${reassignCategoryName}".`
        : `Kategori "${name}" berhasil dihapus.`
    );
  };

  const deleteUsedCount = deleteTarget ? getBookCount(deleteTarget.name) : 0;
  const remainingCategories = deleteTarget
    ? categories.filter((c) => c.id !== deleteTarget.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-book text-2xl font-bold text-[#1B362B]">Kelola Kategori</h2>
        <p className="text-sm text-[#5B6B62] mt-0.5">
          Atur kategori katalog toko. Filter halaman utama otomatis mengikuti perubahan di sini.
        </p>
      </div>

      {/* Add Category Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white border border-[#D4E2D9] rounded-2xl p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="new-category-input"
            className="block text-xs font-semibold text-[#1E2B24] mb-1.5"
          >
            Nama Kategori Baru
          </label>
          <input
            id="new-category-input"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Contoh: Filsafat, Biografi, Seni & Desain..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B362B] text-white text-sm font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </form>

      {/* Categories Table */}
      <div className="bg-white border border-[#D4E2D9] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead>
              <tr className="bg-[#EBF3EE] border-b border-[#D4E2D9] text-xs font-semibold uppercase tracking-wider text-[#1B362B]">
                <th className="py-3.5 px-5">Nama Kategori</th>
                <th className="py-3.5 px-5 text-right">Jumlah Buku</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EFEA] text-sm">
              {categories.map((cat) => {
                const count = getBookCount(cat.name);
                return (
                  <tr key={cat.id} className="hover:bg-[#F7FBF8] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#1E2B24]">{cat.name}</td>
                    <td className="py-3.5 px-5 text-right tabular-nums text-[#5B6B62]">
                      {count} buku
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditName(cat.name);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#C8DDD0] bg-[#EBF3EE] text-[#1B362B] text-xs font-semibold hover:bg-[#DCEBE1] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(cat)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6C7C6] bg-white text-[#A94442] text-xs font-semibold hover:bg-[#F9ECEC] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Edit kategori"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-book text-lg font-bold text-[#1B362B]">Edit Kategori</h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1.5 rounded-lg text-[#5B6B62] hover:bg-[#EBF3EE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                />
                <p className="text-[11px] text-[#5B6B62] mt-1.5">
                  Seluruh buku pada kategori ini akan otomatis diperbarui ke nama baru.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-[#D4E2D9] text-xs font-semibold text-[#1E2B24] hover:bg-[#F4F8F5] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B362B] text-white text-xs font-semibold hover:bg-[#254A3B] cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal with Reassignment */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#14261E]/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi hapus kategori"
        >
          <div className="bg-white border border-[#D4E2D9] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF4E6] text-[#9A631D] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-book text-lg font-bold text-[#1E2B24]">
                  Hapus Kategori "{deleteTarget.name}"?
                </h3>
                {deleteUsedCount > 0 ? (
                  <p className="text-xs text-[#5B6B62] mt-1 leading-relaxed">
                    Peringatan: Kategori ini masih digunakan oleh{' '}
                    <strong className="text-[#1E2B24]">{deleteUsedCount} buku</strong>. Pilih
                    kategori pengganti agar seluruh buku tetap memiliki kategori yang valid.
                  </p>
                ) : (
                  <p className="text-xs text-[#5B6B62] mt-1 leading-relaxed">
                    Kategori ini belum memiliki produk dan dapat langsung dihapus.
                  </p>
                )}
              </div>
            </div>

            {deleteUsedCount > 0 && remainingCategories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#1E2B24] mb-1.5">
                  Pindahkan {deleteUsedCount} buku ke kategori:
                </label>
                <select
                  value={reassignCategoryName}
                  onChange={(e) => setReassignCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] focus:outline-none focus:border-[#1B362B]"
                >
                  {remainingCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {deleteUsedCount > 0 && remainingCategories.length === 0 && (
              <div className="p-3 rounded-xl bg-[#F9ECEC] border border-[#E6C7C6] text-xs text-[#8F2D2B]">
                Buat kategori baru terlebih dahulu sebelum menghapus kategori terakhir yang masih
                memiliki produk.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#D4E2D9] text-xs font-semibold text-[#1E2B24] hover:bg-[#F4F8F5] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteUsedCount > 0 && remainingCategories.length === 0}
                onClick={handleConfirmDelete}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors ${
                  deleteUsedCount > 0 && remainingCategories.length === 0
                    ? 'bg-[#D0B8B8] cursor-not-allowed'
                    : 'bg-[#A94442] hover:bg-[#8E3533] cursor-pointer'
                }`}
              >
                {deleteUsedCount > 0 ? 'Pindahkan & Hapus Kategori' : 'Ya, Hapus Kategori'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
