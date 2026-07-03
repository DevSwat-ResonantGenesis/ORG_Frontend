/**
 * IDE Dropdown Menu - CLEANED VERSION
 * Contains ONLY functional features
 */
import { isAuthenticated } from '@/utils/auth-cookies';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IDEDropdownMenu.module.css';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  divider?: boolean;
  section?: string;
  shortcut?: string;
}

interface IDEDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // File operations
  onSave?: () => void;
  onUpload?: () => void;
  onDownloadProject?: () => void;
  onRestoreProject?: () => void;
  onTransferOwnership?: () => void;
  // Editor
  onToggleFileExplorer?: () => void;
  onToggleTerminal?: () => void;
  onToggleTheme?: () => void;
  onToggleMinimap?: () => void;
  onToggleWordWrap?: () => void;
  onFormatDocument?: () => void;
  onGoToLine?: () => void;
  onCommandPalette?: () => void;
  // Git (actually working)
  onToggleGit?: () => void;
  // Agent Teams (new, essential)
  onToggleAgentTeams?: () => void;
  // Screenshot (new, essential)
  onScreenshot?: () => void;
  // Search (new, essential)
  onToggleSearch?: () => void;
  // Advanced
  onOpenAdvancedFeature?: (feature: string) => void;
  // State
  showFileExplorer?: boolean;
  showTerminal?: boolean;
  showMinimap?: boolean;
  wordWrap?: boolean;
  showGit?: boolean;
  showAgentTeams?: boolean;
  showSearch?: boolean;
  hasActiveFile?: boolean;
  hasUnsavedChanges?: boolean;
  hasMonacoEditor?: boolean;
  projectId?: string;
  theme?: 'dark' | 'light';
}

export const IDEDropdownMenu: React.FC<IDEDropdownMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpload,
  onDownloadProject,
  onRestoreProject,
  onTransferOwnership,
  onToggleFileExplorer,
  onToggleTerminal,
  onToggleTheme,
  onToggleMinimap,
  onToggleWordWrap,
  onFormatDocument,
  onGoToLine,
  onCommandPalette,
  onToggleGit,
  onToggleAgentTeams,
  onScreenshot,
  onToggleSearch,
  onOpenAdvancedFeature,
  showFileExplorer = true,
  showTerminal = true,
  showMinimap = true,
  wordWrap = false,
  showGit = false,
  showAgentTeams = false,
  showSearch = false,
  hasActiveFile = false,
  hasUnsavedChanges = false,
  hasMonacoEditor = false,
  projectId,
  theme = 'dark',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const menuItems: MenuItem[] = [
    // Navigation
    {
      id: 'nav-home',
      label: 'Home',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8L8 3L13 8M6 8V13H10V8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { navigate('/'); onClose(); },
      section: 'Navigation',
    },
    {
      id: 'nav-chat',
      label: 'Resonant Chat',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2C5 2 2.5 4.5 2.5 7.5C2.5 9.5 3.5 11.2 5 12.2V14.5L7.2 12.2C7.5 12.3 7.8 12.3 8.1 12.3C11.1 12.3 13.5 9.8 13.5 7.5C13.5 4.5 11 2 8 2Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { navigate('/resonant-chat'); onClose(); },
      section: 'Navigation',
    },
    { id: 'divider-1', label: '', icon: null, onClick: () => { }, divider: true },

    // Advanced Features (NEW)
    {
      id: 'adv-collab',
      label: 'Collaboration',
      icon: '🤝',
      onClick: () => { onOpenAdvancedFeature?.('collaboration'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-debug',
      label: 'Debugger',
      icon: '🐛',
      onClick: () => { onOpenAdvancedFeature?.('debugger'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-workspace',
      label: 'Workspace',
      icon: '📦',
      onClick: () => { onOpenAdvancedFeature?.('workspace'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-plugins',
      label: 'Plugins',
      icon: '🔌',
      onClick: () => { onOpenAdvancedFeature?.('plugins'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-ai',
      label: 'AI Dev Agent',
      icon: '🤖',
      onClick: () => { onOpenAdvancedFeature?.('ai-agent'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-graph',
      label: 'Code Graph',
      icon: '📊',
      onClick: () => { onOpenAdvancedFeature?.('code-graph'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-test',
      label: 'Test Generator',
      icon: '🧪',
      onClick: () => { onOpenAdvancedFeature?.('test-gen'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-api',
      label: 'API Inspector',
      icon: '🔍',
      onClick: () => { onOpenAdvancedFeature?.('api-inspector'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-deploy',
      label: 'Deploy',
      icon: '🚀',
      onClick: () => { onOpenAdvancedFeature?.('deploy'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-ast',
      label: 'AST Refactor',
      icon: '🔧',
      onClick: () => { onOpenAdvancedFeature?.('ast-refactor'); onClose(); },
      section: 'Advanced',
    },
    {
      id: 'adv-split',
      label: 'Split Editor',
      icon: '↔️',
      onClick: () => { onOpenAdvancedFeature?.('split-editor'); onClose(); },
      section: 'Advanced',
    },
    { id: 'divider-adv', label: '', icon: null, onClick: () => { }, divider: true },

    // File Operations
    {
      id: 'save',
      label: 'Save File',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3H10L13 6V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V4C3 3.44772 3.44772 3 4 3Z" />
        </svg>
      ),
      onClick: () => { onSave?.(); onClose(); },
      disabled: !hasActiveFile || !hasUnsavedChanges,
      section: 'File',
      shortcut: '⌘S',
    },
    {
      id: 'upload',
      label: 'Upload Project',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 12V4M8 4L5 7M8 4L11 7" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onUpload?.(); onClose(); },
      section: 'File',
    },
    {
      id: 'download',
      label: 'Download Project',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 4V12M8 12L5 9M8 12L11 9" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onDownloadProject?.(); onClose(); },
      disabled: !projectId,
      section: 'File',
    },
    { id: 'divider-2', label: '', icon: null, onClick: () => { }, divider: true },

    // Edit
    {
      id: 'command-palette',
      label: 'Command Palette',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="1" />
          <path d="M5 6H11M5 10H11" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onCommandPalette?.(); onClose(); },
      section: 'Edit',
      shortcut: '⌘K',
    },
    {
      id: 'search',
      label: 'Search & Replace',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11L14 14" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onToggleSearch?.(); onClose(); },
      active: showSearch,
      section: 'Edit',
      shortcut: '⌘F',
    },
    {
      id: 'format',
      label: 'Format Document',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4H12M4 8H12M4 12H8" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onFormatDocument?.(); onClose(); },
      disabled: !hasMonacoEditor,
      section: 'Edit',
      shortcut: '⇧⌥F',
    },
    {
      id: 'goto-line',
      label: 'Go to Line',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2L14 8L8 14M2 8H14" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onGoToLine?.(); onClose(); },
      disabled: !hasMonacoEditor,
      section: 'Edit',
      shortcut: '⌘G',
    },
    { id: 'divider-3', label: '', icon: null, onClick: () => { }, divider: true },

    // View
    {
      id: 'file-explorer',
      label: 'File Explorer',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3H7L9 5H13C13.5523 5 14 5.44772 14 6V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V4C2 3.44772 2.44772 3 3 3Z" />
        </svg>
      ),
      onClick: () => { onToggleFileExplorer?.(); onClose(); },
      active: showFileExplorer,
      section: 'View',
      shortcut: '⌘B',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <path d="M5 7L7 9L5 11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { onToggleTerminal?.(); onClose(); },
      active: showTerminal,
      section: 'View',
      shortcut: '⌃`',
    },
    {
      id: 'git',
      label: 'Git Panel',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      ),
      onClick: () => { onToggleGit?.(); onClose(); },
      active: showGit,
      section: 'View',
    },
    {
      id: 'agent-teams',
      label: 'Agent Teams',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="5" cy="5" r="2.5" />
          <circle cx="11" cy="5" r="2.5" />
          <path d="M2 13C2 11 3.5 9.5 5 9.5C6.5 9.5 8 11 8 13M8 13C8 11 9.5 9.5 11 9.5C12.5 9.5 14 11 14 13" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onToggleAgentTeams?.(); onClose(); },
      active: showAgentTeams,
      section: 'View',
    },
    {
      id: 'minimap',
      label: 'Toggle Minimap',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="1" />
        </svg>
      ),
      onClick: () => { onToggleMinimap?.(); onClose(); },
      active: showMinimap,
      section: 'View',
    },
    {
      id: 'word-wrap',
      label: 'Toggle Word Wrap',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4H14M2 8H14M2 12H8" strokeLinecap="round" />
        </svg>
      ),
      onClick: () => { onToggleWordWrap?.(); onClose(); },
      active: wordWrap,
      section: 'View',
    },
    {
      id: 'theme',
      label: `Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`,
      icon: (
        theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="4" />
            <path d="M8 2V4M8 12V14M14 8H12M4 8H2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2C4.5 2 2 4.5 2 8C2 11.5 4.5 14 8 14C11.5 14 14 11.5 14 8" strokeLinecap="round" />
          </svg>
        )
      ),
      onClick: () => { onToggleTheme?.(); onClose(); },
      section: 'View',
    },
    { id: 'divider-4', label: '', icon: null, onClick: () => { }, divider: true },

    // Tools
    {
      id: 'screenshot',
      label: 'Take Screenshot',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="4" width="12" height="9" rx="1" />
          <circle cx="8" cy="8.5" r="2" />
          <path d="M6 4L7 2H9L10 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { onScreenshot?.(); onClose(); },
      section: 'Tools',
    },
    { id: 'divider-5', label: '', icon: null, onClick: () => { }, divider: true },

    // Project
    {
      id: 'restore',
      label: 'Restore Project',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4H10C11.6569 4 13 5.34315 13 7V8C13 9.65685 11.6569 11 10 11H3M3 11L6 8M3 11L6 14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { onRestoreProject?.(); onClose(); },
      section: 'Project',
    },
    {
      id: 'transfer',
      label: 'Transfer Ownership',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2L14 8L8 14M2 8H14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      onClick: () => { onTransferOwnership?.(); onClose(); },
      disabled: !projectId,
      section: 'Project',
    },
    { id: 'divider-6', label: '', icon: null, onClick: () => { }, divider: true },

    // Account
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      ),
      onClick: () => { navigate('/dashboard'); onClose(); },
      disabled: !isLoggedIn,
      section: 'Account',
    },
  ];

  // Group items by section
  const groupedItems = menuItems.reduce((acc, item) => {
    if (item.divider) {
      acc.push({ type: 'divider', items: [] });
    } else {
      const section = item.section || 'Other';
      const lastGroup = acc[acc.length - 1];
      if (lastGroup && lastGroup.type === 'section' && lastGroup.section === section) {
        lastGroup.items.push(item);
      } else {
        acc.push({ type: 'section', section, items: [item] });
      }
    }
    return acc;
  }, [] as Array<{ type: 'section' | 'divider'; section?: string; items: MenuItem[] }>);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`${styles.menu} ${isOpen ? styles.open : ''}`}
    >
      <div className={styles.menuContent}>
        <div className={styles.menuHeader}>
          <h3 className={styles.menuTitle}>IDE Menu</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.menuList}>
          {groupedItems.map((group, groupIdx) => {
            if (group.type === 'divider') {
              return <div key={`divider-${groupIdx}`} className={styles.divider} />;
            }

            const uniqueKey = `${group.section || 'other'}-${groupIdx}`;

            return (
              <div key={uniqueKey} className={styles.section}>
                {group.section && (
                  <div className={styles.sectionTitle}>{group.section}</div>
                )}
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    className={`${styles.menuItem} ${item.active ? styles.active : ''}`}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    title={item.label}
                  >
                    {item.icon && <span className={styles.menuItemIcon}>{item.icon}</span>}
                    <span className={styles.menuItemLabel}>{item.label}</span>
                    {item.shortcut && (
                      <span className={styles.shortcut}>{item.shortcut}</span>
                    )}
                    {item.active && (
                      <span className={styles.activeIndicator}>●</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
