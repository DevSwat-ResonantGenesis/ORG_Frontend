/**
 * Module 5: Usage Tracking API
 */
import { getApiUrl } from '@/utils/apiUrl';

export interface UsageReportRequest {
  project_id?: string;
  tokens?: number;
  cpu_ms?: number;
  ram_mb?: number;
  requests?: number;
  storage_mb?: number;
  llm_calls?: number;
  container_runtime_s?: number;
}

export interface UsageSummary {
  user_id: string;
  period: string;
  total_tokens: number;
  total_cpu_ms: number;
  total_ram_mb: number;
  total_requests: number;
  total_storage_mb: number;
  total_llm_calls: number;
  total_container_runtime_s: number;
  estimated_cost: number;
}

/**
 * Report usage metrics
 */
export async function reportUsage(request: UsageReportRequest): Promise<{
  status: string;
  user_id: string;
  date: string;
  usage: any;
}> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/usage/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to report usage' }));
    throw new Error(error.detail || 'Failed to report usage');
  }

  return response.json();
}

/**
 * Get usage summary
 */
export async function getUsageSummary(period: 'today' | 'week' | 'month' = 'month'): Promise<UsageSummary> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/usage/summary?period=${period}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get usage summary' }));
    throw new Error(error.detail || 'Failed to get usage summary');
  }

  return response.json();
}

/**
 * Get usage history
 */
export async function getUsageHistory(days: number = 30): Promise<{
  user_id: string;
  history: Array<any>;
}> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/usage/history?days=${days}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get usage history' }));
    throw new Error(error.detail || 'Failed to get usage history');
  }

  return response.json();
}

