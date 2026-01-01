/**
 * Provider Types and Interfaces
 */

export type ProviderName = 'gemini' | 'groq' | 'openai' | 'mistral' | 'cohere' | 'anthropic' | 'auto';

export interface ProviderMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ProviderRequest {
  messages: ProviderMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ProviderResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ProviderError {
  code: string;
  message: string;
  provider: ProviderName;
}

export interface ProviderHealth {
  provider: ProviderName;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  lastChecked?: string;
}

export interface ProviderStats {
  provider: ProviderName;
  requestsCount: number;
  tokensUsed: number;
  averageLatency: number;
  errorRate: number;
  cost: number;
}

