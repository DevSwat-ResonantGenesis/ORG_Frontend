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
  created_at?: string;
  updated_at?: string;
}

export interface AddCapabilityRequest {
  name: string;
  description: string;
  category?: string;
  enabled?: boolean;
  required_permissions?: string[];
}

export interface UpdateCapabilityRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  required_permissions?: string[];
}

/**
 * Get all capabilities for an agent
 */
export const getAgentCapabilities = async (agentId: string): Promise<Capability[]> => {
  try {
    const response = await fastapiClient.get(`/agents/${agentId}/capabilities`);
    
    // Transform backend response to frontend format
    const capabilities: Capability[] = [];
    
    // Add system capabilities
    if (response.data.capabilities) {
      Object.entries(response.data.capabilities).forEach(([key, value]: [string, any]) => {
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
    // This will be returned from the main capabilities endpoint
    // For now, we'll fetch from the same endpoint and filter
    const response = await fastapiClient.get(`/agents/${agentId}/capabilities`);
    
    const capabilities: Capability[] = [];
    
    // Add custom capabilities if they exist
    if (response.data.custom_capabilities) {
      Object.entries(response.data.custom_capabilities).forEach(([key, value]: [string, any]) => {
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
      `/agents/${agentId}/capabilities`,
      {
        name: capability.name,
        description: capability.description,
        category: capability.category || 'custom',
        enabled: capability.enabled !== false,
        required_permissions: capability.required_permissions || [],
      }
    );
    
    return {
      id: response.data.id,
      name: response.data.capability.name,
      description: response.data.capability.description,
      category: response.data.capability.category,
      enabled: response.data.capability.enabled,
      required_permissions: response.data.capability.required_permissions,
      created_at: response.data.capability.created_at,
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
      `/agents/${agentId}/capabilities/${capabilityId}`,
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
    await fastapiClient.delete(`/agents/${agentId}/capabilities/${capabilityId}`);
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
