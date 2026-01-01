// ============== OPTIMIZED STATE HOOKS ==============
// Performance-optimized state management hooks

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ============== DEBOUNCED STATE ==============

export function useDebouncedState<T>(initialValue: T, delay: number = 300) {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  const setValueImmediate = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDebouncedValue(typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value) 
      : newValue
    );
  }, [value]);

  return { value, debouncedValue, setValue, setValueImmediate };
}

// ============== THROTTLED CALLBACK ==============

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRun = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      lastRun.current = now;
      return callback(...args);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]) as T;
}

// ============== LAZY STATE ==============

export function useLazyState<T>(initializer: () => T) {
  const [state, setState] = useState<T | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setState(initializer());
    }
  }, [initializer]);

  return [state, setState] as const;
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
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

// ============== MEMOIZED OBJECT ==============

export function useMemoizedObject<T extends Record<string, any>>(obj: T): T {
  const ref = useRef(obj);
  
  const isEqual = useMemo(() => {
    const keys = Object.keys(obj);
    const prevKeys = Object.keys(ref.current);
    
    if (keys.length !== prevKeys.length) return false;
    
    return keys.every(key => obj[key] === ref.current[key]);
  }, [obj]);
  
  if (!isEqual) {
    ref.current = obj;
  }
  
  return ref.current;
}

// ============== ASYNC STATE ==============

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  deps: any[] = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

// ============== LOCAL STORAGE STATE ==============

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue };
}

// ============== INTERSECTION OBSERVER ==============

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.root, options.rootMargin]);

  return [ref as React.RefObject<HTMLElement>, isIntersecting];
}

// ============== RESIZE OBSERVER ==============

interface Size {
  width: number;
  height: number;
}

export function useResizeObserver(): [React.RefObject<HTMLElement>, Size] {
  const ref = useRef<HTMLElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref as React.RefObject<HTMLElement>, size];
}

// ============== MEDIA QUERY ==============

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ============== KEYBOARD SHORTCUT ==============

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = modifiers.ctrl ? e.ctrlKey : true;
      const matchesShift = modifiers.shift ? e.shiftKey : true;
      const matchesAlt = modifiers.alt ? e.altKey : true;
      const matchesMeta = modifiers.meta ? e.metaKey : true;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers.ctrl, modifiers.shift, modifiers.alt, modifiers.meta]);
}

// ============== DOCUMENT TITLE ==============

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => { document.title = prevTitle; };
  }, [title]);
}

// ============== CLICK OUTSIDE ==============

export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}

export default {
  useDebouncedState,
  useThrottledCallback,
  useLazyState,
  usePrevious,
  useStableCallback,
  useMemoizedObject,
  useAsyncState,
  useLocalStorage,
  useIntersectionObserver,
  useResizeObserver,
  useMediaQuery,
  useKeyboardShortcut,
  useDocumentTitle,
  useClickOutside,
};
