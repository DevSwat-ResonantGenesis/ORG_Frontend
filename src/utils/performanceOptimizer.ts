// ============== PERFORMANCE OPTIMIZER ==============
// Advanced performance optimization utilities for the IDE

// ============== REQUEST QUEUE ==============
interface QueuedRequest {
  id: string;
  priority: number;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 6) {
    this.maxConcurrent = maxConcurrent;
  }

  async add<T>(
    execute: () => Promise<T>,
    priority = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        priority,
        execute,
        resolve: resolve as (value: unknown) => void,
        reject,
      };

      this.queue.push(request);
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.running++;

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  clear(): void {
    this.queue = [];
  }

  get pending(): number {
    return this.queue.length;
  }
}

export const requestQueue = new RequestQueue();

// ============== MEMORY POOL ==============
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  get size(): number {
    return this.pool.length;
  }
}

// Array buffer pool for large data operations
export const arrayBufferPool = new ObjectPool<ArrayBuffer>(
  () => new ArrayBuffer(1024 * 1024), // 1MB buffers
  () => {}, // No reset needed
  10
);

// ============== WORKER POOL ==============
class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Array<{
    task: unknown;
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
  }> = [];
  private freeWorkers: Set<Worker> = new Set();

  constructor(workerScript: string, poolSize = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      try {
        const worker = new Worker(workerScript);
        worker.onmessage = (e) => this.handleMessage(worker, e);
        worker.onerror = (e) => this.handleError(worker, e);
        this.workers.push(worker);
        this.freeWorkers.add(worker);
      } catch {
        console.warn('Failed to create worker');
      }
    }
  }

  async execute<T>(task: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve: resolve as (result: unknown) => void, reject });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.taskQueue.length === 0 || this.freeWorkers.size === 0) return;

    const worker = this.freeWorkers.values().next().value;
    if (!worker) return;

    this.freeWorkers.delete(worker);
    const { task } = this.taskQueue.shift()!;
    worker.postMessage(task);
  }

  private handleMessage(worker: Worker, e: MessageEvent): void {
    const pending = this.taskQueue.find(t => !this.freeWorkers.has(worker));
    if (pending) {
      pending.resolve(e.data);
    }
    this.freeWorkers.add(worker);
    this.processQueue();
  }

  private handleError(worker: Worker, e: ErrorEvent): void {
    console.error('Worker error:', e);
    this.freeWorkers.add(worker);
    this.processQueue();
  }

  terminate(): void {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.freeWorkers.clear();
    this.taskQueue = [];
  }
}

// ============== RENDER SCHEDULER ==============
type RenderCallback = () => void;
type Priority = 'immediate' | 'high' | 'normal' | 'low' | 'idle';

class RenderScheduler {
  private queues: Map<Priority, RenderCallback[]> = new Map([
    ['immediate', []],
    ['high', []],
    ['normal', []],
    ['low', []],
    ['idle', []],
  ]);
  private isProcessing = false;

  schedule(callback: RenderCallback, priority: Priority = 'normal'): void {
    this.queues.get(priority)?.push(callback);
    
    if (!this.isProcessing) {
      this.process();
    }
  }

  private process(): void {
    this.isProcessing = true;

    // Process immediate tasks synchronously
    const immediate = this.queues.get('immediate')!;
    while (immediate.length > 0) {
      immediate.shift()!();
    }

    // Process high priority in next frame
    requestAnimationFrame(() => {
      const high = this.queues.get('high')!;
      const batchSize = Math.min(high.length, 10);
      for (let i = 0; i < batchSize; i++) {
        high.shift()!();
      }

      // Process normal priority
      const normal = this.queues.get('normal')!;
      const normalBatch = Math.min(normal.length, 5);
      for (let i = 0; i < normalBatch; i++) {
        normal.shift()!();
      }

      // Process low priority during idle
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback((deadline) => {
          const low = this.queues.get('low')!;
          while (deadline.timeRemaining() > 0 && low.length > 0) {
            low.shift()!();
          }

          const idle = this.queues.get('idle')!;
          while (deadline.timeRemaining() > 0 && idle.length > 0) {
            idle.shift()!();
          }
        });
      }

      // Continue processing if there are more tasks
      if (this.hasPendingTasks()) {
        this.process();
      } else {
        this.isProcessing = false;
      }
    });
  }

  private hasPendingTasks(): boolean {
    for (const queue of this.queues.values()) {
      if (queue.length > 0) return true;
    }
    return false;
  }

  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
  }
}

export const renderScheduler = new RenderScheduler();

// ============== MEMORY MONITOR ==============
interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usage: number;
}

export function getMemoryStats(): MemoryStats | null {
  const perf = performance as unknown as { memory?: MemoryStats };
  if (!perf.memory) return null;

  return {
    usedJSHeapSize: perf.memory.usedJSHeapSize,
    totalJSHeapSize: perf.memory.totalJSHeapSize,
    jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
    usage: perf.memory.usedJSHeapSize / perf.memory.jsHeapSizeLimit,
  };
}

// ============== BUNDLE ANALYZER ==============
interface ModuleInfo {
  name: string;
  size: number;
  loadTime: number;
}

const loadedModules: ModuleInfo[] = [];

export function trackModuleLoad(name: string, size: number, loadTime: number): void {
  loadedModules.push({ name, size, loadTime });
}

export function getModuleStats(): { total: number; avgLoadTime: number; modules: ModuleInfo[] } {
  const total = loadedModules.reduce((sum, m) => sum + m.size, 0);
  const avgLoadTime = loadedModules.length > 0
    ? loadedModules.reduce((sum, m) => sum + m.loadTime, 0) / loadedModules.length
    : 0;

  return { total, avgLoadTime, modules: [...loadedModules] };
}

// ============== NETWORK OPTIMIZATION ==============
export function prefetchUrl(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

export function preconnect(origin: string): void {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  document.head.appendChild(link);
}

export function dnsPrefetch(origin: string): void {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = origin;
  document.head.appendChild(link);
}

// ============== CODE SPLITTING HELPER ==============
export async function lazyLoad<T>(
  loader: () => Promise<{ default: T }>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const module = await loader();
      return module.default;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Failed to load module');
}

// ============== PERFORMANCE MARKS ==============
export function mark(name: string): void {
  performance.mark(name);
}

export function measure(name: string, startMark: string, endMark?: string): PerformanceMeasure | null {
  try {
    if (endMark) {
      return performance.measure(name, startMark, endMark);
    }
    return performance.measure(name, startMark);
  } catch {
    return null;
  }
}

export function clearMarks(): void {
  performance.clearMarks();
  performance.clearMeasures();
}

// ============== FRAME RATE LIMITER ==============
export function createFrameRateLimiter(targetFPS = 60): (callback: () => void) => void {
  const frameTime = 1000 / targetFPS;
  let lastFrameTime = 0;

  return (callback: () => void) => {
    const now = performance.now();
    
    if (now - lastFrameTime >= frameTime) {
      lastFrameTime = now;
      callback();
    }
  };
}

// ============== GC HINT ==============
export function suggestGC(): void {
  // Create and discard large objects to hint GC
  const temp: unknown[] = [];
  for (let i = 0; i < 10000; i++) {
    temp.push({ data: new Array(100) });
  }
  temp.length = 0;
}

// ============== INITIALIZATION ==============
export function initializePerformanceOptimizations(): void {
  // Preconnect to common endpoints
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
  preconnect(apiUrl);
  preconnect(ideUrl);

  // Clear expired caches periodically
  setInterval(() => {
    const stats = getMemoryStats();
    if (stats && stats.usage > 0.8) {
      suggestGC();
    }
  }, 60000);

  console.log('🚀 Performance optimizations initialized');
}
