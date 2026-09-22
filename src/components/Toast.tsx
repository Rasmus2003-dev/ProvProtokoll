import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

type ToastVariant = 'success' | 'warning' | 'error';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconFor = (variant: ToastVariant) => {
    if (variant === 'success') return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
    if (variant === 'warning') return <AlertTriangle size={18} className="text-amber-500 shrink-0" />;
    return <XCircle size={18} className="text-red-500 shrink-0" />;
  };

  const borderFor = (variant: ToastVariant) => {
    if (variant === 'success') return 'border-emerald-200 dark:border-emerald-900';
    if (variant === 'warning') return 'border-amber-200 dark:border-amber-900';
    return 'border-red-200 dark:border-red-900';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto z-[1000] flex flex-col gap-2 items-end pointer-events-none print:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full sm:w-auto sm:max-w-sm bg-white dark:bg-slate-900 border ${borderFor(toast.variant)} rounded-xl shadow-lg px-4 py-3 flex items-start gap-2.5 animate-in slide-in-from-bottom-4 fade-in duration-200`}
          >
            {iconFor(toast.variant)}
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
