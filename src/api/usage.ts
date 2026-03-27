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
 * Fetch full usage metrics by aggregating from REAL backend endpoints.
 * /usage/metrics does NOT exist — we must query real services directly.
 */
export const fetchUsageMetrics = async (): Promise<UsageMetrics> => {
  try {
    // Fetch from REAL per-user service endpoints
    const [dashboardRes, subscriptionRes, userAgentsRes, userMemoryRes, userConvsRes] = await Promise.all([
      fastapiClient.get('/billing/dashboard/me').catch(() => ({ data: null })),
      fastapiClient.get('/billing/subscription').catch(() => ({ data: null })),
      fastapiClient.get('/agents/agents').catch(() => ({ data: null })),
      fastapiClient.get('/memory/stats').catch(() => ({ data: null })),
      fastapiClient.get('/resonant-chat/conversations').catch(() => ({ data: null })),
    ]);

    const dash = dashboardRes.data;
    const sub = subscriptionRes.data;
    const agentsList = userAgentsRes.data;
    const memStats = userMemoryRes.data;
    const convsList = userConvsRes.data;

    // Credits from billing service (it does track credits correctly)
    const creditBalance = dash?.current_balance ?? dash?.credits?.balance ?? 0;
    const creditLimit = dash?.tier_credits ?? 0;
    const creditUsed = dash?.credits?.lifetime_used ?? dash?.usage_this_period ?? 0;
    // Per-user counts from REAL service endpoints
    const agentsActive = Array.isArray(agentsList) ? agentsList.length : (agentsList?.agents?.length ?? 0);
    const agentsLimit = dash?.agents_limit ?? -1;
    const memoriesCount = memStats?.total_memories ?? memStats?.total_embeddings ?? 0;
    const sessions = Array.isArray(convsList) ? convsList.length : 0;
    const messages = sessions;

    const plan = sub?.plan?.toLowerCase() || dash?.subscription?.plan?.toLowerCase() || 'free';
    const planDisplayName = plan === 'free' ? 'Free'
      : plan === 'developer' ? 'Developer'
      : plan === 'plus' ? 'Plus'
      : plan === 'enterprise' ? 'Enterprise' : plan;

    return {
      tokens: {
        used: creditUsed,
        limit: creditLimit,
        remaining: Math.max(0, creditLimit - creditUsed),
        percentUsed: creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0,
      },
      agents: {
        active: agentsActive,
        limit: agentsLimit === -1 ? 999 : agentsLimit,
        remaining: agentsLimit === -1 ? 999 : Math.max(0, agentsLimit - agentsActive),
      },
      teams: { created: 0, limit: 0, remaining: 0 },
      memory: {
        anchorsUsed: memoriesCount,
        anchorsLimit: 0,
        storageUsedMB: memStats?.storage_mb ?? memStats?.storage_size_mb ?? 0,
        storageLimitMB: 0,
      },
      ragDocuments: { used: 0, limit: 0 },
      computeHours: { used: 0, limit: 0 },
      conversations: { count: sessions, limit: 0 },
      credits: {
        balance: creditBalance,
        used: creditUsed,
        limit: creditLimit,
      },
      providers: { available: [], used: [] },
      users: { active: 1, limit: 0 },
      billing: {
        planId: plan,
        planName: planDisplayName,
        billingPeriod: sub?.billing_cycle || dash?.subscription?.billing_cycle || 'monthly',
        currentPeriodStart: dash?.usage?.period_start || '',
        currentPeriodEnd: dash?.usage?.period_end || '',
        nextBillingDate: '',
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch usage metrics:', error);
    return {
      tokens: { used: 0, limit: 0, remaining: 0, percentUsed: 0 },
      agents: { active: 0, limit: 0, remaining: 0 },
      teams: { created: 0, limit: 0, remaining: 0 },
      memory: { anchorsUsed: 0, anchorsLimit: 0, storageUsedMB: 0, storageLimitMB: 0 },
      providers: { available: [], used: [] },
      users: { active: 0, limit: 0 },
      billing: {
        planId: 'free',
        planName: 'Free',
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
    // Use the same real data source as fetchUsageMetrics
    const metrics = await fetchUsageMetrics();
    return {
      tokensUsed: metrics.tokens.used,
      tokensLimit: metrics.tokens.limit,
      agentsActive: metrics.agents.active,
      agentsLimit: metrics.agents.limit,
      teamsCreated: metrics.teams.created,
      teamsLimit: metrics.teams.limit,
      memoryAnchors: metrics.memory.anchorsUsed,
      memoryAnchorsLimit: metrics.memory.anchorsLimit,
      planId: metrics.billing.planId,
      planName: metrics.billing.planName,
    };
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
      planId: 'free',
      planName: 'Free',
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
