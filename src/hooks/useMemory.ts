/**
 * MEMORY/RAG HOOKS
 * ================
 * 
 * React hooks for Hash Sphere memory functionality.
 * Wires memoryComplete API to UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import * as memoryApi from '../api/memoryComplete';
import type {
  Memory,
  MemorySearchResult,
  HashSphereStats,
  RAGContext,
} from '../api/memoryComplete';

// ============== MEMORY SEARCH HOOK ==============

interface UseMemorySearchResult {
  results: MemorySearchResult[];
  isSearching: boolean;
  error: Error | null;
  search: (query: string, options?: { limit?: number; threshold?: number }) => Promise<void>;
  clearResults: () => void;
}

export function useMemorySearch(): UseMemorySearchResult {
  const [results, setResults] = useState<MemorySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string, options?: { limit?: number; threshold?: number }) => {
    try {
      setIsSearching(true);
      setError(null);
      const data = await memoryApi.searchMemories({
        query,
        limit: options?.limit || 10,
        threshold: options?.threshold || 0.7,
      });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, isSearching, error, search, clearResults };
}

// ============== MEMORY LIST HOOK ==============

interface UseMemoriesResult {
  memories: Memory[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
}

export function useMemories(agentHash?: string): UseMemoriesResult {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await memoryApi.listMemories(50, 0, agentHash);
      setMemories(data.memories);
      setTotal(data.total);
      setOffset(50);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch memories'));
    } finally {
      setIsLoading(false);
    }
  }, [agentHash]);

  const loadMore = useCallback(async () => {
    try {
      const data = await memoryApi.listMemories(50, offset, agentHash);
      setMemories(prev => [...prev, ...data.memories]);
      setOffset(prev => prev + 50);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    }
  }, [offset, agentHash]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    await memoryApi.deleteMemory(memoryId);
    setMemories(prev => prev.filter(m => m.id !== memoryId));
    setTotal(prev => prev - 1);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { memories, total, isLoading, error, refetch: fetchData, loadMore, deleteMemory };
}

// ============== HASH SPHERE STATS HOOK ==============

interface UseHashSphereResult {
  stats: HashSphereStats | null;
  visualization: {
    points: Array<{ xyz: [number, number, number]; hash: string; label?: string }>;
    clusters: Array<{ center: [number, number, number]; count: number }>;
  } | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useHashSphere(): UseHashSphereResult {
  const [stats, setStats] = useState<HashSphereStats | null>(null);
  const [visualization, setVisualization] = useState<{
    points: Array<{ xyz: [number, number, number]; hash: string; label?: string }>;
    clusters: Array<{ center: [number, number, number]; count: number }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsData, vizData] = await Promise.all([
        memoryApi.getHashSphereStats(),
        memoryApi.getHashSphereVisualization(500),
      ]);
      setStats(statsData);
      setVisualization(vizData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch Hash Sphere data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, visualization, isLoading, error, refetch: fetchData };
}

// ============== RAG CONTEXT HOOK ==============

interface UseRAGResult {
  context: RAGContext | null;
  isLoading: boolean;
  error: Error | null;
  getContext: (query: string, maxTokens?: number) => Promise<RAGContext>;
  augmentPrompt: (prompt: string) => Promise<string>;
}

export function useRAG(agentHash?: string): UseRAGResult {
  const [context, setContext] = useState<RAGContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getContext = useCallback(async (query: string, maxTokens = 2000): Promise<RAGContext> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await memoryApi.getRAGContext(query, maxTokens, agentHash);
      setContext(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get RAG context');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [agentHash]);

  const augmentPrompt = useCallback(async (prompt: string): Promise<string> => {
    const result = await memoryApi.augmentPrompt(prompt, agentHash);
    return result.augmented_prompt;
  }, [agentHash]);

  return { context, isLoading, error, getContext, augmentPrompt };
}

// ============== STORE MEMORY HOOK ==============

interface UseStoreMemoryResult {
  isStoring: boolean;
  error: Error | null;
  store: (content: string, metadata?: Record<string, any>, anchors?: string[]) => Promise<Memory>;
  storeBatch: (memories: Array<{ content: string; metadata?: Record<string, any> }>) => Promise<Memory[]>;
}

export function useStoreMemory(agentHash?: string): UseStoreMemoryResult {
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const store = useCallback(async (
    content: string,
    metadata?: Record<string, any>,
    anchors?: string[]
  ): Promise<Memory> => {
    try {
      setIsStoring(true);
      setError(null);
      const memory = await memoryApi.storeMemory({
        content,
        metadata,
        anchors,
        agent_hash: agentHash,
      });
      return memory;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to store memory');
      setError(error);
      throw error;
    } finally {
      setIsStoring(false);
    }
  }, [agentHash]);

  const storeBatch = useCallback(async (
    memories: Array<{ content: string; metadata?: Record<string, any> }>
  ): Promise<Memory[]> => {
    try {
      setIsStoring(true);
      setError(null);
      const result = await memoryApi.storeMemories(
        memories.map(m => ({ ...m, agent_hash: agentHash }))
      );
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to store memories');
      setError(error);
      throw error;
    } finally {
      setIsStoring(false);
    }
  }, [agentHash]);

  return { isStoring, error, store, storeBatch };
}

// ============== ANCHORS HOOK ==============

interface UseAnchorsResult {
  anchors: Array<{ anchor: string; count: number }>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getMemoriesByAnchor: (anchor: string) => Promise<Memory[]>;
}

export function useAnchors(): UseAnchorsResult {
  const [anchors, setAnchors] = useState<Array<{ anchor: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await memoryApi.getAnchors();
      setAnchors(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch anchors'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMemoriesByAnchor = useCallback(async (anchor: string): Promise<Memory[]> => {
    return await memoryApi.getMemoriesByAnchor(anchor);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { anchors, isLoading, error, refetch: fetchData, getMemoriesByAnchor };
}

export default {
  useMemorySearch,
  useMemories,
  useHashSphere,
  useRAG,
  useStoreMemory,
  useAnchors,
};
