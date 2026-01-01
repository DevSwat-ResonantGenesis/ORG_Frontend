/**
 * COMPLETE BILLING API
 * ====================
 * 
 * Full billing API client covering all backend endpoints:
 * - Subscriptions
 * - Credits
 * - Usage metering
 * - Invoices
 * - Payment methods
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface Subscription {
  id: string;
  plan: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  amount: number | null;
  currency: string;
  is_dev?: boolean;
}

export interface CreditBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  currency: string;
}

export interface CreditTransaction {
  id: string;
  tx_type: 'purchase' | 'deduction' | 'refund' | 'bonus';
  amount: number;
  balance_after: number;
  reference_type: string;
  description: string;
  created_at: string;
}

export interface UsageSummary {
  period_start: string;
  period_end: string;
  by_type: Record<string, number>;
  total_cost: number;
}

export interface UsageMetrics {
  current_period: UsageSummary;
  limits: Record<string, number>;
  usage_percent: Record<string, number>;
}

export interface Invoice {
  id: string;
  number: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  amount: number;
  currency: string;
  due_date: string;
  paid_at: string | null;
  pdf_url: string | null;
  line_items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface PlanDetails {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: Record<string, number>;
}

// ============== SUBSCRIPTIONS ==============

/**
 * Get current subscription.
 */
export const getSubscription = async (): Promise<Subscription> => {
  const response = await fastapiClient.get('/billing/subscription');
  return response.data;
};

/**
 * Create a new subscription.
 */
export const createSubscription = async (
  plan: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  paymentMethodId?: string,
  couponCode?: string
): Promise<{ subscription_id: string; plan: string }> => {
  try {
    const response = await fastapiClient.post('/billing/subscription', {
      plan,
      billing_cycle: billingCycle,
      payment_method_id: paymentMethodId,
      coupon_code: couponCode,
    });
    logger.info('Subscription created', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to create subscription', error);
    throw error;
  }
};

/**
 * Cancel subscription.
 */
export const cancelSubscription = async (
  atPeriodEnd: boolean = true
): Promise<{ status: string; effective_date: string }> => {
  const response = await fastapiClient.post('/billing/subscription/cancel', null, {
    params: { at_period_end: atPeriodEnd },
  });
  return response.data;
};

/**
 * Reactivate canceled subscription.
 */
export const reactivateSubscription = async (): Promise<{ status: string; plan: string }> => {
  const response = await fastapiClient.post('/billing/subscription/reactivate');
  return response.data;
};

/**
 * Change subscription plan.
 */
export const changePlan = async (
  newPlan: string
): Promise<{ status: string; new_plan: string }> => {
  const response = await fastapiClient.post('/billing/subscription/change-plan', {
    new_plan: newPlan,
  });
  return response.data;
};

/**
 * Get available plans.
 */
export const getPlans = async (): Promise<PlanDetails[]> => {
  const response = await fastapiClient.get('/billing/plans');
  return response.data;
};

// ============== CREDITS ==============

/**
 * Get credit balance.
 */
export const getCreditBalance = async (): Promise<CreditBalance> => {
  const response = await fastapiClient.get('/billing/credits');
  return response.data;
};

/**
 * Purchase credits.
 */
export const purchaseCredits = async (
  amountUsd: number,
  paymentMethodId?: string
): Promise<{ status: string; credits_added: number; new_balance: number }> => {
  try {
    const response = await fastapiClient.post('/billing/credits/purchase', {
      amount_usd: amountUsd,
      payment_method_id: paymentMethodId,
    });
    logger.info('Credits purchased', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to purchase credits', error);
    throw error;
  }
};

/**
 * Get credit transaction history.
 */
export const getCreditTransactions = async (
  txType?: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> => {
  const response = await fastapiClient.get('/billing/credits/transactions', {
    params: { tx_type: txType, limit, offset },
  });
  return response.data;
};

// ============== USAGE ==============

/**
 * Get usage summary for current period.
 */
export const getUsageSummary = async (): Promise<UsageSummary> => {
  const response = await fastapiClient.get('/billing/usage/summary');
  return response.data;
};

/**
 * Get full usage metrics with limits.
 */
export const getUsageMetrics = async (): Promise<UsageMetrics> => {
  const response = await fastapiClient.get('/billing/usage/metrics');
  return response.data;
};

/**
 * Record usage (internal).
 */
export const recordUsage = async (
  usageType: string,
  quantity: number,
  metadata?: Record<string, any>
): Promise<{ status: string; record_id: string }> => {
  const response = await fastapiClient.post('/billing/usage/record', {
    usage_type: usageType,
    quantity,
    metadata,
  });
  return response.data;
};

// ============== INVOICES ==============

/**
 * Get invoices.
 */
export const getInvoices = async (
  status?: string,
  limit: number = 20
): Promise<Invoice[]> => {
  const response = await fastapiClient.get('/billing/invoices', {
    params: { status, limit },
  });
  return response.data;
};

/**
 * Get specific invoice.
 */
export const getInvoice = async (invoiceId: string): Promise<Invoice> => {
  const response = await fastapiClient.get(`/billing/invoices/${invoiceId}`);
  return response.data;
};

/**
 * Download invoice PDF.
 */
export const downloadInvoicePdf = async (invoiceId: string): Promise<Blob> => {
  const response = await fastapiClient.get(`/billing/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Pay open invoice.
 */
export const payInvoice = async (
  invoiceId: string,
  paymentMethodId?: string
): Promise<{ status: string; paid_at: string }> => {
  const response = await fastapiClient.post(`/billing/invoices/${invoiceId}/pay`, {
    payment_method_id: paymentMethodId,
  });
  return response.data;
};

// ============== PAYMENT METHODS ==============

/**
 * Get payment methods.
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await fastapiClient.get('/billing/payment-methods');
  return response.data;
};

/**
 * Add payment method (redirects to Stripe).
 */
export const addPaymentMethod = async (): Promise<{ redirect_url: string }> => {
  const response = await fastapiClient.post('/billing/payment-methods');
  if (response.data?.redirect_url) {
    window.location.href = response.data.redirect_url;
  }
  return response.data;
};

/**
 * Remove payment method.
 */
export const removePaymentMethod = async (
  paymentMethodId: string
): Promise<{ status: string }> => {
  const response = await fastapiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
  return response.data;
};

/**
 * Set default payment method.
 */
export const setDefaultPaymentMethod = async (
  paymentMethodId: string
): Promise<{ status: string }> => {
  const response = await fastapiClient.post(`/billing/payment-methods/${paymentMethodId}/default`);
  return response.data;
};

// ============== CHECKOUT ==============

/**
 * Create checkout session for subscription.
 */
export const createCheckoutSession = async (
  plan: string,
  billingCycle: 'monthly' | 'yearly',
  successUrl: string,
  cancelUrl: string
): Promise<{ session_id: string; url: string }> => {
  const response = await fastapiClient.post('/billing/checkout/subscription', {
    plan,
    billing_cycle: billingCycle,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return response.data;
};

/**
 * Create checkout session for credits.
 */
export const createCreditsCheckout = async (
  amountUsd: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ session_id: string; url: string }> => {
  const response = await fastapiClient.post('/billing/checkout/credits', {
    amount_usd: amountUsd,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return response.data;
};

// ============== BILLING PORTAL ==============

/**
 * Get Stripe billing portal URL.
 */
export const getBillingPortalUrl = async (
  returnUrl: string
): Promise<{ url: string }> => {
  const response = await fastapiClient.post('/billing/portal', {
    return_url: returnUrl,
  });
  return response.data;
};

// ============== OVERVIEW ==============

/**
 * Get billing overview (subscription + credits + usage).
 */
export const getBillingOverview = async (): Promise<{
  subscription: Subscription;
  credits: CreditBalance;
  usage: UsageSummary;
  upcoming_invoice: Invoice | null;
}> => {
  const response = await fastapiClient.get('/billing/overview');
  return response.data;
};

// ============== EXPORTS ==============

export default {
  // Subscriptions
  getSubscription,
  createSubscription,
  cancelSubscription,
  reactivateSubscription,
  changePlan,
  getPlans,
  // Credits
  getCreditBalance,
  purchaseCredits,
  getCreditTransactions,
  // Usage
  getUsageSummary,
  getUsageMetrics,
  recordUsage,
  // Invoices
  getInvoices,
  getInvoice,
  downloadInvoicePdf,
  payInvoice,
  // Payment Methods
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  // Checkout
  createCheckoutSession,
  createCreditsCheckout,
  getBillingPortalUrl,
  // Overview
  getBillingOverview,
};
