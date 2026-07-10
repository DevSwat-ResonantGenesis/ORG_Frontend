import React, { useState, useRef, useEffect } from 'react';
import { TerminalTabs, type TerminalTab } from './TerminalTabs';
import styles from './CursorTerminalPanel.module.css';

interface CursorTerminalPanelProps {
  initialHeight?: number;
  projectId?: string;
  files?: Array<{ name: string; path: string; type?: string }>;
}

// Terminal ownership is keyed only by terminal_id, not user_id+terminal_id
// (see RG_Terminal_Sandbox/app/docker_manager.py's container_name_for), so a
// hardcoded literal like "1" would be a single globally-shared container
// name across every user on the platform - the first user to ever open a
// terminal "owns" it forever and everyone else gets rejected. Persist a
// randomly generated id in sessionStorage (keyed per project, per tab) so
// toggling the terminal panel closed/open within the same browser session
// reconnects to the same container instead of generating a fresh id (and
// abandoning the old one) on every remount.
const storageKeyFor = (projectId?: string) => `ide-terminal-tabs-${projectId || 'default'}`;

const loadInitialTabs = (projectId?: string): TerminalTab[] => {
  try {
    const raw = sessionStorage.getItem(storageKeyFor(projectId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through to a fresh tab
  }
  return [{ id: crypto.randomUUID(), name: 'Terminal 1', content: '', active: true }];
};

export const CursorTerminalPanel: React.FC<CursorTerminalPanelProps> = ({
  initialHeight = 200,
  projectId,
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

