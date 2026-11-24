import { BookOpen, Printer, ShoppingBag, X } from 'lucide-react';
import type { Book } from '../types/bookstore';
import { formatRupiah } from '../utils/storage';
import { BookCover } from './BookCover';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book) => void;
  onOpenPrint: (book: Book) => void;
}

export function BookDetailModal({
  book,
  onClose,
  onAddToCart,
  onOpenPrint,
}: BookDetailModalProps) {
  if (!book) return null;

  const isOutOfStock = book.stock <= 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2D221C]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
    >
      <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[#EFE6D5]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7A6B5D] font-medium">
              <span>{book.category}</span>
              {book.label && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9E5A47] font-semibold uppercase tracking-wider text-[11px]">
                    {book.label}
                  </span>
                </>
              )}
              {book.pages ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{book.pages} halaman</span>
                </>
              ) : null}
            </div>
            <h2
              id="book-detail-title"
              className="font-serif-book text-2xl font-bold text-[#3B2F2F] mt-1"
            >
              {book.title}
            </h2>
            <p className="text-sm text-[#7A6B5D] mt-0.5">oleh {book.author}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail buku"
            className="p-2 rounded-lg text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 items-start">
          <BookCover
            src={book.coverUrl}
            title={book.title}
            author={book.author}
            className="rounded-xl w-full max-w-[220px] mx-auto sm:mx-0"
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#EFE6D5]">
              <span className="font-serif-book text-2xl font-bold text-[#3B2F2F] tabular-nums">
                {formatRupiah(book.price)}
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  isOutOfStock ? 'text-[#A94442]' : 'text-[#5E6F52]'
                }`}
              >
                {isOutOfStock ? 'Stok Habis' : `Tersedia ${book.stock} eksemplar`}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7A6B5D] mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Sinopsis &amp; Catatan Kurator
              </h3>
              <p className="text-sm text-[#3B2F2F] leading-relaxed">
                {book.description || 'Deskripsi buku belum ditambahkan oleh kurator.'}
              </p>
            </div>

            {book.quote && (
              <blockquote className="p-3.5 rounded-xl bg-[#FAF5EC] border border-[#DFD3BE] font-serif-book italic text-sm text-[#5C4E43]">
                "{book.quote}"
              </blockquote>
            )}

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  onAddToCart(book);
                  onClose();
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  isOutOfStock
                    ? 'bg-[#E5DDD0] text-[#7A6B5D] cursor-not-allowed'
                    : 'bg-[#9E5A47] text-[#FFFDF8] hover:bg-[#834737] cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrint(book);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#DFD3BE] bg-[#EFE6D5] text-[#3B2F2F] hover:bg-[#E5D9C3] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                Cetak Penanda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
