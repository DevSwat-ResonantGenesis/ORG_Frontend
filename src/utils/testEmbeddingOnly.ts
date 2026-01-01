/**
 * Test Embedding Generation Only (Browser Mode)
 * 
 * Generates embeddings without storing them.
 * Useful for testing in browser without Electron.
 */

import { embeddingService } from '../services/embeddingService';

/**
 * Generate embedding without storing (browser-only test)
 */
export async function testGenerateEmbedding(
  text: string,
  modelId: string = 'nomic-embed-text-v1.5'
): Promise<{
  success: boolean;
  embedding?: number[];
  dimensions?: number;
  error?: string;
}> {
  try {
    console.log('🧠 Generating embedding (test mode - no storage)...');
    
    const result = await embeddingService.generateEmbedding(text, modelId);
    
    if (!result) {
      return { success: false, error: 'Failed to generate embedding' };
    }

    console.log(`✅ Embedding generated: ${result.dimensions} dimensions`);
    console.log('First 10 values:', result.embedding.slice(0, 10));
    
    return {
      success: true,
      embedding: result.embedding,
      dimensions: result.dimensions,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

