/**
 * Workflows API Client
 * Handles workflow definitions, execution, and monitoring
 */

import fastapiClient from './fastapiClient';

const workflowsPath = (path: string) => `/api/v1/workflows${path}`;
const workflowServicePath = (path: string) => `/api/v1/workflow${path}`;

export interface WorkflowStep {
  name: string;
  type: string;
  config?: any;
  agent_id?: string;
  tool?: string;
  input?: any;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type?: 'manual' | 'schedule' | 'event' | 'webhook';
  trigger_config?: any;
  steps: WorkflowStep[];
  enabled: boolean;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  input_data?: any;
  output_data?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at?: string;
}

export interface WorkflowStepResult {
  id: string;
  step_index: number;
  step_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input_data?: any;
  output_data?: any;
  error_message?: string;
  duration_ms?: number;
  created_at?: string;
}

export interface WorkflowEvent {
  id: string;
  event_type: string;
  source?: string;
  payload?: any;
  processed: boolean;
  workflow_id?: string;
  created_at?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  trigger_type?: string;
  trigger_config?: any;
  steps: WorkflowStep[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  trigger_type?: string;
  trigger_config?: any;
  steps?: WorkflowStep[];
}

export interface RunWorkflowRequest {
  input_data?: any;
}

export interface PublishEventRequest {
  event_type: string;
  source?: string;
  payload?: any;
  workflow_id?: string;
}

/**
 * Create a new workflow definition
 */
export const createWorkflow = async (
  workflow: CreateWorkflowRequest
): Promise<Workflow> => {
  try {
    const response = await fastapiClient.post(workflowsPath(''), workflow);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create workflow:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create workflow');
  }
};

/**
 * List all workflows
 */
export const listWorkflows = async (
  userId?: string
): Promise<Workflow[]> => {
  try {
    const response = await fastapiClient.get(workflowsPath(''), {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list workflows:', error);
    throw new Error(error.response?.data?.detail || 'Failed to list workflows');
  }
};

/**
 * Update a workflow
 */
export const updateWorkflow = async (
  workflowId: string,
  updates: UpdateWorkflowRequest
): Promise<Workflow> => {
  try {
    const response = await fastapiClient.put(workflowsPath(`/${workflowId}`), updates);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update workflow:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update workflow');
  }
};

/**
 * Get a workflow by ID
 */
export const getWorkflow = async (
  workflowId: string
): Promise<Workflow> => {
  try {
    const response = await fastapiClient.get(workflowsPath(`/${workflowId}`));
    return response.data;
  } catch (error: any) {
    console.error('Failed to get workflow:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get workflow');
  }
};

/**
 * Delete a workflow
 */
export const deleteWorkflow = async (
  workflowId: string
): Promise<void> => {
  try {
    await fastapiClient.delete(workflowsPath(`/${workflowId}`));
  } catch (error: any) {
    console.error('Failed to delete workflow:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete workflow');
  }
};

/**
 * Run a workflow
 */
export const runWorkflow = async (
  workflowId: string,
  request: RunWorkflowRequest
): Promise<WorkflowRun> => {
  try {
    const response = await fastapiClient.post(
      workflowsPath(`/${workflowId}/run`),
      request
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to run workflow:', error);
    throw new Error(error.response?.data?.detail || 'Failed to run workflow');
  }
};

/**
 * List workflow runs
 */
export const listWorkflowRuns = async (
  workflowId?: string,
  status?: string,
  limit?: number
): Promise<WorkflowRun[]> => {
  try {
    const response = await fastapiClient.get(workflowServicePath('/runs'), {
      params: {
        workflow_id: workflowId,
        status,
        limit: limit || 50,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list workflow runs:', error);
    throw new Error(error.response?.data?.detail || 'Failed to list workflow runs');
  }
};

/**
 * Get a workflow run by ID
 */
export const getWorkflowRun = async (
  runId: string
): Promise<WorkflowRun> => {
  try {
    const response = await fastapiClient.get(workflowServicePath(`/runs/${runId}`));
    return response.data;
  } catch (error: any) {
    console.error('Failed to get workflow run:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get workflow run');
  }
};

/**
 * Get workflow run steps
 */
export const getWorkflowRunSteps = async (
  runId: string
): Promise<WorkflowStepResult[]> => {
  try {
    const response = await fastapiClient.get(workflowServicePath(`/runs/${runId}/steps`));
    return response.data;
  } catch (error: any) {
    console.error('Failed to get workflow run steps:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get workflow run steps');
  }
};

/**
 * Cancel a workflow run
 */
export const cancelWorkflowRun = async (
  runId: string
): Promise<void> => {
  try {
    await fastapiClient.post(workflowServicePath(`/runs/${runId}/cancel`));
  } catch (error: any) {
    console.error('Failed to cancel workflow run:', error);
    throw new Error(error.response?.data?.detail || 'Failed to cancel workflow run');
  }
};

/**
 * Publish an event to the event bus
 */
export const publishEvent = async (
  event: PublishEventRequest
): Promise<WorkflowEvent> => {
  try {
    const response = await fastapiClient.post('/workflow/events', event);
    return response.data;
  } catch (error: any) {
    console.error('Failed to publish event:', error);
    throw new Error(error.response?.data?.detail || 'Failed to publish event');
  }
};

/**
 * List workflow events
 */
export const listWorkflowEvents = async (
  eventType?: string,
  limit?: number
): Promise<WorkflowEvent[]> => {
  try {
    const response = await fastapiClient.get('/workflow/events', {
      params: {
        event_type: eventType,
        limit: limit || 50,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list workflow events:', error);
    throw new Error(error.response?.data?.detail || 'Failed to list workflow events');
  }
};

/**
 * Get workflow statistics
 */
export const getWorkflowStats = async (
  workflowId: string
): Promise<{
  total_runs: number;
  successful: number;
  failed: number;
  avg_duration_ms: number;
}> => {
  try {
    const runs = await listWorkflowRuns(workflowId, undefined, 1000);
    
    const stats = {
      total_runs: runs.length,
      successful: runs.filter(r => r.status === 'completed').length,
      failed: runs.filter(r => r.status === 'failed').length,
      avg_duration_ms: 0,
    };
    
    // Calculate average duration for completed runs
    const completedRuns = runs.filter(
      r => r.status === 'completed' && r.started_at && r.completed_at
    );
    
    if (completedRuns.length > 0) {
      const totalDuration = completedRuns.reduce((sum, run) => {
        const start = new Date(run.started_at!).getTime();
        const end = new Date(run.completed_at!).getTime();
        return sum + (end - start);
      }, 0);
      stats.avg_duration_ms = Math.round(totalDuration / completedRuns.length);
    }
    
    return stats;
  } catch (error: any) {
    console.error('Failed to get workflow stats:', error);
    throw new Error('Failed to get workflow stats');
  }
};

/**
 * Format workflow duration for display
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
 * Get status color for UI
 */
export const getStatusColor = (status: WorkflowRun['status']): string => {
  switch (status) {
    case 'completed':
      return '#22c55e'; // green
    case 'running':
      return '#3b82f6'; // blue
    case 'failed':
      return '#ef4444'; // red
    case 'cancelled':
      return '#6b7280'; // gray
    case 'pending':
      return '#f59e0b'; // orange
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Get status label for UI
 */
export const getStatusLabel = (status: WorkflowRun['status']): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running';
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
 * Get trigger type label for UI
 */
export const getTriggerTypeLabel = (triggerType?: string): string => {
  switch (triggerType) {
    case 'manual':
      return 'Manual';
    case 'schedule':
      return 'Scheduled';
    case 'event':
      return 'Event-driven';
    case 'webhook':
      return 'Webhook';
    default:
      return 'Manual';
  }
};
