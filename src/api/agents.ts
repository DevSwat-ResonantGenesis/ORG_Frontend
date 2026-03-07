/**
 * Agents API Client
 * Provides functions for managing individual AI agents
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

/**
 * Agent Response Type
 */
export interface AgentResponse {
  id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  model: string;
  tools?: string[] | null;
  is_active: boolean;
  version: number;
  manifest_hash?: string | null;
  dsid?: string | null;
  personality_config?: Record<string, any> | null;
  meta_data?: Record<string, any> | null;
}

/**
 * List agents
 * GET /api/v1/agents
 */
export const listAgents = async (params?: {
  status_filter?: string;
}): Promise<AgentResponse[]> => {
  try {
    const response = await fastapiClient.get('/api/v1/agents', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.apiError('/api/v1/agents', error);
    }
    return [];
  }
};

/**
 * Get agent by ID
 * GET /api/v1/agents/{agent_id}
 */
export const getAgent = async (agent_id: string): Promise<AgentResponse> => {
  try {
    const response = await fastapiClient.get(`/api/v1/agents/${agent_id}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/api/v1/agents/${agent_id}`, error);
    throw error;
  }
};

/**
 * Create Agent Request Type
 */
export interface CreateAgentRequest {
  name: string;
  type?: string;
  description?: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: string[];
  safety_config?: Record<string, any>;
  allowed_actions?: string[];
  blocked_actions?: string[];
}

/**
 * Create Agent Response Type
 */
export interface CreateAgentResponse {
  id: string;
  name: string;
  type?: string | null;
  description?: string | null;
  model: string;
  tools?: string[] | null;
  is_active: boolean;
  version: number;
  manifest_hash?: string | null;
  dsid?: string | null;
}

export interface SessionResponse {
  id: string;
  agent_id: string;
  status: string;
  current_goal?: string | null;
  loop_count: number;
  total_tokens_used: number;
  final_output?: string | null;
  error_message?: string | null;
}

/**
 * Create a new agent
 * POST /api/v1/agents
 */
export const createAgent = async (data: CreateAgentRequest): Promise<CreateAgentResponse> => {
  try {
    const response = await fastapiClient.post('/api/v1/agents', data);
    return response.data;
  } catch (error) {
    logger.apiError('/api/v1/agents', error);
    throw error;
  }
};

export interface ProviderCatalogProvider {
  id: string;
  provider_key?: string;
  name: string;
  available: boolean;
  live?: boolean;            // real ping result — is the API actually responding?
  has_system_key?: boolean;  // platform has a key configured for this provider
  has_user_key?: boolean;    // current user has their own BYOK key
  uses_credits?: boolean;
  supports_byok?: boolean;
  model?: string;
  models?: string[];
  description?: string;
  capabilities?: string[];
  tier?: string;
}

export interface AgentProvidersCatalogResponse {
  providers: ProviderCatalogProvider[];
  default?: string;
  fallback_chain?: string[];
  fallback_chain_provider_keys?: string[];
  message?: string | null;
  credits?: {
    remaining?: number | null;
    total?: number | null;
    unlimited?: boolean;
  };
}

export const getAgentProvidersCatalog = async (): Promise<AgentProvidersCatalogResponse> => {
  const response = await fastapiClient.get('/api/v1/agents/providers');
  return response.data;
};

export interface ToolDefinitionResponse {
  id: string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  category?: string | null;
  parameters_schema?: Record<string, any> | null;
  handler_type?: string | null;
  handler_config?: Record<string, any> | null;
  risk_level: string;
  requires_approval?: boolean | null;
  is_active: boolean;
}

export interface CreateCustomToolRequest {
  name: string;
  description?: string;
  category?: string;
  parameters_schema?: Record<string, any>;
  handler_type?: string;
  handler_config?: Record<string, any>;
  risk_level?: string;
  requires_approval?: boolean;
}

export const listTools = async (category?: string): Promise<ToolDefinitionResponse[]> => {
  const response = await fastapiClient.get('/api/v1/agents/tools', { params: category ? { category } : undefined });
  return Array.isArray(response.data) ? response.data : [];
};

export const listCustomTools = async (): Promise<ToolDefinitionResponse[]> => {
  const response = await fastapiClient.get('/api/v1/agents/tools/custom');
  return Array.isArray(response.data) ? response.data : [];
};

export const createCustomTool = async (data: CreateCustomToolRequest): Promise<ToolDefinitionResponse> => {
  const response = await fastapiClient.post('/api/v1/agents/tools/custom', data);
  return response.data;
};

export const deleteCustomTool = async (toolId: string): Promise<{ deleted: boolean; id: string }> => {
  const response = await fastapiClient.delete(`/api/v1/agents/tools/custom/${toolId}`);
  return response.data;
};

/**
 * Start an agent session
 * POST /api/v1/agents/{agent_id}/sessions
 */
export const startAgentSession = async (
  agent_id: string, 
  goal: string, 
  context?: Record<string, any>
): Promise<SessionResponse> => {
  try {
    const response = await fastapiClient.post(`/api/v1/agents/${agent_id}/sessions`, {
      goal,
      context,
    });
    return response.data;
  } catch (error) {
    logger.apiError(`/api/v1/agents/${agent_id}/sessions`, error);
    throw error;
  }
};

/**
 * Stop an agent session
 * POST /api/v1/agents/sessions/{session_id}/cancel
 */
export const stopAgentSession = async (session_id: string): Promise<{ status: string }> => {
  try {
    const response = await fastapiClient.post(`/api/v1/agents/sessions/${session_id}/cancel`);
    return response.data;
  } catch (error) {
    logger.apiError(`/api/v1/agents/sessions/${session_id}/cancel`, error);
    throw error;
  }
};

/**
 * Delete an agent
 * DELETE /api/v1/agents/{agent_id}
 */
export const deleteAgent = async (agent_id: string): Promise<{ status: string }> => {
  try {
    const response = await fastapiClient.delete(`/api/v1/agents/${agent_id}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/api/v1/agents/${agent_id}`, error);
    throw error;
  }
};

