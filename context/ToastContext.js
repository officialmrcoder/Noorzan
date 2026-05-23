'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900 text-white';
          let icon = <Info className="w-5 h-5 text-indigo-400" />;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-950 text-emerald-100 border border-emerald-500/30';
            icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-rose-950 text-rose-100 border border-rose-500/30';
            icon = <AlertCircle className="w-5 h-5 text-rose-400" />;
          } else if (toast.type === 'info') {
            bgColor = 'bg-blue-950 text-blue-100 border border-blue-500/30';
            icon = <Info className="w-5 h-5 text-blue-400" />;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-xl shadow-2xl backdrop-blur-md animate-slide-in ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                <X className="w-4 h-4" />
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
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
