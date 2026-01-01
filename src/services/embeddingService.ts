/**
 * Embedding Service (Frontend)
 * 
 * Generates embeddings using @xenova/transformers WebAssembly models.
 * Works in the browser/Electron renderer process.
 */

import { pipeline, Pipeline, PipelineType, env } from '@xenova/transformers';

interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  modelId: string;
}

interface ModelConfig {
  id: string;
  name: string;
  modelPath: string;
  dimensions: number;
  maxLength: number;
}

export class EmbeddingService {
  private static instance: EmbeddingService;
  private loadedModel: any = null; // Using any to avoid type issues with transformers.js
  private currentModelId: string | null = null;
  private loadingPromise: Promise<void> | null = null;

  // Supported models configuration
  private readonly MODELS: Record<string, ModelConfig> = {
    'nomic-embed-text-v1.5': {
      id: 'nomic-embed-text-v1.5',
      name: 'Nomic Embed Text v1.5',
      modelPath: 'nomic-ai/nomic-embed-text-v1.5', // Original HuggingFace repository
      dimensions: 768,
      maxLength: 8192,
    },
    'multilingual-e5-base': {
      id: 'multilingual-e5-base',
      name: 'Multilingual E5 Base',
      modelPath: 'Xenova/multilingual-e5-base',
      dimensions: 768,
      maxLength: 512,
    },
    'jina-embeddings-v2-base-en': {
      id: 'jina-embeddings-v2-base-en',
      name: 'Jina Embeddings v2 Base EN',
      modelPath: 'Xenova/jina-embeddings-v2-base-en',
      dimensions: 768,
      maxLength: 8192,
    },
  };

  private constructor() {
    // Singleton pattern
    // Configure transformers.js cache directory in Electron
    // This is async but we call it in constructor - it will complete before first use
    this.configureCacheDirectory().catch(err => {
      console.warn('Failed to configure cache:', err);
    });
  }

  /**
   * Configure transformers.js cache directory and remote settings for Electron
   */
  private async configureCacheDirectory(): Promise<void> {
    try {
      // Check if we're in Electron
      if (typeof window !== 'undefined' && (window as any).electron?.getHomeDir) {
        try {
          // Get home directory from Electron
          const homeDir = await (window as any).electron.getHomeDir();
          if (homeDir) {
            const cacheDir = `${homeDir}/.cache/huggingface`;
            env.cacheDir = cacheDir;
            
            // CRITICAL: Allow loading from localhost HTTP server
            // transformers.js treats ANY HTTP URL (including localhost) as "remote"
            // So we MUST allow remote models to load from http://localhost:8788
            try {
              env.allowRemoteModels = true;  // REQUIRED for http://localhost
              (env as any).allowLocalModels = true;
            } catch (e) {
              // These properties might not exist in this version
            }
            
            console.log(`✅ Using HuggingFace cache: ${cacheDir}`);
            console.log(`✅ Allow remote models: true (required for localhost HTTP server)`);
            console.log(`   Local model files at: ${cacheDir}/hub/models--nomic-ai--nomic-embed-text-v1.5/snapshots/main`);
          }
        } catch (e) {
          console.warn('⚠️ Could not get home directory, using default cache');
        }
      } else {
        // Browser: use default cache
        console.log(`📦 Using browser default cache for transformers.js`);
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to configure cache directory:', error.message);
    }
  }

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Get available models
   */
  getAvailableModels(): ModelConfig[] {
    return Object.values(this.MODELS);
  }

  /**
   * Load an embedding model
   * 
   * In Electron: Downloads model via main process (no CORS), then loads from local path
   * In Browser: Attempts direct download (may fail due to CORS)
   */
  async loadModel(modelId: string = 'nomic-embed-text-v1.5'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // If already loading, wait for it
      if (this.loadingPromise) {
        await this.loadingPromise;
        if (this.currentModelId === modelId) {
          return { success: true };
        }
      }

      // If already loaded, return success
      if (this.loadedModel && this.currentModelId === modelId) {
        return { success: true };
      }

      const modelConfig = this.MODELS[modelId];
      if (!modelConfig) {
        return { success: false, error: `Model ${modelId} not found` };
      }

      // Load model using transformers.js
      this.loadingPromise = (async () => {
        try {
          console.log(`📥 Loading embedding model: ${modelConfig.name}...`);
          
          // CORRECT APPROACH: Ensure model is downloaded in MAIN PROCESS first
          // Then serve via HTTP to renderer (transformers.js can fetch via HTTP)
          let modelUrl: string | null = null;
          
          if (typeof window !== 'undefined' && (window as any).electron?.rg_offline) {
            try {
              // Use ChatGPT's simpler approach: installModel ensures download
              // Map modelId to HuggingFace repo name
              const repoMap: Record<string, string> = {
                'nomic-embed-text-v1.5': 'Xenova/nomic-embed-text-v1.5',
              };
              const modelName = repoMap[modelId] || modelId;
              
              console.log(`   📥 Ensuring model is downloaded: ${modelName}...`);
              
              // This downloads in MAIN PROCESS if not already downloaded
              const installResult = await (window as any).electron.rg_offline.installModel(modelName);
              
              if (!installResult.ok) {
                throw new Error(`Failed to install model: ${installResult.error}`);
              }
              
              console.log(`   ✅ Model installed/ready at: ${installResult.path}`);
              
              // Get model path and serve via HTTP
              // Model file server runs on localhost:8788
              // Serves files from: userData/models/embeddings/modelId/
              // CRITICAL: Trailing slash required - without it, transformers.js treats this as a HuggingFace model name!
              modelUrl = `http://localhost:8788/models/${modelId}/`;
              
              console.log(`   ✅ Using local HTTP server: ${modelUrl}`);
              console.log(`   ✅ Model downloaded in MAIN PROCESS (no CORS!)`);
              console.log(`   ✅ Served via HTTP to renderer`);
            } catch (e: any) {
              console.warn('   ⚠️ Could not ensure model download:', e.message);
              // Fall through to use model ID (will try to download via transformers.js)
            }
          } else if (typeof window !== 'undefined' && (window as any).electron?.modelDownload) {
            // Fallback to existing method
            try {
              const isDownloaded = await (window as any).electron.modelDownload.isDownloaded(modelId);
              
              if (!isDownloaded) {
                console.log(`   📥 Model not downloaded, downloading in MAIN PROCESS...`);
                const downloadResult = await (window as any).electron.modelDownload.download(modelId);
                if (!downloadResult.success) {
                  throw new Error(`Failed to download model: ${downloadResult.error}`);
                }
                console.log(`   ✅ Model downloaded successfully in MAIN PROCESS!`);
              }
              
              const pathResult = await (window as any).electron.modelDownload.getModelPath(modelId);
              if (pathResult.success) {
                // CRITICAL: Trailing slash required - without it, transformers.js treats this as a HuggingFace model name!
                modelUrl = `http://localhost:8788/models/${modelId}/`;
                console.log(`   ✅ Using local HTTP server: ${modelUrl}`);
              }
            } catch (e: any) {
              console.warn('   ⚠️ Could not ensure model download:', e.message);
            }
          }
          
          // Use local HTTP URL if available, otherwise fall back to model ID
          const modelPathToUse = modelUrl || modelConfig.modelPath;
          console.log(`   Loading model from: ${modelPathToUse}`);
          
          this.loadedModel = await pipeline(
            'feature-extraction',
            modelPathToUse, // Use HTTP URL from local server or fallback to model ID
            {
              quantized: true,
              progress_callback: (progress: any) => {
                if (progress.status === 'progress') {
                  let percent = progress.progress;
                  if (percent <= 1) {
                    percent = percent * 100;
                  }
                  const rounded = Math.round(percent);
                  if (rounded >= 0 && rounded <= 100) {
                    const action = progress.file ? 'Loading' : 'Downloading';
                    console.log(`   ${action}: ${rounded}%`);
                  }
                } else if (progress.status) {
                  console.log(`   Status: ${progress.status}`);
                  if (progress.file) {
                    console.log(`   File: ${progress.file}`);
                  }
                }
              },
            }
          );
          
          this.currentModelId = modelId;
          console.log(`✅ Model loaded successfully!`);
        } catch (error: any) {
          console.error('❌ Failed to load model:', error);
          
          // Provide more helpful error messages
          if (error.message?.includes('<!doctype') || error.message?.includes('Unexpected token')) {
            console.error('   ⚠️ Got HTML instead of model files - CORS issue');
            console.error('   💡 In Electron: Model should download via main process');
            console.error('   💡 In Browser: HuggingFace blocks direct downloads');
            console.error('   💡 Solution: Use Electron app for offline mode');
          }
          
          throw error;
        } finally {
          this.loadingPromise = null;
        }
      })();

      await this.loadingPromise;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(
    text: string,
    modelId?: string
  ): Promise<EmbeddingResult | null> {
    try {
      const targetModelId = modelId || this.currentModelId || 'nomic-embed-text-v1.5';

      // Load model if needed
      if (!this.loadedModel || this.currentModelId !== targetModelId) {
        const loadResult = await this.loadModel(targetModelId);
        if (!loadResult.success) {
          console.error('Failed to load model:', loadResult.error);
          return null;
        }
      }

      if (!this.loadedModel) {
        return null;
      }

      const modelConfig = this.MODELS[targetModelId];
      if (!modelConfig) {
        return null;
      }

      // Truncate text if too long
      const maxChars = modelConfig.maxLength * 4; // Rough estimate
      const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

      // Generate embedding
      const result = await this.loadedModel(truncatedText, {
        pooling: 'mean', // Average pooling for sentence embeddings
        normalize: true, // Normalize vectors for cosine similarity
      });

      // Extract embedding vector
      const embedding = Array.from(result.data) as number[];

      return {
        embedding,
        dimensions: embedding.length,
        modelId: targetModelId,
      };
    } catch (error: any) {
      console.error('Failed to generate embedding:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   */
  async generateEmbeddingsBatch(
    texts: string[],
    modelId?: string
  ): Promise<(EmbeddingResult | null)[]> {
    const results: (EmbeddingResult | null)[] = [];

    // Generate embeddings sequentially (can be optimized later)
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text, modelId);
      results.push(embedding);
    }

    return results;
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.loadedModel !== null;
  }

  /**
   * Get current model ID
   */
  getCurrentModelId(): string | null {
    return this.currentModelId;
  }

  /**
   * Unload current model (free memory)
   */
  async unloadModel(): Promise<void> {
    if (this.loadedModel) {
      // Cleanup if needed
      this.loadedModel = null;
      this.currentModelId = null;
    }
  }
}

// Export singleton instance
export const embeddingService = EmbeddingService.getInstance();

