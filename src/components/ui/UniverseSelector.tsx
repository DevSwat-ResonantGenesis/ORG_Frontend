import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@/components/Icons/ResonantChatIcons';
import styles from './UniverseSelector.module.css';

export interface Universe {
  id: string;
  name: string;
  description?: string;
  anchorSetId?: string;
  isDefault?: boolean;
}

export interface UniverseSelectorProps {
  selectedUniverse: string;
  onUniverseChange: (universeId: string) => void;
  universes?: Universe[];
  className?: string;
}

const defaultUniverses: Universe[] = [
  {
    id: 'default',
    name: 'Default Universe',
    description: 'Standard meaning universe',
    isDefault: true,
  },
];

export const UniverseSelector: React.FC<UniverseSelectorProps> = ({
  selectedUniverse,
  onUniverseChange,
  universes = defaultUniverses,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedUniverseData = universes.find(u => u.id === selectedUniverse) || universes[0];

  const handleSelect = (universeId: string) => {
    onUniverseChange(universeId);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.universeSelector} ${className}`} ref={dropdownRef}>
      <button
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title={`Current universe: ${selectedUniverseData.name}`}
      >
        <span className={styles.selectorIcon}>🌌</span>
        <span className={styles.selectorLabel}>{selectedUniverseData.name}</span>
        <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.universeList}>
            {universes.map((universe) => (
              <button
                key={universe.id}
                className={`${styles.universeOption} ${
                  selectedUniverse === universe.id ? styles.universeOptionActive : ''
                }`}
                onClick={() => handleSelect(universe.id)}
                type="button"
              >
                <div className={styles.universeOptionContent}>
                  <div className={styles.universeOptionHeader}>
                    <span className={styles.universeIcon}>🌌</span>
                    <span className={styles.universeName}>{universe.name}</span>
                    {universe.isDefault && (
                      <span className={styles.defaultBadge}>Default</span>
                    )}
                  </div>
                  {universe.description && (
                    <p className={styles.universeDescription}>{universe.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className={styles.universeActions}>
            <button
              className={styles.actionButton}
              onClick={() => {
                // TODO: Open create universe modal
                setIsOpen(false);
              }}
              type="button"
            >
              + Create New Universe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

