/**
 * AUTONOMY HOOKS
 * ==============
 * 
 * React hooks for interacting with the Full Autonomy System.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as autonomyApi from '../api/autonomy';
import type {
  AutonomyStatus,
  AutonomyStats,
  NetworkHierarchy,
  NetworkStats,
  BrainStatus,
  QueueStats,
  QueueTask,
  WatchdogStatus,
  Alert,
  CreateAgentRequest,
  SpawnAgentRequest,
} from '../api/autonomy';

// ============== STATUS HOOK ==============

interface UseAutonomyStatusOptions {
  pollingInterval?: number;
  enabled?: boolean;
}

interface UseAutonomyStatusResult {
  status: AutonomyStatus | null;
  stats: AutonomyStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAutonomyStatus(
  options: UseAutonomyStatusOptions = {}
): UseAutonomyStatusResult {
  const { pollingInterval = 5000, enabled = true } = options;
  
  const [status, setStatus] = useState<AutonomyStatus | null>(null);
  const [stats, setStats] = useState<AutonomyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statusData, statsData] = await Promise.all([
        autonomyApi.getAutonomyStatus(),
        autonomyApi.getAutonomyStats(),
      ]);
      setStatus(statusData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch autonomy status'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    if (pollingInterval > 0) {
      intervalRef.current = setInterval(fetchData, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollingInterval, fetchData]);

  return { status, stats, isLoading, error, refetch: fetchData };
}

// ============== NETWORK HOOK ==============

interface UseNetworkResult {
  hierarchy: NetworkHierarchy | null;
  stats: NetworkStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  spawnAgent: (request: SpawnAgentRequest) => Promise<void>;
}

export function useAgentNetwork(): UseNetworkResult {
  const [hierarchy, setHierarchy] = useState<NetworkHierarchy | null>(null);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [hierarchyData, statsData] = await Promise.all([
        autonomyApi.getNetworkHierarchy(),
        autonomyApi.getNetworkStats(),
      ]);
      setHierarchy(hierarchyData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch network data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const spawnAgent = useCallback(async (request: SpawnAgentRequest) => {
    await autonomyApi.spawnNetworkAgent(request);
    await fetchData(); // Refresh after spawn
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { hierarchy, stats, isLoading, error, refetch: fetchData, spawnAgent };
}

// ============== BRAINS HOOK ==============

interface UseBrainsResult {
  brains: BrainStatus[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setGoal: (agentId: string, goal: string) => Promise<void>;
}

export function useAgentBrains(): UseBrainsResult {
  const [brains, setBrains] = useState<BrainStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await autonomyApi.listBrains();
      setBrains(data.brains);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch brains'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoal = useCallback(async (agentId: string, goal: string) => {
    await autonomyApi.setBrainGoal(agentId, goal);
    await fetchData(); // Refresh after update
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { brains, isLoading, error, refetch: fetchData, setGoal };
}

// ============== QUEUE HOOK ==============

interface UseQueueResult {
  stats: QueueStats | null;
  tasks: QueueTask[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAutonomousQueue(): UseQueueResult {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [tasks, setTasks] = useState<QueueTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, tasksData] = await Promise.all([
        autonomyApi.getQueueStats(),
        autonomyApi.listQueueTasks(),
      ]);
      setStats(statsData);
      setTasks(tasksData.tasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch queue data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, tasks, isLoading, error, refetch: fetchData };
}

// ============== WATCHDOG HOOK ==============

interface UseWatchdogResult {
  status: WatchdogStatus | null;
  alerts: Alert[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
}

export function useWatchdog(): UseWatchdogResult {
  const [status, setStatus] = useState<WatchdogStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statusData, alertsData] = await Promise.all([
        autonomyApi.getWatchdogStatus(),
        autonomyApi.getWatchdogAlerts(),
      ]);
      setStatus(statusData);
      setAlerts(alertsData.alerts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch watchdog data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    await autonomyApi.acknowledgeAlert(alertId);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { status, alerts, isLoading, error, refetch: fetchData, acknowledgeAlert };
}

// ============== CONTROL HOOK ==============

interface UseAutonomyControlResult {
  isStarting: boolean;
  isStopping: boolean;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  quickStart: (name?: string, goal?: string) => Promise<string>;
  createAgent: (request: CreateAgentRequest) => Promise<string>;
}

export function useAutonomyControl(): UseAutonomyControlResult {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(async () => {
    try {
      setIsStarting(true);
      setError(null);
      await autonomyApi.startAutonomy();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start autonomy'));
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      setIsStopping(true);
      setError(null);
      await autonomyApi.stopAutonomy();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to stop autonomy'));
      throw err;
    } finally {
      setIsStopping(false);
    }
  }, []);

  const quickStart = useCallback(async (name?: string, goal?: string): Promise<string> => {
    try {
      setIsStarting(true);
      setError(null);
      const result = await autonomyApi.quickStartAutonomy(name, goal);
      return result.agent_id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to quick start'));
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const createAgent = useCallback(async (request: CreateAgentRequest): Promise<string> => {
    try {
      setError(null);
      const result = await autonomyApi.createAutonomousAgent(request);
      return result.agent_id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create agent'));
      throw err;
    }
  }, []);

  return { isStarting, isStopping, error, start, stop, quickStart, createAgent };
}

// ============== EXPORTS ==============

export default {
  useAutonomyStatus,
  useAgentNetwork,
  useAgentBrains,
  useAutonomousQueue,
  useWatchdog,
  useAutonomyControl,
};
