import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as executionsApi from '../../../../../api/executions';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './DebugPanel.module.css';

// ============== DEBUG PANEL ==============
// Contract: reads [agent, execution, network], writes []
// Forbidden: [economy]

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: Record<string, unknown>;
}

interface DebugPanelProps {
  className?: string;
}

const DebugPanelComponent: React.FC<DebugPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<executionsApi.Execution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<executionsApi.Execution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = useCallback(async () => {
    if (!selectedAgentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await executionsApi.getExecutions(selectedAgentId);
      setExecutions((data as any).executions || data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId]);

  const fetchExecutionDetails = useCallback(async (executionId: string) => {
    setIsLoading(true);
    try {
      const details = await executionsApi.getExecutionDetails(executionId);
      setSelectedExecution(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load execution details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const [activeTab, setActiveTab] = useState<'console' | 'network' | 'state' | 'performance'>('console');
  const [logFilter, setLogFilter] = useState<'all' | 'debug' | 'info' | 'warn' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Real logs from backend + console capture
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Fetch real agent logs from backend
  useEffect(() => {
    if (!selectedAgentId) return;
    fastapiClient.get('/api/v1/agents/' + selectedAgentId + '/logs?limit=30')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setLogs(res.data.map((l: any) => ({
            id: l.id,
            timestamp: new Date(l.timestamp),
            level: l.level as any,
            source: l.source || 'agent',
            message: l.message,
          })));
        }
      })
      .catch(() => {});
  }, [selectedAgentId]);
  const [networkRequests, setNetworkRequests] = useState<Array<{
    id: string;
    method: string;
    url: string;
    status: number;
    duration: number;
    size: string;
  }>>([]);

  // Capture network requests via fetch interceptor
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || '';
      const method = (args[1]?.method || 'GET').toUpperCase();
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = Math.round(performance.now() - startTime);
        const contentLength = response.headers.get('content-length');
        setNetworkRequests(prev => [{
          id: `req-${Date.now()}-${Math.random()}`,
          method,
          url: url.replace(window.location.origin, ''),
          status: response.status,
          duration,
          size: contentLength ? `${Math.round(parseInt(contentLength) / 1024)}KB` : '-',
        }, ...prev].slice(0, 50));
        return response;
      } catch (err) {
        const duration = Math.round(performance.now() - startTime);
        setNetworkRequests(prev => [{
          id: `req-${Date.now()}-${Math.random()}`,
          method,
          url: url.replace(window.location.origin, ''),
          status: 0,
          duration,
          size: 'ERR',
        }, ...prev].slice(0, 50));
        throw err;
      }
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  // Capture console logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    const captureLog = (level: LogEntry['level'], ...args: any[]) => {
      const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      setLogs(prev => [{
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        level,
        source: 'Console',
        message,
        data: args.length > 1 ? { args } : undefined,
      }, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    console.log = (...args) => { originalConsole.log(...args); captureLog('info', ...args); };
    console.info = (...args) => { originalConsole.info(...args); captureLog('info', ...args); };
    console.warn = (...args) => { originalConsole.warn(...args); captureLog('warn', ...args); };
    console.error = (...args) => { originalConsole.error(...args); captureLog('error', ...args); };
    console.debug = (...args) => { originalConsole.debug(...args); captureLog('debug', ...args); };

    return () => {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.debug = originalConsole.debug;
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.level !== logFilter) return false;
    if (searchQuery) {
      return log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
             log.source.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return styles.debug;
      case 'info': return styles.info;
      case 'warn': return styles.warn;
      case 'error': return styles.error;
      default: return '';
    }
  };

  const clearLogs = () => {
    // In real implementation, this would clear the logger buffer
    console.log('Clearing logs...');
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Code /> Debug Console</h2>
        <div className={styles.tabs}>
          {(['console', 'network', 'state', 'performance'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Console Tab */}
        {activeTab === 'console' && (
          <div className={styles.consoleSection}>
            <div className={styles.consoleToolbar}>
              <div className={styles.filterTabs}>
                {(['all', 'debug', 'info', 'warn', 'error'] as const).map(level => (
                  <button
                    key={level}
                    className={`${styles.filterBtn} ${logFilter === level ? styles.active : ''} ${level !== 'all' ? getLevelColor(level) : ''}`}
                    onClick={() => setLogFilter(level)}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button className={styles.clearBtn} onClick={clearLogs}>
                <Icons.Trash /> Clear
              </button>
            </div>

            <div className={styles.logsContainer}>
              {filteredLogs.map(log => (
                <div key={log.id} className={`${styles.logEntry} ${getLevelColor(log.level)}`}>
                  <span className={styles.logTime}>{log.timestamp.toLocaleTimeString()}</span>
                  <span className={`${styles.logLevel} ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
                  <span className={styles.logSource}>[{log.source}]</span>
                  <span className={styles.logMessage}>{log.message}</span>
                  {log.data && (
                    <pre className={styles.logData}>{JSON.stringify(log.data, null, 2)}</pre>
                  )}
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className={styles.emptyState}>No logs to display</div>
              )}
            </div>
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className={styles.networkSection}>
            <h3>Network Requests</h3>
            <div className={styles.requestsList}>
              {networkRequests.length > 0 ? networkRequests.map(req => (
                <div key={req.id} className={styles.requestRow}>
                  <span className={`${styles.method} ${styles[req.method.toLowerCase()]}`}>{req.method}</span>
                  <span className={styles.url}>{req.url}</span>
                  <span className={`${styles.status} ${req.status >= 400 ? styles.error : styles.success}`}>{req.status}</span>
                  <span className={styles.duration}>{req.duration}ms</span>
                  <span className={styles.size}>{req.size}</span>
                </div>
              )) : (
                <div className={styles.emptyState}>No network requests captured yet</div>
              )}
            </div>
          </div>
        )}

        {/* State Tab */}
        {activeTab === 'state' && (
          <div className={styles.stateSection}>
            <h3>Application State</h3>
            <div className={styles.stateTree}>
              <div className={styles.stateNode}>
                <span className={styles.nodeKey}>agentStore</span>
                <pre className={styles.nodeValue}>{JSON.stringify({ agentsCount: agents.length, selectedId: null }, null, 2)}</pre>
              </div>
              <div className={styles.stateNode}>
                <span className={styles.nodeKey}>executionStore</span>
                <pre className={styles.nodeValue}>{JSON.stringify({ executionsCount: executions.length, activeId: null }, null, 2)}</pre>
              </div>
              <div className={styles.stateNode}>
                <span className={styles.nodeKey}>uiStore</span>
                <pre className={styles.nodeValue}>{JSON.stringify({ activeSection: 'debug', sidebarCollapsed: false }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className={styles.performanceSection}>
            <h3>Performance Metrics</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <h4>Logs Captured</h4>
                <span className={styles.metricValue}>{logs.length}</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Agents Loaded</h4>
                <span className={styles.metricValue}>{agents.length}</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Executions</h4>
                <span className={styles.metricValue}>{executions.length}</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Network Requests</h4>
                <span className={styles.metricValue}>{networkRequests.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DebugPanel = memo(DebugPanelComponent);
export default DebugPanel;
