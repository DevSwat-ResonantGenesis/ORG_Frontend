import { getProviderConfig, type ProviderConfig } from './config';
import { type ProviderRequest, type ProviderResponse, type ProviderError } from './types';
import { logger } from '@/utils/logger';

/**
 * Mistral AI Provider Integration
 */
export class MistralProvider {
  private config: ProviderConfig;

  constructor() {
    const configs = getProviderConfig();
    this.config = configs.mistral;
  }

  /**
   * Send a chat completion request to Mistral
   */
  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.enabled) {
      throw new Error('Mistral provider is not enabled');
    }

    try {
      const url = `${this.config.baseUrl}/chat/completions`;

      // Transform messages to Mistral format (OpenAI-compatible)
      const messages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const body = {
        model: request.model || this.config.model || 'mistral-large-latest',
        messages,
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
        throw new Error(errorData.error?.message || `Mistral API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response
      const choice = data.choices?.[0];
      const content = choice?.message?.content || '';
      const finishReason = choice?.finish_reason || '';

      // Extract usage
      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined;

      return {
        content,
        model: data.model || this.config.model || 'mistral-large-latest',
        usage,
        finishReason,
      };
    } catch (error: any) {
      logger.error('Mistral API error', error, { component: 'MistralProvider' });
      const providerError: ProviderError = {
        code: error.code || 'MISTRAL_ERROR',
        message: error.message || 'Failed to call Mistral API',
        provider: 'mistral',
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
      const url = `${this.config.baseUrl}/models`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
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
export const mistralProvider = new MistralProvider();

