/**
 * Pricing Context - Provides pricing data from backend throughout the app
 * 
 * This replaces all hardcoded pricing values with live data from the backend.
 * Components should use usePricing() hook to access pricing data.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  PricingConfig,
  Plan,
  CreditPack,
  CreditCosts,
  CreditRate,
  fetchPricingConfig,
  clearPricingCache,
  formatCredits,
  formatPrice,
} from '../api/pricing';

interface PricingContextValue {
  // Data
  config: PricingConfig | null;
  plans: Record<string, Plan>;
  creditPacks: CreditPack[];
  creditCosts: CreditCosts | null;
  creditRate: CreditRate | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Helpers
  getPlan: (planId: string) => Plan | null;
  formatCredits: (credits: number | null | undefined) => string;
  formatPrice: (price: number | null | undefined) => string;
}

const PricingContext = createContext<PricingContextValue | null>(null);

export const PricingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPricingConfig();
      if (data) {
        setConfig(data);
      } else {
        setError('Failed to load pricing data');
      }
    } catch (err) {
      setError('Failed to load pricing data');
      console.error('Pricing load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    clearPricingCache();
    await loadPricing();
  }, [loadPricing]);

  const getPlan = useCallback((planId: string): Plan | null => {
    if (!config) return null;
    const mappedId = config.tier_mappings[planId.toLowerCase()] || planId.toLowerCase();
    return config.plans[mappedId] || null;
  }, [config]);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const value: PricingContextValue = {
    config,
    plans: config?.plans || {},
    creditPacks: config?.credit_packs || [],
    creditCosts: config?.credit_costs || null,
    creditRate: config?.credit_rate || null,
    loading,
    error,
    refresh,
    getPlan,
    formatCredits,
    formatPrice,
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = (): PricingContextValue => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};

export default PricingContext;
