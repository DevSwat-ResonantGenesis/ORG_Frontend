import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as executionsApi from '../../../../../api/executions';
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

  // Mock logs for demo (logger.getBuffer() returns LogEntry[] from observability)
  const mockLogs: LogEntry[] = [
    { id: 'l1', timestamp: new Date(), level: 'info', source: 'AgentStore', message: 'Agent state updated', data: { agentId: 'agent-1' } },
    { id: 'l2', timestamp: new Date(Date.now() - 1000), level: 'debug', source: 'WebSocket', message: 'Message received', data: { type: 'heartbeat' } },
    { id: 'l3', timestamp: new Date(Date.now() - 2000), level: 'warn', source: 'ExecutionEngine', message: 'Execution taking longer than expected', data: { execId: 'exec-1', duration: 45000 } },
    { id: 'l4', timestamp: new Date(Date.now() - 3000), level: 'error', source: 'APIClient', message: 'Request failed: 429 Too Many Requests', data: { endpoint: '/api/v1/agents' } },
    { id: 'l5', timestamp: new Date(Date.now() - 4000), level: 'info', source: 'Router', message: 'Navigation to /agents', data: {} },
    { id: 'l6', timestamp: new Date(Date.now() - 5000), level: 'debug', source: 'UIStore', message: 'Active section changed', data: { from: 'agents', to: 'debug' } },
  ];

  const filteredLogs = mockLogs.filter(log => {
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
              {[
                { id: 'r1', method: 'GET', url: '/api/v1/agents', status: 200, duration: 45, size: '2.3 KB' },
                { id: 'r2', method: 'POST', url: '/api/v1/executions', status: 201, duration: 120, size: '1.1 KB' },
                { id: 'r3', method: 'GET', url: '/api/v1/workflows', status: 200, duration: 32, size: '5.6 KB' },
                { id: 'r4', method: 'GET', url: '/api/v1/agents/agent-1', status: 429, duration: 15, size: '0.2 KB' },
              ].map(req => (
                <div key={req.id} className={styles.requestRow}>
                  <span className={`${styles.method} ${styles[req.method.toLowerCase()]}`}>{req.method}</span>
                  <span className={styles.url}>{req.url}</span>
                  <span className={`${styles.status} ${req.status >= 400 ? styles.error : styles.success}`}>{req.status}</span>
                  <span className={styles.duration}>{req.duration}ms</span>
                  <span className={styles.size}>{req.size}</span>
                </div>
              ))}
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
                <h4>Render Time</h4>
                <span className={styles.metricValue}>12.4ms</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Memory Usage</h4>
                <span className={styles.metricValue}>45.2 MB</span>
              </div>
              <div className={styles.metricCard}>
                <h4>API Latency (avg)</h4>
                <span className={styles.metricValue}>53ms</span>
              </div>
              <div className={styles.metricCard}>
                <h4>WebSocket RTT</h4>
                <span className={styles.metricValue}>8ms</span>
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
