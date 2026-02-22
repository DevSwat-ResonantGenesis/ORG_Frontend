import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

export interface ProviderCapability {
  id: string;
  name: string;
  description: string;
}

export interface LiveProvider {
  id: string;
  provider_key: string;
  name: string;
  available: boolean;
  has_user_key: boolean;
  uses_credits: boolean;
  model: string;
  description: string;
  capabilities: string[];
  latency?: number;
  status?: 'online' | 'offline' | 'degraded';
}

export interface ProvidersResponse {
  providers: LiveProvider[];
  default: string;
  fallback_chain: string[];
  fallback_chain_provider_keys: string[];
  can_use_platform_keys: boolean;
  user_plan: string;
  is_paid_user: boolean;
  credits: {
    remaining: number | null;
    total: number | null;
    unlimited: boolean;
  };
  message?: string;
}

/**
 * Fetch live provider data from backend including availability, capabilities, and latency
 */
export const fetchLiveProviders = async (): Promise<ProvidersResponse> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/providers');
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch live providers:', error);
    // Return fallback data if API fails
    return {
      providers: [],
      default: 'auto',
      fallback_chain: [],
      fallback_chain_provider_keys: [],
      can_use_platform_keys: false,
      user_plan: 'free',
      is_paid_user: false,
      credits: {
        remaining: 0,
        total: 1000,
        unlimited: false
      },
      message: 'Unable to load providers. Please refresh the page.'
    };
  }
};

/**
 * Get capability metadata for display
 */
export const getCapabilityInfo = (capability: string): ProviderCapability => {
  const capabilities: Record<string, ProviderCapability> = {
    chat: {
      id: 'chat',
      name: 'Chat',
      description: 'General conversation and Q&A'
    },
    coding: {
      id: 'coding',
      name: 'Coding',
      description: 'Code generation, debugging, and technical tasks'
    },
    vision: {
      id: 'vision',
      name: 'Vision',
      description: 'Image analysis and understanding'
    },
    image: {
      id: 'image',
      name: 'Image Generation',
      description: 'Create images from text descriptions'
    },
    music: {
      id: 'music',
      name: 'Music',
      description: 'Music generation and audio tasks'
    },
    video: {
      id: 'video',
      name: 'Video',
      description: 'Video analysis and generation'
    },
    reasoning: {
      id: 'reasoning',
      name: 'Reasoning',
      description: 'Complex logical reasoning and problem solving'
    },
    creative: {
      id: 'creative',
      name: 'Creative Writing',
      description: 'Stories, poetry, and creative content'
    }
  };

  return capabilities[capability] || {
    id: capability,
    name: capability.charAt(0).toUpperCase() + capability.slice(1),
    description: capability
  };
};

/**
 * Get provider icon component name
 */
export const getProviderIcon = (providerId: string): string => {
  const iconMap: Record<string, string> = {
    'auto': 'AutoIcon',
    'openai': 'ChatGPTIcon',
    'chatgpt': 'ChatGPTIcon',
    'gemini': 'GeminiIcon',
    'google': 'GeminiIcon',
    'anthropic': 'ClaudeIcon',
    'claude': 'ClaudeIcon',
    'groq': 'GroqIcon',
    'mistral': 'MistralIcon'
  };

  return iconMap[providerId.toLowerCase()] || 'AutoIcon';
};

/**
 * Format latency for display
 */
export const formatLatency = (latency?: number): string => {
  if (!latency) return '';
  if (latency < 100) return `${Math.round(latency)}ms`;
  if (latency < 1000) return `${Math.round(latency)}ms`;
  return `${(latency / 1000).toFixed(1)}s`;
};
