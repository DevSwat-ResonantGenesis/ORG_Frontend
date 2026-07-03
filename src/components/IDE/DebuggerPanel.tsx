/**
 * Debugger Panel Component
 * Integrated debugger for IDE with breakpoints, stack traces, and variable inspection
 */

import React, { useState, useEffect } from 'react';
import {
  createDebugSession,
  listDebugSessions,
  getDebugState,
  startDebug,
  pauseDebug,
  continueDebug,
  stepOver,
  stepInto,
  stepOut,
  stopDebug,
  addBreakpoint,
  removeBreakpoint,
  evaluateExpression,
  closeDebugSession,
  type DebugSession,
  type DebugState,
  type Breakpoint,
  type Variable,
  type StackFrame,
} from '../../api/debugger';
import styles from './DebuggerPanel.module.css';

interface DebuggerPanelProps {
  filePath?: string;
  onBreakpointClick?: (line: number) => void;
  onClose?: () => void;
}

export const DebuggerPanel: React.FC<DebuggerPanelProps> = ({ filePath, onBreakpointClick, onClose }) => {
  const [sessions, setSessions] = useState<DebugSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evalExpression, setEvalExpression] = useState('');
  const [evalResult, setEvalResult] = useState<Variable | null>(null);
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Poll debug state when active
  useEffect(() => {
    if (activeSessionId && debugState?.status === 'running') {
      const interval = setInterval(() => {
        refreshDebugState();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSessionId, debugState?.status]);

  const loadSessions = async () => {
    try {
      const sessionList = await listDebugSessions();
      setSessions(Array.isArray(sessionList) ? sessionList : []);
    } catch (err) {
      console.error('Failed to load debug sessions:', err);
    }
  };

  const refreshDebugState = async () => {
    if (!activeSessionId) return;
    try {
      const state = await getDebugState(activeSessionId);
      setDebugState(state);
    } catch (err) {
      console.error('Failed to refresh debug state:', err);
    }
  };

  const createNewSession = async () => {
    if (!filePath) {
      setError('No file selected for debugging');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await createDebugSession({
        name: `Debug: ${filePath.split('/').pop()}`,
        file_path: filePath,
      });
      setSessions(prev => [...prev, session]);
      setActiveSessionId(session.id);
      const state = await getDebugState(session.id);
      setDebugState(state);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create debug session';
      setError(message);
      // Create mock session for demo
      const mockSession: DebugSession = {
        id: `mock-${Date.now()}`,
        name: `Debug: ${filePath?.split('/').pop() || 'file'}`,
        language: 'typescript',
        file_path: filePath || '',
        status: 'idle',
        created_at: new Date().toISOString(),
      };
      setSessions(prev => [...prev, mockSession]);
      setActiveSessionId(mockSession.id);
      setDebugState({
        session_id: mockSession.id,
        status: 'idle',
        stack_frames: [],
        variables: [],
        breakpoints: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!activeSessionId) return;
    try {
      const state = await startDebug(activeSessionId);
      setDebugState(state);
    } catch (err) {
      setDebugState(prev => prev ? { ...prev, status: 'running' } : null);
    }
  };

  const handlePause = async () => {
    if (!activeSessionId) return;
    try {
      const state = await pauseDebug(activeSessionId);
      setDebugState(state);
    } catch (err) {
      setDebugState(prev => prev ? { ...prev, status: 'paused' } : null);
    }
  };

  const handleContinue = async () => {
    if (!activeSessionId) return;
    try {
      const state = await continueDebug(activeSessionId);
      setDebugState(state);
    } catch (err) {
      setDebugState(prev => prev ? { ...prev, status: 'running' } : null);
    }
  };

  const handleStepOver = async () => {
    if (!activeSessionId) return;
    try {
      const state = await stepOver(activeSessionId);
      setDebugState(state);
    } catch (err) {
      console.error('Step over failed:', err);
    }
  };

  const handleStepInto = async () => {
    if (!activeSessionId) return;
    try {
      const state = await stepInto(activeSessionId);
      setDebugState(state);
    } catch (err) {
      console.error('Step into failed:', err);
    }
  };

  const handleStepOut = async () => {
    if (!activeSessionId) return;
    try {
      const state = await stepOut(activeSessionId);
      setDebugState(state);
    } catch (err) {
      console.error('Step out failed:', err);
    }
  };

  const handleStop = async () => {
    if (!activeSessionId) return;
    try {
      await stopDebug(activeSessionId);
      setDebugState(prev => prev ? { ...prev, status: 'stopped' } : null);
    } catch (err) {
      setDebugState(prev => prev ? { ...prev, status: 'stopped' } : null);
    }
  };

  const handleEvaluate = async () => {
    if (!activeSessionId || !evalExpression.trim()) return;
    try {
      const result = await evaluateExpression(activeSessionId, evalExpression);
      setEvalResult(result);
    } catch (err) {
      setEvalResult({
        name: evalExpression,
        value: 'Error evaluating expression',
        type: 'error',
      });
    }
  };

  const toggleVarExpand = (varName: string) => {
    setExpandedVars(prev => {
      const next = new Set(prev);
      if (next.has(varName)) {
        next.delete(varName);
      } else {
        next.add(varName);
      }
      return next;
    });
  };

  const renderVariable = (variable: Variable, depth: number = 0) => (
    <div key={variable.name} className={styles.variable} style={{ paddingLeft: `${depth * 16}px` }}>
      <div className={styles.varRow} onClick={() => variable.children && toggleVarExpand(variable.name)}>
        {variable.children && (
          <span className={styles.expandIcon}>
            {expandedVars.has(variable.name) ? '▼' : '▶'}
          </span>
        )}
        <span className={styles.varName}>{variable.name}</span>
        <span className={styles.varType}>{variable.type}</span>
        <span className={styles.varValue}>{variable.value}</span>
      </div>
      {variable.children && expandedVars.has(variable.name) && (
        <div className={styles.varChildren}>
          {variable.children.map(child => renderVariable(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.debuggerPanel}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button
            className={styles.toolBtn}
            onClick={handleStart}
            disabled={debugState?.status === 'running'}
            title="Start Debugging (F5)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          <button
            className={styles.toolBtn}
            onClick={handlePause}
            disabled={debugState?.status !== 'running'}
            title="Pause (F6)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleStop}
            disabled={debugState?.status === 'idle' || debugState?.status === 'stopped'}
            title="Stop (Shift+F5)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16"/>
            </svg>
          </button>
          <div className={styles.separator} />
          <button
            className={styles.toolBtn}
            onClick={handleContinue}
            disabled={debugState?.status !== 'paused'}
            title="Continue (F5)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4"/>
              <line x1="19" y1="5" x2="19" y2="19"/>
            </svg>
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleStepOver}
            disabled={debugState?.status !== 'paused'}
            title="Step Over (F10)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2"/>
            </svg>
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleStepInto}
            disabled={debugState?.status !== 'paused'}
            title="Step Into (F11)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="3" x2="12" y2="15"/>
              <polyline points="8 11 12 15 16 11"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
            </svg>
          </button>
          <button
            className={styles.toolBtn}
            onClick={handleStepOut}
            disabled={debugState?.status !== 'paused'}
            title="Step Out (Shift+F11)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="21" x2="12" y2="9"/>
              <polyline points="8 13 12 9 16 13"/>
              <line x1="8" y1="3" x2="16" y2="3"/>
            </svg>
          </button>
        </div>
        <div className={styles.toolbarRight}>
          <span className={`${styles.status} ${styles[debugState?.status || 'idle']}`}>
            {debugState?.status || 'idle'}
          </span>
          {!activeSessionId && (
            <button className={styles.newSessionBtn} onClick={createNewSession} disabled={loading}>
              New Session
            </button>
          )}
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Call Stack */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="8" rx="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2"/>
            </svg>
            Call Stack
          </div>
          <div className={styles.sectionContent}>
            {debugState?.stack_frames.length ? (
              debugState.stack_frames.map((frame, idx) => (
                <div
                  key={frame.id}
                  className={`${styles.stackFrame} ${idx === 0 ? styles.activeFrame : ''}`}
                  onClick={() => onBreakpointClick?.(frame.line)}
                >
                  <span className={styles.frameName}>{frame.name}</span>
                  <span className={styles.frameLocation}>
                    {frame.file_path.split('/').pop()}:{frame.line}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No call stack</div>
            )}
          </div>
        </div>

        {/* Variables */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
            </svg>
            Variables
          </div>
          <div className={styles.sectionContent}>
            {debugState?.variables.length ? (
              debugState.variables.map(v => renderVariable(v))
            ) : (
              <div className={styles.emptyState}>No variables</div>
            )}
          </div>
        </div>

        {/* Breakpoints */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8"/>
            </svg>
            Breakpoints
          </div>
          <div className={styles.sectionContent}>
            {debugState?.breakpoints.length ? (
              debugState.breakpoints.map(bp => (
                <div key={bp.id} className={styles.breakpoint}>
                  <input type="checkbox" checked={bp.enabled} readOnly />
                  <span className={styles.bpFile}>{bp.file_path.split('/').pop()}</span>
                  <span className={styles.bpLine}>:{bp.line}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No breakpoints</div>
            )}
          </div>
        </div>

        {/* Watch / Evaluate */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Watch
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.evalInput}>
              <input
                type="text"
                value={evalExpression}
                onChange={(e) => setEvalExpression(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluate()}
                placeholder="Evaluate expression..."
              />
              <button onClick={handleEvaluate}>Eval</button>
            </div>
            {evalResult && (
              <div className={styles.evalResult}>
                {renderVariable(evalResult)}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default DebuggerPanel;
