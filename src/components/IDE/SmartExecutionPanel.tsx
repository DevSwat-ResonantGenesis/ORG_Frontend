// ============== SMART EXECUTION PANEL ==============
// Intelligent code execution with real-time feedback

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { codeApi, terminalApi } from '../../api/ideService';
import styles from './SmartExecutionPanel.module.css';

interface ExecutionResult {
  id: string;
  type: 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
  duration?: number;
}

interface SmartExecutionPanelProps {
  code?: string;
  language?: string;
  onExecutionStart?: () => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
  className?: string;
}

const SmartExecutionPanelComponent: React.FC<SmartExecutionPanelProps> = ({
  code: initialCode = '',
  language: initialLanguage = 'python',
  onExecutionStart,
  onExecutionComplete,
  className,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [activeTab, setActiveTab] = useState<'code' | 'terminal' | 'output'>('code');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const outputRef = useRef<HTMLDivElement>(null);
  const resultIdRef = useRef(0);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [results]);

  const addResult = useCallback((type: ExecutionResult['type'], content: string, duration?: number) => {
    const result: ExecutionResult = {
      id: `result-${resultIdRef.current++}`,
      type,
      content,
      timestamp: new Date(),
      duration,
    };
    setResults(prev => [...prev, result]);
    return result;
  }, []);

  const executeCode = useCallback(async () => {
    if (!code.trim() || isExecuting) return;

    setIsExecuting(true);
    onExecutionStart?.();
    addResult('info', `Executing ${language} code...`);
    const startTime = performance.now();

    try {
      const response = await codeApi.execute(code, language);
      const duration = Math.round(performance.now() - startTime);

      if (response.error) {
        const result = addResult('error', response.error, duration);
        onExecutionComplete?.(result);
      } else {
        const result = addResult('success', response.output || 'Execution completed', duration);
        onExecutionComplete?.(result);
      }
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      const result = addResult('error', error.message || 'Execution failed', duration);
      onExecutionComplete?.(result);
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, isExecuting, onExecutionStart, onExecutionComplete, addResult]);

  const executeTerminalCommand = useCallback(async () => {
    if (!terminalInput.trim() || isExecuting) return;

    const command = terminalInput.trim();
    setTerminalHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    setTerminalInput('');
    setIsExecuting(true);

    addResult('info', `$ ${command}`);
    const startTime = performance.now();

    try {
      const response = await terminalApi.execute({ command });
      const duration = Math.round(performance.now() - startTime);

      if (response.stdout) {
        addResult('output', response.stdout, duration);
      }
      if (response.stderr) {
        addResult('error', response.stderr);
      }
      if (response.exitCode !== 0) {
        addResult('error', `Exit code: ${response.exitCode}`);
      }
    } catch (error: any) {
      addResult('error', error.message || 'Command failed');
    } finally {
      setIsExecuting(false);
    }
  }, [terminalInput, isExecuting, addResult]);

  const handleTerminalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeTerminalCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminalHistory.length > 0) {
        const newIndex = historyIndex < terminalHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[terminalHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(terminalHistory[terminalHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  }, [executeTerminalCommand, terminalHistory, historyIndex]);

  const clearOutput = useCallback(() => {
    setResults([]);
  }, []);

  const getResultIcon = (type: ExecutionResult['type']) => {
    switch (type) {
      case 'output': return '📤';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '•';
    }
  };

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'bash', label: 'Bash' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'code' ? styles.active : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <span className={styles.tabIcon}>📝</span>
            Code
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'terminal' ? styles.active : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <span className={styles.tabIcon}>💻</span>
            Terminal
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'output' ? styles.active : ''}`}
            onClick={() => setActiveTab('output')}
          >
            <span className={styles.tabIcon}>📊</span>
            Output
            {results.length > 0 && (
              <span className={styles.tabBadge}>{results.length}</span>
            )}
          </button>
        </div>
        <div className={styles.actions}>
          {activeTab === 'code' && (
            <select
              className={styles.languageSelect}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          )}
          <button
            className={styles.clearBtn}
            onClick={clearOutput}
            title="Clear output"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'code' && (
          <div className={styles.codePanel}>
            <textarea
              className={styles.codeEditor}
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={`Enter your ${language} code here...`}
              spellCheck={false}
            />
            <div className={styles.codeActions}>
              <button
                className={`${styles.runBtn} ${isExecuting ? styles.executing : ''}`}
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
              >
                {isExecuting ? (
                  <>
                    <span className={styles.spinner} />
                    Running...
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    Run Code
                  </>
                )}
              </button>
              <span className={styles.hint}>Ctrl+Enter to run</span>
            </div>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className={styles.terminalPanel}>
            <div className={styles.terminalOutput} ref={outputRef}>
              {results.map(result => (
                <div key={result.id} className={`${styles.terminalLine} ${styles[result.type]}`}>
                  <span className={styles.resultIcon}>{getResultIcon(result.type)}</span>
                  <pre className={styles.resultContent}>{result.content}</pre>
                  {result.duration !== undefined && (
                    <span className={styles.resultDuration}>{result.duration}ms</span>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.terminalInput}>
              <span className={styles.prompt}>$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={e => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                placeholder="Enter command..."
                disabled={isExecuting}
              />
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className={styles.outputPanel} ref={outputRef}>
            {results.length === 0 ? (
              <div className={styles.emptyOutput}>
                <span className={styles.emptyIcon}>📭</span>
                <p>No output yet</p>
                <small>Run some code to see results</small>
              </div>
            ) : (
              <div className={styles.outputList}>
                {results.map(result => (
                  <div key={result.id} className={`${styles.outputItem} ${styles[result.type]}`}>
                    <div className={styles.outputHeader}>
                      <span className={styles.resultIcon}>{getResultIcon(result.type)}</span>
                      <span className={styles.outputTime}>
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                      {result.duration !== undefined && (
                        <span className={styles.resultDuration}>{result.duration}ms</span>
                      )}
                    </div>
                    <pre className={styles.outputContent}>{result.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const SmartExecutionPanel = memo(SmartExecutionPanelComponent);
export default SmartExecutionPanel;
