// ============== WORKFLOW PERFORMANCE HOOKS ==============
// Optimized hooks for workflow execution and monitoring

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { workflowApi, executionApi, type Workflow, type WorkflowExecution } from '../api/workflowService';

// ============== TYPES ==============

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  stepDurations: Map<string, number>;
  memoryUsage?: number;
  renderCount: number;
}

interface WorkflowState {
  workflow: Workflow | null;
  execution: WorkflowExecution | null;
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;
  metrics: PerformanceMetrics;
}

interface UseWorkflowOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onExecutionComplete?: (execution: WorkflowExecution) => void;
  onError?: (error: Error) => void;
}

// ============== PERFORMANCE CACHE ==============

const workflowCache = new Map<string, { data: Workflow; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCachedWorkflow(id: string): Workflow | null {
  const cached = workflowCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedWorkflow(id: string, data: Workflow): void {
  workflowCache.set(id, { data, timestamp: Date.now() });
}

// ============== OPTIMIZED WORKFLOW HOOK ==============

export function useWorkflow(workflowId: string | null, options: UseWorkflowOptions = {}) {
  const { autoRefresh = false, refreshInterval = 5000, onExecutionComplete, onError } = options;
  
  const [state, setState] = useState<WorkflowState>({
    workflow: null,
    execution: null,
    isLoading: false,
    isExecuting: false,
    error: null,
    metrics: {
      startTime: 0,
      stepDurations: new Map(),
      renderCount: 0,
    },
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef(0);

  // Track render count for performance monitoring
  useEffect(() => {
    renderCountRef.current++;
    setState(prev => ({
      ...prev,
      metrics: { ...prev.metrics, renderCount: renderCountRef.current },
    }));
  });

  // Fetch workflow with caching
  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) return;

    // Check cache first
    const cached = getCachedWorkflow(workflowId);
    if (cached) {
      setState(prev => ({ ...prev, workflow: cached, isLoading: false }));
      return;
    }

    // Cancel any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    const startTime = performance.now();

    try {
      const workflow = await workflowApi.get(workflowId);
      const duration = performance.now() - startTime;

      setCachedWorkflow(workflowId, workflow);
      
      setState(prev => ({
        ...prev,
        workflow,
        isLoading: false,
        metrics: {
          ...prev.metrics,
          startTime,
          duration,
        },
      }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch workflow',
        }));
        onError?.(error);
      }
    }
  }, [workflowId, onError]);

  // Execute workflow with performance tracking
  const execute = useCallback(async (input?: Record<string, any>) => {
    if (!workflowId) return null;

    setState(prev => ({ ...prev, isExecuting: true, error: null }));
    const startTime = performance.now();

    try {
      const execution = await workflowApi.execute(workflowId, { input, async: true });
      
      setState(prev => ({
        ...prev,
        execution,
        isExecuting: execution.status === 'running',
        metrics: {
          ...prev.metrics,
          startTime,
        },
      }));

      // Start polling for execution updates
      if (execution.status === 'running') {
        startPolling(execution.id);
      }

      return execution;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: error.message || 'Execution failed',
      }));
      onError?.(error);
      return null;
    }
  }, [workflowId, onError]);

  // Poll for execution updates
  const startPolling = useCallback((executionId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const execution = await executionApi.get(executionId);
        
        setState(prev => {
          // Track step durations
          const stepDurations = new Map(prev.metrics.stepDurations);
          execution.steps.forEach(step => {
            if (step.startedAt && step.completedAt) {
              const duration = new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime();
              stepDurations.set(step.nodeId, duration);
            }
          });

          return {
            ...prev,
            execution,
            isExecuting: execution.status === 'running',
            metrics: {
              ...prev.metrics,
              stepDurations,
              endTime: execution.status !== 'running' ? performance.now() : undefined,
            },
          };
        });

        if (execution.status !== 'running' && execution.status !== 'pending') {
          stopPolling();
          onExecutionComplete?.(execution);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, refreshInterval);
  }, [refreshInterval, onExecutionComplete]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cancel execution
  const cancel = useCallback(async () => {
    if (!state.execution?.id) return;

    try {
      await executionApi.cancel(state.execution.id);
      stopPolling();
      setState(prev => ({ ...prev, isExecuting: false }));
    } catch (error: any) {
      onError?.(error);
    }
  }, [state.execution?.id, stopPolling, onError]);

  // Initial fetch
  useEffect(() => {
    fetchWorkflow();
    return () => {
      abortControllerRef.current?.abort();
      stopPolling();
    };
  }, [fetchWorkflow, stopPolling]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !workflowId) return;

    const interval = setInterval(fetchWorkflow, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, workflowId, refreshInterval, fetchWorkflow]);

  return {
    ...state,
    execute,
    cancel,
    refresh: fetchWorkflow,
  };
}

// ============== BATCH WORKFLOW HOOK ==============

export function useWorkflowList(options: {
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await workflowApi.list(options);
      setWorkflows(result.workflows);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workflows');
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { workflows, total, isLoading, error, refresh: fetch };
}

// ============== EXECUTION HISTORY HOOK ==============

export function useExecutionHistory(workflowId?: string, limit = 10) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await executionApi.list({ workflowId, limit });
      setExecutions(result.executions);
    } catch (error) {
      console.error('Failed to fetch execution history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Compute performance stats
  const stats = useMemo(() => {
    if (executions.length === 0) return null;

    const completed = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');
    
    const durations = completed
      .filter(e => e.startedAt && e.completedAt)
      .map(e => new Date(e.completedAt!).getTime() - new Date(e.startedAt).getTime());

    return {
      total: executions.length,
      completed: completed.length,
      failed: failed.length,
      successRate: completed.length / executions.length,
      avgDuration: durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    };
  }, [executions]);

  return { executions, stats, isLoading, refresh: fetch };
}

// ============== PERFORMANCE MONITOR HOOK ==============

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    networkLatency: 0,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      frameTimesRef.current.push(delta);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);

      // Get memory if available
      const memory = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;

      setMetrics(prev => ({
        ...prev,
        fps,
        memory: Math.round(memory),
      }));

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

export default {
  useWorkflow,
  useWorkflowList,
  useExecutionHistory,
  usePerformanceMonitor,
};
