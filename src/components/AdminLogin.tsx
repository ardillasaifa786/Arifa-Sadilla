import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToStore }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    if (trimmedUser === 'admin' && password === 'admin') {
      onLoginSuccess();
    } else {
      setError('Username atau password tidak sesuai. Silakan periksa kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EC] flex flex-col justify-between p-5 sm:p-8">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A6B5D] hover:text-[#3B2F2F] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Halaman Pengunjung
        </button>
      </div>

      <div className="max-w-md w-full mx-auto my-8 bg-[#FFFDF8] border border-[#DFD3BE] rounded-2xl p-7 sm:p-9 shadow-sm">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-[#EFE6D5]">
          <div className="w-11 h-11 rounded-xl bg-[#1B362B] text-[#FAF5EC] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif-book text-xl font-bold text-[#3B2F2F]">
              Login Administrator
            </h1>
            <p className="text-xs text-[#7A6B5D] mt-0.5">
              The Reading Archive — Panel Pengelolaan Toko
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#F9ECEC] border border-[#E6C7C6] text-xs font-medium text-[#8F2D2B]"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-[#3B2F2F] mb-1.5"
            >
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username admin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BE] bg-[#FAF5EC] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#1B362B]"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#3B2F2F] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-[#DFD3BE] bg-[#FAF5EC] text-sm text-[#3B2F2F] focus:outline-none focus:border-[#1B362B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#7A6B5D] hover:text-[#3B2F2F] hover:bg-[#EFE6D5] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-[#1B362B] text-[#FAF5EC] text-sm font-semibold hover:bg-[#254A3B] transition-colors cursor-pointer"
          >
            Masuk ke Dashboard Admin
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#EFE6D5] flex items-start gap-2.5 text-xs text-[#7A6B5D]">
          <ShieldCheck className="w-4 h-4 text-[#1B362B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Kredensial demonstrasi: Username <strong className="text-[#3B2F2F]">admin</strong> &amp;
            Password <strong className="text-[#3B2F2F]">admin</strong>. Sesi disimpan menggunakan
            SessionStorage. Untuk lingkungan produksi, autentikasi wajib ditangani oleh server.
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-[#7A6B5D]">
        &copy; {new Date().getFullYear()} The Reading Archive · Bookstore Management System
      </p>
    </div>
  );
}
