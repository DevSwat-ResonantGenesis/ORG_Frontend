import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIDE } from '../context/IDEContext';
import { useThemeStore } from '@/store/themeStore';
import styles from '../CursorIDELayout.module.css';

interface IDEToolbarProps {
  onSave?: () => void;
  onUpload?: () => void;
  onScreenshot?: () => void;
  onToggleSplitView?: (mode: 'horizontal' | 'vertical') => void;
  onMenuClick?: () => void;
  hasUnsavedChanges?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export const IDEToolbar = memo(function IDEToolbar({
  onSave,
  onUpload,
  onScreenshot,
  onToggleSplitView,
  onMenuClick,
  hasUnsavedChanges,
  userName = 'User',
  onLogout,
}: IDEToolbarProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useIDE();
  const { theme, toggleTheme } = useThemeStore();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const {
    navigationHistory,
    navigationIndex,
    showChat,
    activeView,
    showFileExplorer,
    showAgentTeams,
  } = state;

  const handleNavigateBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE_BACK' });
  }, [dispatch]);

  const handleNavigateForward = useCallback(() => {
    dispatch({ type: 'NAVIGATE_FORWARD' });
  }, [dispatch]);

  const handleToggleChat = useCallback(() => {
    if (showChat || activeView === 'ai') {
      dispatch({ type: 'TOGGLE_CHAT', payload: false });
      if (activeView === 'ai') {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' });
      }
    } else {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'ai' });
      dispatch({ type: 'TOGGLE_CHAT', payload: true });
    }
  }, [dispatch, showChat, activeView]);

  const handleToggleFileExplorer = useCallback(() => {
    dispatch({ type: 'TOGGLE_FILE_EXPLORER' });
  }, [dispatch]);

  const handleToggleAgentTeams = useCallback(() => {
    dispatch({ type: 'TOGGLE_AGENT_TEAMS' });
  }, [dispatch]);

  const handleOpenSearch = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
    dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: true, mode: 'file' } });
  }, [dispatch]);

  const handleOpenSettings = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'settings' });
  }, [dispatch]);

  const handleSetActiveView = useCallback((view: 'collaboration' | 'deployment') => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, [dispatch]);

  return (
    <div className={styles.toolbar}>
      {/* Left: Home, Burger & File Actions */}
      <div className={styles.toolbarLeft}>
        {/* Home Button */}
        <button
          className={styles.toolbarButton}
          onClick={() => navigate('/')}
          title="Go to Home"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 8L8 2L14 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 7V13C4 13.5 4.5 14 5 14H6.5V10H9.5V14H11C11.5 14 12 13.5 12 13V7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'var(--ide-border)', margin: '0 4px' }} />

        {/* Burger - Toggle Sidebar */}
        <button
          className={`${styles.toolbarButton} ${showFileExplorer ? styles.active : ''}`}
          onClick={handleToggleFileExplorer}
          title="Toggle Sidebar (⌘B)"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4H14M2 8H10M2 12H8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Save */}
        <button 
          className={`${styles.toolbarButton} ${hasUnsavedChanges ? styles.hasChanges : ''}`} 
          onClick={onSave} 
          title="Save (⌘S)"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3V13H13V5L11 3H3Z" />
            <path d="M5 3V6H10V3M5 13V9H11V13" />
          </svg>
        </button>

        {/* Upload */}
        <button 
          className={styles.toolbarButton} 
          onClick={onUpload} 
          title="Upload Project"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 10V2M8 2L5 5M8 2L11 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 10V13C2 13.5 2.5 14 3 14H13C13.5 14 14 13.5 14 13V10" strokeLinecap="round" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'var(--ide-border)', margin: '0 4px' }} />

        {/* Navigation */}
        <button className={styles.toolbarButton} onClick={handleNavigateBack} disabled={navigationIndex <= 0} title="Back">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.toolbarButton} onClick={handleNavigateForward} disabled={navigationIndex >= navigationHistory.length - 1} title="Forward">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Center: Title */}
      <div className={styles.toolbarCenter}>
        <span style={{ fontSize: 11, color: 'var(--ide-text-tertiary)', fontWeight: 500 }}>Resonant IDE</span>
      </div>

      {/* Right: Essential Actions */}
      <div className={styles.toolbarRight}>
        {/* Search */}
        <button className={styles.toolbarButton} onClick={handleOpenSearch} title="Search (⌘P)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="4" />
            <path d="M10 10L14 14" strokeLinecap="round" />
          </svg>
        </button>

        {/* Terminal Toggle */}
        <button 
          className={`${styles.toolbarButton} ${state.showTerminal ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_TERMINAL' })} 
          title="Toggle Terminal (⌘`)"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1" />
            <path d="M5 7L7 9L5 11M9 11H11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Git */}
        <button 
          className={`${styles.toolbarButton} ${state.showGitPanel ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_GIT_PANEL' })} 
          title="Git Panel"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="3" r="2" />
            <circle cx="8" cy="13" r="2" />
            <circle cx="13" cy="8" r="2" />
            <path d="M8 5V11M10 6L11 7" strokeLinecap="round" />
          </svg>
        </button>

        {/* Preview Toggle */}
        <button 
          className={`${styles.toolbarButton} ${state.showPreview ? styles.active : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })} 
          title="Toggle Preview"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <path d="M2 5H14" />
            <circle cx="4" cy="3.5" r="0.5" fill="currentColor" />
            <circle cx="6" cy="3.5" r="0.5" fill="currentColor" />
            <path d="M5 9L7 11L11 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* AI Chat */}
        <button 
          className={`${styles.toolbarButton} ${(showChat || activeView === 'ai') ? styles.active : ''}`} 
          onClick={handleToggleChat} 
          title="AI Chat"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 7C14 10 11.3 12 8 12C7.3 12 6.6 11.9 6 11.7L2 13L3.3 9.7C2.5 8.8 2 7.5 2 6C2 3 4.7 1 8 1C11.3 1 14 3 14 6Z" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'var(--ide-border)', margin: '0 4px' }} />

        {/* Theme Toggle */}
        <button className={styles.toolbarButton} onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          {theme === 'dark' ? (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 2V3M8 13V14M14 8H13M3 8H2M12 4L11 5M5 11L4 12M12 12L11 11M5 5L4 4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 8C14 11 11.5 14 8 14C4.5 14 2 11 2 8C2 5 4.5 2 8 2C5 5 8 11 14 8Z" />
            </svg>
          )}
        </button>

        {/* Account */}
        <div ref={accountRef} style={{ position: 'relative' }}>
          <button className={styles.accountButton} onClick={() => setShowAccountMenu(!showAccountMenu)} title="Account">
            <div className={styles.accountAvatar}>{getInitials(userName)}</div>
            <svg className={styles.accountDropdownIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showAccountMenu && (
            <div className={styles.accountMenu}>
              <div className={styles.accountMenuHeader}>
                <div className={styles.accountMenuAvatar}>{getInitials(userName)}</div>
                <div className={styles.accountMenuInfo}>
                  <div className={styles.accountMenuName}>{userName}</div>
                  <div className={styles.accountMenuEmail}>user@resonant.ai</div>
                </div>
              </div>
              <div className={styles.accountMenuDivider} />
              <button className={styles.accountMenuItem} onClick={() => { navigate('/profile'); setShowAccountMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" strokeLinecap="round" />
                </svg>
                Profile
              </button>
              <button className={styles.accountMenuItem} onClick={() => { navigate('/dashboard'); setShowAccountMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
                Dashboard
              </button>
              <button className={styles.accountMenuItem} onClick={() => { navigate('/resonant-chat'); setShowAccountMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 7C14 10 11.3 12 8 12C7.3 12 6.6 11.9 6 11.7L2 13L3.3 9.7C2.5 8.8 2 7.5 2 6C2 3 4.7 1 8 1C11.3 1 14 3 14 6Z" />
                </svg>
                Resonant Chat
              </button>
              <div className={styles.accountMenuDivider} />
              <button className={styles.accountMenuItem} onClick={() => { dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'settings' }); setShowAccountMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="2" />
                  <path d="M8 2V4M8 12V14M14 8H12M4 8H2M12.5 3.5L11 5M5 11L3.5 12.5M12.5 12.5L11 11M5 5L3.5 3.5" strokeLinecap="round" />
                </svg>
                Settings
              </button>
              <div className={styles.accountMenuDivider} />
              <button className={`${styles.accountMenuItem} ${styles.danger}`} onClick={() => { onLogout ? onLogout() : navigate('/login'); setShowAccountMenu(false); }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2H3C2.5 2 2 2.5 2 3V13C2 13.5 2.5 14 3 14H6M11 11L14 8L11 5M6 8H14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
