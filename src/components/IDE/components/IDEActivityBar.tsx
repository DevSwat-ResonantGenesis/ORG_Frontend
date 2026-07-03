import React, { memo, useCallback } from 'react';
import { useIDE, type ActiveView } from '../context/IDEContext';
import styles from '../CursorIDELayout.module.css';

export const IDEActivityBar = memo(function IDEActivityBar() {
  const { state, dispatch } = useIDE();
  const { activeView } = state;

  const handleViewChange = useCallback((view: ActiveView) => {
    // Toggle behavior: if clicking the same view, go back to files (close the panel)
    if (activeView === view) {
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' });
      return;
    }
    
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
    if (view === 'git') {
      dispatch({ type: 'TOGGLE_GIT_PANEL', payload: true });
    }
    // Search only opens side panel, not command palette popup
    // Command palette is opened via Cmd+P keyboard shortcut
  }, [dispatch, activeView]);

  return (
    <div className={styles.activityBar}>
      {/* Main Navigation Icons */}
      <div className={styles.activityBarTop}>
        {/* Explorer - Files */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'files' ? styles.active : ''}`}
          onClick={() => handleViewChange('files')}
          title="Explorer"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5a1 1 0 011-1h3.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H16a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5z" />
          </svg>
        </button>

        {/* Search */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'search' ? styles.active : ''}`}
          onClick={() => handleViewChange('search')}
          title="Search"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M14 14l3 3" strokeLinecap="round" />
          </svg>
        </button>

        {/* Git / Source Control */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'git' ? styles.active : ''}`}
          onClick={() => handleViewChange('git')}
          title="Source Control"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="4" r="2" />
            <circle cx="10" cy="16" r="2" />
            <circle cx="16" cy="10" r="2" />
            <path d="M10 6v4m0 0h4m-4 0v4" strokeLinecap="round" />
          </svg>
        </button>

        {/* Run / Debug */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'run' ? styles.active : ''}`}
          onClick={() => handleViewChange('run')}
          title="Run & Debug"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l10 6-10 6V4z" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {/* Extensions */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'extensions' ? styles.active : ''}`}
          onClick={() => handleViewChange('extensions')}
          title="Extensions"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="12" y="3" width="5" height="5" rx="1" />
            <rect x="3" y="12" width="5" height="5" rx="1" />
            <rect x="12" y="12" width="5" height="5" rx="1" />
          </svg>
        </button>

        {/* DSID-P Accelerator */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'dsidp' ? styles.active : ''}`}
          onClick={() => handleViewChange('dsidp')}
          title="DSID-P Accelerator"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 2L17 10L10 18L3 10L10 2Z" strokeLinejoin="round" />
            <circle cx="10" cy="10" r="2.5" />
          </svg>
        </button>

        {/* Project Builder */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'builder' ? styles.active : ''}`}
          onClick={() => handleViewChange('builder')}
          title="Project Builder"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l1.3-1.3a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-1.3 1.3z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Bottom Icons */}
      <div className={styles.activityBarBottom}>
        {/* Settings */}
        <button
          className={`${styles.activityBarButton} ${activeView === 'settings' ? styles.active : ''}`}
          onClick={() => handleViewChange('settings')}
          title="Settings"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M17.4 10c0-.3 0-.5-.1-.8l1.8-1.4-2-3.5-2.1.8c-.4-.3-.8-.6-1.3-.8L13.4 2h-4l-.3 2.3c-.5.2-.9.5-1.3.8l-2.1-.8-2 3.5 1.8 1.4c-.1.3-.1.5-.1.8s0 .5.1.8l-1.8 1.4 2 3.5 2.1-.8c.4.3.8.6 1.3.8l.3 2.3h4l.3-2.3c.5-.2.9-.5 1.3-.8l2.1.8 2-3.5-1.8-1.4c.1-.3.1-.5.1-.8z" />
          </svg>
        </button>
      </div>
    </div>
  );
});
