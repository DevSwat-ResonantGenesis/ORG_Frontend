// ============== KEYBOARD SHORTCUTS MODAL ==============
// Display and manage keyboard shortcuts

import React, { memo, useState, useCallback, useEffect } from 'react';
import styles from './KeyboardShortcuts.module.css';

interface Shortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: Shortcut[];
  onShortcutEdit?: (id: string, newKeys: string[]) => void;
}

const defaultShortcuts: Shortcut[] = [
  // General
  { id: 'command-palette', keys: ['⌘', 'K'], description: 'Open Command Palette', category: 'General' },
  { id: 'settings', keys: ['⌘', ','], description: 'Open Settings', category: 'General' },
  { id: 'keyboard-shortcuts', keys: ['⌘', 'K', 'S'], description: 'Keyboard Shortcuts', category: 'General' },
  
  // File
  { id: 'new-file', keys: ['⌘', 'N'], description: 'New File', category: 'File' },
  { id: 'open-file', keys: ['⌘', 'O'], description: 'Open File', category: 'File' },
  { id: 'save', keys: ['⌘', 'S'], description: 'Save', category: 'File' },
  { id: 'save-all', keys: ['⌘', '⇧', 'S'], description: 'Save All', category: 'File' },
  { id: 'close-tab', keys: ['⌘', 'W'], description: 'Close Tab', category: 'File' },
  
  // Edit
  { id: 'undo', keys: ['⌘', 'Z'], description: 'Undo', category: 'Edit' },
  { id: 'redo', keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'Edit' },
  { id: 'cut', keys: ['⌘', 'X'], description: 'Cut', category: 'Edit' },
  { id: 'copy', keys: ['⌘', 'C'], description: 'Copy', category: 'Edit' },
  { id: 'paste', keys: ['⌘', 'V'], description: 'Paste', category: 'Edit' },
  { id: 'find', keys: ['⌘', 'F'], description: 'Find', category: 'Edit' },
  { id: 'replace', keys: ['⌘', 'H'], description: 'Replace', category: 'Edit' },
  { id: 'find-in-files', keys: ['⌘', '⇧', 'F'], description: 'Find in Files', category: 'Edit' },
  
  // View
  { id: 'toggle-sidebar', keys: ['⌘', 'B'], description: 'Toggle Sidebar', category: 'View' },
  { id: 'toggle-terminal', keys: ['⌘', '`'], description: 'Toggle Terminal', category: 'View' },
  { id: 'toggle-panel', keys: ['⌘', 'J'], description: 'Toggle Panel', category: 'View' },
  { id: 'zoom-in', keys: ['⌘', '+'], description: 'Zoom In', category: 'View' },
  { id: 'zoom-out', keys: ['⌘', '-'], description: 'Zoom Out', category: 'View' },
  
  // Navigate
  { id: 'go-to-file', keys: ['⌘', 'P'], description: 'Go to File', category: 'Navigate' },
  { id: 'go-to-line', keys: ['⌘', 'G'], description: 'Go to Line', category: 'Navigate' },
  { id: 'go-to-symbol', keys: ['⌘', '⇧', 'O'], description: 'Go to Symbol', category: 'Navigate' },
  { id: 'go-to-definition', keys: ['F12'], description: 'Go to Definition', category: 'Navigate' },
  { id: 'peek-definition', keys: ['⌥', 'F12'], description: 'Peek Definition', category: 'Navigate' },
  
  // Run & Debug
  { id: 'run', keys: ['F5'], description: 'Start/Continue', category: 'Run & Debug' },
  { id: 'run-without-debug', keys: ['⌃', 'F5'], description: 'Run Without Debugging', category: 'Run & Debug' },
  { id: 'stop', keys: ['⇧', 'F5'], description: 'Stop', category: 'Run & Debug' },
  { id: 'step-over', keys: ['F10'], description: 'Step Over', category: 'Run & Debug' },
  { id: 'step-into', keys: ['F11'], description: 'Step Into', category: 'Run & Debug' },
  { id: 'toggle-breakpoint', keys: ['F9'], description: 'Toggle Breakpoint', category: 'Run & Debug' },
  
  // AI
  { id: 'ai-chat', keys: ['⌘', 'I'], description: 'Open AI Chat', category: 'AI' },
  { id: 'ai-explain', keys: ['⌘', '⇧', 'E'], description: 'Explain Code', category: 'AI' },
  { id: 'ai-refactor', keys: ['⌘', '⇧', 'R'], description: 'Refactor with AI', category: 'AI' },
  { id: 'ai-generate-tests', keys: ['⌘', '⇧', 'T'], description: 'Generate Tests', category: 'AI' },
];

const KeyboardShortcutsComponent: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose,
  shortcuts = defaultShortcuts,
  onShortcutEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setEditingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      const keys: string[] = [];
      
      if (e.metaKey) keys.push('⌘');
      if (e.ctrlKey) keys.push('⌃');
      if (e.altKey) keys.push('⌥');
      if (e.shiftKey) keys.push('⇧');
      
      const key = e.key.toUpperCase();
      if (!['META', 'CONTROL', 'ALT', 'SHIFT'].includes(key)) {
        keys.push(key === ' ' ? 'Space' : key);
      }
      
      setRecordedKeys(keys);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId]);

  const startEditing = useCallback((id: string) => {
    setEditingId(id);
    setRecordedKeys([]);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && recordedKeys.length > 0) {
      onShortcutEdit?.(editingId, recordedKeys);
    }
    setEditingId(null);
    setRecordedKeys([]);
  }, [editingId, recordedKeys, onShortcutEdit]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setRecordedKeys([]);
  }, []);

  const filteredShortcuts = shortcuts.filter(s =>
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedShortcuts = filteredShortcuts.reduce<Record<string, Shortcut[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⌨️ Keyboard Shortcuts</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.search}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.content}>
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.shortcuts}>
                {categoryShortcuts.map(shortcut => (
                  <div key={shortcut.id} className={styles.shortcut}>
                    <span className={styles.description}>{shortcut.description}</span>
                    {editingId === shortcut.id ? (
                      <div className={styles.editing}>
                        <div className={styles.recordedKeys}>
                          {recordedKeys.length > 0 
                            ? recordedKeys.map((k, i) => <kbd key={i}>{k}</kbd>)
                            : <span className={styles.hint}>Press keys...</span>
                          }
                        </div>
                        <button className={styles.saveBtn} onClick={saveEdit}>✓</button>
                        <button className={styles.cancelBtn} onClick={cancelEdit}>×</button>
                      </div>
                    ) : (
                      <div 
                        className={styles.keys}
                        onClick={() => onShortcutEdit && startEditing(shortcut.id)}
                        title={onShortcutEdit ? 'Click to edit' : undefined}
                      >
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i}>{key}</kbd>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredShortcuts.length === 0 && (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>No shortcuts found</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerHint}>
            Press <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export const KeyboardShortcuts = memo(KeyboardShortcutsComponent);
export default KeyboardShortcuts;
