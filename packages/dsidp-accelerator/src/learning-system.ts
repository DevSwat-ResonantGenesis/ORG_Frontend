/**
 * DSID-P Learning System
 * 
 * Continuous improvement through:
 * - Feedback collection
 * - Pattern recognition
 * - Performance optimization
 * - Knowledge accumulation
 * - Adaptive behavior
 */

// ============== TYPES ==============

export interface LearningConfig {
  storePath: string;
  maxMemorySize: number;
  learningRate: number;
  feedbackWeight: number;
  enablePatternRecognition: boolean;
  enableAdaptation: boolean;
  syncToCloud: boolean;
  cloudEndpoint?: string;
}

export interface Feedback {
  id: string;
  timestamp: number;
  type: 'positive' | 'negative' | 'correction';
  context: {
    task: string;
    action: string;
    result: unknown;
  };
  feedback: string;
  correction?: string;
  tags: string[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  successRate: number;
  usageCount: number;
  lastUsed: number;
  confidence: number;
}

export interface Knowledge {
  id: string;
  category: string;
  content: string;
  source: string;
  confidence: number;
  timestamp: number;
  usageCount: number;
  relatedIds: string[];
}

export interface PerformanceMetric {
  timestamp: number;
  taskType: string;
  duration: number;
  success: boolean;
  tokensUsed: number;
  retries: number;
}

export interface LearningState {
  patterns: Pattern[];
  knowledge: Knowledge[];
  feedback: Feedback[];
  metrics: PerformanceMetric[];
  adaptations: Adaptation[];
  version: number;
  lastUpdated: number;
}

export interface Adaptation {
  id: string;
  type: 'behavior' | 'strategy' | 'preference';
  description: string;
  trigger: string;
  change: string;
  effectiveness: number;
  timestamp: number;
}

export interface LearningInsight {
  type: 'improvement' | 'warning' | 'suggestion';
  title: string;
  description: string;
  data: unknown;
  actionable: boolean;
  action?: string;
}

// ============== LEARNING SYSTEM ==============

export class LearningSystem {
  private config: LearningConfig;
  private state: LearningState;
  private isDirty: boolean = false;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<LearningConfig> = {}) {
    this.config = {
      storePath: config.storePath || './dsidp-learning',
      maxMemorySize: config.maxMemorySize || 10000,
      learningRate: config.learningRate || 0.1,
      feedbackWeight: config.feedbackWeight || 0.3,
      enablePatternRecognition: config.enablePatternRecognition ?? true,
      enableAdaptation: config.enableAdaptation ?? true,
      syncToCloud: config.syncToCloud ?? false,
      cloudEndpoint: config.cloudEndpoint,
    };

    this.state = {
      patterns: [],
      knowledge: [],
      feedback: [],
      metrics: [],
      adaptations: [],
      version: 1,
      lastUpdated: Date.now(),
    };
  }

  // ============== FEEDBACK ==============

  async addFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<Feedback> {
    const entry: Feedback = {
      ...feedback,
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.state.feedback.push(entry);
    this.trimArray(this.state.feedback);
    
    // Learn from feedback
    await this.processImmediate(entry);
    
    this.markDirty();
    return entry;
  }

  async processFeedback(feedbackId: string): Promise<void> {
    const feedback = this.state.feedback.find(f => f.id === feedbackId);
    if (!feedback) return;

    // Update patterns based on feedback
    if (feedback.type === 'positive') {
      this.reinforcePattern(feedback.context.action, feedback.tags);
    } else if (feedback.type === 'negative') {
      this.weakenPattern(feedback.context.action, feedback.tags);
    } else if (feedback.type === 'correction' && feedback.correction) {
      this.learnCorrection(feedback.context.action, feedback.correction, feedback.tags);
    }
  }

  private async processImmediate(feedback: Feedback): Promise<void> {
    // Quick learning from feedback
    if (feedback.type === 'correction' && feedback.correction) {
      // Store as knowledge
      await this.addKnowledge({
        category: 'correction',
        content: `When doing "${feedback.context.action}", prefer: ${feedback.correction}`,
        source: 'user_feedback',
        confidence: 0.9,
        relatedIds: [],
      });
    }
  }

  // ============== PATTERNS ==============

  async recognizePattern(context: {
    task: string;
    actions: string[];
    outcome: 'success' | 'failure';
  }): Promise<Pattern | null> {
    if (!this.config.enablePatternRecognition) return null;

    // Look for existing pattern
    const existingPattern = this.findMatchingPattern(context.task, context.actions);
    
    if (existingPattern) {
      // Update existing pattern
      existingPattern.usageCount++;
      existingPattern.lastUsed = Date.now();
      
      if (context.outcome === 'success') {
        existingPattern.successRate = 
          existingPattern.successRate * 0.9 + 0.1;
        existingPattern.confidence = Math.min(1, existingPattern.confidence + 0.05);
      } else {
        existingPattern.successRate = 
          existingPattern.successRate * 0.9;
        existingPattern.confidence = Math.max(0, existingPattern.confidence - 0.1);
      }
      
      this.markDirty();
      return existingPattern;
    }

    // Create new pattern if successful
    if (context.outcome === 'success' && context.actions.length > 1) {
      const pattern: Pattern = {
        id: `pat-${Date.now()}`,
        name: `Pattern for: ${context.task.substring(0, 50)}`,
        description: `Actions: ${context.actions.join(' -> ')}`,
        triggers: this.extractTriggers(context.task),
        actions: context.actions,
        successRate: 1.0,
        usageCount: 1,
        lastUsed: Date.now(),
        confidence: 0.5,
      };
      
      this.state.patterns.push(pattern);
      this.trimArray(this.state.patterns, 500);
      this.markDirty();
      
      return pattern;
    }

    return null;
  }

  private findMatchingPattern(task: string, actions: string[]): Pattern | null {
    const taskLower = task.toLowerCase();
    
    return this.state.patterns.find(p => {
      // Check if triggers match
      const triggerMatch = p.triggers.some(t => taskLower.includes(t.toLowerCase()));
      
      // Check if actions are similar
      const actionMatch = p.actions.length === actions.length &&
        p.actions.every((a, i) => a === actions[i]);
      
      return triggerMatch || actionMatch;
    }) || null;
  }

  private extractTriggers(task: string): string[] {
    // Extract key phrases
    const triggers: string[] = [];
    const words = task.toLowerCase().split(/\s+/);
    
    // Look for action words
    const actionWords = ['create', 'build', 'fix', 'update', 'delete', 'add', 'remove', 'implement', 'refactor'];
    for (const word of words) {
      if (actionWords.includes(word)) {
        triggers.push(word);
      }
    }
    
    // Add noun phrases (simplified)
    const nounPatterns = /(component|function|api|database|test|style|page|route)/gi;
    const matches = task.match(nounPatterns);
    if (matches) {
      triggers.push(...matches.map(m => m.toLowerCase()));
    }
    
    return [...new Set(triggers)];
  }

  private reinforcePattern(action: string, tags: string[]): void {
    const patterns = this.state.patterns.filter(p => 
      p.actions.includes(action) || tags.some(t => p.triggers.includes(t))
    );
    
    for (const pattern of patterns) {
      pattern.confidence = Math.min(1, pattern.confidence + this.config.learningRate);
      pattern.successRate = Math.min(1, pattern.successRate + 0.05);
    }
  }

  private weakenPattern(action: string, tags: string[]): void {
    const patterns = this.state.patterns.filter(p => 
      p.actions.includes(action) || tags.some(t => p.triggers.includes(t))
    );
    
    for (const pattern of patterns) {
      pattern.confidence = Math.max(0, pattern.confidence - this.config.learningRate * 2);
      pattern.successRate = Math.max(0, pattern.successRate - 0.1);
    }
  }

  private learnCorrection(wrongAction: string, correctAction: string, tags: string[]): void {
    // Find patterns with wrong action and add correction
    const patterns = this.state.patterns.filter(p => p.actions.includes(wrongAction));
    
    for (const pattern of patterns) {
      const idx = pattern.actions.indexOf(wrongAction);
      if (idx !== -1) {
        pattern.actions[idx] = correctAction;
        pattern.confidence = 0.7; // Reset confidence for corrected pattern
      }
    }
  }

  suggestPattern(task: string): Pattern | null {
    const taskLower = task.toLowerCase();
    
    // Find best matching pattern
    const matches = this.state.patterns
      .filter(p => p.confidence > 0.5 && p.successRate > 0.7)
      .map(p => ({
        pattern: p,
        score: p.triggers.filter(t => taskLower.includes(t)).length * p.confidence * p.successRate,
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    return matches[0]?.pattern || null;
  }

  // ============== KNOWLEDGE ==============

  async addKnowledge(knowledge: Omit<Knowledge, 'id' | 'timestamp' | 'usageCount'>): Promise<Knowledge> {
    const entry: Knowledge = {
      ...knowledge,
      id: `know-${Date.now()}`,
      timestamp: Date.now(),
      usageCount: 0,
    };

    // Check for duplicates
    const existing = this.state.knowledge.find(k => 
      k.category === entry.category && k.content === entry.content
    );
    
    if (existing) {
      existing.confidence = Math.max(existing.confidence, entry.confidence);
      existing.usageCount++;
      this.markDirty();
      return existing;
    }

    this.state.knowledge.push(entry);
    this.trimArray(this.state.knowledge, 1000);
    this.markDirty();
    
    return entry;
  }

  queryKnowledge(query: string, category?: string): Knowledge[] {
    const queryLower = query.toLowerCase();
    
    return this.state.knowledge
      .filter(k => {
        if (category && k.category !== category) return false;
        return k.content.toLowerCase().includes(queryLower);
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  useKnowledge(knowledgeId: string): void {
    const knowledge = this.state.knowledge.find(k => k.id === knowledgeId);
    if (knowledge) {
      knowledge.usageCount++;
      this.markDirty();
    }
  }

  // ============== METRICS ==============

  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.state.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });
    
    this.trimArray(this.state.metrics, 5000);
    this.markDirty();
  }

  getPerformanceStats(taskType?: string, timeRange?: number): {
    avgDuration: number;
    successRate: number;
    avgTokens: number;
    avgRetries: number;
    trend: 'improving' | 'stable' | 'declining';
  } {
    let metrics = this.state.metrics;
    
    if (taskType) {
      metrics = metrics.filter(m => m.taskType === taskType);
    }
    
    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      metrics = metrics.filter(m => m.timestamp > cutoff);
    }

    if (metrics.length === 0) {
      return {
        avgDuration: 0,
        successRate: 0,
        avgTokens: 0,
        avgRetries: 0,
        trend: 'stable',
      };
    }

    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    const successRate = metrics.filter(m => m.success).length / metrics.length;
    const avgTokens = metrics.reduce((sum, m) => sum + m.tokensUsed, 0) / metrics.length;
    const avgRetries = metrics.reduce((sum, m) => sum + m.retries, 0) / metrics.length;

    // Calculate trend
    const half = Math.floor(metrics.length / 2);
    const firstHalfSuccess = metrics.slice(0, half).filter(m => m.success).length / half;
    const secondHalfSuccess = metrics.slice(half).filter(m => m.success).length / (metrics.length - half);
    
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (secondHalfSuccess > firstHalfSuccess + 0.1) trend = 'improving';
    else if (secondHalfSuccess < firstHalfSuccess - 0.1) trend = 'declining';

    return { avgDuration, successRate, avgTokens, avgRetries, trend };
  }

  // ============== ADAPTATION ==============

  async adapt(trigger: string, observation: string): Promise<Adaptation | null> {
    if (!this.config.enableAdaptation) return null;

    // Check if we should adapt
    const recentFeedback = this.state.feedback
      .filter(f => f.timestamp > Date.now() - 24 * 60 * 60 * 1000)
      .filter(f => f.type === 'negative' || f.type === 'correction');

    if (recentFeedback.length < 3) return null;

    // Analyze feedback for patterns
    const commonTags = this.findCommonTags(recentFeedback);
    
    if (commonTags.length === 0) return null;

    const adaptation: Adaptation = {
      id: `adapt-${Date.now()}`,
      type: 'behavior',
      description: `Adapting behavior based on ${recentFeedback.length} feedback items`,
      trigger,
      change: `Avoid ${commonTags.join(', ')} related issues`,
      effectiveness: 0,
      timestamp: Date.now(),
    };

    this.state.adaptations.push(adaptation);
    this.trimArray(this.state.adaptations, 100);
    this.markDirty();

    return adaptation;
  }

  private findCommonTags(feedback: Feedback[]): string[] {
    const tagCounts: Record<string, number> = {};
    
    for (const fb of feedback) {
      for (const tag of fb.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  }

  getAdaptations(): Adaptation[] {
    return this.state.adaptations.filter(a => a.effectiveness >= 0);
  }

  updateAdaptationEffectiveness(adaptationId: string, effective: boolean): void {
    const adaptation = this.state.adaptations.find(a => a.id === adaptationId);
    if (adaptation) {
      adaptation.effectiveness += effective ? 0.1 : -0.2;
      this.markDirty();
    }
  }

  // ============== INSIGHTS ==============

  generateInsights(): LearningInsight[] {
    const insights: LearningInsight[] = [];

    // Performance trend insight
    const stats = this.getPerformanceStats();
    if (stats.trend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Performance Declining',
        description: `Success rate has dropped. Recent: ${(stats.successRate * 100).toFixed(1)}%`,
        data: stats,
        actionable: true,
        action: 'Review recent feedback and adapt strategies',
      });
    } else if (stats.trend === 'improving') {
      insights.push({
        type: 'improvement',
        title: 'Performance Improving',
        description: `Success rate trending up: ${(stats.successRate * 100).toFixed(1)}%`,
        data: stats,
        actionable: false,
      });
    }

    // High-confidence patterns
    const topPatterns = this.state.patterns
      .filter(p => p.confidence > 0.8 && p.usageCount > 5)
      .slice(0, 3);
    
    if (topPatterns.length > 0) {
      insights.push({
        type: 'suggestion',
        title: 'Reliable Patterns Available',
        description: `${topPatterns.length} high-confidence patterns can be reused`,
        data: topPatterns,
        actionable: true,
        action: 'Consider applying these patterns to similar tasks',
      });
    }

    // Negative feedback patterns
    const negativeFeedback = this.state.feedback.filter(f => f.type === 'negative');
    if (negativeFeedback.length > 5) {
      const commonIssues = this.findCommonTags(negativeFeedback);
      if (commonIssues.length > 0) {
        insights.push({
          type: 'warning',
          title: 'Common Issues Detected',
          description: `Frequent issues with: ${commonIssues.join(', ')}`,
          data: { issues: commonIssues, count: negativeFeedback.length },
          actionable: true,
          action: 'Focus on improving these areas',
        });
      }
    }

    return insights;
  }

  // ============== PERSISTENCE ==============

  async save(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      await fs.mkdir(this.config.storePath, { recursive: true });
      
      const data = JSON.stringify(this.state, null, 2);
      await fs.writeFile(
        path.join(this.config.storePath, 'learning-state.json'),
        data,
        'utf-8'
      );
      
      this.isDirty = false;
      this.state.lastUpdated = Date.now();
      
      // Sync to cloud if enabled
      if (this.config.syncToCloud && this.config.cloudEndpoint) {
        await this.syncToCloud();
      }
    } catch (error) {
      console.error('Failed to save learning state:', error);
    }
  }

  async load(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const data = await fs.readFile(
        path.join(this.config.storePath, 'learning-state.json'),
        'utf-8'
      );
      
      this.state = JSON.parse(data);
    } catch (error) {
      // No existing state, start fresh
      console.log('No existing learning state, starting fresh');
    }
  }

  private async syncToCloud(): Promise<void> {
    if (!this.config.cloudEndpoint) return;
    
    try {
      await fetch(this.config.cloudEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state),
      });
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  }

  private markDirty(): void {
    this.isDirty = true;
    
    // Auto-save after delay
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    
    this.saveTimer = setTimeout(() => {
      if (this.isDirty) {
        this.save();
      }
    }, 5000);
  }

  private trimArray<T>(arr: T[], maxSize: number = this.config.maxMemorySize): void {
    if (arr.length > maxSize) {
      arr.splice(0, arr.length - maxSize);
    }
  }

  // ============== EXPORT/IMPORT ==============

  exportState(): LearningState {
    return JSON.parse(JSON.stringify(this.state));
  }

  importState(state: LearningState): void {
    this.state = state;
    this.markDirty();
  }

  reset(): void {
    this.state = {
      patterns: [],
      knowledge: [],
      feedback: [],
      metrics: [],
      adaptations: [],
      version: 1,
      lastUpdated: Date.now(),
    };
    this.markDirty();
  }

  getStats(): {
    patterns: number;
    knowledge: number;
    feedback: number;
    metrics: number;
    adaptations: number;
  } {
    return {
      patterns: this.state.patterns.length,
      knowledge: this.state.knowledge.length,
      feedback: this.state.feedback.length,
      metrics: this.state.metrics.length,
      adaptations: this.state.adaptations.length,
    };
  }
}

// ============== FACTORY ==============

export function createLearningSystem(config?: Partial<LearningConfig>): LearningSystem {
  return new LearningSystem(config);
}

// ============== DEFAULT INSTANCE ==============

let defaultSystem: LearningSystem | null = null;

export async function getLearningSystem(config?: Partial<LearningConfig>): Promise<LearningSystem> {
  if (!defaultSystem) {
    defaultSystem = createLearningSystem(config);
    await defaultSystem.load();
  }
  return defaultSystem;
}
