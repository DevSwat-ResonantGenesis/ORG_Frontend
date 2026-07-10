import React, { useState, useRef, useEffect } from 'react';
import { TerminalTabs, type TerminalTab } from './TerminalTabs';
import { storageKeyFor, loadInitialTabs } from './terminalSession';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import styles from './CursorTerminalPanel.module.css';

interface CursorTerminalPanelProps {
  initialHeight?: number;
  projectId?: string;
  files?: Array<{ name: string; path: string; type?: string }>;
  onProjectIdChange?: (projectId: string) => void;
}

export const CursorTerminalPanel: React.FC<CursorTerminalPanelProps> = ({
  initialHeight = 200,
  projectId,
  onProjectIdChange,
}) => {
  const [visible, setVisible] = useState(true);
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [tabs, setTabs] = useState<TerminalTab[]>(() => loadInitialTabs(projectId));
  const [activeTabId, setActiveTabId] = useState<string>(
    () => tabs.find(t => t.active)?.id || tabs[0].id
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKeyFor(projectId), JSON.stringify(tabs));
    } catch {
      // sessionStorage unavailable (private mode, quota) - not fatal, just
      // loses continuity across panel toggles this session.
    }
  }, [tabs, projectId]);

  // Switching workspaces (WorkspaceSwitcher) changes `projectId` after
  // mount - reload this project's own tab set (each workspace has its own
  // terminal_id/tabs, per terminalSession.ts) instead of continuing to
  // show the previous workspace's tabs.
  const loadedProjectIdRef = useRef(projectId);
  useEffect(() => {
    if (loadedProjectIdRef.current === projectId) return;
    loadedProjectIdRef.current = projectId;
    const newTabs = loadInitialTabs(projectId);
    setTabs(newTabs);
    setActiveTabId(newTabs.find(t => t.active)?.id || newTabs[0].id);
  }, [projectId]);

  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeightRef.current + deltaY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  };

  const handleTabAdd = () => {
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

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    const newTabs = tabs.filter(t => t.id !== tabId);
    const wasActive = activeTabId === tabId;
    
    if (wasActive && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
      newTabs[0].active = true;
    }
    
    setTabs(newTabs);
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs(tabs.map(t => ({ ...t, active: t.id === tabId })));
  };

  if (!visible) {
    return (
      <div 
        className={styles.collapsedBar}
        onClick={() => setVisible(true)}
      >
        <span>Terminal ({tabs.length})</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 10L8 6L12 10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={styles.terminalPanel}
      style={{ height: `${height}px` }}
    >
      <div className={styles.resizeHandle} onMouseDown={handleResizeStart} />
      {onProjectIdChange && (
        <div className={styles.workspaceSwitcherRow}>
          <WorkspaceSwitcher activeProjectId={projectId} onSelect={onProjectIdChange} />
        </div>
      )}
      <TerminalTabs
        tabs={tabs}
        projectId={projectId}
        onTabAdd={handleTabAdd}
        onTabClose={handleTabClose}
        onTabSelect={handleTabSelect}
      />
    </div>
  );
};

