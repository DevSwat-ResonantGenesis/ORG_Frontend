// ============== LOG VIEWER ==============
// Real-time log streaming with filtering and search

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './LogViewer.module.css';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

interface LogSource {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface LogViewerProps {
  logs?: LogEntry[];
  sources?: LogSource[];
  onClear?: () => void;
  onExport?: (logs: LogEntry[]) => void;
  className?: string;
}

const defaultSources: LogSource[] = [
  { id: 'app', name: 'Application', icon: '📱', enabled: true },
  { id: 'api', name: 'API', icon: '🔌', enabled: true },
  { id: 'db', name: 'Database', icon: '🗄️', enabled: true },
  { id: 'auth', name: 'Auth', icon: '🔐', enabled: true },
  { id: 'system', name: 'System', icon: '⚙️', enabled: true },
];

const LogViewerComponent: React.FC<LogViewerProps> = ({
  logs: initialLogs = [],
  sources: initialSources = defaultSources,
  onClear,
  onExport,
  className,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [sources, setSources] = useState<LogSource[]>(initialSources);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<Set<string>>(new Set(['debug', 'info', 'warn', 'error', 'fatal']));
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showSources, setShowSources] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newLog = generateRandomLog();
      setLogs(prev => [...prev.slice(-499), newLog]);
    }, 1000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const toggleLevel = (level: string) => {
    setLevelFilter(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const toggleSource = (sourceId: string) => {
    setSources(prev => prev.map(s =>
      s.id === sourceId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const clearLogs = useCallback(() => {
    setLogs([]);
    onClear?.();
  }, [onClear]);

  const exportLogs = useCallback(() => {
    onExport?.(filteredLogs);
  }, [onExport]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'fatal': return '💀';
      default: return '•';
    }
  };

  const getLevelClass = (level: string) => {
    return styles[level] || '';
  };

  const formatTimestamp = (date: Date) => {
    const time = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  const enabledSourceIds = new Set(sources.filter(s => s.enabled).map(s => s.id));

  const filteredLogs = logs.filter(log => {
    if (!levelFilter.has(log.level)) return false;
    if (!enabledSourceIds.has(log.source)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(query) ||
             log.source.toLowerCase().includes(query);
    }
    return true;
  });

  const levelCounts = {
    debug: logs.filter(l => l.level === 'debug').length,
    info: logs.filter(l => l.level === 'info').length,
    warn: logs.filter(l => l.level === 'warn').length,
    error: logs.filter(l => l.level === 'error').length,
    fatal: logs.filter(l => l.level === 'fatal').length,
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📋</span>
          <span>Log Viewer</span>
          {isStreaming && <span className={styles.streamingBadge}>● Live</span>}
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${isStreaming ? styles.active : ''}`}
            onClick={() => setIsStreaming(!isStreaming)}
          >
            {isStreaming ? '⏸️' : '▶️'}
          </button>
          <button
            className={`${styles.actionBtn} ${autoScroll ? styles.active : ''}`}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            ⬇️
          </button>
          <button className={styles.actionBtn} onClick={() => setShowSources(!showSources)}>
            📁
          </button>
          <button className={styles.actionBtn} onClick={exportLogs}>
            📤
          </button>
          <button className={styles.clearBtn} onClick={clearLogs}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
        <div className={styles.levelFilters}>
          {(['debug', 'info', 'warn', 'error', 'fatal'] as const).map(level => (
            <button
              key={level}
              className={`${styles.levelBtn} ${styles[level]} ${levelFilter.has(level) ? styles.active : ''}`}
              onClick={() => toggleLevel(level)}
            >
              {getLevelIcon(level)} {levelCounts[level]}
            </button>
          ))}
        </div>
      </div>

      {showSources && (
        <div className={styles.sourcesPanel}>
          {sources.map(source => (
            <label key={source.id} className={styles.sourceItem}>
              <input
                type="checkbox"
                checked={source.enabled}
                onChange={() => toggleSource(source.id)}
              />
              <span>{source.icon}</span>
              <span>{source.name}</span>
            </label>
          ))}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.logContainer} ref={logContainerRef}>
          {filteredLogs.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📋</span>
              <p>No logs to display</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className={`${styles.logEntry} ${getLevelClass(log.level)} ${selectedLog?.id === log.id ? styles.selected : ''}`}
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
              >
                <span className={styles.timestamp}>{formatTimestamp(log.timestamp)}</span>
                <span className={styles.level}>{getLevelIcon(log.level)}</span>
                <span className={styles.source}>[{log.source}]</span>
                <span className={styles.message}>{log.message}</span>
              </div>
            ))
          )}
        </div>

        {selectedLog && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <span>Log Details</span>
              <button className={styles.closeDetail} onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Timestamp</span>
                <span className={styles.detailValue}>{selectedLog.timestamp.toISOString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Level</span>
                <span className={`${styles.detailValue} ${styles[selectedLog.level]}`}>
                  {selectedLog.level.toUpperCase()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Source</span>
                <span className={styles.detailValue}>{selectedLog.source}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Message</span>
                <span className={styles.detailValue}>{selectedLog.message}</span>
              </div>
              {selectedLog.metadata && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Metadata</span>
                  <pre className={styles.metadata}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.statusBar}>
        <span>{filteredLogs.length} / {logs.length} logs</span>
        <span>{sources.filter(s => s.enabled).length} sources active</span>
      </div>
    </div>
  );
};

function generateRandomLog(): LogEntry {
  const levels: LogEntry['level'][] = ['debug', 'info', 'info', 'info', 'warn', 'error'];
  const sources = ['app', 'api', 'db', 'auth', 'system'];
  const messages = [
    'Request processed successfully',
    'User authenticated',
    'Database query executed',
    'Cache hit for key',
    'API response cached',
    'Connection established',
    'Task completed',
    'Webhook received',
    'File uploaded',
    'Email sent',
    'Warning: Rate limit approaching',
    'Error: Connection timeout',
    'Debug: Processing request',
  ];

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    level: levels[Math.floor(Math.random() * levels.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    metadata: Math.random() > 0.7 ? { requestId: Math.random().toString(36).substr(2, 9) } : undefined,
  };
}

export const LogViewer = memo(LogViewerComponent);
export default LogViewer;
