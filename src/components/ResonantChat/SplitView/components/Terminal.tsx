// Terminal Component - the same real, sandboxed interactive shell used by
// the IDE (TerminalTabs -> InteractiveTerminal -> RG_Gateway ->
// RG_Terminal_Sandbox), reused here so the chat split-view terminal is a
// genuine PTY instead of the old log/input UI that posted to the disabled
// RG_Code_Execution /terminal/execute endpoint. Supports multiple tabs, same
// as the IDE's terminal panel - previously this only ever rendered one
// fixed InteractiveTerminal with no tab management at all.
import React, { useRef, useEffect, useState } from 'react';
import { TerminalTabs, type TerminalTab as TerminalTabType } from '@/components/IDE/TerminalTabs';
import { storageKeyFor, loadInitialTabs } from '@/components/IDE/terminalSession';
import type { TerminalOutput } from '../types';
import styles from '../EnhancedSplitView.module.css';

interface TerminalProps {
  output: TerminalOutput[];
  isRunning: boolean;
  onClear?: () => void;
  projectId?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  output,
  isRunning,
  onClear,
  projectId,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const [tabs, setTabs] = useState<TerminalTabType[]>(() => loadInitialTabs(projectId));

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKeyFor(projectId), JSON.stringify(tabs));
    } catch {
      // sessionStorage unavailable (private mode, quota) - not fatal, just
      // loses continuity across panel toggles this session.
    }
  }, [tabs, projectId]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleTabAdd = () => {
    const newTab: TerminalTabType = {
      id: crypto.randomUUID(),
      name: `Terminal ${tabs.length + 1}`,
      content: '',
      active: false,
    };
    setTabs([...tabs.map((t) => ({ ...t, active: false })), newTab]);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;
    const wasActive = tabs.find((t) => t.id === tabId)?.active;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (wasActive && newTabs.length > 0) newTabs[0].active = true;
    setTabs(newTabs);
  };

  const handleTabSelect = (tabId: string) => {
    setTabs(tabs.map((t) => ({ ...t, active: t.id === tabId })));
  };

  const getOutputClassName = (type: TerminalOutput['type']) => {
    switch (type) {
      case 'stderr':
        return styles.terminalError;
      case 'info':
        return styles.terminalInfo;
      case 'command':
        return styles.terminalCommand;
      default:
        return '';
    }
  };

  return (
    <div className={styles.terminalTabContent}>
      <div className={styles.terminalToolbar}>
        <span className={styles.terminalTitle}>Terminal</span>
        {onClear && (
          <button
            className={styles.terminalClearButton}
            onClick={onClear}
            title="Clear status log"
          >
            Clear
          </button>
        )}
      </div>
      {(output.length > 0 || isRunning) && (
        <div className={styles.terminalOutput} ref={outputRef}>
          {output.map((line) => (
            <div
              key={line.id}
              className={`${styles.terminalLine} ${getOutputClassName(line.type)}`}
            >
              {line.type === 'command' && <span className={styles.terminalPromptInline}>$ </span>}
              {line.content}
            </div>
          ))}
          {isRunning && (
            <div className={styles.terminalLine}>
              <span className={styles.terminalSpinner}>⏳</span> Running...
            </div>
          )}
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

export default Terminal;
