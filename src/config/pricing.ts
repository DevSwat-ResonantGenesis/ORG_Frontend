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

export const PLANS: Plan[] = [
  // Developer - $15/month
  {
    id: 'developer',
    name: 'Developer',
    badge: '$15/month',
    price: {
      monthly: 15,
      yearly: 150,
      display: '$15',
      period: '/month',
    },
    description: 'Full platform access for solo builders. All features unlocked — same as Plus, with 15K credits to start.',
    credits: {
      included: 15000,
      display: '15,000 / month',
      rollover: false,
      topups: true,
      note: 'No rollover • Top-ups available',
    },
    recommended: false,
    contactSales: false,
    cta: {
      text: 'Start Developer Plan',
      style: 'secondary',
    },
    limits: {
      agents: {
        active: -1,
        autonomousMode: true,
        teams: true,
      },
      chat: {
        conversations: -1,
        messagesPerDay: -1,
        evidenceGraph: true,
      },
      hashSphereMemory: {
        standaloneService: true,
        universeAccess: '1 Universe',
        multiLayer: false,
      },
      ideCompute: {
        computeHours: 100,
        previewTime: 'Unlimited',
        aiAssistance: 'Full',
      },
      governance: {
        killSwitch: 'Automated',
        invariants: 15,
        snapshots: 10,
      },
      codeVisualizer: {
        codebaseGraphs: true,
        dependencyAnalysis: true,
        ciIntegration: false,
      },
    },
    features: [
      '15,000 credits/month',
      'All platform features unlocked',
      'Unlimited agents (credits-only billing)',
      'Autonomous mode & agent teams',
      'Evidence graph access',
      'Hash Sphere Memory: 1 Universe',
      'Code Visualizer: graphs + dependency analysis',
      'Full AI assistance',
      'Automated kill switch, 15 invariants, 10 snapshots',
      '100 compute hours/month',
      '5 GB storage, 100 RAG documents',
      'Top-ups available',
    ],
  },

  // Plus - $499/month (RECOMMENDED)
  {
    id: 'plus',
    name: 'Plus',
    badge: 'Professional',
    price: {
      monthly: 499,
      yearly: 4990,
      display: '$499',
      period: '/month',
    },
    description: 'For power users and heavy workloads. Same features as Developer — more credits with rollover.',
    credits: {
      included: 499000,
      display: '499,000 / month',
      rollover: true,
      rolloverLimit: 249500,
      topups: true,
      topupPrice: 8,
      topupAmount: 10000,
      note: 'Rollover up to 249.5K • Top-ups: $8/10K',
    },
    recommended: true,
    contactSales: false,
    cta: {
      text: 'Start Plus Plan',
      style: 'primary',
    },
    limits: {
      agents: {
        active: -1,  // Unlimited - credits-only billing
        autonomousMode: true,
        teams: true,  // Agent teams enabled (agents working together)
      },
      userTeams: {
        enabled: false,  // No user teams (single user only)
      },
      chat: {
        conversations: -1,
        messagesPerDay: -1,
        evidenceGraph: true,
      },
      hashSphereMemory: {
        standaloneService: true,
        universeAccess: '1 Universe',
        multiLayer: false,
      },
      ideCompute: {
        computeHours: 100,
        previewTime: 'Unlimited',
        aiAssistance: 'Full',
      },
      governance: {
        killSwitch: 'Automated',
        invariants: 15,
        snapshots: 10,
      },
      codeVisualizer: {
        codebaseGraphs: true,
        dependencyAnalysis: true,
        ciIntegration: false,
      },
    },
    features: [
      '499,000 credits/month',
      'Rollover up to 249.5K credits',
      'Top-ups: $8/10K credits',
      'Unlimited agents (credits-only)',
      'Unlimited agent teams (agents working together)',
      'Individual account (no user teams)',
      'Unlimited conversations (limited by credits only)',
      'Evidence graph access',
      '5 GB storage, 100 RAG documents',
      '100 compute hours/month, unlimited preview',
      'Full AI assistance',
      'Automated kill switch, 15 invariants, 10 snapshots',
      'Hash Sphere Memory: 1 Universe',
      'Code Visualizer: graphs + dependency analysis',
      'Email + Slack support',
    ],
  },

  // Enterprise - Custom Pricing
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Custom',
    price: {
      monthly: 0,
      yearly: 0,
      display: 'Custom',
      period: '',
    },
    description: 'For organizations running AI as critical infrastructure. SLA guarantees, dedicated support, and custom deployments.',
    credits: {
      included: -1, // Custom
      display: 'Custom',
      rollover: true,
      rolloverLimit: -1, // Unlimited
      topups: true,
      topupPrice: 5,
      topupAmount: 10000,
      note: 'Tailored to your needs',
    },
    recommended: false,
    contactSales: true,
    cta: {
      text: 'Contact Sales',
      style: 'secondary',
    },
    limits: {
      agents: {
        active: -1, // Unlimited
        autonomousMode: true,
        teams: 'Hierarchies',
      },
      chat: {
        conversations: -1, // Unlimited
        messagesPerDay: -1, // Unlimited
        customModels: true,
      },
      hashSphereMemory: {
        standaloneService: true,
        universeAccess: 'Multi Universe',
        multiLayer: true,
      },
      ideCompute: {
        computeHours: -1, // Unlimited
        previewTime: 'Unlimited',
        aiAssistance: 'Full + Custom',
        customRuntimes: true,
      },
      governance: {
        killSwitch: 'SLA-backed',
        invariants: 'Custom',
        snapshots: -1, // Unlimited
      },
      codeVisualizer: {
        codebaseGraphs: true,
        dependencyAnalysis: true,
        ciIntegration: true,
      },
    },
    features: [
      'Custom credits (tailored to your needs)',
      'Unlimited agents with full autonomous mode',
      'Agent team hierarchies',
      'Unlimited conversations, custom models',
      '100 GB+ storage, unlimited RAG documents',
      'Unlimited compute hours, custom runtimes',
      'Full + Custom AI assistance',
      'SLA-backed kill switch, custom invariants, unlimited snapshots',
      'Hash Sphere Memory: Multi Universe + Multi-layer',
      'Code Visualizer: full access + CI integration',
      'Hash Sphere API access',
      'Dedicated engineers, architecture guidance',
      '99.9% SLA guarantee',
      'SOC2, HIPAA, GDPR compliance',
      'On-premise/hybrid deployment option',
    ],
  },
];

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
    id: 'hash_sphere_memory',
    name: 'Hash Sphere Memory',
    badge: 'Semantic Memory System',
    description: 'Revolutionary semantic memory that understands meaning. 3D memory space with resonance search and magnetic retrieval.',
    icon: 'database',
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
    id: 'blockchain_audit',
    name: 'Blockchain Audit',
    badge: 'Immutable Logs',
    description: 'Cryptographically signed audit entries with verification, compliance reports, and legal-grade proof.',
    icon: 'lock',
  },
  {
    id: 'code_visualizer',
    name: 'Code Visualizer',
    badge: 'Full Codebase Graph',
    description: 'Interactive codebase visualization with dependency graphs, governance rules, and CI integration.',
    icon: 'network',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    badge: 'Agents, Tools, Templates',
    description: 'Browse, publish, and install agents, workflows, and policies. RARA-certified with dual-layer isolation.',
    icon: 'store',
  },
  {
    id: 'state_physics',
    name: 'State Physics API',
    badge: 'Invariant Enforcement',
    description: 'Real-time anomaly detection and conservation law enforcement for complex state systems. Fraud detection, trust networks, distributed monitoring.',
    icon: 'atom',
  },
];

// State Physics API Pricing (separate from main platform credits)
export interface StatePhysicsAPIPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  simulationUnits: number;
  overageRate: number;
  invariantMultiplier: number;
  realtimeMultiplier: number;
  features: string[];
}

export const STATE_PHYSICS_API_PLANS: StatePhysicsAPIPlan[] = [
  {
    id: 'dev',
    name: 'Dev / Indie',
    price: 49,
    period: 'month',
    simulationUnits: 100000,  // 100k SU/month
    overageRate: 0.10,        // $0.10 per 1k SU overage
    invariantMultiplier: 1,   // Simple bounds only
    realtimeMultiplier: 1,    // Batch mode only
    features: [
      '100k Simulation Units/month',
      'Simple bounds invariants (x1)',
      'Batch mode processing',
      'Community support',
      '$0.10 per 1k SU overage',
    ],
  },
  {
    id: 'startup',
    name: 'Startup',
    price: 299,
    period: 'month',
    simulationUnits: 2000000,  // 2M SU/month
    overageRate: 0.05,         // $0.05 per 1k SU overage
    invariantMultiplier: 2,    // Conservation laws (x2)
    realtimeMultiplier: 1.5,   // Near-real-time (x1.5)
    features: [
      '2M Simulation Units/month',
      'All invariants (conservation x2)',
      'Near-real-time mode (x1.5)',
      'Priority support + webhooks',
      '$0.05 per 1k SU overage',
      '99.9% uptime SLA',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2000,  // Starting price
    period: 'month',
    simulationUnits: -1,       // Custom
    overageRate: 0,            // Negotiated
    invariantMultiplier: 5,    // Temporal/historical (x5)
    realtimeMultiplier: 3,     // Hard real-time (x3)
    features: [
      'Custom SU allocation',
      'Custom invariants (x3-x5)',
      'Hard real-time mode (x3)',
      'Dedicated support + SLA',
      'On-premise / air-gapped',
      'Audit reports & compliance',
    ],
  },
];

// State Physics Enterprise Licensing (Annual)
export const STATE_PHYSICS_ENTERPRISE_LICENSING = [
  { customer: 'Small L2 chain', priceMin: 25000, priceMax: 50000 },
  { customer: 'Exchange / Custodian', priceMin: 75000, priceMax: 250000 },
  { customer: 'Large platform', priceMin: 250000, priceMax: 1000000 },
];

// Simulation Unit Definition
export const SIMULATION_UNIT_DEFINITION = {
  description: '1 SU = 1 simulation step × 1,000 nodes × invariant evaluation',
  note: 'Aligns pricing to state risk surface, not CPU cycles.',
};

// ============================================================
// HASH SPHERE MEMORY API PRICING
// Invariant-governed long-term memory for AI systems
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
      '1536-dim embeddings',
      'Encrypted storage (AES-256-GCM)',
      'Batch simulation',
      'Standard invariants',
      'No real-time enforcement',
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
      'Real-time invariant checks',
      'Memory clustering & entropy metrics',
      'Memory replay (last 30 days)',
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
      'Hard real-time enforcement',
      'Custom invariant definitions',
      'Full replay & audit trail',
      'Priority execution',
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
      'Dedicated invariant engine',
      'On-prem / VPC / air-gapped options',
      'SLA + incident guarantees',
      'Custom physics models',
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
  { customer: 'Blockchain / DAO', priceMin: 75000, priceMax: 250000 },
];

// Memory Unit Definition
export const MEMORY_UNIT_DEFINITION = {
  description: '1 Memory Unit = one memory write or evolution step × invariant evaluation × clustering update',
  note: 'Aligns billing to semantic impact, not raw compute.',
};

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
    answer: 'Developer ($15/mo): Community + email. Plus: Priority email + Slack. Enterprise: Dedicated engineers, architecture guidance, and SLA guarantees.',
  },
];

// Helper functions
export const getPlanById = (id: string): Plan | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const getRecommendedPlan = (): Plan | undefined => {
  return PLANS.find(plan => plan.recommended);
};

export const formatCredits = (credits: number): string => {
  if (credits === -1) return 'Custom';
  return credits.toLocaleString();
};

export const isUnlimited = (value: number | string): boolean => {
  return value === -1 || value === 'Unlimited' || value === 'Custom';
};

// Export full config
export const PRICING_CONFIG: PricingConfig = {
  creditRate: CREDIT_RATE,
  plans: PLANS,
  hashSphereFeatures: HASH_SPHERE_FEATURES,
  coreFeatures: CORE_FEATURES,
  faq: FAQ,
};

export default PRICING_CONFIG;
