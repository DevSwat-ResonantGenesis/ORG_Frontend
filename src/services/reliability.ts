// ============== RELIABILITY SERVICE ==============
// Circuit breakers, retries, transactions, and fault tolerance

// ============== TYPES ==============
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitorInterval: number;
}

export interface CircuitBreakerState {
  name: string;
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface Transaction {
  id: string;
  operations: TransactionOperation[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  startedAt: number;
  completedAt?: number;
}

export interface TransactionOperation {
  id: string;
  type: string;
  execute: () => Promise<unknown>;
  rollback: () => Promise<void>;
  result?: unknown;
  error?: string;
  status: 'pending' | 'executed' | 'rolled_back' | 'failed';
}

export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  interval: number;
  timeout: number;
  lastCheck?: number;
  healthy: boolean;
}

// ============== CIRCUIT BREAKER ==============
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailure: number | null = null;
  private lastSuccess: number | null = null;
  private halfOpenSuccesses = 0;

  constructor(
    public readonly name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitorInterval: 5000,
    }
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailure || 0) > this.config.recoveryTimeout) {
        this.state = 'half-open';
        this.halfOpenSuccesses = 0;
      } else {
        throw new Error(`Circuit breaker "${this.name}" is open`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.successes++;
    this.lastSuccess = Date.now();

    if (this.state === 'half-open') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= 3) {
        this.state = 'closed';
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();

    if (this.state === 'half-open') {
      this.state = 'open';
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitBreakerState {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.halfOpenSuccesses = 0;
  }
}

// ============== RETRY UTILITY ==============
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.baseDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (config.retryableErrors?.length) {
        const isRetryable = config.retryableErrors.some(e => 
          lastError!.message.includes(e)
        );
        if (!isRetryable) throw lastError;
      }

      if (attempt < config.maxRetries) {
        await sleep(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============== TRANSACTION MANAGER ==============
class TransactionManager {
  private transactions = new Map<string, Transaction>();

  async begin(): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.generateId(),
      operations: [],
      status: 'pending',
      startedAt: Date.now(),
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  addOperation(
    transactionId: string,
    type: string,
    execute: () => Promise<unknown>,
    rollback: () => Promise<void>
  ): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error(`Transaction not found: ${transactionId}`);
    if (transaction.status !== 'pending') {
      throw new Error(`Transaction ${transactionId} is not pending`);
    }

    transaction.operations.push({
      id: this.generateId(),
      type,
      execute,
      rollback,
      status: 'pending',
    });
  }

  async commit(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error(`Transaction not found: ${transactionId}`);
    if (transaction.status !== 'pending') {
      throw new Error(`Transaction ${transactionId} is not pending`);
    }

    const executedOps: TransactionOperation[] = [];

    try {
      for (const op of transaction.operations) {
        op.result = await op.execute();
        op.status = 'executed';
        executedOps.push(op);
      }

      transaction.status = 'committed';
      transaction.completedAt = Date.now();
    } catch (error) {
      // Rollback executed operations in reverse order
      for (const op of executedOps.reverse()) {
        try {
          await op.rollback();
          op.status = 'rolled_back';
        } catch (rollbackError) {
          op.status = 'failed';
          op.error = rollbackError instanceof Error ? rollbackError.message : 'Rollback failed';
        }
      }

      transaction.status = 'rolled_back';
      transaction.completedAt = Date.now();
      throw error;
    }
  }

  async rollback(transactionId: string): Promise<void> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error(`Transaction not found: ${transactionId}`);

    const executedOps = transaction.operations.filter(op => op.status === 'executed');

    for (const op of executedOps.reverse()) {
      try {
        await op.rollback();
        op.status = 'rolled_back';
      } catch (error) {
        op.status = 'failed';
        op.error = error instanceof Error ? error.message : 'Rollback failed';
      }
    }

    transaction.status = 'rolled_back';
    transaction.completedAt = Date.now();
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactions.get(id);
  }

  private generateId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== HEALTH MONITOR ==============
class HealthMonitor {
  private checks = new Map<string, HealthCheck>();
  private intervals = new Map<string, NodeJS.Timeout>();

  register(
    name: string,
    check: () => Promise<boolean>,
    interval: number = 30000,
    timeout: number = 5000
  ): void {
    const healthCheck: HealthCheck = {
      name,
      check,
      interval,
      timeout,
      healthy: true,
    };

    this.checks.set(name, healthCheck);
    this.startMonitoring(name);
  }

  unregister(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
    this.checks.delete(name);
  }

  private startMonitoring(name: string): void {
    const healthCheck = this.checks.get(name);
    if (!healthCheck) return;

    const runCheck = async () => {
      try {
        const timeoutPromise = new Promise<boolean>((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout);
        });

        healthCheck.healthy = await Promise.race([
          healthCheck.check(),
          timeoutPromise,
        ]);
      } catch {
        healthCheck.healthy = false;
      }
      healthCheck.lastCheck = Date.now();
    };

    // Run initial check
    runCheck();

    // Set up interval
    const interval = setInterval(runCheck, healthCheck.interval);
    this.intervals.set(name, interval);
  }

  async checkAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, check] of this.checks) {
      try {
        results[name] = await check.check();
        check.healthy = results[name];
      } catch {
        results[name] = false;
        check.healthy = false;
      }
      check.lastCheck = Date.now();
    }

    return results;
  }

  getStatus(): Record<string, { healthy: boolean; lastCheck?: number }> {
    const status: Record<string, { healthy: boolean; lastCheck?: number }> = {};

    for (const [name, check] of this.checks) {
      status[name] = {
        healthy: check.healthy,
        lastCheck: check.lastCheck,
      };
    }

    return status;
  }

  isHealthy(name: string): boolean {
    return this.checks.get(name)?.healthy ?? false;
  }

  isAllHealthy(): boolean {
    for (const check of this.checks.values()) {
      if (!check.healthy) return false;
    }
    return true;
  }

  stopAll(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
  }
}

// ============== RELIABILITY SERVICE ==============
class ReliabilityService {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private transactionManager = new TransactionManager();
  private healthMonitor = new HealthMonitor();
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  };

  // Circuit breaker methods
  getCircuitBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, config));
    }
    return this.circuitBreakers.get(name)!;
  }

  async withCircuitBreaker<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.getCircuitBreaker(name);
    return breaker.execute(fn);
  }

  getCircuitBreakerStates(): CircuitBreakerState[] {
    return Array.from(this.circuitBreakers.values()).map(cb => cb.getState());
  }

  resetCircuitBreaker(name: string): void {
    this.circuitBreakers.get(name)?.reset();
  }

  // Retry methods
  async withRetry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T> {
    return withRetry(fn, { ...this.defaultRetryConfig, ...config });
  }

  setDefaultRetryConfig(config: Partial<RetryConfig>): void {
    this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
  }

  // Transaction methods
  async beginTransaction(): Promise<Transaction> {
    return this.transactionManager.begin();
  }

  addTransactionOperation(
    transactionId: string,
    type: string,
    execute: () => Promise<unknown>,
    rollback: () => Promise<void>
  ): void {
    this.transactionManager.addOperation(transactionId, type, execute, rollback);
  }

  async commitTransaction(transactionId: string): Promise<void> {
    return this.transactionManager.commit(transactionId);
  }

  async rollbackTransaction(transactionId: string): Promise<void> {
    return this.transactionManager.rollback(transactionId);
  }

  getTransaction(id: string): Transaction | undefined {
    return this.transactionManager.getTransaction(id);
  }

  // Health monitoring methods
  registerHealthCheck(
    name: string,
    check: () => Promise<boolean>,
    interval?: number
  ): void {
    this.healthMonitor.register(name, check, interval);
  }

  unregisterHealthCheck(name: string): void {
    this.healthMonitor.unregister(name);
  }

  async checkAllHealth(): Promise<Record<string, boolean>> {
    return this.healthMonitor.checkAll();
  }

  getHealthStatus(): Record<string, { healthy: boolean; lastCheck?: number }> {
    return this.healthMonitor.getStatus();
  }

  isServiceHealthy(name: string): boolean {
    return this.healthMonitor.isHealthy(name);
  }

  isAllHealthy(): boolean {
    return this.healthMonitor.isAllHealthy();
  }

  // Combined reliability wrapper
  async executeWithReliability<T>(
    name: string,
    fn: () => Promise<T>,
    options?: {
      useCircuitBreaker?: boolean;
      retryConfig?: Partial<RetryConfig>;
      timeout?: number;
    }
  ): Promise<T> {
    const { useCircuitBreaker = true, retryConfig, timeout } = options || {};

    let operation = fn;

    // Add timeout if specified
    if (timeout) {
      const originalFn = operation;
      operation = () => Promise.race([
        originalFn(),
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        ),
      ]);
    }

    // Add retry
    if (retryConfig) {
      const originalFn = operation;
      operation = () => this.withRetry(originalFn, retryConfig);
    }

    // Add circuit breaker
    if (useCircuitBreaker) {
      return this.withCircuitBreaker(name, operation);
    }

    return operation();
  }

  // Cleanup
  shutdown(): void {
    this.healthMonitor.stopAll();
  }
}

// ============== SINGLETON ==============
export const reliabilityService = new ReliabilityService();

// Initialize default health checks
reliabilityService.registerHealthCheck('gateway', async () => {
  try {
    const response = await fetch('http://localhost:8000/health');
    return response.ok;
  } catch {
    return false;
  }
}, 30000);

reliabilityService.registerHealthCheck('ide-service', async () => {
  try {
    const response = await fetch('http://localhost:8080/health');
    return response.ok;
  } catch {
    return false;
  }
}, 30000);

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useHealth() {
  const [status, setStatus] = useState<Record<string, { healthy: boolean; lastCheck?: number }>>({});
  const [isAllHealthy, setIsAllHealthy] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(reliabilityService.getHealthStatus());
      setIsAllHealthy(reliabilityService.isAllHealthy());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkAll = useCallback(async () => {
    const results = await reliabilityService.checkAllHealth();
    setStatus(reliabilityService.getHealthStatus());
    setIsAllHealthy(reliabilityService.isAllHealthy());
    return results;
  }, []);

  return { status, isAllHealthy, checkAll };
}

export function useCircuitBreaker(name: string) {
  const [state, setState] = useState<CircuitBreakerState | null>(null);

  useEffect(() => {
    const breaker = reliabilityService.getCircuitBreaker(name);
    setState(breaker.getState());

    const interval = setInterval(() => {
      setState(breaker.getState());
    }, 1000);

    return () => clearInterval(interval);
  }, [name]);

  const reset = useCallback(() => {
    reliabilityService.resetCircuitBreaker(name);
    const breaker = reliabilityService.getCircuitBreaker(name);
    setState(breaker.getState());
  }, [name]);

  return { state, reset };
}

export function useTransaction() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const begin = useCallback(async () => {
    const tx = await reliabilityService.beginTransaction();
    setTransaction(tx);
    return tx;
  }, []);

  const addOperation = useCallback((
    type: string,
    execute: () => Promise<unknown>,
    rollback: () => Promise<void>
  ) => {
    if (transaction) {
      reliabilityService.addTransactionOperation(transaction.id, type, execute, rollback);
    }
  }, [transaction]);

  const commit = useCallback(async () => {
    if (!transaction) return;
    setIsProcessing(true);
    try {
      await reliabilityService.commitTransaction(transaction.id);
      setTransaction(reliabilityService.getTransaction(transaction.id) || null);
    } finally {
      setIsProcessing(false);
    }
  }, [transaction]);

  const rollback = useCallback(async () => {
    if (!transaction) return;
    setIsProcessing(true);
    try {
      await reliabilityService.rollbackTransaction(transaction.id);
      setTransaction(reliabilityService.getTransaction(transaction.id) || null);
    } finally {
      setIsProcessing(false);
    }
  }, [transaction]);

  return { transaction, isProcessing, begin, addOperation, commit, rollback };
}

// Export utilities
export { withRetry, CircuitBreaker, TransactionManager, HealthMonitor };
export default reliabilityService;
