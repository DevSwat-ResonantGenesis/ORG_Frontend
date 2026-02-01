// ============== AGENTS API HOOKS ==============
// React hooks for agent API operations

import { useCallback } from 'react';
import { useAgentStore } from '../../stores';
import fastapiClient from '../fastapiClient';
import { 
  AGENT_ENDPOINTS, 
  transformAgentResponse,
  type CreateAgentRequest,
  type UpdateAgentRequest,
  type AgentActionRequest,
  type ListAgentsRequest,
  type AgentResponse,
  type ListAgentsResponse,
} from '../contracts/agents';

// Base API client (fastapiClient - cookie auth + x-user-id)
const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fastapiClient.get<T>(url);
    return response.data;
  },
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await fastapiClient.post<T>(url, data);
    return response.data;
  },
  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await fastapiClient.put<T>(url, data);
    return response.data;
  },
  async delete<T>(url: string): Promise<T> {
    const response = await fastapiClient.delete<T>(url);
    return response.data;
  },
};

export function useAgentsAPI() {
  const { setAgents, addAgent, updateAgent, removeAgent, setLoading, setError } = useAgentStore();

  const fetchAgents = useCallback(async (params?: ListAgentsRequest) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.set('status', params.status);
      if (params?.type) queryParams.set('type', params.type);
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.offset) queryParams.set('offset', String(params.offset));
      if (params?.search) queryParams.set('search', params.search);
      
      const url = `${AGENT_ENDPOINTS.list}?${queryParams}`;
      const response = await apiClient.get<ListAgentsResponse>(url);
      const agents = response.agents.map(transformAgentResponse);
      setAgents(agents);
      return agents;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch agents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAgents, setLoading, setError]);

  const createAgent = useCallback(async (request: CreateAgentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AgentResponse>(AGENT_ENDPOINTS.create, request);
      const agent = transformAgentResponse(response);
      addAgent(agent);
      return agent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create agent';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addAgent, setLoading, setError]);

  const updateAgentById = useCallback(async (id: string, request: UpdateAgentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<AgentResponse>(AGENT_ENDPOINTS.update(id), request);
      const agent = transformAgentResponse(response);
      updateAgent(id, agent);
      return agent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update agent';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAgent, setLoading, setError]);

  const deleteAgent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(AGENT_ENDPOINTS.delete(id));
      removeAgent(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeAgent, setLoading, setError]);

  const performAction = useCallback(async (id: string, request: AgentActionRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AgentResponse>(AGENT_ENDPOINTS.action(id), request);
      const agent = transformAgentResponse(response);
      updateAgent(id, agent);
      return agent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to perform action';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAgent, setLoading, setError]);

  return {
    fetchAgents,
    createAgent,
    updateAgent: updateAgentById,
    deleteAgent,
    performAction,
  };
}

export default useAgentsAPI;
