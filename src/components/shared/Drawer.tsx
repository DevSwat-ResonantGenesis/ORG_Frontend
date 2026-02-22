import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_CONFIG: Record<DrawerPlacement, Record<DrawerSize, string>> = {
  left: { sm: '280px', md: '380px', lg: '480px', xl: '640px', full: '100%' },
  right: { sm: '280px', md: '380px', lg: '480px', xl: '640px', full: '100%' },
  top: { sm: '200px', md: '300px', lg: '400px', xl: '500px', full: '100%' },
  bottom: { sm: '200px', md: '300px', lg: '400px', xl: '500px', full: '100%' },
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    transition: 'opacity 0.2s ease',
  },
  drawer: {
    position: 'fixed',
    background: '#1a1a24',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    transition: 'transform 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    color: '#ccc',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  },
};

const getDrawerStyles = (
  placement: DrawerPlacement,
  size: DrawerSize,
  isOpen: boolean
): React.CSSProperties => {
  const sizeValue = SIZE_CONFIG[placement][size];

  const base: React.CSSProperties = {
    ...styles.drawer,
  };

  switch (placement) {
    case 'left':
      return {
        ...base,
        top: 0,
        left: 0,
        bottom: 0,
        width: sizeValue,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      };
    case 'right':
      return {
        ...base,
        top: 0,
        right: 0,
        bottom: 0,
        width: sizeValue,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      };
    case 'top':
      return {
        ...base,
        top: 0,
        left: 0,
        right: 0,
        height: sizeValue,
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
      };
    case 'bottom':
      return {
        ...base,
        bottom: 0,
        left: 0,
        right: 0,
        height: sizeValue,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
      };
  }
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  placement = 'right',
  size = 'md',
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  footer,
  className,
}) => {
  const [isHoveredClose, setIsHoveredClose] = React.useState(false);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showOverlay && (
        <div
          style={{ ...styles.overlay, opacity: isOpen ? 1 : 0 }}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <div
        style={getDrawerStyles(placement, size, isOpen)}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div style={styles.header}>
            {title && (
              <h2 id="drawer-title" style={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                style={{
                  ...styles.closeButton,
                  ...(isHoveredClose
                    ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }
                    : {}),
                }}
                onClick={onClose}
                onMouseEnter={() => setIsHoveredClose(true)}
                onMouseLeave={() => setIsHoveredClose(false)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div style={styles.content}>{children}</div>

        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </>
  );
};

// Hook for managing drawer state
export const useDrawer = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

export default Drawer;
