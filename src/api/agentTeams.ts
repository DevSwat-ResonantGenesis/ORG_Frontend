/**
 * Agent Teams API Client
 * Multi-Agent Collaboration System
 * 
 * Provides functions for managing agent teams and executing workflows.
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

/**
 * Agent Team Types
 */
export interface AgentTeam {
  id: string;
  org_id: string;
  name: string;
  description?: string | null;
  workflow_config: {
    type: 'sequential' | 'parallel' | 'branching';
    steps?: Array<{
      id: string;
      agentId: string;
      inputKey: string | string[];
      outputKey: string;
      role?: string;
      prompt?: string;
    }>;
  };
  created_by: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  member_count: number;
  agents?: string[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  agent_id: string;
  role: string;
  order: number;
  config: Record<string, any>;
}

export interface AgentWorkflow {
  id: string;
  team_id: string;
  user_id: string;
  project_id?: string | null;
  input_data: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  result?: Record<string, any> | null;
  error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStatus {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  steps: Array<{
    step_index: number;
    agent_id: string;
    status: string;
    started_at?: string | null;
    completed_at?: string | null;
    error?: string | null;
  }>;
  result?: Record<string, any> | null;
  error?: string | null;
}

export interface ConversationMessage {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  message: string;
  message_type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  agent_ids: string[];
  workflow_config?: {
    type: 'sequential' | 'parallel' | 'branching';
    steps?: Array<{
      id: string;
      agentId: string;
      inputKey: string | string[];
      outputKey: string;
      role?: string;
      prompt?: string;
    }>;
  };
}

export interface ExecuteWorkflowRequest {
  input_data: Record<string, any>;
  project_id?: string;
}

/**
 * Create a new agent team
 * POST /agent-teams
 */
export const createAgentTeam = async (
  request: CreateTeamRequest
): Promise<AgentTeam> => {
  try {
    const response = await fastapiClient.post('/agent-teams', request);
    return response.data;
  } catch (error) {
    logger.apiError('/agent-teams', error);
    throw error;
  }
};

/**
 * List agent teams for the organization
 * GET /agent-teams
 */
export const listAgentTeams = async (params?: {
  status_filter?: 'active' | 'inactive' | 'archived';
}): Promise<AgentTeam[]> => {
  try {
    const response = await fastapiClient.get('/agent-teams', { params });
    return response.data;
  } catch (error) {
    logger.apiError('/agent-teams', error);
    throw error;
  }
};

/**
 * Get agent team by ID
 * GET /agent-teams/{team_id}
 */
export const getAgentTeam = async (team_id: string): Promise<AgentTeam> => {
  try {
    const response = await fastapiClient.get(`/agent-teams/${team_id}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}`, error);
    throw error;
  }
};

/**
 * Update an agent team
 * PUT /agent-teams/{team_id} or PATCH /agent-teams/{team_id}
 */
export const updateAgentTeam = async (
  team_id: string,
  request: CreateTeamRequest
): Promise<AgentTeam> => {
  try {
    // Try PUT first (standard REST)
    try {
      const response = await fastapiClient.put(`/agent-teams/${team_id}`, request);
      return response.data;
    } catch (putError: any) {
      // If PUT returns 405 Method Not Allowed, try PATCH
      if (putError?.response?.status === 405) {
        logger.info(`PUT not allowed for /agent-teams/${team_id}, trying PATCH`);
        const response = await fastapiClient.patch(`/agent-teams/${team_id}`, request);
        return response.data;
      }
      // If it's a different error, re-throw it
      throw putError;
    }
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}`, error);
    throw error;
  }
};

/**
 * Archive an agent team
 * PATCH /agent-teams/{team_id}/archive
 */
export const archiveAgentTeam = async (team_id: string): Promise<AgentTeam> => {
  try {
    const response = await fastapiClient.patch(`/agent-teams/${team_id}/archive`);
    logger.info('Agent team archived successfully', { team_id });
    return response.data;
  } catch (error: unknown) {
    logger.error('Failed to archive agent team', error, { team_id });
    throw error;
  }
};

/**
 * Unarchive an agent team
 * PATCH /agent-teams/{team_id}/unarchive
 */
export const unarchiveAgentTeam = async (team_id: string): Promise<AgentTeam> => {
  try {
    const response = await fastapiClient.patch(`/agent-teams/${team_id}/unarchive`);
    logger.info('Agent team unarchived successfully', { team_id });
    return response.data;
  } catch (error: unknown) {
    logger.error('Failed to unarchive agent team', error, { team_id });
    throw error;
  }
};

/**
 * Cancel a workflow
 * POST /agent-teams/workflows/{workflow_id}/cancel
 */
export const cancelWorkflow = async (workflow_id: string): Promise<AgentWorkflow> => {
  try {
    const response = await fastapiClient.post(`/agent-teams/workflows/${workflow_id}/cancel`);
    logger.info('Workflow cancelled successfully', { workflow_id });
    return response.data;
  } catch (error: unknown) {
    logger.error('Failed to cancel workflow', error, { workflow_id });
    throw error;
  }
};

/**
 * Delete an agent team
 * DELETE /agent-teams/{team_id}?cancel_workflows=true
 */
export const deleteAgentTeam = async (team_id: string, cancelWorkflows: boolean = false): Promise<void> => {
  try {
    const url = cancelWorkflows 
      ? `/agent-teams/${team_id}?cancel_workflows=true`
      : `/agent-teams/${team_id}`;
    const response = await fastapiClient.delete(url);
    logger.info('Agent team deleted successfully', { team_id, status: response.status, cancelWorkflows });
  } catch (error: unknown) {
    logger.error('Failed to delete agent team', error, { 
      team_id,
      cancelWorkflows,
      errorDetails: error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { status?: number; data?: any } }).response
        : error
    });
    throw error;
  }
};

export const getTeamMembers = async (team_id: string): Promise<TeamMember[]> => {
  try {
    const response = await fastapiClient.get(`/agent-teams/${team_id}/members`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/members`, error);
    throw error;
  }
};

/**
 * Get all workflows for a team
 * GET /agent-teams/{team_id}/workflows?status_filter=active
 */
export const getTeamWorkflows = async (team_id: string, status_filter?: string): Promise<AgentWorkflow[]> => {
  try {
    const params = status_filter ? { status_filter } : {};
    const response = await fastapiClient.get(`/agent-teams/${team_id}/workflows`, { params });
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/workflows`, error);
    throw error;
  }
};

/**
 * Execute a workflow with an agent team
 * POST /agent-teams/{team_id}/execute
 */
export const executeWorkflow = async (
  team_id: string,
  request: ExecuteWorkflowRequest
): Promise<AgentWorkflow> => {
  try {
    const response = await fastapiClient.post(
      `/agent-teams/${team_id}/execute`,
      request
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/execute`, error);
    throw error;
  }
};

/**
 * Get workflow execution status
 * GET /agent-teams/workflows/{workflow_id}
 */
export const getWorkflowStatus = async (
  workflow_id: string
): Promise<WorkflowStatus> => {
  try {
    const response = await fastapiClient.get(
      `/agent-teams/workflows/${workflow_id}`
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/workflows/${workflow_id}`, error);
    throw error;
  }
};

/**
 * Get conversation history for a workflow
 * GET /agent-teams/workflows/{workflow_id}/conversation
 */
export const getWorkflowConversation = async (
  workflow_id: string,
  limit: number = 50
): Promise<ConversationMessage[]> => {
  try {
    const response = await fastapiClient.get(
      `/agent-teams/workflows/${workflow_id}/conversation`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/workflows/${workflow_id}/conversation`, error);
    throw error;
  }
};

// ============================================
// OWNERSHIP & NFT FEATURES
// ============================================

export interface TeamOwnership {
  team_id: string;
  owner_id: string;
  owner_name: string;
  ownership_type: 'full' | 'licensed' | 'rented';
  license_expires?: string;
  transferable: boolean;
  nft_token_id?: string;
  nft_contract_address?: string;
}

export interface TeamRental {
  rental_id: string;
  team_id: string;
  renter_id: string;
  renter_name: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_cost: number;
  status: 'active' | 'expired' | 'cancelled';
  usage_count: number;
  max_usage?: number;
}

export interface TransferOwnershipRequest {
  new_owner_id?: string;
  new_owner_wallet?: string;
  transfer_type: 'full' | 'license';
  price?: number;
  license_duration_days?: number;
}

/**
 * Get team ownership details
 * GET /agent-teams/{team_id}/ownership
 */
export const getTeamOwnership = async (team_id: string): Promise<TeamOwnership> => {
  try {
    const response = await fastapiClient.get(`/agent-teams/${team_id}/ownership`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/ownership`, error);
    throw error;
  }
};

/**
 * Transfer team ownership
 * POST /agent-teams/{team_id}/transfer
 */
export const transferTeamOwnership = async (
  team_id: string,
  request: TransferOwnershipRequest
): Promise<{ success: boolean; transaction_id?: string; message: string }> => {
  try {
    const response = await fastapiClient.post(`/agent-teams/${team_id}/transfer`, request);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/transfer`, error);
    throw error;
  }
};

/**
 * Rent a team (NFT-style rental where owner keeps ownership)
 * POST /agent-teams/{team_id}/rent
 */
export const rentTeam = async (
  team_id: string,
  params: {
    rental_days: number;
    max_usage?: number;
  }
): Promise<TeamRental> => {
  try {
    const response = await fastapiClient.post(`/agent-teams/${team_id}/rent`, params);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/rent`, error);
    throw error;
  }
};

/**
 * List active rentals for a team (for owners)
 * GET /agent-teams/{team_id}/rentals
 */
export const listTeamRentals = async (team_id: string): Promise<TeamRental[]> => {
  try {
    const response = await fastapiClient.get(`/agent-teams/${team_id}/rentals`);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/rentals`, error);
    return [];
  }
};

/**
 * List teams rented by current user
 * GET /agent-teams/my-rentals
 */
export const listMyRentedTeams = async (): Promise<TeamRental[]> => {
  try {
    const response = await fastapiClient.get('/agent-teams/my-rentals');
    return response.data;
  } catch (error) {
    logger.apiError('/agent-teams/my-rentals', error);
    return [];
  }
};

/**
 * Mint team as NFT
 * POST /agent-teams/{team_id}/mint-nft
 */
export const mintTeamAsNFT = async (
  team_id: string,
  params: {
    chain: 'ethereum' | 'polygon' | 'solana' | 'base';
    listing_price?: number;
    rent_price_per_day?: number;
    allow_rentals: boolean;
  }
): Promise<{ 
  success: boolean; 
  token_id: string; 
  contract_address: string; 
  tx_hash: string;
  message: string;
}> => {
  try {
    const response = await fastapiClient.post(`/agent-teams/${team_id}/mint-nft`, params);
    return response.data;
  } catch (error) {
    logger.apiError(`/agent-teams/${team_id}/mint-nft`, error);
    throw error;
  }
};

