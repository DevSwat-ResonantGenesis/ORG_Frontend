// ============== INTELLIGENT DEBUGGER ==============
// AI-powered debugging assistant with smart breakpoints and analysis

import React, { memo, useState, useCallback, useEffect } from 'react';
import styles from './IntelligentDebugger.module.css';

interface Breakpoint {
  id: string;
  line: number;
  condition?: string;
  hitCount?: number;
  isActive: boolean;
  isConditional: boolean;
  logMessage?: string;
}

interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  isAsync?: boolean;
}

interface Variable {
  name: string;
  value: string;
  type: string;
  expandable?: boolean;
  children?: Variable[];
}

interface DebugInsight {
  id: string;
  type: 'error-cause' | 'optimization' | 'suggestion' | 'warning';
  title: string;
  description: string;
  line?: number;
  action?: { label: string; onClick: () => void };
}

interface IntelligentDebuggerProps {
  code: string;
  language: string;
  filePath?: string;
  breakpoints?: Breakpoint[];
  onBreakpointToggle?: (line: number) => void;
  onBreakpointUpdate?: (breakpoint: Breakpoint) => void;
  onStepOver?: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onContinue?: () => void;
  onRestart?: () => void;
  onStop?: () => void;
  className?: string;
}

const IntelligentDebuggerComponent: React.FC<IntelligentDebuggerProps> = ({
  code,
  language,
  filePath,
  breakpoints = [],
  onBreakpointToggle,
  onBreakpointUpdate,
  onStepOver,
  onStepInto,
  onStepOut,
  onContinue,
  onRestart,
  onStop,
  className,
}) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [newWatch, setNewWatch] = useState('');
  const [insights, setInsights] = useState<DebugInsight[]>([]);
  const [activeTab, setActiveTab] = useState<'variables' | 'watch' | 'callstack' | 'breakpoints' | 'insights'>('variables');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startDebugging = useCallback(() => {
    setIsDebugging(true);
    setIsPaused(false);
    setCurrentLine(null);
    
    // Simulate debug session start
    setTimeout(() => {
      setIsPaused(true);
      setCurrentLine(breakpoints[0]?.line || 1);
      
      // Generate mock stack frames
      setStackFrames([
        { id: '1', name: 'handleClick', file: filePath || 'index.ts', line: 15, column: 4 },
        { id: '2', name: 'processData', file: filePath || 'index.ts', line: 8, column: 2, isAsync: true },
        { id: '3', name: 'main', file: filePath || 'index.ts', line: 1, column: 0 },
      ]);
      
      // Generate mock variables
      setVariables([
        { name: 'count', value: '42', type: 'number' },
        { name: 'data', value: '{...}', type: 'object', expandable: true, children: [
          { name: 'id', value: '"abc123"', type: 'string' },
          { name: 'items', value: '[3]', type: 'array', expandable: true },
        ]},
        { name: 'isActive', value: 'true', type: 'boolean' },
        { name: 'callback', value: 'ƒ()', type: 'function' },
      ]);
    }, 500);
  }, [breakpoints, filePath]);

  const stopDebugging = useCallback(() => {
    setIsDebugging(false);
    setIsPaused(false);
    setCurrentLine(null);
    setStackFrames([]);
    setVariables([]);
    onStop?.();
  }, [onStop]);

  const handleStepOver = useCallback(() => {
    if (currentLine !== null) {
      setCurrentLine(prev => (prev || 0) + 1);
    }
    onStepOver?.();
  }, [currentLine, onStepOver]);

  const handleStepInto = useCallback(() => {
    onStepInto?.();
  }, [onStepInto]);

  const handleStepOut = useCallback(() => {
    onStepOut?.();
  }, [onStepOut]);

  const handleContinue = useCallback(() => {
    setIsPaused(false);
    setTimeout(() => {
      // Simulate hitting next breakpoint
      const nextBp = breakpoints.find(bp => bp.isActive && bp.line > (currentLine || 0));
      if (nextBp) {
        setCurrentLine(nextBp.line);
        setIsPaused(true);
      } else {
        stopDebugging();
      }
    }, 300);
    onContinue?.();
  }, [breakpoints, currentLine, stopDebugging, onContinue]);

  const addWatchExpression = useCallback(() => {
    if (newWatch.trim()) {
      setWatchExpressions(prev => [...prev, newWatch.trim()]);
      setNewWatch('');
    }
  }, [newWatch]);

  const removeWatchExpression = useCallback((index: number) => {
    setWatchExpressions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const analyzeError = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setInsights([
      {
        id: '1',
        type: 'error-cause',
        title: 'Potential Null Reference',
        description: 'The variable "data" might be null at this point. Consider adding a null check.',
        line: currentLine || undefined,
        action: { label: 'Add null check', onClick: () => {} },
      },
      {
        id: '2',
        type: 'suggestion',
        title: 'Optimize Loop',
        description: 'This loop can be optimized using Array.map() for better performance.',
        line: 12,
      },
      {
        id: '3',
        type: 'warning',
        title: 'Unused Variable',
        description: 'Variable "temp" is declared but never used.',
        line: 5,
      },
    ]);
    
    setIsAnalyzing(false);
  }, [currentLine]);

  const suggestBreakpoints = useCallback(() => {
    // AI-suggested breakpoints based on code analysis
    const suggestions: number[] = [];
    const lines = code.split('\n');
    
    lines.forEach((line, i) => {
      // Suggest breakpoints at function entries
      if (line.includes('function') || line.includes('=>')) {
        suggestions.push(i + 1);
      }
      // Suggest at conditionals
      if (line.includes('if (') || line.includes('catch')) {
        suggestions.push(i + 1);
      }
    });
    
    return suggestions.slice(0, 5);
  }, [code]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'error-cause': return '🔴';
      case 'optimization': return '⚡';
      case 'suggestion': return '💡';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🐛</span>
          <span>Intelligent Debugger</span>
          {isDebugging && (
            <span className={`${styles.status} ${isPaused ? styles.paused : styles.running}`}>
              {isPaused ? 'Paused' : 'Running'}
            </span>
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        {!isDebugging ? (
          <button className={styles.startBtn} onClick={startDebugging}>
            ▶️ Start Debug
          </button>
        ) : (
          <>
            <button className={styles.controlBtn} onClick={handleContinue} disabled={!isPaused} title="Continue (F5)">
              ▶️
            </button>
            <button className={styles.controlBtn} onClick={handleStepOver} disabled={!isPaused} title="Step Over (F10)">
              ⤵️
            </button>
            <button className={styles.controlBtn} onClick={handleStepInto} disabled={!isPaused} title="Step Into (F11)">
              ⬇️
            </button>
            <button className={styles.controlBtn} onClick={handleStepOut} disabled={!isPaused} title="Step Out (⇧F11)">
              ⬆️
            </button>
            <button className={styles.controlBtn} onClick={onRestart} title="Restart (⇧⌘F5)">
              🔄
            </button>
            <button className={styles.stopBtn} onClick={stopDebugging} title="Stop (⇧F5)">
              ⏹️
            </button>
          </>
        )}
        <div className={styles.spacer} />
        <button className={styles.aiBtn} onClick={analyzeError} disabled={isAnalyzing}>
          {isAnalyzing ? '🔄' : '🧠'} AI Analyze
        </button>
      </div>

      {currentLine && (
        <div className={styles.currentLocation}>
          <span className={styles.locationIcon}>📍</span>
          <span className={styles.locationFile}>{filePath || 'index.ts'}</span>
          <span className={styles.locationLine}>Line {currentLine}</span>
        </div>
      )}

      <div className={styles.tabs}>
        {(['variables', 'watch', 'callstack', 'breakpoints', 'insights'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'variables' && '📦 Variables'}
            {tab === 'watch' && '👁️ Watch'}
            {tab === 'callstack' && '📚 Call Stack'}
            {tab === 'breakpoints' && `🔴 Breakpoints (${breakpoints.length})`}
            {tab === 'insights' && `🧠 Insights (${insights.length})`}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'variables' && (
          <div className={styles.variablesPanel}>
            {variables.length === 0 ? (
              <div className={styles.empty}>No variables in scope</div>
            ) : (
              <div className={styles.variablesList}>
                {variables.map((v, i) => (
                  <VariableRow key={i} variable={v} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'watch' && (
          <div className={styles.watchPanel}>
            <div className={styles.watchInput}>
              <input
                type="text"
                placeholder="Add expression to watch..."
                value={newWatch}
                onChange={e => setNewWatch(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addWatchExpression()}
              />
              <button onClick={addWatchExpression}>+</button>
            </div>
            {watchExpressions.length === 0 ? (
              <div className={styles.empty}>No watch expressions</div>
            ) : (
              <div className={styles.watchList}>
                {watchExpressions.map((expr, i) => (
                  <div key={i} className={styles.watchItem}>
                    <span className={styles.watchExpr}>{expr}</span>
                    <span className={styles.watchValue}>undefined</span>
                    <button className={styles.removeBtn} onClick={() => removeWatchExpression(i)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'callstack' && (
          <div className={styles.callstackPanel}>
            {stackFrames.length === 0 ? (
              <div className={styles.empty}>No call stack</div>
            ) : (
              <div className={styles.framesList}>
                {stackFrames.map((frame, i) => (
                  <div key={frame.id} className={`${styles.frame} ${i === 0 ? styles.current : ''}`}>
                    <span className={styles.frameName}>
                      {frame.isAsync && <span className={styles.asyncBadge}>async</span>}
                      {frame.name}
                    </span>
                    <span className={styles.frameLocation}>{frame.file}:{frame.line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className={styles.breakpointsPanel}>
            <div className={styles.bpActions}>
              <button className={styles.suggestBtn} onClick={() => {
                const suggested = suggestBreakpoints();
                console.log('Suggested breakpoints:', suggested);
              }}>
                🧠 Suggest Breakpoints
              </button>
            </div>
            {breakpoints.length === 0 ? (
              <div className={styles.empty}>No breakpoints set</div>
            ) : (
              <div className={styles.bpList}>
                {breakpoints.map(bp => (
                  <div key={bp.id} className={styles.breakpoint}>
                    <input
                      type="checkbox"
                      checked={bp.isActive}
                      onChange={() => onBreakpointToggle?.(bp.line)}
                    />
                    <span className={styles.bpLine}>Line {bp.line}</span>
                    {bp.isConditional && (
                      <span className={styles.bpCondition}>{bp.condition}</span>
                    )}
                    {bp.hitCount && bp.hitCount > 0 && (
                      <span className={styles.bpHits}>{bp.hitCount} hits</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className={styles.insightsPanel}>
            {insights.length === 0 ? (
              <div className={styles.empty}>
                <p>No insights yet</p>
                <small>Click "AI Analyze" to get debugging insights</small>
              </div>
            ) : (
              <div className={styles.insightsList}>
                {insights.map(insight => (
                  <div key={insight.id} className={`${styles.insight} ${styles[insight.type]}`}>
                    <div className={styles.insightHeader}>
                      <span className={styles.insightIcon}>{getInsightIcon(insight.type)}</span>
                      <span className={styles.insightTitle}>{insight.title}</span>
                      {insight.line && <span className={styles.insightLine}>Line {insight.line}</span>}
                    </div>
                    <p className={styles.insightDesc}>{insight.description}</p>
                    {insight.action && (
                      <button className={styles.insightAction} onClick={insight.action.onClick}>
                        {insight.action.label}
                      </button>
                    )}
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

// Variable Row Component
const VariableRow: React.FC<{ variable: Variable; depth?: number }> = memo(({ variable, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.variableRow} style={{ paddingLeft: depth * 16 }}>
      <div className={styles.variableMain} onClick={() => variable.expandable && setIsExpanded(!isExpanded)}>
        {variable.expandable && (
          <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        )}
        <span className={styles.varName}>{variable.name}</span>
        <span className={styles.varEquals}>=</span>
        <span className={`${styles.varValue} ${styles[variable.type]}`}>{variable.value}</span>
        <span className={styles.varType}>{variable.type}</span>
      </div>
      {isExpanded && variable.children?.map((child, i) => (
        <VariableRow key={i} variable={child} depth={depth + 1} />
      ))}
    </div>
  );
});

VariableRow.displayName = 'VariableRow';

export const IntelligentDebugger = memo(IntelligentDebuggerComponent);
export default IntelligentDebugger;
