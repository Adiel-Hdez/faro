import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Info, 
  X, 
  PhoneCall, 
  Download,
  Users
} from 'lucide-react';

export type ToastType = 'success' | 'alert' | 'info' | 'warning' | 'radio' | 'phone' | 'download' | 'brigade';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  timestamp: string;
}

interface ToastContextType {
  showToast: (options: { title: string; message: string; type?: ToastType; durationMs?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      message,
      type = 'info',
      durationMs = 4500,
    }: {
      title: string;
      message: string;
      type?: ToastType;
      durationMs?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newToast: ToastItem = {
        id,
        title,
        message,
        type,
        timestamp,
      };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={22} />;
      case 'alert':
        return <AlertTriangle className="text-red-500" size={22} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={22} />;
      case 'radio':
        return <Radio className="text-orange-500 animate-pulse" size={22} />;
      case 'phone':
        return <PhoneCall className="text-blue-500" size={22} />;
      case 'download':
        return <Download className="text-indigo-500" size={22} />;
      case 'brigade':
        return <Users className="text-cyan-500" size={22} />;
      default:
        return <Info className="text-blue-500" size={22} />;
    }
  };

  const getToastBadge = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { label: 'CONFIRMADO', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'alert':
        return { label: 'ALERTA FARO', bg: 'bg-red-100 text-red-800 border-red-200' };
      case 'warning':
        return { label: 'ADVERTENCIA', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'radio':
        return { label: 'ENLACE LoRa / VHF', bg: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'phone':
        return { label: 'ENLACE TELEFÓNICO', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'download':
        return { label: 'SISTEMA DE ARCHIVOS', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'brigade':
        return { label: 'DESPACHO BRIGADA', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      default:
        return { label: 'NOTIFICACIÓN', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Card Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const badge = getToastBadge(toast.type);
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 flex gap-3.5 items-start transition-all transform animate-in fade-in slide-in-from-bottom-5 duration-300 hover:shadow-orange-500/10 hover:border-gray-300"
            >
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                {getToastIcon(toast.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {toast.timestamp}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {toast.title}
                </h4>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition shrink-0"
                title="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
