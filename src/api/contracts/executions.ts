// ============== EXECUTION API CONTRACTS ==============

import type { Execution, ExecutionStatus, ExecutionMetrics, ExecutionTrace } from '../../types';

// Request Types
export interface StartExecutionRequest {
  agent_id: string;
  workflow_id?: string;
  input?: Record<string, unknown>;
  config?: {
    max_steps?: number;
    timeout_ms?: number;
    cost_limit?: number;
  };
}

export interface ListExecutionsRequest {
  agent_id?: string;
  workflow_id?: string;
  status?: ExecutionStatus;
  limit?: number;
  offset?: number;
  from_date?: string;
  to_date?: string;
}

// Response Types
export interface ExecutionResponse {
  id: string;
  agent_id: string;
  workflow_id: string | null;
  status: ExecutionStatus;
  current_step: number;
  total_steps: number;
  started_at: string;
  completed_at: string | null;
  error: string | null;
  metrics: {
    tokens_used: number;
    cost_usd: number;
    duration_ms: number;
    tool_calls: number;
    success_rate: number;
  };
  trace: Array<{
    step_id: string;
    timestamp: string;
    action: string;
    input: unknown;
    output: unknown;
    duration_ms: number;
    tokens_used: number;
    status: 'success' | 'failed' | 'skipped';
  }>;
}

export interface ListExecutionsResponse {
  executions: ExecutionResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface StartExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
  started_at: string;
}

// Transform functions
export function transformExecutionResponse(response: ExecutionResponse): Execution {
  return {
    id: response.id,
    agentId: response.agent_id,
    workflowId: response.workflow_id,
    status: response.status,
    currentStep: response.current_step,
    totalSteps: response.total_steps,
    startedAt: new Date(response.started_at),
    completedAt: response.completed_at ? new Date(response.completed_at) : null,
    error: response.error,
    metrics: {
      tokensUsed: response.metrics.tokens_used,
      costUsd: response.metrics.cost_usd,
      durationMs: response.metrics.duration_ms,
      toolCalls: response.metrics.tool_calls,
      successRate: response.metrics.success_rate,
    },
    trace: response.trace.map(t => ({
      stepId: t.step_id,
      timestamp: new Date(t.timestamp),
      action: t.action,
      input: t.input,
      output: t.output,
      durationMs: t.duration_ms,
      tokensUsed: t.tokens_used,
      status: t.status,
    })),
  };
}

// API Endpoints
export const EXECUTION_ENDPOINTS = {
  list: '/api/v1/executions',
  start: '/api/v1/executions',
  get: (id: string) => `/api/v1/executions/${id}`,
  cancel: (id: string) => `/api/v1/executions/${id}/cancel`,
  pause: (id: string) => `/api/v1/executions/${id}/pause`,
  resume: (id: string) => `/api/v1/executions/${id}/resume`,
  trace: (id: string) => `/api/v1/executions/${id}/trace`,
  metrics: (id: string) => `/api/v1/executions/${id}/metrics`,
} as const;
