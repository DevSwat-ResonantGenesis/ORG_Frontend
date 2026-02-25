/**
 * Daemon Control API Client
 * Connects to /owner/dashboard/daemons/* endpoints
 */

import { ENV } from '../config/env';

const API_BASE = ENV.apiUrl;

export interface DaemonStatus {
  name: string;
  id: string;
  status: 'running' | 'degraded' | 'configured' | 'disabled' | 'offline';
  online: boolean;
  description: string;
  llm_available?: boolean;
  provider?: string;
  verified_agents?: number;
  uptime_seconds?: number;
  enabled_in_env?: boolean;
}

export interface DaemonStatusResponse {
  daemons: DaemonStatus[];
  total: number;
  online: number;
  degraded: number;
  offline: number;
  timestamp: string;
}

export interface DaemonHealthResponse {
  status: string;
  online_count: number;
  total_count: number;
}

export async function getDaemonStatus(): Promise<DaemonStatusResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/status`);
  if (!res.ok) throw new Error(`Failed to fetch daemon status: ${res.statusText}`);
  return res.json();
}

export async function getDaemonHealth(): Promise<DaemonHealthResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/health`);
  if (!res.ok) throw new Error(`Failed to fetch daemon health: ${res.statusText}`);
  return res.json();
}

export async function getSingleDaemonStatus(daemonId: string): Promise<DaemonStatus> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/${daemonId}/status`);
  if (!res.ok) throw new Error(`Failed to fetch daemon ${daemonId}: ${res.statusText}`);
  return res.json();
}

// Control actions
export async function startAutonomousDaemon(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/autonomous_daemon/start`, { method: 'POST' });
  return res.json();
}

export async function stopAutonomousDaemon(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/autonomous_daemon/stop`, { method: 'POST' });
  return res.json();
}

export async function getAutonomousDaemonDetail(): Promise<{ success: boolean; data?: any; message?: string }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/autonomous_daemon/detail`);
  return res.json();
}

export async function toggleRaraKillSwitch(activate: boolean): Promise<{ success: boolean; kill_switch_active?: boolean }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/rara_service/kill_switch?activate=${activate}`, { method: 'POST' });
  return res.json();
}

export interface ChatResponse {
  success: boolean;
  response: string;
  session_id: string;
  model?: string;
}

export async function sendKnowledgeDaemonChat(message: string, sessionId?: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/daemons/knowledge_daemon/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId || 'owner-console' }),
  });
  return res.json();
}
