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
 */
export const PLATFORM_PLANS: PlatformPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: 'Essential AI governance for individuals and small teams',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    description: 'Complete AI governance platform for growing teams',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    description: 'Enterprise AI governance with all products and features',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0, // Custom pricing
    description: 'For large enterprises and regulated industries',
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

