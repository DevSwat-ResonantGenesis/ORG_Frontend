import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  success: {
    icon: <CheckCircle size={18} />,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  error: {
    icon: <AlertCircle size={18} />,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  info: {
    icon: <Info size={18} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
};

const POSITION_STYLES: Record<ToastPosition, React.CSSProperties> = {
  'top-right': { top: '1rem', right: '1rem' },
  'top-left': { top: '1rem', left: '1rem' },
  'bottom-right': { bottom: '1rem', right: '1rem' },
  'bottom-left': { bottom: '1rem', left: '1rem' },
  'top-center': { top: '1rem', left: '50%', transform: 'translateX(-50%)' },
  'bottom-center': { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    zIndex: 9999,
    maxWidth: '400px',
    width: '100%',
  },
  toast: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    animation: 'slideIn 0.3s ease-out',
  },
  icon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  message: {
    fontSize: '0.8125rem',
    color: '#999',
    marginTop: '0.25rem',
    lineHeight: 1.4,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  actionButton: {
    marginTop: '0.5rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    borderRadius: '0 0 10px 10px',
    transition: 'width linear',
  },
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: () => void;
}> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const config = TYPE_CONFIG[toast.type];
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onRemove();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onRemove]);

  return (
    <div
      style={{
        ...styles.toast,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span style={{ ...styles.icon, color: config.color }}>
        {config.icon}
      </span>
      <div style={styles.content}>
        <div style={styles.title}>{toast.title}</div>
        {toast.message && (
          <div style={styles.message}>{toast.message}</div>
        )}
        {toast.action && (
          <button
            style={styles.actionButton}
            onClick={() => {
              toast.action?.onClick();
              onRemove();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible !== false && (
        <button style={styles.closeButton} onClick={onRemove}>
          <X size={14} />
        </button>
      )}
      {duration > 0 && (
        <div
          style={{
            ...styles.progressBar,
            width: `${progress}%`,
            background: config.color,
          }}
        />
      )}
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      return newToasts.slice(-maxToasts);
    });
    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <div style={{ ...styles.container, ...POSITION_STYLES[position] }}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAll } = context;

  return {
    toast: addToast,
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
    dismiss: removeToast,
    clearAll,
  };
};

export default ToastProvider;
