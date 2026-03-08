/**
 * Settings API Client
 * API endpoints for agent, provider, and patch management
 */

import fastapiClient from './fastapiClient';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  agent_hash?: string;
  system_prompt?: string;
  personality_config?: Record<string, any>;
  enabled_patches?: number[];
  patch_config?: Record<string, any>;
  memory_config?: Record<string, any>;
  anchor_config?: Record<string, any>;
  isolate_anchors?: boolean; // If true, anchors are isolated to this agent. If false, anchors are shared across user's agents.
  tool_mode?: string; // smart = all tools auto, manual = only selected tools
  tools?: string[]; // List of enabled tool names (used when tool_mode='manual')
  status: string;
  created_at: string;
  is_template?: boolean;
  template_id?: string;
  owner_id?: string; // User who created the agent
  is_shared?: boolean; // Whether this agent is shared
  is_public?: boolean; // Whether this agent can be shared
  is_imported?: boolean; // Whether this agent was imported by current user
  share_secret?: string; // 12-word BIP-39 mnemonic (only returned to owner)
}

export interface CustomProvider {
  id: string;
  name: string;
  provider_type: string;
  enabled: boolean;
  priority: number;
  weight: number;
  created_at: string;
}

export interface AgentPatchConfig {
  id: string;
  patch_number: number;
  enabled: boolean;
  execution_mode: 'live' | 'background' | 'hybrid';
  config?: Record<string, any>;
  priority: number;
}

export interface Thresholds {
  validity: number;
  entropy: number;
  anchor_prob: number;
  anchorProb?: number;
}

export interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  enabled: boolean;
  created_at: string;
  last_used?: string;
}

export const fetchAPIKeys = async (): Promise<APIKey[]> => {
  const response = await fastapiClient.get('/auth/settings/api-keys');
  return response.data;
};

export const createAPIKey = async (name: string): Promise<{ id: string; key: string; name: string }> => {
  const response = await fastapiClient.post('/auth/settings/api-keys', { name });
  return response.data;
};

export const deleteAPIKey = async (keyId: string): Promise<void> => {
  await fastapiClient.delete(`/auth/settings/api-keys/${keyId}`);
};

export const fetchThresholds = async (): Promise<Thresholds> => {
  const response = await fastapiClient.get('/auth/settings/thresholds');
  return response.data;
};

export const updateThresholds = async (thresholds: Partial<Thresholds>): Promise<Thresholds> => {
  const response = await fastapiClient.put('/auth/settings/thresholds', thresholds);
  return response.data;
};

export const fetchSettingsModelVersions = async (): Promise<Array<{ id: string; version: string; name: string }>> => {
  const response = await fastapiClient.get('/auth/settings/model-versions');
  return response.data;
};

export interface PatchCatalogItem {
  number: number;
  name: string;
  group: string;
}

export interface MemoryConfig {
  retention_days?: number;
  importance_threshold?: number;
  memory_types?: string[];
  search_settings?: {
    top_k?: number;
    resonance_threshold?: number;
  };
  max_memories?: number;
  decay_rate?: number;
}

export interface Anchor {
  id: string;
  anchor_text: string;
  anchor_hash: string;
  importance_score: number;
  anchor_type: string;
  context: string;
  xyz_x?: number;
  xyz_y?: number;
  xyz_z?: number;
  created_at: string;
}

export interface Restrictions {
  forbidden_words?: string[];
  restricted_topics?: string[];
  replacement_rules?: Record<string, string>;
  filter_enabled?: boolean;
}

// ============================================
// AGENT ENDPOINTS
// ============================================

export const settingsApi = {
  // Agents
  async createAgent(data: {
    name: string;
    description?: string;
    system_prompt?: string;
    personality_config?: Record<string, any>;
  }): Promise<Agent> {
    const response = await fastapiClient.post('/auth/settings/agents', data);
    return response.data;
  },

  async listAgents(): Promise<Agent[]> {
    const response = await fastapiClient.get('/auth/settings/agents');
    return response.data;
  },

  async getAgent(agentId: string): Promise<Agent> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}`);
    return response.data;
  },

  async updateAgent(
    agentId: string,
    data: {
      name?: string;
      description?: string;
      system_prompt?: string;
      personality_config?: Record<string, any>;
      enabled_patches?: number[];
      patch_config?: Record<string, any>;
      memory_config?: Record<string, any>;
      anchor_config?: Record<string, any>;
      isolate_anchors?: boolean;
      tool_mode?: string;
      tools?: string[];
      status?: string;
    }
  ): Promise<Agent> {
    const response = await fastapiClient.put(`/auth/settings/agents/${agentId}`, data);
    return response.data;
  },

  async deleteAgent(agentId: string): Promise<void> {
    await fastapiClient.delete(`/auth/settings/agents/${agentId}`);
  },

  async generateAgentHash(agentId: string): Promise<{ agent_hash: string; share_secret?: string }> {
    const response = await fastapiClient.post(`/auth/settings/agents/${agentId}/hash`);
    return response.data;
  },

  async shareAgent(agentId: string, makePublic: boolean = true): Promise<{ agent_hash: string; share_secret?: string }> {
    const response = await fastapiClient.post(`/auth/settings/agents/${agentId}/share`, { is_public: makePublic });
    return response.data;
  },

  async importSharedAgent(agentHash: string, shareSecret?: string): Promise<Agent & { ownership_transferred?: boolean }> {
    const response = await fastapiClient.post('/auth/settings/agents/import', {
      agent_hash: agentHash,
      share_secret: shareSecret || undefined
    });
    return response.data;
  },

  async listSharedAgents(): Promise<Agent[]> {
    const response = await fastapiClient.get('/auth/settings/agents/shared');
    return response.data;
  },

  async restoreAgentByCryptoHash(cryptoHash: string, mnemonic: string): Promise<Agent> {
    const response = await fastapiClient.post('/agents/restore-by-hash', {
      crypto_hash: cryptoHash,
      mnemonic: mnemonic
    });
    return response.data;
  },

  // Providers
  async createProvider(data: {
    name: string;
    provider_type: string;
    api_key: string;
    endpoint?: string;
    models?: string[];
    enabled?: boolean;
    priority?: number;
    weight?: number;
  }): Promise<CustomProvider> {
    const response = await fastapiClient.post('/settings/providers', data);
    return response.data;
  },

  async listProviders(): Promise<CustomProvider[]> {
    const response = await fastapiClient.get('/settings/providers');
    return response.data;
  },

  async deleteProvider(providerId: string): Promise<void> {
    await fastapiClient.delete(`/settings/providers/${providerId}`);
  },

  // Patches
  async listAgentPatches(agentId: string): Promise<AgentPatchConfig[]> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/patches`);
    return response.data;
  },

  async updatePatchConfig(
    agentId: string,
    patchNumber: number,
    data: {
      enabled?: boolean;
      execution_mode?: 'live' | 'background' | 'hybrid';
      config?: Record<string, any>;
    }
  ): Promise<AgentPatchConfig> {
    const response = await fastapiClient.put(
      `/auth/settings/agents/${agentId}/patches/${patchNumber}`,
      data
    );
    return response.data;
  },

  async getPatchesCatalog(): Promise<PatchCatalogItem[]> {
    const response = await fastapiClient.get('/settings/patches/catalog');
    return response.data;
  },

  // Memory Management
  async getAgentMemoryConfig(agentId: string): Promise<MemoryConfig> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/memory`);
    return response.data;
  },

  async updateAgentMemoryConfig(
    agentId: string,
    config: Partial<MemoryConfig>
  ): Promise<MemoryConfig> {
    const response = await fastapiClient.put(`/auth/settings/agents/${agentId}/memory`, config);
    return response.data;
  },

  // Anchor Management
  async listAgentAnchors(
    agentId: string,
    limit = 50,
    offset = 0
  ): Promise<Anchor[]> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/anchors`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async deleteAgentAnchor(agentId: string, anchorId: string): Promise<void> {
    await fastapiClient.delete(`/auth/settings/agents/${agentId}/anchors/${anchorId}`);
  },

  // Agent Metrics
  async getAgentMetrics(agentId: string): Promise<{
    total_messages: number;
    messages_last_month: number;
    average_response_time_seconds: number;
    average_response_time_formatted: string;
    total_tokens_used: number;
    total_anchors: number;
    anchors_last_week: number;
    anchor_creation_rate_per_week: number;
    patch_statistics: Record<number, {
      enabled: boolean;
      execution_mode: string;
      executions: number;
      last_executed?: string;
    }>;
    enabled_patches_count: number;
    last_updated: string;
  }> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/metrics`);
    return response.data;
  },

  // Restrictions
  async getAgentRestrictions(agentId: string): Promise<Restrictions> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/restrictions`);
    return response.data;
  },

  async updateAgentRestrictions(
    agentId: string,
    restrictions: Partial<Restrictions>
  ): Promise<Restrictions> {
    const response = await fastapiClient.put(`/auth/settings/agents/${agentId}/restrictions`, restrictions);
    return response.data;
  },

  // API Key Management
  async createAgentAPIKey(
    agentId: string,
    data: { name: string; rate_limit?: number; webhook_url?: string }
  ): Promise<{ id: string; api_key: string; name: string; warning: string }> {
    const response = await fastapiClient.post(`/auth/settings/agents/${agentId}/api-keys`, data);
    return response.data;
  },

  async listAgentAPIKeys(agentId: string): Promise<Array<{
    id: string;
    name: string;
    key_hash: string;
    rate_limit: number;
    enabled: boolean;
    created_at: string;
    last_used?: string;
  }>> {
    const response = await fastapiClient.get(`/auth/settings/agents/${agentId}/api-keys`);
    return response.data;
  },

  async deleteAgentAPIKey(agentId: string, keyId: string): Promise<void> {
    await fastapiClient.delete(`/auth/settings/agents/${agentId}/api-keys/${keyId}`);
  },

  // Agent Export/Import
  async exportAgent(agentId: string): Promise<{
    version: string;
    exported_at: string;
    agent: Record<string, any>;
  }> {
    const response = await fastapiClient.post(`/auth/settings/agents/${agentId}/export`);
    return response.data;
  },

  async importAgent(data: {
    agent_data: Record<string, any>;
    overwrite?: boolean;
  }): Promise<{ id: string; name: string; imported: boolean; overwritten: boolean }> {
    const response = await fastapiClient.post('/auth/settings/agents/import', data);
    return response.data;
  },

  // Agent Templates
  async saveAgentAsTemplate(
    agentId: string,
    templateName?: string
  ): Promise<{ id: string; template_id: string; name: string; is_template: boolean }> {
    const response = await fastapiClient.post(`/auth/settings/agents/${agentId}/save-template`, {
      template_name: templateName,
    });
    return response.data;
  },

  async listAgentTemplates(): Promise<Array<{
    id: string;
    template_id: string;
    name: string;
    description?: string;
    created_at: string;
  }>> {
    const response = await fastapiClient.get('/auth/settings/agents/templates');
    return response.data;
  },

  async createAgentFromTemplate(
    templateId: string,
    name: string
  ): Promise<{ id: string; name: string; from_template: string }> {
    const response = await fastapiClient.post(`/auth/settings/agents/from-template/${templateId}`, {
      name,
    });
    return response.data;
  },
};
