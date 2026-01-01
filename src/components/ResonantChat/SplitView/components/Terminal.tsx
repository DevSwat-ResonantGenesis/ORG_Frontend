// Terminal Component - Interactive terminal for command execution

import React, { useRef, useEffect } from 'react';
import type { TerminalOutput } from '../types';
import styles from '../EnhancedSplitView.module.css';

interface TerminalProps {
  output: TerminalOutput[];
  input: string;
  isRunning: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  output,
  input,
  isRunning,
  onInputChange,
  onSubmit,
  onClear,
  disabled = false,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear?.();
    }
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
            title="Clear terminal (Ctrl+L)"
          >
            Clear
          </button>
        )}
      </div>
      <div className={styles.terminalOutput} ref={outputRef}>
        {output.length === 0 ? (
          <div className={styles.terminalWelcome}>
            <p>Welcome to the terminal</p>
            <p className={styles.terminalHint}>Type a command and press Enter</p>
          </div>
        ) : (
          output.map((line) => (
            <div
              key={line.id}
              className={`${styles.terminalLine} ${getOutputClassName(line.type)}`}
            >
              {line.type === 'command' && <span className={styles.terminalPromptInline}>$ </span>}
              {line.content}
            </div>
          ))
        )}
        {isRunning && (
          <div className={styles.terminalLine}>
            <span className={styles.terminalSpinner}>⏳</span> Running...
          </div>
        )}
      </div>
      <div className={styles.terminalInputArea}>
        <span className={styles.terminalPrompt}>$</span>
        <input
          type="text"
          className={styles.terminalInput}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          disabled={disabled || isRunning}
        />
      </div>
    </div>
  );
};

export default Terminal;
