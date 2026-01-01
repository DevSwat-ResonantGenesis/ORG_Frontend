/// <reference types="vite/client" />

declare module '*.glsl?raw' { const content: string; export default content; }

// Electron Embedding API
interface ElectronEmbeddingAPI {
  getStats: () => Promise<any>;
  store: (embedding: any) => Promise<any>;
  search: (query: string, options?: any) => Promise<any>;
}

// Electron RAG API
interface ElectronRAGAPI {
  query: (text: string, options?: any) => Promise<any>;
  streamQuery: (text: string, options?: any) => Promise<any>;
  onStreamChunk: (callback: (chunk: string) => void) => () => void;
  onStreamComplete: (callback: () => void) => () => void;
  getStats: () => Promise<any>;
}

// Electron Sync API
interface ElectronSyncAPI {
  getStatus: () => Promise<any>;
  getStats: () => Promise<any>;
  getQueue: () => Promise<any>;
  startSync: () => Promise<void>;
  clearCompleted: () => Promise<any>;
  onOnline: (callback: () => void) => () => void;
  onOffline: (callback: () => void) => () => void;
  onActionQueued: (callback: (action: any) => void) => () => void;
  onActionCompleted: (callback: () => void) => () => void;
  onActionFailed: (callback: () => void) => () => void;
}

// Electron Cache API
interface ElectronCacheAPI {
  getStats: () => Promise<any>;
  syncProject: (projectId: string, path: string) => Promise<any>;
  clearProject: (projectId: string) => Promise<any>;
  listFiles: (projectId: string) => Promise<any>;
  getFile: (projectId: string, filePath: string) => Promise<any>;
}

// Electron API types for desktop app
interface ElectronAPI {
  // Legacy methods
  getEmbeddingStats?: () => Promise<any>;
  generateEmbedding?: (text: string) => Promise<number[]>;
  searchSimilar?: (query: string, topK?: number) => Promise<any[]>;
  storeEmbedding?: (id: string, text: string, metadata?: any) => Promise<void>;
  invoke?: (channel: string, ...args: any[]) => Promise<any>;
  
  // Namespaced APIs
  embedding: ElectronEmbeddingAPI;
  rag: ElectronRAGAPI;
  sync: ElectronSyncAPI;
  cache: ElectronCacheAPI;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
