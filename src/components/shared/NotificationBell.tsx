import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
  onSettingsClick?: () => void;
  className?: string;
}

const TYPE_CONFIG: Record<NotificationType, {
  color: string;
  bgColor: string;
}> = {
  info: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  success: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  button: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  buttonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  badge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ef4444',
    borderRadius: '8px',
    fontSize: '0.625rem',
    fontWeight: '700',
    color: '#fff',
    padding: '0 4px',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    width: '360px',
    maxHeight: '480px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
    zIndex: 1000,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  headerButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  list: {
    maxHeight: '360px',
    overflow: 'auto',
  },
  item: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  itemHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  itemUnread: {
    background: 'rgba(99, 102, 241, 0.05)',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '0.375rem',
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  itemMessage: {
    fontSize: '0.75rem',
    color: '#888',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  itemTime: {
    fontSize: '0.6875rem',
    color: '#666',
    marginTop: '0.375rem',
  },
  itemActions: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.25rem',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  itemActionsVisible: {
    opacity: 1,
  },
  itemButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 1rem',
    color: '#666',
  },
  emptyIcon: {
    marginBottom: '0.75rem',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '0.875rem',
  },
  footer: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
  },
  footerLink: {
    fontSize: '0.8125rem',
    color: '#818cf8',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = TYPE_CONFIG[notification.type];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        ...styles.item,
        ...(isHovered ? styles.itemHover : {}),
        ...(!notification.read ? styles.itemUnread : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          ...styles.indicator,
          background: notification.read ? 'transparent' : config.color,
        }}
      />
      <div style={styles.itemContent}>
        <div style={styles.itemTitle}>{notification.title}</div>
        {notification.message && (
          <div style={styles.itemMessage}>{notification.message}</div>
        )}
        <div style={styles.itemTime}>{formatTime(notification.timestamp)}</div>
        {notification.action && (
          <button
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              background: config.bgColor,
              border: 'none',
              borderRadius: '4px',
              color: config.color,
              fontSize: '0.6875rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              notification.action?.onClick();
            }}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <div
        style={{
          ...styles.itemActions,
          ...(isHovered ? styles.itemActionsVisible : {}),
        }}
      >
        {!notification.read && onMarkAsRead && (
          <button
            style={styles.itemButton}
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            title="Mark as read"
          >
            <Check size={12} />
          </button>
        )}
        {onDelete && (
          <button
            style={styles.itemButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            title="Delete"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onSettingsClick,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [hoveredHeaderButton, setHoveredHeaderButton] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={styles.container} className={className}>
      <button
        style={{
          ...styles.button,
          ...(isButtonHovered ? styles.buttonHover : {}),
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.header}>
            <span style={styles.headerTitle}>Notifications</span>
            <div style={styles.headerActions}>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  style={{
                    ...styles.headerButton,
                    ...(hoveredHeaderButton === 'markAll' ? styles.headerButtonHover : {}),
                  }}
                  onClick={onMarkAllAsRead}
                  onMouseEnter={() => setHoveredHeaderButton('markAll')}
                  onMouseLeave={() => setHoveredHeaderButton(null)}
                  title="Mark all as read"
                >
                  <Check size={16} />
                </button>
              )}
              {notifications.length > 0 && onClearAll && (
                <button
                  style={{
                    ...styles.headerButton,
                    ...(hoveredHeaderButton === 'clear' ? styles.headerButtonHover : {}),
                  }}
                  onClick={onClearAll}
                  onMouseEnter={() => setHoveredHeaderButton('clear')}
                  onMouseLeave={() => setHoveredHeaderButton(null)}
                  title="Clear all"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {onSettingsClick && (
                <button
                  style={{
                    ...styles.headerButton,
                    ...(hoveredHeaderButton === 'settings' ? styles.headerButtonHover : {}),
                  }}
                  onClick={onSettingsClick}
                  onMouseEnter={() => setHoveredHeaderButton('settings')}
                  onMouseLeave={() => setHoveredHeaderButton(null)}
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <Bell size={32} style={styles.emptyIcon} />
                <span style={styles.emptyText}>No notifications</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
