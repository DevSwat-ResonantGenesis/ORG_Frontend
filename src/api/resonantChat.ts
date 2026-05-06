import { logger } from '../utils/logger';
import fastapiClient from './fastapiClient';
import { listMemories } from './rag';
import { applySocialCognition, type SocialCognitionResult } from '../utils/socialCognition';

export interface ModuleOutputs {
  word_representation?: {
    words: string[];
    method: string;
    confidence: number;
    error?: string;
    note?: string;
  };
  word_phrase?: {
    words: string[];
    method: string;
    confidence: number;
    band_distribution?: {
      alpha: number;
      beta: number;
      gamma: number;
    };
    error?: string;
    note?: string;
  };
  text_processing?: {
    oov_words: string[];
    available: boolean;
    error?: string;
    note?: string;
  };
  error?: string;
}

export interface ResonantChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  aiProvider?: string;
  llmProvider?: string;
  anchors?: string[];
  hash?: string;
  resonanceScore?: number;
  modules?: ModuleOutputs; // Hash Sphere module outputs
}

export interface ResonantChatRequest {
  message: string;
  chatId?: string;
  context?: {
    previousMessages?: ResonantChatMessage[];
    userPreferences?: Record<string, any>;
  };
  // Code features (NEW)
  attached_files?: string[]; // List of file paths
  images?: Array<{ type: string; data: string; name: string }>; // Base64 images for vision models
  code_selection?: {
    file: string;
    lines: number[];
    code?: string;
  };
  preferred_provider?: string; // 'openai', 'chatgpt', 'gemini', 'groq', 'auto'
  use_rag?: boolean; // Use RAG system for memory retrieval
  agent_hash?: string; // Agent hash for shared memory (if using agent)
  teamId?: string; // Team ID for team-based chat
  // IDE Chat Integration
  execute_mode?: boolean; // When true: skip explanations, return structured code changes
  project_context?: {
    projectId?: string;
    openFiles?: string[];
    currentFile?: string;
    fileContents?: Record<string, string>;
    files?: { path: string; content: string }[];
    activeFile?: string;
  };
  // Skills enabled by user in toolbar (sent with each message)
  enabled_skill_ids?: string[];
  // Social Cognition Layer - adaptive interpersonal mirroring
  social_cognition?: {
    enabled?: boolean;
    systemPrompt?: string; // Generated adaptive system prompt
    userStyle?: string; // Inferred user interaction style
    behaviorProfile?: {
      role: string;
      tone: string;
      depth: string;
    };
  };
}

export interface GeneratedImage {
  url?: string;
  base64_data?: string;
  revised_prompt?: string;
  model: string;
  size: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ToolResult {
  tool_name: string;
  success: boolean;
  result?: {
    action?: string;
    url?: string;
    page?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface ResonantChatResponse {
  message: ResonantChatMessage & { xyz?: [number, number, number] };
  anchors: string[];
  hash: string;
  resonanceScore: number;
  aiProvider: string;
  llmProvider?: string;
  memoryUpdated: boolean;
  chatId?: string; // Chat ID for persistence
  generatedImages?: GeneratedImage[];
  webSearchResults?: WebSearchResult[];
  toolResults?: ToolResult[];
}

/**
 * Apply Social Cognition Layer to enhance request with adaptive mirroring
 * This analyzes user messages to infer interaction style and generates
 * an adaptive system prompt that makes responses more human and relatable.
 */
export const applySocialCognitionToRequest = (
  request: ResonantChatRequest
): ResonantChatRequest => {
  // Skip if execute_mode (IDE) or explicitly disabled
  if (request.execute_mode || request.social_cognition?.enabled === false) {
    return request;
  }
  
  // Extract user messages for style analysis
  const userMessages = request.context?.previousMessages
    ?.filter(m => m.role === 'user')
    .map(m => m.content) || [];
  
  // Add current message
  userMessages.push(request.message);
  
  // Apply social cognition
  const cognitionResult = applySocialCognition(userMessages);
  
  logger.info('Social Cognition applied', {
    component: 'ResonantChat',
    userStyle: cognitionResult.userStyle.style,
    confidence: cognitionResult.userStyle.confidence,
    role: cognitionResult.behaviorProfile.role,
    tone: cognitionResult.behaviorProfile.tone,
  });
  
  // Enhance request with social cognition data
  return {
    ...request,
    social_cognition: {
      enabled: true,
      systemPrompt: cognitionResult.systemPrompt,
      userStyle: cognitionResult.userStyle.style,
      behaviorProfile: {
        role: cognitionResult.behaviorProfile.role,
        tone: cognitionResult.behaviorProfile.tone,
        depth: cognitionResult.behaviorProfile.depth,
      },
    },
  };
};

/**
 * Send a message to Resonant Chat
 * This will:
 * 1. Apply Social Cognition Layer (adaptive mirroring)
 * 2. Hash the input
 * 3. Check memory anchors
 * 4. Route to appropriate AI
 * 5. Hash the response
 * 6. Create/update anchors
 * 7. Store in memory
 * 
 * Falls back to direct provider call if backend is unavailable
 */
export const sendResonantMessage = async (
  request: ResonantChatRequest
): Promise<ResonantChatResponse> => {
  // Apply Social Cognition Layer for adaptive interpersonal mirroring
  const enhancedRequest = applySocialCognitionToRequest(request);
  
  // Convert chatId to chat_id for backend compatibility (snake_case)
  const backendRequest = {
    ...enhancedRequest,
    chat_id: enhancedRequest.chatId,  // Backend expects snake_case
    chatId: undefined,  // Remove camelCase version
  };
  
  try {
    const response = await fastapiClient.post('/resonant-chat/message', backendRequest);
    return response.data;
  } catch (error: any) {
    // Handle auth errors - DO NOT fallback, require re-login
    if (error?.response?.status === 401) {
      logger.error('Authentication required for Resonant Chat', {
        component: 'ResonantChat',
        status: 401
      });
      // Redirect to login if not authenticated (skip on home/guest mode)
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true';
      }
      throw new Error('Session expired. Please log in again to continue chatting.');
    }

    // Handle insufficient credits (check both raw axios error and apiErrorHandler-transformed error)
    const is402 = error?.response?.status === 402 || error?.status === 402;
    if (is402) {
      const data = error?.response?.data || error;
      const msg = data?.message || data?.detail || 'Insufficient credits. Please purchase more credits to continue.';
      const actionUrl = data?.action_url || '/pricing';
      const err = new Error(msg) as any;
      err.creditError = true;
      err.actionUrl = actionUrl;
      err.available = data?.available;
      err.required = data?.required;
      throw err;
    }

    // Handle LLM-related errors (quota, rate limit, API key issues)
    // NOTE: 'insufficient' and 'credit' removed — those are handled by the 402 block above
    const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
    const isLLMError = 
      errorMsg.toLowerCase().includes('quota') ||
      errorMsg.toLowerCase().includes('rate limit') ||
      errorMsg.toLowerCase().includes('api key') ||
      errorMsg.toLowerCase().includes('failed to generate') ||
      error?.response?.status === 429;
    
    if (isLLMError) {
      logger.error('LLM service unavailable - user needs to add API key', {
        component: 'ResonantChat',
        error: errorMsg
      });
      throw new Error(
        'AI service requires your own API key. Please go to Settings → API Keys to add your OpenAI, Anthropic, or other provider key to continue using Resonant Chat.'
      );
    }

    // Check if backend is unavailable (404, 501, network errors)
    const isBackendUnavailable =
      error?.response?.status === 404 ||
      error?.response?.status === 501 ||
      error?.response?.status === 503 ||
      error?.code === 'ECONNREFUSED' ||
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error') ||
      error?.message?.includes('Failed to fetch');

    if (isBackendUnavailable) {
      // Check if fallback is enabled (disabled in production by default)
      const fallbackEnabled = import.meta.env.VITE_ENABLE_FALLBACK_MODE === 'true';
      const isDevelopment = import.meta.env.DEV;

      // In production, require backend (Resonant Chat needs Hash Sphere + RAG)
      if (!fallbackEnabled && !isDevelopment) {
        logger.error('Backend required for Resonant Chat - Hash Sphere and memory features unavailable', {
          component: 'ResonantChat',
          status: error?.response?.status,
          code: error?.code
        });
        throw new Error(
          'Resonant Chat requires backend connection for Hash Sphere and memory features. ' +
          'Backend is currently unavailable. Please ensure the backend service is running.'
        );
      }

      // Fallback to direct provider call (development/degraded mode only)
      logger.warn('Backend unavailable - using degraded mode (Hash Sphere and memory features unavailable)', {
        component: 'ResonantChat',
        status: error?.response?.status,
        code: error?.code,
        mode: isDevelopment ? 'development' : 'degraded'
      });

      // Show warning to user (if in browser)
      if (typeof window !== 'undefined') {
        console.warn(
          '⚠️ Resonant Chat is running in degraded mode.\n' +
          'Hash Sphere memory, anchors, resonance scores, and RAG features are unavailable.\n' +
          'This is a basic chat mode without the core Resonant Chat features.'
        );
      }

      try {
        // Dynamically import provider router to avoid circular dependencies
        const { routeToProvider } = await import('./providers/router');
        type ProviderName = 'gemini' | 'groq' | 'openai' | 'mistral' | 'cohere' | 'anthropic' | 'auto';

        // Build messages array with Social Cognition system prompt
        const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
        
        // Add Social Cognition system prompt if available
        if (enhancedRequest.social_cognition?.systemPrompt) {
          messages.push({
            role: 'system',
            content: enhancedRequest.social_cognition.systemPrompt
          });
        }
        
        // Add previous messages
        if (enhancedRequest.context?.previousMessages) {
          messages.push(...enhancedRequest.context.previousMessages.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content
          })));
        }
        
        // Add current user message
        messages.push({ role: 'user' as const, content: enhancedRequest.message });

        // Determine provider (handle 'auto' and undefined)
        let provider: ProviderName | undefined = undefined;
        if (enhancedRequest.preferred_provider && enhancedRequest.preferred_provider !== 'auto') {
          provider = enhancedRequest.preferred_provider as ProviderName;
        }

        // Route to provider with Social Cognition enhanced messages
        const providerResponse = await routeToProvider(
          {
            messages,
            temperature: 0.7,
            maxTokens: 2000,
          },
          {
            provider: provider,
          }
        );

        // Convert provider response to ResonantChatResponse format
        // NOTE: This is degraded mode - no Hash Sphere, no memory, no RAG
        const fallbackResponse: ResonantChatResponse = {
          message: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: providerResponse.content,
            timestamp: new Date().toISOString(),
            aiProvider: providerResponse.provider,
          },
          anchors: [], // No anchors - Hash Sphere unavailable
          hash: '', // No hash - Hash Sphere unavailable
          resonanceScore: 0, // No resonance - Hash Sphere unavailable
          aiProvider: providerResponse.provider,
          memoryUpdated: false, // No memory - backend unavailable
        };

        logger.info('Degraded mode provider call successful (Hash Sphere features unavailable)', {
          component: 'ResonantChat',
          provider: providerResponse.provider,
          mode: 'degraded'
        });

        return fallbackResponse;
      } catch (fallbackError: any) {
        logger.error('Fallback provider call also failed', fallbackError, { component: 'ResonantChat' });
        // If fallback also fails, throw original error with context
        throw new Error(
          `Backend unavailable and fallback provider call failed: ${fallbackError?.message || 'Unknown error'}. ` +
          `Original error: ${error?.message || 'Backend connection failed'}`
        );
      }
    }

    // For other errors, log and throw
    logger.error('Resonant Chat message error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * SSE event types from /resonant-chat/message/stream
 */
export interface SSEStreamEvent {
  event: 'start' | 'chunk' | 'metadata' | 'done' | 'error' | 'step' | 'options';
  // start
  chat_id?: string;
  user_message_id?: string;
  user_hash?: string;
  tool?: string;
  // chunk
  content?: string;
  // metadata
  hash?: string;
  resonance_score?: number;
  xyz?: [number, number, number];
  provider?: string;
  agent_type?: string;  // Agent type (reasoning, summary, math, etc.)
  // done
  message_id?: string;
  total_length?: number;
  anchors?: string[];
  evidence_graph?: Record<string, any>;
  present_options?: any;
  // error
  error?: string;
  // step (pipeline processing steps)
  step?: string;
  name?: string;
  success?: boolean;
  query?: string;
  message?: string;
  count?: number;
  history_count?: number;
  length?: number;
  // options (interactive buttons from architect)
  options?: any;
  // streaming flag (true = token deltas, false/absent = full-text replace)
  streaming?: boolean;
}

/**
 * Stream a message via SSE (Server-Sent Events).
 * Uses the /resonant-chat/message/stream endpoint for real-time chunk delivery.
 * 
 * @param request - The chat request payload
 * @param onEvent - Callback invoked for each SSE event
 * @param signal - Optional AbortSignal for cancellation
 */
export const streamResonantMessage = async (
  request: ResonantChatRequest,
  onEvent: (event: SSEStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> => {
  const apiUrl = (await import('../utils/apiUrl')).getApiUrl();

  const backendRequest = {
    message: request.message,
    chat_id: request.chatId || undefined,
    preferred_provider: request.preferred_provider || undefined,
    agent_hash: request.agent_hash || undefined,
    teamId: request.teamId || undefined,
  };

  const response = await fetch(`${apiUrl}/resonant-chat/message/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(backendRequest),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`SSE stream failed (${response.status}): ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body for SSE stream');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines: "data: {...}\n\n"
      const lines = buffer.split('\n\n');
      // Keep the last incomplete chunk in buffer
      buffer = lines.pop() || '';

      for (const block of lines) {
        const dataLine = block.split('\n').find(l => l.startsWith('data: '));
        if (!dataLine) continue;
        try {
          const parsed: SSEStreamEvent = JSON.parse(dataLine.slice(6));
          onEvent(parsed);
        } catch {
          // skip malformed events
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (chatId?: string) => {
  try {
    // Conversations are exposed via the gateway under /api/chat/chat/conversations
    const url = chatId
      ? `/resonant-chat/conversations/${chatId}`
      : '/resonant-chat/conversations';
    logger.info(`[getChatHistory] Fetching from: ${url}`, { chatId, component: 'ResonantChat' });
    const response = await fastapiClient.get(url);
    logger.info(`[getChatHistory] Response:`, { 
      dataType: typeof response.data, 
      isArray: Array.isArray(response.data),
      length: Array.isArray(response.data) ? response.data.length : 'N/A',
      component: 'ResonantChat' 
    });
    return response.data;
  } catch (error: any) {
    // Handle specific error cases gracefully
    const status = error?.response?.status;
    
    // 401: Not authenticated - return empty array (user will be redirected by auth interceptor)
    if (status === 401) {
      console.warn('[getChatHistory] 401 Unauthorized - user may need to re-login');
      return chatId ? { messages: [] } : [];
    }
    
    // 404: Conversation not found
    if (status === 404) {
      logger.warn('Conversation not found', { chatId, component: 'ResonantChat' });
      return null;
    }
    
    // 405: Method not allowed - endpoint issue, return empty array for list
    if (status === 405) {
      logger.warn('Chat history endpoint returned 405, returning empty', { component: 'ResonantChat' });
      return chatId ? { messages: [] } : [];
    }
    
    // 429: Rate limited - already handled by retry logic, just return empty
    if (status === 429) {
      logger.warn('Rate limited on chat history, returning empty', { component: 'ResonantChat' });
      return chatId ? { messages: [] } : [];
    }
    
    logger.error('Resonant Chat history error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Create a new chat
 * Creates a conversation ID that will be used in subsequent messages
 */
export const createChat = async (title?: string) => {
  try {
    // Create conversation via gateway-compatible endpoint
    const response = await fastapiClient.post('/resonant-chat/conversations', { title });
    return response.data;
  } catch (error: any) {
    logger.error('Resonant Chat create error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Get memory anchors for a user
 * Uses Hash Sphere if available, falls back to RAG memory extraction if Hash Sphere doesn't work
 */
export const getMemoryAnchors = async () => {
  try {
    const response = await fastapiClient.get('/resonant-chat/anchors');
    return response.data;
  } catch (error: any) {
    // Fallback: extract anchors from RAG memories if Hash Sphere endpoint doesn't work
    if (error?.response?.status === 404 || error?.response?.status === 501 || error?.response?.status === 503) {
      logger.info('Hash Sphere anchors endpoint not available, falling back to RAG memory extraction', { component: 'ResonantChat' });
      try {
        const memories = await listMemories(100);
        // Extract unique hashes as anchors
        const anchors = memories
          .filter(m => m.hash)
          .map(m => m.hash!)
          .filter((hash, index, self) => self.indexOf(hash) === index); // Unique
        return { anchors };
      } catch (ragError) {
        logger.error('RAG fallback also failed for anchors', ragError, { component: 'ResonantChat' });
        return { anchors: [] };
      }
    }
    logger.error('Resonant Chat anchors error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Get resonance clusters
 * Uses Hash Sphere if available, falls back to RAG memory grouping if Hash Sphere doesn't work
 */
export const getResonanceClusters = async () => {
  try {
    const response = await fastapiClient.get('/resonant-chat/clusters');
    return response.data;
  } catch (error: any) {
    // Fallback: extract clusters from RAG memories if Hash Sphere endpoint doesn't work
    if (error?.response?.status === 404 || error?.response?.status === 501 || error?.response?.status === 503) {
      logger.info('Hash Sphere clusters endpoint not available, falling back to RAG memory grouping', { component: 'ResonantChat' });
      try {
        const memories = await listMemories(100);
        // Group memories by cluster
        const clusterMap = new Map<string, any[]>();
        memories.forEach(m => {
          const cluster = m.cluster || 'unknown';
          if (!clusterMap.has(cluster)) {
            clusterMap.set(cluster, []);
          }
          clusterMap.get(cluster)!.push(m);
        });
        const clusters = Array.from(clusterMap.entries()).map(([name, items]) => ({
          name,
          count: items.length,
          items: items.slice(0, 10), // Limit items per cluster
        }));
        return { clusters };
      } catch (ragError) {
        logger.error('RAG fallback also failed for clusters', ragError, { component: 'ResonantChat' });
        return { clusters: [] };
      }
    }
    logger.error('Resonant Chat clusters error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * User Analytics Response
 */
export interface UserAnalytics {
  usage: {
    total_messages: number;
    total_conversations: number;
    user_messages: number;
    assistant_messages: number;
    avg_messages_per_conversation: number;
    active_days: number;
  };
  quality?: {
    avg_resonance: number;
    high_quality_count: number;
    low_quality_count: number;
    trend: string;
  };
}

/**
 * Get user analytics (messages, conversations, quality)
 * Endpoint: GET /resonant-chat/analytics
 */
export const getUserAnalytics = async (timeRange: string = '30d'): Promise<UserAnalytics | null> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/analytics?time_range=${timeRange}`);
    return response.data;
  } catch (error: any) {
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (!isConnectionError) {
      logger.error('User analytics error', error, { component: 'ResonantChat' });
    }
    return null;
  }
};

/**
 * Provider Stats Interface
 */
export interface ProviderStats {
  health: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency?: number; // in milliseconds
  cost?: number; // cost per 1K tokens
  errorRate?: number; // percentage (0-100)
  lastChecked?: string; // ISO date string
  requestsCount?: number;
  tokensUsed?: number;
}

export interface ProviderStatsResponse {
  providers: Record<string, ProviderStats>;
}

/**
 * Get provider statistics (health, latency, cost)
 * Endpoint: GET /resonant-chat/provider/stats
 */
export const getProviderStats = async (): Promise<ProviderStatsResponse> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/provider/stats');
    return response.data;
  } catch (error: any) {
    logger.error('Provider stats error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Get list of available providers
 * Endpoint: GET /resonant-chat/providers
 */
export const getProviders = async () => {
  try {
    const response = await fastapiClient.get('/resonant-chat/providers');
    return response.data;
  } catch (error: any) {
    logger.error('Get providers error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Check provider health
 * Endpoint: GET /resonant-chat/provider/health
 */
export const getProviderHealth = async (providerId?: string) => {
  try {
    const url = providerId
      ? `/resonant-chat/provider/health?provider=${providerId}`
      : '/resonant-chat/provider/health';
    const response = await fastapiClient.get(url);
    return response.data;
  } catch (error: any) {
    logger.error('Provider health check error', error, { component: 'ResonantChat' });
    throw error;
  }
};

/**
 * Evidence Graph Data Interface
 */
export interface EvidenceGraphNode {
  id: string;
  type: 'query' | 'anchor' | 'memory' | 'message';
  label: string;
  xyz: [number, number, number];
  role?: 'user' | 'assistant' | 'system';
}

export interface EvidenceGraphEdge {
  source: string;
  target: string;
  type: 'evidence' | 'memory' | 'anchor';
}

export interface EvidenceGraphData {
  message_id: string;
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
  node_count: number;
  edge_count: number;
}

/**
 * Get evidence graph for a message
 * Endpoint: GET /resonant-chat/evidence-graph/{message_id}
 * 
 * Returns safe visualization data (no sensitive weights or exact values)
 */
export const getEvidenceGraph = async (messageId: string): Promise<EvidenceGraphData> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/evidence-graph/${messageId}`);
    return response.data;
  } catch (error: any) {
    logger.error('Evidence graph error', error, { component: 'ResonantChat' });
    // Return empty graph if endpoint doesn't exist yet
    if (error?.response?.status === 404 || error?.response?.status === 501) {
      return {
        message_id: messageId,
        nodes: [],
        edges: [],
        node_count: 0,
        edge_count: 0,
      };
    }
    throw error;
  }
};

/**
 * Chat Metrics Response
 */
export interface ChatMetrics {
  chat_id: string;
  quality: number;           // 0-1, higher is better
  hallucination: number;     // 0-1, lower is better
  tokens: number;
  message_count: number;
  assistant_message_count: number;
  provider_breakdown: Record<string, number>;
  metrics_available: boolean;
  quality_samples: number;
  hallucination_samples: number;
}

/**
 * Message Metrics Response
 */
export interface MessageMetrics {
  message_id: string;
  role: string;
  quality: number;
  hallucination: number;
  tokens: number;
  provider: string | null;
  model?: string | null;
  preferred_provider?: string | null;
  was_fallback?: boolean;
  fallback_chain?: Array<{ provider: string; status: string; reason?: string }> | null;
  token_usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null;
  agent_id?: string;
  team_id?: string | null;
  hash: string | null;
  xyz: [number, number, number] | null;
  created_at: string | null;
  anchors?: string[];
  metrics: {
    resonant_energy: number;
    hallucination: number;
    evidence: number;
    anchor_following: number;
    context_coherence?: number;
    memory_utilization?: number;
    sentiment?: string;
    sentiment_confidence?: number;
    emotion?: string;
    emotion_confidence?: number;
    hallucination_risk_level?: string;
    hallucination_flags?: number;
    hallucination_details?: Array<{
      type: string;
      content: string;
      confidence: number;
    }>;
    response_time_ms?: number | null;
    agent_feedback?: {
      positive_count: number;
      negative_count: number;
      satisfaction_rate: number;
      total_feedback: number;
      trend: string;
    };
    dsid?: {
      dsid_id: string | null;
      t1_score: number;
      t3_score: number;
      lineage_depth: number;
      verification_status: string;
      content_hash: string | null;
      parent_dsid: string | null;
    };
    enhanced_metrics?: {
      calculation_method: string;
      confidence: number;
      semantic_similarity_source?: 'embeddings' | 'fallback' | string;
      resonant_energy_breakdown?: Record<string, number>;
      evidence_breakdown?: Record<string, number>;
      anchor_breakdown?: Record<string, number>;
      coherence_breakdown?: Record<string, number>;
      memory_breakdown?: Record<string, number>;
    };
    rag_verification?: {
      verified: boolean;
      reason: string;
      support_score: number;
      claims_checked?: number;
      claims_supported?: number;
      claim_details?: Array<{
        claim: string;
        type: string;
        supported: boolean;
        support_type: string;
      }>;
    };
    claim_verification?: {
      system_prompt_grounding?: {
        grounded: boolean;
        score: number;
        violations: Array<{ type: string; detail: string; confidence: number }>;
        method: string;
      } | null;
      knowledge_base?: {
        checked: boolean;
        score: number;
        method: string;
        claims_checked?: number;
        claims_supported?: number;
        contradictions?: Array<{ claim: string; type: string; confidence: number }>;
      } | null;
      llm_as_judge?: {
        judged: boolean;
        score: number;
        issues?: string[];
        verdict?: string;
        method: string;
      } | null;
      methods_used?: string[];
    } | null;
  };
}

/**
 * Get metrics for a chat conversation
 * Endpoint: GET /resonant-chat/metrics/{chat_id}
 * 
 * Returns quality, hallucination, token count, and provider breakdown
 */
export const getChatMetrics = async (chatId: string): Promise<ChatMetrics | null> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/metrics/${chatId}`);
    // Only return if we have real metrics from backend
    if (response.data && response.data.metrics_available) {
      return response.data;
    }
    // Backend returned but no real metrics available
    return null;
  } catch (error: any) {
    logger.error('Chat metrics error', error, { component: 'ResonantChat' });
    // Return null to indicate metrics are unavailable - don't fake them
    return null;
  }
};

/**
 * Get metrics for a specific message
 * Endpoint: GET /resonant-chat/message-metrics/{message_id}
 * 
 * Returns quality, hallucination, token count for a single message
 */
export const getMessageMetrics = async (messageId: string): Promise<MessageMetrics | null> => {
  // Skip if messageId is not a valid UUID (frontend-generated IDs like "msg-123..." won't work)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(messageId)) {
    // Silently skip - this is a frontend-generated ID, not a backend UUID
    return null;
  }
  
  try {
    const response = await fastapiClient.get(`/resonant-chat/message-metrics/${messageId}`);
    // Only return if we have valid metrics data
    if (response.data && response.data.metrics) {
      return response.data;
    }
    return null;
  } catch (error: any) {
    logger.error('Message metrics error', error, { component: 'ResonantChat' });
    // Return null to indicate metrics are unavailable - don't fake them
    return null;
  }
};


export const archiveConversation = async (conversationId: string) => {
  try {
    const response = await fastapiClient.put(`/resonant-chat/conversations/${conversationId}/archive`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to archive conversation:', error);
    throw error;
  }
};

export const deleteResonantConversation = async (conversationId: string) => {
  try {
    const response = await fastapiClient.delete(`/resonant-chat/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to delete conversation:', error);
    throw error;
  }
};

export const deleteResonantMessage = async (conversationId: string, messageId: string) => {
  try {
    const response = await fastapiClient.delete(
      `/resonant-chat/conversations/${conversationId}/messages/${messageId}`
    );
    return response.data;
  } catch (error: any) {
    logger.error('Failed to delete message:', error);
    throw error;
  }
};

/**
 * Extract memorable facts from a conversation exchange.
 * Called after each AI response to auto-save user preferences, facts, etc.
 */
export const extractMemories = async (
  userMessage: string,
  assistantMessage: string,
  chatId: string,
): Promise<{ memories_extracted: Array<{ id: string; content: string; type: string }>; count: number }> => {
  try {
    const response = await fastapiClient.post('/resonant-chat/extract-memories', {
      user_message: userMessage,
      assistant_message: assistantMessage,
      chat_id: chatId,
    });
    return response.data;
  } catch (error: any) {
    // Non-critical — don't throw
    return { memories_extracted: [], count: 0 };
  }
};

/**
 * Save agentic-chat (AI Assistant) messages into the resonant chat pipeline.
 * This ensures agentic messages persist alongside regular resonant chat messages
 * with full pipeline support (hashing, DSID, memory ingestion, PMI).
 */
export const saveAgenticToResonant = async (
  userMessage: string,
  assistantResponse: string,
  chatId?: string,
  options?: {
    toolResults?: Array<{ tool_name: string; success: boolean; result?: any; error?: string }>;
    toolCalls?: Array<{ tool: string; args?: any }>;
    model?: string;
    tokensUsed?: number;
    loops?: number;
  },
): Promise<{ chat_id: string; user_message_id: string; assistant_message_id: string; resonance_score: number }> => {
  try {
    const response = await fastapiClient.post('/resonant-chat/save-agentic', {
      user_message: userMessage,
      assistant_response: assistantResponse,
      chat_id: chatId || undefined,
      tool_results: options?.toolResults || [],
      tool_calls: options?.toolCalls || [],
      model: options?.model,
      tokens_used: options?.tokensUsed || 0,
      loops: options?.loops || 0,
    });
    return response.data;
  } catch (error: any) {
    logger.warn('[saveAgenticToResonant] Failed (non-critical):', error?.message || error);
    return { chat_id: chatId || '', user_message_id: '', assistant_message_id: '', resonance_score: 0 };
  }
};


/**
 * Smart-group conversations into topic categories.
 */
export interface ConversationGroup {
  topic: string;
  count: number;
  conversations: Array<{
    id: string;
    title: string;
    created_at: string | null;
    updated_at: string | null;
    message_count: number;
    last_message_at: string | null;
  }>;
}

export const categorizeConversations = async (): Promise<{ groups: ConversationGroup[]; total: number }> => {
  try {
    const response = await fastapiClient.post('/resonant-chat/conversations/categorize');
    return response.data;
  } catch (error: any) {
    return { groups: [], total: 0 };
  }
};
