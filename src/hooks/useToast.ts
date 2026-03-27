import { useState, useCallback } from 'react';
import { ToastData } from '../components/Toast/ToastContainer';
import { type ToastType } from '../components/Toast/Toast';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number, onClick?: () => void) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastData = { id, message, type, duration, onClick };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number, onClick?: () => void) => {
    return showToast(message, 'error', duration, onClick);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number, onClick?: () => void) => {
    return showToast(message, 'warning', duration, onClick);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

