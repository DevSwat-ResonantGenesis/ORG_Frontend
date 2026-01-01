import { getProviderConfig, type ProviderConfig } from './config';
import { type ProviderRequest, type ProviderResponse, type ProviderError } from './types';
import { logger } from '@/utils/logger';

/**
 * Anthropic/Claude Provider Integration
 */
export class AnthropicProvider {
  private config: ProviderConfig;

  constructor() {
    const configs = getProviderConfig();
    this.config = configs.anthropic;
  }

  /**
   * Send a chat completion request to Anthropic
   */
  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.enabled) {
      throw new Error('Anthropic provider is not enabled');
    }

    try {
      const url = `${this.config.baseUrl}/messages`;

      // Transform messages to Anthropic format
      const messages = request.messages
        .filter(msg => msg.role !== 'system') // Anthropic handles system separately
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        }));

      // Extract system message if present
      const systemMessage = request.messages.find(msg => msg.role === 'system')?.content;

      const body: any = {
        model: request.model || this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens || 2000,
        messages,
        temperature: request.temperature || 0.7,
      };

      if (systemMessage) {
        body.system = systemMessage;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response
      const content = data.content?.[0]?.text || '';
      const finishReason = data.stop_reason || '';

      // Extract usage
      const usage = data.usage ? {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      } : undefined;

      return {
        content,
        model: data.model || this.config.model || 'claude-3-5-sonnet-20241022',
        usage,
        finishReason,
      };
    } catch (error: any) {
      logger.error('Anthropic API error', error, { component: 'AnthropicProvider' });
      const providerError: ProviderError = {
        code: error.code || 'ANTHROPIC_ERROR',
        message: error.message || 'Failed to call Anthropic API',
        provider: 'anthropic',
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
      // Anthropic doesn't have a models endpoint, use a simple message request
      const url = `${this.config.baseUrl}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
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
export const anthropicProvider = new AnthropicProvider();

