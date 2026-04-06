import { geminiProvider } from './gemini';
import { groqProvider } from './groq';
import { openaiProvider } from './openai';
import { mistralProvider } from './mistral';
import { cohereProvider } from './cohere';
import { anthropicProvider } from './anthropic';
import { isProviderEnabled } from './config';
import { type ProviderName, type ProviderRequest, type ProviderResponse, type ProviderError } from './types';
import { logger } from '@/utils/logger';
// DSIDP tracking removed — service killed
const trackLLMUsage = (..._args: unknown[]) => {};
const trackResponseTime = (_duration: number) => {};

/**
 * Provider Router
 * Routes requests to the appropriate AI provider
 */

export interface RouterOptions {
  provider?: ProviderName;
  temperature?: number;
  maxTokens?: number;
  preferFast?: boolean; // Prefer faster providers (Groq)
  preferQuality?: boolean; // Prefer higher quality (OpenAI GPT-4)
}

/**
 * Route a chat request to the appropriate provider
 */
export async function routeToProvider(
  request: ProviderRequest,
  options: RouterOptions = {}
): Promise<ProviderResponse & { provider: ProviderName }> {
  const { provider = 'auto', temperature, maxTokens, preferFast, preferQuality } = options;

  let selectedProvider: ProviderName = provider;

  // Auto-select provider based on preferences
  if (provider === 'auto') {
    if (preferFast) {
      selectedProvider = isProviderEnabled('groq') ? 'groq' : 'openai';
    } else if (preferQuality) {
      selectedProvider = isProviderEnabled('openai') ? 'openai' : 'groq';
    } else {
      // Default: try Groq first (fast and free), then OpenAI, then others
      if (isProviderEnabled('groq')) {
        selectedProvider = 'groq';
      } else if (isProviderEnabled('openai')) {
        selectedProvider = 'openai';
      } else if (isProviderEnabled('anthropic')) {
        selectedProvider = 'anthropic';
      } else if (isProviderEnabled('mistral')) {
        selectedProvider = 'mistral';
      } else if (isProviderEnabled('cohere')) {
        selectedProvider = 'cohere';
      } else if (isProviderEnabled('gemini')) {
        selectedProvider = 'gemini';
      } else {
        throw new Error('No providers are enabled');
      }
    }
  }

  // Prepare request with options
  const providerRequest: ProviderRequest = {
    ...request,
    temperature: temperature ?? request.temperature,
    maxTokens: maxTokens ?? request.maxTokens,
  };

  const startTime = performance.now();
  
  try {
    let response: ProviderResponse;

    switch (selectedProvider) {
      case 'gemini':
        response = await geminiProvider.chat(providerRequest);
        break;
      case 'groq':
        response = await groqProvider.chat(providerRequest);
        break;
      case 'openai':
        response = await openaiProvider.chat(providerRequest);
        break;
      case 'mistral':
        response = await mistralProvider.chat(providerRequest);
        break;
      case 'cohere':
        response = await cohereProvider.chat(providerRequest);
        break;
      case 'anthropic':
        response = await anthropicProvider.chat(providerRequest);
        break;
      default:
        throw new Error(`Unknown provider: ${selectedProvider}`);
    }

    // Track response time and LLM usage (local no-op)
    const duration = performance.now() - startTime;
    trackResponseTime(duration);
    
    if (response.usage) {
      trackLLMUsage(
        response.model || selectedProvider,
        response.usage.promptTokens,
        response.usage.completionTokens
      );
    }

    return {
      ...response,
      provider: selectedProvider,
    };
  } catch (error: any) {
    logger.error(`Provider ${selectedProvider} failed`, error, { component: 'ProviderRouter' });

    // If auto mode and first provider failed, try fallback
    if (provider === 'auto' && selectedProvider !== 'openai') {
      logger.info(`Falling back to OpenAI after ${selectedProvider} failure`, { component: 'ProviderRouter' });
      try {
        if (isProviderEnabled('openai')) {
          const fallbackResponse = await openaiProvider.chat(providerRequest);
          // Track fallback usage
          if (fallbackResponse.usage) {
            trackLLMUsage(
              fallbackResponse.model || 'openai',
              fallbackResponse.usage.promptTokens,
              fallbackResponse.usage.completionTokens
            );
          }
          return {
            ...fallbackResponse,
            provider: 'openai',
          };
        }
      } catch (fallbackError) {
        logger.error('Fallback provider also failed', fallbackError, { component: 'ProviderRouter' });
      }
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Get health status for all providers
 */
export async function getProvidersHealth(): Promise<Record<ProviderName, { status: 'healthy' | 'down' | 'unknown'; latency?: number }>> {
  const health: Record<string, any> = {};

  const providers: ProviderName[] = ['gemini', 'groq', 'openai', 'mistral', 'cohere', 'anthropic'];

  await Promise.all(
    providers.map(async (provider) => {
      try {
        let result;
        switch (provider) {
          case 'gemini':
            result = await geminiProvider.healthCheck();
            break;
          case 'groq':
            result = await groqProvider.healthCheck();
            break;
          case 'openai':
            result = await openaiProvider.healthCheck();
            break;
          case 'mistral':
            result = await mistralProvider.healthCheck();
            break;
          case 'cohere':
            result = await cohereProvider.healthCheck();
            break;
          case 'anthropic':
            result = await anthropicProvider.healthCheck();
            break;
        }
        health[provider] = result;
      } catch (error) {
        health[provider] = { status: 'unknown' };
      }
    })
  );

  return health as Record<ProviderName, { status: 'healthy' | 'down' | 'unknown'; latency?: number }>;
}

/**
 * Get list of available providers
 */
export function getAvailableProviders(): ProviderName[] {
  const providers: ProviderName[] = ['auto'];
  
  if (isProviderEnabled('gemini')) providers.push('gemini');
  if (isProviderEnabled('groq')) providers.push('groq');
  if (isProviderEnabled('openai')) providers.push('openai');
  if (isProviderEnabled('mistral')) providers.push('mistral');
  if (isProviderEnabled('cohere')) providers.push('cohere');
  if (isProviderEnabled('anthropic')) providers.push('anthropic');

  return providers;
}

