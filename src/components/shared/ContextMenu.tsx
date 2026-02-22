import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface MenuPosition {
  x: number;
  y: number;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'inline-block',
  },
  menu: {
    position: 'fixed',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    padding: '0.375rem',
    minWidth: '180px',
    zIndex: 1000,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: '0.875rem',
    color: '#ccc',
  },
  itemHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  itemDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  itemDanger: {
    color: '#ef4444',
  },
  itemDangerHover: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  label: {
    flex: 1,
  },
  shortcut: {
    fontSize: '0.75rem',
    color: '#666',
    marginLeft: 'auto',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0.375rem 0',
  },
  submenuArrow: {
    marginLeft: 'auto',
    color: '#666',
  },
  submenu: {
    position: 'absolute',
    left: '100%',
    top: 0,
    marginLeft: '4px',
  },
};

const ContextMenuItem: React.FC<{
  item: ContextMenuItem;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showSubmenu, setShowSubmenu] = useState(false);

  if (item.divider) {
    return <div style={styles.divider} />;
  }

  const handleClick = () => {
    if (item.disabled) return;
    if (item.children) {
      setShowSubmenu(!showSubmenu);
      return;
    }
    item.onClick?.();
    onClose();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          ...styles.item,
          ...(isHovered && !item.disabled
            ? item.danger
              ? styles.itemDangerHover
              : styles.itemHover
            : {}),
          ...(item.disabled ? styles.itemDisabled : {}),
          ...(item.danger ? styles.itemDanger : {}),
        }}
        onClick={handleClick}
        onMouseEnter={() => {
          setIsHovered(true);
          if (item.children) setShowSubmenu(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (item.children) setShowSubmenu(false);
        }}
      >
        {item.icon && <span style={styles.icon}>{item.icon}</span>}
        <span style={styles.label}>{item.label}</span>
        {item.shortcut && <span style={styles.shortcut}>{item.shortcut}</span>}
        {item.children && (
          <span style={styles.submenuArrow}>▶</span>
        )}
      </div>

      {item.children && showSubmenu && (
        <div
          style={{ ...styles.menu, ...styles.submenu }}
          onMouseEnter={() => setShowSubmenu(true)}
          onMouseLeave={() => setShowSubmenu(false)}
        >
          {item.children.map((child) => (
            <ContextMenuItem key={child.id} item={child} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();

    const x = e.clientX;
    const y = e.clientY;

    // Adjust position to keep menu in viewport
    const menuWidth = 200;
    const menuHeight = items.length * 36;
    const adjustedX = x + menuWidth > window.innerWidth ? x - menuWidth : x;
    const adjustedY = y + menuHeight > window.innerHeight ? y - menuHeight : y;

    setPosition({ x: adjustedX, y: adjustedY });
    setIsOpen(true);
  }, [disabled, items.length]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <div
        ref={wrapperRef}
        style={styles.wrapper}
        onContextMenu={handleContextMenu}
        className={className}
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            ...styles.menu,
            left: position.x,
            top: position.y,
          }}
        >
          {items.map((item) => (
            <ContextMenuItem key={item.id} item={item} onClose={handleClose} />
          ))}
        </div>
      )}
    </>
  );
};

// Hook for programmatic context menu
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const open = useCallback((x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, position, open, close };
};

export default ContextMenu;
