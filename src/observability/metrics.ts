// ============== METRICS COLLECTOR ==============
// Performance and usage metrics tracking

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

interface MetricsConfig {
  enabled: boolean;
  flushInterval: number;
  maxMetrics: number;
  remoteEndpoint?: string;
}

class MetricsCollector {
  private config: MetricsConfig = {
    enabled: true,
    flushInterval: 60000, // 1 minute
    maxMetrics: 10000,
  };
  
  private metrics: Metric[] = [];
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
  }

  configure(config: Partial<MetricsConfig>): void {
    this.config = { ...this.config, ...config };
    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    if (this.config.enabled && this.config.remoteEndpoint) {
      this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  // Counter: monotonically increasing value
  increment(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    if (!this.config.enabled) return;
    
    const key = this.getKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.record(name, current + value, 'count', tags);
  }

  // Gauge: point-in-time value
  gauge(name: string, value: number, tags: Record<string, string> = {}): void {
    if (!this.config.enabled) return;
    
    const key = this.getKey(name, tags);
    this.gauges.set(key, value);
    
    this.record(name, value, 'gauge', tags);
  }

  // Histogram: distribution of values
  histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    if (!this.config.enabled) return;
    
    const key = this.getKey(name, tags);
    const values = this.histograms.get(key) || [];
    values.push(value);
    
    // Keep last 1000 values per histogram
    if (values.length > 1000) {
      values.shift();
    }
    
    this.histograms.set(key, values);
    this.record(name, value, 'histogram', tags);
  }

  // Timing helper
  timing(name: string, durationMs: number, tags: Record<string, string> = {}): void {
    this.histogram(name, durationMs, { ...tags, unit: 'ms' });
  }

  // Timer helper - returns a function to call when done
  startTimer(name: string, tags: Record<string, string> = {}): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.timing(name, duration, tags);
    };
  }

  private record(name: string, value: number, unit: string, tags: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    };
    
    this.metrics.push(metric);
    
    // Trim if exceeds max
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }
  }

  private getKey(name: string, tags: Record<string, string>): string {
    const tagStr = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}|${tagStr}`;
  }

  getSummary(name: string, tags?: Record<string, string>): MetricSummary | null {
    const key = tags ? this.getKey(name, tags) : name;
    const values = this.histograms.get(key);
    
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      name,
      count: values.length,
      sum,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getCounter(name: string, tags?: Record<string, string>): number {
    const key = tags ? this.getKey(name, tags) : name;
    return this.counters.get(key) || 0;
  }

  getGauge(name: string, tags?: Record<string, string>): number | undefined {
    const key = tags ? this.getKey(name, tags) : name;
    return this.gauges.get(key);
  }

  getRecent(limit: number = 100): Metric[] {
    return this.metrics.slice(-limit);
  }

  async flush(): Promise<void> {
    if (!this.config.remoteEndpoint || this.metrics.length === 0) return;
    
    const batch = [...this.metrics];
    this.metrics = [];
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: batch }),
      });
    } catch (err) {
      console.error('Failed to flush metrics:', err);
      // Re-add metrics on failure
      this.metrics = [...batch, ...this.metrics].slice(-this.config.maxMetrics);
    }
  }

  reset(): void {
    this.metrics = [];
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Common metric names
export const METRIC_NAMES = {
  // API metrics
  API_REQUEST_DURATION: 'api.request.duration',
  API_REQUEST_COUNT: 'api.request.count',
  API_ERROR_COUNT: 'api.error.count',
  
  // Agent metrics
  AGENT_EXECUTION_DURATION: 'agent.execution.duration',
  AGENT_TOKEN_USAGE: 'agent.token.usage',
  AGENT_COST: 'agent.cost',
  
  // UI metrics
  UI_RENDER_TIME: 'ui.render.time',
  UI_INTERACTION_COUNT: 'ui.interaction.count',
  
  // System metrics
  MEMORY_USAGE: 'system.memory.usage',
  ACTIVE_CONNECTIONS: 'system.connections.active',
} as const;

export default metrics;
