import React, { useState } from 'react';
import { User, Bot, Settings, Shield, Key, Trash2, Edit2, Plus, Eye, Download, ChevronDown, ChevronRight } from 'lucide-react';

type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'invite' | 'remove' | 'configure';
type AuditResource = 'agent' | 'session' | 'team' | 'user' | 'api_key' | 'webhook' | 'settings' | 'billing';

interface AuditLogData {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  resourceName?: string;
  actor: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    type: 'user' | 'system' | 'api';
  };
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
}

interface AuditLogEntryProps {
  entry: AuditLogData;
  showDetails?: boolean;
  className?: string;
}

interface AuditLogListProps {
  entries: AuditLogData[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

const ACTION_CONFIG: Record<AuditAction, {
  icon: React.ReactNode;
  color: string;
  label: string;
}> = {
  create: { icon: <Plus size={14} />, color: '#10b981', label: 'Created' },
  update: { icon: <Edit2 size={14} />, color: '#3b82f6', label: 'Updated' },
  delete: { icon: <Trash2 size={14} />, color: '#ef4444', label: 'Deleted' },
  view: { icon: <Eye size={14} />, color: '#888', label: 'Viewed' },
  login: { icon: <Key size={14} />, color: '#10b981', label: 'Logged in' },
  logout: { icon: <Key size={14} />, color: '#888', label: 'Logged out' },
  export: { icon: <Download size={14} />, color: '#8b5cf6', label: 'Exported' },
  invite: { icon: <User size={14} />, color: '#3b82f6', label: 'Invited' },
  remove: { icon: <Trash2 size={14} />, color: '#ef4444', label: 'Removed' },
  configure: { icon: <Settings size={14} />, color: '#f59e0b', label: 'Configured' },
};

const RESOURCE_CONFIG: Record<AuditResource, {
  icon: React.ReactNode;
  label: string;
}> = {
  agent: { icon: <Bot size={14} />, label: 'Agent' },
  session: { icon: <Eye size={14} />, label: 'Session' },
  team: { icon: <User size={14} />, label: 'Team' },
  user: { icon: <User size={14} />, label: 'User' },
  api_key: { icon: <Key size={14} />, label: 'API Key' },
  webhook: { icon: <Settings size={14} />, label: 'Webhook' },
  settings: { icon: <Settings size={14} />, label: 'Settings' },
  billing: { icon: <Shield size={14} />, label: 'Billing' },
};

const styles: Record<string, React.CSSProperties> = {
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.15s',
  },
  entryHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  actionIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  summary: {
    fontSize: '0.875rem',
    color: '#e4e4e7',
    lineHeight: 1.4,
  },
  actor: {
    fontWeight: '600',
    color: '#fff',
  },
  action: {
    fontWeight: '500',
  },
  resource: {
    color: '#818cf8',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.375rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  timestamp: {
    color: '#888',
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  details: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    fontSize: '0.75rem',
  },
  detailLabel: {
    color: '#888',
    minWidth: '80px',
    flexShrink: 0,
  },
  detailValue: {
    color: '#e4e4e7',
    fontFamily: "'JetBrains Mono', monospace",
    wordBreak: 'break-all',
  },
  changes: {
    marginTop: '0.75rem',
  },
  changesTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  changeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.375rem',
    fontSize: '0.75rem',
  },
  changeField: {
    color: '#888',
    minWidth: '100px',
  },
  changeOld: {
    color: '#ef4444',
    textDecoration: 'line-through',
    padding: '0.125rem 0.375rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '3px',
  },
  changeArrow: {
    color: '#666',
  },
  changeNew: {
    color: '#10b981',
    padding: '0.125rem 0.375rem',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '3px',
  },
  list: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  listTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  loadMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
  },
  loadMoreButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '0.875rem',
  },
};

export const AuditLogEntry: React.FC<AuditLogEntryProps> = ({
  entry,
  showDetails = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const actionConfig = ACTION_CONFIG[entry.action];
  const resourceConfig = RESOURCE_CONFIG[entry.resource];

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getActorLabel = () => {
    if (entry.actor.type === 'system') return 'System';
    if (entry.actor.type === 'api') return 'API';
    return entry.actor.name;
  };

  const hasDetails = entry.ipAddress || entry.userAgent || entry.metadata || entry.changes;

  return (
    <div
      style={{
        ...styles.entry,
        ...(isHovered ? styles.entryHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          ...styles.actionIcon,
          background: `${actionConfig.color}15`,
          color: actionConfig.color,
        }}
      >
        {actionConfig.icon}
      </div>

      <div style={styles.content}>
        <div style={styles.summary}>
          <span style={styles.actor}>{getActorLabel()}</span>
          {' '}
          <span style={{ ...styles.action, color: actionConfig.color }}>
            {actionConfig.label.toLowerCase()}
          </span>
          {' '}
          {entry.resourceName ? (
            <span style={styles.resource}>{entry.resourceName}</span>
          ) : (
            <span>{resourceConfig.label.toLowerCase()}</span>
          )}
        </div>

        <div style={styles.meta}>
          <span style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</span>
          {entry.ipAddress && <span>{entry.ipAddress}</span>}
          {hasDetails && (
            <button
              style={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Details
            </button>
          )}
        </div>

        {isExpanded && hasDetails && (
          <div style={styles.details}>
            {entry.ipAddress && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>IP Address</span>
                <span style={styles.detailValue}>{entry.ipAddress}</span>
              </div>
            )}
            {entry.userAgent && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>User Agent</span>
                <span style={styles.detailValue}>{entry.userAgent}</span>
              </div>
            )}
            {entry.resourceId && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Resource ID</span>
                <span style={styles.detailValue}>{entry.resourceId}</span>
              </div>
            )}

            {entry.changes && entry.changes.length > 0 && (
              <div style={styles.changes}>
                <div style={styles.changesTitle}>Changes</div>
                {entry.changes.map((change, index) => (
                  <div key={index} style={styles.changeRow}>
                    <span style={styles.changeField}>{change.field}</span>
                    {change.oldValue && (
                      <span style={styles.changeOld}>{change.oldValue}</span>
                    )}
                    <span style={styles.changeArrow}>→</span>
                    <span style={styles.changeNew}>{change.newValue || '(empty)'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AuditLogList: React.FC<AuditLogListProps> = ({
  entries,
  onLoadMore,
  hasMore = false,
  loading = false,
  className,
}) => (
  <div style={styles.list} className={className}>
    <div style={styles.listHeader}>
      <span style={styles.listTitle}>Audit Log</span>
    </div>

    {entries.length === 0 ? (
      <div style={styles.empty}>No audit log entries</div>
    ) : (
      entries.map((entry) => (
        <AuditLogEntry key={entry.id} entry={entry} />
      ))
    )}

    {hasMore && onLoadMore && (
      <div style={styles.loadMore}>
        <button
          style={styles.loadMoreButton}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    )}
  </div>
);

export default AuditLogEntry;
