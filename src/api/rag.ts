import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

export interface RAGAskRequest {
  query: string;
  conversation_id?: string;
  top_k?: number;
  use_memory?: boolean;
  provider?: string; // LLM provider (openai, gemini, claude, etc.)
}

export interface RAGAskResponse {
  response: string;
  sources: Array<{
    id: string;
    content: string;
    score: number;
    hash?: string;
    xyz?: number[];
    cluster?: string;
    metadata?: Record<string, any>;
  }>;
  validity: number;
  entropy: number;
  evidence_graph: Record<string, any>;
  context_used: boolean;
  conversation_id: string;
}

export interface MemoryCreateRequest {
  content: string;
  metadata?: Record<string, any>;
}

export interface MemoryResponse {
  id: string;
  content: string;
  name?: string; // Optional name/title for the memory
  hash?: string;
  xyz?: number[];
  cluster?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ConversationResponse {
  id: string;
  role: string;
  content: string;
  provider?: string;
  sources: Array<Record<string, any>>;
  validity?: number;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title?: string;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Ask a question with RAG retrieval
 */
export const askWithRAG = async (request: RAGAskRequest): Promise<RAGAskResponse> => {
  try {
    const response = await fastapiClient.post('/rag/ask', request);
    return response.data;
  } catch (error: any) {
    // Only log non-connection errors
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG ask error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * Create a memory/document
 */
export const createMemory = async (request: MemoryCreateRequest): Promise<MemoryResponse> => {
  try {
    // Route through chat_service proxy to avoid gateway /rag/ auth issues
    const response = await fastapiClient.post('/resonant-chat/memories/save', request);
    return response.data;
  } catch (error: any) {
    logger.error('RAG create memory error', error, { component: 'RAG' });
    throw error;
  }
};

/**
 * List user's memories
 */
export const listMemories = async (limit: number = 50): Promise<MemoryResponse[]> => {
  try {
    // Route through chat_service proxy to avoid gateway /rag/ auth issues
    const response = await fastapiClient.get(`/resonant-chat/memories/list?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    // Suppress connection errors - they're expected when backend is down
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG list memories error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * Get a specific memory
 */
export const getMemory = async (memoryId: string): Promise<MemoryResponse> => {
  try {
    const response = await fastapiClient.get(`/rag/memories/${memoryId}`);
    return response.data;
  } catch (error: any) {
    logger.error('RAG get memory error', error, { component: 'RAG' });
    throw error;
  }
};

/**
 * Delete a memory
 */
export const deleteMemory = async (memoryId: string): Promise<void> => {
  try {
    // Route through chat_service proxy to avoid gateway /rag/ auth issues
    await fastapiClient.delete(`/resonant-chat/memories/${memoryId}`);
  } catch (error: any) {
    logger.error('RAG delete memory error', error, { component: 'RAG' });
    throw error;
  }
};

/**
 * Get conversation history
 */
export const getConversation = async (conversationId: string, limit: number = 100): Promise<ConversationResponse[]> => {
  try {
    const response = await fastapiClient.get(`/rag/conversations/${conversationId}?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    logger.error('RAG get conversation error', error, { component: 'RAG' });
    throw error;
  }
};

/**
 * List user's conversations (returns IDs only)
 */
export const listConversationIds = async (limit: number = 1000): Promise<string[]> => {
  try {
    const response = await fastapiClient.get(`/rag/conversations?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    // Suppress connection errors - they're expected when backend is down
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG list conversations error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * List user's conversations with details
 */
export const listConversations = async (limit: number = 1000): Promise<ChatConversation[]> => {
  try {
    // Try to get conversations with details first
    const response = await fastapiClient.get(`/rag/conversations?limit=${limit}&include_details=true`);
    const data = response.data;
    
    // If API returns array of strings (IDs), convert to ChatConversation objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return data.map((id: string) => ({
        id,
        title: 'Conversation',
        message_count: 0,
      }));
    }
    
    // If API returns ChatConversation objects, return as-is
    return data;
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG list conversations error', error, { component: 'RAG' });
    }
    return [];
  }
};

/**
 * Update a memory
 */
export const updateMemory = async (memoryId: string, content: string, metadata?: Record<string, any>): Promise<MemoryResponse> => {
  try {
    const response = await fastapiClient.put(`/rag/memories/${memoryId}`, { content, metadata });
    return response.data;
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG update memory error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await fastapiClient.delete(`/rag/conversations/${conversationId}`);
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG delete conversation error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * Update a conversation title
 */
export const updateConversation = async (conversationId: string, title: string): Promise<void> => {
  try {
    await fastapiClient.put(`/rag/conversations/${conversationId}`, { title });
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG update conversation error', error, { component: 'RAG' });
    }
    throw error;
  }
};

/**
 * Upload a file for processing
 */
export const uploadFile = async (file: File): Promise<{ id: string; url?: string; content?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fastapiClient.post('/rag/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('RAG upload file error', error, { component: 'RAG' });
    }
    throw error;
  }
};

