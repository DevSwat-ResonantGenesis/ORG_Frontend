/**
 * Provider API Key Configuration
 * 
 * IMPORTANT: In production, these should be stored in environment variables
 * and managed by the backend. Never expose API keys in frontend code.
 */

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
}

export interface ProvidersConfig {
  gemini: ProviderConfig;
  groq: ProviderConfig;
  openai: ProviderConfig;
  mistral: ProviderConfig;
  cohere: ProviderConfig;
  anthropic: ProviderConfig;
}

/**
 * Get provider configuration from environment variables
 * Falls back to default keys if env vars not set (for development only)
 */
export const getProviderConfig = (): ProvidersConfig => {
  // In production, these should come from environment variables only
  // No hardcoded keys for security - must be set via environment variables
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || '';
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  // These providers are not configured (no API keys available)
  const mistralKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
  const cohereKey = import.meta.env.VITE_COHERE_API_KEY || '';
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

  return {
    gemini: {
      apiKey: geminiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.0-flash', // Updated to use available model
      enabled: !!geminiKey,
    },
    groq: {
      apiKey: groqKey,
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile', // Updated: llama-3.1-70b-versatile was decommissioned (replaced Jan 24, 2025)
      enabled: !!groqKey,
    },
    openai: {
      apiKey: openaiKey,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
      enabled: !!openaiKey,
    },
    mistral: {
      apiKey: mistralKey,
      baseUrl: 'https://api.mistral.ai/v1',
      model: 'mistral-large-latest',
      enabled: !!mistralKey,
    },
    cohere: {
      apiKey: cohereKey,
      baseUrl: 'https://api.cohere.com/v1',
      model: 'command-r-plus',
      enabled: !!cohereKey,
    },
    anthropic: {
      apiKey: anthropicKey,
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-sonnet-20241022',
      enabled: !!anthropicKey,
    },
  };
};

/**
 * Get API key for a specific provider
 */
export const getProviderApiKey = (provider: 'gemini' | 'groq' | 'openai' | 'mistral' | 'cohere' | 'anthropic'): string => {
  const config = getProviderConfig();
  return config[provider].apiKey;
};

/**
 * Check if a provider is enabled
 */
export const isProviderEnabled = (provider: 'gemini' | 'groq' | 'openai' | 'mistral' | 'cohere' | 'anthropic'): boolean => {
  const config = getProviderConfig();
  return config[provider].enabled;
};

