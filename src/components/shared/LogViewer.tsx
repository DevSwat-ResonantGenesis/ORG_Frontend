import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Trash2, ChevronDown, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

interface LogViewerProps {
  logs: LogEntry[];
  title?: string;
  maxHeight?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showTimestamps?: boolean;
  showSource?: boolean;
  autoScroll?: boolean;
  onClear?: () => void;
  onDownload?: () => void;
  className?: string;
}

const LEVEL_CONFIG: Record<LogLevel, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}> = {
  debug: {
    icon: <Bug size={14} />,
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'DEBUG',
  },
  info: {
    icon: <Info size={14} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    label: 'INFO',
  },
  warn: {
    icon: <AlertTriangle size={14} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    label: 'WARN',
  },
  error: {
    icon: <AlertCircle size={14} />,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    label: 'ERROR',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0f',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  searchWrapper: {
    position: 'relative',
  },
  searchInput: {
    width: '200px',
    padding: '0.375rem 0.625rem 0.375rem 2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    outline: 'none',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
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
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterButtonActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  logList: {
    flex: 1,
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
  },
  logEntry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.1s',
  },
  logEntryHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  timestamp: {
    color: '#666',
    flexShrink: 0,
    fontSize: '0.6875rem',
  },
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  source: {
    color: '#818cf8',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    color: '#e4e4e7',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  metadata: {
    marginTop: '0.375rem',
    padding: '0.375rem 0.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#888',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '0.8125rem',
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    padding: '0.375rem',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
  },
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0.625rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.1s',
    fontSize: '0.75rem',
  },
};

const LogEntryRow: React.FC<{
  entry: LogEntry;
  showTimestamp: boolean;
  showSource: boolean;
}> = ({ entry, showTimestamp, showSource }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const config = LEVEL_CONFIG[entry.level];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div
      style={{
        ...styles.logEntry,
        ...(isHovered ? styles.logEntryHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => entry.metadata && setShowMetadata(!showMetadata)}
    >
      {showTimestamp && (
        <span style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</span>
      )}
      <span
        style={{
          ...styles.levelBadge,
          background: config.bgColor,
          color: config.color,
        }}
      >
        {config.icon}
        {config.label}
      </span>
      {showSource && entry.source && (
        <span style={styles.source}>[{entry.source}]</span>
      )}
      <div style={{ flex: 1 }}>
        <span style={styles.message}>{entry.message}</span>
        {showMetadata && entry.metadata && (
          <div style={styles.metadata}>
            {JSON.stringify(entry.metadata, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  title = 'Logs',
  maxHeight = '400px',
  showFilters = true,
  showSearch = true,
  showTimestamps = true,
  showSource = true,
  autoScroll = true,
  onClear,
  onDownload,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilters, setLevelFilters] = useState<LogLevel[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const logListRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilters.length === 0 || levelFilters.includes(log.level);
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchQuery, levelFilters]);

  useEffect(() => {
    if (autoScroll && logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const toggleLevelFilter = (level: LogLevel) => {
    setLevelFilters((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.toolbar}>
          {showSearch && (
            <div style={styles.searchWrapper}>
              <Search size={12} style={styles.searchIcon} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                style={styles.searchInput}
              />
            </div>
          )}

          {showFilters && (
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.filterButton,
                  ...(levelFilters.length > 0 ? styles.filterButtonActive : {}),
                }}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={12} />
                Level
                {levelFilters.length > 0 && ` (${levelFilters.length})`}
                <ChevronDown size={12} />
              </button>

              {showFilterDropdown && (
                <div style={styles.filterDropdown}>
                  {(Object.keys(LEVEL_CONFIG) as LogLevel[]).map((level) => {
                    const config = LEVEL_CONFIG[level];
                    const isSelected = levelFilters.includes(level);
                    return (
                      <div
                        key={level}
                        style={{
                          ...styles.filterOption,
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        }}
                        onClick={() => toggleLevelFilter(level)}
                      >
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span style={{ color: isSelected ? '#fff' : '#ccc' }}>
                          {config.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {onDownload && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'download' ? styles.actionButtonHover : {}),
              }}
              onClick={onDownload}
              onMouseEnter={() => setHoveredAction('download')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Download logs"
            >
              <Download size={14} />
            </button>
          )}

          {onClear && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'clear' ? styles.actionButtonHover : {}),
              }}
              onClick={onClear}
              onMouseEnter={() => setHoveredAction('clear')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Clear logs"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={logListRef}
        style={{
          ...styles.logList,
          maxHeight,
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={styles.empty}>
            {logs.length === 0 ? 'No logs yet' : 'No matching logs'}
          </div>
        ) : (
          filteredLogs.map((entry) => (
            <LogEntryRow
              key={entry.id}
              entry={entry}
              showTimestamp={showTimestamps}
              showSource={showSource}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LogViewer;
