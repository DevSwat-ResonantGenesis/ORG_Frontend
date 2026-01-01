import React, { useState, useEffect, useRef } from 'react';
import styles from './CommandPalette.module.css';
import { FileIcon } from './FileIcon';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  type?: 'command' | 'file';
  path?: string;
}

interface CommandPaletteProps {
  open: boolean;
  mode?: 'command' | 'file'; // 'command' for Cmd+K, 'file' for Cmd+P
  commands: Command[];
  files?: Array<{ path: string; name: string; type: 'file' | 'folder' }>;
  onSelect: (command: Command) => void;
  onClose: () => void;
  placeholder?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  mode = 'command',
  commands,
  files = [],
  onSelect,
  onClose,
  placeholder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Determine placeholder based on mode
  const defaultPlaceholder = mode === 'file' 
    ? 'Type to search files...' 
    : 'Type a command or search...';

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [open, mode]);

  useEffect(() => {
    if (open && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, open]);

  // Build file commands from files list
  const fileCommands: Command[] = files.map(file => ({
    id: `file-${file.path}`,
    label: file.name,
    description: file.path,
    type: 'file' as const,
    path: file.path,
    category: file.type === 'folder' ? 'Folder' : 'File',
    icon: <FileIcon fileName={file.name} />,
  }));

  // Combine commands and files based on mode
  const allItems = mode === 'file' ? fileCommands : [...commands, ...fileCommands];

  const filteredItems = allItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      (item.path && item.path.toLowerCase().includes(query))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      onSelect(filteredItems[selectedIndex]);
      onClose();
    }
  };

  const handleItemClick = (item: Command) => {
    onSelect(item);
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11L15 15" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            autoFocus
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              title="Clear"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3L9 9M9 3L3 9" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {mode === 'file' && (
            <div className={styles.modeIndicator}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2H12V12H2V2Z" />
                <path d="M4 6H10M4 8H8" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>

        <div ref={listRef} className={styles.commandsList}>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{mode === 'file' ? 'No files found' : 'No commands found'}</p>
              <p className={styles.emptyHint}>Try a different search term</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.commandItem} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {item.icon && <span className={styles.commandIcon}>{item.icon}</span>}
                <div className={styles.commandContent}>
                  <div className={styles.commandLabel}>{item.label}</div>
                  {item.description && (
                    <div className={styles.commandDescription}>
                      {item.type === 'file' ? item.path : item.description}
                    </div>
                  )}
                  {item.category && (
                    <div className={styles.commandCategory}>{item.category}</div>
                  )}
                </div>
                {item.shortcut && (
                  <div className={styles.commandShortcut}>
                    {item.shortcut.split('+').map((key, i) => (
                      <span key={i} className={styles.shortcutKey}>
                        {key}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerHint}>
            <span>↑↓</span> Navigate
          </div>
          <div className={styles.footerHint}>
            <span>Enter</span> Select
          </div>
          <div className={styles.footerHint}>
            <span>Esc</span> Close
          </div>
        </div>
      </div>
    </div>
  );
};

