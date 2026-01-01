// ============== PERFORMANCE UTILITIES ==============
// Tools for monitoring and optimizing React performance

import { useCallback, useRef, useEffect, useMemo } from 'react';

// ============== DEBOUNCE & THROTTLE ==============

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============== HOOKS ==============

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useState } from 'react';

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay) as T,
    [delay, ...deps]
  );
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit) as T,
    [limit, ...deps]
  );
}

// ============== INTERSECTION OBSERVER ==============

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold]);

  return [ref, isVisible];
}

// ============== LAZY LOADING ==============

export function useLazyLoad<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

// ============== VIRTUAL LIST ==============

interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): {
  virtualItems: { index: number; item: T; style: React.CSSProperties }[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
} {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = throttle(() => {
      setScrollTop(container.scrollTop);
    }, 16);

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      });
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  return { virtualItems, totalHeight, containerRef };
}

// ============== MEMOIZATION ==============

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// ============== PERFORMANCE MONITORING ==============

interface PerformanceMark {
  name: string;
  startTime: number;
  duration?: number;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private enabled: boolean = process.env.NODE_ENV === 'development';

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  start(name: string) {
    if (!this.enabled) return;
    this.marks.set(name, { name, startTime: performance.now() });
  }

  end(name: string): number | null {
    if (!this.enabled) return null;
    const mark = this.marks.get(name);
    if (!mark) return null;

    const duration = performance.now() - mark.startTime;
    mark.duration = duration;

    if (duration > 16) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measure(name: string, fn: () => void) {
    this.start(name);
    fn();
    return this.end(name);
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  getReport(): { name: string; duration: number }[] {
    return Array.from(this.marks.values())
      .filter((m) => m.duration !== undefined)
      .map((m) => ({ name: m.name, duration: m.duration! }))
      .sort((a, b) => b.duration - a.duration);
  }

  clear() {
    this.marks.clear();
  }
}

export const perfMonitor = new PerformanceMonitor();

// ============== RENDER COUNTING (DEV ONLY) ==============

export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  renderCount.current += 1;

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${componentName} rendered: ${renderCount.current} times`);
  }

  return renderCount.current;
}

// ============== PREVIOUS VALUE ==============

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// ============== STABLE CALLBACK ==============

export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}

// ============== BATCH UPDATES ==============

export function batchUpdates<T>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => void,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    const processBatch = () => {
      const batch = items.slice(index, index + batchSize);
      if (batch.length === 0) {
        resolve();
        return;
      }

      processFn(batch);
      index += batchSize;

      if (delay > 0) {
        setTimeout(processBatch, delay);
      } else {
        requestAnimationFrame(processBatch);
      }
    };

    processBatch();
  });
}

// ============== RAF SCHEDULER ==============

type Task = () => void;

class RAFScheduler {
  private queue: Task[] = [];
  private isRunning = false;

  schedule(task: Task) {
    this.queue.push(task);
    if (!this.isRunning) {
      this.isRunning = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    const tasks = this.queue;
    this.queue = [];
    this.isRunning = false;

    for (const task of tasks) {
      task();
    }
  }
}

export const rafScheduler = new RAFScheduler();

// ============== IDLE CALLBACK ==============

export function runWhenIdle(callback: () => void, timeout: number = 5000) {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

export function useIdleCallback(callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    let id: number;

    if ('requestIdleCallback' in window) {
      id = (window as any).requestIdleCallback(callback);
    } else {
      id = (window as any).setTimeout(callback, 1) as number;
    }

    return () => {
      if ('cancelIdleCallback' in window) {
        (window as any).cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, deps);
}
