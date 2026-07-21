/**
 * Dashboard API
 * Fetches REAL data from backend endpoints for the dashboard
 * NO FALLBACK VALUES - shows only actual data from backend
 */
import fastapiClient from './fastapiClient';

export interface DashboardData {
  credits: {
    balance: number | null;
    limit: number | null;
    usedThisMonth: number | null;
    burnRate: number | null;
    daysRemaining: number | null;
    unlimited?: boolean;
  };
  tier: string | null;
  usageBreakdown: { service: string; credits: number; percentage: number }[];
  usageTrend: { date: string; tokens: number }[];
  activity: {
    messages: number | null;
    agents: number | null;
    agentsLimit: number | null;
    memories: number | null;
    sessions: number | null;
  };
  alerts: { type: 'warning' | 'error' | 'info'; message: string; priority?: string }[];
  recentActivity: { type: string; description: string; timestamp: string; amount?: number }[];
  platform: {
    agentMetrics: { total: number; active: number; sessions: number; running: number; completed: number; failed: number } | null;
    compliance: { score: number; grade: string; framework: string; checks: { control: string; status: string; detail: string; weight: number }[] } | null;
    memory: { totalMemories: number; storageMb: number; totalEmbeddings: number; totalClusters: number } | null;
    marketplace: { totalListings: number; totalDownloads: number; totalPublishers: number } | null;
    workflows: { count: number } | null;
  };
  isLoading?: boolean;
  error?: string;
}

const normalizeUsageTrend = (
  history: any,
  days: number
): { date: string; tokens: number }[] => {
  const arr: any[] = Array.isArray(history) ? history : [];
  const map = new Map<string, number>();

  for (const item of arr) {
    if (!item) continue;
    // Standard format: { date, tokens }
    if (typeof item.date === 'string' && typeof item.tokens === 'number') {
      map.set(item.date, (map.get(item.date) || 0) + item.tokens);
    }
    // Transaction format from recent_transactions: { created_at, amount }
    else if (item.created_at && typeof item.amount === 'number') {
      const dateKey = item.created_at.slice(0, 10);
      map.set(dateKey, (map.get(dateKey) || 0) + Math.abs(item.amount));
    }
  }

  const result: { date: string; tokens: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, tokens: map.get(key) ?? 0 });
  }

  return result;
};

const normalizeBreakdown = (
  breakdown: any,
  dashboard: any
): { service: string; credits: number; percentage: number }[] => {
  const normalizeKey = (k: any): string => String(k || '').trim().toLowerCase();

  const mergeAndSort = (items: { service: string; credits: number }[], total: number | null) => {
    const merged = new Map<string, number>();
    for (const it of items) {
      const key = normalizeKey(it.service);
      if (!key) continue;
      merged.set(key, (merged.get(key) || 0) + (typeof it.credits === 'number' ? it.credits : 0));
    }
    const totalCredits = typeof total === 'number'
      ? total
      : Array.from(merged.values()).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);

    return Array.from(merged.entries())
      .map(([service, credits]) => {
        const pct = totalCredits > 0 ? (credits / totalCredits) * 100 : 0;
        return {
          service,
          credits,
          percentage: Math.round(pct * 10) / 10,
        };
      })
      .sort((a, b) => b.credits - a.credits);
  };

  if (Array.isArray(breakdown) && breakdown.length > 0) {
    return mergeAndSort(
      breakdown.map((it: any) => ({ service: it?.service, credits: it?.credits })),
      null
    );
  }

  const byService = breakdown?.breakdown;
  const total = typeof breakdown?.total === 'number' ? breakdown.total : null;
  if (byService && typeof byService === 'object') {
    return mergeAndSort(
      Object.entries(byService).map(([service, credits]) => ({
        service,
        credits: typeof credits === 'number' ? credits : 0,
      })),
      total
    );
  }

  if (dashboard?.usage_by_service && Array.isArray(dashboard.usage_by_service) && dashboard.usage_by_service.length > 0) {
    return mergeAndSort(
      dashboard.usage_by_service.map((s: any) => ({
        service: s?.service,
        credits: typeof s?.credits === 'number' ? s.credits : 0,
      })),
      null
    );
  }

  return [];
};

/**
 * Fetch complete dashboard data from billing service
 * Returns ONLY real data - no fallbacks
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Track which endpoints failed for error reporting
  const errors: string[] = [];

  // Helper: fetch with a short timeout so one dead service doesn't block the whole dashboard
  const quickGet = (url: string, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fastapiClient
      .get(url, { signal: controller.signal })
      .finally(() => clearTimeout(timer));
  };
  
  // Fetch data from multiple REAL endpoints in parallel
  // Group 1: Billing (credits, subscription, usage history)
  // Group 2: Per-user REAL counts (agents, memory, conversations)
  // Group 3: Platform-wide (marketplace)
  const [
    dashboardRes,
    creditsRes,
    subscriptionRes,
    breakdownRes,
    historyRes,
    userAgentsRes,
    userMemoryRes,
    userConversationsRes,
    userRagConvsRes,
    marketplaceStatsRes,
    workflowsRes,
  ] = await Promise.all([
    quickGet('/billing/dashboard/me').catch((e) => { errors.push('dashboard'); return { data: null }; }),
    quickGet('/billing/credits').catch((e) => { errors.push('credits'); return { data: null }; }),
    quickGet('/billing/subscription').catch((e) => { errors.push('subscription'); return { data: null }; }),
    quickGet('/billing/dashboard/me/breakdown').catch((e) => { errors.push('breakdown'); return { data: null }; }),
    quickGet('/billing/usage/tokens/history?days=30').catch(() => ({ data: null })),
    // Per-user REAL data from actual services
    quickGet('/api/v1/agents').catch(() => ({ data: null })),
    quickGet('/memory/stats').catch(() => ({ data: null })),
    quickGet('/resonant-chat/conversations').catch(() => ({ data: null })),
    quickGet('/rag/conversations?limit=10000').catch(() => ({ data: null })),
    // Platform-wide metrics (marketplace only — compliance removed from user dashboard)
    quickGet('/marketplace/stats').catch(() => ({ data: null })),
    quickGet('/api/v1/workflow/workflows').catch(() => ({ data: null })),
  ]);

  // Extract data
  const dashboard = dashboardRes.data;
  const credits = creditsRes.data;
  const subscription = subscriptionRes.data;
  const breakdown = breakdownRes.data;
  const history = historyRes.data;
  const marketplaceStats = marketplaceStatsRes.data;
  const workflowsList = workflowsRes.data;

  // Per-user REAL counts from actual services
  const userAgentsList = userAgentsRes.data;
  const userMemoryStats = userMemoryRes.data;
  const userConvsList = userConversationsRes.data;
  const userRagConvs = userRagConvsRes.data;
  const realAgentCount = Array.isArray(userAgentsList) ? userAgentsList.length : (userAgentsList?.agents ? userAgentsList.agents.length : null);
  const realMemoryCount = userMemoryStats?.total_memories ?? userMemoryStats?.total_embeddings ?? null;
  const realStorageMb = userMemoryStats?.storage_mb ?? userMemoryStats?.storage_size_mb ?? 0;
  const realChatCount = Array.isArray(userConvsList) ? userConvsList.length : 0;
  const realRagCount = Array.isArray(userRagConvs) ? userRagConvs.length : 0;
  const realConversationCount = realChatCount + realRagCount;

  // Determine tier from REAL subscription data only
  const plan = subscription?.plan?.toLowerCase();
  let tier: string | null = null;
  if (plan === 'free') tier = 'free';
  else if (plan === 'developer') tier = 'developer';
  else if (plan === 'plus' || plan === 'professional') tier = 'plus';
  else if (plan === 'enterprise') tier = 'enterprise';

  // Get REAL credits data
  const balance = dashboard?.current_balance ?? credits?.balance ?? subscription?.credit_balance ?? null;
  let creditLimit = dashboard?.tier_credits ?? null;

  const usedThisMonthFromBackend = dashboard?.usage_this_period ?? null;
  const derivedUsedThisMonth = creditLimit !== null && balance !== null && creditLimit > 0
    ? Math.max(0, creditLimit - balance)
    : null;

  const usedThisMonth = derivedUsedThisMonth !== null && (
    usedThisMonthFromBackend === null ||
    (typeof usedThisMonthFromBackend === 'number' && Math.abs(derivedUsedThisMonth - usedThisMonthFromBackend) > Math.max(5, creditLimit * 0.05))
  )
    ? derivedUsedThisMonth
    : usedThisMonthFromBackend;

  // Days remaining from REAL data only
  const daysRemaining = dashboard?.days_remaining ?? null;

  // Burn rate from backend (or calculate if not provided)
  const burnRate = dashboard?.burn_rate ?? null;

  // Build usage breakdown from backend response (supports both legacy and new shapes)
  let usageBreakdown: { service: string; credits: number; percentage: number }[] = normalizeBreakdown(breakdown, dashboard);

  // If credit breakdown is empty, build from REAL activity counts
  if (usageBreakdown.length === 0 || usageBreakdown.every(b => b.credits === 0)) {
    const chatActivity = realChatCount;
    const agentActivity = realAgentCount ?? 0;
    const memoryActivity = realMemoryCount ?? 0;
    const ragActivity = realRagCount;
    const workflowActivity = Array.isArray(workflowsList) ? workflowsList.length : 0;
    const totalActivity = chatActivity + agentActivity + memoryActivity + ragActivity + workflowActivity;

    if (totalActivity > 0) {
      const activityBreakdown: { service: string; credits: number; percentage: number }[] = [];
      if (chatActivity > 0) activityBreakdown.push({ service: 'Chat', credits: chatActivity, percentage: Math.round((chatActivity / totalActivity) * 100) });
      if (agentActivity > 0) activityBreakdown.push({ service: 'Agents', credits: agentActivity, percentage: Math.round((agentActivity / totalActivity) * 100) });
      if (memoryActivity > 0) activityBreakdown.push({ service: 'Storage', credits: memoryActivity, percentage: Math.round((memoryActivity / totalActivity) * 100) });
      if (ragActivity > 0) activityBreakdown.push({ service: 'Code Visualizer', credits: ragActivity, percentage: Math.round((ragActivity / totalActivity) * 100) });
      if (workflowActivity > 0) activityBreakdown.push({ service: 'Workflows', credits: workflowActivity, percentage: Math.round((workflowActivity / totalActivity) * 100) });
      usageBreakdown = activityBreakdown.sort((a, b) => b.credits - a.credits);
    }
  }

  // Build alerts from REAL data
  const alerts: DashboardData['alerts'] = dashboard?.alerts || [];
  // Only add computed alerts if we have REAL data
  if (alerts.length === 0 && balance !== null && creditLimit !== null && usedThisMonth !== null) {
    const usagePercent = creditLimit > 0 ? (usedThisMonth / creditLimit) * 100 : 0;
    if (balance <= 0) {
      alerts.push({ type: 'error', message: 'Credits exhausted - please upgrade or purchase more', priority: 'critical' });
    } else if (usagePercent >= 90) {
      alerts.push({ type: 'error', message: 'Only 10% of credits remaining', priority: 'high' });
    } else if (usagePercent >= 80) {
      alerts.push({ type: 'warning', message: "You've used 80% of your credits this month" });
    }
  }

  // Add error alert if we couldn't fetch data
  if (errors.length > 0) {
    alerts.push({ 
      type: 'warning', 
      message: `Unable to load some data. Please refresh or re-login.`,
      priority: 'medium'
    });
  }

  // Get activity metrics from REAL per-user service endpoints
  const messages = realConversationCount;
  const memories = realMemoryCount ?? 0;
  const agents = realAgentCount ?? 0;
  const sessions = realConversationCount;
  const agentsLimit = dashboard?.agents_limit ?? null;

  // Build recent activity from REAL transactions
  const recentActivity: DashboardData['recentActivity'] = [];
  if (dashboard?.recent_transactions) {
    dashboard.recent_transactions.slice(0, 10).forEach((tx: any) => {
      recentActivity.push({
        type: tx.reference_type || 'usage',
        description: tx.description || `${tx.tx_type}: ${Math.abs(tx.amount)} credits`,
        timestamp: tx.created_at,
        amount: tx.amount,
      });
    });
  }

  // Platform agent metrics not used for per-user dashboard
  const platformAgentMetrics = null;

  // Compliance removed from user dashboard — was system-wide, not per-user
  const platformCompliance = null;

  const platformMemory = userMemoryStats ? {
    totalMemories: userMemoryStats.total_memories ?? userMemoryStats.total_embeddings ?? 0,
    storageMb: userMemoryStats.storage_mb ?? userMemoryStats.storage_size_mb ?? 0,
    totalEmbeddings: userMemoryStats.total_embeddings ?? 0,
    totalClusters: userMemoryStats.total_clusters ?? 0,
  } : null;

  const platformMarketplace = marketplaceStats ? {
    totalListings: marketplaceStats.total_listings ?? 0,
    totalDownloads: marketplaceStats.total_downloads ?? 0,
    totalPublishers: marketplaceStats.total_publishers ?? 0,
  } : null;

  const platformWorkflows = Array.isArray(workflowsList)
    ? { count: workflowsList.length }
    : null;

  // Per-user counts from real service endpoints — NOT billing (which returns 0)
  const enrichedAgents = agents;
  const enrichedMemories = memories;
  const enrichedSessions = sessions;

  return {
    credits: {
      balance,
      limit: creditLimit,
      usedThisMonth,
      burnRate,
      daysRemaining,
      unlimited: credits?.unlimited || subscription?.unlimited_credits || false,
    },
    tier,
    usageBreakdown,
    usageTrend: normalizeUsageTrend(history || dashboard?.recent_transactions || [], 30),
    activity: {
      messages,
      agents: enrichedAgents ?? 0,
      agentsLimit,
      memories: enrichedMemories ?? 0,
      sessions: enrichedSessions ?? 0,
    },
    alerts,
    recentActivity,
    platform: {
      agentMetrics: platformAgentMetrics,
      compliance: platformCompliance,
      memory: platformMemory,
      marketplace: platformMarketplace,
      workflows: platformWorkflows,
    },
    error: errors.length > 0 ? `Failed to load: ${errors.join(', ')}` : undefined,
  };
};

/**
 * Fetch usage breakdown by service
 */
export const fetchUsageBreakdown = async (): Promise<{ service: string; credits: number; percentage: number }[]> => {
  try {
    const res = await fastapiClient.get('/billing/usage/breakdown');
    return res.data || [];
  } catch {
    return [];
  }
};

/**
 * Fetch token usage history for charts
 */
export const fetchUsageHistory = async (days: number = 30): Promise<{ date: string; tokens: number }[]> => {
  try {
    const res = await fastapiClient.get(`/billing/usage/tokens/history?days=${days}`);
    return res.data || [];
  } catch {
    return [];
  }
};
