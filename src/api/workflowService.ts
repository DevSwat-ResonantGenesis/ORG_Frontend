// ============== WORKFLOW SERVICE API ==============
// API for workflow management and execution

import client from './client';

// ============== TYPES ==============

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'agent' | 'condition' | 'action' | 'delay' | 'loop';
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: any;
  required?: boolean;
}

export interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  input?: any;
  output?: any;
  error?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  variables?: WorkflowVariable[];
  triggers?: WorkflowTrigger[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  variables?: WorkflowVariable[];
  triggers?: WorkflowTrigger[];
}

export interface ExecuteWorkflowRequest {
  input?: Record<string, any>;
  async?: boolean;
}

// ============== WORKFLOW API ==============

export const workflowApi = {
  // List workflows
  async list(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ workflows: Workflow[]; total: number }> {
    const response = await client.get('/workflow/workflows', { params });
    return response.data;
  },

  // Get workflow by ID
  async get(workflowId: string): Promise<Workflow> {
    const response = await client.get(`/workflow/workflows/${workflowId}`);
    return response.data;
  },

  // Create workflow
  async create(request: CreateWorkflowRequest): Promise<Workflow> {
    const response = await client.post('/workflow/workflows', request);
    return response.data;
  },

  // Update workflow
  async update(workflowId: string, request: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await client.put(`/workflow/workflows/${workflowId}`, request);
    return response.data;
  },

  // Delete workflow
  async delete(workflowId: string): Promise<void> {
    await client.delete(`/workflow/workflows/${workflowId}`);
  },

  // Publish workflow
  async publish(workflowId: string): Promise<Workflow> {
    const response = await client.post(`/workflow/workflows/${workflowId}/publish`);
    return response.data;
  },

  // Archive workflow
  async archive(workflowId: string): Promise<Workflow> {
    const response = await client.post(`/workflow/workflows/${workflowId}/archive`);
    return response.data;
  },

  // Clone workflow
  async clone(workflowId: string, name?: string): Promise<Workflow> {
    const response = await client.post(`/workflow/workflows/${workflowId}/clone`, { name });
    return response.data;
  },

  // Validate workflow
  async validate(workflowId: string): Promise<{
    valid: boolean;
    errors: { nodeId?: string; message: string }[];
  }> {
    const response = await client.post(`/workflow/workflows/${workflowId}/validate`);
    return response.data;
  },

  // Execute workflow
  async execute(workflowId: string, request?: ExecuteWorkflowRequest): Promise<WorkflowExecution> {
    const response = await client.post(`/workflow/workflows/${workflowId}/execute`, request);
    return response.data;
  },

  // Get workflow versions
  async getVersions(workflowId: string): Promise<{ versions: Workflow[] }> {
    const response = await client.get(`/workflow/workflows/${workflowId}/versions`);
    return response.data;
  },
};

// ============== EXECUTION API ==============

export const executionApi = {
  // List executions
  async list(params?: {
    workflowId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ executions: WorkflowExecution[]; total: number }> {
    const response = await client.get('/workflow/executions', { params });
    return response.data;
  },

  // Get execution by ID
  async get(executionId: string): Promise<WorkflowExecution> {
    const response = await client.get(`/workflow/executions/${executionId}`);
    return response.data;
  },

  // Cancel execution
  async cancel(executionId: string): Promise<WorkflowExecution> {
    const response = await client.post(`/workflow/executions/${executionId}/cancel`);
    return response.data;
  },

  // Retry execution
  async retry(executionId: string): Promise<WorkflowExecution> {
    const response = await client.post(`/workflow/executions/${executionId}/retry`);
    return response.data;
  },

  // Get execution logs
  async getLogs(executionId: string): Promise<{
    logs: { timestamp: string; level: string; message: string; nodeId?: string }[];
  }> {
    const response = await client.get(`/workflow/executions/${executionId}/logs`);
    return response.data;
  },
};

// ============== TEMPLATES API ==============

export const templateApi = {
  // List templates
  async list(params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ templates: WorkflowTemplate[]; total: number }> {
    const response = await client.get('/workflow/templates', { params });
    return response.data;
  },

  // Get template by ID
  async get(templateId: string): Promise<WorkflowTemplate> {
    const response = await client.get(`/workflow/templates/${templateId}`);
    return response.data;
  },

  // Create workflow from template
  async createFromTemplate(templateId: string, name: string): Promise<Workflow> {
    const response = await client.post(`/workflow/templates/${templateId}/create`, { name });
    return response.data;
  },
};

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
}

export default {
  workflow: workflowApi,
  execution: executionApi,
  template: templateApi,
};
