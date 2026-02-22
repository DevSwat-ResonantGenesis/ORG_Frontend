import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

type SidePanelPosition = 'left' | 'right';
type SidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  position?: SidePanelPosition;
  size?: SidePanelSize;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SIZE_CONFIG: Record<SidePanelSize, string> = {
  sm: '320px',
  md: '400px',
  lg: '500px',
  xl: '640px',
  full: '100%',
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    transition: 'opacity 0.3s',
  },
  overlayHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  panel: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#0f0f14',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    transition: 'transform 0.3s ease-out',
  },
  panelLeft: {
    left: 0,
    borderLeft: 'none',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '10px 0 40px rgba(0, 0, 0, 0.4)',
  },
  panelRight: {
    right: 0,
  },
  panelHiddenLeft: {
    transform: 'translateX(-100%)',
  },
  panelHiddenRight: {
    transform: 'translateX(100%)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: '#888',
    marginTop: '0.25rem',
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
    flexShrink: 0,
  },
  closeButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '1.5rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
    flexShrink: 0,
  },
};

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  position = 'right',
  size = 'md',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  header,
  footer,
  children,
  className,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isCloseHovered, setIsCloseHovered] = React.useState(false);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === 'Escape') {
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

  const panelWidth = SIZE_CONFIG[size];

  return (
    <>
      {showOverlay && (
        <div
          style={{
            ...styles.overlay,
            ...(!isOpen ? styles.overlayHidden : {}),
          }}
          onClick={handleOverlayClick}
        />
      )}

      <div
        ref={panelRef}
        style={{
          ...styles.panel,
          ...(position === 'left' ? styles.panelLeft : styles.panelRight),
          ...(!isOpen
            ? position === 'left'
              ? styles.panelHiddenLeft
              : styles.panelHiddenRight
            : {}),
          width: panelWidth,
          maxWidth: '100vw',
        }}
        className={className}
      >
        {(title || subtitle || header || showCloseButton) && (
          <div style={styles.header}>
            {header || (
              <div style={styles.headerContent}>
                {title && <h2 style={styles.title}>{title}</h2>}
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
              </div>
            )}
            {showCloseButton && (
              <button
                style={{
                  ...styles.closeButton,
                  ...(isCloseHovered ? styles.closeButtonHover : {}),
                }}
                onClick={onClose}
                onMouseEnter={() => setIsCloseHovered(true)}
                onMouseLeave={() => setIsCloseHovered(false)}
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div style={styles.body}>{children}</div>

        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </>
  );
};

// Hook for side panel state
export const useSidePanel = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

// Detail panel variant for viewing item details
interface DetailPanelProps extends Omit<SidePanelProps, 'children'> {
  sections: {
    title: string;
    content: React.ReactNode;
  }[];
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  sections,
  ...props
}) => (
  <SidePanel {...props}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {sections.map((section, index) => (
        <div key={index}>
          <h3
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}
          >
            {section.title}
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#ccc' }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  </SidePanel>
);

export default SidePanel;
