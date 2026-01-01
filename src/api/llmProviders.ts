/**
 * LLM Provider Management API
 * For platform owner to manage multi-LLM provider configurations
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface LLMProvider {
  id: string;
  name: string;
  provider_type: string; // openai, anthropic, google, groq, azure, custom
  api_key: string;
  has_api_key?: boolean;
  api_base_url: string;
  default_model: string;
  models: string[];
  enabled: boolean;
  priority: number;
  rate_limit_rpm: number;
  rate_limit_tpm: number;
  max_retries: number;
  timeout_seconds: number;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
}

export interface LLMProviderUsage {
  provider_id: string;
  provider_name?: string;
  provider_type?: string;
  enabled?: boolean;
  requests_today: number;
  tokens_today: number;
  cost_today: number;
  errors_today: number;
  avg_latency_ms: number;
  last_used: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
}

export interface TestResult {
  status: 'success' | 'error';
  message: string;
  latency_ms: number;
  provider_id: string;
}

const getOwnerToken = (): string => {
  return localStorage.getItem('owner_token') || '';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getOwnerToken()}`,
});

/**
 * Get all LLM providers
 */
export async function getLLMProviders(): Promise<LLMProvider[]> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch LLM providers: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.providers || [];
}

/**
 * Get a specific LLM provider
 */
export async function getLLMProvider(providerId: string): Promise<LLMProvider> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch LLM provider: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.provider;
}

/**
 * Create a new LLM provider
 */
export async function createLLMProvider(provider: Partial<LLMProvider>): Promise<LLMProvider> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(provider),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to create LLM provider: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.provider;
}

/**
 * Update an existing LLM provider
 */
export async function updateLLMProvider(providerId: string, provider: Partial<LLMProvider>): Promise<LLMProvider> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(provider),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to update LLM provider: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.provider;
}

/**
 * Delete an LLM provider
 */
export async function deleteLLMProvider(providerId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete LLM provider: ${response.statusText}`);
  }
}

/**
 * Test connectivity to an LLM provider
 */
export async function testLLMProvider(providerId: string): Promise<TestResult> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}/test`, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to test LLM provider: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Toggle LLM provider enabled/disabled
 */
export async function toggleLLMProvider(providerId: string): Promise<{ enabled: boolean }> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}/toggle`, {
    method: 'POST',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to toggle LLM provider: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get usage metrics for a specific provider
 */
export async function getLLMProviderUsage(providerId: string): Promise<LLMProviderUsage> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers/${providerId}/usage`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch LLM provider usage: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.usage;
}

/**
 * Get usage metrics for all providers
 */
export async function getAllLLMProvidersUsage(): Promise<LLMProviderUsage[]> {
  const response = await fetch(`${API_BASE}/owner/auth/llm-providers-usage`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch LLM providers usage: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.usage || [];
}

/**
 * Provider type options for UI
 */
export const PROVIDER_TYPES = [
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'anthropic', label: 'Anthropic', icon: '🧠' },
  { value: 'google', label: 'Google', icon: '🔮' },
  { value: 'groq', label: 'Groq', icon: '⚡' },
  { value: 'azure', label: 'Azure OpenAI', icon: '☁️' },
  { value: 'custom', label: 'Custom', icon: '🔧' },
];

/**
 * Default models for each provider type
 */
export const DEFAULT_MODELS: Record<string, string[]> = {
  openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-pro', 'gemini-pro-vision', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  azure: ['gpt-4', 'gpt-35-turbo'],
  custom: [],
};

/**
 * Default API base URLs for each provider type
 */
export const DEFAULT_API_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com',
  google: 'https://generativelanguage.googleapis.com',
  groq: 'https://api.groq.com/openai/v1',
  azure: 'https://{resource-name}.openai.azure.com',
  custom: '',
};
