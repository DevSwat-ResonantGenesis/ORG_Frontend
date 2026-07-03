/**
 * DSID-P Accelerator React Hook
 * 
 * Provides reactive state management for DSID-P features in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dsidp, {
  initializeDSIDP,
  getCostMetrics,
  getFeatureFlags,
  toggleFeature,
  scanCodeSecurity,
  executeAutonomousTask,
  getCurrentTask,
  onTaskUpdate,
  getPerformanceMetrics,
  getDSIDPStatus,
  type CostMetrics,
  type SecurityScanResult,
  type ExecutionTask,
  type PerformanceMetrics,
  type DSIDPStatus,
} from '@/api/dsidpAccelerator';

// ============== INITIALIZATION HOOK ==============

export function useDSIDPInit() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    try {
      initializeDSIDP({
        llmProvider: 'openai',
        enableCostTracking: true,
        enableFeatureFlags: true,
        enablePlugins: true,
      });
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize DSID-P');
    }
  }, []);

  return { initialized, error };
}

// ============== COST TRACKING HOOK ==============

export function useCostMetrics(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<CostMetrics>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    costByModel: {},
    recentUsage: [],
  });

  useEffect(() => {
    const update = () => setMetrics(getCostMetrics());
    update();
    
    const interval = setInterval(update, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return metrics;
}

// ============== FEATURE FLAGS HOOK ==============

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Array<{
    key: string;
    name: string;
    enabled: boolean;
    description: string;
  }>>([]);

  useEffect(() => {
    setFlags(getFeatureFlags());
  }, []);

  const toggle = useCallback((key: string, enabled: boolean) => {
    toggleFeature(key, enabled);
    setFlags(getFeatureFlags());
  }, []);

  const isEnabled = useCallback((key: string) => {
    return flags.find(f => f.key === key)?.enabled ?? false;
  }, [flags]);

  return { flags, toggle, isEnabled };
}

// ============== SECURITY SCANNING HOOK ==============

export function useSecurityScanner() {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<SecurityScanResult | null>(null);

  const scan = useCallback(async (code: string, filename?: string) => {
    setScanning(true);
    try {
      const result = await scanCodeSecurity(code, filename);
      setLastResult(result);
      return result;
    } finally {
      setScanning(false);
    }
  }, []);

  return { scanning, lastResult, scan };
}

// ============== AUTONOMOUS EXECUTION HOOK ==============

export function useAutonomousExecution() {
  const [task, setTask] = useState<ExecutionTask | null>(getCurrentTask());
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const unsubscribe = onTaskUpdate((updatedTask) => {
      setTask(updatedTask);
      setExecuting(updatedTask.status === 'running' || updatedTask.status === 'pending');
    });
    return unsubscribe;
  }, []);

  const execute = useCallback(async (description: string) => {
    setExecuting(true);
    try {
      const result = await executeAutonomousTask(description);
      return result;
    } finally {
      setExecuting(false);
    }
  }, []);

  return { task, executing, execute };
}

// ============== PERFORMANCE METRICS HOOK ==============

export function usePerformanceMetrics(refreshInterval = 2000) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    activeConnections: 0,
  });

  useEffect(() => {
    const update = () => setMetrics(getPerformanceMetrics());
    update();
    
    const interval = setInterval(update, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return metrics;
}

// ============== DSIDP STATUS HOOK ==============

export function useDSIDPStatus(refreshInterval = 3000) {
  const [status, setStatus] = useState<DSIDPStatus>({
    initialized: false,
    version: '1.0.0',
    modules: [],
    metrics: {
      totalRequests: 0,
      totalCost: 0,
      securityScore: 100,
    },
  });

  useEffect(() => {
    const update = () => setStatus(getDSIDPStatus());
    update();
    
    const interval = setInterval(update, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return status;
}

// ============== COMBINED HOOK ==============

export function useDSIDP() {
  const { initialized, error } = useDSIDPInit();
  const costMetrics = useCostMetrics();
  const { flags, toggle, isEnabled } = useFeatureFlags();
  const { scanning, lastResult, scan } = useSecurityScanner();
  const { task, executing, execute } = useAutonomousExecution();
  const performanceMetrics = usePerformanceMetrics();
  const status = useDSIDPStatus();

  return {
    // Initialization
    initialized,
    error,
    
    // Cost tracking
    costMetrics,
    
    // Feature flags
    flags,
    toggleFeature: toggle,
    isFeatureEnabled: isEnabled,
    
    // Security
    scanning,
    securityResult: lastResult,
    scanCode: scan,
    
    // Autonomous execution
    currentTask: task,
    executing,
    executeTask: execute,
    
    // Performance
    performanceMetrics,
    
    // Status
    status,
  };
}

export default useDSIDP;
