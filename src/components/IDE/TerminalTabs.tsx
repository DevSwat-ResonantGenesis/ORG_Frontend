import React, { useState, useEffect } from 'react';
import styles from './TerminalTabs.module.css';
import { InteractiveTerminal } from './InteractiveTerminal';

export interface TerminalTab {
  id: string;
  name: string;
  content: string;
  active?: boolean;
}

interface TerminalTabsProps {
  tabs?: TerminalTab[];
  projectId?: string;
  onTabAdd?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSelect?: (tabId: string) => void;
}

export const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs: initialTabs,
  projectId,
  onTabAdd,
  onTabClose,
  onTabSelect,
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>(
    Array.isArray(initialTabs) ? initialTabs : [{ id: '1', name: 'Terminal 1', content: '', active: true }]
  );
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '1');

  // Use parent tabs if provided, otherwise use internal state
  const safeInitialTabs = Array.isArray(initialTabs) ? initialTabs : undefined;
  const displayTabs = safeInitialTabs || tabs;
  const displayActiveTabId = safeInitialTabs
    ? (safeInitialTabs.find(t => t.active)?.id || safeInitialTabs[0]?.id || '1')
    : activeTabId;

  // Sync with parent tabs if provided
  useEffect(() => {
    if (Array.isArray(initialTabs) && initialTabs.length > 0) {
      setTabs(initialTabs);
      const activeTab = initialTabs.find(t => t.active) || initialTabs[0];
      setActiveTabId(activeTab.id);
    }
  }, [initialTabs]);

  const addTab = () => {
    if (onTabAdd) {
      onTabAdd();
      return;
    }

    const newId = crypto.randomUUID();
    const newTab: TerminalTab = {
      id: newId,
      name: `Terminal ${tabs.length + 1}`,
      content: '',
      active: false,
    };
    setTabs([...tabs.map(t => ({ ...t, active: false })), newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    if (onTabClose) {
      onTabClose(tabId);
      return;
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    const wasActive = activeTabId === tabId;

    if (wasActive && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      newTabs[0].active = true;
    }

    setTabs(newTabs);
  };

  const selectTab = (tabId: string) => {
    if (onTabSelect) {
      onTabSelect(tabId);
      return;
    }

    setActiveTabId(tabId);
    setTabs(tabs.map(t => ({ ...t, active: t.id === tabId })));
  };

  return (
    <div className={styles.terminalContainer}>
      {/* Tabs */}
      <div className={styles.tabsBar}>
        {displayTabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${tab.id === displayActiveTabId ? styles.activeTab : ''}`}
            onClick={() => selectTab(tab.id)}
          >
            <span className={styles.tabName}>{tab.name}</span>
            {displayTabs.length > 1 && (
              <button
                className={styles.closeTabButton}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                title="Close tab"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2L8 8M8 2L2 8" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          className={styles.addTabButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addTab();
          }}
          title="New Terminal"
          aria-label="Add new terminal tab"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2V12M2 7H12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Terminal Content - one real interactive shell per tab, in its own
          sandboxed container. All tabs stay mounted (just hidden) so their
          sessions and scrollback survive switching between them. */}
      <div className={styles.terminalContent}>
        {displayTabs.map((tab) => (
          <InteractiveTerminal
            key={tab.id}
            terminalId={tab.id}
            projectId={projectId}
            visible={tab.id === displayActiveTabId}
          />
        ))}
      </div>
    </div>
  );
};

