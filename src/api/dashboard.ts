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
  isLoading?: boolean;
  error?: string;
}

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
  ] = await Promise.all([
    fastapiClient.get('/billing/dashboard/me').catch((e) => { errors.push('dashboard'); return { data: null }; }),
    fastapiClient.get('/billing/credits').catch((e) => { errors.push('credits'); return { data: null }; }),
    fastapiClient.get('/billing/subscription').catch((e) => { errors.push('subscription'); return { data: null }; }),
    fastapiClient.get('/billing/dashboard/me/breakdown').catch((e) => { errors.push('breakdown'); return { data: null }; }),
    fastapiClient.get('/billing/usage/tokens/history?days=30').catch((e) => { errors.push('history'); return { data: null }; }),
    fastapiClient.get('/resonant-chat/analytics').catch((e) => { errors.push('analytics'); return { data: null }; }),
  ]);

  // Extract REAL data only - no fallbacks
  const dashboard = dashboardRes.data;
  const credits = creditsRes.data;
  const subscription = subscriptionRes.data;
  const breakdown = breakdownRes.data;
  const history = historyRes.data;
  const analytics = analyticsRes.data;

  // Determine tier from REAL subscription data only
  const plan = subscription?.plan?.toLowerCase();
  let tier: string | null = null;
  if (plan === 'developer' || plan === 'free') tier = 'developer';
  else if (plan === 'plus' || plan === 'professional') tier = 'plus';
  else if (plan === 'enterprise') tier = 'enterprise';

  // Get REAL credits data - no fallbacks
  const balance = dashboard?.current_balance ?? credits?.balance ?? null;
  const creditLimit = dashboard?.tier_credits ?? null;
  const usedThisMonth = dashboard?.usage_this_period ?? null;

  // Days remaining from REAL data only
  const daysRemaining = dashboard?.days_remaining ?? null;

  // Calculate burn rate from usage this period
  // Use days elapsed in billing period (30 - days_remaining)
  const daysElapsed = daysRemaining !== null ? 30 - daysRemaining : null;
  const burnRate = usedThisMonth !== null && usedThisMonth > 0 && daysElapsed !== null && daysElapsed > 0 
    ? Math.round(usedThisMonth / daysElapsed) 
    : null;

  // Build usage breakdown from REAL data only - no estimates
  let usageBreakdown: { service: string; credits: number; percentage: number }[] = [];
  if (breakdown && Array.isArray(breakdown) && breakdown.length > 0) {
    usageBreakdown = breakdown;
  } else if (dashboard?.usage_by_service && dashboard.usage_by_service.length > 0) {
    usageBreakdown = dashboard.usage_by_service.map((s: any) => ({
      service: s.service,
      credits: s.credits,
      percentage: s.percentage,
    }));
  }
  // NO ESTIMATED BREAKDOWN - only real data

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
  const memories = analytics?.usage?.total_memories ?? dashboard?.memories ?? null;
  const agents = dashboard?.agents ?? null;
  const sessions = dashboard?.sessions ?? analytics?.usage?.total_conversations ?? null;
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

  return {
    credits: {
      balance,
      limit: creditLimit,
      usedThisMonth,
      burnRate,
      daysRemaining,
    },
    tier,
    usageBreakdown,
    usageTrend: history || [],
    activity: {
      messages,
      agents,
      agentsLimit,
      memories,
      sessions,
    },
    alerts,
    recentActivity,
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
