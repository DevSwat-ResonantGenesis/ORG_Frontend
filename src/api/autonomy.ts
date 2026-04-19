/**
 * FULL AUTONOMY API
 * =================
 * 
 * Frontend API client for DevSwat Full Autonomy System.
 * Connects to the autonomous agent backend endpoints.
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

const AUTONOMY_BASE = '/api/v1/autonomy';

// ============== TYPES ==============

export interface AutonomyStatus {
  running: boolean;
  startup_complete: boolean;
  subsystems: Record<string, {
    running: boolean;
    started_at: string | null;
    error: string | null;
  }>;
  healthy_subsystems: number;
  total_subsystems: number;
}

export interface AutonomyStats {
  system: AutonomyStatus;
  network?: NetworkStats;
  queue?: QueueStats;
  brains?: BrainStatus[];
  goals?: Record<string, any>;
}

export interface NetworkStats {
  total_agents: number;
  active_agents: number;
  pending_spawn_requests: number;
  total_tasks_completed: number;
  total_agents_spawned: number;
  by_role: Record<string, number>;
  topology: string;
}

export interface QueueStats {
  total_tasks: number;
  pending_tasks: number;
  registered_agents: number;
  by_status: Record<string, number>;
}

export interface BrainStatus {
  agent_id: string;
  name: string;
  state: string;
  current_goal: string;
  autonomy_level: number;
  actions_taken: number;
  successful_actions: number;
  success_rate: number;
  spawned_agents: number;
  decisions_made: number;
  running: boolean;
}

export interface NetworkAgent {
  id: string;
  name: string;
  role: string;
  status: string;
  workload: number;
  parent_id: string | null;
  children: string[];
  tasks_completed: number;
  agents_spawned: number;
}

export interface NetworkHierarchy {
  id: string;
  name: string;
  role: string;
  workload: number;
  tasks_completed: number;
  children: NetworkHierarchy[];
}

export interface QueueTask {
  id: string;
  description: string;
  status: string;
  priority: number;
  source: string;
  assigned_agent: string | null;
}

export interface WatchdogStatus {
  running: boolean;
  subsystems: Record<string, {
    level: string;
    last_check: string;
    failures: number;
  }>;
  healthy_count: number;
  total_count: number;
  recent_alerts: number;
}

export interface Alert {
  id: string;
  severity: string;
  subsystem: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface CreateAgentRequest {
  name: string;
  goal: string;
  capabilities?: string[];
}

export interface SpawnAgentRequest {
  name: string;
  role?: string;
  capabilities?: string[];
  parent_id?: string;
}

// ============== FULL AUTONOMY CONTROL ==============

/**
 * Start the full autonomy system.
 * After this, agents operate completely autonomously.
 */
export const startAutonomy = async (): Promise<{
  status: string;
  message: string;
  system_status: AutonomyStatus;
}> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/start`);
    logger.info('Full autonomy started', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to start autonomy', error);
    throw error;
  }
};

/**
 * Stop the full autonomy system.
 */
export const stopAutonomy = async (): Promise<{ status: string }> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/stop`);
    logger.info('Full autonomy stopped');
    return response.data;
  } catch (error) {
    logger.error('Failed to stop autonomy', error);
    throw error;
  }
};

/**
 * Get full autonomy system status.
 */
export const getAutonomyStatus = async (): Promise<AutonomyStatus> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/status`);
  return response.data;
};

/**
 * Get comprehensive statistics for all autonomous systems.
 */
export const getAutonomyStats = async (): Promise<AutonomyStats> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/stats`);
  return response.data;
};

/**
 * Quick start: Start full autonomy with one agent.
 * Easiest way to start DevSwat in full autonomous mode.
 */
export const quickStartAutonomy = async (
  agentName: string = 'ResonantAgent',
  goal: string = 'Be helpful and complete tasks autonomously'
): Promise<{
  status: string;
  agent_id: string;
  agent_name: string;
  goal: string;
  message: string;
  endpoints: Record<string, string>;
}> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/quick-start`, null, {
      params: { agent_name: agentName, goal }
    });
    logger.info('Quick start autonomy complete', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to quick start autonomy', error);
    throw error;
  }
};

// ============== AUTONOMOUS AGENT CREATION ==============

/**
 * Create a fully autonomous agent with a goal.
 * The agent will pursue this goal without any human intervention.
 */
export const createAutonomousAgent = async (
  request: CreateAgentRequest
): Promise<{
  agent_id: string;
  name: string;
  goal: string;
  status: string;
}> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/agents/create`, request);
    logger.info('Autonomous agent created', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to create autonomous agent', error);
    throw error;
  }
};

// ============== AGENT NETWORK ==============

/**
 * Get the agent network hierarchy.
 */
export const getNetworkHierarchy = async (): Promise<NetworkHierarchy> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/network/hierarchy`);
  return response.data;
};

/**
 * Get agent network statistics.
 */
export const getNetworkStats = async (): Promise<NetworkStats> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/network/stats`);
  return response.data;
};

/**
 * Spawn a new agent in the network.
 */
export const spawnNetworkAgent = async (
  request: SpawnAgentRequest
): Promise<{
  agent_id: string;
  name: string;
  role: string;
}> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/network/spawn`, request);
    logger.info('Network agent spawned', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to spawn network agent', error);
    throw error;
  }
};

/**
 * Get details of a network agent.
 */
export const getNetworkAgent = async (agentId: string): Promise<NetworkAgent> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/network/agents/${agentId}`);
  return response.data;
};

// ============== AGENT BRAINS ==============

/**
 * List all active agent brains.
 */
export const listBrains = async (): Promise<{ brains: BrainStatus[] }> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/brains`);
  return response.data;
};

/**
 * Get status of a specific agent brain.
 */
export const getBrainStatus = async (agentId: string): Promise<BrainStatus> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/brains/${agentId}`);
  return response.data;
};

/**
 * Set a new goal for an agent brain.
 */
export const setBrainGoal = async (
  agentId: string,
  goal: string
): Promise<{ agent_id: string; goal: string }> => {
  try {
    const response = await fastapiClient.post(`${AUTONOMY_BASE}/brains/${agentId}/goal`, { goal });
    logger.info('Brain goal set', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to set brain goal', error);
    throw error;
  }
};

// ============== AUTONOMOUS QUEUE ==============

/**
 * Get autonomous task queue statistics.
 */
export const getQueueStats = async (): Promise<QueueStats> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/queue/stats`);
  return response.data;
};

/**
 * List tasks in the queue.
 */
export const listQueueTasks = async (
  status?: string,
  limit: number = 50
): Promise<{ tasks: QueueTask[]; total: number }> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/queue/tasks`, {
    params: { status, limit }
  });
  return response.data;
};

// ============== WATCHDOG ==============

/**
 * Get system watchdog status.
 */
export const getWatchdogStatus = async (): Promise<WatchdogStatus> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/watchdog/status`);
  return response.data;
};

/**
 * Get system alerts.
 */
export const getWatchdogAlerts = async (
  unacknowledgedOnly: boolean = false
): Promise<{ alerts: Alert[] }> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/watchdog/alerts`, {
    params: { unacknowledged_only: unacknowledgedOnly }
  });
  return response.data;
};

/**
 * Acknowledge an alert.
 */
export const acknowledgeAlert = async (
  alertId: string
): Promise<{ acknowledged: boolean }> => {
  const response = await fastapiClient.post(`${AUTONOMY_BASE}/watchdog/alerts/${alertId}/acknowledge`);
  return response.data;
};

// ============== STARTUP INFO ==============

/**
 * Get auto-startup status.
 */
export const getStartupStatus = async (): Promise<{
  started: boolean;
  startup_time: string | null;
  restart_count: number;
  watchdog_active: boolean;
}> => {
  const response = await fastapiClient.get(`${AUTONOMY_BASE}/startup/status`);
  return response.data;
};

// ============== HOOKS ==============

/**
 * Custom hook for autonomy status polling.
 */
export const useAutonomyStatus = (pollingInterval: number = 5000) => {
  // This would be implemented with React Query or similar
  // For now, return a simple polling function
  return {
    poll: async () => {
      try {
        const status = await getAutonomyStatus();
        return { data: status, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  };
};

export default {
  startAutonomy,
  stopAutonomy,
  getAutonomyStatus,
  getAutonomyStats,
  quickStartAutonomy,
  createAutonomousAgent,
  getNetworkHierarchy,
  getNetworkStats,
  spawnNetworkAgent,
  getNetworkAgent,
  listBrains,
  getBrainStatus,
  setBrainGoal,
  getQueueStats,
  listQueueTasks,
  getWatchdogStatus,
  getWatchdogAlerts,
  acknowledgeAlert,
  getStartupStatus,
};
