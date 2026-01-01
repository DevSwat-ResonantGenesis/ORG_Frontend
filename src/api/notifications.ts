/**
 * Notification Service API - In-app notifications, preferences, and real-time alerts
 */

import client from './client';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'system';
  title: string;
  message: string;
  category?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  categories: CategoryPreference[];
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
}

export interface CategoryPreference {
  category: string;
  email: boolean;
  push: boolean;
  in_app: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
}

export interface CreateNotificationRequest {
  type: 'info' | 'success' | 'warning' | 'error' | 'agent' | 'system';
  title: string;
  message: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_label?: string;
  metadata?: Record<string, unknown>;
  expires_at?: string;
  target_user_id?: string; // For admin sending to specific user
}

export interface ListNotificationsParams {
  type?: string;
  category?: string;
  read?: boolean;
  priority?: string;
  limit?: number;
  offset?: number;
}

// Notification APIs
export const listNotifications = async (
  params?: ListNotificationsParams
): Promise<Notification[]> => {
  const res = await client.get('/notifications', { params });
  return res.data;
};

export const getNotification = async (notificationId: string): Promise<Notification> => {
  const res = await client.get(`/notifications/${notificationId}`);
  return res.data;
};

export const createNotification = async (
  data: CreateNotificationRequest
): Promise<Notification> => {
  const res = await client.post('/notifications', data);
  return res.data;
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const res = await client.put(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllAsRead = async (category?: string): Promise<{ updated: number }> => {
  const params = category ? { category } : {};
  const res = await client.put('/notifications/read-all', null, { params });
  return res.data;
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await client.delete(`/notifications/${notificationId}`);
};

export const deleteAll = async (read_only?: boolean): Promise<{ deleted: number }> => {
  const params = read_only !== undefined ? { read_only } : {};
  const res = await client.delete('/notifications/all', { params });
  return res.data;
};

// Unread count (for badge)
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const res = await client.get('/notifications/unread/count');
  return res.data;
};

// Notification Stats
export const getNotificationStats = async (): Promise<NotificationStats> => {
  const res = await client.get('/notifications/stats');
  return res.data;
};

// Preferences APIs
export const getPreferences = async (): Promise<NotificationPreferences> => {
  const res = await client.get('/notifications/preferences');
  return res.data;
};

export const updatePreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const res = await client.put('/notifications/preferences', preferences);
  return res.data;
};

// Category management
export const getCategories = async (): Promise<string[]> => {
  const res = await client.get('/notifications/categories');
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/notifications/health');
  return res.data;
};

export default {
  listNotifications,
  getNotification,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAll,
  getUnreadCount,
  getNotificationStats,
  getPreferences,
  updatePreferences,
  getCategories,
  healthCheck,
};
