// ============== COMPONENT OPTIMIZER ==============
// React component performance utilities

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

// ============== DEEP MEMO ==============
export function deepMemo<T extends React.ComponentType<P>, P extends object>(
  Component: T,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<T> {
  return memo(Component, propsAreEqual || deepEqual) as React.MemoExoticComponent<T>;
}

function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== typeof obj2) return false;
  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1 as object);
  const keys2 = Object.keys(obj2 as object);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

// ============== STABLE CALLBACK ==============
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// ============== PREVIOUS VALUE ==============
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// ============== STABLE OBJECT ==============
export function useStableObject<T extends object>(obj: T): T {
  const ref = useRef(obj);
  
  if (!deepEqual(ref.current, obj)) {
    ref.current = obj;
  }
  
  return ref.current;
}

// ============== STABLE ARRAY ==============
export function useStableArray<T>(arr: T[]): T[] {
  const ref = useRef(arr);
  
  const isEqual = arr.length === ref.current.length && 
    arr.every((item, i) => item === ref.current[i]);
  
  if (!isEqual) {
    ref.current = arr;
  }
  
  return ref.current;
}

// ============== MEMOIZED SELECTOR ==============
export function useMemoizedSelector<T, R>(
  data: T,
  selector: (data: T) => R,
  deps: React.DependencyList = []
): R {
  return useMemo(() => selector(data), [data, ...deps]);
}

// ============== RENDER TRACKER ==============
export function useRenderTracker(componentName: string): void {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] ${componentName}: #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms since last)`);
    }
  });
}

// ============== CONDITIONAL RENDER ==============
export function conditionalRender(
  condition: boolean,
  content: React.ReactNode,
  fallback: React.ReactNode = null
): React.ReactNode {
  return condition ? content : fallback;
}

// ============== LAZY RENDER HOOK ==============
export function useLazyRender(delay: number = 0): boolean {
  const [shouldRender, setShouldRender] = React.useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return shouldRender;
}

// ============== VISIBILITY HOOK ==============
export function useVisibility(
  rootMargin: string = '100px'
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isVisible];
}

// ============== BATCH STATE UPDATES ==============
export function useBatchedState<S>(initialState: S): [S, (value: S) => void] {
  const [state, setState] = React.useState(initialState);
  const pendingValue = useRef<S>(initialState);
  const isFlushScheduled = useRef(false);

  const batchedSetState = useCallback((value: S) => {
    pendingValue.current = value;

    if (!isFlushScheduled.current) {
      isFlushScheduled.current = true;
      
      requestAnimationFrame(() => {
        setState(pendingValue.current);
        isFlushScheduled.current = false;
      });
    }
  }, []);

  return [state, batchedSetState];
}

// ============== DEBOUNCED STATE ==============
export function useDebouncedState<S>(
  initialState: S,
  delay = 300
): [S, S, (value: S) => void] {
  const [immediateValue, setImmediateValue] = React.useState(initialState);
  const [debouncedValue, setDebouncedValue] = React.useState(initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [immediateValue, delay]);

  return [immediateValue, debouncedValue, setImmediateValue];
}

// ============== EFFECT DEBUGGER ==============
export function useEffectDebugger(
  effect: React.EffectCallback,
  deps: React.DependencyList,
  depNames: string[]
): void {
  const prevDeps = usePrevious(deps);

  useEffect(() => {
    if (prevDeps) {
      const changedDeps = deps.reduce<Record<string, { from: unknown; to: unknown }>>(
        (acc, dep, i) => {
          if (dep !== prevDeps[i]) {
            acc[depNames[i] || i] = { from: prevDeps[i], to: dep };
          }
          return acc;
        },
        {}
      );

      if (Object.keys(changedDeps).length > 0) {
        console.log('[Effect] Dependencies changed:', changedDeps);
      }
    }

    return effect();
  }, deps);
}
