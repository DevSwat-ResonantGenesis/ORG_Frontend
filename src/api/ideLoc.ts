/**
 * IDE LOC Tracking API — fetch lines-of-code statistics for Resonant AI
 */

import fastapiClient from './fastapiClient';

export interface DailyStat {
  date: string;
  lines_written: number;
  lines_edited: number;
  net: number;
  calls: number;
}

export interface UserLocStats {
  user_id: string;
  user_email: string;
  total_lines_written: number;
  total_lines_edited: number;
  total_lines_deleted: number;
  total_net_lines: number;
  total_files_created: number;
  total_files_modified: number;
  total_tool_calls: number;
  languages: Record<string, number>;
  sessions: number;
  last_active: string | null;
  daily_stats?: DailyStat[];
}

export interface AdminLocStats {
  total_users: number;
  total_lines_written: number;
  total_lines_edited: number;
  total_net_lines: number;
  total_tool_calls: number;
  users: UserLocStats[];
}

export interface LiveLocStats {
  total_lines_all_time: number;
  lines_today: number;
  active_users_today: number;
  total_users: number;
}

export async function getMyLocStats(): Promise<UserLocStats> {
  const response = await fastapiClient.get('/api/v1/ide/loc/stats/me');
  return response.data;
}

export async function getAdminLocStats(): Promise<AdminLocStats> {
  const response = await fastapiClient.get('/api/v1/ide/loc/stats/admin');
  return response.data;
}

export async function getLiveLocStats(): Promise<LiveLocStats> {
  const response = await fastapiClient.get('/api/v1/ide/loc/stats/live');
  return response.data;
}
