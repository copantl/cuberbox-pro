
import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from './components/ToastContainer';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'critical';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  persistent?: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string, persistent?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info', title?: string, persistent: boolean = false) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title, persistent }]);

    // Solo auto-remover si no es persistente
    if (!persistent && type !== 'critical') {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
