import fastapiClient from './fastapiClient';

export interface SystemHealth {
  api_status: 'healthy' | 'unhealthy' | 'unknown';
  ml_worker_status: 'healthy' | 'unhealthy' | 'unknown';
  database_status: 'healthy' | 'unhealthy' | 'unknown';
}

export interface SystemMetrics {
  total_organizations: number;
  total_users: number;
  total_predictions: number;
  predictions_24h?: number;
  api_latency_ms?: number;
}

export const fetchSystemHealth = async (): Promise<SystemHealth> => {
  const res = await fastapiClient.get('/admin/system/health').catch(() => ({ 
    data: { 
      api_status: 'unknown', 
      ml_worker_status: 'unknown', 
      database_status: 'unknown' 
    } 
  }));
  return res.data;
};

export const fetchSystemMetrics = async (): Promise<SystemMetrics> => {
  const res = await fastapiClient.get('/admin/system/metrics').catch(() => ({ 
    data: { 
      total_organizations: 0, 
      total_users: 0, 
      total_predictions: 0 
    } 
  }));
  return res.data;
};

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  service: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const fetchFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const res = await fastapiClient.get('/admin/feature-flags');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const updateFeatureFlag = async (flagId: string, enabled: boolean): Promise<FeatureFlag> => {
  const res = await fastapiClient.put(`/admin/feature-flags/${flagId}`, { enabled });
  return res.data;
};

export const fetchSystemLogs = async (limit: number = 100, level?: string): Promise<SystemLog[]> => {
  const params: any = { limit };
  if (level) params.level = level;
  const res = await fastapiClient.get('/admin/system/logs', { params });
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

