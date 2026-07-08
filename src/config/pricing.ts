/**
 * Pricing Configuration Loader
 * Loads pricing data from pricing.yaml (source of truth)
 */

// Since we can't directly import YAML in the browser without a loader,
// we export the pricing data as TypeScript constants that mirror the YAML structure.
// This file should be kept in sync with pricing.yaml

export interface CreditRate {
  value: number;
  currency: string;
  description: string;
}

export interface PlanPrice {
  monthly: number;
  yearly: number;
  display: string;
  period: string;
}

export interface PlanCredits {
  included: number;
  display: string;
  rollover: boolean;
  rolloverLimit?: number;
  topups: boolean;
  topupPrice?: number;
  topupAmount?: number;
  note: string;
}

export interface PlanLimits {
  agents: {
    active: number | string;
    autonomousMode: boolean;
    teams: boolean | string;
  };
  userTeams?: {
    enabled: boolean;
  };
  chat: {
    conversations: number;
    messagesPerDay: number;
    evidenceGraph?: boolean;
    customModels?: boolean;
  };
  hashSphereMemory: {
    standaloneService: boolean;
    universeAccess: boolean | string;
    multiLayer: boolean;
  };
  ideCompute: {
    computeHours: number | string;
    previewTime: string;
    aiAssistance: string;
    customRuntimes?: boolean;
  };
  governance: {
    killSwitch: string;
    invariants: number | string;
    snapshots: number | boolean;
  };
  codeVisualizer: {
    codebaseGraphs: boolean;
    dependencyAnalysis: boolean;
    ciIntegration: boolean;
  };
}

export interface PlanCta {
  text: string;
  style: 'primary' | 'secondary';
}

export interface Plan {
  id: string;
  name: string;
  badge: string;
  price: PlanPrice;
  description: string;
  credits: PlanCredits;
  recommended: boolean;
  contactSales: boolean;
  cta: PlanCta;
  limits: PlanLimits;
  features: string[];
}

export interface HashSphereFeature {
  capability: string;
  developer: boolean;
  plus: boolean;
  enterprise: boolean;
}

export interface CoreFeature {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingConfig {
  creditRate: CreditRate;
  plans: Plan[];
  hashSphereFeatures: HashSphereFeature[];
  coreFeatures: CoreFeature[];
  faq: FaqItem[];
}

// ============================================================
// PRICING DATA - Source of Truth
// Keep in sync with pricing.yaml
// ============================================================

export const CREDIT_RATE: CreditRate = {
  value: 0.001,
  currency: 'USD',
  description: '1 credit ≈ $0.001',
};

export const HASH_SPHERE_FEATURES: HashSphereFeature[] = [
  { capability: 'View own identity node', developer: true, plus: true, enterprise: true },
  { capability: 'View full identity graph', developer: true, plus: true, enterprise: true },
  { capability: 'Trust relationship visualization', developer: true, plus: true, enterprise: true },
  { capability: 'Economic flow tracking', developer: true, plus: true, enterprise: true },
  { capability: 'System entropy metrics', developer: true, plus: true, enterprise: true },
  { capability: 'Invariant checks', developer: true, plus: true, enterprise: true },
  { capability: 'Perturbation simulation', developer: true, plus: true, enterprise: true },
  { capability: 'API Access', developer: true, plus: true, enterprise: true },
];

export const CORE_FEATURES: CoreFeature[] = [
  {
    id: 'hash_sphere',
    name: 'Hash Sphere',
    badge: 'Identity & Economic Graph',
    description: 'Unified identity layer with trust relationships, economic flow tracking, and system entropy metrics.',
    icon: 'globe',
  },
  {
    id: 'resonant_chat',
    name: 'Resonant Chat',
    badge: 'Governed Agent Actions',
    description: 'Persistent AI conversations with evidence graphs. Every action evaluated, logged, and auditable.',
    icon: 'brain',
  },
  {
    id: 'agent_console',
    name: 'Agent Console',
    badge: 'Multi-Agent Orchestration',
    description: 'Autonomous agents with goal-driven execution, swarm capabilities, and agent voting systems.',
    icon: 'users',
  },
  {
    id: 'ide_compute',
    name: 'IDE & Compute',
    badge: 'Governed Execution',
    description: 'Browser-based development with secure sandboxes, live previews, and AI pair-programming.',
    icon: 'code',
  },
  {
    id: 'workflows',
    name: 'Workflows',
    badge: 'Visual Orchestration',
    description: 'Visual workflow automation with scheduling, error handling, and SLA-backed execution.',
    icon: 'git_branch',
  },
  {
    id: 'rara_governance',
    name: 'RARA Governance',
    badge: 'AI Safety & Control',
    description: 'Kill switch, invariant enforcement, snapshot & rollback, and policy-based permissions.',
    icon: 'shield',
  },
  {
    id: 'audit_trail',
    name: 'Immutable Audit Trail',
    badge: 'Immutable Logs',
    description: 'Cryptographically signed, tamper-evident audit entries with verification, compliance reports, and legal-grade proof.',
    icon: 'lock',
  },
];

// ============================================================
// HASH SPHERE MEMORY API PRICING
// Resonant Memory API — physics-informed hash-sphere memory, pay-per-call
// ============================================================

export interface HashSphereMemoryAPIPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  memoryUnits: number;
  overageRate: number;
  features: string[];
  limits: {
    realtimeEnforcement: boolean;
    customInvariants: boolean;
    replayDays: number;
    dedicated: boolean;
  };
}

export const HASH_SPHERE_MEMORY_API_PLANS: HashSphereMemoryAPIPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    period: 'month',
    memoryUnits: 100000,  // 100k MU/month
    overageRate: 0,       // No overage on starter
    features: [
      '100,000 Memory Units/month',
      '12-D hash-sphere retrieval (gravity ranking)',
      'Cross-encoder reranking + fact extraction',
      'Encrypted storage (AES-256-GCM)',
      'Hash-chained immutable anchoring',
      'Isolated per user / agent / org',
      'Shared infrastructure',
    ],
    limits: {
      realtimeEnforcement: false,
      customInvariants: false,
      replayDays: 0,
      dedicated: false,
    },
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 299,
    period: 'month',
    memoryUnits: 2000000,  // 2M MU/month
    overageRate: 0.05,     // $0.05 per 1k MU overage
    features: [
      '2,000,000 Memory Units/month',
      'Multi-hop knowledge graph + temporal reasoning',
      'Associative mesh (self-organizing recall)',
      'Confidence gate (zero-LLM recall)',
      'API keys per project',
      '$0.05 per 1k MU overage',
    ],
    limits: {
      realtimeEnforcement: true,
      customInvariants: false,
      replayDays: 30,
      dedicated: false,
    },
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 1200,
    period: 'month',
    memoryUnits: 10000000,  // 10M MU/month
    overageRate: 0.03,      // $0.03 per 1k MU overage
    features: [
      '10,000,000 Memory Units/month',
      'Full evidence ledger + hash-chained provenance',
      'Cryptographic recall audit trail',
      'Priority execution',
      'Dedicated recall tuning',
    ],
    limits: {
      realtimeEnforcement: true,
      customInvariants: true,
      replayDays: 90,
      dedicated: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25000,  // Starting annual price
    period: 'year',
    memoryUnits: -1,  // Unlimited (contract-bounded)
    overageRate: 0,   // Negotiated
    features: [
      'Unlimited Memory Units (contract-bounded)',
      'Dedicated memory brain',
      'On-prem / VPC / air-gapped options',
      'SLA + incident guarantees',
      'Sovereign, hash-chained memory blocks',
      'Compliance & audit exports',
    ],
    limits: {
      realtimeEnforcement: true,
      customInvariants: true,
      replayDays: -1,  // Unlimited
      dedicated: true,
    },
  },
];

// Hash Sphere Memory Enterprise Licensing (Annual)
export const HASH_SPHERE_MEMORY_ENTERPRISE_LICENSING = [
  { customer: 'AI Agent Platform', priceMin: 25000, priceMax: 75000 },
  { customer: 'Autonomous Workflow System', priceMin: 50000, priceMax: 150000 },
  { customer: 'Compliance / Regulated Industry', priceMin: 75000, priceMax: 250000 },
];

// Memory Unit Definition
export const MEMORY_UNIT_DEFINITION = {
  description: '1 Memory Unit = one memory write or evolution step × invariant evaluation × clustering update',
  note: 'Aligns billing to semantic impact, not raw compute.',
};

// ============================================================
// CODE VISUALIZER API PRICING
// AST analysis, code graph exploration, and visualization
// ============================================================

export interface CodeVisualizerAPIPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  analysisUnits: number;
  features: string[];
}

export const CODE_VISUALIZER_API_PLANS: CodeVisualizerAPIPlan[] = [
  {
    id: 'dev',
    name: 'Dev / Indie',
    price: 49,
    period: 'month',
    analysisUnits: 100000,  // 100k AU/month
    features: [
      '100k Analysis Units/month',
      'AST parsing & visualization',
      'Dependency graph generation',
      'Up to 50 repos',
      'Community support',
    ],
  },
  {
    id: 'startup',
    name: 'Startup',
    price: 299,
    period: 'month',
    analysisUnits: 2000000,  // 2M AU/month
    features: [
      '2M Analysis Units/month',
      'Real-time code graph updates',
      'Cross-repo dependency analysis',
      'Unlimited repos',
      'Priority support + webhooks',
      '99.9% uptime SLA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2000,
    period: 'month',
    analysisUnits: -1,  // Custom
    features: [
      'Custom AU allocation',
      'On-prem / VPC deployment',
      'Custom language support',
      'Dedicated support + SLA',
      'Audit trail & compliance',
    ],
  },
];

export const FAQ: FaqItem[] = [
  {
    question: 'What happens when I run out of credits?',
    answer: "Your agents pause until the next billing cycle or you purchase additional credits. You'll receive alerts before reaching your limit.",
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! Upgrade instantly and get prorated access. Downgrade takes effect at the end of your billing cycle.',
  },
  {
    question: "What's included in credit usage?",
    answer: 'Credits cover AI model calls, compute time, storage, and agent execution. You get real-time cost estimation before each action.',
  },
  {
    question: 'Do you offer volume discounts?',
    answer: 'Enterprise plans include 20% volume discounts at 1M+ credits. Contact sales for custom pricing on larger deployments.',
  },
  {
    question: 'Is there a self-hosted option?',
    answer: 'Enterprise plans support cloud, hybrid, or fully self-hosted deployments with data locality control and custom SSO.',
  },
  {
    question: 'What support is included?',
    answer: 'Plus ($29/mo): Community + email. Business: Priority email + Slack. Enterprise: Dedicated engineers, architecture guidance, and SLA guarantees.',
  },
];

export const formatCredits = (credits: number): string => {
  if (credits === -1) return 'Custom';
  return credits.toLocaleString();
};

export const isUnlimited = (value: number | string): boolean => {
  return value === -1 || value === 'Unlimited' || value === 'Custom';
};
