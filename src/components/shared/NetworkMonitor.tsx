import React, { useState } from 'react';
import { Network, Globe, Server, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, RefreshCw, Search, Activity, Wifi, WifiOff, BarChart3 } from 'lucide-react';

type ConnectionStatus = 'active' | 'idle' | 'blocked' | 'error';
type TrafficType = 'inbound' | 'outbound';
type Protocol = 'http' | 'https' | 'ws' | 'wss' | 'tcp' | 'udp';

interface NetworkConnection {
  id: string;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  protocol: Protocol;
  status: ConnectionStatus;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  latency: number;
  startedAt: Date;
  lastActivity: Date;
  country?: string;
  userAgent?: string;
}

interface NetworkStats {
  totalConnections: number;
  activeConnections: number;
  blockedConnections: number;
  bytesInTotal: number;
  bytesOutTotal: number;
  requestsPerSecond: number;
  avgLatency: number;
  errorRate: number;
}

interface NetworkMonitorProps {
  connections: NetworkConnection[];
  stats: NetworkStats;
  onBlockConnection?: (connectionId: string) => void;
  onAllowConnection?: (connectionId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface ConnectionRowProps {
  connection: NetworkConnection;
  onBlock?: () => void;
  onAllow?: () => void;
}

const STATUS_CONFIG: Record<ConnectionStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  idle: {
    label: 'Idle',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  blocked: {
    label: 'Blocked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <Shield size={12} />,
  },
  error: {
    label: 'Error',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <AlertTriangle size={12} />,
  },
};

const PROTOCOL_CONFIG: Record<Protocol, { color: string }> = {
  http: { color: '#f59e0b' },
  https: { color: '#10b981' },
  ws: { color: '#3b82f6' },
  wss: { color: '#8b5cf6' },
  tcp: { color: '#ec4899' },
  udp: { color: '#14b8a6' },
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
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    marginTop: '0.5rem',
  },
  trafficCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  trafficCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  trafficHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  trafficTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  trafficValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
  },
  trafficBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.75rem',
  },
  trafficFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
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
  connectionCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  connectionIp: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    color: '#fff',
  },
  connectionPort: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  protocolBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(255, 255, 255, 0.05)',
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
  trafficCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  trafficItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  latencyCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
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
    padding: '0.375rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
  },
  blockButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  allowButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
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

const formatBytes = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
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

const getLatencyColor = (latency: number) => {
  if (latency < 50) return '#10b981';
  if (latency < 200) return '#f59e0b';
  return '#ef4444';
};

const ConnectionRow: React.FC<ConnectionRowProps> = ({
  connection,
  onBlock,
  onAllow,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[connection.status];
  const protocolConfig = PROTOCOL_CONFIG[connection.protocol];
  const latencyColor = getLatencyColor(connection.latency);

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
        <div style={styles.connectionCell}>
          <span style={styles.connectionIp}>{connection.sourceIp}</span>
          <span style={styles.connectionPort}>:{connection.sourcePort}</span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.connectionCell}>
          <span style={styles.connectionIp}>{connection.destinationIp}</span>
          <span style={styles.connectionPort}>:{connection.destinationPort}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.protocolBadge, color: protocolConfig.color }}>
          {connection.protocol}
        </span>
      </td>
      <td style={styles.td}>
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
      </td>
      <td style={styles.td}>
        <div style={styles.trafficCell}>
          <span style={{ ...styles.trafficItem, color: '#10b981' }}>
            <TrendingDown size={12} />
            {formatBytes(connection.bytesIn)}
          </span>
          <span style={{ ...styles.trafficItem, color: '#3b82f6' }}>
            <TrendingUp size={12} />
            {formatBytes(connection.bytesOut)}
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.latencyCell}>
          <Activity size={12} style={{ color: latencyColor }} />
          <span style={{ color: latencyColor, fontWeight: '600' }}>
            {connection.latency}ms
          </span>
        </div>
      </td>
      <td style={styles.td}>{formatTimeAgo(connection.lastActivity)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {connection.status !== 'blocked' && onBlock && (
            <button
              style={{ ...styles.actionButton, ...styles.blockButton }}
              onClick={onBlock}
            >
              Block
            </button>
          )}
          {connection.status === 'blocked' && onAllow && (
            <button
              style={{ ...styles.actionButton, ...styles.allowButton }}
              onClick={onAllow}
            >
              Allow
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({
  connections,
  stats,
  onBlockConnection,
  onAllowConnection,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConnections = connections.filter(c =>
    c.sourceIp.includes(searchQuery) ||
    c.destinationIp.includes(searchQuery)
  );

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Network size={22} />
          Network Monitor
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
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Wifi size={20} />
          </div>
          <div style={styles.statValue}>{stats.activeConnections}</div>
          <div style={styles.statLabel}>Active Connections</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{stats.blockedConnections}</div>
          <div style={styles.statLabel}>Blocked</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{stats.requestsPerSecond}/s</div>
          <div style={styles.statLabel}>Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Activity size={20} />
          </div>
          <div style={styles.statValue}>{stats.avgLatency}ms</div>
          <div style={styles.statLabel}>Avg Latency</div>
        </div>
      </div>

      {/* Traffic Cards */}
      <div style={styles.trafficCards}>
        <div style={styles.trafficCard}>
          <div style={styles.trafficHeader}>
            <span style={styles.trafficTitle}>
              <TrendingDown size={16} style={{ color: '#10b981' }} />
              Inbound Traffic
            </span>
          </div>
          <div style={styles.trafficValue}>{formatBytes(stats.bytesInTotal)}</div>
          <div style={styles.trafficBar}>
            <div
              style={{
                ...styles.trafficFill,
                width: '65%',
                background: '#10b981',
              }}
            />
          </div>
        </div>
        <div style={styles.trafficCard}>
          <div style={styles.trafficHeader}>
            <span style={styles.trafficTitle}>
              <TrendingUp size={16} style={{ color: '#3b82f6' }} />
              Outbound Traffic
            </span>
          </div>
          <div style={styles.trafficValue}>{formatBytes(stats.bytesOutTotal)}</div>
          <div style={styles.trafficBar}>
            <div
              style={{
                ...styles.trafficFill,
                width: '45%',
                background: '#3b82f6',
              }}
            />
          </div>
        </div>
      </div>

      {/* Connections Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Active Connections ({filteredConnections.length})</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by IP..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredConnections.length === 0 ? (
          <div style={styles.empty}>
            <Network size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No connections found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Source</th>
                <th style={styles.th}>Destination</th>
                <th style={styles.th}>Protocol</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Traffic</th>
                <th style={styles.th}>Latency</th>
                <th style={styles.th}>Last Activity</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredConnections.map((connection) => (
                <ConnectionRow
                  key={connection.id}
                  connection={connection}
                  onBlock={onBlockConnection ? () => onBlockConnection(connection.id) : undefined}
                  onAllow={onAllowConnection ? () => onAllowConnection(connection.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;
