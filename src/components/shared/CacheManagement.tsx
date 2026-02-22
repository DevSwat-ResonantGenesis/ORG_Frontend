import React, { useState } from 'react';
import { Database, Trash2, RefreshCw, Search, CheckCircle, AlertTriangle, Clock, HardDrive, Zap, BarChart3, Server, Layers } from 'lucide-react';

type CacheType = 'memory' | 'redis' | 'cdn' | 'browser';
type CacheStatus = 'active' | 'stale' | 'expired';

interface CacheEntry {
  id: string;
  key: string;
  type: CacheType;
  status: CacheStatus;
  size: number;
  hits: number;
  misses: number;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
}

interface CacheStats {
  totalSize: number;
  maxSize: number;
  hitRate: number;
  missRate: number;
  totalEntries: number;
  activeEntries: number;
  staleEntries: number;
}

interface CacheManagementProps {
  entries: CacheEntry[];
  stats: CacheStats;
  onClearCache?: (type?: CacheType) => void;
  onDeleteEntry?: (entryId: string) => void;
  onRefreshEntry?: (entryId: string) => void;
  onRefreshStats?: () => void;
  className?: string;
}

interface CacheRowProps {
  entry: CacheEntry;
  onDelete?: () => void;
  onRefresh?: () => void;
}

const TYPE_CONFIG: Record<CacheType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  memory: { label: 'Memory', icon: <Zap size={14} />, color: '#8b5cf6' },
  redis: { label: 'Redis', icon: <Database size={14} />, color: '#ef4444' },
  cdn: { label: 'CDN', icon: <Server size={14} />, color: '#3b82f6' },
  browser: { label: 'Browser', icon: <Layers size={14} />, color: '#10b981' },
};

const STATUS_CONFIG: Record<CacheStatus, {
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
  stale: {
    label: 'Stale',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  expired: {
    label: 'Expired',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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
  usageBar: {
    marginTop: '0.75rem',
  },
  usageProgress: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.375rem',
  },
  usageFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  usageText: {
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
  keyCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  keyIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  keyName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    color: '#fff',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
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
  hitRate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  hitBar: {
    width: '50px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  hitFill: {
    height: '100%',
    background: '#10b981',
    borderRadius: '3px',
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
};

const formatTTL = (seconds: number): string => {
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`;
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m`;
  return `${seconds}s`;
};

const CacheRow: React.FC<CacheRowProps> = ({
  entry,
  onDelete,
  onRefresh,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = TYPE_CONFIG[entry.type];
  const statusConfig = STATUS_CONFIG[entry.status];
  const hitRate = entry.hits + entry.misses > 0
    ? (entry.hits / (entry.hits + entry.misses)) * 100
    : 0;

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
        <div style={styles.keyCell}>
          <div
            style={{
              ...styles.keyIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <span style={styles.keyName} title={entry.key}>{entry.key}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
          {typeConfig.icon}
          {typeConfig.label}
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
      <td style={styles.td}>{formatSize(entry.size)}</td>
      <td style={styles.td}>
        <div style={styles.hitRate}>
          <div style={styles.hitBar}>
            <div style={{ ...styles.hitFill, width: `${hitRate}%` }} />
          </div>
          <span style={{ fontSize: '0.75rem' }}>{hitRate.toFixed(0)}%</span>
        </div>
      </td>
      <td style={styles.td}>{formatTTL(entry.ttl)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh} title="Refresh">
              <RefreshCw size={14} />
            </button>
          )}
          {onDelete && (
            <button style={styles.actionButton} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const CacheManagement: React.FC<CacheManagementProps> = ({
  entries,
  stats,
  onClearCache,
  onDeleteEntry,
  onRefreshEntry,
  onRefreshStats,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CacheType | 'all'>('all');

  const filteredEntries = entries.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (searchQuery) {
      return e.key.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const usagePercent = (stats.totalSize / stats.maxSize) * 100;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Database size={22} />
          Cache Management
        </h2>
        <div style={styles.headerActions}>
          {onRefreshStats && (
            <button style={styles.refreshButton} onClick={onRefreshStats}>
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
          {onClearCache && (
            <button style={styles.clearButton} onClick={() => onClearCache()}>
              <Trash2 size={14} />
              Clear All Cache
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <HardDrive size={20} />
          </div>
          <div style={styles.statValue}>{formatSize(stats.totalSize)}</div>
          <div style={styles.statLabel}>Cache Size</div>
          <div style={styles.usageBar}>
            <div style={styles.usageProgress}>
              <div
                style={{
                  ...styles.usageFill,
                  width: `${Math.min(usagePercent, 100)}%`,
                  background: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
            <div style={styles.usageText}>
              <span>{usagePercent.toFixed(0)}% used</span>
              <span>{formatSize(stats.maxSize)} max</span>
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{stats.hitRate.toFixed(1)}%</div>
          <div style={styles.statLabel}>Hit Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Layers size={20} />
          </div>
          <div style={styles.statValue}>{stats.totalEntries.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Entries</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{stats.staleEntries}</div>
          <div style={styles.statLabel}>Stale Entries</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Cache Entries</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search cache keys..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div style={styles.empty}>
            <Database size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No cache entries found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Key</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Hit Rate</th>
                <th style={styles.th}>TTL</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <CacheRow
                  key={entry.id}
                  entry={entry}
                  onDelete={onDeleteEntry ? () => onDeleteEntry(entry.id) : undefined}
                  onRefresh={onRefreshEntry ? () => onRefreshEntry(entry.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CacheManagement;
