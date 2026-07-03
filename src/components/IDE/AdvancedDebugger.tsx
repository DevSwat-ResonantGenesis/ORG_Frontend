// ============== ADVANCED DEBUGGER PANEL ==============
// Comprehensive debugging tools for the IDE

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AdvancedDebugger.module.css';

interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  hitCount?: number;
  enabled: boolean;
  logMessage?: string;
}

interface Variable {
  name: string;
  value: any;
  type: string;
  scope: 'local' | 'closure' | 'global';
  expandable: boolean;
  children?: Variable[];
}

interface CallStackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  isAsync: boolean;
}

interface WatchExpression {
  id: string;
  expression: string;
  value: any;
  error?: string;
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  content: string;
  timestamp: Date;
  source?: string;
  line?: number;
}

interface DebugSession {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  currentFile?: string;
  currentLine?: number;
  pauseReason?: string;
}

interface AdvancedDebuggerProps {
  activeFile?: string;
  onJumpToLine?: (file: string, line: number) => void;
  onSetBreakpoint?: (file: string, line: number) => void;
  className?: string;
}

const AdvancedDebuggerComponent: React.FC<AdvancedDebuggerProps> = ({
  activeFile,
  onJumpToLine,
  onSetBreakpoint,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'breakpoints' | 'variables' | 'callstack' | 'watch' | 'console'>('console');
  const [session, setSession] = useState<DebugSession>({ id: 'session-1', status: 'idle' });
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [callStack, setCallStack] = useState<CallStackFrame[]>([]);
  const [watchExpressions, setWatchExpressions] = useState<WatchExpression[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [newWatchExpr, setNewWatchExpr] = useState('');
  const [consoleInput, setConsoleInput] = useState('');
  const [editingBreakpoint, setEditingBreakpoint] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  // Intercept console messages
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    const createInterceptor = (type: ConsoleMessage['type']) => (...args: any[]) => {
      originalConsole[type](...args);
      const content = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setConsoleMessages(prev => [...prev, {
        id: `msg-${Date.now()}-${Math.random()}`,
        type,
        content,
        timestamp: new Date(),
      }].slice(-200)); // Keep last 200 messages
    };

    console.log = createInterceptor('log');
    console.warn = createInterceptor('warn');
    console.error = createInterceptor('error');
    console.info = createInterceptor('info');
    console.debug = createInterceptor('debug');

    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, []);

  // Debug controls
  const handleStart = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'running' }));
    console.log('🚀 Debug session started');
  }, []);

  const handlePause = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'paused', pauseReason: 'User paused' }));
    // Simulate paused state with mock data
    setVariables([
      { name: 'count', value: 42, type: 'number', scope: 'local', expandable: false },
      { name: 'items', value: '[...]', type: 'Array(3)', scope: 'local', expandable: true, children: [
        { name: '0', value: 'item1', type: 'string', scope: 'local', expandable: false },
        { name: '1', value: 'item2', type: 'string', scope: 'local', expandable: false },
        { name: '2', value: 'item3', type: 'string', scope: 'local', expandable: false },
      ]},
      { name: 'config', value: '{...}', type: 'Object', scope: 'closure', expandable: true },
      { name: 'window', value: 'Window', type: 'Window', scope: 'global', expandable: true },
    ]);
    setCallStack([
      { id: 'frame-1', name: 'handleClick', file: activeFile || 'app.tsx', line: 42, column: 15, isAsync: false },
      { id: 'frame-2', name: 'processData', file: 'utils.ts', line: 128, column: 8, isAsync: true },
      { id: 'frame-3', name: 'fetchItems', file: 'api.ts', line: 56, column: 12, isAsync: true },
    ]);
  }, [activeFile]);

  const handleContinue = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'running', pauseReason: undefined }));
    setVariables([]);
    setCallStack([]);
  }, []);

  const handleStepOver = useCallback(() => {
    console.log('⏭️ Step over');
  }, []);

  const handleStepInto = useCallback(() => {
    console.log('⬇️ Step into');
  }, []);

  const handleStepOut = useCallback(() => {
    console.log('⬆️ Step out');
  }, []);

  const handleStop = useCallback(() => {
    setSession(prev => ({ ...prev, status: 'stopped' }));
    setVariables([]);
    setCallStack([]);
    console.log('⏹️ Debug session stopped');
  }, []);

  const handleRestart = useCallback(() => {
    handleStop();
    setTimeout(handleStart, 100);
    console.log('🔄 Debug session restarted');
  }, [handleStop, handleStart]);

  // Breakpoint management
  const handleAddBreakpoint = useCallback(() => {
    if (!activeFile) return;
    const newBp: Breakpoint = {
      id: `bp-${Date.now()}`,
      file: activeFile,
      line: 1,
      enabled: true,
    };
    setBreakpoints(prev => [...prev, newBp]);
    setEditingBreakpoint(newBp.id);
  }, [activeFile]);

  const handleToggleBreakpoint = useCallback((id: string) => {
    setBreakpoints(prev => prev.map(bp =>
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    ));
  }, []);

  const handleDeleteBreakpoint = useCallback((id: string) => {
    setBreakpoints(prev => prev.filter(bp => bp.id !== id));
  }, []);

  const handleUpdateBreakpoint = useCallback((id: string, updates: Partial<Breakpoint>) => {
    setBreakpoints(prev => prev.map(bp =>
      bp.id === id ? { ...bp, ...updates } : bp
    ));
  }, []);

  // Watch expressions
  const handleAddWatch = useCallback(() => {
    if (!newWatchExpr.trim()) return;
    const watch: WatchExpression = {
      id: `watch-${Date.now()}`,
      expression: newWatchExpr,
      value: evaluateExpression(newWatchExpr),
    };
    setWatchExpressions(prev => [...prev, watch]);
    setNewWatchExpr('');
  }, [newWatchExpr]);

  const handleDeleteWatch = useCallback((id: string) => {
    setWatchExpressions(prev => prev.filter(w => w.id !== id));
  }, []);

  // Console
  const handleConsoleSubmit = useCallback(() => {
    if (!consoleInput.trim()) return;
    
    // Log input
    setConsoleMessages(prev => [...prev, {
      id: `input-${Date.now()}`,
      type: 'log',
      content: `> ${consoleInput}`,
      timestamp: new Date(),
    }]);

    // Evaluate and log result
    try {
      const result = evaluateExpression(consoleInput);
      setConsoleMessages(prev => [...prev, {
        id: `result-${Date.now()}`,
        type: 'info',
        content: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
        timestamp: new Date(),
      }]);
    } catch (error: any) {
      setConsoleMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'error',
        content: error.message,
        timestamp: new Date(),
      }]);
    }

    setConsoleInput('');
  }, [consoleInput]);

  const handleClearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  const getStatusColor = () => {
    switch (session.status) {
      case 'running': return '#22c55e';
      case 'paused': return '#f59e0b';
      case 'stopped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📝';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>🐛</span>
          Debugger
        </h3>
        <div className={styles.status} style={{ color: getStatusColor() }}>
          <span className={styles.statusDot} style={{ backgroundColor: getStatusColor() }} />
          {session.status}
        </div>
      </div>

      <div className={styles.controls}>
        {session.status === 'idle' || session.status === 'stopped' ? (
          <button className={styles.controlBtn} onClick={handleStart} title="Start debugging">
            ▶️
          </button>
        ) : (
          <>
            {session.status === 'paused' ? (
              <button className={styles.controlBtn} onClick={handleContinue} title="Continue">
                ▶️
              </button>
            ) : (
              <button className={styles.controlBtn} onClick={handlePause} title="Pause">
                ⏸️
              </button>
            )}
            <button className={styles.controlBtn} onClick={handleStepOver} title="Step over">
              ⏭️
            </button>
            <button className={styles.controlBtn} onClick={handleStepInto} title="Step into">
              ⬇️
            </button>
            <button className={styles.controlBtn} onClick={handleStepOut} title="Step out">
              ⬆️
            </button>
            <button className={styles.controlBtn} onClick={handleRestart} title="Restart">
              🔄
            </button>
            <button className={`${styles.controlBtn} ${styles.stopBtn}`} onClick={handleStop} title="Stop">
              ⏹️
            </button>
          </>
        )}
      </div>

      {session.status === 'paused' && session.pauseReason && (
        <div className={styles.pauseInfo}>
          Paused: {session.pauseReason}
        </div>
      )}

      <div className={styles.tabs}>
        {(['console', 'breakpoints', 'variables', 'callstack', 'watch'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'breakpoints' && breakpoints.length > 0 && (
              <span className={styles.badge}>{breakpoints.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'console' && (
          <div className={styles.consolePanel}>
            <div className={styles.consoleMessages}>
              {consoleMessages.length === 0 ? (
                <div className={styles.emptyConsole}>
                  <span>Console is empty</span>
                </div>
              ) : (
                consoleMessages.map(msg => (
                  <div key={msg.id} className={`${styles.consoleMessage} ${styles[msg.type]}`}>
                    <span className={styles.msgIcon}>{getMessageIcon(msg.type)}</span>
                    <pre className={styles.msgContent}>{msg.content}</pre>
                    <span className={styles.msgTime}>
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>
            <div className={styles.consoleInputArea}>
              <span className={styles.inputPrompt}>&gt;</span>
              <input
                type="text"
                value={consoleInput}
                onChange={e => setConsoleInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleConsoleSubmit()}
                placeholder="Enter expression..."
                className={styles.consoleInput}
              />
              <button className={styles.clearBtn} onClick={handleClearConsole} title="Clear console">
                🗑️
              </button>
            </div>
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className={styles.breakpointsPanel}>
            <div className={styles.panelHeader}>
              <button className={styles.addBtn} onClick={handleAddBreakpoint}>
                + Add Breakpoint
              </button>
            </div>
            <div className={styles.breakpointsList}>
              {breakpoints.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🔴</span>
                  <p>No breakpoints set</p>
                  <small>Click on a line number or use the button above</small>
                </div>
              ) : (
                breakpoints.map(bp => (
                  <div key={bp.id} className={`${styles.breakpointItem} ${!bp.enabled ? styles.disabled : ''}`}>
                    <input
                      type="checkbox"
                      checked={bp.enabled}
                      onChange={() => handleToggleBreakpoint(bp.id)}
                      className={styles.bpCheckbox}
                    />
                    <div className={styles.bpInfo}>
                      <span className={styles.bpFile}>{bp.file.split('/').pop()}</span>
                      <span className={styles.bpLine}>:{bp.line}</span>
                      {bp.condition && (
                        <span className={styles.bpCondition}>if {bp.condition}</span>
                      )}
                    </div>
                    <div className={styles.bpActions}>
                      <button
                        className={styles.bpActionBtn}
                        onClick={() => onJumpToLine?.(bp.file, bp.line)}
                        title="Go to line"
                      >
                        📍
                      </button>
                      <button
                        className={styles.bpActionBtn}
                        onClick={() => setEditingBreakpoint(bp.id)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.bpActionBtn}
                        onClick={() => handleDeleteBreakpoint(bp.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'variables' && (
          <div className={styles.variablesPanel}>
            {variables.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📊</span>
                <p>No variables to display</p>
                <small>Pause execution to inspect variables</small>
              </div>
            ) : (
              <VariableTree variables={variables} />
            )}
          </div>
        )}

        {activeTab === 'callstack' && (
          <div className={styles.callstackPanel}>
            {callStack.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📚</span>
                <p>Call stack is empty</p>
                <small>Pause execution to see the call stack</small>
              </div>
            ) : (
              <div className={styles.framesList}>
                {callStack.map((frame, index) => (
                  <div
                    key={frame.id}
                    className={`${styles.stackFrame} ${index === 0 ? styles.current : ''}`}
                    onClick={() => onJumpToLine?.(frame.file, frame.line)}
                  >
                    <span className={styles.frameIndex}>{index}</span>
                    <div className={styles.frameInfo}>
                      <span className={styles.frameName}>
                        {frame.isAsync && <span className={styles.asyncBadge}>async</span>}
                        {frame.name}
                      </span>
                      <span className={styles.frameLocation}>
                        {frame.file.split('/').pop()}:{frame.line}:{frame.column}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'watch' && (
          <div className={styles.watchPanel}>
            <div className={styles.addWatchForm}>
              <input
                type="text"
                value={newWatchExpr}
                onChange={e => setNewWatchExpr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddWatch()}
                placeholder="Add watch expression..."
                className={styles.watchInput}
              />
              <button className={styles.addWatchBtn} onClick={handleAddWatch}>
                +
              </button>
            </div>
            <div className={styles.watchList}>
              {watchExpressions.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👁️</span>
                  <p>No watch expressions</p>
                  <small>Add expressions to monitor their values</small>
                </div>
              ) : (
                watchExpressions.map(watch => (
                  <div key={watch.id} className={styles.watchItem}>
                    <span className={styles.watchExpr}>{watch.expression}</span>
                    <span className={`${styles.watchValue} ${watch.error ? styles.error : ''}`}>
                      {watch.error || formatValue(watch.value)}
                    </span>
                    <button
                      className={styles.deleteWatchBtn}
                      onClick={() => handleDeleteWatch(watch.id)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============== VARIABLE TREE COMPONENT ==============

interface VariableTreeProps {
  variables: Variable[];
  depth?: number;
}

const VariableTree: React.FC<VariableTreeProps> = memo(({ variables, depth = 0 }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div className={styles.variableTree}>
      {variables.map(variable => (
        <div key={variable.name} className={styles.variableItem}>
          <div
            className={styles.variableRow}
            style={{ paddingLeft: depth * 16 + 8 }}
            onClick={() => variable.expandable && toggleExpand(variable.name)}
          >
            {variable.expandable && (
              <span className={styles.expandIcon}>
                {expanded.has(variable.name) ? '▼' : '▶'}
              </span>
            )}
            <span className={styles.varName}>{variable.name}</span>
            <span className={styles.varType}>{variable.type}</span>
            <span className={styles.varValue}>{formatValue(variable.value)}</span>
            <span className={`${styles.varScope} ${styles[variable.scope]}`}>
              {variable.scope}
            </span>
          </div>
          {variable.expandable && expanded.has(variable.name) && variable.children && (
            <VariableTree variables={variable.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
});

VariableTree.displayName = 'VariableTree';

// ============== HELPER FUNCTIONS ==============

function evaluateExpression(expr: string): any {
  try {
    // Safe evaluation for simple expressions
    // In production, this would use a sandboxed evaluator
    if (expr.match(/^[\w.[\]]+$/)) {
      return `<${expr}>`;
    }
    return `Evaluated: ${expr}`;
  } catch {
    return undefined;
  }
}

function formatValue(value: any): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export const AdvancedDebugger = memo(AdvancedDebuggerComponent);
export default AdvancedDebugger;
