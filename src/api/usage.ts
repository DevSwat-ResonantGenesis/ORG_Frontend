/**
 * Usage Metrics API
 * Fetches live usage data for tokens, agents, teams, memory, and providers
 */

import fastapiClient from './fastapiClient';

export interface UsageMetrics {
  // Token usage
  tokens: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
  // Agent usage
  agents: {
    active: number;
    limit: number;
    remaining: number;
  };
  // Team usage
  teams: {
    created: number;
    limit: number;
    remaining: number;
  };
  // Memory usage
  memory: {
    anchorsUsed: number;
    anchorsLimit: number;
    storageUsedMB: number;
    storageLimitMB: number;
  };
  // RAG Documents usage
  ragDocuments?: {
    used: number;
    limit: number;
  };
  // Compute Hours usage
  computeHours?: {
    used: number;
    limit: number;
  };
  // Conversations usage
  conversations?: {
    count: number;
    limit: number;
  };
  // Credits usage
  credits?: {
    balance: number;
    used: number;
    limit: number;
  };
  // Provider usage
  providers: {
    available: string[];
    used: {
      provider: string;
      requests: number;
      tokens: number;
    }[];
  };
  // User count
  users: {
    active: number;
    limit: number;
  };
  // Billing info
  billing: {
    planId: string;
    planName: string;
    billingPeriod: 'monthly' | 'yearly';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate: string;
  };
}

export interface UsageSummary {
  tokensUsed: number;
  tokensLimit: number;
  agentsActive: number;
  agentsLimit: number;
  teamsCreated: number;
  teamsLimit: number;
  memoryAnchors: number;
  memoryAnchorsLimit: number;
  planId: string;
  planName: string;
}

/**
 * Fetch full usage metrics for the current organization
 */
export const fetchUsageMetrics = async (): Promise<UsageMetrics> => {
  try {
    const res = await fastapiClient.get('/usage/metrics');
    // Ensure all required fields have defaults to prevent undefined errors
    const data = res.data || {};
    return {
      tokens: data.tokens || { used: 0, limit: 0, remaining: 0, percentUsed: 0 },
      agents: data.agents || { active: 0, limit: 0, remaining: 0 },
      teams: data.teams || { created: 0, limit: 0, remaining: 0 },
      memory: data.memory || { anchorsUsed: 0, anchorsLimit: 0, storageUsedMB: 0, storageLimitMB: 0 },
      ragDocuments: data.ragDocuments || { used: 0, limit: 0 },
      computeHours: data.computeHours || { used: 0, limit: 0 },
      conversations: data.conversations || { count: 0, limit: 0 },
      credits: data.credits || { balance: 0, used: 0, limit: 0 },
      providers: data.providers || { available: [], used: [] },
      users: data.users || { active: 0, limit: 0 },
      billing: data.billing || {
        planId: '',
        planName: '',
        billingPeriod: 'monthly',
        currentPeriodStart: '',
        currentPeriodEnd: '',
        nextBillingDate: '',
      },
    };
  } catch (error: any) {
    // Return default metrics if API fails
    console.error('Failed to fetch usage metrics:', error);
    return {
      tokens: { used: 0, limit: 0, remaining: 0, percentUsed: 0 },
      agents: { active: 0, limit: 0, remaining: 0 },
      teams: { created: 0, limit: 0, remaining: 0 },
      memory: { anchorsUsed: 0, anchorsLimit: 0, storageUsedMB: 0, storageLimitMB: 0 },
      providers: { available: [], used: [] },
      users: { active: 0, limit: 0 },
      billing: {
        planId: 'starter',
        planName: 'Starter',
        billingPeriod: 'monthly',
        currentPeriodStart: '',
        currentPeriodEnd: '',
        nextBillingDate: '',
      },
    };
  }
};

/**
 * Fetch usage summary (lightweight version)
 */
export const fetchUsageSummary = async (): Promise<UsageSummary> => {
  try {
    const res = await fastapiClient.get('/usage/summary');
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch usage summary:', error);
    return {
      tokensUsed: 0,
      tokensLimit: 0,
      agentsActive: 0,
      agentsLimit: 0,
      teamsCreated: 0,
      teamsLimit: 0,
      memoryAnchors: 0,
      memoryAnchorsLimit: 0,
      planId: 'starter',
      planName: 'Starter',
    };
  }
};

/**
 * Fetch token usage history (for charts)
 */
export const fetchTokenHistory = async (days: number = 30): Promise<{
  date: string;
  tokens: number;
}[]> => {
  try {
    const res = await fastapiClient.get(`/usage/tokens/history?days=${days}`);
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch token history:', error);
    return [];
  }
};

/**
 * Fetch provider usage breakdown
 */
export const fetchProviderUsage = async (): Promise<{
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
}[]> => {
  try {
    const res = await fastapiClient.get('/usage/providers');
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch provider usage:', error);
    return [];
  }
};

/**
 * Purchase additional token pack
 */
export const purchaseTokenPack = async (packId: string): Promise<{
  success: boolean;
  tokensAdded: number;
  newBalance: number;
}> => {
  const res = await fastapiClient.post('/billing/token-packs', { pack_id: packId });
  return res.data;
};
