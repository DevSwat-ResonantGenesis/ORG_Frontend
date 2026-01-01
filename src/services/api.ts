// ============== API SERVICE LAYER ==============
// Optimized API service with caching, retry, and error handling

import { apiCache, CACHE_CONFIGS, createCacheKey } from '../utils/apiCache';
import { requestQueue } from '../utils/performanceOptimizer';

// ============== CONFIGURATION ==============
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const IDE_SERVICE_URL = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTTL?: number;
  retry?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: number;
}

interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============== REQUEST INTERCEPTOR ==============
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(interceptor: RequestInterceptor): () => void {
  requestInterceptors.push(interceptor);
  return () => {
    const index = requestInterceptors.indexOf(interceptor);
    if (index > -1) requestInterceptors.splice(index, 1);
  };
}

export function addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
  responseInterceptors.push(interceptor);
  return () => {
    const index = responseInterceptors.indexOf(interceptor);
    if (index > -1) responseInterceptors.splice(index, 1);
  };
}

// ============== CORE REQUEST FUNCTION ==============
async function request<T>(
  endpoint: string,
  config: RequestConfig = {},
  baseUrl: string = API_BASE_URL
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache = method === 'GET',
    cacheTTL = 30000,
    retry = 3,
    retryDelay = 1000,
    timeout = 30000,
    priority = 0,
  } = config;

  const url = `${baseUrl}${endpoint}`;
  const cacheKey = createCacheKey(url, body as Record<string, unknown>);

  // Check cache for GET requests
  if (cache && method === 'GET') {
    const cached = apiCache.get<T>(cacheKey);
    if (cached !== null) {
      return { data: cached, status: 200, headers: new Headers() };
    }
  }

  // Build request config
  let requestConfig: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }

  // Apply request interceptors
  for (const interceptor of requestInterceptors) {
    requestConfig = await interceptor(requestConfig);
  }

  // Execute with queue and retry
  return requestQueue.add(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of responseInterceptors) {
          response = await interceptor(response);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.code,
            errorData.details
          );
        }

        const data = await response.json();

        // Cache successful GET responses
        if (cache && method === 'GET') {
          apiCache.set(cacheKey, data, { ttl: cacheTTL });
        }

        return { data, status: response.status, headers: response.headers };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx)
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retry
        if (attempt < retry) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }, priority);
}

// ============== API METHODS ==============
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'PATCH', body }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }),
};

// ============== IDE SERVICE API ==============
export const ideApi = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'GET' }, IDE_SERVICE_URL),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'POST', body }, IDE_SERVICE_URL),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'PUT', body }, IDE_SERVICE_URL),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: 'DELETE' }, IDE_SERVICE_URL),
};

// ============== SPECIFIC API ENDPOINTS ==============

// Auth
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: unknown }>('/api/auth/login', credentials, { cache: false }),

  register: (data: { email: string; password: string; name: string }) =>
    api.post<{ token: string; user: unknown }>('/api/auth/register', data, { cache: false }),

  logout: () =>
    api.post('/api/auth/logout', {}, { cache: false }),

  me: () =>
    api.get<{ user: unknown }>('/api/auth/me', { cacheTTL: 60000 }),

  refresh: () =>
    api.post<{ token: string }>('/api/auth/refresh', {}, { cache: false }),
};

// IDE
export const ideService = {
  executeCode: (code: string, language: string) =>
    ideApi.post<{ success: boolean; output: string; error: string | null; execution_time: number }>(
      '/api/code/execute',
      { code, language },
      { cache: false, timeout: 60000 }
    ),

  analyzeCode: (code: string, language: string) =>
    ideApi.post<{ issues: unknown[]; metrics: unknown }>(
      '/api/code/analyze',
      { code, language },
      { cacheTTL: 10000 }
    ),

  formatCode: (code: string, language: string, style?: string) =>
    ideApi.post<{ formatted: string }>(
      '/api/code/format',
      { code, language, style },
      { cache: false }
    ),

  getHealth: () =>
    ideApi.get<{ status: string; orchestrator: unknown }>('/health', { cacheTTL: 5000 }),

  getProjects: () =>
    ideApi.get<unknown[]>('/api/projects', { cacheTTL: 30000 }),

  getAgents: () =>
    ideApi.get<unknown[]>('/api/agents', { cacheTTL: 10000 }),
};

// Workflow
export const workflowApi = {
  list: () =>
    api.get<unknown[]>('/api/workflow/list', { cacheTTL: 30000 }),

  get: (id: string) =>
    api.get<unknown>(`/api/workflow/${id}`, { cacheTTL: 10000 }),

  create: (data: unknown) =>
    api.post<unknown>('/api/workflow/create', data, { cache: false }),

  execute: (id: string, input?: unknown) =>
    api.post<unknown>(`/api/workflow/${id}/execute`, { input }, { cache: false, timeout: 120000 }),

  getStatus: (executionId: string) =>
    api.get<unknown>(`/api/workflow/execution/${executionId}`, { cacheTTL: 2000 }),
};

// ML
export const mlApi = {
  predict: (model: string, input: unknown) =>
    api.post<unknown>(`/api/ml/predict/${model}`, { input }, { cache: false }),

  train: (model: string, data: unknown) =>
    api.post<unknown>(`/api/ml/train/${model}`, data, { cache: false, timeout: 300000 }),

  models: () =>
    api.get<unknown[]>('/api/ml/models'),
};

// LLM
export const llmApi = {
  chat: (messages: unknown[], model?: string) =>
    api.post<{ response: string }>('/api/llm/chat', { messages, model }, { cache: false }),

  complete: (prompt: string, model?: string) =>
    api.post<{ completion: string }>('/api/llm/complete', { prompt, model }, { cache: false }),

  embed: (text: string | string[]) =>
    api.post<{ embeddings: number[][] }>('/api/llm/embed', { text }, { cacheTTL: 300000 }),
};

// Memory
export const memoryApi = {
  store: (key: string, value: unknown, namespace?: string) =>
    api.post('/api/memory/store', { key, value, namespace }, { cache: false }),

  retrieve: (key: string, namespace?: string) =>
    api.get<unknown>(`/api/memory/retrieve?key=${key}&namespace=${namespace || ''}`, { cacheTTL: 5000 }),

  search: (query: string, limit?: number) =>
    api.post<unknown[]>('/api/memory/search', { query, limit }, { cacheTTL: 10000 }),

  delete: (key: string, namespace?: string) =>
    api.delete(`/api/memory/delete?key=${key}&namespace=${namespace || ''}`),
};

// Chat
export const chatApi = {
  send: (message: string, conversationId?: string) =>
    api.post<{ response: string; conversationId: string }>(
      '/api/chat/send',
      { message, conversationId },
      { cache: false }
    ),

  history: (conversationId: string) =>
    api.get<unknown[]>(`/api/chat/history/${conversationId}`, { cacheTTL: 10000 }),

  conversations: () =>
    api.get<unknown[]>('/api/chat/conversations', { cacheTTL: 30000 }),
};

// Agents
export const agentsApi = {
  list: () =>
    api.get<unknown[]>('/api/agents/list', { cacheTTL: 30000 }),

  get: (id: string) =>
    api.get<unknown>(`/api/agents/${id}`, { cacheTTL: 10000 }),

  create: (config: unknown) =>
    api.post<unknown>('/api/agents/create', config, { cache: false }),

  execute: (id: string, task: unknown) =>
    api.post<unknown>(`/api/agents/${id}/execute`, { task }, { cache: false, timeout: 120000 }),

  stop: (id: string) =>
    api.post(`/api/agents/${id}/stop`, {}, { cache: false }),
};

// Health checks
export const healthApi = {
  gateway: () => api.get<{ status: string }>('/health', { cacheTTL: 5000 }),
  auth: () => api.get<{ status: string }>('/api/auth/health', { cacheTTL: 5000 }),
  ide: () => ideApi.get<{ status: string }>('/health', { cacheTTL: 5000 }),
  workflow: () => api.get<{ status: string }>('/api/workflow/health', { cacheTTL: 5000 }),
  ml: () => api.get<{ status: string }>('/api/ml/health', { cacheTTL: 5000 }),
  llm: () => api.get<{ status: string }>('/api/llm/health', { cacheTTL: 5000 }),
  memory: () => api.get<{ status: string }>('/api/memory/health', { cacheTTL: 5000 }),
  chat: () => api.get<{ status: string }>('/api/chat/health', { cacheTTL: 5000 }),
  agents: () => api.get<{ status: string }>('/api/agents/health', { cacheTTL: 5000 }),

  all: async () => {
    const results = await Promise.allSettled([
      healthApi.gateway(),
      healthApi.auth(),
      healthApi.ide(),
      healthApi.workflow(),
      healthApi.ml(),
      healthApi.llm(),
      healthApi.memory(),
      healthApi.chat(),
      healthApi.agents(),
    ]);

    return {
      gateway: results[0].status === 'fulfilled',
      auth: results[1].status === 'fulfilled',
      ide: results[2].status === 'fulfilled',
      workflow: results[3].status === 'fulfilled',
      ml: results[4].status === 'fulfilled',
      llm: results[5].status === 'fulfilled',
      memory: results[6].status === 'fulfilled',
      chat: results[7].status === 'fulfilled',
      agents: results[8].status === 'fulfilled',
    };
  },
};

export { APIError };
export default api;
