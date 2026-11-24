import { useState } from 'react';
import { Printer, X } from 'lucide-react';
import type { Book } from '../types/bookstore';
import { formatDateId, formatRupiah } from '../utils/storage';

interface PrintBookmarkModalProps {
  book: Book | null;
  onClose: () => void;
}

function renderStars(count?: number): string {
  const n = Math.min(5, Math.max(0, Number(count) || 5));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function BookmarkCardContent({
  book,
  template,
}: {
  book: Book;
  template: 'bookmark' | 'card';
}) {
  if (template === 'bookmark') {
    return (
      <div className="printable-bookmark w-[240px] min-h-[520px] bg-[#FAF5EC] border-[1.5px] border-dashed border-[#8C7A6B] px-[18px] py-[22px] flex flex-col justify-between text-[#3B2F2F] shadow-sm">
        <div>
          <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#8C7A6B] bg-[#FFFDF8] mx-auto mb-3.5" />
          <div className="text-center border-b border-[#D7C9B3] pb-3 mb-4">
            <div className="font-archive-mono text-[11px] tracking-[2px] uppercase text-[#7A6B5D]">
              Catatan Bacaan
            </div>
          </div>
          <h2 className="font-serif-book text-xl leading-snug text-center mt-2 mb-1.5 font-bold">
            {book.title}
          </h2>
          <p className="text-[13px] text-[#7A6B5D] text-center mb-3">oleh {book.author}</p>
          <div className="text-center text-[#C89F5D] text-base tracking-[3px] mb-4">
            {renderStars(book.rating)}
          </div>
          {book.quote && (
            <div className="font-serif-book italic text-[13px] leading-relaxed text-center py-3 px-2.5 border-t border-b border-dashed border-[#D7C9B3] mb-4 text-[#5C4E43]">
              "{book.quote}"
            </div>
          )}
        </div>

        <div>
          <div className="font-archive-mono text-[11px] text-[#5C4E43] leading-[1.7] space-y-0.5">
            <div>
              <strong>Kategori:</strong> {book.category}
            </div>
            <div>
              <strong>Harga   :</strong> {formatRupiah(book.price)}
            </div>
            <div>
              <strong>Hal     :</strong> {book.pages ? `${book.pages} hlm` : '-'}
            </div>
            <div>
              <strong>Tanggal :</strong> {formatDateId(book.createdAt)}
            </div>
          </div>
          <div className="text-center font-archive-mono text-[10px] text-[#8C7A6B] mt-4 pt-2.5 border-t border-[#D7C9B3]">
            THE READING ARCHIVE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="printable-card w-full max-w-[480px] bg-[#FAF5EC] border-2 border-[#3B2F2F] p-6 text-[#3B2F2F] shadow-sm">
      <div className="flex justify-between items-end border-b-2 border-[#3B2F2F] pb-2.5 mb-4">
        <h3 className="font-archive-mono text-base tracking-[1.5px] uppercase font-bold">
          Kartu Arsip Buku
        </h3>
        <span className="font-archive-mono text-xs text-[#7A6B5D]">
          NO: {book.id.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-[130px_1fr] border-b border-[#D7C9B3] py-2 text-sm">
        <div className="font-archive-mono font-bold text-[#7A6B5D] text-xs uppercase">
          Judul Buku
        </div>
        <div className="font-serif-book font-bold">{book.title}</div>
      </div>
      <div className="grid grid-cols-[130px_1fr] border-b border-[#D7C9B3] py-2 text-sm">
        <div className="font-archive-mono font-bold text-[#7A6B5D] text-xs uppercase">
          Penulis
        </div>
        <div className="font-serif-book">{book.author}</div>
      </div>
      <div className="grid grid-cols-[130px_1fr] border-b border-[#D7C9B3] py-2 text-sm">
        <div className="font-archive-mono font-bold text-[#7A6B5D] text-xs uppercase">
          Kategori / Hal
        </div>
        <div className="font-serif-book">
          {book.category} · {book.pages ? `${book.pages} halaman` : '-'}
        </div>
      </div>
      <div className="grid grid-cols-[130px_1fr] border-b border-[#D7C9B3] py-2 text-sm">
        <div className="font-archive-mono font-bold text-[#7A6B5D] text-xs uppercase">
          Harga Katalog
        </div>
        <div className="font-serif-book tabular-nums">{formatRupiah(book.price)}</div>
      </div>
      <div className="grid grid-cols-[130px_1fr] border-b border-[#D7C9B3] py-2 text-sm">
        <div className="font-archive-mono font-bold text-[#7A6B5D] text-xs uppercase">
          Penilaian
        </div>
        <div className="font-serif-book">
          <span className="text-[#C89F5D]">{renderStars(book.rating)}</span>
        </div>
      </div>

      {book.quote && (
        <div className="mt-3.5 p-3 bg-[#FFFDF8] border border-dashed border-[#B8A992] font-serif-book italic text-[13px] text-[#5C4E43]">
          "{book.quote}"
        </div>
      )}

      <div className="mt-4 flex justify-between items-center font-archive-mono text-xs text-[#7A6B5D]">
        <span>Dicetak dari The Reading Archive</span>
        <span>Paraf: ____________</span>
      </div>
    </div>
  );
}

export function PrintBookmarkModal({ book, onClose }: PrintBookmarkModalProps) {
  const [template, setTemplate] = useState<'bookmark' | 'card'>('bookmark');

  if (!book) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#2D221C]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-modal-title"
      >
        <div className="bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 id="print-modal-title" className="font-serif-book text-xl font-bold text-[#3B2F2F]">
                Cetak Penanda Detail Buku
              </h2>
              <p className="text-xs text-[#7A6B5D] mt-0.5">
                Fitur arsip pustaka klasik untuk pembatas buku &amp; kartu koleksi
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal cetak"
              className="p-2 rounded-lg text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => setTemplate('bookmark')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                template === 'bookmark'
                  ? 'bg-[#9E5A47] text-[#FFFDF8] border-[#9E5A47]'
                  : 'bg-[#EFE6D5] text-[#3B2F2F] border-[#DFD3BE] hover:bg-[#E5D9C3]'
              }`}
            >
              Model Pembatas Buku (Bookmark)
            </button>
            <button
              type="button"
              onClick={() => setTemplate('card')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                template === 'card'
                  ? 'bg-[#9E5A47] text-[#FFFDF8] border-[#9E5A47]'
                  : 'bg-[#EFE6D5] text-[#3B2F2F] border-[#DFD3BE] hover:bg-[#E5D9C3]'
              }`}
            >
              Model Kartu Perpustakaan
            </button>
          </div>

          <div className="bg-[#EFE6D5] border border-dashed border-[#DFD3BE] rounded-xl p-6 flex justify-center overflow-x-auto">
            <BookmarkCardContent book={book} template={template} />
          </div>

          <p className="text-xs text-[#7A6B5D] text-center mt-3">
            Tips: Saat dialog cetak muncul, centang opsi{' '}
            <strong className="text-[#3B2F2F]">Background graphics / Grafis latar belakang</strong>{' '}
            agar nuansa cream pustaka ikut tercetak di kertas.
          </p>

          <div className="flex justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#EFE6D5] text-[#3B2F2F] border border-[#DFD3BE] hover:bg-[#E5D9C3] transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#9E5A47] text-[#FFFDF8] hover:bg-[#834737] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang / Simpan PDF
            </button>
          </div>
        </div>
      </div>

      <div id="print-only-area" aria-hidden="true">
        <BookmarkCardContent book={book} template={template} />
      </div>
    </>
  );
}
