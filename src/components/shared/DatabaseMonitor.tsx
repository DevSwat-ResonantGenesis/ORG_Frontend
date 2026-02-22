import React, { useState } from 'react';
import { Database, Activity, Clock, AlertTriangle, CheckCircle, RefreshCw, Search, Zap, HardDrive, Server, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

type ConnectionStatus = 'connected' | 'disconnected' | 'degraded';
type QueryStatus = 'running' | 'completed' | 'slow' | 'failed';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  host: string;
  status: ConnectionStatus;
  activeConnections: number;
  maxConnections: number;
  latency: number;
  uptime: number;
}

interface SlowQuery {
  id: string;
  query: string;
  database: string;
  duration: number;
  status: QueryStatus;
  timestamp: Date;
  rowsAffected?: number;
}

interface DatabaseStats {
  totalQueries: number;
  avgQueryTime: number;
  slowQueries: number;
  failedQueries: number;
  cacheHitRate: number;
  diskUsage: number;
  diskTotal: number;
}

interface DatabaseMonitorProps {
  connections: DatabaseConnection[];
  slowQueries: SlowQuery[];
  stats: DatabaseStats;
  onRefresh?: () => void;
  onKillQuery?: (queryId: string) => void;
  onViewQueryDetails?: (queryId: string) => void;
  className?: string;
}

interface ConnectionCardProps {
  connection: DatabaseConnection;
}

interface QueryRowProps {
  query: SlowQuery;
  onKill?: () => void;
  onViewDetails?: () => void;
}

const CONNECTION_STATUS_CONFIG: Record<ConnectionStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  connected: {
    label: 'Connected',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={14} />,
  },
  disconnected: {
    label: 'Disconnected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  degraded: {
    label: 'Degraded',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
};

const DB_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  postgresql: { color: '#336791', label: 'PostgreSQL' },
  mysql: { color: '#4479A1', label: 'MySQL' },
  mongodb: { color: '#47A248', label: 'MongoDB' },
  redis: { color: '#DC382D', label: 'Redis' },
};

const QUERY_STATUS_CONFIG: Record<QueryStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  running: { label: 'Running', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  completed: { label: 'Completed', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  slow: { label: 'Slow', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  failed: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  connectionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  connectionCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  connectionCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  connectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  connectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  connectionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  connectionHost: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  connectionMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.625rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  poolBar: {
    marginTop: '1rem',
  },
  poolProgress: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.375rem',
  },
  poolFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  poolText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.6875rem',
    color: '#888',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '200px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  queryCell: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#888',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  durationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  queryStatusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  killButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDuration = (ms: number): string => {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

const ConnectionCard: React.FC<ConnectionCardProps> = ({ connection }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = CONNECTION_STATUS_CONFIG[connection.status];
  const dbConfig = DB_TYPE_CONFIG[connection.type];
  const poolPercent = (connection.activeConnections / connection.maxConnections) * 100;
  const poolColor = poolPercent > 90 ? '#ef4444' : poolPercent > 70 ? '#f59e0b' : '#10b981';

  return (
    <div
      style={{
        ...styles.connectionCard,
        ...(isHovered ? styles.connectionCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.connectionHeader}>
        <div style={styles.connectionTitle}>
          <div
            style={{
              ...styles.connectionIcon,
              background: `${dbConfig.color}20`,
              color: dbConfig.color,
            }}
          >
            <Database size={20} />
          </div>
          <div>
            <div style={styles.connectionName}>{connection.name}</div>
            <div style={styles.connectionHost}>{connection.host}</div>
          </div>
        </div>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      <div style={styles.connectionMetrics}>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>{connection.latency}ms</span>
          <span style={styles.metricLabel}>Latency</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>{connection.uptime.toFixed(2)}%</span>
          <span style={styles.metricLabel}>Uptime</span>
        </div>
      </div>

      <div style={styles.poolBar}>
        <div style={styles.poolProgress}>
          <div
            style={{
              ...styles.poolFill,
              width: `${poolPercent}%`,
              background: poolColor,
            }}
          />
        </div>
        <div style={styles.poolText}>
          <span>Connections: {connection.activeConnections}/{connection.maxConnections}</span>
          <span>{poolPercent.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

const QueryRow: React.FC<QueryRowProps> = ({
  query,
  onKill,
  onViewDetails,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = QUERY_STATUS_CONFIG[query.status];
  const durationColor = query.duration > 5000 ? '#ef4444' : query.duration > 1000 ? '#f59e0b' : '#10b981';

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <span style={styles.queryCell} title={query.query}>
          {query.query}
        </span>
      </td>
      <td style={styles.td}>{query.database}</td>
      <td style={styles.td}>
        <div style={styles.durationCell}>
          <Clock size={12} style={{ color: durationColor }} />
          <span style={{ color: durationColor, fontWeight: '600' }}>
            {formatDuration(query.duration)}
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.queryStatusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>{formatTimeAgo(query.timestamp)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {query.status === 'running' && onKill && (
            <button style={styles.killButton} onClick={onKill}>
              Kill
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const DatabaseMonitor: React.FC<DatabaseMonitorProps> = ({
  connections,
  slowQueries,
  stats,
  onRefresh,
  onKillQuery,
  onViewQueryDetails,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQueries = slowQueries.filter(q =>
    q.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.database.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const diskPercent = (stats.diskUsage / stats.diskTotal) * 100;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Database size={22} />
          Database Monitor
        </h2>
        {onRefresh && (
          <button style={styles.refreshButton} onClick={onRefresh}>
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalQueries.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Queries</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{formatDuration(stats.avgQueryTime)}</div>
          <div style={styles.statLabel}>Avg Query Time</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.slowQueries}</div>
          <div style={styles.statLabel}>Slow Queries</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.failedQueries}</div>
          <div style={styles.statLabel}>Failed Queries</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.cacheHitRate.toFixed(1)}%</div>
          <div style={styles.statLabel}>Cache Hit Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{formatSize(stats.diskUsage)}</div>
          <div style={styles.statLabel}>Disk ({diskPercent.toFixed(0)}%)</div>
        </div>
      </div>

      {/* Connections */}
      <div style={styles.connectionsGrid}>
        {connections.map((connection) => (
          <ConnectionCard key={connection.id} connection={connection} />
        ))}
      </div>

      {/* Slow Queries */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Slow Queries ({filteredQueries.length})</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search queries..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredQueries.length === 0 ? (
          <div style={styles.empty}>
            <Activity size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No slow queries</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Query</th>
                <th style={styles.th}>Database</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => (
                <QueryRow
                  key={query.id}
                  query={query}
                  onKill={onKillQuery ? () => onKillQuery(query.id) : undefined}
                  onViewDetails={onViewQueryDetails ? () => onViewQueryDetails(query.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DatabaseMonitor;
