import React, { useState } from 'react';
import { Shield, Search, Filter, Download, AlertTriangle, CheckCircle, XCircle, Clock, User, Globe, Key, Lock, Unlock, Eye, MoreVertical, Calendar, ChevronDown } from 'lucide-react';

type AuditEventType = 'login' | 'logout' | 'password_change' | 'api_key_created' | 'api_key_revoked' | 'permission_change' | 'data_access' | 'settings_change' | 'failed_login' | 'mfa_enabled' | 'mfa_disabled';
type AuditSeverity = 'info' | 'warning' | 'critical';
type AuditStatus = 'success' | 'failure' | 'blocked';

interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: AuditSeverity;
  status: AuditStatus;
  userId?: string;
  userName?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

interface SecurityStats {
  totalEvents: number;
  failedLogins: number;
  blockedAttempts: number;
  activeUsers: number;
  suspiciousActivities: number;
}

interface SecurityAuditProps {
  events: AuditEvent[];
  stats: SecurityStats;
  onExport?: () => void;
  onViewDetails?: (eventId: string) => void;
  onBlockUser?: (userId: string) => void;
  className?: string;
}

interface AuditRowProps {
  event: AuditEvent;
  onViewDetails?: () => void;
  onBlockUser?: () => void;
}

const EVENT_CONFIG: Record<AuditEventType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  login: { label: 'Login', icon: <Lock size={14} />, color: '#10b981' },
  logout: { label: 'Logout', icon: <Unlock size={14} />, color: '#888' },
  password_change: { label: 'Password Change', icon: <Key size={14} />, color: '#f59e0b' },
  api_key_created: { label: 'API Key Created', icon: <Key size={14} />, color: '#3b82f6' },
  api_key_revoked: { label: 'API Key Revoked', icon: <Key size={14} />, color: '#ef4444' },
  permission_change: { label: 'Permission Change', icon: <Shield size={14} />, color: '#8b5cf6' },
  data_access: { label: 'Data Access', icon: <Eye size={14} />, color: '#14b8a6' },
  settings_change: { label: 'Settings Change', icon: <Shield size={14} />, color: '#f59e0b' },
  failed_login: { label: 'Failed Login', icon: <XCircle size={14} />, color: '#ef4444' },
  mfa_enabled: { label: 'MFA Enabled', icon: <Shield size={14} />, color: '#10b981' },
  mfa_disabled: { label: 'MFA Disabled', icon: <AlertTriangle size={14} />, color: '#f59e0b' },
};

const SEVERITY_CONFIG: Record<AuditSeverity, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  info: { label: 'Info', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  warning: { label: 'Warning', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  critical: { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

const STATUS_CONFIG: Record<AuditStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  success: { label: 'Success', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={12} /> },
  failure: { label: 'Failed', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)', icon: <XCircle size={12} /> },
  blocked: { label: 'Blocked', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)', icon: <AlertTriangle size={12} /> },
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
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
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
  filterButton: {
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
  eventCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  eventIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventType: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  eventDescription: {
    fontSize: '0.75rem',
    color: '#888',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: '500',
    color: '#fff',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#888',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
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
  locationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#888',
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
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '140px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
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
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    color: '#ef4444',
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

const formatTimestamp = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
};

const AuditRow: React.FC<AuditRowProps> = ({
  event,
  onViewDetails,
  onBlockUser,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const eventConfig = EVENT_CONFIG[event.type];
  const severityConfig = SEVERITY_CONFIG[event.severity];
  const statusConfig = STATUS_CONFIG[event.status];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.eventCell}>
          <div
            style={{
              ...styles.eventIcon,
              background: `${eventConfig.color}20`,
              color: eventConfig.color,
            }}
          >
            {eventConfig.icon}
          </div>
          <div>
            <div style={styles.eventType}>{eventConfig.label}</div>
            <div style={styles.eventDescription}>{event.description}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        {event.userName ? (
          <div style={styles.userCell}>
            <span style={styles.userName}>{event.userName}</span>
            <span style={styles.userEmail}>{event.userEmail}</span>
          </div>
        ) : (
          <span style={{ color: '#666' }}>System</span>
        )}
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.severityBadge,
            background: severityConfig.bgColor,
            color: severityConfig.color,
          }}
        >
          {severityConfig.label}
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
        <div style={styles.locationCell}>
          <Globe size={12} />
          {event.ipAddress}
          {event.location && ` (${event.location})`}
        </div>
      </td>
      <td style={styles.td}>{formatTimestamp(event.timestamp)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <button
          style={styles.actionButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>
        {showMenu && (
          <div style={styles.dropdown}>
            {onViewDetails && (
              <button style={styles.dropdownItem} onClick={onViewDetails}>
                <Eye size={14} />
                View Details
              </button>
            )}
            {onBlockUser && event.userId && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onBlockUser}
              >
                <Shield size={14} />
                Block User
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const SecurityAudit: React.FC<SecurityAuditProps> = ({
  events,
  stats,
  onExport,
  onViewDetails,
  onBlockUser,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');

  const filteredEvents = events.filter(e => {
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        e.description.toLowerCase().includes(query) ||
        e.userName?.toLowerCase().includes(query) ||
        e.userEmail?.toLowerCase().includes(query) ||
        e.ipAddress.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Security Audit
        </h2>
        <div style={styles.headerActions}>
          {onExport && (
            <button style={styles.exportButton} onClick={onExport}>
              <Download size={14} />
              Export Logs
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{stats.totalEvents.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Events</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div style={styles.statValue}>{stats.failedLogins}</div>
          <div style={styles.statLabel}>Failed Logins</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{stats.blockedAttempts}</div>
          <div style={styles.statLabel}>Blocked Attempts</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <User size={20} />
          </div>
          <div style={styles.statValue}>{stats.activeUsers}</div>
          <div style={styles.statLabel}>Active Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Eye size={20} />
          </div>
          <div style={styles.statValue}>{stats.suspiciousActivities}</div>
          <div style={styles.statLabel}>Suspicious</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Audit Log</span>
          <div style={styles.filterBar}>
            <div style={styles.searchInput}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search events..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              style={styles.filterButton}
              onClick={() => setSeverityFilter(severityFilter === 'all' ? 'critical' : 'all')}
            >
              <Filter size={14} />
              {severityFilter === 'all' ? 'All Severity' : severityFilter}
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div style={styles.empty}>
            <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No audit events found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Event</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Severity</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <AuditRow
                  key={event.id}
                  event={event}
                  onViewDetails={onViewDetails ? () => onViewDetails(event.id) : undefined}
                  onBlockUser={onBlockUser && event.userId ? () => onBlockUser(event.userId!) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SecurityAudit;
