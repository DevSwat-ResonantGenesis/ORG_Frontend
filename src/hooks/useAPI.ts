// ============== API HOOKS ==============
// React hooks for optimized API interactions

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '../utils/apiCache';

// ============== TYPES ==============
interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  refetchOnFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

interface UseQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

interface UseMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: V) => void;
  invalidateKeys?: string[];
}

interface UseMutationResult<T, V> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  reset: () => void;
}

// ============== USE QUERY ==============
export function useQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    refetchInterval,
    refetchOnFocus = false,
    staleTime = 0,
    cacheTime = 300000,
    onSuccess,
    onError,
    initialData,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData && enabled);
  const [isFetching, setIsFetching] = useState(false);
  const lastFetchTime = useRef(0);
  const mounted = useRef(true);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    const now = Date.now();
    const isStale = now - lastFetchTime.current > staleTime;

    // Check cache
    if (!force && !isStale) {
      const cached = apiCache.get<T>(key);
      if (cached !== null) {
        setData(cached);
        return;
      }
    }

    setIsFetching(true);
    if (!data) setIsLoading(true);

    try {
      const result = await fetcher();
      
      if (mounted.current) {
        setData(result);
        setError(null);
        lastFetchTime.current = Date.now();
        apiCache.set(key, result, { ttl: cacheTime });
        onSuccess?.(result);
      }
    } catch (err) {
      if (mounted.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [key, fetcher, enabled, staleTime, cacheTime, data, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  // Refetch on focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleFocus = () => {
      if (Date.now() - lastFetchTime.current > staleTime) {
        fetchData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnFocus, staleTime, fetchData]);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    isFetching,
    refetch: () => fetchData(true),
  };
}

// ============== USE MUTATION ==============
export function useMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationOptions<T, V> = {}
): UseMutationResult<T, V> {
  const { onSuccess, onError, onSettled, invalidateKeys } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  const mutateAsync = useCallback(async (variables: V): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      
      // Invalidate cache keys
      if (invalidateKeys) {
        invalidateKeys.forEach(key => apiCache.invalidate(key));
      }

      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error, variables);
      onSettled?.(undefined, error, variables);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, invalidateKeys, onSuccess, onError, onSettled]);

  const mutate = useCallback((variables: V) => {
    mutateAsync(variables).catch(() => {});
  }, [mutateAsync]);

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    mutate,
    mutateAsync,
    reset,
  };
}

// ============== USE INFINITE QUERY ==============
interface UseInfiniteQueryOptions<T> {
  getNextPageParam: (lastPage: T, pages: T[]) => unknown | undefined;
  enabled?: boolean;
  staleTime?: number;
}

interface UseInfiniteQueryResult<T> {
  data: T[];
  error: Error | null;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInfiniteQuery<T>(
  key: string,
  fetcher: (pageParam: unknown) => Promise<T>,
  options: UseInfiniteQueryOptions<T>
): UseInfiniteQueryResult<T> {
  const { getNextPageParam, enabled = true, staleTime = 0 } = options;

  const [pages, setPages] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const nextPageParam = useRef<unknown>(undefined);

  const fetchPage = useCallback(async (isNext = false) => {
    if (!enabled) return;
    
    if (isNext) {
      setIsFetchingNextPage(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetcher(nextPageParam.current);
      
      setPages(prev => isNext ? [...prev, result] : [result]);
      
      const nextParam = getNextPageParam(result, isNext ? [...pages, result] : [result]);
      nextPageParam.current = nextParam;
      setHasNextPage(nextParam !== undefined);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [enabled, fetcher, getNextPageParam, pages]);

  useEffect(() => {
    fetchPage();
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchPage(true);
    }
  }, [hasNextPage, isFetchingNextPage, fetchPage]);

  const refetch = useCallback(async () => {
    nextPageParam.current = undefined;
    setPages([]);
    await fetchPage();
  }, [fetchPage]);

  return {
    data: pages,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}

// ============== USE OPTIMISTIC UPDATE ==============
export function useOptimisticMutation<T, V>(
  queryKey: string,
  mutationFn: (variables: V) => Promise<T>,
  updateFn: (oldData: T | undefined, variables: V) => T
) {
  const [isRollingBack, setIsRollingBack] = useState(false);

  const mutation = useMutation(mutationFn, {
    onSuccess: (data) => {
      apiCache.set(queryKey, data, { ttl: 300000 });
    },
    onError: () => {
      setIsRollingBack(true);
      // Rollback handled by refetching
      apiCache.invalidate(queryKey);
      setTimeout(() => setIsRollingBack(false), 100);
    },
  });

  const optimisticMutate = useCallback((variables: V) => {
    // Optimistically update cache
    const oldData = apiCache.get<T>(queryKey);
    const newData = updateFn(oldData ?? undefined, variables);
    apiCache.set(queryKey, newData, { ttl: 300000 });

    // Perform actual mutation
    mutation.mutate(variables);
  }, [queryKey, updateFn, mutation]);

  return {
    ...mutation,
    optimisticMutate,
    isRollingBack,
  };
}

// ============== USE PREFETCH ==============
export function usePrefetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime = 30000
): () => void {
  return useCallback(() => {
    const cached = apiCache.get<T>(key);
    if (cached === null) {
      fetcher().then(data => {
        apiCache.set(key, data, { ttl: staleTime });
      }).catch(() => {});
    }
  }, [key, fetcher, staleTime]);
}

// ============== USE POLLING ==============
export function usePolling<T>(
  fetcher: () => Promise<T>,
  interval: number,
  enabled = true
): { data: T | null; error: Error | null; isPolling: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    setIsPolling(true);

    const poll = async () => {
      try {
        const result = await fetcher();
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    poll();
    const intervalId = setInterval(poll, interval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      setIsPolling(false);
    };
  }, [fetcher, interval, enabled]);

  return { data, error, isPolling };
}
