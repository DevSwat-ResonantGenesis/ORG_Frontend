// ============== NOTIFICATIONS SERVICE ==============
// Toast notifications and notification center management

// ============== TYPES ==============
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  persistent: boolean;
  duration?: number;
  actions?: NotificationAction[];
  source?: string;
  icon?: string;
  progress?: number;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  source?: string;
  icon?: string;
}

type NotificationHandler = (notification: Notification) => void;
type DismissHandler = (id: string) => void;

// ============== NOTIFICATIONS SERVICE ==============
class NotificationsService {
  private notifications: Notification[] = [];
  private notificationHandlers = new Set<NotificationHandler>();
  private dismissHandlers = new Set<DismissHandler>();
  private maxNotifications = 100;
  private defaultDuration = 5000;

  // Show notification
  show(title: string, options: NotificationOptions = {}): string {
    const notification: Notification = {
      id: this.generateId(),
      type: options.type || 'info',
      title,
      message: options.message,
      timestamp: Date.now(),
      read: false,
      persistent: options.persistent || false,
      duration: options.duration ?? this.defaultDuration,
      actions: options.actions,
      source: options.source,
      icon: options.icon,
    };

    this.notifications.unshift(notification);
    this.trimNotifications();
    this.notifyHandlers(notification);

    // Auto-dismiss non-persistent notifications
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  // Convenience methods
  info(title: string, options?: Omit<NotificationOptions, 'type'>): string {
    return this.show(title, { ...options, type: 'info' });
  }

  success(title: string, options?: Omit<NotificationOptions, 'type'>): string {
    return this.show(title, { ...options, type: 'success' });
  }

  warning(title: string, options?: Omit<NotificationOptions, 'type'>): string {
    return this.show(title, { ...options, type: 'warning' });
  }

  error(title: string, options?: Omit<NotificationOptions, 'type'>): string {
    return this.show(title, { ...options, type: 'error', persistent: true });
  }

  // Show progress notification
  progress(title: string, options?: Omit<NotificationOptions, 'type'>): {
    id: string;
    update: (progress: number, message?: string) => void;
    complete: (title?: string) => void;
    error: (message: string) => void;
  } {
    const id = this.show(title, { ...options, type: 'info', persistent: true });

    return {
      id,
      update: (progress: number, message?: string) => {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.progress = progress;
          if (message) notification.message = message;
          this.notifyHandlers(notification);
        }
      },
      complete: (completeTitle?: string) => {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.type = 'success';
          notification.title = completeTitle || notification.title;
          notification.progress = 100;
          notification.persistent = false;
          this.notifyHandlers(notification);
          setTimeout(() => this.dismiss(id), 3000);
        }
      },
      error: (message: string) => {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
          notification.type = 'error';
          notification.message = message;
          notification.progress = undefined;
          this.notifyHandlers(notification);
        }
      },
    };
  }

  // Dismiss notification
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.dismissHandlers.forEach(handler => handler(id));
    }
  }

  // Dismiss all notifications
  dismissAll(): void {
    const ids = this.notifications.map(n => n.id);
    this.notifications = [];
    ids.forEach(id => {
      this.dismissHandlers.forEach(handler => handler(id));
    });
  }

  // Mark as read
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  // Get all notifications
  getAll(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Subscribe to new notifications
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  // Subscribe to dismissals
  onDismiss(handler: DismissHandler): () => void {
    this.dismissHandlers.add(handler);
    return () => this.dismissHandlers.delete(handler);
  }

  private notifyHandlers(notification: Notification): void {
    this.notificationHandlers.forEach(handler => handler(notification));
  }

  private trimNotifications(): void {
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const notificationsService = new NotificationsService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(notificationsService.getAll());
  const [unreadCount, setUnreadCount] = useState(notificationsService.getUnreadCount());

  useEffect(() => {
    const unsubNotif = notificationsService.onNotification(() => {
      setNotifications(notificationsService.getAll());
      setUnreadCount(notificationsService.getUnreadCount());
    });

    const unsubDismiss = notificationsService.onDismiss(() => {
      setNotifications(notificationsService.getAll());
      setUnreadCount(notificationsService.getUnreadCount());
    });

    return () => {
      unsubNotif();
      unsubDismiss();
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    notificationsService.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    notificationsService.dismissAll();
  }, []);

  const markAsRead = useCallback((id: string) => {
    notificationsService.markAsRead(id);
    setUnreadCount(notificationsService.getUnreadCount());
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationsService.markAllAsRead();
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    show: notificationsService.show.bind(notificationsService),
    info: notificationsService.info.bind(notificationsService),
    success: notificationsService.success.bind(notificationsService),
    warning: notificationsService.warning.bind(notificationsService),
    error: notificationsService.error.bind(notificationsService),
    progress: notificationsService.progress.bind(notificationsService),
  };
}

export function useToast() {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubNotif = notificationsService.onNotification((notification) => {
      if (!notification.persistent) {
        setToasts(prev => [...prev, notification]);
      }
    });

    const unsubDismiss = notificationsService.onDismiss((id) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    });

    return () => {
      unsubNotif();
      unsubDismiss();
    };
  }, []);

  return {
    toasts,
    dismiss: (id: string) => notificationsService.dismiss(id),
  };
}

export default notificationsService;
