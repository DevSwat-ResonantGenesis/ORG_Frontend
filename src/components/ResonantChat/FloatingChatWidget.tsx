import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSession } from '@/utils/auth';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';
import { sendResonantMessage, getChatHistory, createChat, type ResonantChatResponse } from '@/api/resonantChat';
import { triggerChatSync } from '@/context/ChatContext';
import { logger } from '@/utils/logger';
import { useToastContext } from '@/context/ToastContext';
import { SendIcon, CloseIcon, MinimizeIcon, MaximizeIcon, ChatIcon } from '@/components/Icons/ResonantChatIcons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './FloatingChatWidget.module.css';
import messageStyles from './FloatingChatWidgetMessages.module.css';
import { ModuleOutputs } from '@/components/ResonantChat/ModuleOutputs';
import { VoiceInput } from '@/components/ResonantChat/VoiceInput';

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
  // DSID-P Protocol Fields
  semanticCluster?: string; // e.g., "finance.trading"
  trustTier?: 'T0' | 'T1' | 'T2' | 'T3' | 'T4'; // Agent trust level
  governanceStatus?: 'passed' | 'flagged' | 'blocked' | 'pending'; // Governance check result
  complianceTags?: string[]; // e.g., ["GDPR", "HIPAA"]
  driftScore?: number; // Semantic drift score 0.0-1.0
  auditHash?: string; // Immutable audit entry reference
  lifecycleState?: string; // Agent lifecycle state
  generatedImages?: Array<{ url?: string; base64_data?: string; revised_prompt?: string; model: string; size: string }>;
  webSearchResults?: Array<{ title: string; url: string; snippet: string; source: string }>;
}

interface FloatingChatWidgetProps {
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideLauncher?: boolean;
}

// Use same storage key as ResonantChatPage for sync
const chatStorageKey = 'resonant-chat-current-conversation';
const messagesStorageKey = 'resonant-chat-live-messages'; // For live sync between widget and main page

const getChatIdFromResponse = (response: any): string | null =>
  response?.id || response?.chatId || response?.chat_id || response?.chat?.id || null;

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ className, isOpen: controlledOpen, onOpenChange, hideLauncher = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isResonantChatPage = location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');
  const session = getSession();
  const isLoggedIn = isAuthenticated() && !!session;
  const { success, error: showError } = useToastContext();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange?.(open);
  };
  // Messages are loaded ONLY from backend - no localStorage backup
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const inputValueRef = useRef(''); // Track current input for voice input
  const [isLoading, setIsLoading] = useState(false);
  
  // Keep inputValueRef in sync
  useEffect(() => {
    inputValueRef.current = input;
  }, [input]);
  // Use the same conversation ID as the full chat page for continuity
  // SECURITY: Only load if user hasn't changed
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    const sessionData = getSessionData();
    // Use userId from session (UUID from backend) for proper user identification
    const currentUserId = sessionData?.userId || sessionData?.email;
    const storedUserId = localStorage.getItem('resonant-chat-user-id');
    
    if (currentUserId && storedUserId && currentUserId !== storedUserId) {
      // Clear stale conversation ID
      localStorage.removeItem(chatStorageKey);
      return null;
    }
    
    return localStorage.getItem(chatStorageKey);
  });
  
  // Drag state - default to bottom-left corner
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('resonant-chat-widget-position');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure position is valid
        if (parsed.x >= 0 && parsed.y >= 0) {
          return parsed;
        }
      } catch {
        // Fall through to default
      }
    }
    // Default: bottom-left corner (24px from left, 24px from bottom)
    // Store as top-based Y coordinate
    return { x: window.innerWidth - 64 - 24, y: Math.max(24, Math.floor(window.innerHeight / 2) - 32) }; // 24px from right, vertically centered
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  
  // Resize state
  const [panelHeight, setPanelHeight] = useState<number>(() => {
    const saved = localStorage.getItem('resonant-chat-widget-height');
    return saved ? parseInt(saved, 10) : 600;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Load existing conversation from localStorage - DO NOT auto-create new conversations
  // New conversations should only be created when user explicitly starts a new chat
  useEffect(() => {
    if (!isLoggedIn) return;

    // Only load existing conversation, never auto-create
    const conversationId = localStorage.getItem(chatStorageKey);
    if (conversationId) {
      setCurrentConversationId(conversationId);
    }
    // If no conversation exists, user can start one by typing a message
  }, [isLoggedIn]);

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      logger.info('[FloatingChatWidget] Widget opened, loading from backend');
      
      // Sync conversation ID from localStorage (just the ID, not messages)
      const latestConversationId = localStorage.getItem(chatStorageKey);
      if (latestConversationId && latestConversationId !== currentConversationId) {
        setCurrentConversationId(latestConversationId);
      }
      
      // Load messages from backend
      if (latestConversationId || currentConversationId) {
        loadChatHistory();
      }
    }
  }, [isOpen, isLoggedIn]);

  // Sync conversation ID from localStorage (when changed from full chat page)
  useEffect(() => {
    const syncConversationId = () => {
      // Sync conversation ID only (not messages - those come from backend)
      const newConversationId = localStorage.getItem(chatStorageKey);
      if (newConversationId !== currentConversationId) {
        logger.info('Conversation ID changed:', { old: currentConversationId, new: newConversationId });
        setCurrentConversationId(newConversationId);
        // Reload messages from backend when conversation changes
        if (isOpen && newConversationId) {
          loadChatHistory();
        }
      }
    };

    // Listen for storage changes (cross-tab)
    window.addEventListener('storage', syncConversationId);

    return () => {
      window.removeEventListener('storage', syncConversationId);
    };
  }, [currentConversationId, isOpen, isLoggedIn]);

  // Listen for chat sync events from the full chat page
  useEffect(() => {
    const handleChatSync = () => {
      logger.info('[FloatingChatWidget] Received chat sync event');
      // Sync conversation ID from localStorage
      const latestConversationId = localStorage.getItem(chatStorageKey);
      if (latestConversationId && latestConversationId !== currentConversationId) {
        setCurrentConversationId(latestConversationId);
      }
      // Try to load messages from localStorage first (live sync)
      const liveMessages = localStorage.getItem(messagesStorageKey);
      if (liveMessages) {
        try {
          const parsed = JSON.parse(liveMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formattedMessages: Message[] = parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formattedMessages);
            logger.info('[FloatingChatWidget] ✅ Loaded messages from localStorage live sync:', formattedMessages.length);
            return;
          }
        } catch (e) {
          logger.warn('[FloatingChatWidget] Failed to parse live messages from localStorage');
        }
      }
      // Fallback to backend if no live messages
      if (isOpen && (latestConversationId || currentConversationId)) {
        loadChatHistory();
      }
    };

    window.addEventListener('resonant-chat-sync', handleChatSync);
    return () => window.removeEventListener('resonant-chat-sync', handleChatSync);
  }, [isOpen, isLoggedIn, currentConversationId]);

  // Live sync messages from localStorage (updated by ResonantChatPage)
  // Use ref to avoid re-render loop - messages dependency was causing performance issues
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  
  useEffect(() => {
    const syncMessagesFromStorage = () => {
      const liveMessages = localStorage.getItem(messagesStorageKey);
      if (liveMessages) {
        try {
          const parsed = JSON.parse(liveMessages);
          if (Array.isArray(parsed)) {
            const formattedMessages: Message[] = parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            // Only update if messages changed - use ref to avoid stale closure
            if (JSON.stringify(formattedMessages.map(m => m.id)) !== JSON.stringify(messagesRef.current.map(m => m.id))) {
              setMessages(formattedMessages);
              logger.info('[FloatingChatWidget] 🔄 Live sync: Updated messages from localStorage');
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };

    // Listen for storage changes (from ResonantChatPage)
    window.addEventListener('storage', syncMessagesFromStorage);
    
    // Listen for custom sync event instead of polling - much more efficient
    window.addEventListener('resonant-chat-sync', syncMessagesFromStorage);

    return () => {
      window.removeEventListener('storage', syncMessagesFromStorage);
      window.removeEventListener('resonant-chat-sync', syncMessagesFromStorage);
    };
  }, []); // Empty dependency - use ref for messages to avoid re-render loop

  // Auto-scroll to bottom when new messages arrive or when opening
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [messages, isOpen]);

  // Scroll to bottom when conversation loads
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      setTimeout(() => {
        const container = messagesEndRef.current?.parentElement?.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 200);
    }
  }, [currentConversationId, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('resonant-chat-widget-position', JSON.stringify(position));
  }, [position]);

  // Save height to localStorage
  useEffect(() => {
    localStorage.setItem('resonant-chat-widget-height', panelHeight.toString());
  }, [panelHeight]);

  // Handle drag start (mouse)
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    // Don't start drag if clicking on a button
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.panelHeader')) {
      return;
    }
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    setHasDragged(false);
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Handle touch drag start (mobile)
  const handleTouchDragStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button') && !target.closest('.panelHeader')) {
      return;
    }
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    setHasDragged(false);
  }, []);

  // Handle drag (mouse)
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    // Calculate Y from bottom (invert the calculation)
    const widgetHeight = isOpen ? panelHeight : 64;
    const newYFromTop = e.clientY - dragOffset.y;
    const newYFromBottom = window.innerHeight - newYFromTop - widgetHeight;

    // Constrain to viewport - account for mobile
    const isNarrowViewport = window.innerWidth <= 768;
    const widgetWidth = isNarrowViewport ? (isOpen ? window.innerWidth - 32 : 56) : (isOpen ? 420 : 64);
    
    const maxX = window.innerWidth - widgetWidth;
    const minYFromBottom = 24;
    const maxYFromBottom = window.innerHeight - widgetHeight - 24;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedYFromBottom = Math.max(minYFromBottom, Math.min(newYFromBottom, maxYFromBottom));
    const constrainedY = window.innerHeight - constrainedYFromBottom - widgetHeight;

    setPosition({ x: constrainedX, y: constrainedY });
    if (!hasDragged) {
      setHasDragged(true);
    }
  }, [isDragging, dragOffset, isOpen, panelHeight, hasDragged]);

  // Handle touch drag (mobile)
  const handleTouchDrag = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    const newX = touch.clientX - dragOffset.x;
    const widgetHeight = isOpen ? panelHeight : 50;
    const newYFromTop = touch.clientY - dragOffset.y;
    const newYFromBottom = window.innerHeight - newYFromTop - widgetHeight;

    // Constrain to viewport - account for mobile
    const isNarrowViewport = window.innerWidth <= 768;
    const widgetWidth = isNarrowViewport ? (isOpen ? window.innerWidth - 32 : 56) : (isOpen ? 420 : 64);
    
    const maxX = window.innerWidth - widgetWidth;
    const minYFromBottom = 24; // Minimum 24px from bottom
    const maxYFromBottom = window.innerHeight - widgetHeight - 24;
    
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedYFromBottom = Math.max(minYFromBottom, Math.min(newYFromBottom, maxYFromBottom));
    // Convert back to top-based Y for storage
    const constrainedY = window.innerHeight - constrainedYFromBottom - widgetHeight;

    setPosition({ x: constrainedX, y: constrainedY });
    if (!hasDragged) {
      setHasDragged(true);
    }
  }, [isDragging, dragOffset, isOpen, panelHeight, hasDragged]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Reset hasDragged after a delay to prevent accidental clicks
    setTimeout(() => setHasDragged(false), 200);
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(panelHeight);
    e.preventDefault();
    e.stopPropagation();
  }, [panelHeight]);

  // Handle resize - handle is at TOP, drag UP = bigger, drag DOWN = smaller
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaY = resizeStartY - e.clientY; // Drag up = positive = bigger
    const newHeight = resizeStartHeight + deltaY;
    
    // Constrain height between min and max
    const minHeight = 300;
    const maxHeight = Math.min(window.innerHeight - 100, 800);
    
    const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
    setPanelHeight(constrainedHeight);
  }, [isResizing, resizeStartY, resizeStartHeight]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add global mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      // Touch events for mobile
      window.addEventListener('touchmove', handleTouchDrag, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      window.addEventListener('touchcancel', handleDragEnd);
      document.body.style.userSelect = 'none';
      
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchDrag);
        window.removeEventListener('touchend', handleDragEnd);
        window.removeEventListener('touchcancel', handleDragEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleDrag, handleTouchDrag, handleDragEnd]);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  // Show widget on all pages (including resonant-chat page for consistency)
  // Users can use either the full page or the widget

  const loadChatHistory = async () => {
    // Always get the latest conversation ID from localStorage (synced with ResonantChatPage)
    const conversationId = localStorage.getItem(chatStorageKey) || currentConversationId;
    if (!conversationId || !isLoggedIn) {
      // If no conversation ID, clear messages
      if (!conversationId) {
        setMessages([]);
      }
      return;
    }
    
    // Update state if needed
    if (conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
    }
    
    try {
      logger.info('Loading chat history for conversation:', conversationId);
      const history = await getChatHistory(conversationId);
      logger.info('Chat history loaded:', history);
      
      if (history && history.messages && Array.isArray(history.messages)) {
        const formattedMessages: Message[] = history.messages.map((msg: any) => {
          // Ensure content is always a string
          let content = '';
          if (msg.content) {
            content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
          }
          
          return {
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role || 'assistant',
            content: content,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            aiProvider: msg.aiProvider,
            validity: msg.validity,
            sources: msg.sources,
            evidence_graph: msg.evidence_graph,
            hash: msg.hash,
            anchors: msg.anchors,
            resonanceScore: msg.resonanceScore,
            xyz: msg.xyz,
            modules: msg.modules,
            metrics: msg.metrics,
            generatedImages: msg.generatedImages,
            webSearchResults: msg.webSearchResults,
          };
        });
        logger.info('Formatted messages:', formattedMessages.length);
        setMessages(formattedMessages);
      } else {
        logger.warn('No messages in history or invalid format');
        setMessages([]);
      }
    } catch (err) {
      logger.error('Failed to load chat history', err);
      // Don't clear messages on error, just log it
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!isLoggedIn) {
      showError('Please log in to use Resonant Chat');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Create conversation if needed - use same key as full chat page
      let conversationId = currentConversationId;
      if (!conversationId) {
        const newChat = await createChat();
        conversationId = newChat.id;
        setCurrentConversationId(conversationId);
        if (conversationId) localStorage.setItem(chatStorageKey, conversationId);
      }

      // Send message
      logger.info('[FloatingChatWidget] Sending message to backend...');
      const response: ResonantChatResponse = await sendResonantMessage({
        message: currentInput,
        chatId: conversationId || undefined,
        context: {
          previousMessages: messages.slice(-5).map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        },
        preferred_provider: 'auto',
        use_rag: false, // Use Hash Sphere for logged-in users
      });
      
      logger.info('[FloatingChatWidget] Response received:', response);

      // Handle tool results (e.g., navigation)
      if (response.toolResults && response.toolResults.length > 0) {
        for (const toolResult of response.toolResults) {
          if (toolResult.success && toolResult.result?.action === 'navigate' && toolResult.result?.url) {
            logger.info('[FloatingChatWidget] Navigation tool executed:', toolResult.result.url);
            // Use window.location for navigation
            window.location.href = toolResult.result.url;
          }
        }
      }

      // Ensure content is always a string - response.message is a ResonantChatMessage object
      let assistantContent = '';
      if (response.message?.content) {
        assistantContent = typeof response.message.content === 'string' 
          ? response.message.content 
          : JSON.stringify(response.message.content);
        logger.info('[FloatingChatWidget] Assistant content:', assistantContent.substring(0, 100));
      } else {
        assistantContent = 'No response received';
        logger.warn('[FloatingChatWidget] No content in response.message');
      }

      const assistantMessage: Message = {
        id: response.message?.id || crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        aiProvider: response.aiProvider,
        hash: response.hash,
        anchors: response.anchors,
        resonanceScore: response.resonanceScore,
        xyz: response.message?.xyz,
        generatedImages: response.generatedImages,
        webSearchResults: response.webSearchResults,
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);
      
      // HYBRID SYNC: Save messages to localStorage for live sync with ResonantChatPage
      const messagesToSync = updatedMessages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      }));
      localStorage.setItem(messagesStorageKey, JSON.stringify(messagesToSync));
      
      // Trigger sync to notify other chat components (e.g., full chat page)
      triggerChatSync();
      window.dispatchEvent(new CustomEvent('resonant-chat-sync'));
      
      success('Message sent successfully');
    } catch (err: any) {
      logger.error('Failed to send message', err);
      showError(err?.response?.data?.detail || err?.message || 'Failed to send message');
      
      // Remove user message on error
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFullChat = () => {
    // Conversation ID is already shared via localStorage
    navigate('/resonant-chat');
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem(chatStorageKey);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (isMobile && isResonantChatPage) return null;

  if (hideLauncher && !isOpen) return null;

  return (
    <div 
      className={`${styles.floatingWidget} ${className || ''} ${isDragging ? styles.dragging : ''} ${isResizing ? styles.resizing : ''}`}
      style={{
        left: isMobile ? '16px' : `${isOpen ? Math.max(16, Math.min(position.x, window.innerWidth - 396)) : position.x}px`,
        bottom: isMobile ? '90px' : `${window.innerHeight - position.y - (isOpen ? panelHeight : 64)}px`,
        top: 'auto'
      }}
    >
      {/* Floating Button */}
      {!hideLauncher && (
      <button
        ref={buttonRef}
        className={styles.floatingButton}
        onTouchStart={(e) => {
          if (isMobile) {
            if (isOpen) {
              handleClose();
            } else {
              setIsOpen(true);
            }
            return;
          }
          // Touch drag for mobile
          const touch = e.touches[0];
          if (!touch) return;
          
          const target = e.target as HTMLElement;
          if (!target.closest(`.${styles.messageBadge}`)) {
            const startX = touch.clientX;
            const startY = touch.clientY;
            let moved = false;
            
            const handleTouchMove = (moveEvent: TouchEvent) => {
              const moveTouch = moveEvent.touches[0];
              if (!moveTouch) return;
              
              const deltaX = Math.abs(moveTouch.clientX - startX);
              const deltaY = Math.abs(moveTouch.clientY - startY);
              
              if (deltaX > 5 || deltaY > 5) {
                if (!moved) {
                  moved = true;
                  setHasDragged(true);
                  const container = buttonRef.current as HTMLElement;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const offsetX = startX - rect.left;
                    const offsetY = startY - rect.top;
                    setDragOffset({ x: offsetX, y: offsetY });
                    setIsDragging(true);
                  }
                  window.removeEventListener('touchmove', handleTouchMove);
                  window.removeEventListener('touchend', handleTouchEnd);
                }
              }
            };
            
            const handleTouchEnd = () => {
              window.removeEventListener('touchmove', handleTouchMove);
              window.removeEventListener('touchend', handleTouchEnd);
              
              if (!moved) {
                if (isOpen) {
                  handleClose();
                } else {
                  setIsOpen(true);
                }
              }
            };
            
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
          }
        }}
        onMouseDown={(e) => {
          if (isMobile) {
            if (isOpen) {
              handleClose();
            } else {
              setIsOpen(true);
            }
            return;
          }
          // Only start drag if not clicking on badge
          const target = e.target as HTMLElement;
          if (!target.closest(`.${styles.messageBadge}`)) {
            const startX = e.clientX;
            const startY = e.clientY;
            let moved = false;
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = Math.abs(moveEvent.clientX - startX);
              const deltaY = Math.abs(moveEvent.clientY - startY);
              
              // If moved more than 5px, it's a drag - use global drag handler
              if (deltaX > 5 || deltaY > 5) {
                if (!moved) {
                  moved = true;
                  setHasDragged(true);
                  // Start the actual drag using global handler
                  const container = buttonRef.current as HTMLElement;
                  if (container) {
                    const rect = container.getBoundingClientRect();
                    const offsetX = startX - rect.left;
                    const offsetY = startY - rect.top;
                    setDragOffset({ x: offsetX, y: offsetY });
                    setIsDragging(true);
                  }
                  // Remove local listeners - global handlers will take over
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                }
              }
            };
            
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
              
              // If we didn't drag, toggle the chat
              if (!moved) {
                if (isOpen) {
                  handleClose();
                } else {
                  setIsOpen(true);
                }
              }
            };
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }
        }}
        aria-label={isOpen ? "Close Resonant Chat" : "Open Resonant Chat"}
        title={isOpen ? "Close chat (Click to close, drag to move)" : "Open Resonant Chat (Click to open, drag to move)"}
        style={{ cursor: isMobile ? 'pointer' : isDragging ? 'grabbing' : 'grab' }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
        {!isOpen && messages.length > 0 && (
          <span 
            className={styles.messageBadge} 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobile) {
                handleOpenFullChat();
              } else {
                setIsOpen(true);
              }
            }}
          >
            {messages.length}
          </span>
        )}
      </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          className={styles.chatPanel}
          style={{ height: `${panelHeight}px` }}
        >
          <div className={styles.chatPanelInner}>
            {/* Header */}
            <div 
              className={styles.panelHeader}
              onMouseDown={isMobile ? undefined : handleDragStart}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
            <div className={styles.headerLeft} onMouseDown={(e) => e.stopPropagation()}>
              <svg className={styles.headerIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className={styles.headerTitle}>Resonant Chat</span>
              {messages.length > 0 && (
                <span className={styles.messageCount}>{messages.length} messages</span>
              )}
            </div>
            <div className={styles.headerActions} onMouseDown={(e) => e.stopPropagation()}>
              <button
                className={styles.headerButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                aria-label="Close chat"
                title="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area - Using dedicated message styles */}
          <div className={messageStyles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.emptyState}>
                    <ChatIcon className={styles.emptyIcon} />
                    <p className={styles.emptyText}>
                      Start a conversation with Resonant Chat
                    </p>
                    <p className={styles.emptySubtext}>
                      Ask questions, get insights, or continue your previous conversation
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`${messageStyles.message} ${messageStyles[msg.role]}`}
                      >
                        {msg.role === 'assistant' && (msg.aiProvider || msg.validity !== undefined || msg.resonanceScore !== undefined || msg.hash) && (
                          <div className={messageStyles.messageHeader}>
                            {msg.aiProvider && (
                              <span 
                                className={messageStyles.providerBadge}
                                title={`Agent/Provider: ${msg.aiProvider}${msg.aiProvider.startsWith('agent_') || msg.aiProvider.startsWith('team_') ? '\nClick hash to copy full ID' : ''}`}
                              >
                                {msg.aiProvider.startsWith('agent_') ? '🤖 ' : msg.aiProvider.startsWith('team_') ? '👥 ' : ''}
                                {msg.aiProvider}
                              </span>
                            )}
                            {msg.validity !== undefined && (
                              <span className={messageStyles.validityScore}>Validity: {(msg.validity * 100).toFixed(1)}%</span>
                            )}
                            {msg.resonanceScore !== undefined && (
                              <span className={messageStyles.validityScore} style={{ marginLeft: '8px' }}>
                                Quality: {(msg.resonanceScore * 100).toFixed(1)}%
                              </span>
                            )}
                            {msg.hash && (
                              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(msg.hash || '');
                                    success(`Full hash copied: ${msg.hash}`);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontFamily: 'monospace',
                                    color: 'var(--text-tertiary)',
                                  }}
                                  title={`Full Hash: ${msg.hash}\nClick to copy full hash`}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                  </svg>
                                  {msg.hash.slice(0, 8)}...
                                </button>
                                <button
                                  onClick={() => navigate(`/control-plane/live?agent=${msg.hash}`)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    color: 'var(--color-primary-400)',
                                  }}
                                  title="View in Live Monitor"
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <circle cx="12" cy="12" r="3"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className={messageStyles.messageContent}>
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
                                    className={messageStyles.codeBlock}
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={messageStyles.inlineCode} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => <p className={messageStyles.markdownParagraph}>{children}</p>,
                              ul: ({ children }) => <ul className={messageStyles.markdownList}>{children}</ul>,
                              ol: ({ children }) => <ol className={messageStyles.markdownList}>{children}</ol>,
                              li: ({ children }) => <li className={messageStyles.markdownListItem}>{children}</li>,
                              h1: ({ children }) => <h1 className={messageStyles.markdownHeading}>{children}</h1>,
                              h2: ({ children }) => <h2 className={messageStyles.markdownHeading}>{children}</h2>,
                              h3: ({ children }) => <h3 className={messageStyles.markdownHeading}>{children}</h3>,
                              blockquote: ({ children }) => <blockquote className={messageStyles.markdownBlockquote}>{children}</blockquote>,
                              a: ({ href, children }) => {
                                const isInternal = typeof href === 'string' && href.startsWith('/') && !href.startsWith('//');
                                if (isInternal) {
                                  return (
                                    <a
                                      href={href}
                                      className={messageStyles.markdownLink}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigate(href);
                                      }}
                                    >
                                      {children}
                                    </a>
                                  );
                                }
                                return (
                                  <a href={href} className={messageStyles.markdownLink} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {typeof msg.content === 'string' ? msg.content : String(msg.content || '')}
                          </ReactMarkdown>
                        </div>
                        {msg.role === 'assistant' && msg.webSearchResults && msg.webSearchResults.length > 0 && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: 'rgba(14, 165, 233, 0.08)',
                            borderRadius: '10px',
                            border: '1px solid rgba(14, 165, 233, 0.18)',
                          }}>
                            <div style={{
                              fontSize: '12px',
                              color: 'rgba(14, 165, 233, 0.9)',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              </svg>
                              Web Search Results ({msg.webSearchResults.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {msg.webSearchResults.map((r, idx) => (
                                <div key={`${msg.id}-ws-${idx}`} style={{
                                  padding: '8px',
                                  borderRadius: '8px',
                                  background: 'rgba(0, 0, 0, 0.15)',
                                  border: '1px solid rgba(255, 255, 255, 0.06)',
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <a
                                        href={r.url}
                                        className={messageStyles.markdownLink}
                                        target={r.url?.startsWith('/') ? undefined : '_blank'}
                                        rel={r.url?.startsWith('/') ? undefined : 'noopener noreferrer'}
                                        onClick={(e) => {
                                          if (r.url?.startsWith('/')) {
                                            e.preventDefault();
                                            navigate(r.url);
                                          }
                                        }}
                                        style={{ fontWeight: 600 }}
                                      >
                                        {r.title || r.url}
                                      </a>
                                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{r.source}</div>
                                    </div>
                                    {r.url && (
                                      <button
                                        className={styles.sendButton}
                                        onClick={() => {
                                          if (r.url.startsWith('/')) {
                                            navigate(r.url);
                                          } else {
                                            window.open(r.url, '_blank', 'noopener,noreferrer');
                                          }
                                        }}
                                        style={{ padding: '6px 10px' }}
                                      >
                                        Open
                                      </button>
                                    )}
                                  </div>
                                  {r.snippet && (
                                    <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: 1.4, opacity: 0.9 }}>
                                      {r.snippet}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Hash Sphere Module Outputs */}
                        {msg.role === 'assistant' && msg.modules && (
                          <ModuleOutputs modules={msg.modules} collapsed={true} />
                        )}
                      </div>
                    ))
                )}
                {isLoading && (
                  <div className={`${messageStyles.message} ${messageStyles.assistant}`}>
                    <div className={messageStyles.messageContent}>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputContainer}>
                <div className={styles.inputBar}>
                  <div className={styles.inputBarMainRow}>
                    <textarea
                      ref={inputRef}
                      className={styles.inputField}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize textarea
                        const textarea = e.target as HTMLTextAreaElement;
                        textarea.style.height = 'auto';
                        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      rows={1}
                      disabled={isLoading}
                    />
                    <VoiceInput
                      onTranscript={(text) => {
                        const currentValue = inputValueRef.current;
                        const newValue = currentValue + (currentValue ? ' ' : '') + text;
                        setInput(newValue);
                        inputRef.current?.focus();
                      }}
                      disabled={isLoading}
                    />
                    <button
                      className={styles.sendButton}
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      aria-label="Send message"
                      title="Send message"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                  {messages.length > 0 && (
                    <div className={styles.inputTopRow}>
                      <button
                        className={styles.newChatButton}
                        onClick={handleNewChat}
                        title="Start new chat"
                      >
                        New Chat
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
          
          {/* Resize Handle */}
          <div
            ref={resizeHandleRef}
            className={styles.resizeHandle}
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent panel drag when resizing
              handleResizeStart(e);
            }}
            title="Drag to resize height"
          >
            <div className={styles.resizeHandleLine}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatWidget;
