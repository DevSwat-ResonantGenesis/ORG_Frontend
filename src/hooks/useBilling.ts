/**
 * BILLING HOOKS
 * =============
 * 
 * React hooks for billing functionality.
 * Wires billingComplete API to UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import * as billingApi from '../api/billingComplete';
import type {
  Subscription,
  CreditBalance,
  CreditTransaction,
  UsageMetrics,
  Invoice,
  PaymentMethod,
  PlanDetails,
} from '../api/billingComplete';

// ============== SUBSCRIPTION HOOK ==============

interface UseSubscriptionResult {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  changePlan: (newPlan: string) => Promise<void>;
  cancel: (atPeriodEnd?: boolean) => Promise<void>;
  reactivate: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getSubscription();
      setSubscription(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePlan = useCallback(async (newPlan: string) => {
    await billingApi.changePlan(newPlan);
    await fetchData();
  }, [fetchData]);

  const cancel = useCallback(async (atPeriodEnd = true) => {
    await billingApi.cancelSubscription(atPeriodEnd);
    await fetchData();
  }, [fetchData]);

  const reactivate = useCallback(async () => {
    await billingApi.reactivateSubscription();
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { subscription, isLoading, error, refetch: fetchData, changePlan, cancel, reactivate };
}

// ============== CREDITS HOOK ==============

interface UseCreditsResult {
  balance: CreditBalance | null;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  purchase: (amountUsd: number) => Promise<void>;
  loadMoreTransactions: (offset: number) => Promise<void>;
}

export function useCredits(): UseCreditsResult {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [balanceData, txData] = await Promise.all([
        billingApi.getCreditBalance(),
        billingApi.getCreditTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(txData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchase = useCallback(async (amountUsd: number) => {
    await billingApi.purchaseCredits(amountUsd);
    await fetchData();
  }, [fetchData]);

  const loadMoreTransactions = useCallback(async (offset: number) => {
    const moreTx = await billingApi.getCreditTransactions(undefined, 50, offset);
    setTransactions(prev => [...prev, ...moreTx]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { balance, transactions, isLoading, error, refetch: fetchData, purchase, loadMoreTransactions };
}

// ============== USAGE HOOK ==============

interface UseUsageResult {
  metrics: UsageMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUsage(): UseUsageResult {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getUsageMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch usage'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, isLoading, error, refetch: fetchData };
}

// ============== INVOICES HOOK ==============

interface UseInvoicesResult {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  downloadPdf: (invoiceId: string) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
}

export function useInvoices(): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getInvoices();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadPdf = useCallback(async (invoiceId: string) => {
    const blob = await billingApi.downloadInvoicePdf(invoiceId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoiceId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const payInvoice = useCallback(async (invoiceId: string) => {
    await billingApi.payInvoice(invoiceId);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { invoices, isLoading, error, refetch: fetchData, downloadPdf, payInvoice };
}

// ============== PAYMENT METHODS HOOK ==============

interface UsePaymentMethodsResult {
  methods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addMethod: () => Promise<void>;
  removeMethod: (methodId: string) => Promise<void>;
  setDefault: (methodId: string) => Promise<void>;
}

export function usePaymentMethods(): UsePaymentMethodsResult {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getPaymentMethods();
      setMethods(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payment methods'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addMethod = useCallback(async () => {
    await billingApi.addPaymentMethod();
  }, []);

  const removeMethod = useCallback(async (methodId: string) => {
    await billingApi.removePaymentMethod(methodId);
    await fetchData();
  }, [fetchData]);

  const setDefault = useCallback(async (methodId: string) => {
    await billingApi.setDefaultPaymentMethod(methodId);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { methods, isLoading, error, refetch: fetchData, addMethod, removeMethod, setDefault };
}

// ============== PLANS HOOK ==============

interface UsePlansResult {
  plans: PlanDetails[];
  isLoading: boolean;
  error: Error | null;
  checkout: (plan: string, billingCycle: 'monthly' | 'yearly') => Promise<void>;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch plans'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkout = useCallback(async (plan: string, billingCycle: 'monthly' | 'yearly') => {
    const { url } = await billingApi.createCheckoutSession(
      plan,
      billingCycle,
      `${window.location.origin}/billing?success=true`,
      `${window.location.origin}/billing?canceled=true`
    );
    window.location.href = url;
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { plans, isLoading, error, checkout };
}

// ============== BILLING OVERVIEW HOOK ==============

interface UseBillingOverviewResult {
  subscription: Subscription | null;
  credits: CreditBalance | null;
  usage: UsageMetrics | null;
  upcomingInvoice: Invoice | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
}

export function useBillingOverview(): UseBillingOverviewResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [upcomingInvoice, setUpcomingInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await billingApi.getBillingOverview();
      setSubscription(data.subscription);
      setCredits(data.credits);
      setUsage(data.usage as unknown as UsageMetrics);
      setUpcomingInvoice(data.upcoming_invoice);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch billing overview'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openBillingPortal = useCallback(async () => {
    const { url } = await billingApi.getBillingPortalUrl(window.location.href);
    window.location.href = url;
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    subscription,
    credits,
    usage,
    upcomingInvoice,
    isLoading,
    error,
    refetch: fetchData,
    openBillingPortal,
  };
}

export default {
  useSubscription,
  useCredits,
  useUsage,
  useInvoices,
  usePaymentMethods,
  usePlans,
  useBillingOverview,
};
