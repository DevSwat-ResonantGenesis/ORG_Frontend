/**
 * Chat API Client
 * Handles chat conversations and messages with Resonant Chat backend
 */

import fastapiClient from './fastapiClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  aiProvider?: string;
  hash?: string;
  resonanceScore?: number;
  xyz?: [number, number, number];
}

export interface Chat {
  id: string;
  title: string;
  status?: 'active' | 'archived' | 'deleted';
  agent_hash?: string;
  created_at: string;
  updated_at: string;
  meta_data?: any;
}

export interface SendMessageRequest {
  message: string;
  chat_id?: string;
  preferred_provider?: string;
  agent_hash?: string;
  teamId?: string;
  attached_files?: any[];
  code_selection?: any;
  isolate_anchors?: boolean;
  execute_mode?: boolean;
  project_context?: any;
}

export interface SendMessageResponse {
  message: ChatMessage;
  anchors?: string[];
  hash?: string;
  resonanceScore?: number;
  aiProvider?: string;
  memoryUpdated?: boolean;
  chatId: string;
  evidenceGraph?: any;
}

export interface CreateChatRequest {
  title?: string;
  agent_hash?: string;
}

export interface CreateChatResponse {
  chatId: string;
  title: string;
}

export interface ChatHistory {
  chatId: string;
  title: string;
  messages: ChatMessage[];
  agent_hash?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Send a message in a chat
 */
export const sendMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  try {
    const response = await fastapiClient.post('/resonant-chat/message', request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to send message:', error);
    throw new Error(error.response?.data?.detail || 'Failed to send message');
  }
};

/**
 * Create a new chat conversation
 */
export const createChat = async (
  request: CreateChatRequest = {}
): Promise<CreateChatResponse> => {
  try {
    const response = await fastapiClient.post('/resonant-chat/create', request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create chat');
  }
};

/**
 * List all chat conversations
 */
export const listChats = async (
  limit: number = 50
): Promise<Chat[]> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/conversations', {
      params: { limit },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to list chats:', error);
    throw new Error(error.response?.data?.detail || 'Failed to list chats');
  }
};

/**
 * Get chat history with all messages
 */
export const getChatHistory = async (
  chatId: string
): Promise<ChatHistory> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/conversations/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get chat history:', error);
    throw new Error(error.response?.data?.detail || 'Failed to get chat history');
  }
};

/**
 * Add a message to an existing conversation
 */
export const addMessageToChat = async (
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<SendMessageResponse> => {
  try {
    const response = await fastapiClient.post(
      `/resonant-chat/conversations/${chatId}/messages`,
      { role, content }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to add message to chat:', error);
    throw new Error(error.response?.data?.detail || 'Failed to add message');
  }
};

/**
 * Get available AI providers
 */
export const getProviders = async (): Promise<any[]> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/providers');
    return response.data.providers || [];
  } catch (error: any) {
    console.error('Failed to get providers:', error);
    return [];
  }
};

/**
 * Get evidence graph for a message
 */
export const getEvidenceGraph = async (
  messageId: string
): Promise<any> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/evidence-graph/${messageId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get evidence graph:', error);
    return null;
  }
};

/**
 * Get chat metrics
 */
export const getChatMetrics = async (
  chatId: string
): Promise<{
  total_messages: number;
  avg_resonance_score: number;
  providers_used: string[];
  total_tokens?: number;
}> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/metrics/${chatId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get chat metrics:', error);
    return {
      total_messages: 0,
      avg_resonance_score: 0,
      providers_used: [],
    };
  }
};

/**
 * Get message metrics
 */
export const getMessageMetrics = async (
  messageId: string
): Promise<any> => {
  try {
    const response = await fastapiClient.get(`/resonant-chat/message-metrics/${messageId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get message metrics:', error);
    return null;
  }
};

/**
 * Submit feedback for a message
 */
export const submitFeedback = async (
  messageId: string,
  rating: number,
  comment?: string
): Promise<void> => {
  try {
    await fastapiClient.post('/resonant-chat/feedback', {
      message_id: messageId,
      rating,
      comment,
    });
  } catch (error: any) {
    console.error('Failed to submit feedback:', error);
    throw new Error(error.response?.data?.detail || 'Failed to submit feedback');
  }
};

/**
 * Get available agents
 */
export const getAvailableAgents = async (): Promise<any[]> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/agents/list');
    return response.data.agents || [];
  } catch (error: any) {
    console.error('Failed to get agents:', error);
    return [];
  }
};

/**
 * Get available teams
 */
export const getAvailableTeams = async (): Promise<any[]> => {
  try {
    const response = await fastapiClient.get('/resonant-chat/teams');
    return response.data.teams || [];
  } catch (error: any) {
    console.error('Failed to get teams:', error);
    return [];
  }
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

/**
 * Get provider color for UI
 */
export const getProviderColor = (provider?: string): string => {
  switch (provider?.toLowerCase()) {
    case 'chatgpt':
    case 'openai':
      return '#10a37f';
    case 'claude':
    case 'anthropic':
      return '#d97757';
    case 'gemini':
    case 'google':
      return '#4285f4';
    case 'resonant-brain':
      return '#a855f7';
    default:
      return '#6b7280';
  }
};

/**
 * Get provider label for UI
 */
export const getProviderLabel = (provider?: string): string => {
  switch (provider?.toLowerCase()) {
    case 'chatgpt':
    case 'openai':
      return 'ChatGPT';
    case 'claude':
    case 'anthropic':
      return 'Claude';
    case 'gemini':
    case 'google':
      return 'Gemini';
    case 'resonant-brain':
      return 'Resonant Brain';
    default:
      return provider || 'Unknown';
  }
};

/**
 * Calculate resonance score color
 */
export const getResonanceColor = (score?: number): string => {
  if (!score) return '#6b7280';
  if (score >= 0.8) return '#22c55e'; // green
  if (score >= 0.6) return '#3b82f6'; // blue
  if (score >= 0.4) return '#f59e0b'; // orange
  return '#ef4444'; // red
};
