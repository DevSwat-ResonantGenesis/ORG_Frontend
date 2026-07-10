// Terminal Component - the same real, sandboxed interactive shell used by
// the IDE (InteractiveTerminal -> RG_Gateway -> RG_Terminal_Sandbox), reused
// here so the chat split-view terminal is a genuine PTY instead of the old
// log/input UI that posted to the disabled RG_Code_Execution /terminal/execute
// endpoint. A slim status log above it still shows "Run Code"/"Start Preview"
// messages, which are one-shot status lines, not shell input/output.
import React, { useRef, useEffect, useMemo } from 'react';
import { InteractiveTerminal } from '@/components/IDE/InteractiveTerminal';
import { getOrCreateDefaultTerminalId } from '@/components/IDE/terminalSession';
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
  const terminalId = useMemo(() => getOrCreateDefaultTerminalId(projectId), [projectId]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

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
      <InteractiveTerminal terminalId={terminalId} projectId={projectId} visible />
    </div>
  );
};

export default Terminal;
