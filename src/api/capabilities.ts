/**
 * Capabilities API Client
 * Handles CRUD operations for agent capabilities
 */

import fastapiClient from './fastapiClient';

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'tool' | 'integration' | 'custom';
  enabled: boolean;
  required_permissions: string[];
  requiredPermissions?: string[];
  created_at?: string;
  updated_at?: string;
  // Enhanced fields
  executionMode?: 'sync' | 'async' | 'streaming';
  timeout?: number;
  rateLimit?: number;
  costPerCall?: number;
  apiEndpoint?: string;
  authType?: string;
  // Usage stats
  callsToday?: number;
  totalCalls?: number;
  successRate?: number;
  lastUsed?: string;
  totalCost?: number;
  avgLatency?: number;
}

export interface AddCapabilityRequest {
  name: string;
  description: string;
  category?: string;
  enabled?: boolean;
  required_permissions?: string[];
  // Enhanced fields
  capability_type?: 'action' | 'tool' | 'integration' | 'workflow';
  execution_mode?: 'sync' | 'async' | 'streaming';
  rate_limit?: number;
  timeout?: number;
  retry_policy?: 'none' | 'linear' | 'exponential';
  max_retries?: number;
  input_schema?: object;
  output_schema?: object;
  webhook_url?: string;
  api_endpoint?: string;
  auth_type?: 'none' | 'api_key' | 'oauth2' | 'bearer';
  cost_per_call?: number;
  tags?: string[];
}

export interface UpdateCapabilityRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  required_permissions?: string[];
}

export interface CapabilityScore {
  trust: number;
  requires_approval: boolean;
  is_disabled: boolean;
  is_revoked: boolean;
  successes: number;
  failures: number;
}

export interface CapabilitiesManifestResponse {
  agent_id: string;
  custom_capabilities?: Record<string, any>;
  capabilities: Record<string, CapabilityScore>;
}

const raraPath = (path: string) => `/api/v1/rara${path}`;

export const getCapabilitiesManifest = async (agentId: string): Promise<CapabilitiesManifestResponse> => {
  const response = await fastapiClient.get(raraPath(`/agents/${agentId}/capabilities`));
  return response.data as CapabilitiesManifestResponse;
};

/**
 * Get all capabilities for an agent
 */
export const getAgentCapabilities = async (agentId: string): Promise<Capability[]> => {
  try {
    const response = await getCapabilitiesManifest(agentId);
    
    // Transform backend response to frontend format
    const capabilities: Capability[] = [];
    
    // Add system capabilities
    if (response.capabilities) {
      Object.entries(response.capabilities).forEach(([key, value]: [string, any]) => {
        capabilities.push({
          id: key,
          name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `System capability: ${key}`,
          category: key.startsWith('filesystem') ? 'core' : 
                   key.startsWith('services') ? 'tool' : 'integration',
          enabled: !value.is_disabled,
          required_permissions: [],
        });
      });
    }
    
    return capabilities;
  } catch (error: any) {
    console.error('Failed to fetch capabilities:', error);
    throw error;
  }
};

/**
 * Get custom capabilities for an agent
 */
export const getCustomCapabilities = async (agentId: string): Promise<Capability[]> => {
  try {
    const response = await getCapabilitiesManifest(agentId);
    
    const capabilities: Capability[] = [];
    
    // Add custom capabilities if they exist
    if (response.custom_capabilities) {
      Object.entries(response.custom_capabilities).forEach(([key, value]: [string, any]) => {
        capabilities.push({
          id: key,
          name: value.name,
          description: value.description,
          category: value.category || 'custom',
          enabled: value.enabled !== false,
          required_permissions: value.required_permissions || [],
          created_at: value.created_at,
          updated_at: value.updated_at,
        });
      });
    }
    
    return capabilities;
  } catch (error: any) {
    console.error('Failed to fetch custom capabilities:', error);
    return []; // Return empty array on error
  }
};

/**
 * Add a custom capability to an agent
 */
export const addCapability = async (
  agentId: string,
  capability: AddCapabilityRequest
): Promise<Capability> => {
  try {
    const response = await fastapiClient.post(
      raraPath(`/agents/${agentId}/capabilities`),
      {
        name: capability.name,
        description: capability.description,
        category: capability.category || 'custom',
        enabled: capability.enabled !== false,
        required_permissions: capability.required_permissions || [],
        // Enhanced fields
        capability_type: capability.capability_type || 'action',
        execution_mode: capability.execution_mode || 'sync',
        rate_limit: capability.rate_limit,
        timeout: capability.timeout || 30,
        retry_policy: capability.retry_policy || 'none',
        max_retries: capability.max_retries || 3,
        input_schema: capability.input_schema,
        output_schema: capability.output_schema,
        webhook_url: capability.webhook_url,
        api_endpoint: capability.api_endpoint,
        auth_type: capability.auth_type || 'none',
        cost_per_call: capability.cost_per_call || 0,
        tags: capability.tags || [],
      }
    );
    
    const capData = response.data.capability || response.data;
    return {
      id: response.data.id || capData.id,
      name: capData.name,
      description: capData.description,
      category: capData.category,
      enabled: capData.enabled,
      required_permissions: capData.required_permissions || [],
      executionMode: capData.execution_mode,
      timeout: capData.timeout,
      rateLimit: capData.rate_limit,
      costPerCall: capData.cost_per_call,
      apiEndpoint: capData.api_endpoint,
      authType: capData.auth_type,
      created_at: capData.created_at,
    };
  } catch (error: any) {
    console.error('Failed to add capability:', error);
    throw new Error(error.response?.data?.detail || 'Failed to add capability');
  }
};

/**
 * Update an agent capability
 */
export const updateCapability = async (
  agentId: string,
  capabilityId: string,
  updates: UpdateCapabilityRequest
): Promise<Capability> => {
  try {
    const response = await fastapiClient.put(
      raraPath(`/agents/${agentId}/capabilities/${capabilityId}`),
      updates
    );
    
    return {
      id: response.data.id,
      name: response.data.capability.name,
      description: response.data.capability.description,
      category: response.data.capability.category,
      enabled: response.data.capability.enabled,
      required_permissions: response.data.capability.required_permissions,
      updated_at: response.data.capability.updated_at,
    };
  } catch (error: any) {
    console.error('Failed to update capability:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update capability');
  }
};

/**
 * Delete a custom capability from an agent
 */
export const deleteCapability = async (
  agentId: string,
  capabilityId: string
): Promise<void> => {
  try {
    await fastapiClient.delete(raraPath(`/agents/${agentId}/capabilities/${capabilityId}`));
  } catch (error: any) {
    console.error('Failed to delete capability:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete capability');
  }
};

/**
 * Toggle capability enabled state
 */
export const toggleCapability = async (
  agentId: string,
  capabilityId: string,
  enabled: boolean
): Promise<Capability> => {
  return updateCapability(agentId, capabilityId, { enabled });
};

/**
 * Alias for getAgentCapabilities (for backwards compatibility)
 */
export const getCapabilities = getAgentCapabilities;

/**
 * Format category name for display
 */
export const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'code': 'Code Execution',
    'core': 'Core',
    'tool': 'Tool',
    'integration': 'Integration',
    'custom': 'Custom',
  };
  return categoryMap[category] || category;
};

/**
 * Get category color for UI
 */
export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'code': '#3b82f6',      // blue
    'core': '#22c55e',      // green
    'tool': '#f59e0b',      // orange
    'integration': '#8b5cf6', // purple
    'custom': '#ec4899',    // pink
  };
  return colorMap[category] || '#6b7280'; // gray default
};
