import React, { useState, useEffect, useRef } from 'react';
import styles from './TerminalTabs.module.css';

export interface TerminalTab {
  id: string;
  name: string;
  content: string;
  active?: boolean;
}

interface TerminalTabsProps {
  tabs?: TerminalTab[];
  onTabAdd?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSelect?: (tabId: string) => void;
  onCommand?: (command: string, tabId: string) => void;
}

export const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs: initialTabs,
  onTabAdd,
  onTabClose,
  onTabSelect,
  onCommand,
}) => {
  const [tabs, setTabs] = useState<TerminalTab[]>(
    Array.isArray(initialTabs) ? initialTabs : [{ id: '1', name: 'Terminal 1', content: '> ', active: true }]
  );
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '1');
  const [commandInputs, setCommandInputs] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Don't auto-focus terminal input - only focus when user explicitly clicks on terminal
  // Removed auto-focus to prevent stealing focus from chat input

  const addTab = () => {
    if (onTabAdd) {
      onTabAdd();
      return;
    }

    const newId = crypto.randomUUID();
    const newTab: TerminalTab = {
      id: newId,
      name: `Terminal ${tabs.length + 1}`,
      content: '> ',
      active: false,
    };
    setTabs([...tabs.map(t => ({ ...t, active: false })), newTab]);
    setActiveTabId(newId);
    setCommandInputs(prev => ({ ...prev, [newId]: '' }));
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
    setCommandInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[tabId];
      return newInputs;
    });
  };

  const selectTab = (tabId: string) => {
    if (onTabSelect) {
      onTabSelect(tabId);
      return;
    }

    setActiveTabId(tabId);
    setTabs(tabs.map(t => ({ ...t, active: t.id === tabId })));
  };

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>, tabId: string) => {
    if (e.key === 'Enter') {
      const command = commandInputs[tabId] || '';
      if (command.trim()) {
        if (onCommand) {
          onCommand(command, tabId);
        } else {
          // Default behavior: append command to content
          setTabs(tabs.map(t => 
            t.id === tabId 
              ? { ...t, content: `${t.content}${command}\n> ` }
              : t
          ));
        }
        setCommandInputs(prev => ({ ...prev, [tabId]: '' }));
        // Don't auto-refocus - let user click to focus if needed
      }
    }
  };

  const activeTab = displayTabs.find(t => t.id === displayActiveTabId);

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

      {/* Terminal Content */}
      <div 
        className={styles.terminalContent}
        onClick={(e) => {
          // Only focus input if clicking directly on the input area, not when clicking elsewhere
          if (e.target === inputRef.current || (e.target as HTMLElement).closest(`.${styles.terminalInput}`)) {
            inputRef.current?.focus();
          }
        }}
      >
        <div className={styles.terminalOutput}>
          <pre className={styles.outputText}>{activeTab?.content || ''}</pre>
        </div>
        <div className={styles.terminalInput}>
          <span className={styles.prompt}>{'> '}</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.commandInput}
            value={commandInputs[displayActiveTabId] || ''}
            onChange={(e) => setCommandInputs(prev => ({ ...prev, [displayActiveTabId]: e.target.value }))}
            onKeyDown={(e) => handleCommand(e, displayActiveTabId)}
            onFocus={(e) => e.target.select()}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
            }}
            placeholder="Type a command..."
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
};

