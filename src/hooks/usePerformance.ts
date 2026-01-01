// ============== PERFORMANCE HOOKS ==============
// Advanced performance optimization hooks for the IDE

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============== REQUEST CACHE ==============
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const requestCache = new Map<string, CacheEntry<unknown>>();

export function useCachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 30000
): { data: T | null; loading: boolean; error: Error | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const cached = requestCache.get(key) as CacheEntry<T> | undefined;
    
    if (!force && cached && Date.now() - cached.timestamp < cached.ttl) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      requestCache.set(key, { data: result, timestamp: Date.now(), ttl });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Request failed'));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
}

// ============== DEBOUNCED VALUE ==============
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ============== THROTTLED CALLBACK ==============
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 100
): T {
  const lastRan = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastRan.current >= delay) {
      lastRan.current = now;
      callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastRan.current = Date.now();
        callback(...args);
      }, delay - (now - lastRan.current));
    }
  }, [callback, delay]) as T;
}

// ============== INTERSECTION OBSERVER ==============
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return [elementRef as React.RefObject<HTMLElement>, isVisible];
}

// ============== VIRTUAL LIST ==============
interface VirtualListResult<T> {
  visibleItems: T[];
  totalHeight: number;
  offsetY: number;
  containerProps: {
    onScroll: (e: React.UIEvent<HTMLElement>) => void;
    style: React.CSSProperties;
  };
  wrapperProps: {
    style: React.CSSProperties;
  };
}

export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
): VirtualListResult<T> {
  const [scrollTop, setScrollTop] = useState(0);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      visibleItems: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    containerProps: {
      onScroll: handleScroll,
      style: { height: containerHeight, overflow: 'auto' },
    },
    wrapperProps: {
      style: { height: totalHeight, position: 'relative' as const },
    },
  };
}

// ============== PERFORMANCE METRICS ==============
interface PerformanceMetrics {
  fps: number;
  memory: number | null;
  renderTime: number;
  longTasks: number;
}

export function usePerformanceMetrics(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    renderTime: 0,
    longTasks: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;
    let longTaskCount = 0;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || null;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memory: memory ? Math.round(memory / 1024 / 1024) : null,
          longTasks: longTaskCount,
        }));

        frameCount = 0;
        lastTime = now;
        longTaskCount = 0;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              longTaskCount++;
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Long task observation not supported
      }
    }

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

// ============== LAZY INITIALIZATION ==============
export function useLazyInit<T>(initializer: () => T): T {
  const ref = useRef<{ value: T; initialized: boolean }>({
    value: undefined as unknown as T,
    initialized: false,
  });

  if (!ref.current.initialized) {
    ref.current.value = initializer();
    ref.current.initialized = true;
  }

  return ref.current.value;
}

// ============== OPTIMISTIC UPDATE ==============
export function useOptimisticUpdate<T>(
  initialValue: T,
  updateFn: (value: T) => Promise<T>
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);
  const previousValue = useRef(initialValue);

  const optimisticUpdate = useCallback(async (newValue: T) => {
    previousValue.current = value;
    setValue(newValue);
    setIsPending(true);

    try {
      const result = await updateFn(newValue);
      setValue(result);
    } catch {
      setValue(previousValue.current);
    } finally {
      setIsPending(false);
    }
  }, [value, updateFn]);

  return [value, optimisticUpdate, isPending];
}

// ============== REQUEST DEDUPLICATION ==============
const pendingRequests = new Map<string, Promise<unknown>>();

export async function deduplicatedRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ============== BATCH UPDATES ==============
type BatchCallback = () => void;
let batchQueue: BatchCallback[] = [];
let batchScheduled = false;

export function batchUpdates(callback: BatchCallback): void {
  batchQueue.push(callback);

  if (!batchScheduled) {
    batchScheduled = true;
    requestAnimationFrame(() => {
      const callbacks = batchQueue;
      batchQueue = [];
      batchScheduled = false;
      callbacks.forEach(cb => cb());
    });
  }
}

// ============== PRELOAD RESOURCES ==============
export function preloadResource(url: string, type: 'script' | 'style' | 'image' | 'fetch'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
    case 'fetch':
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      break;
  }

  document.head.appendChild(link);
}

// ============== IDLE CALLBACK ==============
export function useIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {}
): void {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(callback, options);
      return () => window.cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 1);
      return () => clearTimeout(id);
    }
  }, [callback, options]);
}

// ============== MEMORY CLEANUP ==============
export function clearRequestCache(): void {
  requestCache.clear();
}

export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      requestCache.delete(key);
    }
  }
}
