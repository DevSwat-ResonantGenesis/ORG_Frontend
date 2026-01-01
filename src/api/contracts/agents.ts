// ============== AGENT API CONTRACTS ==============
// Type-safe request/response definitions matching FastAPI backend

import type { Agent, AgentConfig, AgentType, AgentStatus, AgentMode } from '../../types';

// Request Types
export interface CreateAgentRequest {
  name: string;
  type: AgentType;
  mode: AgentMode;
  config: AgentConfig;
}

export interface UpdateAgentRequest {
  name?: string;
  mode?: AgentMode;
  config?: Partial<AgentConfig>;
}

export interface AgentActionRequest {
  action: 'start' | 'stop' | 'pause' | 'resume' | 'archive' | 'fork';
  params?: Record<string, unknown>;
}

export interface ListAgentsRequest {
  status?: AgentStatus;
  type?: AgentType;
  limit?: number;
  offset?: number;
  search?: string;
}

// Response Types
export interface CreateAgentResponse {
  agent_id: string;
  agent_hash: string;
  status: AgentStatus;
  created_at: string;
}

export interface AgentResponse {
  id: string;
  hash: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  mode: AgentMode;
  version: string;
  capabilities: string[];
  wallet_balance: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  utility_score: number;
  executions: number;
  cost_today: number;
  pending_approvals: number;
  created_at: string;
  updated_at: string;
  owner_id: string;
  config: AgentConfig;
}

export interface ListAgentsResponse {
  agents: AgentResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentActionResponse {
  success: boolean;
  agent_id: string;
  new_status: AgentStatus;
  message?: string;
}

// Transform functions (API response -> Frontend type)
export function transformAgentResponse(response: AgentResponse): Agent {
  return {
    id: response.id,
    hash: response.hash,
    name: response.name,
    type: response.type,
    status: response.status,
    mode: response.mode,
    version: response.version,
    capabilities: response.capabilities,
    walletBalance: response.wallet_balance,
    riskLevel: response.risk_level,
    utilityScore: response.utility_score,
    executions: response.executions,
    costToday: response.cost_today,
    pendingApprovals: response.pending_approvals,
    createdAt: new Date(response.created_at),
    updatedAt: new Date(response.updated_at),
    ownerId: response.owner_id,
    config: response.config,
  };
}

// API Endpoints
export const AGENT_ENDPOINTS = {
  list: '/api/v1/agents',
  create: '/api/v1/agents',
  get: (id: string) => `/api/v1/agents/${id}`,
  update: (id: string) => `/api/v1/agents/${id}`,
  delete: (id: string) => `/api/v1/agents/${id}`,
  action: (id: string) => `/api/v1/agents/${id}/action`,
  config: (id: string) => `/api/v1/agents/${id}/config`,
  metrics: (id: string) => `/api/v1/agents/${id}/metrics`,
} as const;
