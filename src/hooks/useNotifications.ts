/**
 * useNotifications hook - Manages notification state and API calls
 */

import { useState, useEffect, useCallback } from 'react';
import * as notificationsAPI from '../api/notifications';
import type { Notification, NotificationPreferences } from '../api/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifs, countResult] = await Promise.all([
        notificationsAPI.listNotifications({ limit: 50 }),
        notificationsAPI.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countResult.count);
    } catch (err: any) {
      // Don't show error if service is unavailable - just return empty
      if (err?.response?.status === 404 || err?.response?.status === 503) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        setError(err.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all as read');
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id);
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
    }
  }, [notifications]);

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await notificationsAPI.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      // Silently fail - preferences not critical
    }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      const updated = await notificationsAPI.updatePreferences(prefs);
      setPreferences(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
    loadPreferences();
  }, [refresh, loadPreferences]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      notificationsAPI.getUnreadCount()
        .then(result => setUnreadCount(result.count))
        .catch(() => {}); // Silently fail polling
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    preferences,
    updatePreferences,
  };
}

export default useNotifications;
