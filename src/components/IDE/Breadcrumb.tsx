// ============== BREADCRUMB NAVIGATION ==============
// File path breadcrumb with dropdown navigation

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: BreadcrumbItem[];
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
  onSymbolClick?: (symbol: string) => void;
  symbols?: { name: string; type: string; line: number }[];
  className?: string;
}

const BreadcrumbComponent: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  onSymbolClick,
  symbols = [],
  className,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [symbolsOpen, setSymbolsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setSymbolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = useCallback((item: BreadcrumbItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.children && item.children.length > 0) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    } else {
      onNavigate?.(item);
      setOpenDropdown(null);
    }
  }, [openDropdown, onNavigate]);

  const handleChildClick = useCallback((child: BreadcrumbItem) => {
    onNavigate?.(child);
    setOpenDropdown(null);
  }, [onNavigate]);

  const getFileIcon = (label: string) => {
    const ext = label.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return '🔷';
      case 'js': case 'jsx': return '🟨';
      case 'py': return '🐍';
      case 'css': case 'scss': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const getSymbolIcon = (type: string) => {
    switch (type) {
      case 'function': return '𝑓';
      case 'class': return '◇';
      case 'interface': return '◈';
      case 'variable': return '𝑥';
      case 'constant': return '𝐶';
      case 'enum': return '∈';
      case 'type': return '𝑇';
      default: return '•';
    }
  };

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <div className={styles.breadcrumb}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <span className={styles.separator}>/</span>}
            <div className={styles.itemWrapper}>
              <button
                className={`${styles.item} ${item.children?.length ? styles.hasChildren : ''}`}
                onClick={e => handleItemClick(item, e)}
              >
                <span className={styles.itemIcon}>
                  {item.icon || (index === items.length - 1 ? getFileIcon(item.label) : '📁')}
                </span>
                <span className={styles.itemLabel}>{item.label}</span>
                {item.children && item.children.length > 0 && (
                  <span className={styles.chevron}>▾</span>
                )}
              </button>

              {openDropdown === item.id && item.children && (
                <div className={styles.dropdown}>
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className={styles.dropdownItem}
                      onClick={() => handleChildClick(child)}
                    >
                      <span className={styles.dropdownIcon}>
                        {child.icon || (child.children ? '📁' : getFileIcon(child.label))}
                      </span>
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {symbols.length > 0 && (
        <>
          <span className={styles.symbolSeparator}>:</span>
          <div className={styles.symbolWrapper}>
            <button
              className={styles.symbolButton}
              onClick={() => setSymbolsOpen(!symbolsOpen)}
            >
              <span className={styles.symbolIcon}>{getSymbolIcon(symbols[0]?.type)}</span>
              <span className={styles.symbolName}>{symbols[0]?.name || 'Select symbol'}</span>
              <span className={styles.chevron}>▾</span>
            </button>

            {symbolsOpen && (
              <div className={styles.symbolDropdown}>
                {symbols.map((symbol, idx) => (
                  <button
                    key={idx}
                    className={styles.symbolItem}
                    onClick={() => {
                      onSymbolClick?.(symbol.name);
                      setSymbolsOpen(false);
                    }}
                  >
                    <span className={styles.symbolTypeIcon}>{getSymbolIcon(symbol.type)}</span>
                    <span className={styles.symbolLabel}>{symbol.name}</span>
                    <span className={styles.symbolLine}>:{symbol.line}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const Breadcrumb = memo(BreadcrumbComponent);
export default Breadcrumb;
