import React, { useState, useRef, useEffect } from 'react';
import { TerminalTabs, type TerminalTab } from './TerminalTabs';
import styles from './CursorTerminalPanel.module.css';

interface CursorTerminalPanelProps {
  initialHeight?: number;
  projectId?: string;
}

export const CursorTerminalPanel: React.FC<CursorTerminalPanelProps> = ({
  initialHeight = 200,
  projectId,
}) => {
  const [visible, setVisible] = useState(true);
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: '1', name: 'Terminal 1', content: '', active: true }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
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

  const handleCommand = async (command: string, tabId: string) => {
    const activeTab = tabs.find(t => t.id === tabId);
    if (!activeTab) return;

    // Append command to terminal output
    const commandLine = `$ ${command}\n`;
    const updatedContent = activeTab.content + commandLine;
    
    setTabs(tabs.map(t => 
      t.id === tabId 
        ? { ...t, content: updatedContent }
        : t
    ));

    // Execute command via backend (if projectId is available)
    if (projectId && command.trim()) {
      try {
        // TODO: Add terminal command execution API endpoint
        // For now, simulate command execution
        const response = await executeTerminalCommand(command, projectId);
        const output = response.output || response.error || '';
        
        setTabs(tabs.map(t => 
          t.id === tabId 
            ? { ...t, content: updatedContent + output + '\n' }
            : t
        ));
      } catch (error: any) {
        const errorMsg = `Error: ${error.message || 'Command execution failed'}\n`;
        setTabs(tabs.map(t => 
          t.id === tabId 
            ? { ...t, content: updatedContent + errorMsg }
            : t
        ));
      }
    } else {
      // Simulate local command (for demo)
      const simulatedOutput = simulateCommand(command);
      setTabs(tabs.map(t => 
        t.id === tabId 
          ? { ...t, content: updatedContent + simulatedOutput + '\n' }
          : t
      ));
    }
  };

  const simulateCommand = (command: string): string => {
    const cmd = command.trim().toLowerCase();
    if (cmd === 'ls' || cmd === 'dir') {
      return 'file1.txt\nfile2.js\nfolder1/\n';
    } else if (cmd === 'pwd') {
      return projectId ? `/projects/${projectId}` : '/';
    } else if (cmd.startsWith('echo ')) {
      return command.substring(5) + '\n';
    } else if (cmd === 'help') {
      return 'Available commands: ls, pwd, echo, help\n';
    }
    return `Command not found: ${command}\n`;
  };

  const executeTerminalCommand = async (command: string, projectId: string): Promise<{ output: string; error?: string }> => {
    try {
      // Call backend API for command execution
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/code/code/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          project_id: projectId,
          command: command,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        output: data.output || data.result || '',
        error: data.error
      };
    } catch (error: any) {
      // Fallback to simulated command if API fails
      const simulatedOutput = simulateCommand(command);
      return {
        output: simulatedOutput,
        error: error.message || 'Command execution failed'
      };
    }
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
        onTabAdd={handleTabAdd}
        onTabClose={handleTabClose}
        onTabSelect={handleTabSelect}
        onCommand={handleCommand}
      />
    </div>
  );
};

