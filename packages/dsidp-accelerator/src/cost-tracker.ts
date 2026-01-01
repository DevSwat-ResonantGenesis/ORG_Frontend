/**
 * DSID-P Cost Tracker
 * 
 * Track and optimize LLM API costs:
 * - Token usage monitoring
 * - Cost calculation
 * - Budget management
 * - Usage analytics
 * - Optimization suggestions
 */

// ============== TYPES ==============

export interface CostConfig {
  budgetLimit: number;
  alertThreshold: number;
  currency: string;
  trackingEnabled: boolean;
  persistPath?: string;
  onBudgetAlert?: (usage: BudgetStatus) => void;
}

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'cohere' | 'mistral' | 'ollama';

export interface ModelPricing {
  provider: LLMProvider;
  model: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  contextWindow: number;
  notes?: string;
}

export interface UsageRecord {
  id: string;
  timestamp: number;
  provider: LLMProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, unknown>;
}

export interface DailyUsage {
  date: string;
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  byProvider: Record<LLMProvider, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
  byOperation: Record<string, {
    cost: number;
    tokens: number;
    requests: number;
  }>;
}

export interface BudgetStatus {
  limit: number;
  used: number;
  remaining: number;
  percentUsed: number;
  projectedMonthlySpend: number;
  isOverBudget: boolean;
  alertTriggered: boolean;
}

export interface CostOptimization {
  type: 'model_switch' | 'caching' | 'batching' | 'prompt_reduction' | 'rate_limit';
  description: string;
  potentialSavings: number;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
}

export interface UsageAnalytics {
  period: 'day' | 'week' | 'month' | 'all';
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  avgCostPerRequest: number;
  avgTokensPerRequest: number;
  topOperations: Array<{ operation: string; cost: number; percentage: number }>;
  topModels: Array<{ model: string; cost: number; percentage: number }>;
  costTrend: Array<{ date: string; cost: number }>;
  peakUsageHours: number[];
}

// ============== PRICING DATA ==============

const MODEL_PRICING: ModelPricing[] = [
  // OpenAI
  { provider: 'openai', model: 'gpt-4-turbo', inputPricePerMillion: 10, outputPricePerMillion: 30, contextWindow: 128000 },
  { provider: 'openai', model: 'gpt-4', inputPricePerMillion: 30, outputPricePerMillion: 60, contextWindow: 8192 },
  { provider: 'openai', model: 'gpt-4-32k', inputPricePerMillion: 60, outputPricePerMillion: 120, contextWindow: 32768 },
  { provider: 'openai', model: 'gpt-3.5-turbo', inputPricePerMillion: 0.5, outputPricePerMillion: 1.5, contextWindow: 16385 },
  { provider: 'openai', model: 'gpt-4o', inputPricePerMillion: 5, outputPricePerMillion: 15, contextWindow: 128000 },
  { provider: 'openai', model: 'gpt-4o-mini', inputPricePerMillion: 0.15, outputPricePerMillion: 0.6, contextWindow: 128000 },
  
  // Anthropic
  { provider: 'anthropic', model: 'claude-3-opus', inputPricePerMillion: 15, outputPricePerMillion: 75, contextWindow: 200000 },
  { provider: 'anthropic', model: 'claude-3-sonnet', inputPricePerMillion: 3, outputPricePerMillion: 15, contextWindow: 200000 },
  { provider: 'anthropic', model: 'claude-3-haiku', inputPricePerMillion: 0.25, outputPricePerMillion: 1.25, contextWindow: 200000 },
  { provider: 'anthropic', model: 'claude-3.5-sonnet', inputPricePerMillion: 3, outputPricePerMillion: 15, contextWindow: 200000 },
  
  // Google
  { provider: 'google', model: 'gemini-pro', inputPricePerMillion: 0.5, outputPricePerMillion: 1.5, contextWindow: 32000 },
  { provider: 'google', model: 'gemini-1.5-pro', inputPricePerMillion: 3.5, outputPricePerMillion: 10.5, contextWindow: 1000000 },
  { provider: 'google', model: 'gemini-1.5-flash', inputPricePerMillion: 0.075, outputPricePerMillion: 0.3, contextWindow: 1000000 },
  
  // Mistral
  { provider: 'mistral', model: 'mistral-large', inputPricePerMillion: 4, outputPricePerMillion: 12, contextWindow: 32000 },
  { provider: 'mistral', model: 'mistral-medium', inputPricePerMillion: 2.7, outputPricePerMillion: 8.1, contextWindow: 32000 },
  { provider: 'mistral', model: 'mistral-small', inputPricePerMillion: 1, outputPricePerMillion: 3, contextWindow: 32000 },
  
  // Cohere
  { provider: 'cohere', model: 'command-r-plus', inputPricePerMillion: 3, outputPricePerMillion: 15, contextWindow: 128000 },
  { provider: 'cohere', model: 'command-r', inputPricePerMillion: 0.5, outputPricePerMillion: 1.5, contextWindow: 128000 },
  
  // Ollama (local - free)
  { provider: 'ollama', model: 'llama2', inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 4096 },
  { provider: 'ollama', model: 'mixtral', inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 32000 },
  { provider: 'ollama', model: 'codellama', inputPricePerMillion: 0, outputPricePerMillion: 0, contextWindow: 16000 },
];

// ============== COST TRACKER ==============

export class CostTracker {
  private config: CostConfig;
  private records: UsageRecord[] = [];
  private dailyCache: Map<string, DailyUsage> = new Map();
  private pricing: Map<string, ModelPricing> = new Map();

  constructor(config: Partial<CostConfig> = {}) {
    this.config = {
      budgetLimit: config.budgetLimit || 100, // $100 default
      alertThreshold: config.alertThreshold || 0.8, // 80%
      currency: config.currency || 'USD',
      trackingEnabled: config.trackingEnabled ?? true,
      persistPath: config.persistPath,
      onBudgetAlert: config.onBudgetAlert,
    };

    // Initialize pricing lookup
    for (const pricing of MODEL_PRICING) {
      this.pricing.set(`${pricing.provider}:${pricing.model}`, pricing);
    }
  }

  // ============== TRACKING ==============

  track(params: {
    provider: LLMProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    operation: string;
    duration: number;
    success: boolean;
    metadata?: Record<string, unknown>;
  }): UsageRecord {
    if (!this.config.trackingEnabled) {
      return this.createRecord(params, 0);
    }

    const cost = this.calculateCost(
      params.provider,
      params.model,
      params.inputTokens,
      params.outputTokens
    );

    const record = this.createRecord(params, cost);
    this.records.push(record);
    this.updateDailyCache(record);
    this.checkBudgetAlert();

    return record;
  }

  private createRecord(params: {
    provider: LLMProvider;
    model: string;
    inputTokens: number;
    outputTokens: number;
    operation: string;
    duration: number;
    success: boolean;
    metadata?: Record<string, unknown>;
  }, cost: number): UsageRecord {
    return {
      id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      provider: params.provider,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      totalTokens: params.inputTokens + params.outputTokens,
      cost,
      operation: params.operation,
      duration: params.duration,
      success: params.success,
      metadata: params.metadata,
    };
  }

  // ============== COST CALCULATION ==============

  calculateCost(
    provider: LLMProvider,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = this.getPricing(provider, model);
    if (!pricing) return 0;

    const inputCost = (inputTokens / 1_000_000) * pricing.inputPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * pricing.outputPricePerMillion;
    
    return Math.round((inputCost + outputCost) * 10000) / 10000; // 4 decimal places
  }

  estimateCost(
    provider: LLMProvider,
    model: string,
    promptLength: number,
    expectedOutputLength: number = 500
  ): number {
    // Rough token estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(promptLength / 4);
    const outputTokens = Math.ceil(expectedOutputLength / 4);
    
    return this.calculateCost(provider, model, inputTokens, outputTokens);
  }

  getPricing(provider: LLMProvider, model: string): ModelPricing | null {
    // Try exact match
    let pricing = this.pricing.get(`${provider}:${model}`);
    if (pricing) return pricing;

    // Try partial match
    for (const [key, value] of this.pricing.entries()) {
      if (key.includes(model) || model.includes(key.split(':')[1])) {
        return value;
      }
    }

    return null;
  }

  // ============== BUDGET MANAGEMENT ==============

  getBudgetStatus(): BudgetStatus {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    const monthlyRecords = this.records.filter(r => r.timestamp >= monthStart);
    const used = monthlyRecords.reduce((sum, r) => sum + r.cost, 0);
    
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const dailyAvg = used / dayOfMonth;
    const projectedMonthlySpend = dailyAvg * daysInMonth;

    const percentUsed = (used / this.config.budgetLimit) * 100;
    
    return {
      limit: this.config.budgetLimit,
      used: Math.round(used * 100) / 100,
      remaining: Math.round((this.config.budgetLimit - used) * 100) / 100,
      percentUsed: Math.round(percentUsed * 10) / 10,
      projectedMonthlySpend: Math.round(projectedMonthlySpend * 100) / 100,
      isOverBudget: used > this.config.budgetLimit,
      alertTriggered: percentUsed >= this.config.alertThreshold * 100,
    };
  }

  setBudget(limit: number): void {
    this.config.budgetLimit = limit;
  }

  setAlertThreshold(threshold: number): void {
    this.config.alertThreshold = threshold;
  }

  private checkBudgetAlert(): void {
    const status = this.getBudgetStatus();
    if (status.alertTriggered && this.config.onBudgetAlert) {
      this.config.onBudgetAlert(status);
    }
  }

  // ============== ANALYTICS ==============

  getAnalytics(period: 'day' | 'week' | 'month' | 'all' = 'month'): UsageAnalytics {
    const now = Date.now();
    const periodMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: Infinity,
    };

    const cutoff = period === 'all' ? 0 : now - periodMs[period];
    const filtered = this.records.filter(r => r.timestamp >= cutoff);

    const totalCost = filtered.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = filtered.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalRequests = filtered.length;

    // Group by operation
    const byOperation: Record<string, { cost: number; count: number }> = {};
    for (const record of filtered) {
      if (!byOperation[record.operation]) {
        byOperation[record.operation] = { cost: 0, count: 0 };
      }
      byOperation[record.operation].cost += record.cost;
      byOperation[record.operation].count++;
    }

    // Group by model
    const byModel: Record<string, { cost: number; count: number }> = {};
    for (const record of filtered) {
      const key = `${record.provider}/${record.model}`;
      if (!byModel[key]) {
        byModel[key] = { cost: 0, count: 0 };
      }
      byModel[key].cost += record.cost;
      byModel[key].count++;
    }

    // Cost trend by day
    const costByDay: Record<string, number> = {};
    for (const record of filtered) {
      const date = new Date(record.timestamp).toISOString().split('T')[0];
      costByDay[date] = (costByDay[date] || 0) + record.cost;
    }

    // Peak usage hours
    const hourCounts = new Array(24).fill(0);
    for (const record of filtered) {
      const hour = new Date(record.timestamp).getHours();
      hourCounts[hour]++;
    }
    const maxCount = Math.max(...hourCounts);
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count >= maxCount * 0.8)
      .map(h => h.hour);

    return {
      period,
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens,
      totalRequests,
      avgCostPerRequest: totalRequests > 0 ? Math.round((totalCost / totalRequests) * 1000) / 1000 : 0,
      avgTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0,
      topOperations: Object.entries(byOperation)
        .map(([operation, data]) => ({
          operation,
          cost: Math.round(data.cost * 100) / 100,
          percentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 100) : 0,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5),
      topModels: Object.entries(byModel)
        .map(([model, data]) => ({
          model,
          cost: Math.round(data.cost * 100) / 100,
          percentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 100) : 0,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5),
      costTrend: Object.entries(costByDay)
        .map(([date, cost]) => ({ date, cost: Math.round(cost * 100) / 100 }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      peakUsageHours: peakHours,
    };
  }

  getDailyUsage(date?: Date): DailyUsage {
    const dateStr = (date || new Date()).toISOString().split('T')[0];
    
    if (this.dailyCache.has(dateStr)) {
      return this.dailyCache.get(dateStr)!;
    }

    const dayStart = new Date(dateStr).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    
    const dayRecords = this.records.filter(
      r => r.timestamp >= dayStart && r.timestamp < dayEnd
    );

    const usage: DailyUsage = {
      date: dateStr,
      totalCost: 0,
      totalTokens: 0,
      requestCount: dayRecords.length,
      byProvider: {} as any,
      byOperation: {},
    };

    for (const record of dayRecords) {
      usage.totalCost += record.cost;
      usage.totalTokens += record.totalTokens;

      // By provider
      if (!usage.byProvider[record.provider]) {
        usage.byProvider[record.provider] = { cost: 0, tokens: 0, requests: 0 };
      }
      usage.byProvider[record.provider].cost += record.cost;
      usage.byProvider[record.provider].tokens += record.totalTokens;
      usage.byProvider[record.provider].requests++;

      // By operation
      if (!usage.byOperation[record.operation]) {
        usage.byOperation[record.operation] = { cost: 0, tokens: 0, requests: 0 };
      }
      usage.byOperation[record.operation].cost += record.cost;
      usage.byOperation[record.operation].tokens += record.totalTokens;
      usage.byOperation[record.operation].requests++;
    }

    this.dailyCache.set(dateStr, usage);
    return usage;
  }

  private updateDailyCache(record: UsageRecord): void {
    const dateStr = new Date(record.timestamp).toISOString().split('T')[0];
    this.dailyCache.delete(dateStr); // Invalidate cache
  }

  // ============== OPTIMIZATION ==============

  getOptimizations(): CostOptimization[] {
    const optimizations: CostOptimization[] = [];
    const analytics = this.getAnalytics('month');

    // Check for expensive model usage
    const expensiveModels = analytics.topModels.filter(m => 
      m.model.includes('gpt-4') || m.model.includes('opus')
    );
    
    if (expensiveModels.length > 0 && expensiveModels[0].percentage > 50) {
      optimizations.push({
        type: 'model_switch',
        description: `${expensiveModels[0].model} accounts for ${expensiveModels[0].percentage}% of costs`,
        potentialSavings: expensiveModels[0].cost * 0.5, // Estimate 50% savings
        implementation: 'Use GPT-4o-mini or Claude Haiku for simpler tasks',
        priority: 'high',
      });
    }

    // Check for repeated operations
    const operationCounts = new Map<string, number>();
    for (const record of this.records.slice(-1000)) {
      const key = `${record.operation}:${record.inputTokens}`;
      operationCounts.set(key, (operationCounts.get(key) || 0) + 1);
    }

    const repeatedOps = Array.from(operationCounts.entries())
      .filter(([_, count]) => count > 10)
      .length;

    if (repeatedOps > 5) {
      optimizations.push({
        type: 'caching',
        description: 'Detected repeated identical requests',
        potentialSavings: analytics.totalCost * 0.2,
        implementation: 'Enable semantic caching for repeated prompts',
        priority: 'high',
      });
    }

    // Check for high token usage
    if (analytics.avgTokensPerRequest > 2000) {
      optimizations.push({
        type: 'prompt_reduction',
        description: `Average request uses ${analytics.avgTokensPerRequest} tokens`,
        potentialSavings: analytics.totalCost * 0.15,
        implementation: 'Optimize prompts to reduce token count',
        priority: 'medium',
      });
    }

    // Suggest batching
    if (analytics.totalRequests > 100 && analytics.avgCostPerRequest < 0.01) {
      optimizations.push({
        type: 'batching',
        description: 'Many small requests detected',
        potentialSavings: analytics.totalCost * 0.1,
        implementation: 'Batch multiple small requests together',
        priority: 'low',
      });
    }

    return optimizations.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }

  suggestModel(task: string, maxCost: number = 0.01): ModelPricing | null {
    // Simple task classification
    const isSimple = /simple|basic|short|quick|easy/i.test(task);
    const isComplex = /complex|detailed|analysis|code|reasoning/i.test(task);
    
    const candidates = MODEL_PRICING.filter(p => {
      const avgCost = (p.inputPricePerMillion + p.outputPricePerMillion) / 2 / 1000;
      return avgCost <= maxCost * 1000;
    });

    if (candidates.length === 0) {
      return MODEL_PRICING.find(p => p.provider === 'ollama') || null;
    }

    if (isSimple) {
      return candidates.sort((a, b) => 
        (a.inputPricePerMillion + a.outputPricePerMillion) - 
        (b.inputPricePerMillion + b.outputPricePerMillion)
      )[0];
    }

    if (isComplex) {
      return candidates.sort((a, b) => b.contextWindow - a.contextWindow)[0];
    }

    return candidates[0];
  }

  // ============== PERSISTENCE ==============

  async save(): Promise<void> {
    if (!this.config.persistPath) return;

    try {
      const fs = await import('fs/promises');
      const data = JSON.stringify({
        records: this.records,
        config: this.config,
      }, null, 2);
      await fs.writeFile(this.config.persistPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save cost data:', error);
    }
  }

  async load(): Promise<void> {
    if (!this.config.persistPath) return;

    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(this.config.persistPath, 'utf-8');
      const parsed = JSON.parse(data);
      this.records = parsed.records || [];
    } catch {
      // No existing data
    }
  }

  // ============== UTILITIES ==============

  getRecords(filter?: {
    provider?: LLMProvider;
    model?: string;
    operation?: string;
    since?: number;
    until?: number;
  }): UsageRecord[] {
    let filtered = this.records;

    if (filter?.provider) {
      filtered = filtered.filter(r => r.provider === filter.provider);
    }
    if (filter?.model) {
      filtered = filtered.filter(r => r.model === filter.model);
    }
    if (filter?.operation) {
      filtered = filtered.filter(r => r.operation === filter.operation);
    }
    if (filter?.since) {
      filtered = filtered.filter(r => r.timestamp >= filter.since!);
    }
    if (filter?.until) {
      filtered = filtered.filter(r => r.timestamp <= filter.until!);
    }

    return filtered;
  }

  getTotalCost(): number {
    return Math.round(this.records.reduce((sum, r) => sum + r.cost, 0) * 100) / 100;
  }

  getTotalTokens(): number {
    return this.records.reduce((sum, r) => sum + r.totalTokens, 0);
  }

  clear(): void {
    this.records = [];
    this.dailyCache.clear();
  }

  exportCSV(): string {
    const headers = ['timestamp', 'provider', 'model', 'operation', 'inputTokens', 'outputTokens', 'cost', 'duration', 'success'];
    const rows = this.records.map(r => [
      new Date(r.timestamp).toISOString(),
      r.provider,
      r.model,
      r.operation,
      r.inputTokens,
      r.outputTokens,
      r.cost,
      r.duration,
      r.success,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
}

// ============== FACTORY ==============

export function createCostTracker(config?: Partial<CostConfig>): CostTracker {
  return new CostTracker(config);
}

// ============== DEFAULT INSTANCE ==============

let defaultTracker: CostTracker | null = null;

export function getCostTracker(config?: Partial<CostConfig>): CostTracker {
  if (!defaultTracker) {
    defaultTracker = createCostTracker(config);
  }
  return defaultTracker;
}

export { MODEL_PRICING };
