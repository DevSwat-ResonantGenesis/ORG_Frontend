/**
 * System Metrics API Client
 * Connects to /owner/dashboard/system/* endpoints for real system data
 */

import { ENV } from '../config/env';

const API_BASE = ENV.apiUrl;

export interface SystemMetrics {
  cpu: { usage_percent: number; cores: number; load_avg: number[] };
  memory: { total_gb: number; used_gb: number; available_gb: number; usage_percent: number };
  disk: { total_gb: number; used_gb: number; free_gb: number; usage_percent: number };
  network: { bytes_sent: number; bytes_recv: number; packets_sent: number; packets_recv: number };
  uptime_seconds: number;
  uptime_human: string;
  timestamp: string;
}

export interface ServiceHealthItem {
  key: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  online: boolean;
  error?: string;
}

export interface ServiceHealthResponse {
  services: ServiceHealthItem[];
  total: number;
  online: number;
  healthy: number;
  degraded: number;
  offline: number;
  timestamp: string;
}

export interface DatabaseStats {
  databases: {
    postgresql: { status: string; connections?: number; url_masked?: string };
    redis: { status: string; url_masked?: string };
  };
  timestamp: string;
}

export interface RaraData {
  agents: RaraAgent[];
  total_agents: number;
  governance: any;
  kill_switch_active: boolean;
  health: any;
  timestamp: string;
}

export interface RaraAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  tasks_completed: number;
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  last_task: string;
  capabilities: number;
  trust_score: number;
}

export interface SystemOverview {
  system?: { cpu_percent: number; memory_percent: number; disk_percent: number };
  services?: { total: number; healthy: number; offline: number };
  agents?: { total: number; active: number };
  users?: { total: number; active_24h?: number };
  timestamp: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  status: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  plan: string;
  org_name: string;
  mfa_enabled: boolean;
  email_verified: boolean;
  unlimited_credits: boolean;
  trial_status: string | null;
  trial_expires_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  chat_count: number;
  message_count: number;
}

export interface UsersResponse {
  users: PlatformUser[];
  total: number;
  error?: string;
}

export interface PlatformAnalytics {
  credits_consumed: number | null;
  api_calls_30d: number | null;
  api_calls_24h: number | null;
  conversion_rate: number | null;
  total_users: number | null;
  active_users_24h: number | null;
  paid_users: number | null;
  paying_users?: number | null;
  revenue_30d: number | null;
  mrr?: number | null;
  total_credits_purchased?: number | null;
  credits_balance?: number | null;
  active_subscriptions?: number | null;
  billing_status?: string | null;
  avg_response_time_ms: number | null;
  error_rate_24h: number | null;
  active_connections: number | null;
  timestamp: string;
}

export interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
  category: string;
}

export interface ActivityResponse {
  activities: ActivityItem[];
  total: number;
  timestamp: string;
}

export interface V8Data {
  status: { version?: string; trained?: boolean; vocab_size?: number; max_vocab_size?: number; forbidden_count?: number; anchors_count?: number; pending_vocab?: number; status?: string };
  formula: { resonance_scale?: number; spin_factor?: number; energy_decay?: number; cluster_threshold?: number };
  forbidden: string[];
  corpus: any;
  timestamp: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('owner_token') || localStorage.getItem('access_token');
  if (token) return { 'Authorization': `Bearer ${token}` };
  return {};
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/metrics`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getServiceHealth(): Promise<ServiceHealthResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/services`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/database`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getRaraAgents(): Promise<RaraData> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/rara`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getSystemOverview(): Promise<SystemOverview> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/overview`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getPlatformUsers(): Promise<UsersResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/users`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/analytics`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getRecentActivity(): Promise<ActivityResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/activity`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getV8Data(): Promise<V8Data> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/v8`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export interface UsageAnalytics {
  platform_totals: {
    total_messages: number;
    total_chats: number;
    total_credits_used: number;
    total_logins: number;
    active_users_7d: number;
  };
  ai_provider_usage: { provider: string; messages: number }[];
  service_usage: { service: string; transactions: number; credits_spent: number }[];
  top_users_by_chat: { email: string; name: string; messages: number; chats: number }[];
  top_users_by_credits: { email: string; name: string; credits_spent: number; transactions: number }[];
  per_user_stats: {
    id: string; email: string; name: string; role: string; plan: string;
    last_login: string | null; signup_date: string | null;
    chat_count: number; message_count: number;
    credits_spent: number; credits_received: number; txn_count: number;
    unlimited_credits: boolean; is_superuser: boolean;
  }[];
  login_trends: { event: string; date: string; count: number }[];
  timestamp: string;
  error?: string;
}

export async function getUsageAnalytics(): Promise<UsageAnalytics> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/analytics/usage`, { headers: authHeaders(), credentials: 'include' });
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}
