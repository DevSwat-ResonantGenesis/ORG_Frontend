import React, { useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

interface DropdownItem {
  title: string;
  description: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
  columns?: number;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  columns = 2,
  className = ""
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(180px, auto))`,
  };

  return (
    <div className={`${styles.dropdown} ${className}`} ref={dropdownRef} style={{position: 'absolute', top: '100%', left: 0, zIndex: 9999}}>
      <div className={styles.dropdownGrid} style={gridStyle}>
        {items.map((item, index) => (
          <button
            key={index}
            className={styles.dropdownItem}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.icon && <span className={styles.dropdownIcon}>{item.icon}</span>}
            <div className={styles.dropdownContent}>
              <span className={styles.dropdownTitle}>{item.title}</span>
              <span className={styles.dropdownDescription}>{item.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
