/**
 * User API Keys Management
 * For BYOK (Bring Your Own Key) functionality
 * Users can add their own OpenAI, Anthropic, etc. API keys
 */

import fastapiClient from './fastapiClient';

export interface UserApiKey {
  id: string;
  provider: string;           // 'openai', 'anthropic', 'google', 'mistral', 'groq'
  name: string;               // User-friendly name
  keyPrefix: string;          // First 8 chars of key for display (e.g., "sk-proj-...")
  isValid: boolean;           // Whether key has been validated
  lastUsed: string | null;    // ISO date of last use
  createdAt: string;          // ISO date created
  usageTokens: number;        // Total tokens used with this key
}

export interface TrialStatus {
  isTrialUser: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  daysRemaining: number;
  isExpired: boolean;
  hasApiKey: boolean;
  canUseServices: boolean;    // true if has valid API key and trial not expired, or paid plan
  requiresUpgrade: boolean;   // true if trial expired
  currentPlan: string;
}

export interface AddApiKeyRequest {
  provider: string;
  apiKey: string;
  name?: string;
}

export interface ValidateApiKeyResponse {
  valid: boolean;
  provider: string;
  error?: string;
  models?: string[];          // Available models for this key
}

/**
 * Get all user API keys (keys are masked, only prefix shown)
 */
export const fetchUserApiKeys = async (): Promise<UserApiKey[]> => {
  try {
    const res = await fastapiClient.get('/user/api-keys');
    const rawKeys = res.data?.keys || res.data || [];
    // Map snake_case from backend to camelCase for frontend
    return rawKeys.map((key: any) => ({
      id: key.id,
      provider: key.provider,
      name: key.name,
      keyPrefix: key.key_prefix || key.keyPrefix || '***',
      isValid: key.is_valid ?? key.isValid ?? false,
      lastUsed: key.last_used || key.lastUsed || null,
      createdAt: key.created_at || key.createdAt || '',
      usageTokens: key.usage_tokens || key.usageTokens || 0,
    }));
  } catch (error: any) {
    console.error('Failed to fetch user API keys:', error);
    return [];
  }
};

/**
 * Add a new API key
 */
export const addUserApiKey = async (request: AddApiKeyRequest): Promise<{
  success: boolean;
  key?: UserApiKey;
  error?: string;
}> => {
  try {
    const res = await fastapiClient.post('/user/api-keys', {
      provider: request.provider,
      api_key: request.apiKey,
      name: request.name || `${request.provider} Key`,
    });
    // Map snake_case response to camelCase
    const data = res.data;
    const key: UserApiKey = {
      id: data.id,
      provider: data.provider,
      name: data.name,
      keyPrefix: data.key_prefix || data.keyPrefix || '***',
      isValid: data.is_valid ?? data.isValid ?? true,
      lastUsed: data.last_used || data.lastUsed || null,
      createdAt: data.created_at || data.createdAt || '',
      usageTokens: data.usage_tokens || data.usageTokens || 0,
    };
    return { success: true, key };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.detail || error?.message || 'Failed to add API key',
    };
  }
};

/**
 * Validate an API key before adding
 */
export const validateApiKey = async (provider: string, apiKey: string): Promise<ValidateApiKeyResponse> => {
  try {
    const res = await fastapiClient.post('/user/api-keys/validate', {
      provider,
      api_key: apiKey,
    });
    return res.data;
  } catch (error: any) {
    return {
      valid: false,
      provider,
      error: error?.response?.data?.detail || error?.message || 'Validation failed',
    };
  }
};

/**
 * Delete a user API key
 */
export const deleteUserApiKey = async (keyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await fastapiClient.delete(`/user/api-keys/${keyId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.detail || error?.message || 'Failed to delete API key',
    };
  }
};

/**
 * Get trial status for current user
 */
export const fetchTrialStatus = async (): Promise<TrialStatus> => {
  try {
    const res = await fastapiClient.get('/user/trial-status');
    return res.data;
  } catch (error: any) {
    console.error('Failed to fetch trial status:', error);
    // Return default expired trial status
    return {
      isTrialUser: false,
      trialStartDate: null,
      trialEndDate: null,
      daysRemaining: 0,
      isExpired: true,
      hasApiKey: false,
      canUseServices: false,
      requiresUpgrade: true,
      currentPlan: 'none',
    };
  }
};

/**
 * Check if user can access services (has valid API key or paid plan)
 */
export const checkServiceAccess = async (): Promise<{
  canAccess: boolean;
  reason?: string;
  action?: 'add-api-key' | 'upgrade-plan' | 'none';
}> => {
  try {
    const res = await fastapiClient.get('/user/service-access');
    return res.data;
  } catch (error: any) {
    return {
      canAccess: false,
      reason: 'Unable to verify access',
      action: 'upgrade-plan',
    };
  }
};

/**
 * Supported API key providers
 * Users can add their own keys for any of these providers (BYOK)
 */
export const API_KEY_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', placeholder: 'sk-proj-...', helpUrl: 'https://platform.openai.com/api-keys', models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
  { id: 'anthropic', name: 'Anthropic (Claude)', placeholder: 'sk-ant-...', helpUrl: 'https://console.anthropic.com/settings/keys', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { id: 'google', name: 'Google (Gemini)', placeholder: 'AIza...', helpUrl: 'https://aistudio.google.com/app/apikey', models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'] },
  { id: 'mistral', name: 'Mistral AI', placeholder: '...', helpUrl: 'https://console.mistral.ai/api-keys', models: ['mistral-large', 'mistral-medium', 'mistral-small'] },
  { id: 'groq', name: 'Groq (Fast)', placeholder: 'gsk_...', helpUrl: 'https://console.groq.com/keys', models: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'] },
  { id: 'cohere', name: 'Cohere', placeholder: '...', helpUrl: 'https://dashboard.cohere.com/api-keys', models: ['command-r-plus', 'command-r', 'command'] },
  { id: 'together', name: 'Together AI', placeholder: '...', helpUrl: 'https://api.together.xyz/settings/api-keys', models: ['llama-3.1-405b', 'mixtral-8x22b', 'qwen-2-72b'] },
  { id: 'deepseek', name: 'DeepSeek', placeholder: 'sk-...', helpUrl: 'https://platform.deepseek.com/api_keys', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'openrouter', name: 'OpenRouter (100+ models)', placeholder: 'sk-or-...', helpUrl: 'https://openrouter.ai/keys', models: ['auto', 'openai/gpt-4o', 'anthropic/claude-3-opus'] },
  { id: 'perplexity', name: 'Perplexity AI', placeholder: 'pplx-...', helpUrl: 'https://www.perplexity.ai/settings/api', models: ['llama-3.1-sonar-large', 'llama-3.1-sonar-small'] },
  { id: 'fireworks', name: 'Fireworks AI (Fast)', placeholder: '...', helpUrl: 'https://fireworks.ai/api-keys', models: ['llama-v3p1-405b', 'llama-v3p1-70b'] },

  { id: 'huggingface', name: 'Hugging Face', placeholder: 'hf_...', helpUrl: 'https://huggingface.co/settings/tokens', models: ['inference-endpoints', 'hf-inference-api'] },
  { id: 'replicate', name: 'Replicate', placeholder: 'r8_...', helpUrl: 'https://replicate.com/account/api-tokens', models: ['image-models', 'video-models'] },
  { id: 'stability', name: 'Stability AI', placeholder: 'sk-...', helpUrl: 'https://platform.stability.ai/account/keys', models: ['stable-image-ultra', 'stable-diffusion'] },
  { id: 'elevenlabs', name: 'ElevenLabs', placeholder: '...', helpUrl: 'https://elevenlabs.io/app/settings/api-keys', models: ['tts', 'stt'] },
];

export interface AvailableProvidersResponse {
  providers: string[];
  hasUserKeys: boolean;
  userKeyProviders: string[];
}

/**
 * Get available AI providers based on user's API keys
 * For free trial users, only providers with valid keys are returned
 */
export const fetchAvailableProviders = async (): Promise<AvailableProvidersResponse> => {
  try {
    // Use the resonant-chat providers endpoint
    const res = await fastapiClient.get('/resonant-chat/providers');
    return {
      providers: res.data?.providers || [],
      hasUserKeys: res.data?.providers?.some((p: any) => p.has_user_key) || false,
      userKeyProviders: res.data?.providers?.filter((p: any) => p.has_user_key).map((p: any) => p.id) || [],
    };
  } catch (error: any) {
    console.error('Failed to fetch available providers:', error);
    return {
      providers: [],
      hasUserKeys: false,
      userKeyProviders: [],
    };
  }
};
