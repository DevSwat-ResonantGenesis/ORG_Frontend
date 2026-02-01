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
  description?: string | null;
  model: string;
  tools?: string[] | null;
  is_active: boolean;
  version: number;
  manifest_hash?: string | null;
  dsid?: string | null;
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

