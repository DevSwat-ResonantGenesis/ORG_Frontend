/**
 * Custom hook for fetching data from backend
 * Replaces localStorage with real backend calls
 */
import { useState, useEffect, useCallback } from 'react';

interface UseBackendDataOptions<T> {
  fetchFn: () => Promise<T>;
  dependencies?: any[];
  initialData?: T;
  onError?: (error: Error) => void;
}

export function useBackendData<T>({
  fetchFn,
  dependencies = [],
  initialData,
  onError
}: UseBackendDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

/**
 * Hook for polling data at intervals
 */
export function usePollingData<T>({
  fetchFn,
  interval = 5000,
  enabled = true
}: {
  fetchFn: () => Promise<T>;
  interval?: number;
  enabled?: boolean;
}) {
  const { data, loading, error, refetch } = useBackendData({ fetchFn });

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, refetch]);

  return { data, loading, error, refetch };
}
