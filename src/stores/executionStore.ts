import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Execution, ExecutionStatus, ExecutionMetrics, ExecutionTrace } from '../types';

// ============== EXECUTION DOMAIN STORE ==============

interface ExecutionState {
  executions: Execution[];
  activeExecutionId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setExecutions: (executions: Execution[] | unknown) => void;
  addExecution: (execution: Execution) => void;
  updateExecution: (id: string, updates: Partial<Execution>) => void;
  removeExecution: (id: string) => void;
  setActiveExecution: (id: string | null) => void;
  
  // Lifecycle Actions
  startExecution: (agentId: string, workflowId?: string) => string;
  pauseExecution: (id: string) => void;
  resumeExecution: (id: string) => void;
  cancelExecution: (id: string) => void;
  completeExecution: (id: string, metrics: ExecutionMetrics) => void;
  failExecution: (id: string, error: string) => void;
  
  // Trace Actions
  addTraceStep: (executionId: string, step: ExecutionTrace) => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: Pick<ExecutionState, 'executions' | 'activeExecutionId' | 'loading' | 'error'> = {
  executions: [],
  activeExecutionId: null,
  loading: false,
  error: null,
};

export const useExecutionStore = create<ExecutionState>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setExecutions: (executions: Execution[] | unknown) =>
        set({ executions: Array.isArray(executions) ? (executions as Execution[]) : [] }),
      
      addExecution: (execution: Execution) => set((state) => ({
        executions: [...state.executions, execution]
      })),
      
      updateExecution: (id: string, updates: Partial<Execution>) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id ? { ...e, ...updates } : e
        )
      })),
      
      removeExecution: (id: string) => set((state) => ({
        executions: state.executions.filter((e: Execution) => e.id !== id),
        activeExecutionId: state.activeExecutionId === id ? null : state.activeExecutionId
      })),
      
      setActiveExecution: (id: string | null) => set({ activeExecutionId: id }),
      
      startExecution: (agentId: string, workflowId?: string) => {
        const executionId = `exec-${Date.now()}`;
        const newExecution: Execution = {
          id: executionId,
          agentId,
          workflowId: workflowId || null,
          status: 'running',
          currentStep: 0,
          totalSteps: 0,
          startedAt: new Date(),
          completedAt: null,
          error: null,
          metrics: {
            tokensUsed: 0,
            costUsd: 0,
            durationMs: 0,
            toolCalls: 0,
            successRate: 0,
          },
          trace: [],
        };
        set((state) => ({
          executions: [...state.executions, newExecution],
          activeExecutionId: executionId,
        }));
        return executionId;
      },
      
      pauseExecution: (id: string) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id && e.status === 'running'
            ? { ...e, status: 'paused' as ExecutionStatus }
            : e
        )
      })),
      
      resumeExecution: (id: string) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id && e.status === 'paused'
            ? { ...e, status: 'running' as ExecutionStatus }
            : e
        )
      })),
      
      cancelExecution: (id: string) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id && (e.status === 'running' || e.status === 'paused')
            ? { ...e, status: 'cancelled' as ExecutionStatus, completedAt: new Date() }
            : e
        )
      })),
      
      completeExecution: (id: string, metrics: ExecutionMetrics) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id
            ? { 
                ...e, 
                status: 'completed' as ExecutionStatus, 
                completedAt: new Date(),
                metrics: { ...e.metrics, ...metrics }
              }
            : e
        )
      })),
      
      failExecution: (id: string, error: string) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === id
            ? { 
                ...e, 
                status: 'failed' as ExecutionStatus, 
                completedAt: new Date(),
                error 
              }
            : e
        )
      })),
      
      addTraceStep: (executionId: string, step: ExecutionTrace) => set((state) => ({
        executions: state.executions.map((e: Execution) =>
          e.id === executionId
            ? { 
                ...e, 
                trace: [...e.trace, step],
                currentStep: e.currentStep + 1,
                metrics: {
                  ...e.metrics,
                  tokensUsed: e.metrics.tokensUsed + step.tokensUsed,
                  durationMs: e.metrics.durationMs + step.durationMs,
                  toolCalls: step.action.startsWith('tool:') ? e.metrics.toolCalls + 1 : e.metrics.toolCalls,
                }
              }
            : e
        )
      })),
      
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'ExecutionStore' }
  )
);

// Selectors
export const selectExecutions = (state: ExecutionState) => state.executions;
export const selectActiveExecution = (state: ExecutionState) =>
  (Array.isArray(state.executions) ? state.executions : []).find(
    (e: Execution) => e.id === state.activeExecutionId
  ) || null;
export const selectRunningExecutions = (state: ExecutionState) =>
  (Array.isArray(state.executions) ? state.executions : []).filter(
    (e: Execution) => e.status === 'running'
  );
export const selectExecutionsByAgent = (agentId: string) => (state: ExecutionState) =>
  (Array.isArray(state.executions) ? state.executions : []).filter(
    (e: Execution) => e.agentId === agentId
  );
