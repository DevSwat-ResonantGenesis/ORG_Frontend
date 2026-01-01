import fastapiClient from './fastapiClient';

export const fetchOrgs = async () => {
  const res = await fastapiClient.get('/orgs');
  return res.data;
};

export const fetchOrgDetails = async () => {
  // Use auth_service current-user endpoint via gateway
  const res = await fastapiClient.get('/auth/me');
  return res.data;
};

export const inviteUser = async (email: string, role: string) => {
  const res = await fastapiClient.post('/orgs/invite', { email, role });
  return res.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const res = await fastapiClient.put(`/orgs/users/${userId}`, { role });
  return res.data;
};

export const createOrgApiKey = async (name: string) => {
  // API keys are now managed by auth_service via the gateway
  const res = await fastapiClient.post('/auth/api-keys', { name });
  return res.data;
};

export const revokeOrgApiKey = async (keyId: string) => {
  // New backend uses a revoke endpoint with payload { api_key_id }
  const res = await fastapiClient.post('/auth/api-keys/revoke', {
    api_key_id: keyId,
  });
  return res.data;
};

export const fetchOrgApiKeys = async () => {
  const res = await fastapiClient.get('/auth/api-keys');
  return res.data;
};

/**
 * Platform Stats Response - Global metrics for owner dashboard
 */
export interface PlatformStats {
  platform: {
    total_users: number;
    active_users: number;
    total_conversations: number;
    total_messages: number;
    total_agents: number;
    active_agents: number;
  };
  billing: {
    total_revenue: number;
    total_credits_purchased: number;
    total_credits_used: number;
    active_subscriptions: number;
  };
  usage: {
    total_tokens_used: number;
    total_api_calls: number;
  };
}

/**
 * Fetch platform-wide statistics for owner dashboard
 * This returns global metrics across ALL users on the platform
 */
export const fetchPlatformStats = async (): Promise<PlatformStats | null> => {
  try {
    const res = await fastapiClient.get('/admin/platform/stats');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch platform stats:', error);
    return null;
  }
};
