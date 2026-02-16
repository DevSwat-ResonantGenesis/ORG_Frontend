import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  ArchiveIcon,
  SendIcon,
DeleteIcon,
  PlusIcon,
  CloseIcon,
  LightbulbIcon,
  PenIcon,
  FileIcon,
  SearchIcon,
  MemoryIcon,
  ChevronDownIcon,
  HistoryIcon,
  PreviewIcon,
} from '@/components/Icons/ResonantChatIcons';
import { VoiceInput } from '@/components/ResonantChat/VoiceInput';
import styles from './ChatInputBar.module.css';

const RobotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="8" width="10" height="10" rx="2" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <path d="M12 2v2" />
    <path d="M8 18v2" />
    <path d="M16 18v2" />
    <circle cx="10" cy="13" r="1" />
    <circle cx="14" cy="13" r="1" />
  </svg>
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
  onCancel?: () => void;
  onBuild?: () => void;
  onOpenIDE?: () => void;
  onAttachFile?: () => void;
  onToggleSplitView?: () => void;
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
  onCancel,
  onBuild,
  onOpenIDE,
  onAttachFile,
  onToggleSplitView,
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
  showConversations = false,
  onCloseConversations,
  onConversationClick,
  currentConversationId,
  onShowSearch,
  onShowSettings,
  showSettings = false,
  onShareChat,
  onCopyChat,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const agentButtonRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef(value); // Track current value for voice input
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [voiceInterimTranscript, setVoiceInterimTranscript] = useState('');
  const [showEmbeddedTools, setShowEmbeddedTools] = useState(false);

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

  const providerOptions = useMemo(() => {
    const rawProviders =
      availableProviders && availableProviders.length > 0
        ? availableProviders
        : ['auto', 'openai', 'gemini', 'anthropic', 'groq'];

    const normalized = rawProviders.map(normalizeProvider);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const p of normalized) {
      if (!seen.has(p)) {
        seen.add(p);
        unique.push(p);
      }
    }

    if (!seen.has('auto')) {
      unique.unshift('auto');
    }
    return unique;
  }, [availableProviders]);
  
  // Keep valueRef in sync with value prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Close all dropdowns/panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputWrapperRef.current && !inputWrapperRef.current.contains(e.target as Node)) {
        // Close all panels when clicking outside the input bar
        setShowProviderDropdown(false);
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
      if (value.trim() && !isLoading && !disabled) {
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

  const filteredMemories = memories.filter(m => 
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
    setShowProviderDropdown(!showProviderDropdown);
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
    : 'Auto';

  return (
    <div
      className={`${styles.chatInputRoot} ${embedded ? styles.embedded : ''} ${sidebarOpen && !embedded ? styles.withSidebar : ''} ${splitViewEnabled && !embedded ? styles.splitViewEnabled : ''}`}
      style={splitViewEnabled && !embedded ? { right: chatInputRightInset } : undefined}
    >
      <div className={styles.inputWrapper} ref={inputWrapperRef}>
        {/* Agent Panel - Floats above */}
        {agentMode && (
          <div className={styles.agentPanel} ref={agentPanelRef}>
            <div className={styles.agentPanelHeader}>
              <span className={styles.agentPanelTitle}>
                <RobotIcon />
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
                  <option value="">Auto</option>
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
          </div>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#888',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            flexWrap: 'wrap',
          }}>
            <span>📎</span>
            {attachedFiles.map((file, index) => (
              <span 
                key={index} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
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
              </span>
            ))}
          </div>
        )}

        {/* Input Area: Textarea + Send */}
        <div className={styles.inputArea}>
          {voiceInInput && (
            <div className={styles.voiceStack}>
              <VoiceInput
                onTranscript={(text) => {
                  const currentValue = valueRef.current;
                  const newValue = currentValue + (currentValue ? ' ' : '') + text;
                  onChange(newValue);
                  textareaRef.current?.focus();
                }}
                onInterimTranscriptChange={setVoiceInterimTranscript}
                renderInterimTranscript={false}
                iconSize={voiceIconSize}
                disabled={isLoading || disabled}
              />
              {embedded && (
                <button
                  type="button"
                  className={`${styles.toolButton} ${styles.embeddedToolsToggle} ${showEmbeddedTools ? styles.active : ''}`}
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
          )}
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
            onClick={onSend}
            disabled={(!value.trim() && attachedFiles.length === 0) || isLoading || disabled}
          >
            <SendIcon />
          </button>
        </div>

        {/* Tools Row */}
        {(!embedded || showEmbeddedTools) && (
        <div className={`${styles.toolsRow} ${embedded ? styles.embeddedToolsRow : ''}`}>
          <div className={styles.toolsLeft}>
            {!hideProviderSelector && (
            <div style={{ position: 'relative', zIndex: 10000 }}>
              {/* Custom Provider Selector - No external styles */}
              <button
                className={styles.providerButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleProviderDropdownToggle();
                }}
                type="button"
              >
                {selectedProvider || 'auto'}
                <ChevronDownIcon />
              </button>
              {showProviderDropdown && (
                <div className={styles.providerDropdown}>
                  <div className={styles.providerDropdownHeader}>Select Provider</div>
                  {providerOptions.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      className={`${styles.providerOption} ${selectedProvider === provider ? styles.selected : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onProviderChange(normalizeProvider(provider));
                        setShowProviderDropdown(false);
                      }}
                    >
                      <span className={styles.providerIcon}>
                        {provider === 'auto' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        )}
                        {provider === 'openai' && (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                          </svg>
                        )}
                        {provider === 'gemini' && (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        )}
                        {provider === 'anthropic' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        )}
                        {provider === 'groq' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                          </svg>
                        )}
                      </span>
                      <span className={styles.providerName}>
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </span>
                      {provider === 'auto' && <span className={styles.providerBadge}>Smart</span>}
                      {/* Provider Health Stats */}
                      {provider !== 'auto' && providerStats[provider] && (
                        <span style={{ 
                          marginLeft: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontSize: '10px',
                        }}>
                          {/* Health indicator */}
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: providerStats[provider].health === 'healthy' ? '#22c55e' 
                              : providerStats[provider].health === 'degraded' ? '#f59e0b' 
                              : '#ef4444',
                          }} title={`Health: ${providerStats[provider].health}`} />
                          {/* Latency */}
                          {providerStats[provider].latency && (
                            <span style={{ color: '#888' }}>
                              {providerStats[provider].latency}ms
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
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
                <span className={styles.agentSelectorIcon}><RobotIcon /></span>
                <span className={styles.agentSelectorLabel}>{agentSelectorLabel}</span>
                <ChevronDownIcon />
              </button>
            )}
            
            {/* History Button - Shows chat history list (icon only) */}
            {onShowConversations && (
              <button
                className={`${styles.toolButton} ${styles.historyButton} ${showConversations ? styles.active : ''}`}
                onClick={showConversations ? onCloseConversations : handleShowConversations}
                title="Chat History"
              >
                <HistoryIcon />
              </button>
            )}

            {/* New Chat Button (icon only) */}
            {onNewChat && (
              <button className={`${styles.toolButton} ${styles.newChatButton}`} onClick={onNewChat} title="New Chat">
                <PlusIcon />
              </button>
            )}
            
            {onClearChat && (
              <button
                className={`${styles.toolButton} ${styles.danger}`}
                onClick={onClearChat}
                title="Archive Chat"
              >
                <ArchiveIcon />
              </button>
            )}
          </div>

          <div className={styles.toolsRight}>
            {/* Build Project - Rocket icon (icon only) */}
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
            
            {/* Attach File - Paperclip icon (icon only) */}
            {onAttachFile && (
              <button 
                className={`${styles.toolButton} ${styles.animatedIcon}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAttachFile();
                }} 
                title="Attach File"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.attachIcon}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            )}
            
            {/* Voice Input */}
            {!voiceInInput && (
            <VoiceInput
              onTranscript={(text) => {
                // Use ref to get current value to avoid stale closure
                const currentValue = valueRef.current;
                const newValue = currentValue + (currentValue ? ' ' : '') + text;
                onChange(newValue);
                // Focus the textarea after voice input
                textareaRef.current?.focus();
              }}
              disabled={isLoading || disabled}
            />
            )}
            
            {/* Split View - Columns icon (icon only) */}
            {onToggleSplitView && (
              <button
                className={`${styles.toolButton} ${styles.animatedIcon} ${splitViewEnabled ? styles.active : ""}`}
                onClick={onToggleSplitView}
                title={embedded ? (splitViewEnabled ? "Close Preview" : "Open Preview") : (splitViewEnabled ? "Close Split View" : "Open Split View")}
              >
                {embedded ? (
                  <PreviewIcon />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.splitIcon}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="12" y1="3" x2="12" y2="21" />
                  </svg>
                )}
              </button>
            )}

            
            {onShowMemoryLibrary && (
              <button
                className={`${styles.toolButton} ${showMemoryLibrary ? styles.active : ''}`}
                onClick={showMemoryLibrary ? onCloseMemoryLibrary : handleShowMemoryLibrary}
                title="Memory Library"
              >
                <MemoryIcon />
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
            

            {/* Copy Entire Chat */}
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

            {/* Share Entire Chat */}
            {onShareChat && (
              <button
                className={styles.toolButton}
                onClick={onShareChat}
                title="Share Entire Chat"
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

            {onCancel && (
              <button
                className={`${styles.toolButton} ${isLoading ? styles.danger : ''}`}
                onClick={onCancel}
                title={isLoading ? 'Stop' : 'Cancel'}
              >
                <CloseIcon />
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
