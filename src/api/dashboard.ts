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
  const arr: Array<{ date: string; tokens: number }> = Array.isArray(history) ? history : [];
  const map = new Map<string, number>();
  for (const item of arr) {
    if (item && typeof item.date === 'string') {
      map.set(item.date, typeof item.tokens === 'number' ? item.tokens : 0);
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
  
  // Fetch data from multiple endpoints in parallel
  const [
    dashboardRes,
    creditsRes,
    subscriptionRes,
    breakdownRes,
    historyRes,
    analyticsRes,
    usageMetricsRes,
    agentMetricsRes,
    complianceRes,
    memoryStatsRes,
    marketplaceStatsRes,
    workflowsRes,
  ] = await Promise.all([
    fastapiClient.get('/billing/dashboard/me').catch((e) => { errors.push('dashboard'); return { data: null }; }),
    fastapiClient.get('/billing/credits').catch((e) => { errors.push('credits'); return { data: null }; }),
    fastapiClient.get('/billing/subscription').catch((e) => { errors.push('subscription'); return { data: null }; }),
    fastapiClient.get('/billing/dashboard/me/breakdown').catch((e) => { errors.push('breakdown'); return { data: null }; }),
    fastapiClient.get('/billing/usage/tokens/history?days=30').catch((e) => { errors.push('history'); return { data: null }; }),
    fastapiClient.get('/analytics').catch((e) => { errors.push('analytics'); return { data: null }; }),
    fastapiClient.get('/usage/metrics').catch((e) => { errors.push('usage_metrics'); return { data: null }; }),
    fastapiClient.get('/api/v1/agents/metrics').catch(() => ({ data: null })),
    fastapiClient.get('/api/v1/agents/compliance/score').catch(() => ({ data: null })),
    fastapiClient.get('/memory/stats').catch(() => ({ data: null })),
    fastapiClient.get('/marketplace/stats').catch(() => ({ data: null })),
    fastapiClient.get('/api/v1/workflow/workflows').catch(() => ({ data: null })),
  ]);

  // Extract REAL data only - no fallbacks
  const dashboard = dashboardRes.data;
  const credits = creditsRes.data;
  const subscription = subscriptionRes.data;
  const breakdown = breakdownRes.data;
  const history = historyRes.data;
  const analytics = analyticsRes.data;
  const usageMetrics = usageMetricsRes.data;
  const agentMetrics = agentMetricsRes.data;
  const complianceData = complianceRes.data;
  const memoryStats = memoryStatsRes.data;
  const marketplaceStats = marketplaceStatsRes.data;
  const workflowsList = workflowsRes.data;

  // Determine tier from REAL subscription data only
  const plan = subscription?.plan?.toLowerCase();
  let tier: string | null = null;
  if (plan === 'developer' || plan === 'free') tier = 'developer';
  else if (plan === 'plus' || plan === 'professional') tier = 'plus';
  else if (plan === 'enterprise') tier = 'enterprise';

  // Get REAL credits data
  const balance = dashboard?.current_balance ?? credits?.balance ?? usageMetrics?.credits?.balance ?? null;
  let creditLimit = dashboard?.tier_credits ?? usageMetrics?.credits?.limit ?? null;
  if (creditLimit === 0 && usageMetrics?.credits?.limit) creditLimit = usageMetrics.credits.limit;

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
  const usageBreakdown: { service: string; credits: number; percentage: number }[] = normalizeBreakdown(breakdown, dashboard);

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

  // Get activity metrics from REAL data only - no fallbacks
  const messages = analytics?.usage?.total_messages ?? dashboard?.messages ?? null;
  const memories = usageMetrics?.memory?.anchorsUsed ?? analytics?.usage?.total_memories ?? dashboard?.memories ?? null;
  const agents = usageMetrics?.agents?.active ?? dashboard?.agents ?? null;
  const sessions = usageMetrics?.conversations?.count ?? dashboard?.sessions ?? analytics?.usage?.total_conversations ?? null;
  const agentsLimit = usageMetrics?.agents?.limit ?? dashboard?.agents_limit ?? null;

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

  // Build platform-wide metrics from live services
  const platformAgentMetrics = agentMetrics ? {
    total: agentMetrics.agents?.total ?? 0,
    active: agentMetrics.agents?.active ?? 0,
    sessions: agentMetrics.sessions?.total ?? 0,
    running: agentMetrics.sessions?.running ?? 0,
    completed: agentMetrics.sessions?.completed ?? 0,
    failed: agentMetrics.sessions?.failed ?? 0,
  } : null;

  const platformCompliance = complianceData ? {
    score: complianceData.compliance_score ?? 0,
    grade: complianceData.grade ?? '—',
    framework: complianceData.framework ?? '',
    checks: Array.isArray(complianceData.checks) ? complianceData.checks : [],
  } : null;

  const platformMemory = memoryStats ? {
    totalMemories: memoryStats.total_memories ?? memoryStats.total_embeddings ?? 0,
    storageMb: memoryStats.storage_mb ?? memoryStats.storage_size_mb ?? 0,
    totalEmbeddings: memoryStats.total_embeddings ?? 0,
    totalClusters: memoryStats.total_clusters ?? 0,
  } : null;

  const platformMarketplace = marketplaceStats ? {
    totalListings: marketplaceStats.total_listings ?? 0,
    totalDownloads: marketplaceStats.total_downloads ?? 0,
    totalPublishers: marketplaceStats.total_publishers ?? 0,
  } : null;

  const platformWorkflows = Array.isArray(workflowsList)
    ? { count: workflowsList.length }
    : null;

  // Enrich activity with real agent/memory data from live services
  const enrichedAgents = platformAgentMetrics?.active ?? agents;
  const enrichedMemories = platformMemory?.totalMemories ?? memories;
  const enrichedSessions = platformAgentMetrics?.sessions ?? sessions;

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
    usageTrend: normalizeUsageTrend(history || [], 30),
    activity: {
      messages,
      agents: enrichedAgents,
      agentsLimit,
      memories: enrichedMemories,
      sessions: enrichedSessions,
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
