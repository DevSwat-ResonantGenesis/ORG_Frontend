/**
 * Agent Engine API - Autonomous agents, tool planning, safety envelope
 */

import client from './client';

// Types
export interface AgentDefinition {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  provider?: string;
  model: string;
  temperature?: number;
  max_tokens?: number;
  tool_mode?: string;
  tools?: string[];
  mode?: string;
  safety_config?: Record<string, unknown>;
  is_active: boolean;
  version: number;
  manifest_hash?: string;
  agent_public_hash?: string;
  dsid?: string;
  agent_source?: string;
  running_sessions?: number;
  active_schedules?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AgentSession {
  id: string;
  agent_id: string;
  status: 'initializing' | 'running' | 'paused' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
  current_goal?: string;
  loop_count: number;
  total_tokens_used: number;
  final_output?: string;
  error_message?: string;
  created_at?: string;
  completed_at?: string;
}

export interface AgentStep {
  id: string;
  step_number: number;
  step_type: 'think' | 'tool_call' | 'respond';
  reasoning?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: Record<string, unknown>;
  output_data?: Record<string, unknown>;
  safety_check_passed: boolean;
  safety_violations?: string[];
  required_approval: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected';
  duration_ms?: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description?: string;
  category?: string;
  parameters_schema?: Record<string, unknown>;
  handler_type: 'http' | 'internal';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_approval: boolean;
  is_active: boolean;
}

export interface SafetyRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'rate_limit' | 'content_filter' | 'action_block' | 'resource_limit';
  action: 'block' | 'warn' | 'require_approval' | 'log';
  condition?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  trigger_type: 'schedule' | 'webhook' | 'event' | 'condition';
  config: Record<string, unknown>;
  is_active: boolean;
  last_triggered_at?: string;
  trigger_count: number;
}

const AGENTS_BASE = '/api/v1/agents';

// Agent Definition APIs
export const createAgent = async (data: {
  name: string;
  description?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: string[];
  safety_config?: Record<string, unknown>;
}): Promise<AgentDefinition> => {
  const res = await client.post(`${AGENTS_BASE}`, data);
  return res.data;
};

export const listAgents = async (): Promise<AgentDefinition[]> => {
  const res = await client.get(`${AGENTS_BASE}`);
  return res.data;
};

export const getAgent = async (agentId: string): Promise<AgentDefinition> => {
  const res = await client.get(`${AGENTS_BASE}/${agentId}`);
  return res.data;
};

export const deleteAgent = async (agentId: string): Promise<void> => {
  await client.delete(`${AGENTS_BASE}/${agentId}`);
};

// Session APIs
export const startSession = async (
  agentId: string,
  goal: string,
  context?: Record<string, unknown>
): Promise<AgentSession> => {
  const res = await client.post(`${AGENTS_BASE}/${agentId}/sessions`, {
    goal,
    context,
  });
  return res.data;
};

export const listSessions = async (
  agentId: string,
  status?: string
): Promise<AgentSession[]> => {
  const params = status ? { status_filter: status } : {};
  const res = await client.get(`${AGENTS_BASE}/${agentId}/sessions`, { params });
  return res.data;
};

export const getSession = async (sessionId: string): Promise<AgentSession> => {
  const res = await client.get(`${AGENTS_BASE}/sessions/${sessionId}`);
  return res.data;
};

export const getSessionSteps = async (sessionId: string): Promise<AgentStep[]> => {
  const res = await client.get(`${AGENTS_BASE}/sessions/${sessionId}/steps`);
  return res.data;
};

export const cancelSession = async (sessionId: string): Promise<void> => {
  await client.post(`${AGENTS_BASE}/sessions/${sessionId}/cancel`);
};

// Continue a finished/limit-hit session as a new one that inherits its full
// step history, instead of starting over from scratch.
export const continueSession = async (sessionId: string): Promise<AgentSession> => {
  const res = await client.post(`${AGENTS_BASE}/sessions/${sessionId}/continue`);
  return res.data;
};

export const approveStep = async (
  sessionId: string,
  stepId: string,
  approved: boolean = true
): Promise<void> => {
  await client.post(`${AGENTS_BASE}/sessions/${sessionId}/approve/${stepId}`, null, {
    params: { approved },
  });
};

// Tool APIs
export const createTool = async (data: {
  name: string;
  description?: string;
  category?: string;
  parameters_schema?: Record<string, unknown>;
  handler_type: 'http' | 'internal';
  handler_config?: Record<string, unknown>;
  risk_level?: string;
  requires_approval?: boolean;
}): Promise<ToolDefinition> => {
  const res = await client.post(`${AGENTS_BASE}/tools`, data);
  return res.data;
};

export const listTools = async (category?: string): Promise<ToolDefinition[]> => {
  const params = category ? { category } : {};
  const res = await client.get(`${AGENTS_BASE}/tools`, { params });
  return res.data;
};

// Safety Rule APIs
export const createSafetyRule = async (data: {
  name: string;
  description?: string;
  rule_type: string;
  action: string;
  condition?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  priority?: number;
}): Promise<SafetyRule> => {
  const res = await client.post(`${AGENTS_BASE}/safety-rules`, data);
  return res.data;
};

export const listSafetyRules = async (): Promise<SafetyRule[]> => {
  const res = await client.get(`${AGENTS_BASE}/safety-rules`);
  return res.data;
};

// Trigger APIs
export const createTrigger = async (
  agentId: string,
  data: {
    name: string;
    trigger_type: string;
    config: Record<string, unknown>;
    cron_expression?: string;
    event_type?: string;
    event_filter?: Record<string, unknown>;
    input_template?: Record<string, unknown>;
  }
): Promise<WorkflowTrigger> => {
  const res = await client.post(`${AGENTS_BASE}/${agentId}/triggers`, data);
  return res.data;
};

export const listTriggers = async (agentId: string): Promise<WorkflowTrigger[]> => {
  const res = await client.get(`${AGENTS_BASE}/${agentId}/triggers`);
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get(`${AGENTS_BASE}/health`);
  return res.data;
};

export default {
  createAgent,
  listAgents,
  getAgent,
  deleteAgent,
  startSession,
  listSessions,
  getSession,
  getSessionSteps,
  cancelSession,
  approveStep,
  createTool,
  listTools,
  createSafetyRule,
  listSafetyRules,
  createTrigger,
  listTriggers,
  healthCheck,
};
