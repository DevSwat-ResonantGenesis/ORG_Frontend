import fastapiClient from './fastapiClient';

export interface APIUsageRecord {
  id: string;
  api_id: string;
  api_name: string;
  timestamp: string;
  endpoint: string;
  method: string;
  simulation_units: number;
  response_time_ms: number;
  status_code: number;
  success: boolean;
}

export interface APIUsageSummary {
  api_id: string;
  api_name: string;
  total_calls: number;
  total_simulation_units: number;
  included_units: number;
  overage_units: number;
  overage_cost: number;
  period_start: string;
  period_end: string;
  usage_percent: number;
}

export interface APISubscription {
  id: string;
  api_id: string;
  api_name: string;
  plan: 'dev' | 'startup' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  price: number;
  included_units: number;
  overage_rate: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoice_url?: string;
}

// Get all API subscriptions for the current user
export const getAPISubscriptions = async (): Promise<APISubscription[]> => {
  try {
    const res = await fastapiClient.get('/billing/api-subscriptions');
    return res.data.subscriptions || [];
  } catch (error) {
    console.error('Failed to fetch API subscriptions:', error);
    return [];
  }
};

// Get usage summary for all APIs
export const getAPIUsageSummary = async (): Promise<APIUsageSummary[]> => {
  try {
    const res = await fastapiClient.get('/billing/api-usage/summary');
    return res.data.usage || [];
  } catch (error) {
    console.error('Failed to fetch API usage summary:', error);
    return [];
  }
};

// Get detailed usage records for a specific API
export const getAPIUsageDetails = async (
  apiId: string,
  startDate?: string,
  endDate?: string
): Promise<APIUsageRecord[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const res = await fastapiClient.get(`/billing/api-usage/${apiId}?${params.toString()}`);
    return res.data.records || [];
  } catch (error) {
    console.error('Failed to fetch API usage details:', error);
    return [];
  }
};

// Get billing history
export const getBillingHistory = async (): Promise<BillingHistory[]> => {
  try {
    const res = await fastapiClient.get('/billing/history');
    return res.data.invoices || [];
  } catch (error) {
    console.error('Failed to fetch billing history:', error);
    return [];
  }
};

// Subscribe to an API
export const subscribeToAPI = async (
  apiId: string,
  plan: 'dev' | 'startup' | 'enterprise',
  successUrl: string,
  cancelUrl: string
): Promise<{ session_id: string; url: string }> => {
  const res = await fastapiClient.post('/billing/api-subscribe', {
    api_id: apiId,
    plan,
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return res.data;
};

// Cancel API subscription
export const cancelAPISubscription = async (subscriptionId: string): Promise<void> => {
  await fastapiClient.post(`/billing/api-subscriptions/${subscriptionId}/cancel`);
};

// Get current billing period costs
export const getCurrentBillingCosts = async (): Promise<{
  base_cost: number;
  overage_cost: number;
  total_cost: number;
  next_billing_date: string;
}> => {
  try {
    const res = await fastapiClient.get('/billing/current-costs');
    return res.data;
  } catch (error) {
    console.error('Failed to fetch current billing costs:', error);
    return {
      base_cost: 0,
      overage_cost: 0,
      total_cost: 0,
      next_billing_date: ''
    };
  }
};
