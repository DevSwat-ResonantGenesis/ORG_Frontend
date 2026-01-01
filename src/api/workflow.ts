/**
 * Workflow Service API - Workflow management, execution, and automation
 */

import client from './client';

// Types
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  definition: WorkflowDefinition;
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  variables?: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'agent' | 'wait';
  config: Record<string, unknown>;
  next_step?: string;
  on_error?: string;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  current_step?: string;
  started_at: string;
  completed_at?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  step_results: StepResult[];
}

export interface StepResult {
  step_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  output?: Record<string, unknown>;
  error?: string;
}

export interface WorkflowCreateRequest {
  name: string;
  description?: string;
  definition: WorkflowDefinition;
}

export interface WorkflowUpdateRequest {
  name?: string;
  description?: string;
  definition?: WorkflowDefinition;
  status?: 'draft' | 'active' | 'paused' | 'archived';
}

export interface WorkflowExecuteRequest {
  input?: Record<string, unknown>;
  async?: boolean;
}

// Workflow CRUD APIs
export const createWorkflow = async (data: WorkflowCreateRequest): Promise<Workflow> => {
  const res = await client.post('/workflows', data);
  return res.data;
};

export const listWorkflows = async (status?: string): Promise<Workflow[]> => {
  const params = status ? { status } : {};
  const res = await client.get('/workflows', { params });
  return res.data;
};

export const getWorkflow = async (workflowId: string): Promise<Workflow> => {
  const res = await client.get(`/workflows/${workflowId}`);
  return res.data;
};

export const updateWorkflow = async (
  workflowId: string,
  data: WorkflowUpdateRequest
): Promise<Workflow> => {
  const res = await client.put(`/workflows/${workflowId}`, data);
  return res.data;
};

export const deleteWorkflow = async (workflowId: string): Promise<void> => {
  await client.delete(`/workflows/${workflowId}`);
};

// Workflow Execution APIs
export const executeWorkflow = async (
  workflowId: string,
  data?: WorkflowExecuteRequest
): Promise<WorkflowExecution> => {
  const res = await client.post(`/workflows/${workflowId}/execute`, data || {});
  return res.data;
};

export const listExecutions = async (
  workflowId?: string,
  status?: string,
  limit: number = 50
): Promise<WorkflowExecution[]> => {
  const params: Record<string, unknown> = { limit };
  if (workflowId) params.workflow_id = workflowId;
  if (status) params.status = status;
  const res = await client.get('/workflow/executions', { params });
  return res.data;
};

export const getExecution = async (executionId: string): Promise<WorkflowExecution> => {
  const res = await client.get(`/workflow/executions/${executionId}`);
  return res.data;
};

export const pauseExecution = async (executionId: string): Promise<WorkflowExecution> => {
  const res = await client.post(`/workflow/executions/${executionId}/pause`);
  return res.data;
};

export const resumeExecution = async (executionId: string): Promise<WorkflowExecution> => {
  const res = await client.post(`/workflow/executions/${executionId}/resume`);
  return res.data;
};

export const cancelExecution = async (executionId: string): Promise<WorkflowExecution> => {
  const res = await client.post(`/workflow/executions/${executionId}/cancel`);
  return res.data;
};

// Workflow Templates
export const listTemplates = async (): Promise<Workflow[]> => {
  const res = await client.get('/workflow/templates');
  return res.data;
};

export const createFromTemplate = async (
  templateId: string,
  name: string,
  variables?: Record<string, unknown>
): Promise<Workflow> => {
  const res = await client.post(`/workflow/templates/${templateId}/create`, {
    name,
    variables,
  });
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/workflow/health');
  return res.data;
};

export default {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow,
  listExecutions,
  getExecution,
  pauseExecution,
  resumeExecution,
  cancelExecution,
  listTemplates,
  createFromTemplate,
  healthCheck,
};
