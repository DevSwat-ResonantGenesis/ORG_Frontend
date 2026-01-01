/**
 * Agent Teams API Client
 * Handles agent teams, network topology, and collaboration
 */

import fastapiClient from './fastapiClient';

export interface AgentTeam {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  member_count: number;
  status: string;
  agents?: string[];
}

export interface TeamMember {
  agent_id: string;
  agent_name: string;
  role: string;
  joined_at: string;
}

export interface TeamWorkflow {
  id: string;
  team_id: string;
  workflow_name: string;
  status: string;
  created_at: string;
}

/**
 * List all agent teams
 */
export const listTeams = async (): Promise<AgentTeam[]> => {
  try {
    const response = await fastapiClient.get('/agents/teams');
    return response.data;
  } catch (error: any) {
    console.error('Failed to list teams:', error);
    return [];
  }
};

/**
 * Get team by ID
 */
export const getTeam = async (teamId: string): Promise<AgentTeam | null> => {
  try {
    const response = await fastapiClient.get(`/agents/teams/${teamId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get team:', error);
    return null;
  }
};

/**
 * Get team members
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const response = await fastapiClient.get(`/agents/teams/${teamId}/members`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get team members:', error);
    return [];
  }
};

/**
 * Get team workflows
 */
export const getTeamWorkflows = async (teamId: string): Promise<TeamWorkflow[]> => {
  try {
    const response = await fastapiClient.get(`/agents/teams/${teamId}/workflows`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get team workflows:', error);
    return [];
  }
};

/**
 * Create agent team
 */
export const createTeam = async (name: string, description?: string): Promise<AgentTeam | null> => {
  try {
    const response = await fastapiClient.post('/agents/teams', { name, description });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create team:', error);
    return null;
  }
};
