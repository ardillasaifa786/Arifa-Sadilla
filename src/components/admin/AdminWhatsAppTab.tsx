import { useState, type FormEvent } from 'react';
import { ExternalLink, MessageCircle, Save } from 'lucide-react';
import type { StoreSettings } from '../../types/bookstore';
import { buildWhatsAppUrl, formatWhatsAppNumberForLink } from '../../utils/storage';

interface AdminWhatsAppTabProps {
  settings: StoreSettings;
  onSaveSettings: (next: StoreSettings) => void;
  onNotify: (type: 'success' | 'error', message: string) => void;
}

export function AdminWhatsAppTab({
  settings,
  onSaveSettings,
  onNotify,
}: AdminWhatsAppTabProps) {
  const [phoneInput, setPhoneInput] = useState(settings.whatsappNumber);
  const [error, setError] = useState('');

  const activeFormatted = formatWhatsAppNumberForLink(settings.whatsappNumber);
  const previewFormatted = formatWhatsAppNumberForLink(phoneInput);

  const testUrl = buildWhatsAppUrl(
    phoneInput || settings.whatsappNumber,
    `Halo ${settings.storeName}, ini adalah pesan uji coba dari Pengaturan WhatsApp Admin.`
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cleaned = phoneInput.trim();
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Nomor WhatsApp tidak valid. Masukkan minimal 8 digit angka.');
      return;
    }

    onSaveSettings({
      ...settings,
      whatsappNumber: cleaned,
    });
    onNotify('success', `Nomor WhatsApp toko diperbarui menjadi ${cleaned}.`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-serif-book text-2xl font-bold text-[#1B362B]">
          Pengaturan WhatsApp
        </h2>
        <p className="text-sm text-[#5B6B62] mt-0.5">
          Nomor ini digunakan secara otomatis untuk tombol kontak toko dan seluruh proses checkout
          pelanggan.
        </p>
      </div>

      {/* Active Number Summary */}
      <div className="bg-[#EBF3EE] border border-[#C8DDD0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#265239]">
            Nomor WhatsApp Aktif Saat Ini
          </p>
          <p className="font-serif-book text-2xl font-bold text-[#1B362B] mt-1 tabular-nums">
            {settings.whatsappNumber}
          </p>
          <p className="font-archive-mono text-xs text-[#426652] mt-1">
            Format tautan: https://wa.me/{activeFormatted}
          </p>
        </div>

        <a
          href={buildWhatsAppUrl(
            settings.whatsappNumber,
            `Halo ${settings.storeName}, uji tautan nomor aktif toko.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B362B] text-white text-xs font-semibold hover:bg-[#254A3B] transition-colors whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          Uji Tautan Aktif
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#D4E2D9] rounded-2xl p-6 space-y-4"
      >
        {error && (
          <div className="p-3 rounded-xl bg-[#F9ECEC] border border-[#E6C7C6] text-xs font-medium text-[#8F2D2B]">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="store-wa-input"
            className="block text-xs font-semibold text-[#1E2B24] mb-1.5"
          >
            Ubah Nomor WhatsApp Toko *
          </label>
          <input
            id="store-wa-input"
            type="tel"
            required
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Contoh: 081360450088"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4E2D9] bg-[#F8FBF9] text-sm text-[#1E2B24] tabular-nums focus:outline-none focus:border-[#1B362B]"
          />
          <p className="text-xs text-[#5B6B62] mt-1.5">
            Nomor lokal berawalan <span className="font-archive-mono">08...</span> otomatis
            dikonversi ke format internasional{' '}
            <span className="font-archive-mono font-semibold text-[#1B362B]">
              {previewFormatted}
            </span>{' '}
            saat membuka WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B362B] text-white text-sm font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>

          <a
            href={testUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8DDD0] bg-[#EBF3EE] text-[#1B362B] text-sm font-semibold hover:bg-[#DCEBE1] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Uji Tautan Nomor Ini
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </form>
    </div>
  );
}
