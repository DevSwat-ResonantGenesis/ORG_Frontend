// ============== LAZY COMPONENT LOADER ==============
// Optimized lazy loading with preload and error boundaries

import { lazy, ComponentType, LazyExoticComponent } from 'react';

interface LazyComponentOptions {
  preload?: boolean;
  chunkName?: string;
  fallback?: ComponentType;
  retry?: number;
}

type LazyComponentModule<T> = { default: ComponentType<T> };

const loadedModules = new Map<string, Promise<any>>();
const preloadQueue: Array<() => Promise<any>> = [];
let isPreloading = false;

async function processPreloadQueue() {
  if (isPreloading || preloadQueue.length === 0) return;
  isPreloading = true;

  while (preloadQueue.length > 0) {
    const loader = preloadQueue.shift();
    if (loader) {
      try {
        await loader();
      } catch (e) {
        console.warn('Preload failed:', e);
      }
    }
    // Small delay between preloads to not block main thread
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  isPreloading = false;
}

export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<LazyComponentModule<any>>,
  options: LazyComponentOptions = {}
): LazyExoticComponent<T> & { preload: () => Promise<void> } {
  const { preload = false, retry = 3 } = options;
  const key = importFn.toString();

  const loader = async (): Promise<LazyComponentModule<any>> => {
    // Check cache
    if (loadedModules.has(key)) {
      return loadedModules.get(key)!;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retry; attempt++) {
      try {
        const modulePromise = importFn();
        loadedModules.set(key, modulePromise);
        return await modulePromise;
      } catch (error) {
        lastError = error as Error;
        loadedModules.delete(key);
        
        if (attempt < retry - 1) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    throw lastError;
  };

  const LazyComponent = lazy(loader) as LazyExoticComponent<T> & { preload: () => Promise<void> };

  LazyComponent.preload = async () => {
    try {
      await loader();
    } catch (e) {
      console.warn('Component preload failed:', e);
    }
  };

  // Queue preload if requested
  if (preload) {
    preloadQueue.push(LazyComponent.preload);
    // Start processing queue when idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(processPreloadQueue);
    } else {
      setTimeout(processPreloadQueue, 100);
    }
  }

  return LazyComponent;
}

// ============== PRELOAD HELPERS ==============

export function preloadComponent(component: { preload?: () => Promise<void> }) {
  if (component.preload) {
    component.preload();
  }
}

export function preloadOnHover(
  component: { preload?: () => Promise<void> }
): React.MouseEventHandler {
  let preloaded = false;
  return () => {
    if (!preloaded && component.preload) {
      preloaded = true;
      component.preload();
    }
  };
}

export function preloadOnVisible(
  component: { preload?: () => Promise<void> },
  options: IntersectionObserverInit = { rootMargin: '100px' }
): (element: HTMLElement | null) => void {
  let preloaded = false;
  let observer: IntersectionObserver | null = null;

  return (element: HTMLElement | null) => {
    if (observer) {
      observer.disconnect();
    }

    if (!element || preloaded) return;

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !preloaded && component.preload) {
          preloaded = true;
          component.preload();
          observer?.disconnect();
        }
      },
      options
    );

    observer.observe(element);
  };
}

// ============== ROUTE-BASED PRELOADING ==============

const routeComponents = new Map<string, { preload?: () => Promise<void> }>();

export function registerRouteComponent(
  path: string,
  component: { preload?: () => Promise<void> }
) {
  routeComponents.set(path, component);
}

export function preloadRoute(path: string) {
  const component = routeComponents.get(path);
  if (component?.preload) {
    component.preload();
  }
}

export function preloadAdjacentRoutes(currentPath: string, routes: string[]) {
  const currentIndex = routes.indexOf(currentPath);
  if (currentIndex === -1) return;

  // Preload prev and next routes
  const adjacentPaths = [
    routes[currentIndex - 1],
    routes[currentIndex + 1],
  ].filter(Boolean);

  adjacentPaths.forEach(preloadRoute);
}

// ============== PREFETCH DATA ==============

const prefetchCache = new Map<string, { data: any; timestamp: number }>();
const PREFETCH_TTL = 5 * 60 * 1000; // 5 minutes

export async function prefetchData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = PREFETCH_TTL
): Promise<T> {
  const cached = prefetchCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await fetcher();
  prefetchCache.set(key, { data, timestamp: Date.now() });
  
  return data;
}

export function invalidatePrefetch(key: string) {
  prefetchCache.delete(key);
}

export function clearPrefetchCache() {
  prefetchCache.clear();
}

// ============== LAZY IMAGE ==============

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}
