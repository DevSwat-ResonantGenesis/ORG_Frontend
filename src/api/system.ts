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
  agents: any[];
  agent_count: number;
  governance: any;
  kill_switch: any;
  health: any;
  timestamp: string;
}

export interface SystemOverview {
  system?: { cpu_percent: number; memory_percent: number; memory_used_gb: number };
  services?: { total: number; online: number; healthy: number };
  timestamp: string;
}

export async function getSystemMetrics(): Promise<SystemMetrics> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/metrics`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getServiceHealth(): Promise<ServiceHealthResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/services`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getDatabaseStats(): Promise<DatabaseStats> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/database`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getRaraAgents(): Promise<RaraData> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/rara`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}

export async function getSystemOverview(): Promise<SystemOverview> {
  const res = await fetch(`${API_BASE}/owner/dashboard/system/overview`);
  if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
  return res.json();
}
