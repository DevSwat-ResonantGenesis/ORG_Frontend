/**
 * Pricing Configuration - Single Source of Truth
 * 
 * This file provides pricing data and helper functions.
 * All UI components should import prices from here, not hardcode them.
 * 
 * When you update pricing.yaml, update this file to match, then rebuild.
 */

// Credit Exchange Rates - from pricing.yaml
export const CREDIT_EXCHANGE = {
  llm: {
    inputTokens1k: 10,
    outputTokens1k: 30,
    chatMessage: 20,
    agentReasoningStep: 50,
  },
  agents: {
    sessionStart: 100,
    step: 50,
    goalCompletion: 200,
    teamRun: 500,
    pipeline: 300,
  },
  compute: {
    perSecond: 1,
    perMinute: 60,
    codeExecutionBase: 5,
    previewHour: 300,
  },
  workflows: {
    runBase: 50,
    step: 20,
    scheduledTrigger: 10,
    webhookTrigger: 5,
  },
  storage: {
    perMb: 1,
    perGb: 1000,
    memoryWrite: 2,
    memoryRead: 0,
    ragUpload: 10,
  },
  blockchain: {
    auditEntry: 100,
    verification: 10,
    complianceReport: 500,
    smartContractDeploy: 1000,
  },
  hashSphere: {
    identityAdd: 50,
    transactionRecord: 20,
    trustRelationship: 10,
    perturbationSimulation: 100,
  },
  codeVisualizer: {
    codebaseAnalysis: 200,
    governanceCheck: 50,
    graphExport: 20,
  },
};

// Credit Packs - from pricing.yaml
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerK: number;
  savings?: string;
  description: string;
  recommended: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 5000,
    price: 5,
    pricePerK: 1.00,
    description: 'Quick top-up for light usage',
    recommended: false,
  },
  {
    id: 'basic',
    name: 'Basic Pack',
    credits: 10000,
    price: 8,
    pricePerK: 0.80,
    savings: '20%',
    description: 'Great for regular usage',
    recommended: false,
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    credits: 50000,
    price: 35,
    pricePerK: 0.70,
    savings: '30%',
    description: 'Best value for power users',
    recommended: true,
  },
  {
    id: 'scale',
    name: 'Scale Pack',
    credits: 100000,
    price: 60,
    pricePerK: 0.60,
    savings: '40%',
    description: 'Maximum savings for heavy usage',
    recommended: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 500000,
    price: 250,
    pricePerK: 0.50,
    savings: '50%',
    description: 'For teams and high-volume usage',
    recommended: false,
  },
];

// Re-export PLANS from pricing.ts (the main source)
export { PLANS, CREDIT_RATE, HASH_SPHERE_FEATURES, CORE_FEATURES, FAQ } from './pricing';
export type { Plan, PlanPrice, PlanCredits, CoreFeature, HashSphereFeature, FaqItem } from './pricing';

// Simplified PlanLimits interface for Dashboard use
export interface SimplePlanLimits {
  agents: number;
  autonomousMode: boolean;
  teams: boolean;
  conversations: number;
  messagesPerDay: number;
  computeHours: number;
  storageMb: number;
  ragDocuments: number;
}

// Import Plan type from pricing.ts
import { PLANS as PRICING_PLANS, type Plan } from './pricing';

// Helper functions
export const getPlanById = (id: string): Plan | undefined => {
  return PRICING_PLANS.find(p => p.id === id);
};

export const getSimplePlanLimits = (planId: string): SimplePlanLimits => {
  const plan = getPlanById(planId);
  if (!plan) {
    return {
      agents: -1,
      autonomousMode: true,
      teams: true,
      conversations: -1,
      messagesPerDay: -1,
      computeHours: 100,
      storageMb: 5000,
      ragDocuments: 100,
    };
  }
  
  const limits = plan.limits;
  return {
    agents: typeof limits.agents.active === 'number' ? limits.agents.active : -1,
    autonomousMode: limits.agents.autonomousMode,
    teams: typeof limits.agents.teams === 'boolean' ? limits.agents.teams : true,
    conversations: limits.chat.conversations,
    messagesPerDay: limits.chat.messagesPerDay,
    computeHours: typeof limits.ideCompute.computeHours === 'number' ? limits.ideCompute.computeHours : -1,
    storageMb: planId === 'enterprise' ? -1 : 5000,
    ragDocuments: planId === 'enterprise' ? -1 : 100,
  };
};

export const getPlanCredits = (planId: string): number => {
  const plan = getPlanById(planId);
  if (!plan) return 15000; // Default to developer tier (15K credits)
  return plan.credits.included;
};

export const getCreditPackById = (id: string): CreditPack | undefined => {
  return CREDIT_PACKS.find(p => p.id === id);
};

export const formatCredits = (credits: number): string => {
  if (credits < 0) return 'Unlimited';
  if (credits >= 1000000) return `${(credits / 1000000).toFixed(1)}M`;
  if (credits >= 1000) return `${(credits / 1000).toFixed(0)}K`;
  return credits.toLocaleString();
};

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Custom';
  return `$${price}`;
};

// Export everything as default for convenience
export default {
  CREDIT_EXCHANGE,
  CREDIT_PACKS,
  getPlanById,
  getSimplePlanLimits,
  getPlanCredits,
  getCreditPackById,
  formatCredits,
  formatPrice,
};
