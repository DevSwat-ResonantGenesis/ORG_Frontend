import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, Info, X, Settings, Send, Users, Filter, Search, MoreVertical, Trash2, Eye } from 'lucide-react';

type NotificationType = 'system' | 'alert' | 'message' | 'announcement';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
type NotificationStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

interface NotificationData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  recipients: number;
  sentAt?: Date;
  scheduledFor?: Date;
  createdAt: Date;
  openRate?: number;
}

interface NotificationCenterProps {
  notifications: NotificationData[];
  onSend?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onEdit?: (notificationId: string) => void;
  onCreateNew?: () => void;
  className?: string;
}

interface NotificationRowProps {
  notification: NotificationData;
  onSend?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const TYPE_CONFIG: Record<NotificationType, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  system: {
    label: 'System',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Settings size={14} />,
  },
  alert: {
    label: 'Alert',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  message: {
    label: 'Message',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <MessageSquare size={14} />,
  },
  announcement: {
    label: 'Announcement',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Bell size={14} />,
  },
};

const PRIORITY_CONFIG: Record<NotificationPriority, {
  label: string;
  color: string;
}> = {
  low: { label: 'Low', color: '#888' },
  medium: { label: 'Medium', color: '#3b82f6' },
  high: { label: 'High', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
};

const STATUS_CONFIG: Record<NotificationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: {
    label: 'Draft',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
  },
  scheduled: {
    label: 'Scheduled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  sent: {
    label: 'Sent',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
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
    width: '180px',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
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
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  notificationCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  notificationIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notificationTitle: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  notificationMessage: {
    fontSize: '0.75rem',
    color: '#888',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '300px',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  recipientsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onSend,
  onDelete,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = TYPE_CONFIG[notification.type];
  const statusConfig = STATUS_CONFIG[notification.status];
  const priorityConfig = PRIORITY_CONFIG[notification.priority];

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
        <div style={styles.notificationCell}>
          <div
            style={{
              ...styles.notificationIcon,
              background: typeConfig.bgColor,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div>
            <div style={styles.notificationTitle}>{notification.title}</div>
            <div style={styles.notificationMessage}>{notification.message}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.typeBadge,
            background: typeConfig.bgColor,
            color: typeConfig.color,
          }}
        >
          {typeConfig.icon}
          {typeConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ ...styles.priorityDot, background: priorityConfig.color }} />
          <span style={{ color: priorityConfig.color }}>{priorityConfig.label}</span>
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
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.recipientsCell}>
          <Users size={14} color="#888" />
          {notification.recipients.toLocaleString()}
        </div>
      </td>
      <td style={styles.td}>
        {notification.sentAt ? formatDate(notification.sentAt) : 
         notification.scheduledFor ? `Scheduled: ${formatDate(notification.scheduledFor)}` : 
         '-'}
      </td>
      <td style={styles.td}>
        {notification.openRate !== undefined ? `${notification.openRate}%` : '-'}
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <button
          style={styles.actionButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>
        {showMenu && (
          <div style={styles.dropdown}>
            {onEdit && (
              <button style={styles.dropdownItem} onClick={onEdit}>
                <Eye size={14} />
                View/Edit
              </button>
            )}
            {onSend && notification.status === 'draft' && (
              <button style={styles.dropdownItem} onClick={onSend}>
                <Send size={14} />
                Send Now
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onSend,
  onDelete,
  onEdit,
  onCreateNew,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = notifications.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const draftCount = notifications.filter(n => n.status === 'draft').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;
  const totalRecipients = notifications.reduce((sum, n) => sum + n.recipients, 0);

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Bell size={18} />
          Notification Center
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search notifications..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateNew && (
            <button style={styles.createButton} onClick={onCreateNew}>
              <Send size={14} />
              New Notification
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{sentCount}</span>
          <span style={styles.statLabel}>Sent</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{draftCount}</span>
          <span style={styles.statLabel}>Drafts</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{scheduledCount}</span>
          <span style={styles.statLabel}>Scheduled</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{totalRecipients.toLocaleString()}</span>
          <span style={styles.statLabel}>Total Recipients</span>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.empty}>
          <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No notifications found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Notification</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Recipients</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Open Rate</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onSend={onSend ? () => onSend(notification.id) : undefined}
                onDelete={onDelete ? () => onDelete(notification.id) : undefined}
                onEdit={onEdit ? () => onEdit(notification.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NotificationCenter;
