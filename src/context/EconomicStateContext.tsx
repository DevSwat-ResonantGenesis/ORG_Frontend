/**
 * Economic State Context
 * 
 * Provides global access to the user's economic state throughout the app.
 * This is the SINGLE SOURCE OF TRUTH for subscription, credits, and features.
 * 
 * Usage:
 *   const { state, loading, canAccessFeature, hasCredits } = useEconomicState();
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getEconomicState, 
  type EconomicState, 
  type SubscriptionTier,
  type Features,
  getTierDisplayName,
  getTierColor,
  formatCredits,
  isUnlimited,
} from '../api/economicState';
import { isAuthenticated } from '../utils/auth-cookies';

// ============================================
// CONTEXT TYPES
// ============================================

interface EconomicStateContextValue {
  // State
  state: EconomicState | null;
  loading: boolean;
  error: string | null;
  
  // Derived values
  tier: SubscriptionTier;
  tierDisplayName: string;
  tierColor: string;
  creditBalance: number;
  creditBalanceFormatted: string;
  isDevOverride: boolean;
  
  // Feature checks
  canAccessFeature: (feature: keyof Features) => boolean;
  canAccessIDE: boolean;
  canAccessBlockchain: boolean;
  canAccessCodeExecution: boolean;
  
  // Limit checks
  getLimit: (limitName: string) => number;
  isLimitUnlimited: (limitName: string) => boolean;
  
  // Actions
  refresh: () => Promise<void>;
}

const defaultContext: EconomicStateContextValue = {
  state: null,
  loading: true,
  error: null,
  tier: 'free',
  tierDisplayName: 'Free',
  tierColor: '#6B7280',
  creditBalance: 0,
  creditBalanceFormatted: '0',
  isDevOverride: false,
  canAccessFeature: () => false,
  canAccessIDE: false,
  canAccessBlockchain: false,
  canAccessCodeExecution: false,
  getLimit: () => 0,
  isLimitUnlimited: () => false,
  refresh: async () => {},
};

// ============================================
// CONTEXT
// ============================================

const EconomicStateContext = createContext<EconomicStateContextValue>(defaultContext);

// ============================================
// PROVIDER
// ============================================

interface EconomicStateProviderProps {
  children: ReactNode;
}

export const EconomicStateProvider: React.FC<EconomicStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<EconomicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await getEconomicState();
      setState(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load economic state');
      console.error('Failed to load economic state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Derived values
  const tier = state?.subscription_tier || 'free';
  const tierDisplayName = getTierDisplayName(tier);
  const tierColor = getTierColor(tier);
  const creditBalance = state?.credit_balance || 0;
  const creditBalanceFormatted = formatCredits(creditBalance);
  const isDevOverride = state?.is_dev_override || false;

  // Feature checks
  const canAccessFeature = useCallback((feature: keyof Features): boolean => {
    if (!state) return false;
    if (state.is_dev_override) return true;
    return state.features[feature] || false;
  }, [state]);

  const canAccessIDE = canAccessFeature('ide_access');
  const canAccessBlockchain = canAccessFeature('blockchain_access');
  const canAccessCodeExecution = canAccessFeature('code_execution');

  // Limit checks
  const getLimit = useCallback((limitName: string): number => {
    if (!state) return 0;
    return state.hard_limits[limitName as keyof typeof state.hard_limits] || 0;
  }, [state]);

  const isLimitUnlimited = useCallback((limitName: string): boolean => {
    const limit = getLimit(limitName);
    return isUnlimited(limit);
  }, [getLimit]);

  const value: EconomicStateContextValue = {
    state,
    loading,
    error,
    tier,
    tierDisplayName,
    tierColor,
    creditBalance,
    creditBalanceFormatted,
    isDevOverride,
    canAccessFeature,
    canAccessIDE,
    canAccessBlockchain,
    canAccessCodeExecution,
    getLimit,
    isLimitUnlimited,
    refresh,
  };

  return (
    <EconomicStateContext.Provider value={value}>
      {children}
    </EconomicStateContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useEconomicState = (): EconomicStateContextValue => {
  const context = useContext(EconomicStateContext);
  if (!context) {
    throw new Error('useEconomicState must be used within an EconomicStateProvider');
  }
  return context;
};

// ============================================
// EXPORTS
// ============================================

export { EconomicStateContext };
export type { EconomicStateContextValue };
