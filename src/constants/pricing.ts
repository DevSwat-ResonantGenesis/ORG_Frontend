/**
 * Pricing Constants - Single Source of Truth
 * 
 * This file contains all pricing information for the platform.
 * Use these constants in HomeNew.tsx and PricingPage.tsx to ensure consistency.
 * 
 * Last Updated: 2025-01-27
 */

export interface PlatformPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
}

/**
 * Platform Plans - Main product bundles
 * Aligned with pricing.yaml: developer, plus, enterprise
 */
/**
 * Stripe Payment Links - Direct checkout URLs
 * These bypass the backend checkout session and go straight to Stripe
 */
export const STRIPE_PAYMENT_LINKS = {
  plus_monthly: 'https://buy.stripe.com/7sYaEW7owgbHclrb7f33W0b',
};

export const PLATFORM_PLANS: PlatformPlan[] = [
  {
    id: 'developer',
    name: 'Developer',
    monthlyPrice: 15,
    yearlyPrice: 150,
    description: 'Full platform access for solo builders — 15K credits/month',
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    description: 'For serious builders, teams, and power users with autonomous agents',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0, // Custom pricing
    description: 'For organizations running AI as critical infrastructure',
    popular: false,
  },
];

/**
 * Get formatted price string
 */
export const formatPrice = (price: number, currency: string = '$'): string => {
  if (price === 0) return 'Custom';
  return `${currency}${price.toLocaleString()}`;
};

/**
 * Get monthly price for a plan
 */
export const getMonthlyPrice = (planId: string): number => {
  const plan = PLATFORM_PLANS.find(p => p.id === planId);
  return plan?.monthlyPrice || 0;
};

/**
 * Get yearly price for a plan
 */
export const getYearlyPrice = (planId: string): number => {
  const plan = PLATFORM_PLANS.find(p => p.id === planId);
  return plan?.yearlyPrice || 0;
};

/**
 * Get formatted monthly price
 */
export const getFormattedMonthlyPrice = (planId: string): string => {
  return formatPrice(getMonthlyPrice(planId));
};

/**
 * Get formatted yearly price
 */
export const getFormattedYearlyPrice = (planId: string): string => {
  return formatPrice(getYearlyPrice(planId));
};

