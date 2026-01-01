import { getProviderConfig, type ProviderConfig } from './config';
import { type ProviderRequest, type ProviderResponse, type ProviderError } from './types';
import { logger } from '@/utils/logger';

/**
 * Cohere Provider Integration
 */
export class CohereProvider {
  private config: ProviderConfig;

  constructor() {
    const configs = getProviderConfig();
    this.config = configs.cohere;
  }

  /**
   * Send a chat completion request to Cohere
   */
  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.enabled) {
      throw new Error('Cohere provider is not enabled');
    }

    try {
      const url = `${this.config.baseUrl}/chat`;

      // Transform messages to Cohere format
      const chatHistory = request.messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: msg.content,
      }));

      const body = {
        model: request.model || this.config.model || 'command-r-plus',
        message: request.messages[request.messages.length - 1]?.content || '',
        chat_history: chatHistory,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
        stream: request.stream || false,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Cohere API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response
      const content = data.text || data.message || '';
      const finishReason = data.finish_reason || '';

      // Extract usage
      const usage = data.meta?.tokens ? {
        promptTokens: data.meta.tokens.input_tokens || 0,
        completionTokens: data.meta.tokens.generated_tokens || 0,
        totalTokens: (data.meta.tokens.input_tokens || 0) + (data.meta.tokens.generated_tokens || 0),
      } : undefined;

      return {
        content,
        model: data.model_id || this.config.model || 'command-r-plus',
        usage,
        finishReason,
      };
    } catch (error: any) {
      logger.error('Cohere API error', error, { component: 'CohereProvider' });
      const providerError: ProviderError = {
        code: error.code || 'COHERE_ERROR',
        message: error.message || 'Failed to call Cohere API',
        provider: 'cohere',
      };
      throw providerError;
    }
  }

  /**
   * Check provider health
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'down'; latency?: number }> {
    if (!this.config.enabled) {
      return { status: 'down' };
    }

    try {
      const startTime = Date.now();
      // Cohere doesn't have a models endpoint, use a simple chat request
      const url = `${this.config.baseUrl}/chat`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'command-r-plus',
          message: 'test',
          max_tokens: 1,
        }),
      });

      const latency = Date.now() - startTime;

      if (response.ok || response.status === 400) { // 400 might be expected for test
        return { status: 'healthy', latency };
      } else {
        return { status: 'down', latency };
      }
    } catch (error) {
      return { status: 'down' };
    }
  }
}

/**
 * Singleton instance
 */
export const cohereProvider = new CohereProvider();

