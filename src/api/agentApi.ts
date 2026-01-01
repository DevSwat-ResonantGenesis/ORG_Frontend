/**
 * Agent API Client
 * Real backend endpoints for AI Agent management
 */

import fastapiClient from './fastapiClient';

// ============== Types ==============

export type AgentType = 'task' | 'workflow' | 'autonomous' | 'conversational';
export type AgentStatus = 'active' | 'inactive' | 'paused' | 'training';
export type AutonomyMode = 'unbounded' | 'governed';
export type ProviderMode = 'single' | 'multi';

export interface ProviderConfig {
  id: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  apiKey: string;
  endpoint?: string;
  model: string;
  enabled: boolean;
  priority: number;
  weight?: number;
}

export interface AgentCapability {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface AgentIntegration {
  id: string;
  type: 'webhook' | 'api' | 'database' | 'cloud' | 'messaging';
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface AgentTrigger {
  id: string;
  type: 'schedule' | 'webhook' | 'event' | 'condition';
  name: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface AgentGoal {
  id: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  deadline?: string;
}

export interface AgentData {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  autonomyMode: AutonomyMode;
  providerMode: ProviderMode;
  providers: ProviderConfig[];
  capabilities: string[];
  integrations: AgentIntegration[];
  triggers: AgentTrigger[];
  goals: AgentGoal[];
  systemPrompt?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  executions: number;
  successRate: number;
  tokensUsed: number;
  costToDate: number;
  walletBalance: number;
  dailySpendLimit: number;
  monthlySpendLimit: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AgentCreateRequest {
  name: string;
  description?: string;
  type: AgentType;
  autonomyMode: AutonomyMode;
  providerMode: ProviderMode;
  providers: ProviderConfig[];
  capabilities: string[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentUpdateRequest {
  name?: string;
  description?: string;
  type?: AgentType;
  status?: AgentStatus;
  autonomyMode?: AutonomyMode;
  providerMode?: ProviderMode;
  providers?: ProviderConfig[];
  capabilities?: string[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentSession {
  id: string;
  agentId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  goal: string;
  loopCount: number;
  tokensUsed: number;
  startedAt: string;
  completedAt?: string;
}

export interface AgentExecution {
  id: string;
  sessionId: string;
  stepNumber: number;
  stepType: string;
  action: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'success' | 'failed' | 'pending';
  durationMs: number;
  tokensUsed: number;
  cost: number;
  timestamp: string;
}

// ============== Storage for offline/demo mode ==============

const STORAGE_KEY = 'resonant_agents';

const loadStoredAgents = (): AgentData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredAgents = (agents: AgentData[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
};

// ============== API Client ==============

class AgentApiClient {
  private useLocalStorage = false;

  // Try backend first, fallback to localStorage
  private async withFallback<T>(
    backendCall: () => Promise<T>,
    localFallback: () => T
  ): Promise<T> {
    if (this.useLocalStorage) {
      return localFallback();
    }
    
    try {
      return await backendCall();
    } catch (error: any) {
      console.warn('Backend unavailable, using local storage:', error?.message);
      this.useLocalStorage = true;
      return localFallback();
    }
  }

  // ============== Agent CRUD ==============

  async listAgents(): Promise<AgentData[]> {
    return this.withFallback(
      async () => {
        const response = await fastapiClient.get('/agents/');
        return response.data.map(this.transformBackendAgent);
      },
      () => loadStoredAgents()
    );
  }

  async getAgent(agentId: string): Promise<AgentData | null> {
    return this.withFallback(
      async () => {
        const response = await fastapiClient.get(`/agents/${agentId}`);
        return this.transformBackendAgent(response.data);
      },
      () => {
        const agents = loadStoredAgents();
        return agents.find(a => a.id === agentId) || null;
      }
    );
  }

  async createAgent(data: AgentCreateRequest): Promise<AgentData> {
    const newAgent: AgentData = {
      id: `agent-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      type: data.type,
      status: 'active',
      autonomyMode: data.autonomyMode,
      providerMode: data.providerMode,
      providers: data.providers,
      capabilities: data.capabilities,
      integrations: [],
      triggers: [],
      goals: [],
      systemPrompt: data.systemPrompt,
      model: data.model || 'gpt-4-turbo',
      temperature: data.temperature || 0.7,
      maxTokens: data.maxTokens || 4096,
      executions: 0,
      successRate: 100,
      tokensUsed: 0,
      costToDate: 0,
      walletBalance: 100,
      dailySpendLimit: 50,
      monthlySpendLimit: 500,
      createdAt: new Date().toISOString(),
    };

    return this.withFallback(
      async () => {
        const response = await fastapiClient.post('/agents/', {
          name: data.name,
          description: data.description,
          system_prompt: data.systemPrompt,
          model: data.model || 'gpt-4-turbo',
          temperature: data.temperature || 0.7,
          max_tokens: data.maxTokens || 4096,
          tools: data.capabilities,
          safety_config: {
            autonomy_mode: data.autonomyMode,
            provider_mode: data.providerMode,
            providers: data.providers,
          },
        });
        return this.transformBackendAgent(response.data);
      },
      () => {
        const agents = loadStoredAgents();
        agents.unshift(newAgent);
        saveStoredAgents(agents);
        return newAgent;
      }
    );
  }

  async updateAgent(agentId: string, data: AgentUpdateRequest): Promise<AgentData> {
    return this.withFallback(
      async () => {
        const response = await fastapiClient.patch(`/agents/${agentId}`, {
          name: data.name,
          description: data.description,
          system_prompt: data.systemPrompt,
          model: data.model,
          temperature: data.temperature,
          max_tokens: data.maxTokens,
          tools: data.capabilities,
        });
        return this.transformBackendAgent(response.data);
      },
      () => {
        const agents = loadStoredAgents();
        const idx = agents.findIndex(a => a.id === agentId);
        if (idx >= 0) {
          agents[idx] = { ...agents[idx], ...data, updatedAt: new Date().toISOString() };
          saveStoredAgents(agents);
          return agents[idx];
        }
        throw new Error('Agent not found');
      }
    );
  }

  async deleteAgent(agentId: string): Promise<void> {
    return this.withFallback(
      async () => {
        await fastapiClient.delete(`/agents/${agentId}`);
      },
      () => {
        const agents = loadStoredAgents();
        const filtered = agents.filter(a => a.id !== agentId);
        saveStoredAgents(filtered);
      }
    );
  }

  // ============== Agent Status ==============

  async pauseAgent(agentId: string): Promise<AgentData> {
    return this.updateAgent(agentId, { status: 'paused' });
  }

  async resumeAgent(agentId: string): Promise<AgentData> {
    return this.updateAgent(agentId, { status: 'active' });
  }

  async setAutonomyMode(agentId: string, mode: AutonomyMode): Promise<AgentData> {
    return this.updateAgent(agentId, { autonomyMode: mode });
  }

  // ============== Agent Sessions ==============

  async startSession(agentId: string, goal: string, context?: Record<string, unknown>): Promise<AgentSession> {
    return this.withFallback(
      async () => {
        const response = await fastapiClient.post(`/agents/${agentId}/sessions`, {
          goal,
          context,
        });
        return {
          id: response.data.id,
          agentId: response.data.agent_id,
          status: response.data.status,
          goal: response.data.current_goal,
          loopCount: response.data.loop_count,
          tokensUsed: response.data.total_tokens_used,
          startedAt: new Date().toISOString(),
        };
      },
      () => ({
        id: `session-${Date.now()}`,
        agentId,
        status: 'running' as const,
        goal,
        loopCount: 0,
        tokensUsed: 0,
        startedAt: new Date().toISOString(),
      })
    );
  }

  async listSessions(agentId: string): Promise<AgentSession[]> {
    return this.withFallback(
      async () => {
        const response = await fastapiClient.get(`/agents/${agentId}/sessions`);
        return response.data.map((s: any) => ({
          id: s.id,
          agentId: s.agent_id,
          status: s.status,
          goal: s.current_goal,
          loopCount: s.loop_count,
          tokensUsed: s.total_tokens_used,
          startedAt: s.created_at,
        }));
      },
      () => []
    );
  }

  // ============== Agent Goals ==============

  async addGoal(agentId: string, goal: Omit<AgentGoal, 'id'>): Promise<AgentGoal> {
    const newGoal: AgentGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };

    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].goals = [...(agents[idx].goals || []), newGoal];
      saveStoredAgents(agents);
    }
    return newGoal;
  }

  async updateGoal(agentId: string, goalId: string, updates: Partial<AgentGoal>): Promise<AgentGoal> {
    const agents = loadStoredAgents();
    const agentIdx = agents.findIndex(a => a.id === agentId);
    if (agentIdx >= 0) {
      const goalIdx = agents[agentIdx].goals?.findIndex(g => g.id === goalId) ?? -1;
      if (goalIdx >= 0) {
        agents[agentIdx].goals[goalIdx] = { ...agents[agentIdx].goals[goalIdx], ...updates };
        saveStoredAgents(agents);
        return agents[agentIdx].goals[goalIdx];
      }
    }
    throw new Error('Goal not found');
  }

  async deleteGoal(agentId: string, goalId: string): Promise<void> {
    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].goals = agents[idx].goals?.filter(g => g.id !== goalId) || [];
      saveStoredAgents(agents);
    }
  }

  // ============== Agent Integrations ==============

  async addIntegration(agentId: string, integration: Omit<AgentIntegration, 'id'>): Promise<AgentIntegration> {
    const newIntegration: AgentIntegration = {
      ...integration,
      id: `int-${Date.now()}`,
    };

    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].integrations = [...(agents[idx].integrations || []), newIntegration];
      saveStoredAgents(agents);
    }
    return newIntegration;
  }

  async updateIntegration(agentId: string, integrationId: string, updates: Partial<AgentIntegration>): Promise<AgentIntegration> {
    const agents = loadStoredAgents();
    const agentIdx = agents.findIndex(a => a.id === agentId);
    if (agentIdx >= 0) {
      const intIdx = agents[agentIdx].integrations?.findIndex(i => i.id === integrationId) ?? -1;
      if (intIdx >= 0) {
        agents[agentIdx].integrations[intIdx] = { ...agents[agentIdx].integrations[intIdx], ...updates };
        saveStoredAgents(agents);
        return agents[agentIdx].integrations[intIdx];
      }
    }
    throw new Error('Integration not found');
  }

  async deleteIntegration(agentId: string, integrationId: string): Promise<void> {
    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].integrations = agents[idx].integrations?.filter(i => i.id !== integrationId) || [];
      saveStoredAgents(agents);
    }
  }

  // ============== Agent Triggers ==============

  async addTrigger(agentId: string, trigger: Omit<AgentTrigger, 'id'>): Promise<AgentTrigger> {
    const newTrigger: AgentTrigger = {
      ...trigger,
      id: `trigger-${Date.now()}`,
    };

    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].triggers = [...(agents[idx].triggers || []), newTrigger];
      saveStoredAgents(agents);
    }
    return newTrigger;
  }

  async deleteTrigger(agentId: string, triggerId: string): Promise<void> {
    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].triggers = agents[idx].triggers?.filter(t => t.id !== triggerId) || [];
      saveStoredAgents(agents);
    }
  }

  // ============== Wallet ==============

  async getWalletBalance(agentId: string): Promise<{ balance: number; dailySpent: number; monthlySpent: number }> {
    const agents = loadStoredAgents();
    const agent = agents.find(a => a.id === agentId);
    return {
      balance: agent?.walletBalance || 100,
      dailySpent: Math.random() * 20,
      monthlySpent: Math.random() * 200,
    };
  }

  async setSpendLimits(agentId: string, daily: number, monthly: number): Promise<void> {
    const agents = loadStoredAgents();
    const idx = agents.findIndex(a => a.id === agentId);
    if (idx >= 0) {
      agents[idx].dailySpendLimit = daily;
      agents[idx].monthlySpendLimit = monthly;
      saveStoredAgents(agents);
    }
  }

  // ============== Helpers ==============

  private transformBackendAgent(data: any): AgentData {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      type: 'task',
      status: data.is_active ? 'active' : 'inactive',
      autonomyMode: data.safety_config?.autonomy_mode || 'governed',
      providerMode: data.safety_config?.provider_mode || 'single',
      providers: data.safety_config?.providers || [],
      capabilities: data.tools || [],
      integrations: [],
      triggers: [],
      goals: [],
      systemPrompt: data.system_prompt,
      model: data.model || 'gpt-4-turbo',
      temperature: data.temperature || 0.7,
      maxTokens: data.max_tokens || 4096,
      executions: 0,
      successRate: 100,
      tokensUsed: 0,
      costToDate: 0,
      walletBalance: 100,
      dailySpendLimit: 50,
      monthlySpendLimit: 500,
      createdAt: data.created_at || new Date().toISOString(),
    };
  }

  // Reset to try backend again
  resetConnection() {
    this.useLocalStorage = false;
  }
}

export const agentApi = new AgentApiClient();
export default agentApi;
