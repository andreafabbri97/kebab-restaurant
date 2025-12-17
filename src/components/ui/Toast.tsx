import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = toastId++;
  toasts = [...toasts, { id, message, type }];
  notifyListeners();

  // Auto remove after 4 seconds
  setTimeout(() => {
    removeToast(id);
  }, 4000);
}

function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
};

const colors = {
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  error: 'text-red-400 bg-red-500/10 border-red-500/30',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[toast.type]} animate-slide-in shadow-lg`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm text-white">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
