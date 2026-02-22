import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Command, ArrowRight, Hash, FileText, Settings, User } from 'lucide-react';

type CommandCategory = 'navigation' | 'action' | 'settings' | 'recent';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category?: CommandCategory;
  icon?: React.ReactNode;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

interface CommandPaletteProps {
  commands: CommandItem[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

const CATEGORY_CONFIG: Record<CommandCategory, {
  label: string;
  icon: React.ReactNode;
}> = {
  navigation: { label: 'Navigation', icon: <ArrowRight size={14} /> },
  action: { label: 'Actions', icon: <Command size={14} /> },
  settings: { label: 'Settings', icon: <Settings size={14} /> },
  recent: { label: 'Recent', icon: <FileText size={14} /> },
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    zIndex: 1000,
  },
  container: {
    width: '100%',
    maxWidth: '560px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  searchIcon: {
    color: '#666',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '1rem',
  },
  shortcutHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  kbd: {
    padding: '0.125rem 0.375rem',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontFamily: 'inherit',
  },
  results: {
    maxHeight: '360px',
    overflowY: 'auto',
    padding: '0.5rem',
  },
  categoryHeader: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.1s',
  },
  itemSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  itemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontSize: '0.875rem',
    color: '#fff',
  },
  itemDescription: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.125rem',
  },
  itemShortcut: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  isOpen,
  onClose,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No commands found',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchDescription = cmd.description?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
      return matchLabel || matchDescription || matchKeywords;
    });
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      const category = cmd.category || 'action';
      if (!groups[category]) groups[category] = [];
      groups[category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const flatCommands = useMemo(() => {
    const flat: CommandItem[] = [];
    Object.values(groupedCommands).forEach((group) => {
      flat.push(...group);
    });
    return flat;
  }, [groupedCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].onSelect();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatCommands, selectedIndex, onClose]);

  const handleSelect = useCallback((cmd: CommandItem) => {
    cmd.onSelect();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  let currentIndex = 0;

  return (
    <div style={styles.overlay} onClick={onClose} className={className}>
      <div
        style={styles.container}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={styles.searchInput}
          />
          <div style={styles.shortcutHint}>
            <kbd style={styles.kbd}>ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        <div ref={resultsRef} style={styles.results}>
          {flatCommands.length === 0 ? (
            <div style={styles.empty}>{emptyMessage}</div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div style={styles.categoryHeader}>
                  {CATEGORY_CONFIG[category as CommandCategory]?.icon}
                  {CATEGORY_CONFIG[category as CommandCategory]?.label || category}
                </div>
                {items.map((cmd) => {
                  const index = currentIndex++;
                  const isSelected = index === selectedIndex;

                  return (
                    <div
                      key={cmd.id}
                      style={{
                        ...styles.item,
                        ...(isSelected ? styles.itemSelected : {}),
                      }}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div style={styles.itemIcon}>
                        {cmd.icon || <Hash size={16} />}
                      </div>
                      <div style={styles.itemContent}>
                        <div style={styles.itemLabel}>{cmd.label}</div>
                        {cmd.description && (
                          <div style={styles.itemDescription}>
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div style={styles.itemShortcut}>
                          {cmd.shortcut.split('+').map((key, i) => (
                            <kbd key={i} style={styles.kbd}>
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div style={styles.footer}>
          <div style={styles.footerHint}>
            <span>
              <kbd style={styles.kbd}>↑</kbd>
              <kbd style={styles.kbd}>↓</kbd> to navigate
            </span>
            <span>
              <kbd style={styles.kbd}>↵</kbd> to select
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for command palette state
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};

export default CommandPalette;
