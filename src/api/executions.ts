/**
 * Executions API Client
 * Handles agent execution history and monitoring
 */

import fastapiClient from './fastapiClient';

const executionPath = (path: string) => `/api/v1/execution${path}`;

export interface ExecutionStep {
  id: string;
  step_number: number;
  type: 'think' | 'plan' | 'tool_call' | 'observe' | 'respond';
  reasoning?: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
  input?: any;
  output?: any;
  created_at?: string;
}

export interface Execution {
  id: string;
  agent_id: string;
  agentId?: string; // Alias for compatibility
  status: 'initializing' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  goal?: string;
  loop_count: number;
  tokens_used: number;
  tool_calls: number;
  cost?: number;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  error?: string;
  output?: any;
  context?: any;
  steps?: ExecutionStep[];
  currentStep?: number;
  totalSteps?: number;
  metrics?: {
    tokensUsed?: number;
    cost?: number;
    costUsd?: number;
    duration?: number;
    durationMs?: number;
    successRate?: number;
  };
}

export interface ExecutionListResponse {
  executions: Execution[];
  total: number;
  limit: number;
  offset: number;
}

export const cancelAgentSession = async (
  sessionId: string
): Promise<{ status: string; id: string }> => {
  try {
    const response = await fastapiClient.post(`/api/v1/agents/sessions/${sessionId}/cancel`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to cancel session:', error);
    throw new Error(error.response?.data?.detail || 'Failed to cancel session');
  }
};

/**
 * Get execution history for an agent
 */
export const getAgentExecutions = async (
  agentId: string,
  params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }
): Promise<ExecutionListResponse> => {
  try {
    const response = await fastapiClient.get(
      executionPath(`/agents/${agentId}/executions`),
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch executions:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch executions');
  }
};

/**
 * Get detailed execution information
 */
export const getExecutionDetails = async (
  executionId: string
): Promise<Execution> => {
  try {
    const response = await fastapiClient.get(executionPath(`/executions/${executionId}`));
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch execution details:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch execution details');
  }
};

/**
 * Execute a task for an agent
 */
export const executeAgentTask = async (
  agentId: string,
  task: string,
  context?: any,
  availableTools?: string[]
): Promise<{
  task_id: string;
  success: boolean;
  output: any;
  reasoning_steps: any[];
  tools_used: string[];
  duration_ms: number;
  error?: string;
}> => {
  try {
    const response = await fastapiClient.post(
      executionPath(`/agents/${agentId}/execute`),
      {
        task,
        context,
        available_tools: availableTools,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to execute task:', error);
    throw new Error(error.response?.data?.detail || 'Failed to execute task');
  }
};

/**
 * Get execution statistics for an agent
 */
export const getExecutionStats = async (
  agentId: string
): Promise<{
  total_executions: number;
  successful: number;
  failed: number;
  avg_duration_ms: number;
  total_tokens: number;
  total_cost: number;
}> => {
  try {
    // Fetch all executions and calculate stats
    const response = await getAgentExecutions(agentId, { limit: 1000 });
    
    const stats = {
      total_executions: response.total,
      successful: response.executions.filter(e => e.status === 'completed').length,
      failed: response.executions.filter(e => e.status === 'failed').length,
      avg_duration_ms: 0,
      total_tokens: 0,
      total_cost: 0,
    };
    
    if (response.executions.length > 0) {
      const durations = response.executions
        .filter(e => e.duration_ms)
        .map(e => e.duration_ms!);
      
      stats.avg_duration_ms = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
      
      stats.total_tokens = response.executions.reduce(
        (sum, e) => sum + (e.tokens_used || 0),
        0
      );
      
      stats.total_cost = response.executions.reduce(
        (sum, e) => sum + (e.cost || 0),
        0
      );
    }
    
    return stats;
  } catch (error: any) {
    console.error('Failed to fetch execution stats:', error);
    throw new Error('Failed to fetch execution stats');
  }
};

/**
 * Format execution duration for display
 */
export const formatDuration = (durationMs?: number): string => {
  if (!durationMs) return 'N/A';
  
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  } else if (durationMs < 3600000) {
    return `${(durationMs / 60000).toFixed(1)}m`;
  } else {
    return `${(durationMs / 3600000).toFixed(1)}h`;
  }
};

/**
 * Format cost for display
 */
export const formatCost = (cost?: number): string => {
  if (!cost) return '$0.00';
  return `$${cost.toFixed(4)}`;
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: Execution['status']): string => {
  switch (status) {
    case 'completed':
      return '#22c55e'; // green
    case 'running':
      return '#3b82f6'; // blue
    case 'failed':
      return '#ef4444'; // red
    case 'cancelled':
      return '#6b7280'; // gray
    case 'paused':
      return '#f59e0b'; // orange
    case 'waiting_approval':
      return '#8b5cf6'; // purple
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Get status label for UI
 */
export const getStatusLabel = (status: Execution['status']): string => {
  switch (status) {
    case 'initializing':
      return 'Initializing';
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'waiting_approval':
      return 'Waiting Approval';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

/**
 * Alias for getAgentExecutions (for backwards compatibility)
 */
export const getExecutions = getAgentExecutions;
