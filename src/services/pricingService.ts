/**
 * Pricing Service - Centralized Pricing Management
 * 
 * This service provides a single source of truth for all pricing data.
 * It fetches from the backend API and caches locally.
 * Owner Dashboard can update pricing, which propagates to all components.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default pricing config (fallback if API unavailable)
const DEFAULT_PRICING = {
  creditRate: 0.001,
  plans: {
    developer: {
      id: 'developer',
      name: 'Developer',
      price: { monthly: 0, yearly: 0 },
      credits: { included: 1000, rollover: false, topups: false },
      limits: {
        agents: { active: 3, autonomousMode: false, teams: false },
        chat: { conversations: -1, messagesPerDay: -1, messagesPerConversation: -1 },
        compute: { hours: 10, aiAssistance: 'Basic' },
        storage: { mb: 100, ragDocuments: 5 },
        governance: { killSwitch: 'Manual', invariants: 5, snapshots: 0 }
      }
    },
    plus: {
      id: 'plus',
      name: 'Plus',
      price: { monthly: 49, yearly: 490 },
      credits: { included: 50000, rollover: true, rolloverLimit: 25000, topups: true, topupPrice: 8, topupAmount: 10000 },
      limits: {
        agents: { active: 20, autonomousMode: true, teams: true },
        chat: { conversations: -1, messagesPerDay: -1, messagesPerConversation: -1 },
        compute: { hours: 100, aiAssistance: 'Full' },
        storage: { mb: 5000, ragDocuments: 100 },
        governance: { killSwitch: 'Automated', invariants: 15, snapshots: 10 }
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 299, yearly: 2990 },
      credits: { included: -1, rollover: true, rolloverLimit: -1, topups: true, topupPrice: 5, topupAmount: 10000 },
      limits: {
        agents: { active: -1, autonomousMode: true, teams: 'Hierarchies' },
        chat: { conversations: -1, messagesPerDay: -1, messagesPerConversation: -1 },
        compute: { hours: -1, aiAssistance: 'Full + Custom' },
        storage: { mb: 100000, ragDocuments: -1 },
        governance: { killSwitch: 'SLA-backed', invariants: 'Custom', snapshots: -1 }
      }
    }
  },
  topup: { price: 8, amount: 10000 }
};

export interface PlanLimits {
  agents: { active: number; autonomousMode: boolean; teams: boolean | string };
  chat: { conversations: number; messagesPerDay: number; messagesPerConversation: number };
  compute: { hours: number; aiAssistance: string };
  storage: { mb: number; ragDocuments: number };
  governance: { killSwitch: string; invariants: number | string; snapshots: number };
}

export interface PlanConfig {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  credits: { 
    included: number; 
    rollover: boolean; 
    rolloverLimit?: number;
    topups: boolean; 
    topupPrice?: number; 
    topupAmount?: number;
  };
  limits: PlanLimits;
}

export interface PricingConfig {
  creditRate: number;
  plans: { [key: string]: PlanConfig };
  topup: { price: number; amount: number };
}

// In-memory cache
let cachedPricing: PricingConfig | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Event listeners for pricing updates
type PricingListener = (pricing: PricingConfig) => void;
const listeners: PricingListener[] = [];

export const pricingService = {
  /**
   * Subscribe to pricing updates
   */
  subscribe(listener: PricingListener): () => void {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  /**
   * Notify all listeners of pricing update
   */
  notifyListeners(pricing: PricingConfig): void {
    listeners.forEach(listener => listener(pricing));
  },

  /**
   * Get current pricing config (from cache or fetch)
   */
  async getPricing(forceRefresh = false): Promise<PricingConfig> {
    if (typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap') {
      cachedPricing = DEFAULT_PRICING;
      lastFetch = Date.now();
      return cachedPricing;
    }
    const now = Date.now();
    
    // Return cached if valid
    if (!forceRefresh && cachedPricing && (now - lastFetch) < CACHE_TTL) {
      return cachedPricing;
    }

    // Try to fetch from backend
    try {
      // SECURITY FIX: Tokens now in HttpOnly cookies - no localStorage needed
      const endpoints = [
        `/api/billing/pricing`,
        `${API_BASE}/api/billing/pricing`,
        `${API_BASE}/owner/auth/pricing`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            credentials: 'include',  // Send cookies automatically
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            const data = await res.json();
            // Transform backend format to our format if needed
            cachedPricing = this.transformBackendPricing(data);
            lastFetch = now;
            return cachedPricing;
          }
        } catch (err) {
          console.log(`Failed to fetch pricing from ${endpoint}:`, err);
        }
      }
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('platform_pricing_full');
    if (stored) {
      try {
        cachedPricing = JSON.parse(stored);
        lastFetch = now;
        return cachedPricing!;
      } catch (e) {
        console.error('Error parsing stored pricing:', e);
      }
    }

    // Final fallback to defaults
    cachedPricing = DEFAULT_PRICING;
    lastFetch = now;
    return cachedPricing;
  },

  /**
   * Transform backend pricing format to our format
   */
  transformBackendPricing(data: any): PricingConfig {
    // billing_service format (preferred)
    // { credit_rate: {value, ...}, plans: {developer:{...}, plus:{...}}, credit_packs:[...], credit_costs:{...} }
    if (data && typeof data === 'object' && data.plans && data.credit_rate) {
      const creditRate = Number(data.credit_rate?.value ?? data.credit_rate ?? 0.001);
      const plans: PricingConfig['plans'] = {};

      const toLimits = (limits: any): PlanLimits => {
        const storageMb = Number(limits?.storage_mb ?? limits?.storageMb ?? 100);
        const agents = Number(limits?.agents ?? limits?.agentsAllowed ?? 3);
        const computeHours = Number(limits?.compute_hours ?? limits?.computeHours ?? 10);

        return {
          agents: {
            active: Number.isFinite(agents) ? agents : 3,
            autonomousMode: Boolean(limits?.autonomous_mode ?? false),
            teams: Boolean(limits?.teams ?? false),
          },
          chat: {
            conversations: Number(limits?.conversations ?? -1),
            messagesPerDay: Number(limits?.messages_per_day ?? -1),
            messagesPerConversation: -1,
          },
          compute: {
            hours: Number.isFinite(computeHours) ? computeHours : 10,
            aiAssistance: 'Basic',
          },
          storage: {
            mb: Number.isFinite(storageMb) ? storageMb : 100,
            ragDocuments: 0,
          },
          governance: {
            killSwitch: 'Manual',
            invariants: 0,
            snapshots: 0,
          },
        };
      };

      for (const [planId, plan] of Object.entries<any>(data.plans || {})) {
        const monthly = Number(plan?.price?.monthly ?? 0);
        const yearly = Number(plan?.price?.yearly ?? 0);
        const includedCredits = Number(plan?.credits?.included ?? 0);
        plans[planId] = {
          id: String(plan?.id ?? planId),
          name: String(plan?.name ?? planId),
          price: { monthly, yearly },
          credits: {
            included: includedCredits,
            rollover: Boolean(plan?.credits?.rollover ?? false),
            rolloverLimit: plan?.credits?.rollover_limit ?? plan?.credits?.rolloverLimit,
            topups: Boolean(plan?.credits?.topups ?? false),
            topupPrice: plan?.credits?.topup_price ?? plan?.credits?.topupPrice,
            topupAmount: plan?.credits?.topup_amount ?? plan?.credits?.topupAmount,
          },
          limits: toLimits(plan?.limits),
        };
      }

      const topupPrice = Number(
        data?.plans?.plus?.credits?.topup_price ??
          data?.plans?.plus?.credits?.topupPrice ??
          data?.topup?.price ??
          DEFAULT_PRICING.topup.price
      );
      const topupAmount = Number(
        data?.plans?.plus?.credits?.topup_amount ??
          data?.plans?.plus?.credits?.topupAmount ??
          data?.topup?.amount ??
          DEFAULT_PRICING.topup.amount
      );

      return {
        creditRate,
        plans,
        topup: {
          price: Number.isFinite(topupPrice) ? topupPrice : DEFAULT_PRICING.topup.price,
          amount: Number.isFinite(topupAmount) ? topupAmount : DEFAULT_PRICING.topup.amount,
        },
      };
    }

    // If data already has our structure with plans object, return it
    if (data.plans && typeof data.plans === 'object') {
      return data as PricingConfig;
    }

    // Handle new full pricing format from backend (with developer, plus, enterprise keys)
    if (data.developer && data.plus && data.enterprise) {
      const transformLimits = (limits: any): PlanLimits => ({
        agents: { 
          active: limits?.agentsAllowed ?? 3, 
          autonomousMode: (limits?.agentsAllowed ?? 0) > 3, 
          teams: (limits?.agentsAllowed ?? 0) > 10 
        },
        chat: { 
          conversations: limits?.conversations ?? 10, 
          messagesPerDay: limits?.messagesPerDay ?? 100, 
          messagesPerConversation: limits?.messagesPerConversation ?? 50 
        },
        compute: { 
          hours: limits?.computeHours ?? 10, 
          aiAssistance: (limits?.computeHours ?? 0) > 50 ? 'Full' : 'Basic' 
        },
        storage: { 
          mb: limits?.storageMb ?? 100, 
          ragDocuments: Math.floor((limits?.storageMb ?? 100) / 20) 
        },
        governance: { 
          killSwitch: (limits?.agentsAllowed ?? 0) === -1 ? 'SLA-backed' : 'Manual', 
          invariants: 5, 
          snapshots: 0 
        }
      });

      return {
        creditRate: data.creditRate || 0.001,
        plans: {
          developer: {
            id: 'developer',
            name: 'Developer',
            price: { monthly: data.developer.price || 0, yearly: (data.developer.price || 0) * 10 },
            credits: { 
              included: data.developer.credits || 1000, 
              rollover: false, 
              topups: false 
            },
            limits: transformLimits(data.developer.limits)
          },
          plus: {
            id: 'plus',
            name: 'Plus',
            price: { monthly: data.plus.price || 49, yearly: (data.plus.price || 49) * 10 },
            credits: { 
              included: data.plus.credits || 50000, 
              rollover: true, 
              rolloverLimit: 25000,
              topups: true,
              topupPrice: data.topupPrice || 8,
              topupAmount: data.topupAmount || 10000
            },
            limits: transformLimits(data.plus.limits)
          },
          enterprise: {
            id: 'enterprise',
            name: 'Enterprise',
            price: { monthly: data.enterprise.price || 299, yearly: (data.enterprise.price || 299) * 10 },
            credits: { 
              included: data.enterprise.credits || 500000, 
              rollover: true, 
              rolloverLimit: -1,
              topups: true,
              topupPrice: 5,
              topupAmount: 10000
            },
            limits: transformLimits(data.enterprise.limits)
          }
        },
        topup: {
          price: data.topupPrice || 8,
          amount: data.topupAmount || 10000
        }
      };
    }

    // Transform from old simple backend format (legacy support)
    return {
      creditRate: data.creditRate || 0.001,
      plans: {
        developer: {
          ...DEFAULT_PRICING.plans.developer,
          credits: {
            ...DEFAULT_PRICING.plans.developer.credits,
            included: data.developerCredits || 1000,
          }
        },
        plus: {
          ...DEFAULT_PRICING.plans.plus,
          price: { 
            monthly: data.plusPrice || 49, 
            yearly: (data.plusPrice || 49) * 10 
          },
          credits: {
            ...DEFAULT_PRICING.plans.plus.credits,
            included: data.plusCredits || 50000,
            topupPrice: data.topupPrice || 8,
            topupAmount: data.topupAmount || 10000,
          }
        },
        enterprise: {
          ...DEFAULT_PRICING.plans.enterprise,
          price: { 
            monthly: data.enterprisePrice || 299, 
            yearly: (data.enterprisePrice || 299) * 10 
          }
        }
      },
      topup: {
        price: data.topupPrice || 8,
        amount: data.topupAmount || 10000
      }
    };
  },

  /**
   * Save pricing config to backend
   */
  async savePricing(pricing: PricingConfig): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('owner_token') || localStorage.getItem('token');
    
    // Transform to new full backend format
    const backendFormat = {
      creditRate: pricing.creditRate,
      topupPrice: pricing.topup.price,
      topupAmount: pricing.topup.amount,
      minTopupAmount: 5,
      developer: {
        credits: pricing.plans.developer.credits.included,
        price: pricing.plans.developer.price.monthly,
        limits: {
          conversations: pricing.plans.developer.limits.chat.conversations,
          messagesPerDay: pricing.plans.developer.limits.chat.messagesPerDay,
          messagesPerConversation: pricing.plans.developer.limits.chat.messagesPerConversation,
          storageMb: pricing.plans.developer.limits.storage.mb,
          maxMemoryItems: 1000,
          apiRatePerMin: 30,
          fileUploadMb: 5,
          agentsAllowed: pricing.plans.developer.limits.agents.active,
          computeHours: pricing.plans.developer.limits.compute.hours,
        }
      },
      plus: {
        credits: pricing.plans.plus.credits.included,
        price: pricing.plans.plus.price.monthly,
        limits: {
          conversations: pricing.plans.plus.limits.chat.conversations,
          messagesPerDay: pricing.plans.plus.limits.chat.messagesPerDay,
          messagesPerConversation: pricing.plans.plus.limits.chat.messagesPerConversation,
          storageMb: pricing.plans.plus.limits.storage.mb,
          maxMemoryItems: 100000,
          apiRatePerMin: 300,
          fileUploadMb: 100,
          agentsAllowed: pricing.plans.plus.limits.agents.active,
          computeHours: pricing.plans.plus.limits.compute.hours,
        }
      },
      enterprise: {
        credits: pricing.plans.enterprise.credits.included,
        price: pricing.plans.enterprise.price.monthly,
        limits: {
          conversations: pricing.plans.enterprise.limits.chat.conversations,
          messagesPerDay: pricing.plans.enterprise.limits.chat.messagesPerDay,
          messagesPerConversation: pricing.plans.enterprise.limits.chat.messagesPerConversation,
          storageMb: pricing.plans.enterprise.limits.storage.mb,
          maxMemoryItems: -1,
          apiRatePerMin: -1,
          fileUploadMb: 1000,
          agentsAllowed: pricing.plans.enterprise.limits.agents.active,
          computeHours: pricing.plans.enterprise.limits.compute.hours,
        }
      }
    };

    const endpoints = [
      `${API_BASE}/owner/auth/pricing`,
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(backendFormat)
        });
        if (res.ok) {
          // Update cache
          cachedPricing = pricing;
          lastFetch = Date.now();
          
          // Save full config to localStorage as backup
          localStorage.setItem('platform_pricing_full', JSON.stringify(pricing));
          
          // Notify listeners
          this.notifyListeners(pricing);
          
          return { success: true, message: 'Pricing saved to backend successfully!' };
        }
      } catch (err) {
        console.log(`Failed to save to ${endpoint}:`, err);
      }
    }

    // Fallback: save to localStorage only
    localStorage.setItem('platform_pricing_full', JSON.stringify(pricing));
    cachedPricing = pricing;
    lastFetch = Date.now();
    this.notifyListeners(pricing);
    
    return { 
      success: true, 
      message: 'Pricing saved locally. Backend not available - changes will apply when services restart.' 
    };
  },

  /**
   * Get plan limits for a specific plan
   */
  async getPlanLimits(planId: string): Promise<PlanLimits> {
    const pricing = await this.getPricing();
    const plan = pricing.plans[planId];
    if (!plan) {
      return DEFAULT_PRICING.plans.developer.limits;
    }
    return plan.limits;
  },

  /**
   * Get plan by ID
   */
  async getPlan(planId: string): Promise<PlanConfig | null> {
    const pricing = await this.getPricing();
    return pricing.plans[planId] || null;
  },

  /**
   * Update a specific plan's limits
   */
  async updatePlanLimits(planId: string, limits: Partial<PlanLimits>): Promise<void> {
    const pricing = await this.getPricing();
    if (pricing.plans[planId]) {
      pricing.plans[planId].limits = {
        ...pricing.plans[planId].limits,
        ...limits
      };
      await this.savePricing(pricing);
    }
  },

  /**
   * Format number for display (-1 = Unlimited)
   */
  formatLimit(value: number | string): string {
    if (value === -1 || value === 'Unlimited' || value === 'Custom') return 'Unlimited';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  },

  /**
   * Clear cache (force refresh on next get)
   */
  clearCache(): void {
    cachedPricing = null;
    lastFetch = 0;
  }
};

export default pricingService;
