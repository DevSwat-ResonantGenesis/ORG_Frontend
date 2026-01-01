/**
 * RAG Service (Frontend)
 * 
 * Frontend utility for performing RAG queries.
 * Generates query embeddings and calls Electron RAG service.
 */

import { embeddingService } from '../services/embeddingService';

interface RAGQueryOptions {
  projectId?: string;
  topK?: number;
  temperature?: number;
  maxTokens?: number;
  includeSources?: boolean;
  modelId?: string;
}

interface RAGResponse {
  success: boolean;
  answer?: string;
  sources?: Array<{
    text: string;
    score: number;
    metadata?: any;
  }>;
  tokensUsed?: number;
  error?: string;
}

/**
 * Perform a RAG query
 */
export async function ragQuery(
  queryText: string,
  options: RAGQueryOptions = {}
): Promise<RAGResponse> {
  try {
    // Check if running in Electron
    if (!window.electron) {
      return {
        success: false,
        error: 'Not running in Electron environment',
      };
    }

    const {
      projectId,
      topK = 5,
      temperature = 0.7,
      maxTokens = 500,
      includeSources = true,
      modelId = 'nomic-embed-text-v1.5',
    } = options;

    // Step 1: Generate query embedding
    const embeddingResult = await embeddingService.generateEmbedding(queryText, modelId);
    
    if (!embeddingResult) {
      return {
        success: false,
        error: 'Failed to generate query embedding',
      };
    }

    // Step 2: Perform RAG query via Electron
    const response = await window.electron.rag.query(queryText, {
      queryVector: embeddingResult.embedding,
      projectId,
      topK,
      temperature,
      maxTokens,
      includeSources,
    });

    return response;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'RAG query failed',
    };
  }
}

/**
 * Stream a RAG query response
 */
export async function* ragStreamQuery(
  queryText: string,
  options: RAGQueryOptions = {}
): AsyncGenerator<string, void, unknown> {
  try {
    if (!window.electron) {
      yield 'Error: Not running in Electron environment';
      return;
    }

    const {
      projectId,
      topK = 5,
      temperature = 0.7,
      maxTokens = 500,
      modelId = 'nomic-embed-text-v1.5',
    } = options;

    // Generate query embedding
    const embeddingResult = await embeddingService.generateEmbedding(queryText, modelId);
    
    if (!embeddingResult) {
      yield 'Error: Failed to generate query embedding';
      return;
    }

    // Start streaming query
    await window.electron.rag.streamQuery(queryText, {
      queryVector: embeddingResult.embedding,
      projectId,
      topK,
      temperature,
      maxTokens,
    });

    // Listen for stream chunks
    const chunks: string[] = [];
    let streamComplete = false;

    const unsubscribeChunk = window.electron.rag.onStreamChunk((chunk: string) => {
      chunks.push(chunk);
    });

    const unsubscribeComplete = window.electron.rag.onStreamComplete(() => {
      streamComplete = true;
    });

    // Yield chunks as they arrive
    while (!streamComplete) {
      if (chunks.length > 0) {
        const chunk = chunks.shift()!;
        yield chunk;
      } else {
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Yield remaining chunks
    while (chunks.length > 0) {
      yield chunks.shift()!;
    }

    // Cleanup
    unsubscribeChunk();
    unsubscribeComplete();
  } catch (error: any) {
    yield `Error: ${error.message}`;
  }
}

/**
 * Get RAG statistics
 */
export async function getRAGStats(): Promise<{
  success: boolean;
  totalEmbeddings?: number;
  projectsCount?: number;
  modelsAvailable?: number;
  error?: string;
}> {
  try {
    if (!window.electron) {
      return {
        success: false,
        error: 'Not running in Electron environment',
      };
    }

    const response = await window.electron.rag.getStats();
    return response;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get RAG stats',
    };
  }
}

/**
 * Helper function to perform RAG query with simpler API
 */
export async function askRAG(
  question: string,
  projectId?: string,
  options?: {
    topK?: number;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{
  answer: string;
  sources?: Array<{
    text: string;
    score: number;
    metadata?: any;
  }>;
  success: boolean;
  error?: string;
}> {
  const response = await ragQuery(question, {
    projectId,
    includeSources: true,
    ...options,
  });

  if (!response.success) {
    return {
      answer: `Error: ${response.error || 'RAG query failed'}`,
      success: false,
      error: response.error,
    };
  }

  return {
    answer: response.answer || 'No answer generated',
    sources: response.sources,
    success: true,
  };
}

