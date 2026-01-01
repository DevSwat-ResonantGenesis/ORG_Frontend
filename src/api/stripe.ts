import fastapiClient from './fastapiClient';
import { loadStripe as loadStripeOriginal } from '@stripe/stripe-js';

/**
 * Stripe Publishable Key (Frontend Safe)
 * This key can be safely exposed in frontend code
 * 
 * ⚠️ IMPORTANT: Never use secret keys in frontend!
 */
export const STRIPE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'STRIPE_PK_PLACEHOLDER';

/**
 * Load Stripe instance
 */
export const loadStripe = (publishableKey?: string) => {
  return loadStripeOriginal(publishableKey || STRIPE_PUBLISHABLE_KEY);
};

export interface CheckoutSession {
  session_id: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

export interface SubscriptionItem {
  price_id: string;
  product_id: string;
  amount: number;
  currency: string;
}

export interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: SubscriptionItem[];
}

export interface SubscriptionResponse {
  has_subscription: boolean;
  subscription: Subscription | null;
}

export const createCheckoutSession = async (
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> => {
  const res = await fastapiClient.post('/billing/stripe/checkout', {
    price_id: priceId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return res.data;
};

export const createPortalSession = async (returnUrl: string): Promise<PortalSession> => {
  const res = await fastapiClient.post('/billing/stripe/portal', {
    return_url: returnUrl,
  });
  return res.data;
};

export const getSubscription = async (): Promise<SubscriptionResponse> => {
  const res = await fastapiClient.get('/billing/stripe/subscription');
  return res.data;
};

