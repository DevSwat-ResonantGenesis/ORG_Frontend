import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Search, Filter, Download, Pause, Play, Trash2, ChevronDown, AlertTriangle, Info, AlertCircle, Bug, RefreshCw } from 'lucide-react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogSource = 'api' | 'agent' | 'auth' | 'system' | 'database' | 'worker';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
}

interface SystemLogsProps {
  logs: LogEntry[];
  onClear?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  autoScroll?: boolean;
  maxLogs?: number;
  className?: string;
}

const LEVEL_CONFIG: Record<LogLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  debug: {
    label: 'DEBUG',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Bug size={12} />,
  },
  info: {
    label: 'INFO',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Info size={12} />,
  },
  warn: {
    label: 'WARN',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  error: {
    label: 'ERROR',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertCircle size={12} />,
  },
};

const SOURCE_CONFIG: Record<LogSource, {
  label: string;
  color: string;
}> = {
  api: { label: 'API', color: '#10b981' },
  agent: { label: 'AGENT', color: '#8b5cf6' },
  auth: { label: 'AUTH', color: '#f59e0b' },
  system: { label: 'SYSTEM', color: '#3b82f6' },
  database: { label: 'DB', color: '#ec4899' },
  worker: { label: 'WORKER', color: '#14b8a6' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  logCount: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '180px',
  },
  filterDropdown: {
    position: 'relative',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '140px',
    zIndex: 100,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    textAlign: 'left',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  logsContainer: {
    flex: 1,
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    lineHeight: 1.6,
  },
  logEntry: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '0.375rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'background 0.15s',
  },
  logEntryHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  timestamp: {
    color: '#666',
    marginRight: '0.75rem',
    flexShrink: 0,
    width: '85px',
  },
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    marginRight: '0.5rem',
    flexShrink: 0,
  },
  sourceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    marginRight: '0.75rem',
    flexShrink: 0,
  },
  message: {
    color: '#e4e4e7',
    flex: 1,
    wordBreak: 'break-word',
  },
  traceId: {
    color: '#666',
    marginLeft: '0.5rem',
    fontSize: '0.625rem',
  },
  metadata: {
    marginTop: '0.25rem',
    padding: '0.375rem 0.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.6875rem',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#666',
    fontSize: '0.875rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
    fontSize: '0.75rem',
    color: '#888',
  },
};

const formatTimestamp = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export const SystemLogs: React.FC<SystemLogsProps> = ({
  logs,
  onClear,
  onExport,
  onRefresh,
  autoScroll: initialAutoScroll = true,
  maxLogs = 1000,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LogSource | 'all'>('all');
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [autoScroll, setAutoScroll] = useState(initialAutoScroll);
  const [hoveredLog, setHoveredLog] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs
    .filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          log.message.toLowerCase().includes(query) ||
          log.source.toLowerCase().includes(query) ||
          log.traceId?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .slice(-maxLogs);

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.title}>
            <Terminal size={18} />
            System Logs
          </div>
          <span style={styles.logCount}>
            {filteredLogs.length} logs
            {errorCount > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                {errorCount} errors
              </span>
            )}
            {warnCount > 0 && (
              <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                {warnCount} warnings
              </span>
            )}
          </span>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search logs..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Level Filter */}
          <div style={styles.filterDropdown}>
            <button
              style={styles.filterButton}
              onClick={() => { setShowLevelDropdown(!showLevelDropdown); setShowSourceDropdown(false); }}
            >
              Level
              <ChevronDown size={12} />
            </button>
            {showLevelDropdown && (
              <div style={styles.dropdown}>
                <button
                  style={styles.dropdownItem}
                  onClick={() => { setLevelFilter('all'); setShowLevelDropdown(false); }}
                >
                  All Levels
                </button>
                {(Object.keys(LEVEL_CONFIG) as LogLevel[]).map((level) => (
                  <button
                    key={level}
                    style={{ ...styles.dropdownItem, color: LEVEL_CONFIG[level].color }}
                    onClick={() => { setLevelFilter(level); setShowLevelDropdown(false); }}
                  >
                    {LEVEL_CONFIG[level].icon}
                    {LEVEL_CONFIG[level].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Source Filter */}
          <div style={styles.filterDropdown}>
            <button
              style={styles.filterButton}
              onClick={() => { setShowSourceDropdown(!showSourceDropdown); setShowLevelDropdown(false); }}
            >
              Source
              <ChevronDown size={12} />
            </button>
            {showSourceDropdown && (
              <div style={styles.dropdown}>
                <button
                  style={styles.dropdownItem}
                  onClick={() => { setSourceFilter('all'); setShowSourceDropdown(false); }}
                >
                  All Sources
                </button>
                {(Object.keys(SOURCE_CONFIG) as LogSource[]).map((source) => (
                  <button
                    key={source}
                    style={{ ...styles.dropdownItem, color: SOURCE_CONFIG[source].color }}
                    onClick={() => { setSourceFilter(source); setShowSourceDropdown(false); }}
                  >
                    {SOURCE_CONFIG[source].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            style={{
              ...styles.actionButton,
              background: autoScroll ? 'rgba(99, 102, 241, 0.15)' : undefined,
              color: autoScroll ? '#818cf8' : '#888',
            }}
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'}
          >
            {autoScroll ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh} title="Refresh">
              <RefreshCw size={14} />
            </button>
          )}

          {onExport && (
            <button style={styles.actionButton} onClick={onExport} title="Export">
              <Download size={14} />
            </button>
          )}

          {onClear && (
            <button style={styles.actionButton} onClick={onClear} title="Clear">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.logsContainer} ref={logsContainerRef}>
        {filteredLogs.length === 0 ? (
          <div style={styles.empty}>
            <Terminal size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No logs to display</span>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const levelConfig = LEVEL_CONFIG[log.level];
            const sourceConfig = SOURCE_CONFIG[log.source];
            const isHovered = hoveredLog === log.id;
            const isExpanded = expandedLog === log.id;

            return (
              <div
                key={log.id}
                style={{
                  ...styles.logEntry,
                  ...(isHovered ? styles.logEntryHover : {}),
                }}
                onMouseEnter={() => setHoveredLog(log.id)}
                onMouseLeave={() => setHoveredLog(null)}
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
              >
                <span style={styles.timestamp}>{formatTimestamp(log.timestamp)}</span>
                <span
                  style={{
                    ...styles.levelBadge,
                    background: levelConfig.bgColor,
                    color: levelConfig.color,
                  }}
                >
                  {levelConfig.icon}
                  {levelConfig.label}
                </span>
                <span style={{ ...styles.sourceBadge, color: sourceConfig.color }}>
                  {sourceConfig.label}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={styles.message}>{log.message}</span>
                  {log.traceId && (
                    <span style={styles.traceId}>[{log.traceId}]</span>
                  )}
                  {isExpanded && log.metadata && (
                    <div style={styles.metadata}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.footer}>
        <span>Showing {filteredLogs.length} of {logs.length} logs</span>
        <span>Auto-scroll: {autoScroll ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
};

export default SystemLogs;
