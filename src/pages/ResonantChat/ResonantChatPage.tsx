import { createMemory, deleteConversation, deleteMemory, listConversations, listMemories, updateConversation, updateMemory, uploadFile, type MemoryResponse } from '@/api/rag';
import { createChat, getChatHistory, getMemoryAnchors, getResonanceClusters, sendResonantMessage, getProviderStats, getUserAnalytics, type UserAnalytics } from '@/api/resonantChat';
import { triggerChatSync } from '@/context/ChatContext';
import { fetchAvailableProviders } from '@/api/userApiKeys';
import { fetchUsageSummary } from '@/api/usage';
import {
  AnalyticsIcon,
  BugIcon, CheckIcon,
  ChevronDownIcon,
  ClipboardIcon,
  CloseIcon,
  CopyIcon,
  DeleteIcon, DownloadIcon,
  EditIcon,
  FileIcon,
  GlobeIcon,
  LightbulbIcon,
  MemoryIcon,
  PenIcon,
  PlusIcon,
  RegenerateIcon,
  SearchIcon,
  SearchMagnifyIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  StorageIcon,
  TargetIcon
} from '@/components/Icons/ResonantChatIcons';
import EnhancedSidebar from '@/components/ResonantChat/EnhancedSidebar';
import { ChatInputBar } from '@/components/ResonantChat/ChatInputBar';
import { ProviderSelector, type Provider } from '@/components/ui/ProviderSelector';
import { useResonantChatMenu } from '@/context/ResonantChatMenuContext';
import { useToastContext } from '@/context/ToastContext';
import { useThemeStore } from '@/store/themeStore';
import { getSession } from '@/utils/auth';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';
import { logger } from '@/utils/logger';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Hash Sphere visualization removed - company secret
import { listAgentTeams, type AgentTeam } from '@/api/agentTeams';
import { getEvidenceGraph, getChatMetrics, getMessageMetrics, type ChatMetrics, type MessageMetrics } from '@/api/resonantChat';
import { EvidenceGraphVisualization, type EvidenceGraphData } from '@/components/EvidenceGraph/EvidenceGraphVisualization';
import { AgentSelector } from '@/components/ResonantChat/AgentSelector';
import { FeedbackButtons } from '@/components/ResonantChat/FeedbackButtons';
import { MetricsDashboard } from '@/components/ResonantChat/MetricsDashboard';
import { MemoryViewer } from '@/components/ResonantChat/MemoryViewer';
import { ModuleOutputs } from '@/components/ResonantChat/ModuleOutputs';
import { TeamSelector } from '@/components/ResonantChat/TeamSelector';
import { FloatingHome } from '@/components/ResonantChat/FloatingHome';
import type { ProjectFile } from '@/components/ResonantChat/SplitView';

// Lazy load SplitView to prevent blocking main thread
const SplitViewModule = React.lazy(() => 
  import('@/components/ResonantChat/SplitView').then(module => ({ default: module.SplitViewModule }))
);
import { SSEClient } from '@/utils/sseClient';
import type { WebSocketMessage } from '@/utils/websocketClient';
import { WebSocketClient } from '@/utils/websocketClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Lazy load ProjectBuilder to avoid blocking if jszip isn't installed
const ProjectBuilder = React.lazy(() =>
  import('@/components/ResonantChat/ProjectBuilder').then(module => ({ default: module.ProjectBuilder }))
    .catch(() => ({
      default: () => (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Project Builder Not Available</h2>
          <p>JSZip package is not installed.</p>
          <p>Please run: <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>npm install</code></p>
          <p>After installation, refresh the page.</p>
        </div>
      )
    }))
);
// Semantic intent detection using Hash Sphere anchors & clusters
import { detectProjectIntent } from '@/utils/semanticIntentDetector';
// @ts-ignore - react-syntax-highlighter types
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ResonantChatPage-2025.module.css';

interface ModuleOutputs {
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

// Use same key as FloatingChatWidget for sync
const CHAT_STORAGE_KEY = 'resonant-chat-current-conversation';

const getChatIdFromResponse = (response: any): string | null =>
  response?.id || response?.chatId || response?.chat_id || response?.chat?.id || null;

/**
 * Format AI provider name for display
 * Converts backend provider names to user-friendly display names
 */
const formatProviderName = (provider: string | undefined): string => {
  if (!provider) return 'AI';
  
  const providerMap: Record<string, string> = {
    'chatgpt': 'GPT-4',
    'openai': 'GPT-4',
    'gpt': 'GPT-4',
    'gpt-4': 'GPT-4',
    'gpt-4o': 'GPT-4o',
    'gemini': 'Gemini',
    'google': 'Gemini',
    'groq': 'Groq',
    'llama': 'Llama',
    'llama-3.3-70b-versatile': 'Llama 3.3',
    'anthropic': 'Claude',
    'claude': 'Claude',
    'mistral': 'Mistral',
    'resonant-brain': 'Resonant',
    'debate_engine': 'Multi-Agent Debate',
    'debate': 'Multi-Agent',
    'agent_debug': 'Debug Agent',
    'agent_code': 'Code Agent',
    'agent_reasoning': 'Reasoning Agent',
    'agent_research': 'Research Agent',
    'agent_summary': 'Summary Agent',
    'agent_planning': 'Planning Agent',
    'agent_math': 'Math Agent',
    'agent_security': 'Security Agent',
    'agent_architecture': 'Architecture Agent',
    'agent_test': 'Test Agent',
    'agent_review': 'Review Agent',
    'agent_explain': 'Explain Agent',
    'agent_optimization': 'Optimization Agent',
    'agent_documentation': 'Documentation Agent',
    'agent_migration': 'Migration Agent',
    'agent_api': 'API Agent',
    'agent_database': 'Database Agent',
    'agent_devops': 'DevOps Agent',
    'agent_refactor': 'Refactor Agent',
    'agent_accessibility': 'Accessibility Agent',
    'agent_i18n': 'i18n Agent',
    'agent_regex': 'Regex Agent',
    'agent_git': 'Git Agent',
    'agent_css': 'CSS Agent',
    'agent': 'Agent',
    // Team providers
    'team_code_review_team': 'Code Review Team',
    'team_security_audit_team': 'Security Audit Team',
    'team_architecture_team': 'Architecture Team',
    'team_learning_team': 'Learning Team',
    'team_debug_team': 'Debug Team',
    'team_full_stack_team': 'Full Stack Team',
    'team_refactor_team': 'Refactor Team',
    'team_accessibility_team': 'Accessibility Team',
    'team_performance_team': 'Performance Team',
    'team': 'Team',
    'unknown': 'AI',
  };
  
  // Check exact match first
  const lowerProvider = provider.toLowerCase();
  if (providerMap[lowerProvider]) {
    return providerMap[lowerProvider];
  }
  
  // Check for agent_ prefix pattern
  if (lowerProvider.startsWith('agent_')) {
    const agentType = lowerProvider.replace('agent_', '');
    return `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`;
  }
  
  // Check partial matches
  for (const [key, value] of Object.entries(providerMap)) {
    if (lowerProvider.includes(key)) {
      return value;
    }
  }
  
  // Capitalize first letter as fallback
  return provider.charAt(0).toUpperCase() + provider.slice(1);
};

interface GeneratedImage {
  url?: string;
  base64_data?: string;
  revised_prompt?: string;
  model: string;
  size: string;
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface Message {
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
  hash?: string; // Hash sphere hash
  anchors?: string[]; // Memory anchors
  resonanceScore?: number; // Resonance score from hash sphere
  xyz?: [number, number, number]; // XYZ coordinates for Hash Sphere visualization
  modules?: ModuleOutputs; // Hash Sphere module outputs
  metrics?: {
    resonantEnergy?: number;
    hallucination?: number;
    evidence?: number;
    anchorFollowing?: number;
  };
  generatedImages?: GeneratedImage[]; // DALL-E generated images
  webSearchResults?: WebSearchResult[]; // Web search results
}

const ResonantChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const isLoggedIn = isAuthenticated() && !!session;
  const { success, error: showError, warning, info } = useToastContext();
  const { theme, toggleTheme } = useThemeStore();
  const { setMenuItems } = useResonantChatMenu();
  
  // SECURITY: Redirect to signup if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('[ResonantChat] User not logged in, redirecting to signup');
      navigate('/signup', { replace: true });
    }
  }, [isLoggedIn, navigate]);
  
  // Get initial message from localStorage (from hero section) or navigation state (fallback)
  const initialMessage = localStorage.getItem('resonant-chat-pending-message') || 
    (location.state as { initialMessage?: string })?.initialMessage;

  // SECURITY: Clear chat data if user changed (prevents data leak between users)
  const clearChatDataIfUserChanged = useCallback(() => {
    const sessionData = getSessionData();
    // Use userId from session (UUID from backend) for proper user identification
    const currentUserId = sessionData?.userId || sessionData?.email;
    const storedUserId = localStorage.getItem('resonant-chat-user-id');
    
    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      // User changed - clear all chat data to prevent data leak
      console.log('[ResonantChat] User changed, clearing chat data for security');
      localStorage.removeItem('resonant-chat-messages');
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem('resonant-chat-selected-agent-hash');
      localStorage.removeItem('guest-conversations');
      localStorage.removeItem('resonant-chat-current-conversation');
    }
    
    // Store current user ID for future comparison
    if (currentUserId) {
      localStorage.setItem('resonant-chat-user-id', currentUserId);
    }
  }, []);

  // Messages loaded ONLY from backend - no localStorage to prevent cross-user data leaks
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('auto');
  const [autoReason, setAutoReason] = useState('');
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [providerStats, setProviderStats] = useState<Record<string, { health: string; latency?: number; available?: boolean }>>({});
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [agentMode, setAgentMode] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [availableAgents, setAvailableAgents] = useState<Array<{ hash: string; name: string }>>([]);

  // Additional settings states
  const [autoSave, setAutoSave] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showProviderBadges, setShowProviderBadges] = useState(true);
  const [showValidityScores, setShowValidityScores] = useState(true);
  const [showMessageActions, setShowMessageActions] = useState(true);
  const [showMessageMetrics, setShowMessageMetrics] = useState(true);
  const [alignUserMessagesRight, setAlignUserMessagesRight] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [inputAutoResize, setInputAutoResize] = useState(true);
  const [soundNotifications, setSoundNotifications] = useState(false);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [showShortcutsInfo, setShowShortcutsInfo] = useState(false);
  const [enableFocusHighlights, setEnableFocusHighlights] = useState(true);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showMetricsSticker, setShowMetricsSticker] = useState(false);
  const [showThreadsSticker, setShowThreadsSticker] = useState(false);
  const [showSettingsSticker, setShowSettingsSticker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [codeSelection, setCodeSelection] = useState<{ file: string; lines: number[]; code?: string } | null>(null);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [showEvidenceGraph, setShowEvidenceGraph] = useState<string | null>(null); // Message ID for which to show graph
  const [evidenceGraphData, setEvidenceGraphData] = useState<EvidenceGraphData | null>(null);
  const [isLoadingEvidenceGraph, setIsLoadingEvidenceGraph] = useState(false);
  const [chatMetrics, setChatMetrics] = useState<ChatMetrics | null>(null);
  const [messageMetrics, setMessageMetrics] = useState<MessageMetrics | null>(null);

  // Real-time updates (WebSocket/SSE)
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [sseClient, setSseClient] = useState<SSEClient | null>(null);
  const [useWebSocket, setUseWebSocket] = useState(true); // Prefer WebSocket, fallback to SSE
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  
  // Phase 5 UI Components
  const [showMetricsDashboard, setShowMetricsDashboard] = useState(false);
  const [showMemoryViewer, setShowMemoryViewer] = useState(false);
  const [conversations, setConversations] = useState<Array<{ id: string; title?: string; created_at?: string; message_count?: number; last_message_at?: string }>>([]);
  const [memories, setMemories] = useState<MemoryResponse[]>([]);
  const [isLoadingMemory, setIsLoadingMemory] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState<string | null>(null);
  const [isUpdatingMemory, setIsUpdatingMemory] = useState(false);
  const [isUpdatingConversation, setIsUpdatingConversation] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState<string | null>(null);
  // SECURITY: Clear chat data on mount if user changed
  useEffect(() => {
    clearChatDataIfUserChanged();
  }, [clearChatDataIfUserChanged]);

  // Handle initial message from localStorage (hero section) or navigation state (floating widget)
  const initialMessageProcessedRef = useRef(false);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (initialMessage && !initialMessageProcessedRef.current) {
      initialMessageProcessedRef.current = true;
      // Store the message to be sent after component is fully ready
      setPendingInitialMessage(initialMessage);
      // Clear localStorage pending message to prevent re-sending on refresh
      localStorage.removeItem('resonant-chat-pending-message');
      // Clear the navigation state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [initialMessage]);

  // Load chatId from localStorage on mount (synced with FloatingChatWidget)
  // SECURITY: Only load if user hasn't changed
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    // Check if user changed before loading
    const sessionData = getSessionData();
    const currentUserId = sessionData?.userId || sessionData?.email;
    const storedUserId = localStorage.getItem('resonant-chat-user-id');
    
    // If user changed, don't load old conversation ID
    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      return null;
    }
    
    // Load from localStorage on initialization (shared with FloatingChatWidget)
    return localStorage.getItem(CHAT_STORAGE_KEY);
  });

  // Load selected agent hash from localStorage
  // SECURITY: Only load if user hasn't changed
  const [selectedAgentHash, setSelectedAgentHash] = useState<string | null>(() => {
    const sessionData = getSessionData();
    const currentUserId = sessionData?.userId || sessionData?.email;
    const storedUserId = localStorage.getItem('resonant-chat-user-id');
    
    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      return null;
    }
    
    return localStorage.getItem('resonant-chat-selected-agent-hash');
  });

  // Save chatId to localStorage whenever it changes (synced with FloatingChatWidget)
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(CHAT_STORAGE_KEY, currentConversationId);
    } else {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [currentConversationId]);

  // Save selected agent hash to localStorage whenever it changes
  useEffect(() => {
    if (selectedAgentHash) {
      localStorage.setItem('resonant-chat-selected-agent-hash', selectedAgentHash);
    } else {
      localStorage.removeItem('resonant-chat-selected-agent-hash');
    }
  }, [selectedAgentHash]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    const ensureConversation = async () => {
      let conversationId = localStorage.getItem(CHAT_STORAGE_KEY);
      
      // Check if coming from hero section with "use existing" flag
      const useExisting = localStorage.getItem('resonant-chat-use-existing');
      if (useExisting) {
        // Clear the flag
        localStorage.removeItem('resonant-chat-use-existing');
        
        // If we have an existing conversation, use it (don't create new)
        if (conversationId) {
          logger.info('[ResonantChat] Using existing conversation from hero input:', conversationId);
          if (!cancelled) {
            setCurrentConversationId(conversationId);
          }
          return;
        }
        // If no existing conversation, fall through to create one
      }

      if (!conversationId) {
        try {
          const newChat = await createChat();
          const newChatId = getChatIdFromResponse(newChat);
          if (newChatId) {
            conversationId = newChatId;
            localStorage.setItem(CHAT_STORAGE_KEY, newChatId);
          }
        } catch (error) {
          logger.error('Failed to initialize Resonant Chat conversation', error);
        }
      }

      if (!cancelled && conversationId) {
        setCurrentConversationId(conversationId);
      }
    };

    ensureConversation();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Fetch available providers and their stats on mount
  useEffect(() => {
    const loadProviders = async () => {
      if (isLoggedIn) {
        try {
          const providersData = await fetchAvailableProviders();
          // Map provider names to Provider type (google -> gemini for display)
          const providerMap: Record<string, Provider> = {
            'openai': 'openai',
            'anthropic': 'anthropic', 
            'google': 'gemini',
            'mistral': 'mistral',
            'groq': 'groq',
          };
          const mapped = providersData.userKeyProviders
            .map(p => providerMap[p] || p as Provider)
            .filter(Boolean);
          setAvailableProviders(mapped);
          
          // Fetch provider health stats
          try {
            const stats = await getProviderStats();
            if (stats?.providers) {
              // Map to our format
              const mappedStats: Record<string, { health: string; latency?: number; available?: boolean }> = {};
              Object.entries(stats.providers).forEach(([key, value]: [string, any]) => {
                const mappedKey = providerMap[key] || key;
                mappedStats[mappedKey] = {
                  health: value.health || 'unknown',
                  latency: value.latency,
                  available: value.health === 'healthy',
                };
              });
              setProviderStats(mappedStats);
            }
          } catch (statsError) {
            logger.warn('Failed to fetch provider stats', statsError as Record<string, unknown>);
          }
          
          // Fetch user analytics
          try {
            const analytics = await getUserAnalytics('30d');
            if (analytics) {
              setUserAnalytics(analytics);
            }
          } catch (analyticsError) {
            logger.warn('Failed to fetch user analytics', analyticsError as Record<string, unknown>);
          }
        } catch (error) {
          logger.error('Failed to fetch available providers', error);
        }
      }
    };
    loadProviders();
  }, [isLoggedIn]);

  // Load chat history when chatId exists on mount
  // Skip if we already have messages (prevents overwriting during active chat)
  useEffect(() => {
    const loadChatHistory = async () => {
      // Don't reload if we already have messages - prevents overwriting during send
      if (messages.length > 0) {
        return;
      }
      if (currentConversationId && isLoggedIn) {
        logger.info('[ResonantChatPage] Loading chat history for:', currentConversationId);
        try {
          const history = await getChatHistory(currentConversationId);
          logger.info('[ResonantChatPage] Chat history response:', history);
          // History endpoint returns object with messages array when chat_id is provided
          if (history) {
            let messagesArray: any[] = [];
            let agentHash: string | null = null;

            if (Array.isArray(history)) {
              // Old format: array of messages
              messagesArray = history;
            } else if (history.messages && Array.isArray(history.messages)) {
              // New format: object with messages array
              messagesArray = history.messages;
              agentHash = history.agent_hash || null;
            }

            if (messagesArray.length > 0) {
              // Convert backend messages to frontend Message format
              const loadedMessages: Message[] = messagesArray.map((msg: any) => ({
                id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                role: msg.role || 'user',
                content: msg.content || '',
                timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
                aiProvider: msg.aiProvider || msg.ai_provider,
                hash: msg.hash,
                anchors: msg.anchors || [],
                resonanceScore: msg.resonanceScore || msg.resonance_score || 0,
                xyz: msg.xyz || (msg.xyz_x !== undefined ? [msg.xyz_x, msg.xyz_y || 0, msg.xyz_z || 0] : undefined),
              }));
              logger.info('[ResonantChatPage] Loaded messages:', loadedMessages.length);
              setMessages(loadedMessages);

              // Update agent hash from chat if available
              if (agentHash && !selectedAgentHash) {
                setSelectedAgentHash(agentHash);
              }
            } else {
              logger.info('[ResonantChatPage] No messages in history');
            }
          }
        } catch (error: any) {
          logger.error('[ResonantChatPage] Failed to load chat history', error);
          // If chat not found (404), clear the stored ID and create new chat
          if (error?.response?.status === 404 || error?.response?.status === 403) {
            logger.info('[ResonantChatPage] Chat not found, clearing stored ID');
            localStorage.removeItem(CHAT_STORAGE_KEY);
            setCurrentConversationId(null);
            // Create new chat
            try {
              const newChat = await createChat();
              const newChatId = getChatIdFromResponse(newChat);
              if (newChatId) {
                localStorage.setItem(CHAT_STORAGE_KEY, newChatId);
                setCurrentConversationId(newChatId);
              }
            } catch (createError) {
              logger.error('[ResonantChatPage] Failed to create new chat', createError);
            }
          }
        }
      }
    };

    loadChatHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId, isLoggedIn]); // messages.length intentionally excluded to prevent reload loops

  // Listen for chat sync events from floating widget
  // Only sync if we don't have active messages (prevents overwriting during chat)
  useEffect(() => {
    const handleChatSync = () => {
      logger.info('[ResonantChatPage] Received chat sync event');
      
      // First, sync conversation ID from localStorage (in case widget created a new one)
      const latestConversationId = localStorage.getItem(CHAT_STORAGE_KEY);
      
      // Update state if conversation ID changed
      if (latestConversationId && latestConversationId !== currentConversationId) {
        logger.info('[ResonantChatPage] Syncing conversation ID from localStorage:', latestConversationId);
        setCurrentConversationId(latestConversationId);
      }
      
      // Don't reload if we already have messages - prevents overwriting during active chat
      // The sync event is mainly for syncing conversation ID, not for reloading messages
    };

    window.addEventListener('resonant-chat-sync', handleChatSync);
    return () => window.removeEventListener('resonant-chat-sync', handleChatSync);
  }, [currentConversationId]);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; id: string; type: 'message' | 'source' } | null>(null);
  const [showFiles, setShowFiles] = useState(false);
  const [abortControllerRef, setAbortControllerRef] = useState<AbortController | null>(null);
  const [previewingFile, setPreviewingFile] = useState<{ file: File; url: string; content?: string } | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadedFileIds, setUploadedFileIds] = useState<Map<File, string>>(new Map());

  // Project Building
  const [buildMode, setBuildMode] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<{ description: string; projectType?: string } | null>(null);
  const [showBuildModule, setShowBuildModule] = useState(false);

  // Check URL parameters for project generation - redirect to standalone Build page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('generate') === 'true') {
      const description = params.get('description') || 'New project';
      const projectType = params.get('projectType') || 'react';
      // Redirect to standalone Build page
      navigate(`/build?description=${encodeURIComponent(description)}&type=${projectType}`);
    }
  }, [navigate]);

  // IDE navigation - redirects to /ide page

  // @ Mention and Command Autocomplete
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [showCommandAutocomplete, setShowCommandAutocomplete] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [commandPosition, setCommandPosition] = useState(0);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);

  // Resonance Clusters
  const [showClustersSticker, setShowClustersSticker] = useState(false);
  const [resonanceClusters, setResonanceClusters] = useState<any[]>([]);
  const [memoryAnchors, setMemoryAnchors] = useState<Array<{ id: string; anchor_text: string; anchor_hash?: string; xyz?: [number, number, number]; importance_score: number }>>([]);
  const [useHashSphere, setUseHashSphere] = useState(true); // Toggle between RAG and Hash Sphere
  // Hash Sphere visualization removed - company secret

  // Memory Library
  const [showMemoryLibrary, setShowMemoryLibrary] = useState(false);
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [memoryEditContent, setMemoryEditContent] = useState('');
  const [memorySearchQuery, setMemorySearchQuery] = useState('');

  // Conversation Rename
  const [renamingConversation, setRenamingConversation] = useState<string | null>(null);
  const [conversationNewTitle, setConversationNewTitle] = useState('');

  // Sidebar state - responsive initialization
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Desktop: closed by default, Mobile: closed by default
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  // Handle window resize for mobile detection and responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // On mobile, close sidebar if it's open when switching to mobile
      // On desktop, keep current state
      if (mobile && sidebarOpen) {
        // Don't auto-close on resize, let user control it
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Listen for header burger menu click - responsive handling
  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen(prev => {
        const newState = !prev;
        // Prevent body scroll when sidebar is open on mobile
        if (isMobile && newState) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
        return newState;
      });
    };

    window.addEventListener('toggleResonantChatSidebar', handleToggleSidebar as EventListener);

    // Cleanup: restore body scroll on unmount
    return () => {
      window.removeEventListener('toggleResonantChatSidebar', handleToggleSidebar as EventListener);
      document.body.style.overflow = ''; // Always restore scroll on cleanup
    };
  }, [isMobile]);

  // Ensure body scroll is restored on component mount/unmount
  useEffect(() => {
    // Restore body scroll on mount (in case it was stuck from previous session)
    document.body.style.overflow = '';

    return () => {
      // Restore on unmount
      document.body.style.overflow = '';
    };
  }, []);

  // Usage Tracking - Now uses actual backend metrics (null = N/A)
  const [showUsagePanel, setShowUsagePanel] = useState(false);
  const [usageStats, setUsageStats] = useState<{ messages: number; tokens: number; quality: number | null; hallucination: number | null }>({ messages: 0, tokens: 0, quality: null, hallucination: null });

  // Load usage stats from backend metrics API (moved to after avgResonance/avgHallucination are defined)

  // Export Format
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'pdf'>('txt');
  const [exportOptions, setExportOptions] = useState({ timestamps: true, badges: true, scores: true, sources: true });

  // Keyboard Shortcuts Panel
  const [showShortcutsPanel, setShowShortcutsPanel] = useState(false);

  // Split View for Code Generation (state only - logic moved to SplitViewModule)
  const [splitViewEnabled, setSplitViewEnabled] = useState(() => {
    return localStorage.getItem('resonant-chat-split-view') === 'true';
  });
  const [splitViewWidth, setSplitViewWidth] = useState(() => {
    const saved = localStorage.getItem('resonant-chat-split-width');
    return saved ? parseInt(saved, 10) : 40;
  });
  const [selectedCodeMessage, setSelectedCodeMessage] = useState<string | null>(null);
  
  // Project Mode - managed by SplitViewModule internally
  const [projectMode, setProjectMode] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);

  // Save split view settings to localStorage
  useEffect(() => {
    localStorage.setItem('resonant-chat-split-view', String(splitViewEnabled));
  }, [splitViewEnabled]);

  useEffect(() => {
    localStorage.setItem('resonant-chat-split-width', String(splitViewWidth));
  }, [splitViewWidth]);

  // Auto-select first message with code when split view is enabled
  useEffect(() => {
    if (splitViewEnabled && !selectedCodeMessage && messages.length > 0) {
      const messageWithCode = messages.find(m => m.content.match(/```[\s\S]*?```/g));
      if (messageWithCode) {
        setSelectedCodeMessage(messageWithCode.id);
      }
    }
  }, [splitViewEnabled, messages, selectedCodeMessage]);

  // Message Editing
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom when messages change (show newest messages)
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length, scrollToBottom]);

  // Messages NOT saved to localStorage - backend is source of truth

  // Note: Conversation ID is already saved to localStorage in the earlier useEffect
  // This duplicate was removed to avoid redundancy
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionAutocompleteRef = useRef<HTMLDivElement>(null);
  const commandAutocompleteRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Reusable sticker toggle function to avoid code duplication
  const toggleSticker = useCallback((
    stickerType: 'threads' | 'metrics' | 'settings' | 'clusters' | 'memory',
    currentState: boolean
  ) => {
    const newState = !currentState;

    // Close all other stickers and popups when opening one
    if (newState) {
      setShowThreadsSticker(stickerType === 'threads');
      setShowMetricsSticker(stickerType === 'metrics');
      setShowSettingsSticker(stickerType === 'settings');
      setShowClustersSticker(stickerType === 'clusters');
      setShowMemoryLibrary(stickerType === 'memory');
      setShowExportOptions(false);
      setShowUsagePanel(false);
    } else {
      // If closing, only close the specific sticker
      if (stickerType === 'threads') setShowThreadsSticker(false);
      if (stickerType === 'metrics') setShowMetricsSticker(false);
      if (stickerType === 'settings') setShowSettingsSticker(false);
      if (stickerType === 'clusters') setShowClustersSticker(false);
      if (stickerType === 'memory') setShowMemoryLibrary(false);
    }
  }, []);


  // Load conversations and memories on mount and when messages change
  useEffect(() => {
    loadConversations();
    loadMemories();
    
    // Load available agents from API
    fetch('/resonant-chat/agents/list')
      .then(res => res.json())
      .then(data => {
        if (data.agents) {
          setAvailableAgents(data.agents.map((a: any) => ({ hash: a.id, name: a.name })));
        }
      })
      .catch(err => logger.error('Failed to load agents', err));
    
    // Load teams from API (fallback to listAgentTeams if needed)
    fetch('/resonant-chat/teams')
      .then(res => res.json())
      .then(data => {
        if (data.teams && data.teams.length > 0) {
          // Map API response to AgentTeam format
          setTeams(data.teams.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            agents: t.agents || [],
            workflow: t.workflow || 'sequential',
          })));
        } else if (isLoggedIn) {
          // Fallback to listAgentTeams
          listAgentTeams().then(setTeams).catch(err => logger.error('Failed to load teams', err));
        }
      })
      .catch(err => {
        logger.error('Failed to load teams from API', err);
        if (isLoggedIn) {
          listAgentTeams().then(setTeams).catch(e => logger.error('Failed to load teams fallback', e));
        }
      });
  }, [isLoggedIn]); // Only run on login state change, not on every message

  // Load chat metrics from backend when conversation changes
  // IMPORTANT: Only use real backend metrics - never fake them locally
  useEffect(() => {
    const loadChatMetrics = async () => {
      if (currentConversationId && isLoggedIn) {
        try {
          const metrics = await getChatMetrics(currentConversationId);
          // metrics will be null if backend fails or no real metrics available
          setChatMetrics(metrics);
        } catch (error) {
          logger.error('Failed to load chat metrics from API', error);
          // Don't calculate fake local metrics - set to null to show N/A
          setChatMetrics(null);
        }
      } else {
        // Not logged in or no conversation - no metrics available
        setChatMetrics(null);
      }
    };
    
    loadChatMetrics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId, isLoggedIn]); // Only run on conversation/login change, not every message

  // Update usageStats from chatMetrics and messages - debounced to prevent excessive updates
  // IMPORTANT: Only show real metrics from backend, use null for unavailable metrics
  useEffect(() => {
    const timer = setTimeout(() => {
      const totalTokens = messages.reduce((sum, m) => sum + Math.round(m.content.length / 4), 0);
      
      // Only use real backend metrics - null means "N/A" in the UI
      if (chatMetrics && chatMetrics.metrics_available) {
        setUsageStats({
          messages: chatMetrics.message_count || messages.length,
          tokens: chatMetrics.tokens || totalTokens,
          quality: chatMetrics.quality,
          hallucination: chatMetrics.hallucination,
        });
      } else {
        // No real metrics available - show message count and tokens only
        setUsageStats({
          messages: messages.length,
          tokens: totalTokens,
          quality: null, // Will show "N/A" in UI
          hallucination: null, // Will show "N/A" in UI
        });
      }
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [chatMetrics, messages.length]); // Use messages.length instead of messages array

  // Load last chat from backend on mount (for cross-device sync)
  useEffect(() => {
    const loadLastChat = async () => {
      if (!isLoggedIn) return;
      
      try {
        // Check if there's a saved chat ID from this session
        const savedChatId = localStorage.getItem('resonant-chat-current-conversation');
        
        if (savedChatId) {
          // Load the saved chat from resonant-chat API
          const data = await getChatHistory(savedChatId);
          const chatMessages = data?.messages || (Array.isArray(data) ? data : []);
          if (chatMessages.length > 0) {
            const formattedMessages = chatMessages.map((msg: { id?: string; role: string; content: string; created_at?: string; provider?: string; validity?: number; resonance_score?: number; hash?: string; anchors?: string[] }) => ({
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
              aiProvider: msg.provider,
              validity: msg.validity,
              resonanceScore: msg.resonance_score,
              hash: msg.hash,
              anchors: msg.anchors,
            }));
            // Sort by timestamp ascending (oldest first, newest at bottom)
            formattedMessages.sort((a: { timestamp: Date }, b: { timestamp: Date }) => 
              a.timestamp.getTime() - b.timestamp.getTime()
            );
            setMessages(formattedMessages);
            setCurrentConversationId(savedChatId);
            return;
          }
        }
        
        // If no saved chat, load the most recent one from resonant-chat API
        const chats = await getChatHistory(); // Gets list of chats when no ID provided
        const chatList = Array.isArray(chats) ? chats : [];
        if (chatList.length > 0) {
          const mostRecent = chatList[0] as any;
          const chatId = typeof mostRecent === 'string' ? mostRecent : mostRecent.id;
          const data = await getChatHistory(chatId);
          const chatMessages = data?.messages || (Array.isArray(data) ? data : []);
          if (chatMessages.length > 0) {
            const formattedMessages = chatMessages.map((msg: { id?: string; role: string; content: string; created_at?: string; provider?: string; validity?: number; resonance_score?: number; hash?: string; anchors?: string[] }) => ({
              id: msg.id || `msg-${Date.now()}-${Math.random()}`,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
              aiProvider: msg.provider,
              validity: msg.validity,
              resonanceScore: msg.resonance_score,
              hash: msg.hash,
              anchors: msg.anchors,
            }));
            // Sort by timestamp ascending (oldest first, newest at bottom)
            formattedMessages.sort((a: { timestamp: Date }, b: { timestamp: Date }) => 
              a.timestamp.getTime() - b.timestamp.getTime()
            );
            setMessages(formattedMessages);
            setCurrentConversationId(chatId);
            localStorage.setItem('resonant-chat-current-conversation', chatId);
          }
        }
      } catch (error) {
        logger.error('Failed to load last chat from backend', error);
      }
    };
    
    loadLastChat();
  }, [isLoggedIn]);

  // Load settings from backend API (with localStorage fallback)
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (isLoggedIn) {
          // Load from backend API
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/user/preferences`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            const prefs = data.preferences;
            console.log('⚙️ Loaded preferences from backend:', prefs);
            
            // Apply chat preferences
            if (prefs.chat) {
              if (prefs.chat.auto_save !== undefined) setAutoSave(prefs.chat.auto_save);
              if (prefs.chat.show_timestamps !== undefined) setShowTimestamps(prefs.chat.show_timestamps);
              if (prefs.chat.show_provider_badges !== undefined) setShowProviderBadges(prefs.chat.show_provider_badges);
              if (prefs.chat.show_validity_scores !== undefined) setShowValidityScores(prefs.chat.show_validity_scores);
              if (prefs.chat.compact_mode !== undefined) setCompactMode(prefs.chat.compact_mode);
              if (prefs.chat.font_size) setFontSize(prefs.chat.font_size as 'small' | 'medium' | 'large' | 'extra-large');
              if (prefs.chat.input_auto_resize !== undefined) setInputAutoResize(prefs.chat.input_auto_resize);
              if (prefs.chat.sound_notifications !== undefined) setSoundNotifications(prefs.chat.sound_notifications);
              if (prefs.chat.keyboard_shortcuts !== undefined) setKeyboardShortcuts(prefs.chat.keyboard_shortcuts);
              if (prefs.chat.focus_highlights !== undefined) setEnableFocusHighlights(prefs.chat.focus_highlights);
            }
            
            // Apply agent preferences
            if (prefs.agent) {
              if (prefs.agent.selected_agent_hash) setSelectedAgentHash(prefs.agent.selected_agent_hash);
              if (prefs.agent.agent_mode !== undefined) setAgentMode(prefs.agent.agent_mode);
            }
            return;
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load preferences from backend, using localStorage fallback:', error);
      }
      
      // Fallback to localStorage
      const savedAutoSave = localStorage.getItem('resonant-chat-auto-save');
      if (savedAutoSave !== null) setAutoSave(savedAutoSave === 'true');

      const savedShowTimestamps = localStorage.getItem('resonant-chat-show-timestamps');
      if (savedShowTimestamps !== null) setShowTimestamps(savedShowTimestamps === 'true');

      const savedShowProviderBadges = localStorage.getItem('resonant-chat-show-provider-badges');
      if (savedShowProviderBadges !== null) setShowProviderBadges(savedShowProviderBadges === 'true');

      const savedShowValidityScores = localStorage.getItem('resonant-chat-show-validity-scores');
      if (savedShowValidityScores !== null) setShowValidityScores(savedShowValidityScores === 'true');

      const savedCompactMode = localStorage.getItem('resonant-chat-compact-mode');
      if (savedCompactMode !== null) setCompactMode(savedCompactMode === 'true');

      const savedFontSize = localStorage.getItem('resonant-chat-font-size');
      if (savedFontSize) setFontSize(savedFontSize as 'small' | 'medium' | 'large' | 'extra-large');

      const savedInputAutoResize = localStorage.getItem('resonant-chat-input-auto-resize');
      if (savedInputAutoResize !== null) setInputAutoResize(savedInputAutoResize === 'true');

      const savedSoundNotifications = localStorage.getItem('resonant-chat-sound-notifications');
      if (savedSoundNotifications !== null) setSoundNotifications(savedSoundNotifications === 'true');

      const savedKeyboardShortcuts = localStorage.getItem('resonant-chat-keyboard-shortcuts');
      if (savedKeyboardShortcuts !== null) setKeyboardShortcuts(savedKeyboardShortcuts === 'true');

      const savedFocusHighlights = localStorage.getItem('resonant-chat-focus-highlights');
      if (savedFocusHighlights !== null) setEnableFocusHighlights(savedFocusHighlights === 'true');
    };
    
    loadPreferences();
  }, [isLoggedIn]);

  // Helper function to save preference to backend
  const savePreferenceToBackend = useCallback(async (category: string, key: string, value: any) => {
    if (!isLoggedIn) {
      // Save to localStorage for guests
      localStorage.setItem(`resonant-chat-${key.replace(/_/g, '-')}`, String(value));
      return;
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/user/preferences/${category}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      console.log(`⚙️ Saved ${category}.${key} = ${value} to backend`);
    } catch (error) {
      console.warn(`⚠️ Failed to save ${key} to backend:`, error);
      // Fallback to localStorage
      localStorage.setItem(`resonant-chat-${key.replace(/_/g, '-')}`, String(value));
    }
  }, [isLoggedIn]);

  // Save settings to backend when they change
  useEffect(() => {
    savePreferenceToBackend('chat', 'auto_save', autoSave);
  }, [autoSave, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'show_timestamps', showTimestamps);
  }, [showTimestamps, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'show_provider_badges', showProviderBadges);
  }, [showProviderBadges, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'show_validity_scores', showValidityScores);
  }, [showValidityScores, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'compact_mode', compactMode);
  }, [compactMode, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'font_size', fontSize);
  }, [fontSize, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'input_auto_resize', inputAutoResize);
  }, [inputAutoResize, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'sound_notifications', soundNotifications);
  }, [soundNotifications, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'keyboard_shortcuts', keyboardShortcuts);
  }, [keyboardShortcuts, savePreferenceToBackend]);

  useEffect(() => {
    savePreferenceToBackend('chat', 'focus_highlights', enableFocusHighlights);
  }, [enableFocusHighlights, savePreferenceToBackend]);

  // Initialize textarea height on mount
  useEffect(() => {
    if (inputRef.current) {
      // Set initial height to single line
      inputRef.current.style.height = '20px';
    }
  }, []);

  // Auto-resize textarea when input changes
  useEffect(() => {
    resizeTextarea();
  }, [input]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      let formattedConversations: Array<{ id: string; title?: string; created_at?: string; message_count?: number; last_message_at?: string }> = [];
      
      // Try to load from resonant-chat API if logged in
      if (isLoggedIn) {
        try {
          // Use getChatHistory() without ID to get list of chats
          const data = await getChatHistory();
          const chatList = Array.isArray(data) ? data : [];
          formattedConversations = chatList.map((chat: any) => {
            if (typeof chat === 'string') {
              return { id: chat, title: 'Untitled Chat', message_count: 0 };
            }
            return {
              id: chat.id,
              title: chat.title || 'Untitled Chat',
              created_at: chat.created_at,
              message_count: chat.message_count || 0,
              last_message_at: chat.last_message_at || chat.updated_at || chat.created_at,
            };
          });
        } catch (apiError: unknown) {
          logger.warn('Resonant chat API failed, using local data');
        }
      }

      // Use current messages from state only (no localStorage)
      const currentMessages = messages;
      
      // Add current conversation from messages if available
      if (currentMessages.length > 0) {
        const firstUserMessage = currentMessages.find((m: Message) => m.role === 'user');
        const lastMessage = currentMessages[currentMessages.length - 1];
        const currentConv = {
          id: currentConversationId || 'current',
          title: firstUserMessage?.content?.substring(0, 40) || 'Current Conversation',
          created_at: firstUserMessage?.timestamp instanceof Date ? firstUserMessage.timestamp.toISOString() : new Date().toISOString(),
          message_count: currentMessages.length,
          last_message_at: lastMessage?.timestamp instanceof Date ? lastMessage.timestamp.toISOString() : new Date().toISOString(),
        };
        // Add current conv at the top, avoid duplicates
        formattedConversations = [currentConv, ...formattedConversations.filter(c => c.id !== currentConv.id)];
      }

      // Also load guest conversations from sessionStorage
      const guestConversations = JSON.parse(sessionStorage.getItem('guest-conversations') || '[]');
      formattedConversations = [...formattedConversations, ...guestConversations.filter((gc: { id: string }) => 
        !formattedConversations.some(fc => fc.id === gc.id)
      )];
      
      setConversations(formattedConversations);
    } catch (error: unknown) {
      logger.error('Failed to load conversations', error);
      // Fallback - create from current messages or localStorage
      const currentMessages = messages;
      if (currentMessages.length > 0) {
        const firstUserMessage = currentMessages.find((m: Message) => m.role === 'user');
        const lastMessage = currentMessages[currentMessages.length - 1];
        setConversations([{
          id: currentConversationId || 'current',
          title: firstUserMessage?.content?.substring(0, 40) || 'Current Conversation',
          created_at: new Date().toISOString(),
          message_count: currentMessages.length,
          last_message_at: lastMessage?.timestamp instanceof Date ? lastMessage.timestamp.toISOString() : new Date().toISOString(),
        }]);
      }
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load memory anchors
  const loadMemoryAnchors = async () => {
    try {
      if (isLoggedIn) {
        const anchors = await getMemoryAnchors();
        // Handle both old format (string[]) and new format (object[])
        if (Array.isArray(anchors)) {
          const formattedAnchors = anchors.map((anchor: any) => {
            if (typeof anchor === 'string') {
              // Old format - just a string
              return { id: anchor, anchor_text: anchor, importance_score: 0.5 };
            }
            // New format - object with xyz
            return {
              id: anchor.id || anchor.anchor_text,
              anchor_text: anchor.anchor_text || anchor,
              anchor_hash: anchor.anchor_hash,
              xyz: anchor.xyz ? [anchor.xyz[0], anchor.xyz[1], anchor.xyz[2]] as [number, number, number] : undefined,
              importance_score: anchor.importance_score || 0.5,
            };
          });
          setMemoryAnchors(formattedAnchors);
        } else {
          setMemoryAnchors([]);
        }
      }
    } catch (error: unknown) {
      logger.error('Failed to load memory anchors', error);
      setMemoryAnchors([]);
    }
  };

  const loadMemories = async () => {
    try {
      let allMemories: any[] = [];
      
      // 1. Load saved memories from API (context/facts)
      if (isLoggedIn) {
        try {
          console.log('📚 Loading memories from API...');
          const apiMemories = await listMemories(50);
          console.log('📚 API memories loaded:', apiMemories?.length || 0);
          if (apiMemories && apiMemories.length > 0) {
            allMemories = [...allMemories, ...apiMemories.map((m: any) => ({
              ...m,
              type: 'saved',
              name: m.name || m.content?.substring(0, 30) || 'Saved Memory',
            }))];
          }
        } catch (apiError: unknown) {
          console.warn('⚠️ API memories failed:', apiError);
          logger.warn('API memories failed - using local data');
        }
      }

      // 2. Migrate legacy localStorage notes to backend (one-time migration)
      const userNotes = JSON.parse(localStorage.getItem('resonant-chat-user-notes') || '[]');
      if (userNotes.length > 0 && isLoggedIn) {
        // Migrate each note to backend via /rag/memories
        console.log('📝 Migrating', userNotes.length, 'localStorage notes to backend...');
        for (const note of userNotes) {
          try {
            await createMemory({ 
              content: note.content,
              metadata: { 
                migrated_from: 'localStorage',
                original_title: note.title,
                original_timestamp: note.timestamp,
              }
            });
          } catch (migrationError) {
            console.warn('Failed to migrate note:', note.title, migrationError);
          }
        }
        // Clear localStorage after successful migration
        localStorage.removeItem('resonant-chat-user-notes');
        console.log('✅ Notes migrated to backend, localStorage cleared');
        // Reload API memories to include migrated notes
        try {
          const apiMemories = await listMemories(50);
          if (apiMemories && apiMemories.length > 0) {
            allMemories = apiMemories.map((m: any) => ({
              ...m,
              type: 'saved',
              name: m.name || m.content?.substring(0, 30) || 'Saved Memory',
            }));
          }
        } catch (reloadError) {
          console.warn('Failed to reload memories after migration:', reloadError);
        }
      } else if (userNotes.length > 0) {
        // Not logged in - still show localStorage notes (will migrate on login)
        allMemories = [...allMemories, ...userNotes.map((note: any) => ({
          id: note.id,
          name: note.title || 'User Note',
          content: note.content,
          created_at: note.timestamp,
          type: 'note',
          metadata: {},
        }))];
      }

      // 3. Load memory anchors with timestamps
      if (memoryAnchors.length > 0) {
        allMemories = [...allMemories, ...memoryAnchors.map((anchor: any) => ({
          id: anchor.id || anchor.anchor_text,
          name: `Anchor: ${anchor.anchor_text?.substring(0, 25) || 'Memory Anchor'}`,
          content: anchor.anchor_text,
          created_at: anchor.created_at || new Date().toISOString(),
          type: 'anchor',
          importance_score: anchor.importance_score,
          metadata: { anchor_hash: anchor.anchor_hash },
        }))];
      }

      // 4. Load guest memories from sessionStorage
      const guestMemories = JSON.parse(sessionStorage.getItem('guest-memories') || '[]');
      if (guestMemories.length > 0) {
        allMemories = [...allMemories, ...guestMemories.map((m: { id: string; content: string; timestamp: string }) => ({
          id: m.id,
          name: m.content.substring(0, 30),
          content: m.content,
          created_at: m.timestamp,
          type: 'guest',
          metadata: {},
        }))];
      }

      // 5. Extract key facts from current messages as memory items (from state, not localStorage)
      if (messages.length > 0) {
        // Add assistant responses as context memories
        const assistantMessages = messages.filter((m: Message) => m.role === 'assistant');
        assistantMessages.slice(-5).forEach((msg: Message, idx: number) => {
          allMemories.push({
            id: `chat-memory-${idx}`,
            name: `Chat Context ${idx + 1}`,
            content: msg.content?.substring(0, 200) || '',
            created_at: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date().toISOString(),
            type: 'context',
            metadata: { source: 'chat' },
          });
        });
      }

      console.log('📚 Total memories loaded:', allMemories.length, allMemories.map(m => ({ id: m.id, type: m.type, name: m.name })));
      setMemories(allMemories as any);
    } catch (error: unknown) {
      console.error('❌ Failed to load memories:', error);
      logger.error('Failed to load memories', error);
      // Fallback: use current messages from state (not localStorage)
      try {
        const fallbackMemories = messages
          .filter((m: Message) => m.role === 'assistant')
          .slice(-5)
          .map((msg: Message, idx: number) => ({
            id: `fallback-${idx}`,
            name: `Recent Response ${idx + 1}`,
            content: msg.content?.substring(0, 200) || '',
            created_at: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date().toISOString(),
            type: 'context',
            metadata: {},
          }));
        setMemories(fallbackMemories);
      } catch {
        setMemories([]);
      }
    }
  };

  // Save to memory (supports both logged-in and guest users)
  const saveToMemory = async (content: string) => {
    if (!isLoggedIn) {
      // Save to sessionStorage for guest users
      try {
        setIsLoadingMemory(true);
        const guestMemories = JSON.parse(sessionStorage.getItem('guest-memories') || '[]');
        const newMemory = {
          id: `guest-${Date.now()}`,
          content,
          timestamp: new Date().toISOString(),
        };
        guestMemories.push(newMemory);
        sessionStorage.setItem('guest-memories', JSON.stringify(guestMemories));
        success('Saved to session memory (temporary)');
        loadMemories();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save memory';
        showError(errorMessage);
      } finally {
        setIsLoadingMemory(false);
      }
      return;
    }

    // Logged-in user: save to backend
    try {
      setIsLoadingMemory(true);
      console.log('💾 Saving memory to backend...', { contentLength: content.length, isLoggedIn });
      const result = await createMemory({ content });
      console.log('✅ Memory saved successfully:', result);
      success('Saved to context memory');
      // Reload memories to show the new one in the popup
      await loadMemories();
    } catch (error: unknown) {
      console.error('❌ Failed to save memory:', error);
      const errorDetail = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      // Handle specific error types
      if (errorDetail && typeof errorDetail === 'object' && (errorDetail as any).error === 'rag_document_limit_exceeded') {
        showError((errorDetail as any).message || 'Memory limit reached. Upgrade to save more.');
      } else {
        showError(typeof errorDetail === 'string' ? errorDetail : 'Failed to save memory');
      }
    } finally {
      setIsLoadingMemory(false);
    }
  };

  const handleMemorySave = () => {
    if (input.trim()) {
      saveToMemory(input);
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        saveToMemory(lastMessage.content);
      }
    }
  };

  // Detect project building requests using semantic meaning (Hash Sphere anchor + cluster logic)
  // Uses semantic resonance instead of simple keyword matching
  const detectProjectRequest = (message: string): { isProject: boolean; projectType?: string } => {
    // Use Hash Sphere-based semantic detection
    const result = detectProjectIntent(message);

    // Log reasoning for debugging
    if (result.isProjectRequest) {
      logger.info(`🎯 Project intent detected: ${result.reasoning} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
    } else {
      logger.debug(`❌ Not a project request: ${result.reasoning}`);
    }

    return {
      isProject: result.isProjectRequest,
      projectType: result.projectType
    };
  };

  // Handle send message with improved error handling
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const userMsg = userMessage;
    const isFirstMessage = messages.length === 0;
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Check if build mode is active (only triggered by manual button click)
    // Navigate to standalone Build page with description as query param
    if (buildMode) {
      // Navigate to standalone Build page
      const buildUrl = `/build?description=${encodeURIComponent(currentInput)}&type=${detectProjectIntent(currentInput).projectType || 'react'}`;
      navigate(buildUrl);
      setBuildMode(false); // Reset build mode
      setIsLoading(false);
      return;
    }

    // Check if this is an EXPLICIT IDE/open project request - navigate to IDE page
    // Only trigger if the message is SHORT and specifically asking to open IDE
    // This prevents false positives when pasting long content that happens to contain these words
    const ideKeywords = ['open project', 'edit project', 'ide mode', 'open ide', 'load project'];
    const isShortMessage = currentInput.trim().length < 50; // Only for short explicit commands
    const startsWithKeyword = ideKeywords.some(keyword => currentInput.toLowerCase().trim().startsWith(keyword));
    if (isShortMessage && startsWithKeyword) {
      // Navigate to IDE page
      navigate('/ide');
      setIsLoading(false);
      return;
    }

    // Create abort controller for stop functionality
    const controller = new AbortController();
    setAbortControllerRef(controller);

    // Removed mock welcome message - users will get real responses from providers

    try {
      // Prepare file context if files are attached
      let fileContext = '';
      const imageAttachments: Array<{ type: string; data: string; name: string }> = [];
      
      if (attachedFiles.length > 0) {
        const fileContents = await Promise.all(
          attachedFiles.map(async (file) => {
            try {
              // Handle images - convert to base64 for vision models
              if (file.type.startsWith('image/')) {
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });
                imageAttachments.push({
                  type: file.type,
                  data: base64,
                  name: file.name,
                });
                return `\n\n[Image: ${file.name}]`;
              }
              // Handle text files
              if (file.type.startsWith('text/') ||
                file.name.match(/\.(txt|md|json|js|ts|py|java|cpp|c|cs)$/i)) {
                const content = await readTextFile(file);
                return `\n\n[File: ${file.name}]\n${content}`;
              } else {
                const fileId = uploadedFileIds.get(file);
                return `\n\n[File: ${file.name}${fileId ? ` (ID: ${fileId})` : ''}]`;
              }
            } catch (error: unknown) {
              logger.error('Failed to read file content', error);
              return `\n\n[File: ${file.name} - Error reading content]`;
            }
          })
        );
        fileContext = fileContents.join('\n');
      }

      // Combine query with file context
      const queryWithContext = currentInput + fileContext;

      // Prepare attached file paths (if files are uploaded and have IDs)
      const attachedFilePaths = attachedFiles
        .map(file => {
          const fileId = uploadedFileIds.get(file);
          // For code files, use the file path if available, otherwise use file name
          if (file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|cs|go|rs|rb|php)$/i)) {
            return fileId || file.name;
          }
          return fileId;
        })
        .filter((path): path is string => !!path);

      // Get chatId from state or sessionStorage (for persistence after refresh)
      // Use localStorage for chatId persistence (consistent with initialization on line 381)
      const chatIdToUse = currentConversationId || localStorage.getItem(CHAT_STORAGE_KEY) || undefined;
      console.log('💬 Using chatId:', chatIdToUse, 'currentConversationId:', currentConversationId);

      // Use sendResonantMessage for all users (Hash Sphere-powered messaging)
      // Extract immediate context from last few messages to help AI focus on current task
      const recentMessages = messages.slice(-5);
      const immediateContext = (() => {
        // Look for task indicators in recent messages
        const taskKeywords = {
          booking: ['book', 'flight', 'ticket', 'hotel', 'reservation', 'travel'],
          coding: ['code', 'function', 'bug', 'error', 'implement', 'create file'],
          analysis: ['analyze', 'report', 'data', 'chart', 'graph'],
          planning: ['plan', 'schedule', 'organize', 'list'],
        };
        
        for (const msg of recentMessages) {
          const content = msg.content.toLowerCase();
          for (const [task, keywords] of Object.entries(taskKeywords)) {
            if (keywords.some(kw => content.includes(kw))) {
              return `CURRENT_TASK: ${task.toUpperCase()}. Focus on completing this task. The user's last message "${currentInput}" is a direct continuation of this task.`;
            }
          }
        }
        return undefined;
      })();

      const resonantResponse = await sendResonantMessage({
        message: queryWithContext,
        chatId: chatIdToUse,
        context: {
          previousMessages: messages.slice(-15).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: typeof m.timestamp === 'string' ? m.timestamp : (m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString()),
            aiProvider: m.aiProvider,
          })),
          userPreferences: {
            conversationSummary: messages.length > 15 ? `This conversation has ${messages.length} messages. Earlier context: ${messages.slice(0, -15).map(m => m.role === 'user' ? `User asked: "${m.content.substring(0, 100)}..."` : '').filter(Boolean).join('; ')}` : undefined,
            immediateContext: immediateContext,
          },
        },
        // Code features (NEW)
        attached_files: attachedFilePaths.length > 0 ? attachedFilePaths : undefined,
        images: imageAttachments.length > 0 ? imageAttachments : undefined, // Pass images for vision models
        code_selection: codeSelection || undefined,
        preferred_provider: selectedProvider !== 'auto' ? selectedProvider : undefined,
        use_rag: useHashSphere ? false : true, // If Hash Sphere is enabled, RAG is optional
        agent_hash: (agentMode && !selectedTeamId) ? selectedAgentHash || undefined : undefined, // Pass agent hash only if not in Team mode
        teamId: (agentMode && selectedTeamId) ? selectedTeamId : undefined, // Pass teamId if in Team mode
      });

      // Save chatId from response if provided (backend creates chat if not provided)
      if (resonantResponse.chatId && !currentConversationId) {
        console.log('💬 Saving new chatId:', resonantResponse.chatId);
        setCurrentConversationId(resonantResponse.chatId);
        // Use localStorage for persistence across page refreshes (consistent with initialization)
        localStorage.setItem(CHAT_STORAGE_KEY, resonantResponse.chatId);
      }

      // Check if response is an error
      // Handle both message object and direct content
      let responseContent: string = '';
      if (typeof resonantResponse?.message === 'string') {
        responseContent = resonantResponse.message;
      } else if (resonantResponse?.message?.content) {
        responseContent = resonantResponse.message.content;
      } else if (typeof resonantResponse?.message === 'object' && resonantResponse.message) {
        // Fallback: try to extract content from message object
        responseContent = (resonantResponse.message as any).content || '';
      }

      // Log if response is empty or malformed
      if (!responseContent) {
        logger.error('Empty response from backend', { resonantResponse });
        showError('Received empty response from server. Please try again.');
        setIsLoading(false);
        return;
      }

      const isError = responseContent.startsWith('Error calling') || responseContent.startsWith('Error:');

      // Extract metrics from response - handle both direct properties and nested message object
      const messageObj = typeof resonantResponse.message === 'object' ? resonantResponse.message : null;
      const resonanceScore = isError ? undefined : (resonantResponse.resonanceScore ?? messageObj?.resonanceScore);
      const hash = isError ? undefined : (resonantResponse.hash ?? messageObj?.hash);
      const anchors = isError ? [] : (resonantResponse.anchors ?? []);
      const aiProvider = resonantResponse.aiProvider ?? messageObj?.aiProvider;
      const xyz = isError ? undefined : (messageObj?.xyz as [number, number, number] | undefined);
      const modules = isError ? undefined : (messageObj?.modules as ModuleOutputs | undefined);

      // Create assistant message (will be updated via WebSocket if streaming)
      // Use backend message ID if available, otherwise generate local UUID
      const assistantMessageId = messageObj?.id || crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        aiProvider: aiProvider || resonantResponse.aiProvider || 'unknown',
        hash: hash,
        anchors: anchors,
        resonanceScore: resonanceScore,
        xyz: xyz,
        modules: modules, // Hash Sphere module outputs
        metrics: isError ? undefined : {
          resonantEnergy: resonanceScore,
          evidence: resonanceScore,
        },
        generatedImages: resonantResponse.generatedImages,
        webSearchResults: resonantResponse.webSearchResults,
      };

      // Show warning if error occurred
      if (isError) {
        warning(`Provider ${resonantResponse.aiProvider} failed. Please try another provider or check your API keys.`);
      }

      // If WebSocket is connected, subscribe to streaming updates for this message
      if (wsClient?.isConnected() && currentConversationId) {
        setStreamingMessageId(assistantMessageId);
        setStreamingContent('');
        wsClient.subscribe(assistantMessageId);
      }

      // Update memory anchors if new ones were created (reload to get full data)
      if (resonantResponse.anchors && resonantResponse.anchors.length > 0) {
        loadMemoryAnchors(); // Reload to get full anchor data with xyz
      }

      setMessages(prev => {
        const updatedMessages = [...prev, assistantMessage];

        // Save conversation (logged-in: backend, guest: sessionStorage)
        if (autoSave && updatedMessages.length >= 2) {
          if (isLoggedIn) {
            // Auto-save to backend - only if we don't have a chatId yet
            if (!currentConversationId && !resonantResponse.chatId) {
              createChat(updatedMessages[0]?.content?.substring(0, 50) || 'New Conversation')
                .then((response: any) => {
                  // Save chatId from createChat response
                  if (response?.chatId) {
                    setCurrentConversationId(response.chatId);
                    // Use localStorage for consistency with other chatId storage
                    localStorage.setItem(CHAT_STORAGE_KEY, response.chatId);
                  }
                })
                .catch((error: unknown) => {
                  logger.error('Auto-save failed', error);
                });
            }
          } else {
            // Save to sessionStorage for guests - update existing or create new
            const guestConversations = JSON.parse(sessionStorage.getItem('guest-conversations') || '[]');
            const existingIndex = currentConversationId 
              ? guestConversations.findIndex((c: { id: string }) => c.id === currentConversationId)
              : -1;
            
            if (existingIndex >= 0) {
              // Update existing conversation
              guestConversations[existingIndex] = {
                ...guestConversations[existingIndex],
                messages: updatedMessages,
                title: updatedMessages[0]?.content?.substring(0, 50) || guestConversations[existingIndex].title,
                last_message_at: new Date().toISOString(),
                message_count: updatedMessages.length,
              };
            } else {
              // Create new conversation
              const newConversation = {
                id: `guest-conv-${Date.now()}`,
                title: updatedMessages[0]?.content?.substring(0, 50) || 'New Conversation',
                messages: updatedMessages,
                created_at: new Date().toISOString(),
                last_message_at: new Date().toISOString(),
                message_count: updatedMessages.length,
              };
              guestConversations.unshift(newConversation); // Add to beginning
              setCurrentConversationId(newConversation.id);
            }
            
            sessionStorage.setItem('guest-conversations', JSON.stringify(guestConversations));
            loadConversations();
          }
        }

        return updatedMessages;
      });

      // Trigger sync to notify floating chat widget
      triggerChatSync();

      // Sound notification if enabled
      if (soundNotifications) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSdTgwOUKzn8LZjGwU7k9jzzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDknU4MDlCs5/C2YxsFO5PY88x5LAUkd8fw3ZBAC');
          audio.play().catch(() => { }); // Ignore errors if audio fails
        } catch (error: unknown) {
          // Ignore audio errors
          logger.error('Audio notification failed', error);
        }
      }
    } catch (error: unknown) {
      // Don't show error if request was aborted
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return;
      }
      if (controller.signal.aborted) {
        return;
      }

      const errorDetail = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      const errorMessage = errorDetail || (error instanceof Error ? error.message : 'Failed to send message');
      showError(errorMessage);

      // Remove the user message if sending failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsLoading(false);
      setAbortControllerRef(null);
      // Clear attached files after sending
      setAttachedFiles([]);
      setShowFiles(false);
    }
  };

  // Auto-send pending initial message from hero section or floating widget
  useEffect(() => {
    if (pendingInitialMessage && !isLoading) {
      setInput(pendingInitialMessage);
      setPendingInitialMessage(null);
      // Trigger send after a short delay to ensure input is set
      setTimeout(() => {
        const sendButton = document.querySelector('[aria-label="Send message"]') as HTMLButtonElement;
        if (sendButton) {
          sendButton.click();
        }
      }, 100);
    }
  }, [pendingInitialMessage, isLoading]);

  // Auto-resize textarea helper function
  const resizeTextarea = () => {
    if (inputRef.current) {
      // Temporarily remove height constraint to get accurate scrollHeight
      const currentHeight = inputRef.current.style.height;
      inputRef.current.style.height = 'auto';

      // Get the scroll height (content height)
      const scrollHeight = inputRef.current.scrollHeight;

      // Calculate new height: min 20px, max 120px
      const newHeight = Math.max(20, Math.min(scrollHeight, 120));

      // Apply the new height with !important override
      inputRef.current.style.setProperty('height', `${newHeight}px`, 'important');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Auto-resize on Enter key (new line)
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter creates new line - resize after a short delay
      setTimeout(() => resizeTextarea(), 0);
    }
    // Handle autocomplete navigation
    if (showMentionAutocomplete || showCommandAutocomplete) {
      if (showMentionAutocomplete) {
        const filteredMemories = memories.filter(m =>
          (m.name || m.content).toLowerCase().includes(mentionQuery.toLowerCase())
        );

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedAutocompleteIndex(prev => (prev + 1) % filteredMemories.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedAutocompleteIndex(prev => (prev - 1 + filteredMemories.length) % filteredMemories.length);
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey && filteredMemories[selectedAutocompleteIndex]) {
          e.preventDefault();
          const memory = filteredMemories[selectedAutocompleteIndex];
          const memoryName = memory.name || memory.content.substring(0, 30);
          const beforeAt = input.substring(0, mentionPosition);
          const afterCursor = input.substring(inputRef.current?.selectionStart || input.length);
          setInput(beforeAt + `@${memoryName} ` + afterCursor);
          setShowMentionAutocomplete(false);
          setMentionQuery('');
          setTimeout(() => {
            const newPos = beforeAt.length + memoryName.length + 2;
            inputRef.current?.setSelectionRange(newPos, newPos);
            inputRef.current?.focus();
          }, 0);
          return;
        }
      }

      if (showCommandAutocomplete) {
        const commands = [
          { command: '/plan', description: 'Create a detailed plan for your goal' },
          { command: '/summarize', description: 'Summarize the conversation' },
          { command: '/audit', description: 'Audit the conversation for issues' },
        ].filter(cmd => cmd.command.toLowerCase().includes(commandQuery.toLowerCase()));

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedAutocompleteIndex(prev => (prev + 1) % commands.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedAutocompleteIndex(prev => (prev - 1 + commands.length) % commands.length);
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey && commands[selectedAutocompleteIndex]) {
          e.preventDefault();
          const cmd = commands[selectedAutocompleteIndex];
          const beforeSlash = input.substring(0, commandPosition);
          const afterCursor = input.substring(inputRef.current?.selectionStart || input.length);
          setInput(beforeSlash + cmd.command + ' ' + afterCursor);
          setShowCommandAutocomplete(false);
          setCommandQuery('');
          setTimeout(() => {
            const newPos = beforeSlash.length + cmd.command.length + 1;
            inputRef.current?.setSelectionRange(newPos, newPos);
            inputRef.current?.focus();
          }, 0);
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionAutocomplete(false);
        setShowCommandAutocomplete(false);
        return;
      }
    }

    if (!keyboardShortcuts) return;

    if (e.key === 'Enter' && !e.shiftKey && !showMentionAutocomplete && !showCommandAutocomplete) {
      e.preventDefault();
      handleSend();
    }

    // Cmd/Ctrl+K: Focus input or open global search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (e.shiftKey) {
        // Open global search
        setShowThreadsSticker(true);
        setShowMetricsSticker(false);
        setShowSettingsSticker(false);
        setShowClustersSticker(false);
        setShowMemoryLibrary(false);
      } else {
        inputRef.current?.focus();
      }
    }

    // Cmd/Ctrl+/: Show shortcuts panel
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      setShowShortcutsPanel(!showShortcutsPanel);
    }

    // Cmd/Ctrl+@: Open @ mentions
    if ((e.metaKey || e.ctrlKey) && e.key === '@') {
      e.preventDefault();
      const pos = inputRef.current?.selectionStart || input.length;
      setMentionPosition(pos);
      setShowMentionAutocomplete(true);
      setShowCommandAutocomplete(false);
    }
  };

  // Copy message
  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied to clipboard');
  };

  // Regenerate response with improved error handling
  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      showError('Message not found');
      return;
    }

    const previousMessages = messages.slice(0, messageIndex);
    // Find the last user message before this assistant message
    const userMessage = [...previousMessages].reverse().find(m => m.role === 'user');
    if (!userMessage) {
      showError('No user message found to regenerate from');
      return;
    }

    setIsRegenerating(messageId);
    setIsLoading(true);
    try {
      const resonantResponse = await sendResonantMessage({
        message: userMessage.content,
        chatId: currentConversationId || undefined,
        context: {
          previousMessages: previousMessages.slice(-5).map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: typeof m.timestamp === 'string' ? m.timestamp : (m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date().toISOString()),
            aiProvider: m.aiProvider,
          })),
          userPreferences: {},
        },
        agent_hash: selectedAgentHash || undefined, // Pass agent hash for shared memory
      });

      const messageObj = typeof resonantResponse.message === 'object' ? resonantResponse.message : null;
      const newMessage: Message = {
        id: messageObj?.id || crypto.randomUUID(),
        role: 'assistant',
        content: resonantResponse.message.content,
        timestamp: new Date(),
        aiProvider: resonantResponse.aiProvider,
        hash: resonantResponse.hash,
        anchors: resonantResponse.anchors,
        resonanceScore: resonantResponse.resonanceScore,
        modules: messageObj?.modules as ModuleOutputs | undefined, // Hash Sphere module outputs
        metrics: {
          resonantEnergy: resonantResponse.resonanceScore,
          evidence: resonantResponse.resonanceScore,
        },
        generatedImages: resonantResponse.generatedImages,
        webSearchResults: resonantResponse.webSearchResults,
      };

      // Update memory anchors if new ones were created (reload to get full data)
      if (resonantResponse.anchors && resonantResponse.anchors.length > 0) {
        loadMemoryAnchors(); // Reload to get full anchor data with xyz
      }

      setMessages(prev => prev.slice(0, messageIndex).concat(newMessage));
      
      // Trigger sync to notify floating chat widget
      triggerChatSync();
    } catch (error: unknown) {
      const errorDetail = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      const errorMessage = errorDetail || (error instanceof Error ? error.message : 'Failed to regenerate');
      showError(errorMessage);
    } finally {
      setIsRegenerating(null);
      setIsLoading(false);
    }
  };

  // Handle share
  const handleShare = () => {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    if (navigator.share) {
      navigator.share({ text: transcript });
    } else {
      copyMessage(transcript);
    }
  };

  // Handle download
  const handleDownload = () => {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resonant-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'image/*',
    'audio/*',
    'video/*',
    '.pdf',
    '.txt',
    '.doc',
    '.docx',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.py',
    '.java',
    '.cpp',
    '.c',
    '.cs',
    '.json',
    '.csv',
    '.md',
  ];

  // Validate file type
  const isValidFileType = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Check MIME type
    if (fileType && (
      fileType.startsWith('image/') ||
      fileType.startsWith('audio/') ||
      fileType.startsWith('video/') ||
      fileType === 'application/pdf' ||
      fileType === 'text/plain' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )) {
      return true;
    }

    // Check file extension
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    return ALLOWED_FILE_TYPES.some(allowed => {
      if (allowed.startsWith('.')) {
        return extension === allowed;
      }
      // Handle wildcard types like 'image/*'
      if (allowed.endsWith('/*')) {
        const baseType = allowed.substring(0, allowed.length - 2);
        return fileType.startsWith(baseType);
      }
      return false;
    });
  };

  // Read text file content
  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Handle file select with validation and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => warning(error));
    }

    // Add valid files and upload to backend if logged in
    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
      setShowFiles(true); // Auto-expand file list when files are added

      // Upload files to backend if logged in
      if (isLoggedIn) {
        validFiles.forEach(async (file) => {
          try {
            setUploadingFiles(prev => new Set(prev).add(file.name));
            const result = await uploadFile(file);
            setUploadedFileIds(prev => new Map(prev).set(file, result.id));
            success(`Uploaded ${file.name}`);
          } catch (error: unknown) {
            logger.error('Failed to upload file', error);
            // Continue even if upload fails - file is still attached
          } finally {
            setUploadingFiles(prev => {
              const next = new Set(prev);
              next.delete(file.name);
              return next;
            });
          }
        });
      }

      success(`Added ${validFiles.length} file(s)`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle remove file
  const handleRemoveFile = (index: number) => {
    const file = attachedFiles[index];
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));

    // Revoke preview URL if it exists
    if (previewingFile && previewingFile.file === file) {
      URL.revokeObjectURL(previewingFile.url);
      setPreviewingFile(null);
    }

    success(`Removed ${file.name}`);
  };

  // Handle file preview
  const handleFilePreview = async (file: File) => {
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    let content: string | undefined;

    // Read text file content for preview
    if (file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.js') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.py') ||
      file.name.endsWith('.java') ||
      file.name.endsWith('.cpp') ||
      file.name.endsWith('.c') ||
      file.name.endsWith('.cs')) {
      try {
        content = await readTextFile(file);
      } catch (error: unknown) {
        logger.error('Failed to read file content', error);
      }
    }

    setPreviewingFile({ file, url, content });
  };

  // Close file preview
  const handleClosePreview = () => {
    if (previewingFile) {
      URL.revokeObjectURL(previewingFile.url);
      setPreviewingFile(null);
    }
  };

  // Handle stop/cancel request
  const handleStop = () => {
    if (abortControllerRef) {
      abortControllerRef.abort();
      setAbortControllerRef(null);
    }
    setIsLoading(false);
    success('Request cancelled');
  };

  // Handle clear chat - frontend only (preserves hash sphere integrity)
  const handleClearChat = useCallback(() => {
    if (messages.length === 0) return;
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setInput('');
      setHasStartedTyping(false);
      setAttachedFiles([]);
      setShowFiles(false);
      setCurrentConversationId(null);
    }
  }, [messages.length]);

  // Load conversation into chat
  const handleLoadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoadingConversation(conversationId);
      setShowThreadsSticker(false);

      let conversationMessages: Message[] = [];

      if (isLoggedIn) {
        try {
          // Use getChatHistory from resonantChat.ts to load from chat_service
          const data = await getChatHistory(conversationId);
          
          // Handle both array format and object with messages array
          let messagesArray: any[] = [];
          let agentHash: string | null = null;
          
          if (Array.isArray(data)) {
            messagesArray = data;
          } else if (data?.messages && Array.isArray(data.messages)) {
            messagesArray = data.messages;
            agentHash = data.agent_hash || null;
          }
          
          conversationMessages = messagesArray.map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : (msg.created_at ? new Date(msg.created_at) : new Date()),
            aiProvider: msg.aiProvider || msg.ai_provider,
            validity: msg.validity,
            hash: msg.hash,
            resonanceScore: msg.resonanceScore || msg.resonance_score || 0,
            xyz: msg.xyz || (msg.xyz_x !== undefined ? [msg.xyz_x, msg.xyz_y || 0, msg.xyz_z || 0] : undefined),
            anchors: msg.anchors || [],
            sources: msg.sources?.map((s: Record<string, any>) => ({
              id: s.id || String(Math.random()),
              content: s.content || '',
              score: s.score || 0,
              hash: s.hash,
              cluster: s.cluster,
              metadata: s.metadata || {},
            })),
          }));
          
          // Update agent hash if available
          if (agentHash && !selectedAgentHash) {
            setSelectedAgentHash(agentHash);
          }
        } catch (error: unknown) {
          logger.error('Failed to load conversation from resonant-chat backend', error);
          throw error;
        }
      } else {
        // Load from sessionStorage for guests
        const guestConversations = JSON.parse(sessionStorage.getItem('guest-conversations') || '[]');
        const conversation = guestConversations.find((c: { id: string }) => c.id === conversationId);
        if (conversation && conversation.messages) {
          conversationMessages = conversation.messages.map((msg: { role: string; content: string; timestamp: string }) => ({
            id: `msg-${Date.now()}-${Math.random()}`,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
        }
      }

      setMessages(conversationMessages);
      setCurrentConversationId(conversationId);
      // Save to localStorage for persistence
      localStorage.setItem(CHAT_STORAGE_KEY, conversationId);
      success('Conversation loaded');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation';
      showError(errorMessage);
    } finally {
      setIsLoadingConversation(null);
    }
  }, [isLoggedIn, success, showError, selectedAgentHash]);

  // Handle new chat - clears messages and conversation ID
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    setAttachedFiles([]);
    setShowFiles(false);
    setCurrentConversationId(null);
    // Clear saved conversation ID from localStorage when starting new conversation
    localStorage.removeItem('resonant-chat-current-conversation');
    success('New chat started');
  }, [success]);

  // Handle cancel input
  const handleCancel = () => {
    setInput('');
    setAttachedFiles([]);
    setShowFiles(false);
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Handle delete conversation (supports both logged-in and guest users)
  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      setIsDeletingConversation(conversationId);

      if (isLoggedIn) {
        try {
          await deleteConversation(conversationId);
        } catch (error: unknown) {
          // If API fails, still remove from UI (graceful degradation)
          logger.error('Failed to delete conversation from backend', error);
        }
      } else {
        // Delete from sessionStorage for guests
        const guestConversations = JSON.parse(sessionStorage.getItem('guest-conversations') || '[]');
        const updated = guestConversations.filter((c: { id: string }) => c.id !== conversationId);
        sessionStorage.setItem('guest-conversations', JSON.stringify(updated));
      }

      setConversations(prev => prev.filter(c => c.id !== conversationId));

      // If deleting current conversation, clear messages
      if (currentConversationId === conversationId) {
        setMessages([]);
        setCurrentConversationId(null);
      }

      success('Conversation deleted');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete conversation';
      showError(errorMessage);
    } finally {
      setIsDeletingConversation(null);
    }
  };

  // Load Resonance Clusters
  const loadResonanceClusters = async () => {
    try {
      const clusters = await getResonanceClusters();
      setResonanceClusters(clusters || []);
    } catch (error) {
      // Use mock data if backend fails
      setResonanceClusters([
        { id: '1', name: 'Cluster 1', items: 12, messages: [] },
        { id: '2', name: 'Cluster 2', items: 8, messages: [] },
        { id: '3', name: 'Cluster 3', items: 5, messages: [] },
      ]);
    }
  };

  // Set up Resonant Chat menu items for global header dropdown
  useEffect(() => {
    const menuItems = [
      {
        id: 'new-chat',
        label: 'New Chat',
        icon: <PlusIcon />,
        onClick: handleNewChat,
      },
      {
        id: 'threads',
        label: 'Threads',
        icon: <SearchIcon />,
        onClick: () => {
          const newState = !showThreadsSticker;
          setShowThreadsSticker(newState);
          if (newState) {
            setShowMetricsSticker(false);
            setShowSettingsSticker(false);
            setShowClustersSticker(false);
            setShowMemoryLibrary(false);
          }
        },
      },
      {
        id: 'anchors',
        label: 'Memory Library',
        icon: <StorageIcon />,
        onClick: () => {
          const newState = !showMemoryLibrary;
          setShowMemoryLibrary(newState);
          if (newState) {
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
            setShowSettingsSticker(false);
            setShowClustersSticker(false);
          }
        },
      },
      {
        id: 'clusters',
        label: 'Context Groups',
        icon: <AnalyticsIcon />,
        onClick: () => {
          const newState = !showClustersSticker;
          setShowClustersSticker(newState);
          if (newState) {
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
            setShowSettingsSticker(false);
            setShowMemoryLibrary(false);
          }
        },
      },
      {
        id: 'metrics',
        label: 'Metrics',
        icon: <TargetIcon />,
        onClick: () => {
          const newState = !showMetricsSticker;
          setShowMetricsSticker(newState);
          if (newState) {
            setShowThreadsSticker(false);
            setShowSettingsSticker(false);
            setShowClustersSticker(false);
            setShowMemoryLibrary(false);
          }
        },
      },
      {
        id: 'divider-1',
        label: '',
        onClick: () => { },
        divider: true,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <SettingsIcon />,
        onClick: () => {
          const newState = !showSettingsSticker;
          setShowSettingsSticker(newState);
          if (newState) {
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
            setShowClustersSticker(false);
            setShowMemoryLibrary(false);
          }
        },
      },
      {
        id: 'share',
        label: 'Share',
        icon: <ShareIcon />,
        onClick: handleShare,
      },
      {
        id: 'export',
        label: 'Export',
        icon: <DownloadIcon />,
        onClick: () => {
          const newState = !showExportOptions;
          setShowExportOptions(newState);
          if (newState) {
            toggleSticker('threads', false); // Close all stickers
            toggleSticker('metrics', false);
            toggleSticker('settings', false);
            toggleSticker('clusters', false);
            toggleSticker('memory', false);
          }
        },
      },
      {
        id: 'divider-2',
        label: '',
        onClick: () => { },
        divider: true,
      },
      {
        id: 'clear-chat',
        label: 'Clear Chat',
        icon: <DeleteIcon />,
        onClick: handleClearChat,
        danger: true,
      },
    ];

    setMenuItems(menuItems);

    // Cleanup on unmount
    return () => {
      setMenuItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showThreadsSticker,
    showMetricsSticker,
    showSettingsSticker,
    showClustersSticker,
    showMemoryLibrary,
    setMenuItems,
  ]);

  // Handle Memory Edit
  const handleMemoryEdit = (memoryId: string, content: string) => {
    setEditingMemory(memoryId);
    setMemoryEditContent(content);
  };

  const handleMemorySaveEdit = async () => {
    if (!editingMemory || !memoryEditContent.trim()) return;
    try {
      setIsUpdatingMemory(true);

      if (isLoggedIn) {
        try {
          await updateMemory(editingMemory, memoryEditContent);
        } catch (error: unknown) {
          // If API fails, still update UI (graceful degradation)
          logger.error('Failed to update memory in backend', error);
        }
      } else {
        // Update in sessionStorage for guests
        const guestMemories = JSON.parse(sessionStorage.getItem('guest-memories') || '[]');
        const updated = guestMemories.map((m: { id: string; content: string }) =>
          m.id === editingMemory ? { ...m, content: memoryEditContent } : m
        );
        sessionStorage.setItem('guest-memories', JSON.stringify(updated));
      }

      setMemories(prev => prev.map(m =>
        m.id === editingMemory ? { ...m, content: memoryEditContent } : m
      ));
      setEditingMemory(null);
      setMemoryEditContent('');
      success('Memory updated');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update memory';
      showError(errorMessage);
    } finally {
      setIsUpdatingMemory(false);
    }
  };

  // Handle Conversation Rename
  const handleConversationRename = (conversationId: string, currentTitle: string) => {
    setRenamingConversation(conversationId);
    setConversationNewTitle(currentTitle);
  };

  const handleConversationSaveRename = async () => {
    if (!renamingConversation || !conversationNewTitle.trim()) return;
    try {
      setIsUpdatingConversation(true);

      if (isLoggedIn) {
        try {
          await updateConversation(renamingConversation, conversationNewTitle);
        } catch (error: unknown) {
          // If API fails, still update UI (graceful degradation)
          logger.error('Failed to update conversation in backend', error);
        }
      } else {
        // Update in sessionStorage for guests
        const guestConversations = JSON.parse(sessionStorage.getItem('guest-conversations') || '[]');
        const updated = guestConversations.map((c: { id: string; title?: string }) =>
          c.id === renamingConversation ? { ...c, title: conversationNewTitle } : c
        );
        sessionStorage.setItem('guest-conversations', JSON.stringify(updated));
      }

      setConversations(prev => prev.map(c =>
        c.id === renamingConversation ? { ...c, title: conversationNewTitle } : c
      ));
      setRenamingConversation(null);
      setConversationNewTitle('');
      success('Conversation renamed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename conversation';
      showError(errorMessage);
    } finally {
      setIsUpdatingConversation(false);
    }
  };

  // Handle Context Menu
  const handleContextMenu = (e: React.MouseEvent, messageId: string, type: 'message' | 'source' = 'message') => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id: messageId, type });
  };

  // Handle Message Edit
  const handleMessageEdit = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditMessageContent(content);
  };

  const handleMessageSaveEdit = () => {
    if (!editingMessage || !editMessageContent.trim()) return;
    setMessages(prev => prev.map(m =>
      m.id === editingMessage ? { ...m, content: editMessageContent } : m
    ));
    setEditingMessage(null);
    setEditMessageContent('');
    // Resend message if it's a user message
    const message = messages.find(m => m.id === editingMessage);
    if (message?.role === 'user') {
      setInput(editMessageContent);
      setTimeout(() => handleSend(), 100);
    }
  };

  // Handle Export
  const handleExport = () => {
    if (exportFormat === 'txt') {
      const content = messages.map(m =>
        `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}${exportOptions.timestamps ? ` (${m.timestamp?.toLocaleString()})` : ''}`
      ).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resonant-chat-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'json') {
      const data = messages.map(m => ({
        role: m.role,
        content: m.content,
        ...(exportOptions.timestamps && { timestamp: m.timestamp }),
        ...(exportOptions.badges && { provider: m.aiProvider }),
        ...(exportOptions.scores && { validity: m.validity }),
      }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resonant-chat-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowExportOptions(false);
    success('Conversation exported');
  };

  // Load anchors on mount and when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadMemoryAnchors();
    }
  }, [isLoggedIn]);

  // Load clusters when sticker is shown
  useEffect(() => {
    if (showClustersSticker) {
      loadResonanceClusters();
    }
  }, [showClustersSticker]);

  // WebSocket/SSE connection management - DISABLED to prevent rate limiting
  // Real-time updates are handled via polling or on-demand requests instead
  // This prevents the 429 Too Many Requests errors
  useEffect(() => {
    // Cleanup any existing connections
    if (wsClient) {
      wsClient.disconnect();
      setWsClient(null);
    }
    if (sseClient) {
      sseClient.disconnect();
      setSseClient(null);
    }
    // Real-time connections disabled - responses are fetched on-demand
  }, [currentConversationId]);

  // Handle real-time messages
  const handleRealtimeMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'response_chunk':
        // Stream AI response chunks
        if (message.chunk) {
          setStreamingContent(prev => prev + message.chunk);
        }
        if (message.done && streamingMessageId) {
          // Finalize the message
          setMessages(prev => prev.map(m =>
            m.id === streamingMessageId
              ? { ...m, content: streamingContent + (message.chunk || '') }
              : m
          ));
          setStreamingMessageId(null);
          setStreamingContent('');
        }
        break;

      case 'message_update':
        // Update message in real-time
        if (message.message) {
          setMessages(prev => prev.map(m =>
            m.id === message.message?.id
              ? { ...m, ...message.message }
              : m
          ));
        }
        break;

      case 'memory_update':
        // Reload memory anchors
        loadMemoryAnchors();
        break;

      case 'cluster_update':
        // Reload clusters
        loadResonanceClusters();
        break;

      case 'evidence_graph_update':
        // Update evidence graph if shown
        if (showEvidenceGraph && message.message_id === showEvidenceGraph) {
          getEvidenceGraph(showEvidenceGraph).then(setEvidenceGraphData).catch(logger.error);
        }
        break;

      case 'pong':
      case 'heartbeat':
        // Keep-alive messages, no action needed
        break;

      default:
        logger.debug('Unknown WebSocket message type', { type: message.type } as Record<string, unknown>);
    }
  };

  // Close autocomplete on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionAutocompleteRef.current && !mentionAutocompleteRef.current.contains(e.target as Node)) {
        setShowMentionAutocomplete(false);
      }
      if (commandAutocompleteRef.current && !commandAutocompleteRef.current.contains(e.target as Node)) {
        setShowCommandAutocomplete(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close context menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
        setShowMentionAutocomplete(false);
        setShowCommandAutocomplete(false);
        handleClosePreview();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (previewingFile) {
        URL.revokeObjectURL(previewingFile.url);
      }
    };
  }, [previewingFile]);

  // Calculate metrics - Use backend data if available, otherwise calculate locally from actual message content
  const avgValidity = messages.length > 0
    ? messages.filter(m => m.validity !== undefined).reduce((sum, m) => sum + (m.validity || 0), 0) / Math.max(1, messages.filter(m => m.validity !== undefined).length)
    : 0;

  // Quality/Resonant Energy = ONLY from backend metrics
  // We don't fake these metrics locally - they require proper AI analysis
  const avgResonance: number | null = (() => {
    if (chatMetrics?.metrics_available) return chatMetrics.quality;
    return null; // No fake local calculations - show N/A
  })();

  // Hallucination Risk = ONLY from backend metrics  
  // Hallucination detection requires proper AI analysis, not heuristics
  const avgHallucination: number | null = (() => {
    if (chatMetrics?.metrics_available) return chatMetrics.hallucination;
    return null; // No fake local calculations - show N/A
  })();

  // Evidence Score = ONLY from backend metrics (based on actual RAG retrieval)
  const avgEvidence: number | null = (() => {
    // Only use real backend metrics - evidence requires actual retrieval analysis
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const messagesWithMetrics = assistantMessages.filter(m => m.metrics?.evidence !== undefined);
    if (messagesWithMetrics.length === 0) return null;
    return messagesWithMetrics.reduce((sum, m) => sum + (m.metrics?.evidence || 0), 0) / messagesWithMetrics.length;
  })();

  // Anchor Following = ONLY from backend metrics
  const avgAnchorFollowing: number | null = (() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const messagesWithMetrics = assistantMessages.filter(m => m.metrics?.anchorFollowing !== undefined);
    if (messagesWithMetrics.length === 0) return null;
    return messagesWithMetrics.reduce((sum, m) => sum + (m.metrics?.anchorFollowing || 0), 0) / messagesWithMetrics.length;
  })();

  const totalMessages = messages.length;
  // Tokens = from backend or estimate (~4 chars per token)
  const totalTokens = chatMetrics?.metrics_available 
    ? chatMetrics.tokens 
    : Math.round(messages.reduce((sum, m) => sum + m.content.length, 0) / 4);

  // Toolbar actions
  // Quick start prompts for empty state
  const quickStartPrompts = [
    { text: 'Explain quantum computing', icon: LightbulbIcon },
    { text: 'Write a creative story', icon: PenIcon },
    { text: 'Help me plan a project', icon: ClipboardIcon },
    { text: 'Analyze this code', icon: SearchMagnifyIcon },
    { text: 'Translate this text', icon: GlobeIcon },
    { text: 'Debug my code', icon: BugIcon },
  ];

  const toolbarActions = [
    {
      key: 'new-chat',
      label: 'New Chat',
      detail: 'Start fresh',
      icon: <PlusIcon />,
      onClick: handleNewChat,
    },
    {
      key: 'threads',
      label: 'Threads',
      detail: `${conversations.length} saved`,
      icon: <FileIcon />,
      onClick: () => toggleSticker('threads', showThreadsSticker),
    },
    {
      key: 'anchors',
      label: 'Context',
      detail: `${memories.length} total`,
      icon: <StorageIcon />,
      onClick: () => toggleSticker('memory', showMemoryLibrary),
    },
    {
      key: 'clusters',
      label: 'Groups',
      detail: `${resonanceClusters.length} groups`,
      icon: <AnalyticsIcon />,
      onClick: () => toggleSticker('clusters', showClustersSticker),
    },
    {
      key: 'metrics',
      label: 'Metrics',
      detail: 'Validity & quality',
      icon: <TargetIcon />,
      onClick: () => toggleSticker('metrics', showMetricsSticker),
    },
    {
      key: 'settings',
      label: 'Settings',
      detail: 'Providers & theme',
      icon: <SettingsIcon />,
      onClick: () => toggleSticker('settings', showSettingsSticker),
    },
    {
      key: 'export',
      label: 'Export',
      detail: '.txt transcript',
      icon: <DownloadIcon />,
      onClick: () => {
        setShowExportOptions(true);
        toggleSticker('threads', false); // Close all stickers
        toggleSticker('metrics', false);
        toggleSticker('settings', false);
        toggleSticker('clusters', false);
        toggleSticker('memory', false);
      },
    },
    {
      key: 'share',
      label: 'Share',
      detail: 'Copy or send',
      icon: <ShareIcon />,
      onClick: () => {
        handleShare();
        toggleSticker('threads', false);
        toggleSticker('metrics', false);
        toggleSticker('settings', false);
      },
    },
    {
      key: 'clear-chat',
      label: 'Clear Chat',
      detail: 'Remove all',
      icon: <DeleteIcon />,
      onClick: handleClearChat,
    },
  ];

  // Handle memory click (insert @ mention)
  const handleMemoryClick = (memory: MemoryResponse) => {
    const memoryName = memory.name || memory.content?.substring(0, 30) || 'memory';
    const beforeCursor = input.substring(0, inputRef.current?.selectionStart || input.length);
    const afterCursor = input.substring(inputRef.current?.selectionStart || input.length);
    setInput(beforeCursor + `@${memoryName} ` + afterCursor);
    inputRef.current?.focus();
    setTimeout(() => {
      const newPos = beforeCursor.length + memoryName.length + 2;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Handle code files click
  const handleCodeFilesClick = () => {
    // Open file picker for code files - use existing file input
    if (fileInputRef.current) {
      fileInputRef.current.accept = '.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.rb,.php';
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles.chatPage}>
      {/* Enhanced Sidebar with User Info and Settings */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : styles.hidden}`}>
        <EnhancedSidebar
          conversations={conversations}
          memories={memories}
          currentConversationId={currentConversationId}
          isLoadingConversations={isLoadingConversations}
          isLoadingConversation={isLoadingConversation}
          isDeletingConversation={isDeletingConversation}
          memorySearchQuery={memorySearchQuery}
          onMemorySearchChange={setMemorySearchQuery}
          onConversationClick={handleLoadConversation}
          onNewConversation={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onMemoryClick={(memory) => handleMemoryClick(memory as MemoryResponse)}
          onMemorySave={handleMemorySave}
          onSettingsClick={() => {
            setShowSettingsSticker(true);
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
          }}
          onCodeFilesClick={handleCodeFilesClick}
          onExport={() => {
            setShowExportOptions(true);
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
            setShowSettingsSticker(false);
            setShowClustersSticker(false);
            setShowMemoryLibrary(false);
          }}
          onShare={handleShare}
          onClearChat={handleClearChat}
          onShowMetrics={() => toggleSticker('metrics', showMetricsSticker)}
          onShowGroups={() => toggleSticker('clusters', showClustersSticker)}
          onShowThreads={() => toggleSticker('threads', showThreadsSticker)}
          onShowMemoryLibrary={() => toggleSticker('memory', showMemoryLibrary)}
          onShowSettingsSticker={() => toggleSticker('settings', showSettingsSticker)}
          onToggleAgentMode={() => setAgentMode(!agentMode)}
          onAttachFile={() => fileInputRef.current?.click()}
          agentMode={agentMode}
          selectedProvider={selectedProvider}
          onProviderChange={(provider: string) => {
            setSelectedProvider(provider as Provider);
            setAutoReason('');
            setSelectedModel('');
          }}
          conversationsCount={conversations.length}
          memoriesCount={memories.length}
          groupsCount={resonanceClusters.length}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          temperature={temperature}
          onTemperatureChange={setTemperature}
          maxTokens={maxTokens}
          onMaxTokensChange={setMaxTokens}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          autoSave={autoSave}
          onToggleAutoSave={() => setAutoSave(!autoSave)}
          showTimestamps={showTimestamps}
          onToggleTimestamps={() => setShowTimestamps(!showTimestamps)}
          showProviderBadges={showProviderBadges}
          onToggleProviderBadges={() => setShowProviderBadges(!showProviderBadges)}
          showValidityScores={showValidityScores}
          onToggleValidityScores={() => setShowValidityScores(!showValidityScores)}
          compactMode={compactMode}
          onToggleCompactMode={() => setCompactMode(!compactMode)}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          inputAutoResize={inputAutoResize}
          onToggleInputAutoResize={() => setInputAutoResize(!inputAutoResize)}
          soundNotifications={soundNotifications}
          onToggleSoundNotifications={() => setSoundNotifications(!soundNotifications)}
          keyboardShortcuts={keyboardShortcuts}
          onToggleKeyboardShortcuts={() => setKeyboardShortcuts(!keyboardShortcuts)}
          showShortcutsInfo={showShortcutsInfo}
          onToggleShortcutsInfo={() => setShowShortcutsInfo(!showShortcutsInfo)}
          currentTheme={theme as 'light' | 'dark'}
          onToggleTheme={toggleTheme}
          teams={teams.map(t => ({ id: t.id, name: t.name }))}
          selectedTeamId={selectedTeamId}
          onSelectTeam={setSelectedTeamId}
        />
      </div>

      {/* Hidden file input for attach file functionality - no accept filter to allow all files */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setAttachedFiles(prev => [...prev, ...newFiles]);
            setShowFiles(true);
            success(`Added ${newFiles.length} file(s)`);
          }
          // Reset input so same file can be selected again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />

      <div className={`${styles.chatContainer} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* Project Builder - Show when project is being generated */}
        {generatedProject && (
          <div className={styles.projectBuilderWrapper}>
            <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Project Builder...</div>}>
              <ProjectBuilder
                description={generatedProject.description}
                projectType={generatedProject.projectType}
                onClose={() => setGeneratedProject(null)}
                onProjectGenerated={(files) => {
                  // Project generated successfully
                  logger.info('Project generated', { fileCount: files.length });
                }}
              />
            </Suspense>
          </div>
        )}

        {/* Main Chat Area and Footer - Hide when project builder or IDE is shown */}
        {!generatedProject && (
          <div>
            <div className={`${styles.mainChatArea} ${!sidebarOpen ? styles.noSidebar : ''} ${splitViewEnabled ? styles.splitViewEnabled : ''}`}>
              <Suspense fallback={<div style={{ flex: 1 }} />}>
                <SplitViewModule
                  enabled={splitViewEnabled && messages.length > 0}
                  onClose={() => setSplitViewEnabled(false)}
                  selectedMessageId={selectedCodeMessage}
                  messages={messages}
                  onCopyCode={copyMessage}
                  initialWidth={splitViewWidth}
                  onWidthChange={setSplitViewWidth}
                  projectMode={projectMode}
                  projectFiles={projectFiles}
                  showBuildModule={showBuildModule}
                  onCloseBuildModule={() => setShowBuildModule(false)}
                >
                {messages.length === 0 ? (
                <FloatingHome
                  onPromptSelect={(prompt) => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  onAgentSelect={setSelectedAgentHash}
                  onTeamSelect={setSelectedTeamId}
                  onProviderSelect={(provider) => setSelectedProvider(provider as Provider)}
                  selectedAgentHash={selectedAgentHash}
                  selectedTeamId={selectedTeamId}
                  selectedProvider={selectedProvider}
                  isLoggedIn={isLoggedIn}
                />
              ) : (
                <div className={`${styles.messagesContainer} ${compactMode ? styles.compactMode : ''} ${styles[`fontSize-${fontSize}`]}`}>
                  {/* Usage Tracking Bar - Shows actual metrics (N/A when unavailable) */}
                  <div className={styles['resonant-chat-usage-bar']}>
                    <span>Messages: {usageStats.messages}</span>
                    <span>|</span>
                    <span>Tokens: {usageStats.tokens.toLocaleString()}</span>
                    <span>|</span>
                    <span style={{ color: usageStats.quality !== null ? (usageStats.quality > 0.7 ? '#22c55e' : usageStats.quality > 0.5 ? '#eab308' : '#ef4444') : '#666' }}>
                      Quality: {usageStats.quality !== null ? `${(usageStats.quality * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                    <span>|</span>
                    <span style={{ color: usageStats.hallucination !== null ? (usageStats.hallucination < 0.1 ? '#22c55e' : usageStats.hallucination < 0.3 ? '#eab308' : '#ef4444') : '#666' }}>
                      Hallucination: {usageStats.hallucination !== null ? `${(usageStats.hallucination * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                    <button
                      className={styles['resonant-chat-input-button']}
                      onClick={() => setShowUsagePanel(true)}
                      title="View Details"
                    >
                      <span className={styles['resonant-chat-input-label']}>Details</span>
                    </button>
                    <button
                      className={styles['resonant-chat-input-button']}
                      onClick={() => setShowSettingsSticker(true)}
                      title="Chat Settings"
                      style={{ marginLeft: '8px' }}
                    >
                      <SettingsIcon />
                    </button>
                  </div>

                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`${styles.message} ${styles[message.role]} ${alignUserMessagesRight && message.role === 'user' ? styles.alignRight : ''} ${selectedCodeMessage === message.id ? styles.selected : ''}`}
                      onClick={() => {
                        // Select message for split view code display
                        const hasCode = message.content.match(/```[\s\S]*?```/g);
                        if (hasCode && hasCode.length > 0) {
                          setSelectedCodeMessage(message.id);
                        }
                      }}
                      style={{ cursor: message.content.includes('```') ? 'pointer' : 'default' }}
                    >
                      <div className={styles.messageHeader}>
                        {showProviderBadges && message.aiProvider && message.role === 'assistant' && (
                          <span className={styles.providerBadge}>{formatProviderName(message.aiProvider)}</span>
                        )}
                        {/* Memory Icon - Shows memory usage for this message */}
                        {message.role === 'assistant' && (
                          <button
                            className={styles.messageHeaderIcon}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMemoryViewer(true);
                            }}
                            title={`Memory: ${message.anchors?.length || 0} context items used`}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11px',
                              color: message.anchors && message.anchors.length > 0 ? '#22c55e' : '#666',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
                              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
                            </svg>
                            <span>{message.anchors?.length || 0}</span>
                          </button>
                        )}
                        {/* Metrics Icon - Shows metrics for this message */}
                        {message.role === 'assistant' && (
                          <button
                            className={styles.messageHeaderIcon}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setShowEvidenceGraph(message.id);
                              setIsLoadingEvidenceGraph(true);
                              try {
                                const [graphData, msgMetrics] = await Promise.all([
                                  getEvidenceGraph(message.id).catch(() => null),
                                  getMessageMetrics(message.id).catch(() => null)
                                ]);
                                setEvidenceGraphData(graphData);
                                if (msgMetrics && msgMetrics.metrics) {
                                  setMessageMetrics(msgMetrics);
                                } else {
                                  setMessageMetrics(null);
                                }
                              } catch (error) {
                                setEvidenceGraphData(null);
                                setMessageMetrics(null);
                              } finally {
                                setIsLoadingEvidenceGraph(false);
                              }
                            }}
                            title={`Quality: ${message.resonanceScore ? (message.resonanceScore * 100).toFixed(0) + '%' : 'N/A'}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11px',
                              color: message.resonanceScore ? (message.resonanceScore > 0.7 ? '#22c55e' : message.resonanceScore > 0.5 ? '#eab308' : '#ef4444') : '#666',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 3v18h18" />
                              <path d="M18 17V9" />
                              <path d="M13 17V5" />
                              <path d="M8 17v-3" />
                            </svg>
                            <span>{message.resonanceScore ? `${(message.resonanceScore * 100).toFixed(0)}%` : 'N/A'}</span>
                          </button>
                        )}
                        {showValidityScores && message.validity !== undefined && message.role === 'assistant' && (
                          <span className={styles.validityScore}>Validity: {(message.validity * 100).toFixed(1)}%</span>
                        )}
                        {message.hash && message.role === 'assistant' && (
                          <span className={styles.timestamp} style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.6 }}>
                            ID: {message.hash.substring(0, 8)}...
                          </span>
                        )}
                        {showTimestamps && message.timestamp && (
                          <span className={styles.timestamp}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className={styles.messageContent}>
                        {/* Enhanced message rendering with markdown */}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={language}
                                  PreTag="div"
                                  className={styles.codeBlock}
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={styles.inlineCode} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className={styles.markdownParagraph}>{children}</p>,
                            ul: ({ children }) => <ul className={styles.markdownList}>{children}</ul>,
                            ol: ({ children }) => <ol className={styles.markdownList}>{children}</ol>,
                            li: ({ children }) => <li className={styles.markdownListItem}>{children}</li>,
                            h1: ({ children }) => <h1 className={styles.markdownHeading}>{children}</h1>,
                            h2: ({ children }) => <h2 className={styles.markdownHeading}>{children}</h2>,
                            h3: ({ children }) => <h3 className={styles.markdownHeading}>{children}</h3>,
                            blockquote: ({ children }) => <blockquote className={styles.markdownBlockquote}>{children}</blockquote>,
                            a: ({ href, children }) => <a href={href} className={styles.markdownLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                            table: ({ children }) => <table className={styles.markdownTable}>{children}</table>,
                            thead: ({ children }) => <thead>{children}</thead>,
                            tbody: ({ children }) => <tbody>{children}</tbody>,
                            tr: ({ children }) => <tr>{children}</tr>,
                            th: ({ children }) => <th>{children}</th>,
                            td: ({ children }) => <td>{children}</td>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* Generated Images Display */}
                      {message.role === 'assistant' && message.generatedImages && message.generatedImages.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '12px',
                          marginTop: '12px',
                          padding: '12px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          borderRadius: '12px',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}>
                          <div style={{ width: '100%', fontSize: '12px', color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Generated Images ({message.generatedImages.length})
                          </div>
                          {message.generatedImages.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                              <img
                                src={img.url || `data:image/png;base64,${img.base64_data}`}
                                alt={img.revised_prompt || 'Generated image'}
                                style={{
                                  maxWidth: '300px',
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                }}
                                onClick={() => window.open(img.url || `data:image/png;base64,${img.base64_data}`, '_blank')}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                              />
                              {img.revised_prompt && (
                                <div style={{
                                  fontSize: '10px',
                                  color: '#888',
                                  marginTop: '4px',
                                  maxWidth: '300px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={img.revised_prompt}
                                >
                                  {img.revised_prompt}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Web Search Results Display - REMOVED */}
                      {/* Hash Sphere Module Outputs */}
                      {message.role === 'assistant' && message.modules && (
                        <ModuleOutputs modules={message.modules} collapsed={true} />
                      )}
                      {message.sources && message.sources.length > 0 && (
                        <div className={styles.sources}>
                          <button
                            className={styles.sourcesToggle}
                            onClick={() => {
                              const newExpanded = new Set(expandedSources);
                              if (newExpanded.has(message.id)) {
                                newExpanded.delete(message.id);
                              } else {
                                newExpanded.add(message.id);
                              }
                              setExpandedSources(newExpanded);
                            }}
                          >
                            {expandedSources.has(message.id) ? 'Hide' : 'Show'} Sources ({message.sources.length})
                          </button>
                          {expandedSources.has(message.id) && (
                            <div className={styles.sourcesList}>
                              {message.sources.map((source, idx) => (
                                <div key={idx} className={styles.sourceItem}>
                                  <div className={styles.sourceContent}>{source.content}</div>
                                  <div className={styles.sourceScore}>Score: {source.score.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {showMessageActions && (
                      <div
                        className={styles.messageActions}
                        onContextMenu={(e) => handleContextMenu(e, message.id, 'message')}
                      >
                        {editingMessage === message.id ? (
                          <div className={styles['resonant-chat-message-edit']}>
                            <textarea
                              value={editMessageContent}
                              onChange={(e) => setEditMessageContent(e.target.value)}
                              className={styles.textInput}
                              rows={3}
                            />
                            <div className={styles['resonant-chat-message-edit-actions']}>
                              <button
                                className={styles['resonant-chat-input-button']}
                                onClick={() => {
                                  setEditingMessage(null);
                                  setEditMessageContent('');
                                }}
                              >
                                <span className={styles['resonant-chat-input-label']}>Cancel</span>
                              </button>
                              <button
                                className={styles['resonant-chat-input-button']}
                                onClick={handleMessageSaveEdit}
                              >
                                <span className={styles['resonant-chat-input-label']}>Save & Resend</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {message.role === 'user' && (
                              <button
                                className={styles['resonant-chat-message-action-button']}
                                onClick={() => handleMessageEdit(message.id, message.content)}
                              >
                                <span className={styles['resonant-chat-message-action-icon']}><EditIcon /></span>
                                <span className={styles['resonant-chat-message-action-label']}>Edit</span>
                              </button>
                            )}
                            {message.role === 'assistant' && (
                              <>
                                <button
                                  className={styles['resonant-chat-message-action-button']}
                                  onClick={() => copyMessage(message.content)}
                                  title="Copy"
                                >
                                  <span className={styles['resonant-chat-message-action-icon']}><CopyIcon /></span>
                                </button>
                                <button
                                  className={styles['resonant-chat-message-action-button']}
                                  onClick={() => {
                                    console.log('💾 Save to memory clicked:', message.content.substring(0, 50));
                                    saveToMemory(message.content);
                                  }}
                                  disabled={isLoadingMemory}
                                  title={isLoadingMemory ? "Saving..." : "Save to Memory"}
                                >
                                  <span 
                                    className={styles['resonant-chat-message-action-icon']}
                                    style={isLoadingMemory ? { animation: 'spin 1s linear infinite' } : undefined}
                                  >
                                    <StorageIcon />
                                  </span>
                                </button>
                                <button
                                  className={styles['resonant-chat-message-action-button']}
                                  onClick={() => regenerateResponse(message.id)}
                                  disabled={isRegenerating === message.id || isLoading}
                                  title={isRegenerating === message.id ? "Regenerating..." : "Regenerate"}
                                >
                                  <span 
                                    className={styles['resonant-chat-message-action-icon']}
                                    style={isRegenerating === message.id ? { animation: 'spin 1s linear infinite' } : undefined}
                                  >
                                    <RegenerateIcon />
                                  </span>
                                </button>
                                {/* Feedback Buttons - Submit to backend with agent hash for custom agents */}
                                <FeedbackButtons
                                  messageId={message.id}
                                  agentType={message.aiProvider || 'reasoning'}
                                  agentHash={selectedAgentHash || undefined}
                                  task={messages.find(m => m.role === 'user' && messages.indexOf(m) < messages.indexOf(message))?.content || ''}
                                  response={message.content}
                                  onFeedbackSubmit={(isPositive) => {
                                    if (isPositive) {
                                      success('Thanks for your feedback!');
                                    } else {
                                      warning('Thanks for your feedback. We\'ll improve.');
                                    }
                                  }}
                                />
                              </>
                            )}
                            <button
                              className={`${styles['resonant-chat-message-action-button']} ${styles['delete-button']}`}
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <span className={styles['resonant-chat-message-action-icon']}><DeleteIcon /></span>
                              <span className={styles['resonant-chat-message-action-label']}>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              </SplitViewModule>
              </Suspense>
            </div>
            <footer className={`${styles['resonant-chat-footer']} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
              {/* Metrics Sticker - Above Footer (Toggle on Metrics Button) */}
              {showMetricsSticker && (
                <div className={styles['resonant-chat-metrics-sticker']}>
                  {chatMetrics?.metrics_available ? (
                    <>
                      <span>Quality {(chatMetrics.quality * 100).toFixed(1)}%</span>
                      <span>|</span>
                      <span style={{ color: chatMetrics.hallucination > 0.1 ? '#ef4444' : '#22c55e' }}>
                        Hallucination {(chatMetrics.hallucination * 100).toFixed(1)}%
                      </span>
                      <span>|</span>
                      <span>Tokens {chatMetrics.tokens.toLocaleString()}</span>
                      <span>|</span>
                      <span>Messages {chatMetrics.message_count}</span>
                      {Object.keys(chatMetrics.provider_breakdown).length > 0 && (
                        <>
                          <span>|</span>
                          <span>Providers: {Object.entries(chatMetrics.provider_breakdown).map(([p, c]) => `${p}(${c})`).join(', ')}</span>
                        </>
                      )}
                    </>
                  ) : messages.length > 0 ? (
                    <>
                      <span>Quality {avgResonance !== null ? `${(avgResonance * 100).toFixed(1)}%` : 'N/A'}</span>
                      <span>|</span>
                      <span>Hallucination {avgHallucination !== null ? `${(avgHallucination * 100).toFixed(1)}%` : 'N/A'}</span>
                      <span>|</span>
                      <span>Tokens ~{totalTokens.toLocaleString()}</span>
                      <span>|</span>
                      <span>Messages {messages.length}</span>
                    </>
                  ) : (
                    <span style={{ color: '#666' }}>No messages yet - metrics will appear after conversation starts</span>
                  )}
                  {/* User Analytics - 30 day stats */}
                  {userAnalytics && (
                    <div style={{ 
                      marginTop: '8px', 
                      paddingTop: '8px', 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      fontSize: '11px',
                      color: '#888',
                    }}>
                      <span title="Total messages in 30 days">📊 {userAnalytics.usage.total_messages} msgs</span>
                      <span title="Total conversations">💬 {userAnalytics.usage.total_conversations} chats</span>
                      <span title="Active days">📅 {userAnalytics.usage.active_days} days</span>
                      {userAnalytics.quality && (
                        <>
                          <span title="Average resonance quality" style={{ color: userAnalytics.quality.avg_resonance > 0.7 ? '#22c55e' : '#f59e0b' }}>
                            ⭐ {(userAnalytics.quality.avg_resonance * 100).toFixed(0)}% quality
                          </span>
                          <span title="Quality trend" style={{ color: userAnalytics.quality.trend === 'improving' ? '#22c55e' : userAnalytics.quality.trend === 'declining' ? '#ef4444' : '#888' }}>
                            {userAnalytics.quality.trend === 'improving' ? '📈' : userAnalytics.quality.trend === 'declining' ? '📉' : '➡️'} {userAnalytics.quality.trend}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Export Options Sticker - Above Footer (Toggle on Export Button) */}
              {showExportOptions && (
                <div className={styles['resonant-chat-export-options-sticker']}>
                  <div className={styles['resonant-chat-export-options-header']}>
                    <h3>Export Options</h3>
                    <button
                      type="button"
                      className={styles['resonant-chat-export-options-close']}
                      onClick={() => setShowExportOptions(false)}
                    >
                      <span className={styles['resonant-chat-input-icon']}><CloseIcon /></span>
                    </button>
                  </div>
                  <div className={styles['resonant-chat-export-options-list']}>
                    <button
                      type="button"
                      className={styles['resonant-chat-export-options-item']}
                      onClick={() => {
                        setExportFormat('txt');
                        handleExport();
                      }}
                    >
                      <span className={styles['resonant-chat-input-icon']}><FileIcon /></span>
                      <span className={styles['resonant-chat-input-label']}>Export as Text</span>
                    </button>
                    <button
                      type="button"
                      className={styles['resonant-chat-export-options-item']}
                      onClick={() => {
                        setExportFormat('json');
                        handleExport();
                      }}
                    >
                      <span className={styles['resonant-chat-input-icon']}><FileIcon /></span>
                      <span className={styles['resonant-chat-input-label']}>Export as JSON</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Footer toolbar removed - all actions moved to sidebar */}
            </footer>
          </div>
        )}


        {/* NEW Input Bar Component */}
        <ChatInputBar
          value={input}
          onChange={(value) => {
            setInput(value);
            if (value.length > 0 && !hasStartedTyping) {
              setHasStartedTyping(true);
            }
            if (value.length === 0 && hasStartedTyping && messages.length === 0) {
              setHasStartedTyping(false);
            }
          }}
          onSend={handleSend}
          isLoading={isLoading}
          sidebarOpen={sidebarOpen}
          selectedProvider={selectedProvider}
          onProviderChange={(provider: string) => {
            setSelectedProvider(provider as Provider);
            setAutoReason('');
          }}
          availableProviders={availableProviders}
          providerStats={providerStats}
          agentMode={agentMode}
          onToggleAgentMode={() => setAgentMode(!agentMode)}
          selectedAgent={selectedAgentHash}
          onSelectAgent={setSelectedAgentHash}
          agents={availableAgents}
          selectedTeamId={selectedTeamId}
          onSelectTeam={setSelectedTeamId}
          teams={teams.map((t: AgentTeam) => ({ id: t.id, name: t.name }))}
          onNewChat={handleNewChat}
          onClearChat={messages.length > 0 ? handleClearChat : undefined}
          onCancel={handleCancel}
          onBuild={() => {
            // Navigate directly to the Build page
            const description = input.trim() || 'New project';
            navigate(`/build?description=${encodeURIComponent(description)}`);
          }}
          onOpenIDE={() => navigate('/ide')}
          onAttachFile={() => fileInputRef.current?.click()}
          onToggleSplitView={() => setSplitViewEnabled(!splitViewEnabled)}
          splitViewEnabled={splitViewEnabled}
          attachedFiles={attachedFiles}
          onRemoveFile={(index) => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
          memories={memories}
          onShowMemoryLibrary={() => {
            setShowMemoryLibrary(true);
            setShowThreadsSticker(false);
            setShowMetricsSticker(false);
            setShowSettingsSticker(false);
            setShowClustersSticker(false);
          }}
          showMemoryLibrary={showMemoryLibrary}
          onCloseMemoryLibrary={() => setShowMemoryLibrary(false)}
          onMemoryClick={(memory) => {
            setInput(prev => prev + ` @${memory.name || memory.content?.substring(0, 20)} `);
            setShowMemoryLibrary(false);
          }}
          conversations={conversations}
          onShowConversations={() => setShowThreadsSticker(true)}
          showConversations={showThreadsSticker}
          onCloseConversations={() => setShowThreadsSticker(false)}
          onConversationClick={(conv) => {
            handleLoadConversation(conv.id);
            setShowThreadsSticker(false);
          }}
          currentConversationId={currentConversationId}
          onShowSearch={() => {
            setShowThreadsSticker(!showThreadsSticker);
            if (!showThreadsSticker) {
              setShowMetricsSticker(false);
              setShowSettingsSticker(false);
            }
          }}
          onShowSettings={() => setShowSettingsSticker(!showSettingsSticker)}
          showSettings={showSettingsSticker}
          onCopyChat={() => {
            if (messages.length === 0) {
              warning('No messages to copy');
              return;
            }
            const chatText = messages.map(m => 
              `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`
            ).join('\n\n');
            navigator.clipboard.writeText(chatText);
            success('Entire chat copied to clipboard');
          }}
          onShareChat={() => {
            if (messages.length === 0) {
              warning('No messages to share');
              return;
            }
            const chatText = messages.map(m => 
              `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`
            ).join('\n\n');
            if (navigator.share) {
              navigator.share({ 
                title: 'Resonant Chat Conversation',
                text: chatText 
              });
            } else {
              navigator.clipboard.writeText(chatText);
              success('Chat copied to clipboard (share not supported)');
            }
          }}
        />
      </div>

      {/* Hash Sphere 3D Visualization removed - company secret */}

      {/* Evidence Graph Visualization with Metrics - Modern Popup Style */}
      {showEvidenceGraph && (() => {
        const selectedMessage = messages.find(m => m.id === showEvidenceGraph);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99997 }}>
            {/* Backdrop */}
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
              }}
              onClick={() => {
                setShowEvidenceGraph(null);
                setEvidenceGraphData(null);
              }}
            />
            {/* Modal */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '85vh',
              zIndex: 99998,
              background: 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(20, 20, 22, 0.98) 100%)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{ 
                padding: '16px 20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                  Message Metrics
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Help button */}
                  <button
                    onClick={() => setShowUsagePanel(true)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#888',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
                      e.currentTarget.style.color = '#0ea5e9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#888';
                    }}
                    title="What do these metrics mean?"
                  >
                    ?
                  </button>
                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShowEvidenceGraph(null);
                      setEvidenceGraphData(null);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: 'none',
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#888',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = '#888';
                    }}
                    title="Close"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Metrics Content */}
              <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
                {isLoadingEvidenceGraph ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    Loading metrics...
                  </div>
                ) : (
                  <>
                    {/* Message Info - Use backend metrics only */}
                    {selectedMessage && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Message Info</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Role</div>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{messageMetrics?.role || selectedMessage.role}</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Provider</div>
                          <div style={{ fontSize: '14px', color: '#0ea5e9', fontWeight: 500 }}>{selectedMessage.aiProvider || messageMetrics?.provider || 'N/A'}</div>
                        </div>
                        {/* Agent Type */}
                        <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Agent Type
                          </div>
                          <div style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: 500 }}>
                            {messageMetrics?.agent_id || selectedMessage.aiProvider || 'reasoning'}
                          </div>
                        </div>
                        {/* Team ID - Copyable (only show if team was used) */}
                        {messageMetrics?.team_id && (
                          <div 
                            style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', cursor: 'pointer', position: 'relative', gridColumn: 'span 2' }}
                            onClick={() => {
                              const teamId = messageMetrics?.team_id || '';
                              navigator.clipboard.writeText(teamId);
                              const el = document.getElementById('copy-team-id-toast');
                              if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 1500); }
                            }}
                            title="Click to copy Team ID"
                          >
                            <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                              Team ID
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </div>
                            <div style={{ fontSize: '12px', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 500 }}>
                              {messageMetrics.team_id}
                            </div>
                            <span id="copy-team-id-toast" style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', fontSize: '10px', color: '#22c55e', opacity: 0, transition: 'opacity 0.2s' }}>Copied!</span>
                          </div>
                        )}
                        {/* Quality Score - from backend only */}
                        <div style={{ padding: '10px', background: messageMetrics ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Quality Score</div>
                          <div style={{ fontSize: '18px', color: messageMetrics ? '#0ea5e9' : '#666', fontWeight: 600 }}>
                            {messageMetrics ? `${(messageMetrics.quality * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        {/* Hallucination Score - from backend only */}
                        <div style={{ padding: '10px', background: messageMetrics ? (messageMetrics.hallucination > 0.1 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)') : 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Hallucination Risk</div>
                          <div style={{ fontSize: '18px', color: messageMetrics ? (messageMetrics.hallucination > 0.1 ? '#ef4444' : '#22c55e') : '#666', fontWeight: 600 }}>
                            {messageMetrics ? `${(messageMetrics.hallucination * 100).toFixed(1)}%` : 'N/A'}
                          </div>
                        </div>
                        {/* Token Count */}
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Tokens</div>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{messageMetrics?.tokens || 'N/A'}</div>
                        </div>
                        {/* Message ID - Copyable */}
                        <div 
                          style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', position: 'relative' }}
                          onClick={() => {
                            const id = messageMetrics?.message_id || selectedMessage?.id || '';
                            navigator.clipboard.writeText(id);
                            const el = document.getElementById('copy-msg-id-toast');
                            if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 1500); }
                          }}
                          title="Click to copy Message ID"
                        >
                          <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Message ID
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </div>
                          <div style={{ fontSize: '11px', color: '#0ea5e9', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {(messageMetrics?.message_id || selectedMessage?.id || 'N/A').substring(0, 20)}...
                          </div>
                          <span id="copy-msg-id-toast" style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', fontSize: '10px', color: '#22c55e', opacity: 0, transition: 'opacity 0.2s' }}>Copied!</span>
                        </div>
                        {/* Hash ID - Copyable */}
                        {(messageMetrics?.hash || selectedMessage?.hash) && (
                          <div 
                            style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', position: 'relative' }}
                            onClick={() => {
                              const hash = messageMetrics?.hash || selectedMessage?.hash || '';
                              navigator.clipboard.writeText(hash);
                              const el = document.getElementById('copy-hash-toast');
                              if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 1500); }
                            }}
                            title="Click to copy Hash ID"
                          >
                            <div style={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Hash ID
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </div>
                            <div style={{ fontSize: '11px', color: '#8b5cf6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {(messageMetrics?.hash || selectedMessage?.hash || '').substring(0, 20)}...
                            </div>
                            <span id="copy-hash-toast" style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', fontSize: '10px', color: '#22c55e', opacity: 0, transition: 'opacity 0.2s' }}>Copied!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Backend Metrics Details */}
                  {messageMetrics?.metrics && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Detailed Metrics</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ padding: '10px', background: 'rgba(102, 204, 102, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Resonant Energy</div>
                          <div style={{ fontSize: '14px', color: '#66cc66', fontWeight: 500 }}>{((messageMetrics.metrics.resonant_energy || 0) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(51, 153, 255, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Evidence Score</div>
                          <div style={{ fontSize: '14px', color: '#3399ff', fontWeight: 500 }}>{((messageMetrics.metrics.evidence || 0) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(204, 102, 204, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Anchor Following</div>
                          <div style={{ fontSize: '14px', color: '#cc66cc', fontWeight: 500 }}>{((messageMetrics.metrics.anchor_following || 0) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Context Coherence</div>
                          <div style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 500 }}>{((messageMetrics.metrics.context_coherence || 0) * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Memory Utilization</div>
                          <div style={{ fontSize: '14px', color: '#8b5cf6', fontWeight: 500 }}>{((messageMetrics.metrics.memory_utilization || 0) * 100).toFixed(1)}%</div>
                        </div>
                        {messageMetrics.metrics.response_time_ms && (
                          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666' }}>Response Time</div>
                            <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{messageMetrics.metrics.response_time_ms}ms</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Sentiment & Emotion Analysis */}
                  {messageMetrics?.metrics && (messageMetrics.metrics.sentiment || messageMetrics.metrics.emotion) && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Sentiment Analysis</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {messageMetrics.metrics.sentiment && (
                          <div style={{ padding: '10px', background: messageMetrics.metrics.sentiment === 'positive' ? 'rgba(34, 197, 94, 0.1)' : messageMetrics.metrics.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666' }}>Sentiment</div>
                            <div style={{ fontSize: '14px', color: messageMetrics.metrics.sentiment === 'positive' ? '#22c55e' : messageMetrics.metrics.sentiment === 'negative' ? '#ef4444' : '#888', fontWeight: 500, textTransform: 'capitalize' }}>
                              {messageMetrics.metrics.sentiment} ({((messageMetrics.metrics.sentiment_confidence || 0) * 100).toFixed(0)}%)
                            </div>
                          </div>
                        )}
                        {messageMetrics.metrics.emotion && (
                          <div style={{ padding: '10px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666' }}>Emotion</div>
                            <div style={{ fontSize: '14px', color: '#ec4899', fontWeight: 500, textTransform: 'capitalize' }}>
                              {messageMetrics.metrics.emotion} ({((messageMetrics.metrics.emotion_confidence || 0) * 100).toFixed(0)}%)
                            </div>
                          </div>
                        )}
                        {messageMetrics.metrics.hallucination_risk_level && (
                          <div style={{ padding: '10px', background: messageMetrics.metrics.hallucination_risk_level === 'high' ? 'rgba(239, 68, 68, 0.1)' : messageMetrics.metrics.hallucination_risk_level === 'medium' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666' }}>Hallucination Risk</div>
                            <div style={{ fontSize: '14px', color: messageMetrics.metrics.hallucination_risk_level === 'high' ? '#ef4444' : messageMetrics.metrics.hallucination_risk_level === 'medium' ? '#fbbf24' : '#22c55e', fontWeight: 500, textTransform: 'capitalize' }}>
                              {messageMetrics.metrics.hallucination_risk_level} {(messageMetrics.metrics.hallucination_flags ?? 0) > 0 && `(${messageMetrics.metrics.hallucination_flags} flags)`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Agent Feedback Score */}
                  {messageMetrics?.metrics?.agent_feedback && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Agent Feedback</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Satisfaction Rate</div>
                          <div style={{ fontSize: '18px', color: messageMetrics.metrics.agent_feedback.satisfaction_rate > 0.7 ? '#22c55e' : messageMetrics.metrics.agent_feedback.satisfaction_rate > 0.5 ? '#eab308' : '#ef4444', fontWeight: 600 }}>
                            {((messageMetrics.metrics.agent_feedback.satisfaction_rate || 0) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Total Feedback</div>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#22c55e' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                              {messageMetrics.metrics.agent_feedback.positive_count || 0}
                            </span>
                            <span style={{ color: '#666' }}>/</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ef4444' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
                              {messageMetrics.metrics.agent_feedback.negative_count || 0}
                            </span>
                          </div>
                        </div>
                        {messageMetrics.metrics.agent_feedback.trend && (
                          <div style={{ padding: '10px', background: messageMetrics.metrics.agent_feedback.trend === 'improving' ? 'rgba(34, 197, 94, 0.1)' : messageMetrics.metrics.agent_feedback.trend === 'declining' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '11px', color: '#666' }}>Trend</div>
                            <div style={{ fontSize: '14px', color: messageMetrics.metrics.agent_feedback.trend === 'improving' ? '#22c55e' : messageMetrics.metrics.agent_feedback.trend === 'declining' ? '#ef4444' : '#888', fontWeight: 500, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {messageMetrics.metrics.agent_feedback.trend === 'improving' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
                              ) : messageMetrics.metrics.agent_feedback.trend === 'declining' ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></svg>
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                              )}
                              {messageMetrics.metrics.agent_feedback.trend}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DSID Trust Metrics */}
                  {messageMetrics?.metrics?.dsid && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        DSID Trust Metrics
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ padding: '10px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>T1 Score (Basic Trust)</div>
                          <div style={{ fontSize: '18px', color: (messageMetrics.metrics.dsid.t1_score || 0) > 0.7 ? '#22c55e' : '#eab308', fontWeight: 600 }}>
                            {((messageMetrics.metrics.dsid.t1_score || 0) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>T3 Score (Full Provenance)</div>
                          <div style={{ fontSize: '18px', color: (messageMetrics.metrics.dsid.t3_score || 0) > 0.5 ? '#8b5cf6' : '#666', fontWeight: 600 }}>
                            {((messageMetrics.metrics.dsid.t3_score || 0) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: messageMetrics.metrics.dsid.verification_status === 'passed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Verification Status</div>
                          <div style={{ fontSize: '14px', color: messageMetrics.metrics.dsid.verification_status === 'passed' ? '#22c55e' : '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
                            {messageMetrics.metrics.dsid.verification_status === 'passed' ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            )}
                            {messageMetrics.metrics.dsid.verification_status}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Lineage Depth</div>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{messageMetrics.metrics.dsid.lineage_depth || 0} messages</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hallucination Details */}
                  {messageMetrics?.metrics?.hallucination_details && messageMetrics.metrics.hallucination_details.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Hallucination Flags ({messageMetrics.metrics.hallucination_flags})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {messageMetrics.metrics.hallucination_details.map((flag: any, idx: number) => (
                          <div key={idx} style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500, textTransform: 'capitalize' }}>{flag.type}</div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{flag.content}</div>
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>Confidence: {((flag.confidence || 0) * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Context Anchors */}
                  {selectedMessage?.anchors && selectedMessage.anchors.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Context Anchors ({selectedMessage.anchors.length})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedMessage.anchors.map((anchor, idx) => (
                          <span key={idx} style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(255, 204, 51, 0.15)', color: '#ffcc33', borderRadius: '4px' }}>
                            {anchor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module Outputs */}
                  {selectedMessage?.modules && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase' }}>Hash Sphere Modules</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedMessage.modules.word_representation && (
                          <div style={{ padding: '10px', background: 'rgba(102, 204, 102, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Word Representation</div>
                            <div style={{ fontSize: '13px', color: '#66cc66' }}>
                              Confidence: {(selectedMessage.modules.word_representation.confidence * 100).toFixed(0)}%
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                              Method: {selectedMessage.modules.word_representation.method}
                            </div>
                          </div>
                        )}
                        {selectedMessage.modules.word_phrase && (
                          <div style={{ padding: '10px', background: 'rgba(204, 102, 204, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Word Phrase Analysis</div>
                            <div style={{ fontSize: '13px', color: '#cc66cc' }}>
                              Confidence: {(selectedMessage.modules.word_phrase.confidence * 100).toFixed(0)}%
                            </div>
                            {selectedMessage.modules.word_phrase.band_distribution && (
                              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', color: '#888' }}>α: {(selectedMessage.modules.word_phrase.band_distribution.alpha * 100).toFixed(0)}%</span>
                                <span style={{ fontSize: '10px', color: '#888' }}>β: {(selectedMessage.modules.word_phrase.band_distribution.beta * 100).toFixed(0)}%</span>
                                <span style={{ fontSize: '10px', color: '#888' }}>γ: {(selectedMessage.modules.word_phrase.band_distribution.gamma * 100).toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedMessage.modules.text_processing && (
                          <div style={{ padding: '10px', background: 'rgba(51, 153, 255, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Text Processing</div>
                            <div style={{ fontSize: '13px', color: '#3399ff' }}>
                              Status: {selectedMessage.modules.text_processing.available ? 'Available' : 'Unavailable'}
                            </div>
                            {selectedMessage.modules.text_processing.oov_words?.length > 0 && (
                              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                                OOV Words: {selectedMessage.modules.text_processing.oov_words.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Data State */}
                  {!selectedMessage?.modules && !selectedMessage?.anchors?.length && (!evidenceGraphData || evidenceGraphData.nodes.length === 0) && !messageMetrics && (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                        <path d="M3 3v18h18" />
                        <path d="M18 17V9" />
                        <path d="M13 17V5" />
                        <path d="M8 17v-3" />
                      </svg>
                      <div style={{ fontSize: '14px' }}>No detailed metrics available for this message</div>
                      <div style={{ fontSize: '12px', marginTop: '8px', color: '#555' }}>
                        Metrics are generated during AI processing
                      </div>
                    </div>
                  )}

                  {/* Evidence Graph - At Bottom */}
                  {evidenceGraphData && evidenceGraphData.nodes && evidenceGraphData.nodes.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>
                        Evidence Graph ({evidenceGraphData.node_count} nodes, {evidenceGraphData.edge_count} edges)
                      </div>
                      {/* Color Legend */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3399ff', display: 'inline-block' }} />
                          <span style={{ color: '#888' }}>Your Query</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#66cc66', display: 'inline-block' }} />
                          <span style={{ color: '#888' }}>AI Response</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffcc33', display: 'inline-block' }} />
                          <span style={{ color: '#888' }}>Context Anchors</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cc66cc', display: 'inline-block' }} />
                          <span style={{ color: '#888' }}>Long-term Memory</span>
                        </div>
                      </div>
                      <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
                        <EvidenceGraphVisualization graphData={evidenceGraphData} compact={true} />
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Metrics Explanation Modal */}
      {showUsagePanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999 }}>
          {/* Backdrop */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowUsagePanel(false)}
          />
          {/* Modal */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '85vh',
              zIndex: 100000,
              background: 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(20, 20, 22, 0.98) 100%)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              padding: '16px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Chat Metrics Explained
              </h3>
              <button
                onClick={() => setShowUsagePanel(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#888',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#888';
                }}
              >
                ×
              </button>
            </div>

            {/* Current Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '12px', 
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0ea5e9' }}>{usageStats.messages}</div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Messages</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{usageStats.tokens.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Tokens</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: usageStats.quality !== null ? (usageStats.quality > 0.7 ? '#22c55e' : usageStats.quality > 0.5 ? '#eab308' : '#ef4444') : '#666' }}>
                  {usageStats.quality !== null ? `${(usageStats.quality * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Quality</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: usageStats.hallucination !== null ? (usageStats.hallucination < 0.1 ? '#22c55e' : usageStats.hallucination < 0.3 ? '#eab308' : '#ef4444') : '#666' }}>
                  {usageStats.hallucination !== null ? `${(usageStats.hallucination * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Hallucination</div>
              </div>
            </div>

            {/* Metric Explanations - User-focused meaning, no implementation details */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                  Quality Score
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Measures how closely the response aligns with your stored context and prior knowledge.
                  Higher scores indicate better coherence and relevance to your conversation history.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  <strong>90-100%:</strong> Excellent | <strong>70-89%:</strong> Good | <strong>50-69%:</strong> Fair | <strong>&lt;50%:</strong> Poor
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ef4444' }}>⚠️ Hallucination Risk</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Estimates the likelihood that the response contains fabricated or unverified information.
                  Lower is better. Evaluated by assessing how well the response is supported by reliable sources and prior context.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  <strong>Low:</strong> Well-grounded | <strong>Moderate:</strong> Some claims may need verification | <strong>High:</strong> Verify claims independently
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#8b5cf6' }}>🔢 Token Usage</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Total tokens consumed by your conversation. Tokens are the basic units of text that AI models process.
                  Roughly 1 token ≈ 4 characters or ¾ of a word.
                </p>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  Input tokens (your messages) + Output tokens (AI responses) = Total tokens
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                  Memory Anchors
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Key concepts extracted from your conversations that help maintain context over time.
                  These anchors enable more relevant and personalized responses as you continue chatting.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', borderLeft: '4px solid #fbbf24' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                  Evidence Graph
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Visual representation of how information is connected. Nodes represent concepts, edges show relationships.
                  Provides insight into key concepts and relationships that informed the response.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', borderLeft: '4px solid #ec4899' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Sentiment & Emotion
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Detects the emotional tone of messages to help the AI respond more empathetically.
                  Understanding sentiment helps provide more contextually appropriate responses.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Context Coherence
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Measures how well the response relates to the overall conversation flow.
                  Higher coherence means the AI is staying on topic and maintaining logical continuity.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '12px', borderLeft: '4px solid #14b8a6' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#14b8a6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  Memory Utilization
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#ccc', lineHeight: 1.6 }}>
                  Shows how effectively your stored knowledge is being used in responses.
                  Higher utilization means the AI is drawing more from your personalized context.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 5: Metrics Dashboard Modal */}
      <MetricsDashboard 
        isOpen={showMetricsDashboard} 
        onClose={() => setShowMetricsDashboard(false)} 
      />

      {/* Phase 5: Memory Viewer Modal */}
      <MemoryViewer 
        isOpen={showMemoryViewer} 
        onClose={() => setShowMemoryViewer(false)} 
      />

      {/* Clusters/Groups Panel */}
      {showClustersSticker && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
          onClick={() => setShowClustersSticker(false)}
        >
          <div 
            style={{
              background: '#121212',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="19" cy="5" r="2" />
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="19" cy="19" r="2" />
                  <circle cx="5" cy="19" r="2" />
                  <line x1="12" y1="9" x2="12" y2="3" />
                  <line x1="14.5" y1="10.5" x2="17" y2="7" />
                  <line x1="9.5" y1="10.5" x2="7" y2="7" />
                  <line x1="14.5" y1="13.5" x2="17" y2="17" />
                  <line x1="9.5" y1="13.5" x2="7" y2="17" />
                </svg>
                Context Groups
              </h2>
              <button 
                onClick={() => setShowClustersSticker(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '24px' }}
              >
                ×
              </button>
            </div>

            {/* Memory Anchors */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Memory Anchors ({memoryAnchors.length})
              </h3>
              {memoryAnchors.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {memoryAnchors.map((anchor, idx) => (
                    <div
                      key={anchor.id || idx}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0ea5e9',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setInput(prev => prev + ` ${anchor.anchor_text} `);
                        setShowClustersSticker(false);
                      }}
                      title={`Importance: ${(anchor.importance_score * 100).toFixed(0)}%`}
                    >
                      {anchor.anchor_text}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  No memory anchors yet. Chat more to build context.
                </div>
              )}
            </div>

            {/* Resonance Clusters */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Resonance Clusters ({resonanceClusters.length})
              </h3>
              {resonanceClusters.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {resonanceClusters.map((cluster, idx) => (
                    <div
                      key={cluster.id || idx}
                      style={{
                        padding: '12px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#8b5cf6', marginBottom: '4px' }}>
                        {cluster.name || `Cluster ${idx + 1}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {cluster.count || cluster.items?.length || 0} items
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  No clusters formed yet. Clusters are created as related concepts emerge in your conversations.
                </div>
              )}
            </div>

            {/* Hash Sphere Toggle */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Hash Sphere Mode</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Use semantic hashing for context retrieval</div>
              </div>
              <button
                onClick={() => setUseHashSphere(!useHashSphere)}
                style={{
                  padding: '8px 16px',
                  background: useHashSphere ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${useHashSphere ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: '8px',
                  color: useHashSphere ? '#22c55e' : '#888',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {useHashSphere ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel - Positioned above the settings icon in bottom-left */}
      {showSettingsSticker && (
        <div 
          style={{
            position: 'fixed',
            bottom: '120px',
            left: '16px',
            zIndex: 99999,
          }}
        >
          <div 
            style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              width: '320px',
              maxHeight: '60vh',
              overflow: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Chat Settings
              </h2>
              <button 
                onClick={() => setShowSettingsSticker(false)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '24px' }}
              >
                ×
              </button>
            </div>

            {/* Display Settings */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Display
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Show Timestamps</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Display message timestamps</div>
                  </div>
                  <button
                    onClick={() => setShowTimestamps(!showTimestamps)}
                    style={{
                      padding: '6px 12px',
                      background: showTimestamps ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${showTimestamps ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: showTimestamps ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showTimestamps ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Provider Badges</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Show AI provider on messages</div>
                  </div>
                  <button
                    onClick={() => setShowProviderBadges(!showProviderBadges)}
                    style={{
                      padding: '6px 12px',
                      background: showProviderBadges ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${showProviderBadges ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: showProviderBadges ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showProviderBadges ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Validity Scores</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Show quality scores on messages</div>
                  </div>
                  <button
                    onClick={() => setShowValidityScores(!showValidityScores)}
                    style={{
                      padding: '6px 12px',
                      background: showValidityScores ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${showValidityScores ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: showValidityScores ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showValidityScores ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Message Actions</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Show copy, save, regenerate buttons</div>
                  </div>
                  <button
                    onClick={() => setShowMessageActions(!showMessageActions)}
                    style={{
                      padding: '6px 12px',
                      background: showMessageActions ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${showMessageActions ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: showMessageActions ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showMessageActions ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Message Metrics</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Show metrics and context buttons</div>
                  </div>
                  <button
                    onClick={() => setShowMessageMetrics(!showMessageMetrics)}
                    style={{
                      padding: '6px 12px',
                      background: showMessageMetrics ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${showMessageMetrics ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: showMessageMetrics ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {showMessageMetrics ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Align User Messages Right</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Position your messages on the right side</div>
                  </div>
                  <button
                    onClick={() => setAlignUserMessagesRight(!alignUserMessagesRight)}
                    style={{
                      padding: '6px 12px',
                      background: alignUserMessagesRight ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${alignUserMessagesRight ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: alignUserMessagesRight ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {alignUserMessagesRight ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Compact Mode</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Reduce message spacing</div>
                  </div>
                  <button
                    onClick={() => setCompactMode(!compactMode)}
                    style={{
                      padding: '6px 12px',
                      background: compactMode ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${compactMode ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: compactMode ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {compactMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Behavior Settings */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Behavior
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Auto Save</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Automatically save conversations</div>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    style={{
                      padding: '6px 12px',
                      background: autoSave ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${autoSave ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: autoSave ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {autoSave ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Sound Notifications</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Play sound on new messages</div>
                  </div>
                  <button
                    onClick={() => setSoundNotifications(!soundNotifications)}
                    style={{
                      padding: '6px 12px',
                      background: soundNotifications ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${soundNotifications ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: soundNotifications ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {soundNotifications ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Keyboard Shortcuts</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Enable keyboard shortcuts</div>
                  </div>
                  <button
                    onClick={() => setKeyboardShortcuts(!keyboardShortcuts)}
                    style={{
                      padding: '6px 12px',
                      background: keyboardShortcuts ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${keyboardShortcuts ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '6px',
                      color: keyboardShortcuts ? '#22c55e' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {keyboardShortcuts ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Font Size
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size as 'small' | 'medium' | 'large')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: fontSize === size ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${fontSize === size ? '#0ea5e9' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '8px',
                      color: fontSize === size ? '#0ea5e9' : '#888',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts Info */}
            <div style={{ padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '12px', borderLeft: '4px solid #0ea5e9' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0ea5e9' }}>Keyboard Shortcuts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div><kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>Enter</kbd> Send message</div>
                <div><kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>Shift+Enter</kbd> New line</div>
                <div><kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>Ctrl+N</kbd> New chat</div>
                <div><kbd style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>Ctrl+/</kbd> Toggle sidebar</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResonantChatPage;
