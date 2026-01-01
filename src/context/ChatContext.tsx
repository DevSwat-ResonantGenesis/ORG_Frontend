import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getChatHistory, createChat } from '@/api/resonantChat';
import { isAuthenticated } from '@/utils/auth-cookies';
import { getSession } from '@/utils/auth';
import { logger } from '@/utils/logger';

// Use same key as ResonantChatPage and FloatingChatWidget for sync
const CHAT_STORAGE_KEY = 'resonant-chat-current-conversation';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  aiProvider?: string;
  validity?: number;
  sources?: Array<{
    id: string;
    content: string;
    score: number;
    hash?: string;
    cluster?: string;
    metadata?: Record<string, any>;
  }>;
  evidence_graph?: Record<string, any>;
  hash?: string;
  anchors?: string[];
  resonanceScore?: number;
  xyz?: [number, number, number];
  modules?: any;
  metrics?: {
    resonantEnergy?: number;
    hallucination?: number;
    evidence?: number;
    anchorFollowing?: number;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadChatHistory: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  refreshMessages: () => void;
  lastUpdate: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

// Helper to get chat ID from response
const getChatIdFromResponse = (response: any): string | null =>
  response?.id || response?.chatId || response?.chat_id || response?.chat?.id || null;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = getSession();
  const isLoggedIn = isAuthenticated() && !!session;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [currentConversationId, setCurrentConversationIdState] = useState<string | null>(() => {
    // Use localStorage for persistence across tabs and page refreshes
    return localStorage.getItem(CHAT_STORAGE_KEY);
  });
  
  const loadingRef = useRef(false);
  const lastLoadTimeRef = useRef(0);
  const MIN_LOAD_INTERVAL = 5000; // Minimum 5 seconds between API calls

  // Sync conversation ID to localStorage (shared with FloatingChatWidget and ResonantChatPage)
  const setCurrentConversationId = useCallback((id: string | null) => {
    setCurrentConversationIdState(id);
    if (id) {
      localStorage.setItem(CHAT_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
    // Trigger sync event for same-tab components
    window.dispatchEvent(new CustomEvent('resonant-chat-sync'));
  }, []);

  // Load chat history from backend
  const loadChatHistory = useCallback(async () => {
    const conversationId = localStorage.getItem(CHAT_STORAGE_KEY) || currentConversationId;
    if (!conversationId || !isLoggedIn || loadingRef.current) {
      return;
    }
    
    // Rate limit: prevent excessive API calls
    const now = Date.now();
    if (now - lastLoadTimeRef.current < MIN_LOAD_INTERVAL) {
      logger.info('[ChatContext] Skipping load - rate limited');
      return;
    }
    
    loadingRef.current = true;
    lastLoadTimeRef.current = now;
    
    try {
      logger.info('[ChatContext] Loading chat history for:', conversationId);
      const history = await getChatHistory(conversationId);
      
      if (history) {
        let messagesArray: any[] = [];
        
        if (Array.isArray(history)) {
          messagesArray = history;
        } else if (history.messages && Array.isArray(history.messages)) {
          messagesArray = history.messages;
        }
        
        if (messagesArray.length > 0) {
          const loadedMessages: ChatMessage[] = messagesArray.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role || 'user',
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
            aiProvider: msg.aiProvider || msg.ai_provider,
            hash: msg.hash,
            anchors: msg.anchors || [],
            resonanceScore: msg.resonanceScore || msg.resonance_score || 0,
            xyz: msg.xyz || (msg.xyz_x !== undefined ? [msg.xyz_x, msg.xyz_y || 0, msg.xyz_z || 0] : undefined),
            validity: msg.validity,
            sources: msg.sources,
            evidence_graph: msg.evidence_graph,
            modules: msg.modules,
            metrics: msg.metrics,
          }));
          
          setMessages(loadedMessages);
          setLastUpdate(Date.now());
          logger.info('[ChatContext] Loaded', loadedMessages.length, 'messages');
        }
      }
    } catch (error) {
      logger.error('[ChatContext] Failed to load chat history', error);
    } finally {
      loadingRef.current = false;
    }
  }, [currentConversationId, isLoggedIn]);

  // Add a new message and trigger sync
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
    setLastUpdate(Date.now());
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastUpdate(Date.now());
  }, []);

  // Trigger a refresh for other components
  const refreshMessages = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  // Initialize conversation on mount - only load if we have an existing conversation
  useEffect(() => {
    if (!isLoggedIn) return;

    // Only load existing conversation, don't auto-create
    const existingConversationId = localStorage.getItem(CHAT_STORAGE_KEY);
    if (existingConversationId && existingConversationId !== currentConversationId) {
      setCurrentConversationIdState(existingConversationId);
      // Delay load to prevent race conditions
      const timer = setTimeout(() => {
        loadChatHistory();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]); // Removed loadChatHistory from deps to prevent loops

  // Listen for storage changes (cross-tab and cross-component sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAT_STORAGE_KEY) {
        const newId = e.newValue;
        if (newId !== currentConversationId) {
          setCurrentConversationIdState(newId);
          if (newId) {
            loadChatHistory();
          } else {
            setMessages([]);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentConversationId, loadChatHistory]);

  // Custom event for same-tab message sync - debounced
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const handleMessageSync = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadChatHistory();
      }, 500); // Debounce 500ms
    };

    window.addEventListener('resonant-chat-sync', handleMessageSync);
    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resonant-chat-sync', handleMessageSync);
    };
  }, [loadChatHistory]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        currentConversationId,
        setCurrentConversationId,
        isLoading,
        setIsLoading,
        loadChatHistory,
        addMessage,
        clearMessages,
        refreshMessages,
        lastUpdate,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Helper function to trigger sync across components
export const triggerChatSync = () => {
  window.dispatchEvent(new CustomEvent('resonant-chat-sync'));
};
