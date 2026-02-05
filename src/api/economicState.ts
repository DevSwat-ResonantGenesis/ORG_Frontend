/**
 * Economic State API
 * 
 * This is the SINGLE SOURCE OF TRUTH for user economic state in the frontend.
 * All dashboards and components should use this API to get:
 * - Subscription tier
 * - Credit balance
 * - Feature access
 * - Hard/soft limits
 * 
 * DO NOT use plan inference or local tier definitions.
 * The backend is authoritative.
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============================================
// TYPES (match backend exactly)
// ============================================

export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'suspended';
export type EnforcementMode = 'strict' | 'warn' | 'off';

export interface HardLimits {
  max_agents: number;
  max_workflows: number;
  max_memory_mb: number;
  max_requests_per_day: number;
  max_tokens_per_day: number;
}

export interface SoftLimits {
  max_concurrent_agents: number;
  max_concurrent_workflows: number;
  max_context_tokens: number;
}

export interface Features {
  ide_access: boolean;
  agent_marketplace: boolean;
  workflow_builder: boolean;
  code_execution: boolean;
  api_access: boolean;
  blockchain_access: boolean;
  hash_sphere_access: boolean;
}

export interface EconomicState {
  id: string;
  user_id: string;
  org_id: string;
  
  // Subscription
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_source: 'internal' | 'stripe';
  subscription_id: string | null;
  
  // Credits
  credit_balance: number;
  credit_rate: number;
  
  // Limits
  hard_limits: HardLimits;
  soft_limits: SoftLimits;
  
  // Features
  features: Features;
  
  // Enforcement
  enforcement_mode: EnforcementMode;
  is_dev_override: boolean;
  
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
}

export interface FeatureCheckResult {
  allowed: boolean;
  feature: string;
  reason: string;
}

export interface LimitCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  reason: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get the current user's economic state.
 * This is the primary function for dashboards.
 */
export const getEconomicState = async (): Promise<EconomicState> => {
  try {
    const res = await fastapiClient.get('/billing/economic-state/me');
    return res.data;
  } catch (error: any) {
    logger.error('Failed to fetch economic state', error);
    
    // Return a safe default for FREE tier if API fails
    // This prevents UI crashes but shows limited access
    return {
      id: '',
      user_id: '',
      org_id: '',
      subscription_tier: 'free',
      subscription_status: 'active',
      subscription_source: 'internal',
      subscription_id: null,
      credit_balance: 0,
      credit_rate: 1.0,
      hard_limits: {
        max_agents: 1,
        max_workflows: 2,
        max_memory_mb: 100,
        max_requests_per_day: 1000,
        max_tokens_per_day: 50000,
      },
      soft_limits: {
        max_concurrent_agents: 1,
        max_concurrent_workflows: 2,
        max_context_tokens: 4000,
      },
      features: {
        ide_access: false,
        agent_marketplace: true,
        workflow_builder: true,
        code_execution: false,
        api_access: true,
        blockchain_access: false,
        hash_sphere_access: true,
      },
      enforcement_mode: 'strict',
      is_dev_override: false,
      created_at: null,
      updated_at: null,
    };
  }
};

/**
 * Check if the current user can access a specific feature.
 */
export const checkFeatureAccess = async (feature: keyof Features): Promise<FeatureCheckResult> => {
  try {
    const res = await fastapiClient.get(`/billing/economic-state/me/check-feature/${feature}`);
    return res.data;
  } catch (error: any) {
    logger.error(`Failed to check feature access: ${feature}`, error);
    return {
      allowed: false,
      feature,
      reason: 'Could not verify feature access',
    };
  }
};

/**
 * Check if a limit would be exceeded.
 */
export const checkLimit = async (
  limitName: keyof HardLimits,
  currentValue: number
): Promise<LimitCheckResult> => {
  try {
    const res = await fastapiClient.post('/billing/economic-state/me/check-limit', {
      limit_name: limitName,
      current_value: currentValue,
    });
    return res.data;
  } catch (error: any) {
    logger.error(`Failed to check limit: ${limitName}`, error);
    return {
      allowed: false,
      limit: 0,
      current: currentValue,
      reason: 'Could not verify limit',
    };
  }
};

/**
 * Check if user has sufficient credits for an operation.
 */
export const checkCredits = async (amount: number): Promise<{
  success: boolean;
  new_balance: number;
  amount_deducted: number;
  reason: string;
}> => {
  try {
    const res = await fastapiClient.post('/billing/economic-state/me/check-credits', null, {
      params: { amount },
    });
    return res.data;
  } catch (error: any) {
    logger.error('Failed to check credits', error);
    return {
      success: false,
      new_balance: 0,
      amount_deducted: 0,
      reason: 'Could not verify credit balance',
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user has IDE access based on their economic state.
 */
export const hasIDEAccess = (state: EconomicState): boolean => {
  if (state.is_dev_override) return true;
  return state.features.ide_access && state.features.code_execution;
};

/**
 * Check if user has blockchain access.
 */
export const hasBlockchainAccess = (state: EconomicState): boolean => {
  if (state.is_dev_override) return true;
  return state.features.blockchain_access;
};

/**
 * Get the display name for a tier.
 */
export const getTierDisplayName = (tier: SubscriptionTier): string => {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    plus: 'Plus',
    pro: 'Professional',
    enterprise: 'Enterprise',
  };
  return names[tier] || tier;
};

/**
 * Get tier color for UI.
 */
export const getTierColor = (tier: SubscriptionTier): string => {
  const colors: Record<SubscriptionTier, string> = {
    free: '#6B7280',      // gray
    plus: '#3B82F6',      // blue
    pro: '#8B5CF6',       // purple
    enterprise: '#F59E0B', // amber
  };
  return colors[tier] || '#6B7280';
};

/**
 * Format credit balance for display.
 */
export const formatCredits = (credits: number): string => {
  if (credits < 0) return '∞';
  if (credits >= 1_000_000) return `${(credits / 1_000_000).toFixed(1)}M`;
  if (credits >= 1_000) return `${(credits / 1_000).toFixed(1)}K`;
  return credits.toLocaleString();
};

/**
 * Calculate usage percentage.
 */
export const getUsagePercent = (used: number, limit: number): number => {
  if (limit <= 0 || limit === -1) return 0; // Unlimited
  return Math.min(100, Math.round((used / limit) * 100));
};

/**
 * Check if limit is unlimited (-1).
 */
export const isUnlimited = (limit: number): boolean => {
  return limit === -1;
};

// ============================================
// REACT HOOK (optional, for convenience)
// ============================================

import { useState, useEffect, useCallback } from 'react';

export interface UseEconomicStateResult {
  state: EconomicState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook for accessing economic state.
 * Automatically fetches on mount and provides refresh function.
 */
export const useEconomicState = (): UseEconomicStateResult => {
  const [state, setState] = useState<EconomicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEconomicState();
      setState(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load economic state');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, loading, error, refresh };
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
  getEconomicState,
  checkFeatureAccess,
  checkLimit,
  checkCredits,
  hasIDEAccess,
  hasBlockchainAccess,
  getTierDisplayName,
  getTierColor,
  formatCredits,
  getUsagePercent,
  isUnlimited,
  useEconomicState,
};
