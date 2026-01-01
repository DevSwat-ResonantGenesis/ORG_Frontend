/**
 * DSID-P Feature Flags & A/B Testing
 * 
 * Runtime feature toggles and experimentation:
 * - Feature flags with targeting rules
 * - A/B testing with variants
 * - Gradual rollouts
 * - User segmentation
 * - Analytics integration
 */

// ============== TYPES ==============

export interface FeatureFlagConfig {
  storageType: 'memory' | 'localStorage' | 'remote';
  remoteUrl?: string;
  refreshInterval?: number;
  defaultEnabled: boolean;
  onFlagChange?: (flag: string, enabled: boolean) => void;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rules?: TargetingRule[];
  variants?: Variant[];
  rolloutPercentage?: number;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface TargetingRule {
  id: string;
  attribute: string;
  operator: RuleOperator;
  value: unknown;
  enabled: boolean;
}

export type RuleOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'matches_regex';

export interface Variant {
  key: string;
  name: string;
  weight: number;
  payload?: unknown;
}

export interface UserContext {
  userId?: string;
  email?: string;
  attributes?: Record<string, unknown>;
  groups?: string[];
}

export interface Experiment {
  key: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  targetingRules?: TargetingRule[];
  metrics: ExperimentMetric[];
  startDate?: number;
  endDate?: number;
  results?: ExperimentResults;
}

export interface ExperimentMetric {
  key: string;
  name: string;
  type: 'conversion' | 'count' | 'duration' | 'revenue';
  goal: 'increase' | 'decrease';
}

export interface ExperimentResults {
  sampleSize: number;
  variantResults: Record<string, VariantResult>;
  winner?: string;
  confidence: number;
}

export interface VariantResult {
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  improvement?: number;
}

export interface FlagEvaluation {
  flag: string;
  enabled: boolean;
  variant?: string;
  reason: string;
  timestamp: number;
}

// ============== FEATURE FLAG MANAGER ==============

export class FeatureFlagManager {
  private config: FeatureFlagConfig;
  private flags: Map<string, FeatureFlag> = new Map();
  private evaluationCache: Map<string, FlagEvaluation> = new Map();
  private userContext: UserContext = {};

  constructor(config: Partial<FeatureFlagConfig> = {}) {
    this.config = {
      storageType: config.storageType || 'memory',
      remoteUrl: config.remoteUrl,
      refreshInterval: config.refreshInterval || 60000,
      defaultEnabled: config.defaultEnabled ?? false,
      onFlagChange: config.onFlagChange,
    };

    if (this.config.storageType === 'localStorage') {
      this.loadFromStorage();
    }

    if (this.config.remoteUrl) {
      this.startRemoteSync();
    }
  }

  // ============== FLAG MANAGEMENT ==============

  createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): FeatureFlag {
    const now = Date.now();
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now,
    };
    
    this.flags.set(flag.key, newFlag);
    this.saveToStorage();
    
    return newFlag;
  }

  updateFlag(key: string, updates: Partial<FeatureFlag>): FeatureFlag | null {
    const flag = this.flags.get(key);
    if (!flag) return null;

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      key: flag.key, // Prevent key change
      createdAt: flag.createdAt,
      updatedAt: Date.now(),
    };

    this.flags.set(key, updatedFlag);
    this.clearCache(key);
    this.saveToStorage();
    
    if (this.config.onFlagChange && flag.enabled !== updatedFlag.enabled) {
      this.config.onFlagChange(key, updatedFlag.enabled);
    }

    return updatedFlag;
  }

  deleteFlag(key: string): boolean {
    const deleted = this.flags.delete(key);
    if (deleted) {
      this.clearCache(key);
      this.saveToStorage();
    }
    return deleted;
  }

  getFlag(key: string): FeatureFlag | null {
    return this.flags.get(key) || null;
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  // ============== FLAG EVALUATION ==============

  isEnabled(key: string, context?: UserContext): boolean {
    const evaluation = this.evaluate(key, context);
    return evaluation.enabled;
  }

  getVariant(key: string, context?: UserContext): string | null {
    const evaluation = this.evaluate(key, context);
    return evaluation.variant || null;
  }

  evaluate(key: string, context?: UserContext): FlagEvaluation {
    const ctx = context || this.userContext;
    const cacheKey = `${key}:${JSON.stringify(ctx)}`;
    
    // Check cache
    const cached = this.evaluationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) {
      return cached;
    }

    const flag = this.flags.get(key);
    
    if (!flag) {
      return this.createEvaluation(key, this.config.defaultEnabled, undefined, 'flag_not_found');
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return this.createEvaluation(key, false, undefined, 'flag_disabled');
    }

    // Check targeting rules
    if (flag.rules && flag.rules.length > 0) {
      const ruleResult = this.evaluateRules(flag.rules, ctx);
      if (!ruleResult) {
        return this.createEvaluation(key, false, undefined, 'rule_not_matched');
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = this.hashUser(ctx.userId || 'anonymous', key);
      if (hash > flag.rolloutPercentage) {
        return this.createEvaluation(key, false, undefined, 'rollout_excluded');
      }
    }

    // Select variant if applicable
    let variant: string | undefined;
    if (flag.variants && flag.variants.length > 0) {
      variant = this.selectVariant(flag.variants, ctx.userId || 'anonymous', key);
    }

    const evaluation = this.createEvaluation(key, true, variant, 'enabled');
    this.evaluationCache.set(cacheKey, evaluation);
    
    return evaluation;
  }

  private createEvaluation(
    flag: string,
    enabled: boolean,
    variant: string | undefined,
    reason: string
  ): FlagEvaluation {
    return { flag, enabled, variant, reason, timestamp: Date.now() };
  }

  private evaluateRules(rules: TargetingRule[], context: UserContext): boolean {
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      const value = this.getAttributeValue(context, rule.attribute);
      if (!this.evaluateRule(rule, value)) {
        return false;
      }
    }
    return true;
  }

  private getAttributeValue(context: UserContext, attribute: string): unknown {
    if (attribute === 'userId') return context.userId;
    if (attribute === 'email') return context.email;
    if (attribute === 'groups') return context.groups;
    return context.attributes?.[attribute];
  }

  private evaluateRule(rule: TargetingRule, value: unknown): boolean {
    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'not_equals':
        return value !== rule.value;
      case 'contains':
        return String(value).includes(String(rule.value));
      case 'not_contains':
        return !String(value).includes(String(rule.value));
      case 'greater_than':
        return Number(value) > Number(rule.value);
      case 'less_than':
        return Number(value) < Number(rule.value);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(value);
      case 'matches_regex':
        return new RegExp(String(rule.value)).test(String(value));
      default:
        return false;
    }
  }

  private selectVariant(variants: Variant[], userId: string, flagKey: string): string {
    const hash = this.hashUser(userId, flagKey);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    let cumulative = 0;
    for (const variant of variants) {
      cumulative += (variant.weight / totalWeight) * 100;
      if (hash <= cumulative) {
        return variant.key;
      }
    }
    
    return variants[0].key;
  }

  private hashUser(userId: string, salt: string): number {
    const str = `${userId}:${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  // ============== USER CONTEXT ==============

  setUserContext(context: UserContext): void {
    this.userContext = context;
    this.evaluationCache.clear();
  }

  updateUserContext(updates: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...updates };
    this.evaluationCache.clear();
  }

  clearUserContext(): void {
    this.userContext = {};
    this.evaluationCache.clear();
  }

  // ============== STORAGE ==============

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = localStorage.getItem('dsidp_feature_flags');
      if (data) {
        const flags = JSON.parse(data) as FeatureFlag[];
        for (const flag of flags) {
          this.flags.set(flag.key, flag);
        }
      }
    } catch {}
  }

  private saveToStorage(): void {
    if (this.config.storageType !== 'localStorage') return;
    if (typeof localStorage === 'undefined') return;
    
    try {
      const data = JSON.stringify(Array.from(this.flags.values()));
      localStorage.setItem('dsidp_feature_flags', data);
    } catch {}
  }

  private clearCache(key?: string): void {
    if (key) {
      for (const cacheKey of this.evaluationCache.keys()) {
        if (cacheKey.startsWith(`${key}:`)) {
          this.evaluationCache.delete(cacheKey);
        }
      }
    } else {
      this.evaluationCache.clear();
    }
  }

  // ============== REMOTE SYNC ==============

  private syncInterval: NodeJS.Timeout | null = null;

  private startRemoteSync(): void {
    if (!this.config.remoteUrl) return;
    
    this.fetchRemoteFlags();
    
    this.syncInterval = setInterval(() => {
      this.fetchRemoteFlags();
    }, this.config.refreshInterval);
  }

  private async fetchRemoteFlags(): Promise<void> {
    if (!this.config.remoteUrl) return;
    
    try {
      const response = await fetch(this.config.remoteUrl);
      const flags = await response.json() as FeatureFlag[];
      
      for (const flag of flags) {
        const existing = this.flags.get(flag.key);
        this.flags.set(flag.key, flag);
        
        if (this.config.onFlagChange && existing?.enabled !== flag.enabled) {
          this.config.onFlagChange(flag.key, flag.enabled);
        }
      }
      
      this.evaluationCache.clear();
    } catch {}
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ============== BULK OPERATIONS ==============

  importFlags(flags: FeatureFlag[]): void {
    for (const flag of flags) {
      this.flags.set(flag.key, flag);
    }
    this.saveToStorage();
    this.evaluationCache.clear();
  }

  exportFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}

// ============== EXPERIMENT MANAGER ==============

export class ExperimentManager {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, Record<string, string>> = new Map();
  private events: Array<{ experiment: string; variant: string; metric: string; value: number; timestamp: number }> = [];

  createExperiment(experiment: Omit<Experiment, 'status' | 'results'>): Experiment {
    const newExperiment: Experiment = {
      ...experiment,
      status: 'draft',
    };
    
    this.experiments.set(experiment.key, newExperiment);
    return newExperiment;
  }

  startExperiment(key: string): boolean {
    const experiment = this.experiments.get(key);
    if (!experiment || experiment.status !== 'draft') return false;
    
    experiment.status = 'running';
    experiment.startDate = Date.now();
    return true;
  }

  pauseExperiment(key: string): boolean {
    const experiment = this.experiments.get(key);
    if (!experiment || experiment.status !== 'running') return false;
    
    experiment.status = 'paused';
    return true;
  }

  completeExperiment(key: string): Experiment | null {
    const experiment = this.experiments.get(key);
    if (!experiment) return null;
    
    experiment.status = 'completed';
    experiment.endDate = Date.now();
    experiment.results = this.calculateResults(key);
    
    return experiment;
  }

  getVariant(experimentKey: string, userId: string): string | null {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment || experiment.status !== 'running') return null;

    // Check existing assignment
    const userAssignments = this.assignments.get(userId) || {};
    if (userAssignments[experimentKey]) {
      return userAssignments[experimentKey];
    }

    // Assign new variant
    const variant = this.assignVariant(experiment, userId);
    userAssignments[experimentKey] = variant;
    this.assignments.set(userId, userAssignments);
    
    return variant;
  }

  private assignVariant(experiment: Experiment, userId: string): string {
    const hash = this.hashUser(userId, experiment.key);
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += (variant.weight / totalWeight) * 100;
      if (hash <= cumulative) {
        return variant.key;
      }
    }
    
    return experiment.variants[0].key;
  }

  private hashUser(userId: string, salt: string): number {
    const str = `${userId}:${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  trackEvent(experimentKey: string, userId: string, metricKey: string, value: number = 1): void {
    const variant = this.getVariant(experimentKey, userId);
    if (!variant) return;

    this.events.push({
      experiment: experimentKey,
      variant,
      metric: metricKey,
      value,
      timestamp: Date.now(),
    });
  }

  private calculateResults(experimentKey: string): ExperimentResults {
    const experiment = this.experiments.get(experimentKey);
    if (!experiment) {
      return { sampleSize: 0, variantResults: {}, confidence: 0 };
    }

    const experimentEvents = this.events.filter(e => e.experiment === experimentKey);
    const variantResults: Record<string, VariantResult> = {};

    for (const variant of experiment.variants) {
      const variantEvents = experimentEvents.filter(e => e.variant === variant.key);
      const conversions = variantEvents.filter(e => e.value > 0).length;
      
      variantResults[variant.key] = {
        sampleSize: variantEvents.length,
        conversions,
        conversionRate: variantEvents.length > 0 ? conversions / variantEvents.length : 0,
      };
    }

    // Calculate improvements relative to control (first variant)
    const control = experiment.variants[0].key;
    const controlRate = variantResults[control]?.conversionRate || 0;
    
    let winner: string | undefined;
    let bestImprovement = 0;

    for (const [key, result] of Object.entries(variantResults)) {
      if (key !== control && controlRate > 0) {
        result.improvement = ((result.conversionRate - controlRate) / controlRate) * 100;
        if (result.improvement > bestImprovement) {
          bestImprovement = result.improvement;
          winner = key;
        }
      }
    }

    // Simple confidence calculation (would use proper statistical test in production)
    const totalSamples = Object.values(variantResults).reduce((sum, r) => sum + r.sampleSize, 0);
    const confidence = Math.min(95, (totalSamples / 1000) * 95);

    return {
      sampleSize: totalSamples,
      variantResults,
      winner: confidence >= 95 ? winner : undefined,
      confidence,
    };
  }

  getExperiment(key: string): Experiment | null {
    return this.experiments.get(key) || null;
  }

  getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }
}

// ============== REACT HOOKS ==============

export function createFeatureFlagHooks(manager: FeatureFlagManager) {
  return {
    useFlag: (key: string) => {
      return manager.isEnabled(key);
    },
    
    useVariant: (key: string) => {
      return manager.getVariant(key);
    },
    
    useFlags: () => {
      return manager.getAllFlags();
    },
  };
}

// ============== FACTORY ==============

export function createFeatureFlagManager(config?: Partial<FeatureFlagConfig>): FeatureFlagManager {
  return new FeatureFlagManager(config);
}

export function createExperimentManager(): ExperimentManager {
  return new ExperimentManager();
}

// ============== DEFAULT INSTANCE ==============

let defaultManager: FeatureFlagManager | null = null;

export function getFeatureFlagManager(config?: Partial<FeatureFlagConfig>): FeatureFlagManager {
  if (!defaultManager) {
    defaultManager = createFeatureFlagManager(config);
  }
  return defaultManager;
}
