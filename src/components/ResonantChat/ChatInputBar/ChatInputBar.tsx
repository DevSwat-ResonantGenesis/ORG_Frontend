import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArchiveIcon,
 DeleteIcon,
  CloseIcon,
  LightbulbIcon,
  PenIcon,
  FileIcon,
  SearchIcon,
  ChevronDownIcon,
  ConversationIcon,
  HistoryIcon,
  PlusIcon,
} from '@/components/Icons/ResonantChatIcons';
import { VoiceInput } from '@/components/ResonantChat/VoiceInput';
import SkillsToolbar from '@/components/ResonantChat/SkillsToolbar/SkillsToolbar';
import styles from './ChatInputBar.module.css';

const TeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

type SpeechLanguagePreference = 'auto' | 'en-US' | 'ru-RU' | 'uk-UA' | 'ar-SA';

const MemoryLibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const LLMSelectorIcon = () => (
  <span className={styles.llmSelectorIcon} aria-hidden="true">
    <span className={styles.llmSelectorHalfLeft}>
      <MemoryLibraryIcon />
    </span>
    <span className={styles.llmSelectorHalfRight}>
      <TeamIcon />
    </span>
  </span>
);

interface Memory {
  id: string;
  name?: string;
  content?: string;
}

interface Conversation {
  id: string;
  title?: string;
  created_at?: string;
}

interface ChatInputBarProps {
  // Core
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;

  embedded?: boolean;
  
  // Sidebar
  sidebarOpen?: boolean;
  
  // Provider
  selectedProvider?: string;
  onProviderChange?: (provider: string) => void;
  availableProviders?: string[];

  // UI Variants
  hideProviderSelector?: boolean;
  voiceInInput?: boolean;
  voiceIconSize?: number;
  providerStats?: Record<string, { health: string; latency?: number; available?: boolean }>;
  
  // Agent Mode
  agentMode?: boolean;
  onToggleAgentMode?: () => void;
  selectedAgent?: string | null;
  onSelectAgent?: (agent: string | null) => void;
  agents?: Array<{ hash: string; name: string }>;
  selectedTeamId?: string | null;
  onSelectTeam?: (teamId: string | null) => void;
  teams?: Array<{ id: string; name: string }>;
  
  // Actions
  onNewChat?: () => void;
  onClearChat?: () => void;
  onBuild?: () => void;
  onOpenIDE?: () => void;
  onAttachFile?: () => void;
  splitViewEnabled?: boolean;
  splitViewWidth?: number;
  
  // Attached Files
  attachedFiles?: File[];
  onRemoveFile?: (index: number) => void;
  
  // Memory
  memories?: Memory[];
  onShowMemoryLibrary?: () => void;
  showMemoryLibrary?: boolean;
  onCloseMemoryLibrary?: () => void;
  onMemoryClick?: (memory: Memory) => void;
  
  // Conversations
  conversations?: Conversation[];
  onShowConversations?: () => void;
  onEnabledSkillsChange?: (enabledSkillIds: string[]) => void;
  showConversations?: boolean;
  onCloseConversations?: () => void;
  onConversationClick?: (conversation: Conversation) => void;
  currentConversationId?: string | null;
  
  // Search
  onShowSearch?: () => void;
  
  // Settings
  onShowSettings?: () => void;
  showSettings?: boolean;
  
  // Mentions
  onMentionSelect?: (mention: string) => void;
  
  // Share/Copy Chat
  onShareChat?: () => void;
  onCopyChat?: () => void;

  onVoiceConversation?: () => void;

  ttsText?: string;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChange,
  onSend,
  isLoading = false,
  disabled = false,
  placeholder = "Type a goal. Hit @ to pull anchors inline.",
  embedded = false,
  sidebarOpen = false,
  selectedProvider = 'auto',
  onProviderChange = () => {},
  availableProviders,
  hideProviderSelector = false,
  voiceInInput = false,
  voiceIconSize = 18,
  providerStats = {},
  agentMode = false,
  onToggleAgentMode,
  selectedAgent,
  onSelectAgent,
  agents = [],
  selectedTeamId,
  onSelectTeam,
  teams = [],
  onNewChat,
  onClearChat,
  onBuild,
  onOpenIDE,
  onAttachFile,
  splitViewEnabled = false,
  splitViewWidth = 50,
  attachedFiles = [],
  onRemoveFile,
  memories = [],
  onShowMemoryLibrary,
  showMemoryLibrary = false,
  onCloseMemoryLibrary,
  onMemoryClick,
  conversations = [],
  onShowConversations,
  onEnabledSkillsChange,
  showConversations = false,
  onCloseConversations,
  onConversationClick,
  currentConversationId,
  onShowSearch,
  onShowSettings,
  showSettings = false,
  onShareChat,
  onCopyChat,
  onVoiceConversation,
  ttsText,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const agentButtonRef = useRef<HTMLButtonElement>(null);
  const providerButtonRef = useRef<HTMLButtonElement>(null);
  const providerDropdownRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value); // Track current value for voice input
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providerDropdownStyle, setProviderDropdownStyle] = useState<React.CSSProperties | null>(null);
  const [agentPanelStyle, setAgentPanelStyle] = useState<React.CSSProperties | null>(null);
  const [voiceInterimTranscript, setVoiceInterimTranscript] = useState('');
  const [showEmbeddedTools, setShowEmbeddedTools] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const imagePreviewUrlsRef = useRef<Record<string, string>>({});
  const lastAutoSpokenTextRef = useRef('');
  const pendingVoiceSendTextRef = useRef<string | null>(null);
  const [speechLanguagePreference, setSpeechLanguagePreference] = useState<SpeechLanguagePreference>(() => {
    try {
      const saved = localStorage.getItem('rg-speech-language');
      if (saved === 'en-US' || saved === 'ru-RU' || saved === 'uk-UA' || saved === 'ar-SA' || saved === 'auto') {
        return saved;
      }
    } catch {
      // ignore storage access errors
    }
    return 'auto';
  });

  const getFileKey = useCallback((file: File) => `${file.name}-${file.size}-${file.lastModified}`, []);

  useEffect(() => {
    const prev = imagePreviewUrlsRef.current;
    const next: Record<string, string> = {};

    attachedFiles.forEach((file) => {
      if (!file.type?.startsWith('image/')) return;
      const key = getFileKey(file);
      next[key] = prev[key] || URL.createObjectURL(file);
    });

    Object.keys(prev).forEach((key) => {
      if (!next[key]) URL.revokeObjectURL(prev[key]);
    });

    imagePreviewUrlsRef.current = next;
    setImagePreviewUrls(next);
  }, [attachedFiles, getFileKey]);

  useEffect(() => {
    return () => {
      Object.values(imagePreviewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      imagePreviewUrlsRef.current = {};
    };
  }, []);

  const normalizeProvider = (provider: string) => {
    if (provider === 'claude') return 'anthropic';
    if (provider === 'google') return 'gemini';
    return provider;
  };

  const chatInputRightInset = useMemo(() => {
    if (!splitViewEnabled) return 24;
    if (typeof window === 'undefined') return 24;

    const leftInset = sidebarOpen ? 304 : 24;
    const baseRight = 24;
    const available = window.innerWidth - leftInset - baseRight;
    const codePanelWidth = Math.max(0, available * (100 - (splitViewWidth || 50)) / 100);
    const dividerSafety = 10;

    return baseRight + codePanelWidth + dividerSafety;
  }, [splitViewEnabled, splitViewWidth, sidebarOpen]);

  // Provider data with status and model info
  const [providerData, setProviderData] = useState<Array<{id: string; name: string; model?: string; models?: string[]; available: boolean; has_user_key?: boolean; uses_credits?: boolean}>>([]);
  const [providerSearch, setProviderSearch] = useState('');
  const [expandedModels, setExpandedModels] = useState<string | null>(null);

  // Fetch live providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch("/resonant-chat/providers", { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          console.log('[ProviderDropdown] API response:', data);
          if (data.providers && data.providers.length > 0) {
            setProviderData(data.providers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      }
    };
    fetchProviders();
    const interval = setInterval(fetchProviders, 30000);
    return () => clearInterval(interval);
  }, []);

  const providerOptions = useMemo(() => {
    // Always include all providers from API
    const providers = providerData.length > 0 
      ? providerData.map(p => p.id)
      : ["groq", "openai", "gemini", "anthropic", "local", "codellama"];
    
    const result = ["auto", ...providers];
    // Remove duplicates while preserving order
    return [...new Set(result)];
  }, [providerData]);

  const filteredProviders = useMemo(() => {
    if (!providerSearch.trim()) return providerOptions;
    const search = providerSearch.toLowerCase();
    return providerOptions.filter(p => {
      const provider = providerData.find(pd => pd.id === p);
      const name = provider?.name || p;
      const model = provider?.model || '';
      return p.toLowerCase().includes(search) || name.toLowerCase().includes(search) || model.toLowerCase().includes(search);
    });
  }, [providerOptions, providerSearch, providerData]);

  const getProviderInfo = (providerId: string) => {
    if (providerId === 'auto') return { name: 'Auto (Smart)', model: 'Best available', models: [] as string[], available: true, has_user_key: false, uses_credits: false };
    const provider = providerData.find(p => p.id === providerId);
    return provider || { name: providerId, model: '', available: false, has_user_key: false, uses_credits: false };
  };

  // Keep valueRef in sync with value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Close all dropdowns/panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerDropdownRef.current && providerDropdownRef.current.contains(e.target as Node)) {
        return;
      }
      if (agentPanelRef.current && agentPanelRef.current.contains(e.target as Node)) {
        return;
      }
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(e.target as Node)) {
        // Close all panels when clicking outside the input bar
        setShowProviderDropdown(false);
        setProviderDropdownStyle(null);
        setShowMentionAutocomplete(false);
        if (showMemoryLibrary && onCloseMemoryLibrary) {
          onCloseMemoryLibrary();
        }
        if (showConversations && onCloseConversations) {
          onCloseConversations();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemoryLibrary, showConversations, onCloseMemoryLibrary, onCloseConversations]);

  const computeProviderDropdownStyle = useCallback((): React.CSSProperties | null => {
    if (typeof window === 'undefined') return null;
    const btn = providerButtonRef.current;
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const dropdownWidth = 260;
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - dropdownWidth - 8)
    );

    return {
      position: 'fixed',
      left,
      bottom: window.innerHeight - rect.top + 12,
      zIndex: 99999,
    };
  }, []);

  const computeAgentPanelStyle = useCallback((): React.CSSProperties | null => {
    if (typeof window === 'undefined') return null;
    const btn = agentButtonRef.current;
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const dropdownWidth = 320;
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - dropdownWidth - 8)
    );

    return {
      position: 'fixed',
      left,
      right: 'auto',
      bottom: window.innerHeight - rect.top + 12,
      zIndex: 99999,
      width: dropdownWidth,
      maxWidth: 'calc(100vw - 16px)',
    };
  }, []);

  useEffect(() => {
    if (!showProviderDropdown) return;
    const update = () => setProviderDropdownStyle(computeProviderDropdownStyle());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showProviderDropdown, computeProviderDropdownStyle]);

  useEffect(() => {
    if (!agentMode) return;
    const update = () => setAgentPanelStyle(computeAgentPanelStyle());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [agentMode, computeAgentPanelStyle]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || (attachedFiles?.length ?? 0) > 0) && !isLoading && !disabled) {
        onSend();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Detect @ mention
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');

    if (lastAt !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAt + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setShowMentionAutocomplete(true);
      } else {
        setShowMentionAutocomplete(false);
      }
    } else {
      setShowMentionAutocomplete(false);
    }
  };

  const filteredMemories = (memories || []).filter(m => 
    (m.name || m.content || '').toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5);

  // Close all popups helper
  const closeAllPopups = (except?: 'memory' | 'conversations' | 'provider' | 'agent') => {
    if (except !== 'provider') setShowProviderDropdown(false);
    setShowMentionAutocomplete(false);
    if (except !== 'memory' && showMemoryLibrary && onCloseMemoryLibrary) {
      onCloseMemoryLibrary();
    }
    if (except !== 'conversations' && showConversations && onCloseConversations) {
      onCloseConversations();
    }
  };

  useEffect(() => {
    if (!embedded) return;
    if (showEmbeddedTools) return;
    closeAllPopups();
  }, [embedded, showEmbeddedTools]);

  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const detectSpeechLanguage = useCallback((text: string): string => {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
    if (/[іїєґІЇЄҐ]/.test(text)) return 'uk-UA';
    if (/[\u0400-\u04FF]/.test(text)) return 'ru-RU';
    return 'en-US';
  }, []);

  const speechRecognitionLanguage = useMemo(() => {
    if (speechLanguagePreference !== 'auto') {
      return speechLanguagePreference;
    }

    const sample = `${value} ${voiceInterimTranscript}`.trim();
    if (sample.length > 0) {
      return detectSpeechLanguage(sample);
    }

    if (typeof navigator !== 'undefined' && Array.isArray(navigator.languages)) {
      const preferred = navigator.languages
        .map((lang) => lang.toLowerCase())
        .find((lang) =>
          lang.startsWith('ar') ||
          lang.startsWith('uk') ||
          lang.startsWith('ru') ||
          lang.startsWith('en')
        );

      if (preferred?.startsWith('ar')) return 'ar-SA';
      if (preferred?.startsWith('uk')) return 'uk-UA';
      if (preferred?.startsWith('ru')) return 'ru-RU';
    }

    return 'en-US';
  }, [detectSpeechLanguage, value, voiceInterimTranscript, speechLanguagePreference]);

  const speechLanguageLabel = useMemo(() => {
    switch (speechLanguagePreference) {
      case 'ru-RU':
        return 'RU';
      case 'uk-UA':
        return 'UK';
      case 'ar-SA':
        return 'AR';
      case 'en-US':
        return 'EN';
      default:
        return 'AUTO';
    }
  }, [speechLanguagePreference]);

  const cycleSpeechLanguagePreference = useCallback(() => {
    setSpeechLanguagePreference((prev) => {
      const next: SpeechLanguagePreference =
        prev === 'auto'
          ? 'ru-RU'
          : prev === 'ru-RU'
          ? 'uk-UA'
          : prev === 'uk-UA'
          ? 'ar-SA'
          : prev === 'ar-SA'
          ? 'en-US'
          : 'auto';

      try {
        localStorage.setItem('rg-speech-language', next);
      } catch {
        // ignore storage access errors
      }
      return next;
    });
  }, []);

  const selectPreferredVoice = useCallback((voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | undefined => {
    if (voices.length === 0) return undefined;

    const normalizedTarget = targetLang.toLowerCase();
    const strictMatches = voices.filter((voice) => voice.lang.toLowerCase() === normalizedTarget);
    const languageMatches = strictMatches.length > 0
      ? strictMatches
      : voices.filter((voice) => voice.lang.toLowerCase().startsWith(normalizedTarget.split('-')[0]));

    const pool = languageMatches.length > 0 ? languageMatches : voices;
    const ranked = [...pool].sort((a, b) => {
      const score = (voice: SpeechSynthesisVoice) => {
        const name = voice.name.toLowerCase();
        let points = 0;
        if (name.includes('neural')) points += 5;
        if (name.includes('natural')) points += 4;
        if (name.includes('premium')) points += 3;
        if (name.includes('enhanced')) points += 2;
        if (name.includes('google')) points += 2;
        if (name.includes('microsoft')) points += 2;
        if (voice.localService) points += 1;
        if (voice.default) points += 1;
        return points;
      };
      return score(b) - score(a);
    });

    return ranked[0];
  }, []);

  const handleTextToVoice = useCallback((forceStart = false) => {
    if (!ttsText?.trim()) return;
    if (typeof window === 'undefined') return;
    if (!window.speechSynthesis) return;

    if (isSpeaking && !forceStart) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = ttsText.trim();
    const detectedLang = detectSpeechLanguage(text);
    const availableVoices = window.speechSynthesis.getVoices();
    const preferredVoice = selectPreferredVoice(availableVoices, detectedLang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = preferredVoice?.lang || detectedLang;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [detectSpeechLanguage, isSpeaking, selectPreferredVoice, ttsText]);

  useEffect(() => {
    if (!voiceInInput) {
      lastAutoSpokenTextRef.current = '';
      pendingVoiceSendTextRef.current = null;
      return;
    }

    const nextText = ttsText?.trim() || '';
    if (!nextText) return;
    if (lastAutoSpokenTextRef.current === nextText) return;

    lastAutoSpokenTextRef.current = nextText;
    handleTextToVoice(true);
  }, [voiceInInput, ttsText, handleTextToVoice]);

  useEffect(() => {
    if (!voiceInInput) return;
    if (isLoading || disabled) return;

    const pendingText = pendingVoiceSendTextRef.current;
    if (!pendingText) return;
    if (value.trim() !== pendingText) return;

    pendingVoiceSendTextRef.current = null;
    onSend();
  }, [voiceInInput, isLoading, disabled, value, onSend]);

  // Close other panels when opening a new one
  const handleShowMemoryLibrary = () => {
    closeAllPopups('memory');
    onShowMemoryLibrary?.();
  };

  const handleShowConversations = () => {
    closeAllPopups('conversations');
    onShowConversations?.();
  };

  const handleProviderDropdownToggle = () => {
    closeAllPopups('provider');
    setShowProviderDropdown((prev) => {
      const next = !prev;
      setProviderDropdownStyle(next ? computeProviderDropdownStyle() : null);
      return next;
    });
  };

  // Handle agent mode toggle - close other panels
  const handleAgentModeToggle = () => {
    closeAllPopups('agent');
    onToggleAgentMode?.();
  };

  const handleAgentModeOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as Node | null;
    if (!target) return;
    if (agentPanelRef.current && agentPanelRef.current.contains(target)) return;
    if (agentButtonRef.current && agentButtonRef.current.contains(target)) return;
    onToggleAgentMode?.();
  }, [onToggleAgentMode]);

  useEffect(() => {
    if (!agentMode) return;
    window.addEventListener('mousedown', handleAgentModeOutsideClick);
    return () => window.removeEventListener('mousedown', handleAgentModeOutsideClick);
  }, [agentMode, handleAgentModeOutsideClick]);

  const handleAgentSelectChange = (agentHash: string | null) => {
    onSelectAgent?.(agentHash);
    if (agentHash) {
      onSelectTeam?.(null);
    }
  };

  const handleTeamSelectChange = (teamId: string | null) => {
    onSelectTeam?.(teamId);
    if (teamId) {
      onSelectAgent?.(null);
    }
  };

  const selectedAgentName = selectedAgent
    ? agents.find(a => a.hash === selectedAgent)?.name
    : null;

  const selectedTeamName = selectedTeamId
    ? teams.find(t => t.id === selectedTeamId)?.name
    : null;

  const agentSelectorLabel = selectedTeamName
    ? `Team: ${selectedTeamName}`
    : selectedAgentName
    ? `Agent: ${selectedAgentName}`
    : 'Smart';

  return (
    <div
      className={`${styles.chatInputRoot} ${embedded ? styles.embedded : ''} ${sidebarOpen && !embedded ? styles.withSidebar : ''} ${splitViewEnabled && !embedded ? styles.splitViewEnabled : ''}`}
      style={splitViewEnabled && !embedded ? { right: chatInputRightInset } : undefined}
    >
      <div
        className={styles.inputWrapper}
        ref={inputWrapperRef}
        onMouseLeave={() => {
          if (embedded) setShowEmbeddedTools(false);
        }}
      >
        {/* Agent Panel - Floats above */}
        {agentMode && typeof document !== 'undefined' && createPortal(
          <div
            className={styles.agentPanel}
            ref={agentPanelRef}
            style={agentPanelStyle || computeAgentPanelStyle() || undefined}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className={styles.agentPanelHeader}>
              <span className={styles.agentPanelTitle}>
                <TeamIcon />
                Agent Configuration
              </span>
            </div>
            <div className={styles.agentPanelContent}>
              <div className={styles.agentRow}>
                <span className={styles.agentLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Agent
                </span>
                <select
                  className={styles.agentSelect}
                  value={selectedAgent || ''}
                  onChange={(e) => handleAgentSelectChange(e.target.value || null)}
                >
                  <option value="">Smart</option>
                  {agents.map(agent => (
                    <option key={agent.hash} value={agent.hash}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.agentRow}>
                <span className={styles.agentLabel}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Team
                </span>
                <select
                  className={styles.agentSelect}
                  value={selectedTeamId || ''}
                  onChange={(e) => handleTeamSelectChange(e.target.value || null)}
                >
                  <option value="">No Team (Individual Agent)</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Memory Library Panel */}
        {showMemoryLibrary && (
          <div className={styles.stickerPanel}>
            <div className={styles.stickerHeader}>
              <span className={styles.stickerTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
                </svg>
                Memory Library ({memories.length})
              </span>
              <button className={styles.stickerClose} onClick={onCloseMemoryLibrary}>
                <CloseIcon />
              </button>
            </div>
            <div className={styles.stickerContent}>
              {memories.length === 0 ? (
                <div className={styles.stickerEmpty}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
                  </svg>
                  <div>No memories found</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Say "remember this" or "note this" to save memories</div>
                </div>
              ) : (
                memories.map(memory => (
                  <div
                    key={memory.id}
                    className={styles.listItem}
                    onClick={() => onMemoryClick?.(memory)}
                  >
                    <div className={styles.listItemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className={styles.listItemContent}>
                      <div className={styles.listItemHeader}>
                        <span className={styles.listItemTitle}>{memory.name || 'Untitled'}</span>
                        {(memory as any).type && (
                          <span className={styles.listItemBadge}>{(memory as any).type}</span>
                        )}
                      </div>
                      <div className={styles.listItemMeta}>
                        {memory.content?.substring(0, 60)}...
                      </div>
                      {(memory as any).created_at && (
                        <div className={styles.listItemTimestamp}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {new Date((memory as any).created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat History Panel - Shows list of chats, click to load full chat */}
        {showConversations && (
          <div className={styles.stickerPanel}>
            <div className={styles.stickerHeader}>
              <span className={styles.stickerTitle}>
                <HistoryIcon />
                My Chats ({conversations.length})
              </span>
              <button className={styles.stickerClose} onClick={onCloseConversations}>
                <CloseIcon />
              </button>
            </div>
            <div className={styles.stickerContent}>
              {conversations.length === 0 ? (
                <div className={styles.stickerEmpty}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <div>No chats yet</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Start chatting to create one</div>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`${styles.listItem} ${currentConversationId === conv.id ? styles.active : ''}`}
                    onClick={() => onConversationClick?.(conv)}
                  >
                    <div className={styles.listItemIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className={styles.listItemContent}>
                      <div className={styles.listItemHeader}>
                        <span className={styles.listItemTitle}>{conv.title || 'Untitled Chat'}</span>
                        {(conv as any).message_count !== undefined && (
                          <span className={styles.listItemBadge}>{(conv as any).message_count} msgs</span>
                        )}
                      </div>
                      <div className={styles.listItemMeta}>
                        {conv.created_at ? `Created: ${new Date(conv.created_at).toLocaleDateString()}` : ''}
                      </div>
                      {(conv as any).last_message_at && (
                        <div className={styles.listItemTimestamp}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {new Date((conv as any).last_message_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mention Autocomplete */}
        {showMentionAutocomplete && filteredMemories.length > 0 && (
          <div className={styles.autocomplete}>
            {filteredMemories.map((memory, index) => (
              <div
                key={memory.id}
                className={styles.autocompleteItem}
                onClick={() => {
                  const memoryName = memory.name || memory.content?.substring(0, 30) || '';
                  const cursorPos = textareaRef.current?.selectionStart || value.length;
                  const lastAt = value.substring(0, cursorPos).lastIndexOf('@');
                  const beforeAt = value.substring(0, lastAt);
                  const afterCursor = value.substring(cursorPos);
                  onChange(beforeAt + `@${memoryName} ` + afterCursor);
                  setShowMentionAutocomplete(false);
                  textareaRef.current?.focus();
                }}
              >
                <div className="title">{memory.name || 'Untitled'}</div>
                <div className="description">{memory.content?.substring(0, 50)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Attached Files - Minimal inline display */}
        {attachedFiles.length > 0 && (
          <div
            onMouseEnter={() => setAttachmentsExpanded(true)}
            onMouseLeave={() => setAttachmentsExpanded(false)}
            style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 0',
            fontSize: '12px',
            color: '#cbd5e1',
            flexWrap: attachmentsExpanded ? 'wrap' : 'nowrap',
            justifyContent: 'flex-start',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
          >
            <span>📎</span>
            {attachedFiles.slice(0, attachmentsExpanded ? attachedFiles.length : 3).map((file, index) => (
              <span 
                key={index} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: attachmentsExpanded ? '6px' : '0px',
                  background: 'rgba(255,255,255,0.08)',
                  padding: attachmentsExpanded ? '2px 8px' : '6px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.10)',
                  marginLeft: !attachmentsExpanded && index > 0 ? -10 : 0,
                }}
              >
                {attachmentsExpanded ? (file.name.length > 24 ? file.name.substring(0, 21) + '...' : file.name) : ''}
                {attachmentsExpanded && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveFile?.(index);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0 2px',
                      fontSize: '14px',
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {!attachmentsExpanded && attachedFiles.length > 3 && (
              <span style={{ opacity: 0.85, padding: '0 4px' }}>+{attachedFiles.length - 3}</span>
            )}
          </div>
        )}

        {/* Input Area: Textarea + Send */}
        <div className={styles.inputArea}>
          <div className={`${styles.voiceStack} ${embedded ? styles.embeddedVoiceStack : ''}`}>
            {onVoiceConversation && (
              <button
                className={`${styles.toolButton} ${voiceInInput ? styles.active : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onVoiceConversation?.();
                }}
                title="Voice Conversation"
                type="button"
              >
                <span className={`${styles.voiceConversationIcon} ${voiceInInput ? styles.voiceConversationIconActive : ''}`}>
                  <span className={styles.voiceConversationOrb} aria-hidden="true" />
                </span>
              </button>
            )}
            {embedded && (
              <button
                type="button"
                className={`${styles.toolButton} ${styles.embeddedToolsToggle} ${showEmbeddedTools ? styles.active : ''}`}
                onMouseEnter={() => setShowEmbeddedTools(true)}
                onFocus={() => setShowEmbeddedTools(true)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowEmbeddedTools(v => !v);
                }}
                title={showEmbeddedTools ? 'Hide tools' : 'Show tools'}
                aria-expanded={showEmbeddedTools}
              >
                <ChevronDownIcon />
              </button>
            )}
          </div>
          {voiceInInput && voiceInterimTranscript && (
            <div className={styles.voiceInterimOverlay}>{voiceInterimTranscript}</div>
          )}
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            data-chat-input="true"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
          />
          <button
            className={styles.sendButton}
            onClick={onNewChat || onSend}
            disabled={disabled}
            title="New Chat"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Tools Row */}
        {(!embedded || showEmbeddedTools) && (
        <div
          className={`${styles.toolsRow} ${embedded ? styles.embeddedToolsRow : ''}`}
          onMouseEnter={() => {
            if (embedded) setShowEmbeddedTools(true);
          }}
          onMouseLeave={() => {
            if (embedded) setShowEmbeddedTools(false);
          }}
        >
          <div className={styles.toolsLeft}>
            {onVoiceConversation && (
              <button
                className={`${styles.toolButton} ${voiceInInput ? styles.active : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cycleSpeechLanguagePreference();
                }}
                title={`Speech language: ${speechLanguageLabel} (tap to cycle AUTO/RU/UK/AR/EN)`}
                type="button"
              >
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em' }}>{speechLanguageLabel}</span>
              </button>
            )}
            {!hideProviderSelector && (
              <div style={{ position: 'relative', zIndex: 10000 }}>
                {/* Custom Provider Selector - No external styles */}
                <button
                  ref={providerButtonRef}
                  className={styles.providerButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProviderDropdownToggle();
                  }}
                  type="button"
                >
                  <LLMSelectorIcon />
                  {(selectedProvider || 'auto') === 'auto' ? 'Smart' : (selectedProvider || 'auto')}
                  <ChevronDownIcon />
                </button>
                {showProviderDropdown && providerDropdownStyle && typeof document !== 'undefined' && createPortal(
                  <div
                    ref={providerDropdownRef}
                    className={styles.providerDropdown}
                    style={{...providerDropdownStyle, maxHeight: '400px', overflowY: 'auto'}}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <div className={styles.providerDropdownHeader}>Select Provider</div>
                    {/* Search input */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <input
                        type="text"
                        placeholder="Search providers..."
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Provider list */}
                    {filteredProviders.map((provider) => {
                      const info = getProviderInfo(provider);
                      const models = info.models || [];
                      return (
                        <div key={provider}>
                          <button
                            type="button"
                            className={`${styles.providerOption} ${selectedProvider === provider ? styles.selected : ''}`}
                            style={{ opacity: info.available ? 1 : 0.5 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (info.available || provider === 'auto') {
                                onProviderChange(normalizeProvider(provider));
                                setShowProviderDropdown(false);
                                setProviderSearch('');
                                setExpandedModels(null);
                              }
                            }}
                          >
                            <span className={styles.providerIcon}>
                              {provider === 'auto' && <span style={{fontSize: '16px'}}>✨</span>}
                              {(provider === 'openai' || provider === 'chatgpt') && <span style={{fontSize: '16px'}}>🤖</span>}
                              {provider === 'gemini' && <span style={{fontSize: '16px'}}>💎</span>}
                              {provider === 'anthropic' && <span style={{fontSize: '16px'}}>🧠</span>}
                              {provider === 'groq' && <span style={{fontSize: '16px'}}>⚡</span>}
                              {provider === 'local' && <span style={{fontSize: '16px'}}>🏠</span>}
                              {provider === 'codellama' && <span style={{fontSize: '16px'}}>💻</span>}
                            </span>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span className={styles.providerName}>
                                {info.name || provider.charAt(0).toUpperCase() + provider.slice(1)}
                              </span>
                              {info.model && (
                                <span style={{ fontSize: '10px', color: '#888', fontWeight: 'normal' }}>
                                  {info.model}
                                </span>
                              )}
                            </div>
                            {/* Status + model count */}
                            <span style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '11px',
                              color: info.available ? '#4ade80' : '#f87171'
                            }}>
                              {info.has_user_key && <span title="Your API Key" style={{color: '#60a5fa'}}>🔑</span>}
                              {info.uses_credits && <span title="Uses Credits" style={{color: '#fbbf24'}}>💰</span>}
                              {models.length > 0 && provider !== 'auto' && (
                                <span
                                  title={`${models.length} models`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setExpandedModels(expandedModels === provider ? null : provider);
                                  }}
                                  style={{
                                    fontSize: '10px',
                                    color: '#9ca3af',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {expandedModels === provider ? '▾' : '▸'} {models.length}
                                </span>
                              )}
                              <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: info.available ? '#4ade80' : '#f87171',
                              }} />
                            </span>
                          </button>
                          {/* Model sub-list */}
                          {expandedModels === provider && models.length > 0 && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              paddingLeft: '36px',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              borderLeft: '2px solid rgba(99,102,241,0.2)',
                              marginLeft: '20px',
                              marginBottom: '4px',
                            }}>
                              {models.map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onProviderChange(normalizeProvider(provider));
                                    if ((window as any).__onModelChange) (window as any).__onModelChange(m);
                                    setShowProviderDropdown(false);
                                    setProviderSearch('');
                                    setExpandedModels(null);
                                  }}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '5px 10px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    background: info.model === m ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: info.model === m ? '#818cf8' : '#a1a1aa',
                                    fontSize: '11px',
                                    fontFamily: "'SF Mono','Fira Code','Consolas', monospace",
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = info.model === m ? 'rgba(99,102,241,0.12)' : 'transparent'; }}
                                >
                                  {m}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* BYOK Button */}
                    <div style={{ 
                      padding: '12px', 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      marginTop: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowProviderDropdown(false);
                          // Navigate to settings/API keys
                          window.location.href = '/profile?tab=api-keys';
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>🔑</span> Add Your API Key (BYOK)
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            )}

            {onToggleAgentMode && (
              <button
                ref={agentButtonRef}
                className={`${styles.providerButton} ${styles.agentSelectorButton} ${agentMode ? styles.agentSelectorActive : ''}`}
                onClick={handleAgentModeToggle}
                title={agentSelectorLabel}
                type="button"
              >
                <span className={styles.agentSelectorIcon}><TeamIcon /></span>
                <span className={styles.agentSelectorLabel}>{agentSelectorLabel}</span>
                <ChevronDownIcon />
              </button>
            )}

            <SkillsToolbar onEnabledSkillsChange={onEnabledSkillsChange} />
          </div>

          <div className={styles.toolsRight}>
            <VoiceInput
              key={`voice-input-${speechRecognitionLanguage}`}
              onTranscript={(text) => {
                const currentValue = valueRef.current;
                const newValue = `${currentValue}${currentValue ? ' ' : ''}${text}`.trim();
                onChange(newValue);
                if (voiceInInput && newValue.length > 0) {
                  pendingVoiceSendTextRef.current = newValue;
                }
                textareaRef.current?.focus();
              }}
              onInterimTranscriptChange={setVoiceInterimTranscript}
              renderInterimTranscript={false}
              iconSize={voiceIconSize}
              disabled={isLoading || disabled}
              forceListening={voiceInInput}
              speechLanguage={speechRecognitionLanguage}
            />

            {onShowConversations && (
              <button
                className={`${styles.toolButton} ${showConversations ? styles.active : ''}`}
                onClick={showConversations ? onCloseConversations : handleShowConversations}
                title="Chat History"
              >
                <ConversationIcon />
              </button>
            )}

            {onShareChat && (
              <button
                className={styles.toolButton}
                onClick={onShareChat}
                title="Share Entire Chat"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            )}

            {onAttachFile && (
              <button
                className={`${styles.toolButton} ${styles.animatedIcon}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAttachFile?.();
                }}
                title="Attach File"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.attachIcon}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            )}

            <button
              className={`${styles.toolButton} ${isSpeaking ? styles.active : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTextToVoice();
              }}
              title="Text to Voice"
              type="button"
              disabled={!ttsText?.trim()}
            >
              <SpeakerIcon />
            </button>

            {onShowMemoryLibrary && (
              <button
                className={`${styles.toolButton} ${showMemoryLibrary ? styles.active : ''}`}
                onClick={showMemoryLibrary ? onCloseMemoryLibrary : handleShowMemoryLibrary}
                title="Memory Library"
              >
                <MemoryLibraryIcon />
              </button>
            )}

            {onCopyChat && (
              <button
                className={styles.toolButton}
                onClick={onCopyChat}
                title="Copy Entire Chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            )}

            {onClearChat && (
              <button
                className={`${styles.toolButton} ${styles.danger}`}
                onClick={onClearChat}
                title="Archive Chat"
                type="button"
              >
                <ArchiveIcon />
              </button>
            )}

            {onBuild && (
              <button className={`${styles.toolButton} ${styles.animatedIcon}`} onClick={onBuild} title="Build Project">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.rocketIcon}>
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </button>
            )}

            {onShowSettings && (
              <button
                className={`${styles.toolButton} ${showSettings ? styles.active : ''}`}
                onClick={onShowSettings}
                title="Settings"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default ChatInputBar;
