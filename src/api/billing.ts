/**
 * Billing API Client
 * Full Stripe integration for subscriptions, credits, usage, and invoices.
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface Subscription {
  id?: string;
  plan: string;
  billing_cycle: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  amount?: number;
  currency?: string;
  is_dev?: boolean;
}

export interface CreditBalance {
  balance: number;
  lifetime_purchased: number;
  lifetime_used: number;
  last_purchase?: string;
}

export interface CreditTransaction {
  id: string;
  tx_type: string;
  amount: number;
  balance_after: number;
  description?: string;
  created_at: string;
}

export interface CreditPack {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: string;
  perK: number;
  popular?: boolean;
  stripe_price_id?: string;
}

export interface UsageSummary {
  period_start: string;
  period_end: string;
  total_tokens: number;
  total_api_calls: number;
  total_cost: number;
  by_type: Record<string, number>;
  // Extended properties for UI components
  tokens_used?: number;
  token_limit?: number;
  usage_percent?: number;
  plan_tier?: string;
  breakdown?: Array<{ name: string; value: number; color: string }>;
  overage_enabled?: boolean;
}

export const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
};

export interface Invoice {
  id: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  due_date?: string;
  paid_at?: string;
}

// ============== OVERVIEW ==============

export const fetchBillingOverview = async () => {
  const res = await fastapiClient.get('/billing/overview');
  return res.data;
};

// ============== SUBSCRIPTIONS ==============

export const getSubscription = async (): Promise<Subscription> => {
  const res = await fastapiClient.get('/billing/subscription');
  return res.data;
};

export const createSubscription = async (params: {
  plan: string;
  billing_cycle?: 'monthly' | 'yearly';
  payment_method_id?: string;
  coupon_code?: string;
}): Promise<{ status: string; subscription_id: string; plan: string }> => {
  const res = await fastapiClient.post('/billing/subscription', params);
  logger.info('Subscription created', res.data);
  return res.data;
};

export const cancelSubscription = async (atPeriodEnd: boolean = true): Promise<{ status: string; effective_date: string }> => {
  const res = await fastapiClient.post('/billing/subscription/cancel', null, {
    params: { at_period_end: atPeriodEnd }
  });
  return res.data;
};

export const reactivateSubscription = async (): Promise<{ status: string; plan: string }> => {
  const res = await fastapiClient.post('/billing/subscription/reactivate');
  return res.data;
};

export const changePlan = async (
  planId: string, 
  billingPeriod: 'monthly' | 'yearly' = 'monthly',
  additionalData?: any
) => {
  const payload: any = { 
    new_plan: planId,
    billing_period: billingPeriod
  };
  
  if (additionalData) {
    Object.assign(payload, additionalData);
  }
  
  const res = await fastapiClient.post('/billing/subscription/change-plan', payload);
  return res.data;
};

// ============== PAYMENT METHODS ==============

export const getPaymentMethods = async () => {
  const res = await fastapiClient.get('/billing/payment-methods');
  return res.data;
};

export const addPaymentMethod = async () => {
  const res = await fastapiClient.post('/billing/payment-methods');
  if (res.data?.redirect_url) {
    window.location.href = res.data.redirect_url;
  }
  return res.data;
};

export const removePaymentMethod = async (id: string) => {
  const res = await fastapiClient.delete(`/billing/payment-methods/${id}`);
  return res.data;
};

export const setDefaultPaymentMethod = async (id: string) => {
  const res = await fastapiClient.post(`/billing/payment-methods/${id}/default`);
  return res.data;
};

// ============== CREDITS ==============

export const getCredits = async (): Promise<CreditBalance> => {
  const res = await fastapiClient.get('/billing/credits');
  return res.data;
};

export const purchaseCredits = async (params: {
  amount_usd: number;
  payment_method_id?: string;
}): Promise<{ status: string; credits: number; transaction_id: string }> => {
  const res = await fastapiClient.post('/billing/credits/purchase', params);
  logger.info('Credits purchased', res.data);
  return res.data;
};

export const getCreditTransactions = async (params?: {
  tx_type?: string;
  limit?: number;
  offset?: number;
}): Promise<CreditTransaction[]> => {
  const res = await fastapiClient.get('/billing/credits/transactions', { params });
  return res.data;
};

// ============== CREDIT PACKS (from Stripe) ==============

/**
 * Fetch credit packs from backend (connected to Stripe Products/Prices)
 * Backend endpoint is MANDATORY - no fallback values
 * @throws Error if backend endpoint fails or returns empty data
 */
export const getCreditPacks = async (): Promise<CreditPack[]> => {
  const res = await fastapiClient.get('/billing/packs');
  if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
    throw new Error('Credit packs not configured. Please contact support.');
  }
  return res.data;
};

// ============== USAGE ==============

export interface UsageBreakdown {
  chat: number;
  agents: number;
  compute: number;
  workflows: number;
  storage: number;
  other: number;
  total: number;
}

export const getUsageSummary = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<UsageSummary> => {
  const res = await fastapiClient.get('/billing/usage/summary', { params });
  return res.data;
};

export const getUsageBreakdown = async (): Promise<UsageBreakdown> => {
  try {
    const res = await fastapiClient.get('/billing/usage/breakdown');
    return res.data;
  } catch (error) {
    // Return mock data if API not available
    return {
      chat: 0,
      agents: 0,
      compute: 0,
      workflows: 0,
      storage: 0,
      other: 0,
      total: 0,
    };
  }
};

export const getUsageHistory = async (params?: {
  usage_type?: string;
  limit?: number;
}): Promise<any[]> => {
  const res = await fastapiClient.get('/billing/usage', { params });
  return res.data;
};

// ============== INVOICES ==============

export const getInvoices = async (params?: {
  status?: string;
  limit?: number;
}): Promise<Invoice[]> => {
  const res = await fastapiClient.get('/billing/invoices', { params });
  return res.data;
};

export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  const res = await fastapiClient.get(`/billing/invoices/${invoiceId}`);
  return res.data;
};

export const downloadInvoice = async (invoiceId: string): Promise<string> => {
  const res = await fastapiClient.get(`/billing/invoices/${invoiceId}/pdf`);
  return res.data.url;
};

// ============== STRIPE PORTAL ==============

export const createPortalSession = async (): Promise<{ url: string }> => {
  const res = await fastapiClient.post('/billing/portal');
  if (res.data?.url) {
    window.location.href = res.data.url;
  }
  return res.data;
};

// ============== DEFAULT EXPORT ==============

export default {
  fetchBillingOverview,
  getSubscription,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getCredits,
  purchaseCredits,
  getCreditTransactions,
  getUsageSummary,
  getUsageBreakdown,
  getUsageHistory,
  getInvoices,
  getInvoice,
  downloadInvoice,
  createPortalSession,
};
