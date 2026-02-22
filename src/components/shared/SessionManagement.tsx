import React, { useState } from 'react';
import { Monitor, Search, Trash2, MoreVertical, CheckCircle, XCircle, Clock, Globe, Smartphone, Laptop, Tablet, RefreshCw, Shield, AlertTriangle, LogOut } from 'lucide-react';

type SessionStatus = 'active' | 'idle' | 'expired';
type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown';

interface SessionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  status: SessionStatus;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isCurrent?: boolean;
}

interface SessionManagementProps {
  sessions: SessionData[];
  onTerminateSession?: (sessionId: string) => void;
  onTerminateAllSessions?: (userId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface SessionRowProps {
  session: SessionData;
  onTerminate?: () => void;
}

const STATUS_CONFIG: Record<SessionStatus, {
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
  expired: {
    label: 'Expired',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <XCircle size={12} />,
  },
};

const DEVICE_CONFIG: Record<DeviceType, {
  icon: React.ReactNode;
  label: string;
}> = {
  desktop: { icon: <Laptop size={16} />, label: 'Desktop' },
  mobile: { icon: <Smartphone size={16} />, label: 'Mobile' },
  tablet: { icon: <Tablet size={16} />, label: 'Tablet' },
  unknown: { icon: <Monitor size={16} />, label: 'Unknown' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
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
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
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
  trCurrent: {
    background: 'rgba(99, 102, 241, 0.05)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
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
  deviceCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  deviceIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
  },
  deviceInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  deviceBrowser: {
    fontSize: '0.8125rem',
    color: '#fff',
  },
  deviceOs: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  locationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#888',
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
  currentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    marginLeft: '0.5rem',
  },
  timeCell: {
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
  terminateButton: {
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const SessionRow: React.FC<SessionRowProps> = ({
  session,
  onTerminate,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[session.status];
  const deviceConfig = DEVICE_CONFIG[session.deviceType];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
        ...(session.isCurrent ? styles.trCurrent : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.userCell}>
          <span style={styles.userName}>
            {session.userName}
            {session.isCurrent && (
              <span style={styles.currentBadge}>
                <Shield size={10} />
                Current
              </span>
            )}
          </span>
          <span style={styles.userEmail}>{session.userEmail}</span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.deviceCell}>
          <div style={styles.deviceIcon}>
            {deviceConfig.icon}
          </div>
          <div style={styles.deviceInfo}>
            <span style={styles.deviceBrowser}>{session.browser}</span>
            <span style={styles.deviceOs}>{session.os}</span>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.locationCell}>
          <Globe size={12} />
          {session.ipAddress}
          {session.location && ` (${session.location})`}
        </div>
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
        <div style={styles.timeCell}>{formatTimeAgo(session.lastActivity)}</div>
      </td>
      <td style={styles.td}>
        <div style={styles.timeCell}>{formatDate(session.createdAt)}</div>
      </td>
      <td style={styles.td}>
        {onTerminate && !session.isCurrent && session.status !== 'expired' && (
          <button style={styles.terminateButton} onClick={onTerminate}>
            <LogOut size={12} />
            End
          </button>
        )}
      </td>
    </tr>
  );
};

export const SessionManagement: React.FC<SessionManagementProps> = ({
  sessions,
  onTerminateSession,
  onTerminateAllSessions,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(s =>
    s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ipAddress.includes(searchQuery)
  );

  const activeSessions = sessions.filter(s => s.status === 'active').length;
  const idleSessions = sessions.filter(s => s.status === 'idle').length;
  const uniqueUsers = new Set(sessions.map(s => s.userId)).size;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Monitor size={18} />
          Active Sessions
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search sessions..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{sessions.length}</span>
          <span style={styles.statLabel}>Total Sessions</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{activeSessions}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#f59e0b' }}>{idleSessions}</span>
          <span style={styles.statLabel}>Idle</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{uniqueUsers}</span>
          <span style={styles.statLabel}>Unique Users</span>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div style={styles.empty}>
          <Monitor size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No sessions found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Device</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last Activity</th>
              <th style={styles.th}>Started</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onTerminate={onTerminateSession ? () => onTerminateSession(session.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SessionManagement;
