import { getProviderConfig, type ProviderConfig } from './config';
import { type ProviderRequest, type ProviderResponse, type ProviderError } from './types';
import { logger } from '@/utils/logger';

/**
 * Google Gemini Provider Integration
 */
export class GeminiProvider {
  private config: ProviderConfig;

  constructor() {
    const configs = getProviderConfig();
    this.config = configs.gemini;
  }

  /**
   * Send a chat completion request to Gemini
   */
  async chat(request: ProviderRequest): Promise<ProviderResponse> {
    if (!this.config.enabled) {
      throw new Error('Gemini provider is not enabled');
    }

    try {
      const url = `${this.config.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

      // Transform messages to Gemini format
      const contents = request.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const body = {
        contents,
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 2000,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response text
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const finishReason = data.candidates?.[0]?.finishReason || '';

      // Extract usage if available
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined;

      return {
        content,
        model: this.config.model || 'gemini-2.0-flash',
        usage,
        finishReason,
      };
    } catch (error: any) {
      logger.error('Gemini API error', error, { component: 'GeminiProvider' });
      const providerError: ProviderError = {
        code: error.code || 'GEMINI_ERROR',
        message: error.message || 'Failed to call Gemini API',
        provider: 'gemini',
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
      const url = `${this.config.baseUrl}/models?key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
export const geminiProvider = new GeminiProvider();

