// ============== API CACHE ==============
// Intelligent API caching with TTL, invalidation, and persistence

interface CacheOptions {
  ttl: number;
  staleWhileRevalidate?: boolean;
  persist?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
}

class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private subscribers = new Map<string, Set<(data: unknown) => void>>();
  private storageKey = 'resonant-api-cache';

  constructor() {
    this.loadFromStorage();
    this.startCleanupInterval();
  }

  // Get cached data
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cache data
  set<T>(key: string, data: T, options: CacheOptions): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
    };

    this.cache.set(key, entry);
    this.notifySubscribers(key, data);

    if (options.persist) {
      this.saveToStorage();
    }
  }

  // Fetch with cache
  async fetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = { ttl: 30000 }
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      // Stale-while-revalidate
      if (options.staleWhileRevalidate && this.isStale(key)) {
        this.revalidate(key, fetcher, options);
      }
      return cached;
    }

    // Check pending request
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Make request
    const promise = fetcher().then(data => {
      this.set(key, data, options);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Invalidate cache
  invalidate(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  // Invalidate by pattern
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  // Subscribe to cache updates
  subscribe(key: string, callback: (data: unknown) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    localStorage.removeItem(this.storageKey);
  }

  // Get cache stats
  getStats(): { size: number; keys: string[]; memory: number } {
    const keys = Array.from(this.cache.keys());
    const memory = JSON.stringify(Array.from(this.cache.entries())).length;
    
    return {
      size: this.cache.size,
      keys,
      memory,
    };
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    // Consider stale after 80% of TTL
    return Date.now() - entry.timestamp > entry.ttl * 0.8;
  }

  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data, options);
    } catch {
      // Keep stale data on revalidation failure
    }
  }

  private notifySubscribers(key: string, data: unknown): void {
    this.subscribers.get(key)?.forEach(cb => cb(data));
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const entries = JSON.parse(stored) as [string, CacheEntry<unknown>][];
        for (const [key, entry] of entries) {
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          }
        }
      }
    } catch {
      // Storage not available or corrupted
    }
  }

  private saveToStorage(): void {
    try {
      const entries = Array.from(this.cache.entries()).filter(
        ([, entry]) => !this.isExpired(entry)
      );
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
    } catch {
      // Storage not available
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }
}

export const apiCache = new APICache();

// ============== CACHE DECORATORS ==============

// Cache key generators
export function createCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  if (!params) return endpoint;
  const sortedParams = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  return `${endpoint}?${sortedParams}`;
}

// Cached fetch wrapper
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  cacheOptions: CacheOptions = { ttl: 30000 }
): Promise<T> {
  const key = createCacheKey(url, options?.body ? JSON.parse(options.body as string) : undefined);
  
  return apiCache.fetch(key, async () => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }, cacheOptions);
}

// ============== COMMON CACHE CONFIGURATIONS ==============
export const CACHE_CONFIGS = {
  // Short-lived cache for frequently changing data
  SHORT: { ttl: 5000, staleWhileRevalidate: true },
  
  // Medium cache for semi-static data
  MEDIUM: { ttl: 60000, staleWhileRevalidate: true },
  
  // Long cache for rarely changing data
  LONG: { ttl: 300000, staleWhileRevalidate: true, persist: true },
  
  // Permanent cache until invalidation
  PERMANENT: { ttl: 86400000, persist: true },
};

// ============== PREFETCH UTILITIES ==============
export function prefetchAPI(url: string, options?: RequestInit): void {
  const key = createCacheKey(url);
  
  if (!apiCache.get(key)) {
    fetch(url, options)
      .then(res => res.json())
      .then(data => apiCache.set(key, data, CACHE_CONFIGS.MEDIUM))
      .catch(() => {}); // Silently fail prefetch
  }
}

export function prefetchMultiple(urls: string[]): void {
  urls.forEach(url => prefetchAPI(url));
}
