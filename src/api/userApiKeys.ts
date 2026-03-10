import fastapiClient from './fastapiClient';

export type ApiKeyProviderId = string;

export interface UserApiKey {
  id: string;
  provider: ApiKeyProviderId;
  name?: string;
  keyPrefix: string;
  isValid: boolean;
  lastUsed: string | null;
  createdAt: string;
  usageTokens: number;
}

export interface AddUserApiKeyRequest {
  provider: ApiKeyProviderId;
  apiKey: string;
  name?: string;
}

export interface AddUserApiKeyResult {
  success: boolean;
  key?: UserApiKey;
  error?: string;
}

export interface DeleteUserApiKeyResult {
  success: boolean;
  error?: string;
}

export interface ValidateApiKeyResult {
  valid: boolean;
  provider: ApiKeyProviderId;
  error?: string;
}

const mapUserApiKey = (k: any): UserApiKey => ({
  id: k.id,
  provider: k.provider,
  name: k.name,
  keyPrefix: k.key_prefix || k.keyPrefix || '***',
  isValid: k.is_valid ?? k.isValid ?? false,
  lastUsed: k.last_used || k.lastUsed || null,
  createdAt: k.created_at || k.createdAt || '',
  usageTokens: k.usage_tokens || k.usageTokens || 0,
});

export const fetchUserApiKeys = async (): Promise<UserApiKey[]> => {
  try {
    const res = await fastapiClient.get('/user/api-keys');
    const keys = res.data?.keys || res.data || [];
    return (keys as any[]).map(mapUserApiKey);
  } catch (err) {
    console.error('Failed to fetch user API keys:', err);
    return [];
  }
};

export const addUserApiKey = async (req: AddUserApiKeyRequest): Promise<AddUserApiKeyResult> => {
  try {
    const res = await fastapiClient.post('/user/api-keys', {
      provider: req.provider,
      api_key: req.apiKey,
      name: req.name || `${req.provider} Key`,
    });

    return {
      success: true,
      key: mapUserApiKey(res.data),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.detail || err?.message || 'Failed to add API key',
    };
  }
};

export const deleteUserApiKey = async (keyId: string): Promise<DeleteUserApiKeyResult> => {
  try {
    await fastapiClient.delete(`/user/api-keys/${keyId}`);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.detail || err?.message || 'Failed to delete API key',
    };
  }
};

export const validateApiKey = async (provider: ApiKeyProviderId, apiKey: string): Promise<ValidateApiKeyResult> => {
  try {
    const res = await fastapiClient.post('/user/api-keys/validate', {
      provider,
      api_key: apiKey,
    });
    return res.data;
  } catch (err: any) {
    return {
      valid: false,
      provider,
      error: err?.response?.data?.detail || err?.message || 'Validation failed',
    };
  }
};

export interface ResonantChatProvider {
  id: string;
  has_user_key?: boolean;
  hasUserKey?: boolean;
}

export const fetchAvailableProviders = async (): Promise<{
  providers: ResonantChatProvider[];
  hasUserKeys: boolean;
  userKeyProviders: string[];
}> => {
  try {
    const res = await fastapiClient.get('/resonant-chat/providers');
    const providers = res.data?.providers || [];
    const hasUserKeys = !!providers?.some((p: any) => p.has_user_key || p.hasUserKey);
    const userKeyProviders = (providers || []).filter((p: any) => p.has_user_key || p.hasUserKey).map((p: any) => p.id);
    return { providers, hasUserKeys, userKeyProviders };
  } catch (err) {
    console.error('Failed to fetch available providers:', err);
    return { providers: [], hasUserKeys: false, userKeyProviders: [] };
  }
};

// ============================================
// Trial Status (1-week unlimited trial)
// ============================================
export interface TrialStatus {
  isTrialUser: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expiresAt: string | null;
  hasApiKey: boolean;
  requiresUpgrade: boolean;
}

export const fetchTrialStatus = async (): Promise<TrialStatus> => {
  try {
    // Get auth token from cookies
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };
    const token = getCookie('rg_access') || getCookie('access_token');
    
    if (!token) {
      return { isTrialUser: false, isExpired: false, daysRemaining: 0, expiresAt: null, hasApiKey: false, requiresUpgrade: false };
    }

    const res = await fastapiClient.post('/auth/verify', { token });
    const data = res.data;
    
    const trialActive = data?.trial_active === true;
    const trialExpiresAt = data?.trial_expires_at || null;
    const unlimitedCredits = data?.unlimited_credits === true;
    
    let daysRemaining = 0;
    let isExpired = false;
    
    if (trialExpiresAt) {
      const now = new Date();
      const expires = new Date(trialExpiresAt);
      const diffMs = expires.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0;
    }
    
    // Check if user has any API keys
    let hasApiKey = false;
    try {
      const keysRes = await fastapiClient.get('/user/api-keys');
      const keys = keysRes.data?.keys || keysRes.data || [];
      hasApiKey = Array.isArray(keys) && keys.length > 0;
    } catch { /* ignore */ }
    
    return {
      isTrialUser: trialActive || (unlimitedCredits && !!trialExpiresAt),
      isExpired,
      daysRemaining,
      expiresAt: trialExpiresAt,
      hasApiKey,
      requiresUpgrade: isExpired && !hasApiKey,
    };
  } catch (err) {
    console.error('Failed to fetch trial status:', err);
    return { isTrialUser: false, isExpired: false, daysRemaining: 0, expiresAt: null, hasApiKey: false, requiresUpgrade: false };
  }
};

export const API_KEY_PROVIDERS = [
  { id: 'github', name: 'GitHub (PAT)', placeholder: 'ghp_...', helpUrl: 'https://github.com/settings/tokens', models: [] },
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
  { id: 'huggingface', name: 'Hugging Face', placeholder: 'hf_...', helpUrl: 'https://huggingface.co/settings/tokens', models: ['meta-llama/Meta-Llama-3.1-70B-Instruct', 'mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  { id: 'replicate', name: 'Replicate', placeholder: 'r8_...', helpUrl: 'https://replicate.com/account/api-tokens', models: ['meta/meta-llama-3.1-70b-instruct', 'stability-ai/sdxl'] },
  { id: 'stability', name: 'Stability AI', placeholder: 'sk-...', helpUrl: 'https://platform.stability.ai/account/keys', models: ['stable-diffusion-xl', 'stable-image-ultra'] },
  { id: 'elevenlabs', name: 'ElevenLabs', placeholder: 'el_...', helpUrl: 'https://elevenlabs.io/app/settings/api-keys', models: ['eleven_turbo_v2', 'eleven_multilingual_v2'] },

];
