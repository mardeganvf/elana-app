import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3500;

const toastConfig: Record<ToastType, { icon: React.ReactNode; gradient: string; border: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/30'
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    gradient: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/30'
  },
  info: {
    icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    gradient: 'from-sky-500/20 to-sky-600/5',
    border: 'border-sky-500/30'
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/30'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev.slice(-4), { id, type, message }]); // max 5 visible
    const timer = setTimeout(() => removeToast(id), TOAST_DURATION);
    timers.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    return () => {
      timers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto bg-gradient-to-r ${config.gradient} backdrop-blur-xl bg-[#101B1E]/90 border ${config.border} rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-fade-in`}
              style={{ animation: 'fadeInSlideDown 0.3s ease-out' }}
            >
              {config.icon}
              <p className="text-sm font-medium text-white/90 flex-1 leading-snug">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white/80 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Animation keyframes injected once */}
      <style>{`
        @keyframes fadeInSlideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
