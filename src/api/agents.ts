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
  universe_id: string;
  personality_config: Record<string, any>;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  meta_data: Record<string, any>;
}

/**
 * List agents
 * GET /agents
 */
export const listAgents = async (params?: {
  status_filter?: string;
}): Promise<AgentResponse[]> => {
  try {
    const response = await fastapiClient.get('/agents', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.apiError('/agents', error);
    }
    return [];
  }
};

/**
 * Get agent by ID
 * GET /agents/{agent_id}
 */
export const getAgent = async (agent_id: string): Promise<AgentResponse> => {
  try {
    const response = await fastapiClient.get(`/agents/${agent_id}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agents/${agent_id}`, error);
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
}

/**
 * Create a new agent
 * POST /agents
 */
export const createAgent = async (data: CreateAgentRequest): Promise<CreateAgentResponse> => {
  try {
    const response = await fastapiClient.post('/agents', data);
    return response.data;
  } catch (error) {
    logger.apiError('/agents', error);
    throw error;
  }
};

/**
 * Start an agent session
 * POST /agents/{agent_id}/sessions
 */
export const startAgentSession = async (
  agent_id: string, 
  goal: string, 
  context?: Record<string, any>
): Promise<{ id: string; status: string }> => {
  try {
    const response = await fastapiClient.post(`/agents/${agent_id}/sessions`, {
      goal,
      context,
    });
    return response.data;
  } catch (error) {
    logger.apiError(`/agents/${agent_id}/sessions`, error);
    throw error;
  }
};

/**
 * Stop an agent session
 * POST /agents/sessions/{session_id}/cancel
 */
export const stopAgentSession = async (session_id: string): Promise<{ status: string }> => {
  try {
    const response = await fastapiClient.post(`/agents/sessions/${session_id}/cancel`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agents/sessions/${session_id}/cancel`, error);
    throw error;
  }
};

/**
 * Delete an agent
 * DELETE /agents/{agent_id}
 */
export const deleteAgent = async (agent_id: string): Promise<{ status: string }> => {
  try {
    const response = await fastapiClient.delete(`/agents/${agent_id}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agents/${agent_id}`, error);
    throw error;
  }
};

