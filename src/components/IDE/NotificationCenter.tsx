// ============== NOTIFICATION CENTER ==============
// Toast notifications and notification history

import React, { memo, useState, useCallback, useEffect, createContext, useContext } from 'react';
import styles from './NotificationCenter.module.css';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  timestamp: Date;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  maxNotifications = 50,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// ============== TOAST CONTAINER ==============

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = memo(({
  position = 'bottom-right',
  maxToasts = 5,
}) => {
  const { notifications, removeNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);

  useEffect(() => {
    const newToasts = notifications
      .filter(n => !n.read && n.duration !== 0)
      .slice(0, maxToasts)
      .map(n => n.id);
    
    setVisibleToasts(newToasts);
  }, [notifications, maxToasts]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleToasts.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          setVisibleToasts(prev => prev.filter(t => t !== id));
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [visibleToasts, notifications]);

  const positionClass = {
    'top-right': styles.topRight,
    'top-left': styles.topLeft,
    'bottom-right': styles.bottomRight,
    'bottom-left': styles.bottomLeft,
  }[position];

  return (
    <div className={`${styles.toastContainer} ${positionClass}`}>
      {visibleToasts.map(id => {
        const notification = notifications.find(n => n.id === id);
        if (!notification) return null;

        return (
          <Toast
            key={id}
            notification={notification}
            onClose={() => removeNotification(id)}
          />
        );
      })}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

// ============== TOAST ==============

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = memo(({ notification, onClose }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[notification.type]}`}>
      <span className={styles.toastIcon}>{getIcon(notification.type)}</span>
      <div className={styles.toastContent}>
        <span className={styles.toastTitle}>{notification.title}</span>
        {notification.message && (
          <span className={styles.toastMessage}>{notification.message}</span>
        )}
        {notification.action && (
          <button
            className={styles.toastAction}
            onClick={() => {
              notification.action?.onClick();
              onClose();
            }}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button className={styles.toastClose} onClick={onClose}>×</button>
    </div>
  );
});

Toast.displayName = 'Toast';

// ============== NOTIFICATION PANEL ==============

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = memo(({
  isOpen,
  onClose,
}) => {
  const { notifications, removeNotification, clearAll, markAsRead } = useNotifications();

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.panelOverlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>
            Notifications
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </h3>
          <div className={styles.panelActions}>
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear all
            </button>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        <div className={styles.panelContent}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔔</span>
              <p>No notifications</p>
              <small>You're all caught up!</small>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${styles[notification.type]} ${notification.read ? styles.read : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <span className={styles.notificationIcon}>{getIcon(notification.type)}</span>
                <div className={styles.notificationContent}>
                  <span className={styles.notificationTitle}>{notification.title}</span>
                  {notification.message && (
                    <span className={styles.notificationMessage}>{notification.message}</span>
                  )}
                  <span className={styles.notificationTime}>{formatTime(notification.timestamp)}</span>
                </div>
                <button
                  className={styles.dismissBtn}
                  onClick={e => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

NotificationPanel.displayName = 'NotificationPanel';

// ============== NOTIFICATION BELL ==============

interface NotificationBellProps {
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = memo(({ onClick }) => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <button className={styles.bell} onClick={onClick}>
      <span className={styles.bellIcon}>🔔</span>
      {unreadCount > 0 && (
        <span className={styles.bellBadge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default {
  NotificationProvider,
  ToastContainer,
  NotificationPanel,
  NotificationBell,
  useNotifications,
};
