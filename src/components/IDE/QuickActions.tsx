// ============== QUICK ACTIONS COMMAND PALETTE ==============
// VS Code-style command palette with fuzzy search

import React, { memo, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import styles from './QuickActions.module.css';

interface Action {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  actions?: Action[];
  placeholder?: string;
  recentActions?: string[];
  onActionExecuted?: (actionId: string) => void;
}

const defaultActions: Action[] = [
  { id: 'new-file', label: 'New File', icon: '📄', shortcut: '⌘N', category: 'File', action: () => {} },
  { id: 'open-file', label: 'Open File', icon: '📂', shortcut: '⌘O', category: 'File', action: () => {} },
  { id: 'save-file', label: 'Save File', icon: '💾', shortcut: '⌘S', category: 'File', action: () => {} },
  { id: 'save-all', label: 'Save All', icon: '💾', shortcut: '⌘⇧S', category: 'File', action: () => {} },
  { id: 'find', label: 'Find in File', icon: '🔍', shortcut: '⌘F', category: 'Edit', action: () => {} },
  { id: 'find-replace', label: 'Find and Replace', icon: '🔄', shortcut: '⌘H', category: 'Edit', action: () => {} },
  { id: 'goto-line', label: 'Go to Line', icon: '↓', shortcut: '⌘G', category: 'Navigate', action: () => {} },
  { id: 'goto-symbol', label: 'Go to Symbol', icon: '⚡', shortcut: '⌘⇧O', category: 'Navigate', action: () => {} },
  { id: 'run-code', label: 'Run Code', icon: '▶️', shortcut: '⌘⏎', category: 'Run', action: () => {} },
  { id: 'debug', label: 'Start Debugging', icon: '🐛', shortcut: 'F5', category: 'Run', action: () => {} },
  { id: 'terminal', label: 'Toggle Terminal', icon: '💻', shortcut: '⌘`', category: 'View', action: () => {} },
  { id: 'sidebar', label: 'Toggle Sidebar', icon: '📋', shortcut: '⌘B', category: 'View', action: () => {} },
  { id: 'settings', label: 'Open Settings', icon: '⚙️', shortcut: '⌘,', category: 'Preferences', action: () => {} },
  { id: 'themes', label: 'Color Theme', icon: '🎨', category: 'Preferences', action: () => {} },
  { id: 'git-commit', label: 'Git: Commit', icon: '📦', category: 'Git', action: () => {} },
  { id: 'git-push', label: 'Git: Push', icon: '⬆️', category: 'Git', action: () => {} },
  { id: 'git-pull', label: 'Git: Pull', icon: '⬇️', category: 'Git', action: () => {} },
  { id: 'agent-chat', label: 'Open Agent Chat', icon: '🤖', category: 'AI', action: () => {} },
  { id: 'agent-explain', label: 'AI: Explain Code', icon: '💡', category: 'AI', action: () => {} },
  { id: 'agent-refactor', label: 'AI: Refactor Code', icon: '✨', category: 'AI', action: () => {} },
  { id: 'agent-test', label: 'AI: Generate Tests', icon: '🧪', category: 'AI', action: () => {} },
];

const QuickActionsComponent: React.FC<QuickActionsProps> = ({
  isOpen,
  onClose,
  actions = defaultActions,
  placeholder = 'Type a command or search...',
  recentActions = [],
  onActionExecuted,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const fuzzyMatch = useCallback((text: string, pattern: string): boolean => {
    if (!pattern) return true;
    pattern = pattern.toLowerCase();
    text = text.toLowerCase();
    
    let patternIdx = 0;
    for (let i = 0; i < text.length && patternIdx < pattern.length; i++) {
      if (text[i] === pattern[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === pattern.length;
  }, []);

  const filteredActions = useMemo(() => {
    const filtered = actions.filter(action => 
      !action.disabled && (
        fuzzyMatch(action.label, query) ||
        fuzzyMatch(action.category || '', query) ||
        fuzzyMatch(action.description || '', query)
      )
    );

    // Sort by recent usage
    filtered.sort((a, b) => {
      const aRecent = recentActions.indexOf(a.id);
      const bRecent = recentActions.indexOf(b.id);
      if (aRecent !== -1 && bRecent === -1) return -1;
      if (bRecent !== -1 && aRecent === -1) return 1;
      if (aRecent !== -1 && bRecent !== -1) return aRecent - bRecent;
      return 0;
    });

    return filtered;
  }, [actions, query, recentActions, fuzzyMatch]);

  const groupedActions = useMemo(() => {
    const groups: Record<string, Action[]> = {};
    
    filteredActions.forEach(action => {
      const category = action.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(action);
    });

    return groups;
  }, [filteredActions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const action = filteredActions[selectedIndex];
      if (action) {
        executeAction(action);
      }
    }
  }, [filteredActions, selectedIndex]);

  const executeAction = useCallback((action: Action) => {
    action.action();
    onActionExecuted?.(action.id);
    onClose();
  }, [onActionExecuted, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={e => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className={styles.hint}>ESC to close</span>
        </div>

        <div className={styles.results} ref={listRef}>
          {filteredActions.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>No commands found</p>
              <small>Try a different search</small>
            </div>
          ) : (
            Object.entries(groupedActions).map(([category, categoryActions]) => (
              <div key={category} className={styles.group}>
                <div className={styles.groupTitle}>{category}</div>
                {categoryActions.map(action => {
                  const currentIndex = flatIndex++;
                  return (
                    <div
                      key={action.id}
                      data-index={currentIndex}
                      className={`${styles.item} ${currentIndex === selectedIndex ? styles.selected : ''}`}
                      onClick={() => executeAction(action)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className={styles.itemIcon}>{action.icon}</span>
                      <div className={styles.itemContent}>
                        <span className={styles.itemLabel}>{action.label}</span>
                        {action.description && (
                          <span className={styles.itemDesc}>{action.description}</span>
                        )}
                      </div>
                      {action.shortcut && (
                        <span className={styles.shortcut}>{action.shortcut}</span>
                      )}
                      {recentActions.includes(action.id) && (
                        <span className={styles.recentBadge}>Recent</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </span>
          <span className={styles.footerHint}>
            <kbd>↵</kbd> to select
          </span>
          <span className={styles.footerHint}>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export const QuickActions = memo(QuickActionsComponent);
export default QuickActions;
