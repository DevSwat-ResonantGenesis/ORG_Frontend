import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import logger from '@/utils/logger';
import './logPanel.css';

export type LogLevel = 'info' | 'warning' | 'error' | 'success' | 'debug';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}

interface LogPanelProps {
  logs: LogEntry[];
  title?: string;
  maxHeight?: number;
  autoScroll?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onExport?: () => void;
  realTime?: boolean;
}

export const LogPanel: React.FC<LogPanelProps> = ({
  logs,
  title = 'System Logs',
  maxHeight = 400,
  autoScroll = true,
  filterable = true,
  exportable = true,
  onExport,
  realTime = false,
}) => {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(logs);
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let filtered = logs;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.source?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, levelFilter, searchTerm]);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'success':
        return '#22c55e';
      case 'debug':
        return '#6366f1';
      default:
        return '#3b82f6';
    }
  };

  const getLevelIcon = (level: LogLevel): string => {
    switch (level) {
      case 'error':
        return '';
      case 'warning':
        return '';
      case 'success':
        return '';
      case 'debug':
        return '';
      default:
        return '';
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      const dataStr = JSON.stringify(filteredLogs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const clearLogs = () => {
    // This would typically call a backend endpoint to clear logs
    logger.info('Clear logs requested');
  };

  return (
    <div className="log-panel">
      <div className="log-panel-header">
        <div className="log-panel-title">
          <h3>{title}</h3>
          {realTime && (
            <span className="log-panel-badge real-time">
              <span className="pulse-dot"></span>
              Real-time
            </span>
          )}
        </div>
        <div className="log-panel-actions">
          {exportable && (
            <Button variant="secondary" onClick={handleExport} style={{ fontSize: '12px', padding: '6px 12px' }}>
              Export
            </Button>
          )}
          <Button variant="tertiary" onClick={clearLogs} style={{ fontSize: '12px', padding: '6px 12px' }}>
            Clear
          </Button>
        </div>
      </div>

      {filterable && (
        <div className="log-panel-filters">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="log-search-input"
          />
          <div className="log-level-filters">
            {(['all', 'error', 'warning', 'info', 'success', 'debug'] as const).map((level) => (
              <button
                key={level}
                className={`log-level-filter ${levelFilter === level ? 'active' : ''}`}
                onClick={() => setLevelFilter(level)}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={logContainerRef}
        className="log-panel-content"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {filteredLogs.length === 0 ? (
          <div className="log-empty-state">
            <div className="log-empty-icon"></div>
            <div className="log-empty-text">No logs found</div>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="log-entry"
              style={{ borderLeftColor: getLevelColor(log.level) }}
            >
              <div className="log-entry-header">
                <span className="log-level-icon" style={{ color: getLevelColor(log.level) }}>
                  {getLevelIcon(log.level)}
                </span>
                <span className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                {log.source && (
                  <span className="log-source">{log.source}</span>
                )}
                <span className="log-level-badge" style={{ backgroundColor: getLevelColor(log.level) }}>
                  {log.level.toUpperCase()}
                </span>
              </div>
              <div className="log-message">{log.message}</div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="log-metadata">
                  <summary>Metadata</summary>
                  <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <div className="log-panel-footer">
        <span className="log-count">
          {filteredLogs.length} {filteredLogs.length === 1 ? 'log' : 'logs'}
          {filteredLogs.length !== logs.length && ` (filtered from ${logs.length})`}
        </span>
      </div>
    </div>
  );
};

export default LogPanel;

