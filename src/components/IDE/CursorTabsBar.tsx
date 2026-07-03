import React from 'react';
import styles from './CursorTabsBar.module.css';

export interface Tab {
  id: string;
  path: string;
  name: string;
  isDirty?: boolean;
}

interface CursorTabsBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string, e: React.MouseEvent) => void;
}

export const CursorTabsBar: React.FC<CursorTabsBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
}) => {
  if (tabs.length === 0) {
    return (
      <div className={styles.tabsBar}>
        <div className={styles.emptyTabs}>No files open</div>
      </div>
    );
  }

  return (
    <div className={styles.tabsBar}>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTabId === tab.id ? styles.active : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className={styles.tabName}>
              {tab.name}
              {tab.isDirty && <span className={styles.dirtyIndicator}>●</span>}
            </span>
            <button
              className={styles.closeButton}
              onClick={(e) => onTabClose(tab.id, e)}
              aria-label={`Close ${tab.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3L11 11M11 3L3 11" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

