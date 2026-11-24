import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[110] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-[#FFFDF8] border-[#C8DDD0] text-[#1B362B]'
              : 'bg-[#FFFDF8] border-[#E6C7C6] text-[#8F2D2B]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E6F4D]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#A94442]" />
          )}
          <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Tutup notifikasi"
            className="text-[#7A6B5D] hover:text-[#3B2F2F] p-0.5 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
