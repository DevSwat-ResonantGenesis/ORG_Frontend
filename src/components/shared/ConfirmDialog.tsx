import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react';

type DialogVariant = 'danger' | 'warning' | 'info' | 'confirm';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
}

const VARIANT_CONFIG: Record<DialogVariant, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  buttonBg: string;
  buttonHoverBg: string;
}> = {
  danger: {
    icon: <AlertTriangle size={24} />,
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#ef4444',
    buttonBg: '#ef4444',
    buttonHoverBg: '#dc2626',
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconBg: 'rgba(245, 158, 11, 0.1)',
    iconColor: '#f59e0b',
    buttonBg: '#f59e0b',
    buttonHoverBg: '#d97706',
  },
  info: {
    icon: <Info size={24} />,
    iconBg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#3b82f6',
    buttonBg: '#3b82f6',
    buttonHoverBg: '#2563eb',
  },
  confirm: {
    icon: <HelpCircle size={24} />,
    iconBg: 'rgba(99, 102, 241, 0.1)',
    iconColor: '#6366f1',
    buttonBg: '#6366f1',
    buttonHoverBg: '#4f46e5',
  },
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
    backdropFilter: 'blur(4px)',
  },
  dialog: {
    background: '#1a1a24',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0.75rem 0.75rem 0 0',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  content: {
    padding: '0 1.5rem 1.5rem',
    textAlign: 'center',
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 0.5rem',
  },
  message: {
    fontSize: '0.875rem',
    color: '#888',
    lineHeight: '1.5',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  button: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  cancelButton: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#888',
  },
  confirmButton: {
    border: 'none',
    color: '#fff',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'confirm',
  isLoading = false,
}) => {
  const config = VARIANT_CONFIG[variant];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
    if (e.key === 'Enter' && !isLoading) {
      onConfirm();
    }
  }, [onClose, onConfirm, isLoading]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={isLoading ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <button
            style={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div style={styles.content}>
          <div
            style={{
              ...styles.iconWrapper,
              background: config.iconBg,
              color: config.iconColor,
            }}
          >
            {config.icon}
          </div>
          <h2 id="confirm-dialog-title" style={styles.title}>
            {title}
          </h2>
          <p style={styles.message}>{message}</p>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.confirmButton,
              background: config.buttonBg,
              opacity: isLoading ? 0.7 : 1,
            }}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner} />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing confirm dialog state
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    message: string;
    variant?: DialogVariant;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);
  const [resolver, setResolver] = React.useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: {
    title: string;
    message: string;
    variant?: DialogVariant;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean> => {
    setConfig(options);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolver?.(true);
    setResolver(null);
  }, [resolver]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resolver?.(false);
    setResolver(null);
  }, [resolver]);

  return {
    isOpen,
    config,
    confirm,
    handleConfirm,
    handleClose,
  };
};

export default ConfirmDialog;
