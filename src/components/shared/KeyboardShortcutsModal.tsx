import React, { useEffect, useState, useCallback } from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['G', 'H'], description: 'Go to Home' },
      { keys: ['G', 'A'], description: 'Go to Agent Studio' },
      { keys: ['G', 'M'], description: 'Go to Marketplace' },
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
    ],
  },
  {
    title: 'Agent Studio',
    shortcuts: [
      { keys: ['N'], description: 'Create new agent' },
      { keys: ['←', '→'], description: 'Navigate wizard steps' },
      { keys: ['Enter'], description: 'Proceed to next step' },
      { keys: ['Esc'], description: 'Cancel / Close modal' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { keys: ['?'], description: 'Show help' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
      { keys: ['⌘', 'S'], description: 'Save changes' },
      { keys: ['⌘', 'Z'], description: 'Undo' },
    ],
  },
];

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#1a1a24',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  content: {
    padding: '1.5rem',
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 80px)',
  },
  group: {
    marginBottom: '1.5rem',
  },
  groupTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#6366f1',
    marginBottom: '0.75rem',
  },
  shortcutRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  description: {
    color: '#ccc',
    fontSize: '0.875rem',
  },
  keys: {
    display: 'flex',
    gap: '0.25rem',
  },
  key: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    height: '28px',
    padding: '0 0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#666',
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#888',
  },
};

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <Keyboard size={24} />
            Keyboard Shortcuts
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.content}>
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} style={styles.group}>
              <div style={styles.groupTitle}>{group.title}</div>
              {group.shortcuts.map((shortcut, idx) => (
                <div key={idx} style={styles.shortcutRow}>
                  <span style={styles.description}>{shortcut.description}</span>
                  <div style={styles.keys}>
                    {shortcut.keys.map((key, keyIdx) => (
                      <span key={keyIdx} style={styles.key}>
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <span style={styles.footerText}>
            Press <span style={styles.key}>?</span> or{' '}
            <span style={styles.key}>⌘</span>
            <span style={styles.key}>/</span> to toggle this modal
          </span>
          <span style={styles.footerHint}>
            <Command size={14} />
            macOS shortcuts shown
          </span>
        </div>
      </div>
    </div>
  );
};

// Hook to manage keyboard shortcuts modal state
export const useKeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Global keyboard shortcut to open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // ? key or Cmd+/ to toggle
      if (e.key === '?' || (e.metaKey && e.key === '/')) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return { isOpen, open, close, toggle };
};

export default KeyboardShortcutsModal;
