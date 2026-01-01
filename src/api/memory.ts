/**
 * Memory API Client
 * Handles memory storage, retrieval, and vector search
 */

import fastapiClient from './fastapiClient';

export interface MemoryRecord {
  id: string;
  chat_id?: string;
  user_id?: string;
  source: string;
  content: string;
  metadata?: any;
  similarity?: number;
  hash?: string;
  resonance_score?: number;
  xyz?: [number, number, number];
  created_at?: string;
  updated_at?: string;
}

export interface MemoryAnchor {
  id: string;
  user_id: string;
  chat_id?: string;
  anchor_text: string;
  anchor_hash: string;
  context?: string;
  importance_score: number;
  xyz?: [number, number, number];
  is_archived?: boolean;
  created_at?: string;
}

export interface IngestMemoryRequest {
  chat_id?: string;
  user_id?: string;
  source: string;
  content: string;
  metadata?: any;
  generate_embedding?: boolean;
}

export interface RetrieveMemoryRequest {
  chat_id?: string;
  user_id?: string;
  query: string;
  limit?: number;
  use_vector_search?: boolean;
}

export interface MemoryStats {
  total_memories: number;
  total_embeddings: number;
  total_anchors: number;
  storage_size_mb: number;
  avg_similarity?: number;
}

/**
 * Ingest a new memory record
 */
export const ingestMemory = async (
  request: IngestMemoryRequest
): Promise<MemoryRecord> => {
  try {
    const response = await fastapiClient.post('/memory/ingest', request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to ingest memory:', error);
    throw new Error(error.response?.data?.detail || 'Failed to ingest memory');
  }
};

/**
 * Retrieve memories using vector search
 */
export const retrieveMemories = async (
  request: RetrieveMemoryRequest
): Promise<MemoryRecord[]> => {
  try {
    const response = await fastapiClient.post('/memory/retrieve', {
      ...request,
      limit: request.limit || 10,
      use_vector_search: request.use_vector_search !== false,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to retrieve memories:', error);
    throw new Error(error.response?.data?.detail || 'Failed to retrieve memories');
  }
};

/**
 * Search memories
 */
export const searchMemories = async (
  request: RetrieveMemoryRequest
): Promise<{
  memories: MemoryRecord[];
  query: string;
  total_found: number;
}> => {
  try {
    const response = await fastapiClient.post('/memory/search', request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to search memories:', error);
    throw new Error(error.response?.data?.detail || 'Failed to search memories');
  }
};

/**
 * Delete a memory record
 */
export const deleteMemory = async (
  memoryId: string
): Promise<void> => {
  try {
    await fastapiClient.delete(`/memory/${memoryId}`);
  } catch (error: any) {
    console.error('Failed to delete memory:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete memory');
  }
};

/**
 * Get memory statistics
 */
export const getMemoryStats = async (
  userId?: string
): Promise<MemoryStats> => {
  try {
    const response = await fastapiClient.get('/memory/stats', {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get memory stats:', error);
    return {
      total_memories: 0,
      total_embeddings: 0,
      total_anchors: 0,
      storage_size_mb: 0,
    };
  }
};

/**
 * Create a memory anchor
 */
export const createAnchor = async (
  anchorText: string,
  context?: string,
  chatId?: string
): Promise<MemoryAnchor> => {
  try {
    const response = await fastapiClient.post('/memory/hash-sphere/anchors', {
      anchor_text: anchorText,
      context: context || '',
      chat_id: chatId,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to create anchor:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create anchor');
  }
};

/**
 * List memory anchors
 */
export const listAnchors = async (
  userId?: string,
  limit: number = 50
): Promise<MemoryAnchor[]> => {
  try {
    const response = await fastapiClient.get('/memory/hash-sphere/anchors', {
      params: {
        user_id: userId,
        limit,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list anchors:', error);
    return [];
  }
};

/**
 * Search anchors by query
 */
export const searchAnchors = async (
  query: string,
  userId?: string,
  limit: number = 10
): Promise<MemoryAnchor[]> => {
  try {
    const response = await fastapiClient.post('/memory/hash-sphere/search', {
      query,
      user_id: userId,
      limit,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to search anchors:', error);
    return [];
  }
};

/**
 * Archive a memory file
 */
export const archiveMemory = async (
  memoryId: string,
  reason?: string
): Promise<void> => {
  try {
    await fastapiClient.post('/memory/archive/file', {
      memory_id: memoryId,
      reason: reason || 'User archived',
    });
  } catch (error: any) {
    console.error('Failed to archive memory:', error);
    throw new Error(error.response?.data?.detail || 'Failed to archive memory');
  }
};

/**
 * Unarchive a memory file
 */
export const unarchiveMemory = async (
  memoryId: string
): Promise<void> => {
  try {
    await fastapiClient.post('/memory/unarchive/file', {
      memory_id: memoryId,
    });
  } catch (error: any) {
    console.error('Failed to unarchive memory:', error);
    throw new Error(error.response?.data?.detail || 'Failed to unarchive memory');
  }
};

/**
 * List archived memories
 */
export const listArchivedMemories = async (): Promise<MemoryRecord[]> => {
  try {
    const response = await fastapiClient.get('/memory/archived/files');
    return response.data;
  } catch (error: any) {
    console.error('Failed to list archived memories:', error);
    return [];
  }
};

/**
 * Format memory source for display
 */
export const formatSource = (source: string): string => {
  const sourceMap: { [key: string]: string } = {
    chat: 'Chat',
    workflow: 'Workflow',
    cognitive: 'Cognitive',
    code: 'Code',
    document: 'Document',
    web: 'Web',
    api: 'API',
  };
  return sourceMap[source] || source;
};

/**
 * Get source color for UI
 */
export const getSourceColor = (source: string): string => {
  const colorMap: { [key: string]: string } = {
    chat: '#3b82f6',
    workflow: '#a855f7',
    cognitive: '#ec4899',
    code: '#14b8a6',
    document: '#f59e0b',
    web: '#22c55e',
    api: '#6366f1',
  };
  return colorMap[source] || '#6b7280';
};

/**
 * Format similarity score for display
 */
export const formatSimilarity = (similarity?: number): string => {
  if (!similarity) return 'N/A';
  return `${(similarity * 100).toFixed(1)}%`;
};

/**
 * Get similarity color for UI
 */
export const getSimilarityColor = (similarity?: number): string => {
  if (!similarity) return '#6b7280';
  if (similarity >= 0.8) return '#22c55e'; // green
  if (similarity >= 0.6) return '#3b82f6'; // blue
  if (similarity >= 0.4) return '#f59e0b'; // orange
  return '#ef4444'; // red
};

/**
 * Format storage size for display
 */
export const formatStorageSize = (sizeMb: number): string => {
  if (sizeMb < 1) return `${(sizeMb * 1024).toFixed(1)} KB`;
  if (sizeMb < 1024) return `${sizeMb.toFixed(1)} MB`;
  return `${(sizeMb / 1024).toFixed(1)} GB`;
};
