/**
 * Offline Embedding Utility
 * 
 * Bridge between frontend embedding generation and Electron storage.
 * Generates embeddings in renderer process and stores via Electron IPC.
 */

import { embeddingService } from '../services/embeddingService';

interface EmbeddingWithMetadata {
  id: string;
  text: string;
  vector: number[];
  metadata: {
    projectId: string;
    filePath?: string;
    language?: string;
    timestamp: number;
  };
  modelId: string;
}

/**
 * Generate and store embedding via Electron
 */
export async function generateAndStoreEmbedding(
  text: string,
  projectId: string,
  modelId: string = 'nomic-embed-text-v1.5',
  metadata?: {
    filePath?: string;
    language?: string;
  }
): Promise<{ success: boolean; embeddingId?: string; error?: string }> {
  try {
    // Generate embedding using frontend service (works in browser and Electron)
    const result = await embeddingService.generateEmbedding(text, modelId);
    
    if (!result) {
      return { success: false, error: 'Failed to generate embedding' };
    }

    console.log(`✅ Embedding generated: ${result.dimensions} dimensions`);

    // Check if running in Electron for storage
    if (!window.electron) {
      console.warn('⚠️ Not running in Electron - embedding generated but not stored');
      console.log('Embedding vector (first 5 values):', result.embedding.slice(0, 5));
      return { 
        success: false, 
        error: 'Not running in Electron. Embedding was generated but cannot be stored. Open this page in the Electron desktop app to store embeddings.' 
      };
    }

    // Create embedding object with metadata
    const embeddingId = `embed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const embedding: EmbeddingWithMetadata = {
      id: embeddingId,
      text,
      vector: result.embedding,
      metadata: {
        projectId,
        filePath: metadata?.filePath,
        language: metadata?.language,
        timestamp: Date.now(),
      },
      modelId: result.modelId,
    };

    // Store via Electron IPC
    const storeResult = await window.electron.embedding.store(embedding);
    
    if (!storeResult.success) {
      return { success: false, error: storeResult.error || 'Failed to store embedding' };
    }

    console.log(`✅ Embedding stored: ${embeddingId}`);
    return { success: true, embeddingId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateAndStoreEmbeddingsBatch(
  texts: Array<{
    text: string;
    metadata?: { filePath?: string; language?: string };
  }>,
  projectId: string,
  modelId: string = 'nomic-embed-text-v1.5'
): Promise<{
  success: number;
  errors: number;
  embeddingIds: string[];
}> {
  let success = 0;
  let errors = 0;
  const embeddingIds: string[] = [];

  for (const item of texts) {
    const result = await generateAndStoreEmbedding(
      item.text,
      projectId,
      modelId,
      item.metadata
    );

    if (result.success && result.embeddingId) {
      success++;
      embeddingIds.push(result.embeddingId);
    } else {
      errors++;
    }
  }

  return { success, errors, embeddingIds };
}

/**
 * Search for similar embeddings
 */
export async function searchEmbeddings(
  queryText: string,
  projectId?: string,
  limit: number = 10,
  modelId: string = 'nomic-embed-text-v1.5'
): Promise<{
  success: boolean;
  results?: Array<{
    id: string;
    text: string;
    score: number;
    metadata: any;
  }>;
  error?: string;
}> {
  try {
    if (!window.electron) {
      return { success: false, error: 'Not running in Electron' };
    }

    // Generate query embedding
    const queryResult = await embeddingService.generateEmbedding(queryText, modelId);
    
    if (!queryResult) {
      return { success: false, error: 'Failed to generate query embedding' };
    }

    // Search via Electron IPC
    const searchResult = await window.electron.embedding.search(
      JSON.stringify(queryResult.embedding),
      projectId
    );

    if (!searchResult.success) {
      return { success: false, error: searchResult.error };
    }

    return { success: true, results: searchResult.results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate embeddings for all files in a cached project
 */
export async function embedCachedProject(
  projectId: string,
  modelId: string = 'nomic-embed-text-v1.5'
): Promise<{
  success: boolean;
  embedded: number;
  errors: number;
  error?: string;
}> {
  try {
    if (!window.electron) {
      return { success: false, embedded: 0, errors: 0, error: 'Not running in Electron' };
    }

    // Get all cached files
    const filesResult = await window.electron.cache.listFiles(projectId);
    
    if (!filesResult.success || !filesResult.files) {
      return { success: false, embedded: 0, errors: 0, error: 'Failed to list cached files' };
    }

    // Generate embeddings for each file
    const embeddings: Array<{
      text: string;
      metadata: { filePath?: string; language?: string };
    }> = [];

    for (const file of filesResult.files) {
      // Get file content
      const fileResult = await window.electron.cache.getFile(projectId, file.filePath);
      
      if (fileResult.success && fileResult.content) {
        embeddings.push({
          text: fileResult.content,
          metadata: {
            filePath: file.filePath,
            language: file.metadata?.language,
          },
        });
      }
    }

    // Generate and store embeddings
    const result = await generateAndStoreEmbeddingsBatch(embeddings, projectId, modelId);

    return {
      success: true,
      embedded: result.success,
      errors: result.errors,
    };
  } catch (error: any) {
    return { success: false, embedded: 0, errors: 0, error: error.message };
  }
}

