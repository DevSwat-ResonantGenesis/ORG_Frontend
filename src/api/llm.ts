/**
 * LLM Service API - Direct access to language models, embeddings, and providers
 */

import client from './client';

// Types
export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  status: 'available' | 'unavailable' | 'rate_limited';
  features: string[];
}

export interface LLMModel {
  id: string;
  provider: string;
  name: string;
  context_length: number;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  supports_streaming: boolean;
  supports_functions: boolean;
  supports_vision: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  functions?: FunctionDefinition[];
  stream?: boolean;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ChatResponse {
  id: string;
  model: string;
  provider: string;
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter';
}

export interface CompletionRequest {
  prompt: string;
  model?: string;
  provider?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
}

export interface CompletionResponse {
  id: string;
  model: string;
  provider: string;
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  provider?: string;
}

export interface EmbeddingResponse {
  model: string;
  provider: string;
  embeddings: number[][];
  usage: {
    total_tokens: number;
  };
}

export interface TokenCountResponse {
  text: string;
  token_count: number;
  model: string;
}

// Provider APIs
export const listProviders = async (): Promise<LLMProvider[]> => {
  const res = await client.get('/llm/providers');
  return res.data;
};

export const getProvider = async (providerId: string): Promise<LLMProvider> => {
  const res = await client.get(`/llm/providers/${providerId}`);
  return res.data;
};

export const checkProviderHealth = async (providerId: string): Promise<{
  provider: string;
  status: string;
  latency_ms: number;
}> => {
  const res = await client.get(`/llm/providers/${providerId}/health`);
  return res.data;
};

// Model APIs
export const listModels = async (provider?: string): Promise<LLMModel[]> => {
  const params = provider ? { provider } : {};
  const res = await client.get('/llm/models', { params });
  return res.data;
};

export const getModel = async (modelId: string): Promise<LLMModel> => {
  const res = await client.get(`/llm/models/${modelId}`);
  return res.data;
};

// Chat Completion API
export const chat = async (request: ChatRequest): Promise<ChatResponse> => {
  const res = await client.post('/llm/chat', request);
  return res.data;
};

// Streaming Chat (returns EventSource URL or handles streaming)
export const chatStream = async (
  request: ChatRequest,
  onChunk: (chunk: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<void> => {
  const res = await client.post('/llm/chat/stream', { ...request, stream: true }, {
    responseType: 'stream',
    onDownloadProgress: (progressEvent) => {
      const chunk = progressEvent.event?.target?.response;
      if (chunk) {
        onChunk(chunk);
      }
    },
  });
  
  if (onDone) onDone();
};

// Text Completion API
export const complete = async (request: CompletionRequest): Promise<CompletionResponse> => {
  const res = await client.post('/llm/complete', request);
  return res.data;
};

// Embedding API
export const embed = async (request: EmbeddingRequest): Promise<EmbeddingResponse> => {
  const res = await client.post('/llm/embed', request);
  return res.data;
};

// Token Counting
export const countTokens = async (
  text: string,
  model?: string
): Promise<TokenCountResponse> => {
  const res = await client.post('/llm/tokens/count', { text, model });
  return res.data;
};

// Usage Stats
export const getUsageStats = async (
  startDate?: string,
  endDate?: string
): Promise<{
  total_tokens: number;
  total_cost: number;
  by_provider: Record<string, { tokens: number; cost: number }>;
  by_model: Record<string, { tokens: number; cost: number }>;
}> => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const res = await client.get('/llm/usage', { params });
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/llm/health');
  return res.data;
};

export default {
  listProviders,
  getProvider,
  checkProviderHealth,
  listModels,
  getModel,
  chat,
  chatStream,
  complete,
  embed,
  countTokens,
  getUsageStats,
  healthCheck,
};
