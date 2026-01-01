/**
 * Pricing API - Fetches pricing data from backend
 * 
 * This is the SINGLE SOURCE OF TRUTH for all pricing data.
 * All components should use this API instead of hardcoded values.
 */

import fastapiClient from './fastapiClient';

// Types matching backend pricing.yaml structure
export interface CreditRate {
  value: number;
  currency: string;
  description: string;
  mental_math?: string;
}

export interface PlanCredits {
  included: number;
  rollover: boolean;
  rollover_limit?: number;
  topups: boolean;
  topup_price?: number;
  topup_amount?: number;
}

export interface PlanPrice {
  monthly: number;
  yearly: number;
}

export interface PlanLimits {
  agents: number;
  autonomous_mode: boolean;
  conversations: number;
  messages_per_day: number;
  compute_hours: number;
  storage_mb: number;
}

export interface Plan {
  id: string;
  name: string;
  stripe_price_id: string | null;
  price: PlanPrice;
  credits: PlanCredits;
  credit_rate: number;
  limits: PlanLimits;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  price_per_1k: number;
  savings_percent?: number;
  stripe_price_id: string;
  recommended?: boolean;
}

export interface ChatCosts {
  prompt_token_cost: number;
  completion_token_cost: number;
  base_cost: number;
  streaming_overhead: number;
  message_avg: number;
  providers: Record<string, number>;
}

export interface AgentCosts {
  session_start: number;
  step: number;
  tool_invocation: number;
  web_call: number;
  memory_write: number;
  goal_completion: number;
  team_run: number;
  pipeline: number;
  types: Record<string, number>;
}

export interface CreditCosts {
  chat: ChatCosts;
  agents: AgentCosts;
  compute: Record<string, number>;
  workflows: Record<string, number>;
  storage: Record<string, number>;
  blockchain: Record<string, number>;
  hash_sphere: Record<string, number>;
  code_visualizer: Record<string, number>;
  api: Record<string, number>;
}

export interface PricingConfig {
  credit_rate: CreditRate;
  plans: Record<string, Plan>;
  credit_packs: CreditPack[];
  credit_costs: CreditCosts;
  tier_mappings: Record<string, string>;
}

// Cache for pricing data
let pricingCache: PricingConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch complete pricing configuration from backend
 */
export async function fetchPricingConfig(): Promise<PricingConfig | null> {
  // Return cached data if still valid
  if (pricingCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return pricingCache;
  }

  try {
    const response = await fastapiClient.get('/billing/pricing');
    pricingCache = response.data;
    cacheTimestamp = Date.now();
    return pricingCache;
  } catch (error) {
    console.error('Failed to fetch pricing config:', error);
    return null;
  }
}

/**
 * Get all plans
 */
export async function fetchPlans(): Promise<Record<string, Plan> | null> {
  const config = await fetchPricingConfig();
  return config?.plans || null;
}

/**
 * Get a specific plan by ID
 */
export async function fetchPlan(planId: string): Promise<Plan | null> {
  const config = await fetchPricingConfig();
  if (!config) return null;
  
  // Check tier mappings
  const mappedId = config.tier_mappings[planId.toLowerCase()] || planId.toLowerCase();
  return config.plans[mappedId] || null;
}

/**
 * Get credit packs
 */
export async function fetchCreditPacks(): Promise<CreditPack[]> {
  const config = await fetchPricingConfig();
  return config?.credit_packs || [];
}

/**
 * Get credit costs
 */
export async function fetchCreditCosts(): Promise<CreditCosts | null> {
  const config = await fetchPricingConfig();
  return config?.credit_costs || null;
}

/**
 * Get credit rate
 */
export async function fetchCreditRate(): Promise<CreditRate | null> {
  const config = await fetchPricingConfig();
  return config?.credit_rate || null;
}

/**
 * Clear the pricing cache (useful after plan changes)
 */
export function clearPricingCache(): void {
  pricingCache = null;
  cacheTimestamp = 0;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number | null | undefined): string {
  if (credits === null || credits === undefined) return '—';
  if (credits < 0) return 'Unlimited';
  if (credits >= 1000000) return `${(credits / 1000000).toFixed(1)}M`;
  if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
  return credits.toLocaleString();
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '—';
  if (price === 0) return 'Free';
  return `$${price}`;
}

/**
 * Calculate credit cost for tokens
 */
export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  provider: string = 'openai',
  costs?: ChatCosts
): number {
  if (!costs) return 0;
  
  const multiplier = costs.providers[provider.toLowerCase()] || 1.0;
  const inputCost = (inputTokens / 1000) * 10 * multiplier; // 10 credits per 1K input
  const outputCost = (outputTokens / 1000) * 30 * multiplier; // 30 credits per 1K output
  
  return Math.max(1, Math.round(inputCost + outputCost));
}
