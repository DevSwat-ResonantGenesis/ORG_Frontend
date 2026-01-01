/**
 * COMPLETE MEMORY/RAG API
 * =======================
 * 
 * Full memory service API client covering:
 * - Hash Sphere storage
 * - Semantic search
 * - Memory management
 * - RAG retrieval
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface Memory {
  id: string;
  content: string;
  hash: string;
  xyz?: [number, number, number];
  anchors: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface MemorySearchResult {
  memory: Memory;
  score: number;
  relevance: number;
}

export interface HashSphereStats {
  total_memories: number;
  total_anchors: number;
  sphere_density: number;
  cluster_count: number;
}

export interface StoreMemoryRequest {
  content: string;
  metadata?: Record<string, any>;
  anchors?: string[];
  agent_hash?: string;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
  anchors?: string[];
  agent_hash?: string;
  include_metadata?: boolean;
}

export interface RAGContext {
  memories: MemorySearchResult[];
  context_summary: string;
  total_tokens: number;
}

// ============== STORE MEMORY ==============

/**
 * Store content in Hash Sphere memory.
 */
export const storeMemory = async (
  request: StoreMemoryRequest
): Promise<Memory> => {
  try {
    const response = await fastapiClient.post('/memory/store', request);
    logger.info('Memory stored', { hash: response.data.hash });
    return response.data;
  } catch (error) {
    logger.error('Failed to store memory', error);
    throw error;
  }
};

/**
 * Store multiple memories in batch.
 */
export const storeMemories = async (
  memories: StoreMemoryRequest[]
): Promise<Memory[]> => {
  try {
    const response = await fastapiClient.post('/memory/store/batch', { memories });
    return response.data;
  } catch (error) {
    logger.error('Failed to store memories', error);
    throw error;
  }
};

// ============== SEARCH ==============

/**
 * Semantic search in memory.
 */
export const searchMemories = async (
  request: SearchRequest
): Promise<MemorySearchResult[]> => {
  const response = await fastapiClient.post('/memory/search', {
    query: request.query,
    limit: request.limit || 10,
    threshold: request.threshold || 0.7,
    anchors: request.anchors,
    agent_hash: request.agent_hash,
    include_metadata: request.include_metadata ?? true,
  });
  return response.data;
};

/**
 * Search by anchor tags.
 */
export const searchByAnchors = async (
  anchors: string[],
  limit: number = 20
): Promise<Memory[]> => {
  const response = await fastapiClient.post('/memory/search/anchors', {
    anchors,
    limit,
  });
  return response.data;
};

/**
 * Get memories near a specific hash in the sphere.
 */
export const getNearbyMemories = async (
  hash: string,
  radius: number = 0.5,
  limit: number = 10
): Promise<MemorySearchResult[]> => {
  const response = await fastapiClient.get(`/memory/nearby/${hash}`, {
    params: { radius, limit },
  });
  return response.data;
};

// ============== RETRIEVE ==============

/**
 * Get memory by ID.
 */
export const getMemory = async (memoryId: string): Promise<Memory> => {
  const response = await fastapiClient.get(`/memory/${memoryId}`);
  return response.data;
};

/**
 * Get memory by hash.
 */
export const getMemoryByHash = async (hash: string): Promise<Memory> => {
  const response = await fastapiClient.get(`/memory/hash/${hash}`);
  return response.data;
};

/**
 * List all memories for user.
 */
export const listMemories = async (
  limit: number = 50,
  offset: number = 0,
  agentHash?: string
): Promise<{ memories: Memory[]; total: number }> => {
  const response = await fastapiClient.get('/memory/list', {
    params: { limit, offset, agent_hash: agentHash },
  });
  return response.data;
};

// ============== UPDATE/DELETE ==============

/**
 * Update memory metadata.
 */
export const updateMemory = async (
  memoryId: string,
  metadata: Record<string, any>
): Promise<Memory> => {
  const response = await fastapiClient.patch(`/memory/${memoryId}`, { metadata });
  return response.data;
};

/**
 * Add anchors to memory.
 */
export const addAnchors = async (
  memoryId: string,
  anchors: string[]
): Promise<Memory> => {
  const response = await fastapiClient.post(`/memory/${memoryId}/anchors`, { anchors });
  return response.data;
};

/**
 * Delete memory.
 */
export const deleteMemory = async (memoryId: string): Promise<{ deleted: boolean }> => {
  const response = await fastapiClient.delete(`/memory/${memoryId}`);
  return response.data;
};

/**
 * Clear all memories (with confirmation).
 */
export const clearMemories = async (
  confirmation: string,
  agentHash?: string
): Promise<{ cleared: number }> => {
  const response = await fastapiClient.post('/memory/clear', {
    confirmation,
    agent_hash: agentHash,
  });
  return response.data;
};

// ============== RAG ==============

/**
 * Get RAG context for a query.
 */
export const getRAGContext = async (
  query: string,
  maxTokens: number = 2000,
  agentHash?: string
): Promise<RAGContext> => {
  const response = await fastapiClient.post('/memory/rag/context', {
    query,
    max_tokens: maxTokens,
    agent_hash: agentHash,
  });
  return response.data;
};

/**
 * Augment prompt with RAG context.
 */
export const augmentPrompt = async (
  prompt: string,
  agentHash?: string
): Promise<{ augmented_prompt: string; memories_used: number }> => {
  const response = await fastapiClient.post('/memory/rag/augment', {
    prompt,
    agent_hash: agentHash,
  });
  return response.data;
};

// ============== HASH SPHERE ==============

/**
 * Get Hash Sphere statistics.
 */
export const getHashSphereStats = async (): Promise<HashSphereStats> => {
  const response = await fastapiClient.get('/memory/sphere/stats');
  return response.data;
};

/**
 * Get Hash Sphere visualization data.
 */
export const getHashSphereVisualization = async (
  limit: number = 1000
): Promise<{
  points: Array<{ xyz: [number, number, number]; hash: string; label?: string }>;
  clusters: Array<{ center: [number, number, number]; count: number }>;
}> => {
  const response = await fastapiClient.get('/memory/sphere/visualization', {
    params: { limit },
  });
  return response.data;
};

/**
 * Compute hash position in sphere.
 */
export const computeHashPosition = async (
  content: string
): Promise<{ hash: string; xyz: [number, number, number] }> => {
  const response = await fastapiClient.post('/memory/sphere/compute', { content });
  return response.data;
};

// ============== ANCHORS ==============

/**
 * Get all anchors with counts.
 */
export const getAnchors = async (): Promise<Array<{ anchor: string; count: number }>> => {
  const response = await fastapiClient.get('/memory/anchors');
  return response.data;
};

/**
 * Get memories by anchor.
 */
export const getMemoriesByAnchor = async (
  anchor: string,
  limit: number = 50
): Promise<Memory[]> => {
  const response = await fastapiClient.get(`/memory/anchors/${encodeURIComponent(anchor)}`, {
    params: { limit },
  });
  return response.data;
};

// ============== EMBEDDINGS ==============

/**
 * Get embedding for content.
 */
export const getEmbedding = async (
  content: string
): Promise<{ embedding: number[]; dimensions: number }> => {
  const response = await fastapiClient.post('/memory/embedding', { content });
  return response.data;
};

/**
 * Compare similarity between two texts.
 */
export const compareSimilarity = async (
  text1: string,
  text2: string
): Promise<{ similarity: number }> => {
  const response = await fastapiClient.post('/memory/similarity', { text1, text2 });
  return response.data;
};

// ============== EXPORTS ==============

export default {
  // Store
  storeMemory,
  storeMemories,
  // Search
  searchMemories,
  searchByAnchors,
  getNearbyMemories,
  // Retrieve
  getMemory,
  getMemoryByHash,
  listMemories,
  // Update/Delete
  updateMemory,
  addAnchors,
  deleteMemory,
  clearMemories,
  // RAG
  getRAGContext,
  augmentPrompt,
  // Hash Sphere
  getHashSphereStats,
  getHashSphereVisualization,
  computeHashPosition,
  // Anchors
  getAnchors,
  getMemoriesByAnchor,
  // Embeddings
  getEmbedding,
  compareSimilarity,
};
