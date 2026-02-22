import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, MoreVertical, Check } from 'lucide-react';

type DropdownPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  label?: string;
  position?: DropdownPosition;
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ccc',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  triggerHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  triggerIcon: {
    padding: '0.5rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  menu: {
    position: 'absolute',
    minWidth: '180px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    overflow: 'hidden',
    padding: '0.5rem 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  menuItemHover: {
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#fff',
  },
  menuItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  menuItemDanger: {
    color: '#ef4444',
  },
  menuItemDangerHover: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  menuItemIcon: {
    width: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuItemLabel: {
    flex: 1,
  },
  menuItemCheck: {
    color: '#6366f1',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0.5rem 0',
  },
  chevron: {
    transition: 'transform 0.2s',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
};

const getMenuPosition = (position: DropdownPosition): React.CSSProperties => {
  switch (position) {
    case 'bottom-left':
      return { top: '100%', left: 0, marginTop: '4px' };
    case 'bottom-right':
      return { top: '100%', right: 0, marginTop: '4px' };
    case 'top-left':
      return { bottom: '100%', left: 0, marginBottom: '4px' };
    case 'top-right':
      return { bottom: '100%', right: 0, marginBottom: '4px' };
    default:
      return { top: '100%', left: 0, marginTop: '4px' };
  }
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  trigger,
  label,
  position = 'bottom-left',
  selectedId,
  onSelect,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setHoveredIndex(-1);
  }, []);

  const handleSelect = useCallback((item: DropdownItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (onSelect) {
      onSelect(item.id);
    }
    
    setIsOpen(false);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setHoveredIndex(0);
      }
      return;
    }

    const enabledItems = items.filter(item => !item.disabled && !item.divider);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHoveredIndex(prev => {
          const next = prev + 1;
          return next >= enabledItems.length ? 0 : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHoveredIndex(prev => {
          const next = prev - 1;
          return next < 0 ? enabledItems.length - 1 : next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (hoveredIndex >= 0 && hoveredIndex < enabledItems.length) {
          handleSelect(enabledItems[hoveredIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [isOpen, items, hoveredIndex, handleSelect]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderTrigger = () => {
    if (trigger) {
      return (
        <div onClick={handleToggle} style={{ cursor: 'pointer' }}>
          {trigger}
        </div>
      );
    }

    if (label) {
      return (
        <button
          style={{
            ...styles.trigger,
            ...(isHoveringTrigger ? styles.triggerHover : {}),
          }}
          onClick={handleToggle}
          onMouseEnter={() => setIsHoveringTrigger(true)}
          onMouseLeave={() => setIsHoveringTrigger(false)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {label}
          <ChevronDown
            size={16}
            style={{
              ...styles.chevron,
              ...(isOpen ? styles.chevronOpen : {}),
            }}
          />
        </button>
      );
    }

    return (
      <button
        style={{
          ...styles.triggerIcon,
          ...(isHoveringTrigger ? styles.triggerHover : {}),
        }}
        onClick={handleToggle}
        onMouseEnter={() => setIsHoveringTrigger(true)}
        onMouseLeave={() => setIsHoveringTrigger(false)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open menu"
      >
        <MoreVertical size={18} />
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      style={styles.container}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {renderTrigger()}

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            ...styles.menu,
            ...getMenuPosition(position),
          }}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={item.id} style={styles.divider} />;
            }

            const isHovered = hoveredIndex === index;
            const isSelected = selectedId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  ...styles.menuItem,
                  ...(item.disabled ? styles.menuItemDisabled : {}),
                  ...(item.danger ? styles.menuItemDanger : {}),
                  ...(isHovered && !item.disabled
                    ? item.danger
                      ? styles.menuItemDangerHover
                      : styles.menuItemHover
                    : {}),
                }}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHoveredIndex(index)}
                role="menuitem"
                aria-disabled={item.disabled}
              >
                {item.icon && (
                  <span style={styles.menuItemIcon}>{item.icon}</span>
                )}
                <span style={styles.menuItemLabel}>{item.label}</span>
                {isSelected && (
                  <Check size={16} style={styles.menuItemCheck} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
