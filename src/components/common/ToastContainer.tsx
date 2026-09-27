import React from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = usePharmacy();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 left-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
              : toast.type === 'info'
              ? 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
              : 'bg-teal-50/95 dark:bg-teal-950/90 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 opacity-70" />
          </button>
        </div>
      ))}
    </div>
  );
};
