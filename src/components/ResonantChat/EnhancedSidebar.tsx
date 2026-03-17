import {
  AnalyticsIcon,
  ChatIcon,
  CloseIcon,
  ConversationIcon,
  DeleteIcon,
  DownloadIcon,
  FileIcon,
  GlobeIcon,
  MemoryIcon,
  PenIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  StorageIcon,
  TargetIcon
} from '@/components/Icons/ResonantChatIcons';
import { ProviderSelector, type Provider } from '@/components/ui/ProviderSelector';
import { clearSession, getSession } from '@/utils/auth';
import { clearSessionData, isAuthenticated } from '@/utils/auth-cookies';
import { logout as apiLogout } from '@/api/auth';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './EnhancedSidebar-2025.module.css';

// Simple chevron right icon component
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'inherit' }}>
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Conversation {
  id: string;
  title?: string;
  created_at?: string;
}

interface Memory {
  id: string;
  name?: string;
  content?: string;
}

interface User {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
}

interface EnhancedSidebarProps {
  conversations: Conversation[];
  memories: Memory[];
  currentConversationId: string | null;
  isLoadingConversations: boolean;
  isLoadingConversation: string | null;
  isDeletingConversation: string | null;
  memorySearchQuery: string;
  onMemorySearchChange: (query: string) => void;
  onConversationClick: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onMemoryClick: (memory: Memory) => void;
  onMemorySave: () => void;
  onSettingsClick?: () => void;
  onCodeFilesClick?: () => void;
  // Footer actions
  onExport?: () => void;
  onShare?: () => void;
  onClearChat?: () => void;
  onShowMetrics?: () => void;
  onShowGroups?: () => void;
  onShowThreads?: () => void;
  onShowMemoryLibrary?: () => void;
  onShowSettingsSticker?: () => void;
  onToggleAgentMode?: () => void;
  onAttachFile?: () => void;
  agentMode?: boolean;
  selectedProvider?: string;
  onProviderChange?: (provider: string) => void;
  conversationsCount?: number;
  memoriesCount?: number;
  groupsCount?: number;
  onClose?: () => void;
  isMobile?: boolean;
  sidebarOpen?: boolean;
  // Footer settings
  temperature?: number;
  onTemperatureChange?: (temp: number) => void;
  maxTokens?: number;
  onMaxTokensChange?: (tokens: number) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  autoSave?: boolean;
  onToggleAutoSave?: () => void;
  showTimestamps?: boolean;
  onToggleTimestamps?: () => void;
  showProviderBadges?: boolean;
  onToggleProviderBadges?: () => void;
  showValidityScores?: boolean;
  onToggleValidityScores?: () => void;
  compactMode?: boolean;
  onToggleCompactMode?: () => void;
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
  onFontSizeChange?: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  inputAutoResize?: boolean;
  onToggleInputAutoResize?: () => void;
  soundNotifications?: boolean;
  onToggleSoundNotifications?: () => void;
  keyboardShortcuts?: boolean;
  onToggleKeyboardShortcuts?: () => void;
  showShortcutsInfo?: boolean;
  onToggleShortcutsInfo?: () => void;
  currentTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  // Team Support
  teams?: Team[];
  selectedTeamId?: string | null;
  onSelectTeam?: (id: string | null) => void;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  conversations,
  memories,
  currentConversationId,
  isLoadingConversations,
  isLoadingConversation,
  isDeletingConversation,
  memorySearchQuery,
  onMemorySearchChange,
  onConversationClick,
  onNewConversation,
  onDeleteConversation,
  onMemoryClick,
  onMemorySave,
  onSettingsClick,
  onCodeFilesClick,
  onExport,
  onShare,
  onClearChat,
  onShowMetrics,
  onShowGroups,
  onShowThreads,
  onShowMemoryLibrary,
  onShowSettingsSticker,
  onToggleAgentMode,
  onAttachFile,
  agentMode = false,
  selectedProvider,
  onProviderChange,
  conversationsCount = 0,
  memoriesCount = 0,
  groupsCount = 0,
  onClose,
  isMobile = false,
  sidebarOpen = false,
  temperature = 0.7,
  onTemperatureChange,
  maxTokens = 2000,
  onMaxTokensChange,
  selectedModel = '',
  onModelChange,
  autoSave = true,
  onToggleAutoSave,
  showTimestamps = true,
  onToggleTimestamps,
  showProviderBadges = true,
  onToggleProviderBadges,
  showValidityScores = true,
  onToggleValidityScores,
  compactMode = false,
  onToggleCompactMode,
  fontSize = 'medium',
  onFontSizeChange,
  inputAutoResize = true,
  onToggleInputAutoResize,
  soundNotifications = false,
  onToggleSoundNotifications,
  keyboardShortcuts = true,
  onToggleKeyboardShortcuts,
  showShortcutsInfo = false,
  onToggleShortcutsInfo,
  currentTheme = 'dark',
  onToggleTheme,
  teams = [],
  selectedTeamId = null,
  onSelectTeam,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        try {
          const session = await getSession();
          if (session?.email) {
            setUser({
              email: session.email,
              name: session.email.split('@')[0], // Use email prefix as name
              role: session.role || undefined,
            });
          }
        } catch (error) {
          console.error('Failed to get user session', error);
        }
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearSessionData();
      clearSession();
      // Clear all chat-related localStorage to prevent leaking data to next user
      localStorage.removeItem('resonant-chat-current-conversation');
      localStorage.removeItem('resonant-chat-live-messages');
      localStorage.removeItem('resonant-chat-selected-agent-hash');
      localStorage.removeItem('resonant-chat-user-id');
      localStorage.removeItem('resonant-chat-split-view');
      localStorage.removeItem('resonant-chat-split-width');
      localStorage.removeItem('resonant-chat-pending-message');
      localStorage.removeItem('rg-guest-chat-messages');
      setIsLoggedIn(false);
      setUser(null);
      if (onClose) onClose();
      window.location.href = '/login';
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    if (onClose) onClose();
  };

  const handleSettings = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      navigate('/settings');
    }
    if (onClose) onClose();
  };

  const currentPath = location.pathname;

  return (
    <div className={`${styles.sidebar} ${isMobile ? styles.mobile : ''} ${isMobile && sidebarOpen ? styles.open : ''}`}>
      {isMobile && (
        <div className={styles.sidebarHeader}>
          <h2>AGI Neural Hub</h2>
          <div className={styles.sidebarHeaderActions}>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={styles.themeToggleButton}
                title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {currentTheme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0A7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            )}
            <button onClick={onClose} className={styles.closeButton}>
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>

        {/* Navigation Section */}
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle} style={{ paddingLeft: '16px', marginTop: '16px', opacity: 0.7, fontSize: '0.75rem', letterSpacing: '1px' }}>NAVIGATION</div>
          <div className={styles.settingsList}>
            <button
              className={`${styles.settingsItem} ${currentPath === '/' ? styles.active : ''}`}
              onClick={() => { navigate('/'); if (onClose) onClose(); }}
            >
              <GlobeIcon />
              <span>Home</span>
            </button>
            <button
              className={`${styles.settingsItem} ${currentPath.startsWith('/chat') ? styles.active : ''}`}
              onClick={() => {
                if (currentPath.startsWith('/chat')) {
                  // Already here
                } else {
                  navigate('/chat');
                }
                if (onClose) onClose();
              }}
            >
              <ChatIcon />
              <span>Resonant Chat</span>
            </button>
            <button
              className={`${styles.settingsItem} ${currentPath.startsWith('/ide') ? styles.active : ''}`}
              onClick={() => { navigate('/ide'); if (onClose) onClose(); }}
            >
              <PenIcon />
              <span>Resonant IDE</span>
            </button>
            <button
              className={`${styles.settingsItem} ${currentPath.startsWith('/marketplace') ? styles.active : ''}`}
              onClick={() => { navigate('/marketplace'); if (onClose) onClose(); }}
            >
              <StorageIcon />
              <span>General Store</span>
            </button>
          </div>
        </div>

        {/* Conversation Section */}
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle} style={{ paddingLeft: '16px', marginTop: '16px', opacity: 0.7, fontSize: '0.75rem', letterSpacing: '1px' }}>CONVERSATION</div>
          <div className={styles.settingsList}>
            {onNewConversation && (
              <button className={styles.settingsItem} onClick={onNewConversation}>
                <PlusIcon />
                <span>New Conversation</span>
              </button>
            )}
            {onClearChat && (
              <button className={styles.settingsItem} onClick={onClearChat}>
                <DeleteIcon />
                <span>Clear Chat</span>
              </button>
            )}
            {onExport && (
              <button className={styles.settingsItem} onClick={onExport}>
                <DownloadIcon />
                <span>Export Conversation</span>
              </button>
            )}
            {onShare && (
              <button className={styles.settingsItem} onClick={onShare}>
                <ShareIcon />
                <span>Share Conversation</span>
              </button>
            )}
          </div>
        </div>

        {/* Agent & Tools Section */}
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle} style={{ paddingLeft: '16px', marginTop: '16px', opacity: 0.7, fontSize: '0.75rem', letterSpacing: '1px' }}>AGENT & TOOLS</div>
          <div className={styles.settingsList}>
            {/* Provider Selector */}
            {selectedProvider && onProviderChange && (
              <div className={styles.settingsItem} style={{ padding: '8px 12px' }}>
                <ProviderSelector
                  selectedProvider={selectedProvider as Provider}
                  onProviderChange={onProviderChange}
                />
              </div>
            )}

            {/* Agent Mode Toggle */}
            {onToggleAgentMode && (
              <button
                className={`${styles.settingsItem} ${agentMode ? styles.active : ''}`}
                onClick={onToggleAgentMode}
              >
                <TargetIcon />
                <span>Agent Mode</span>
                <span className={styles.settingsItemDetail}>{agentMode ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {/* Team Selection UI (Only visible when Agent Mode is ON) */}
            {agentMode && onSelectTeam && (
              <div className={styles.settingsSubItem} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', marginTop: '4px', margin: '0 8px' }}>
                <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Target Type</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      padding: '4px',
                      borderRadius: '4px',
                      background: !selectedTeamId ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: '1px solid ' + (!selectedTeamId ? 'var(--primary-color, #007bff)' : 'transparent'),
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectTeam(null)}
                  >
                    Agent
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: '4px',
                      borderRadius: '4px',
                      background: selectedTeamId ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: '1px solid ' + (selectedTeamId ? 'var(--primary-color, #007bff)' : 'transparent'),
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (teams.length > 0) onSelectTeam(teams[0].id);
                    }}
                  >
                    Team
                  </button>
                </div>

                {selectedTeamId && (
                  <>
                    <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>Select Team</div>
                    <select
                      value={selectedTeamId || ''}
                      onChange={(e) => onSelectTeam(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'inherit',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      {teams.map(team => (
                        <option key={team.id} value={team.id} style={{ color: 'black' }}>
                          {team.name}
                        </option>
                      ))}
                      {teams.length === 0 && <option value="" disabled>No teams available</option>}
                    </select>
                  </>
                )}
              </div>
            )}

            {onAttachFile && (
              <button className={styles.settingsItem} onClick={onAttachFile}>
                <FileIcon />
                <span>Attach File</span>
              </button>
            )}
          </div>
        </div>

        {/* Views & Panels Section */}
        <div className={styles.settingsGroup}>
          <div className={styles.settingsGroupTitle} style={{ paddingLeft: '16px', marginTop: '16px', opacity: 0.7, fontSize: '0.75rem', letterSpacing: '1px' }}>VIEWS & PANELS</div>
          <div className={styles.settingsList}>
            {onShowThreads && (
              <button className={styles.settingsItem} onClick={onShowThreads}>
                <ConversationIcon />
                <span>Threads</span>
                {conversationsCount !== undefined && conversationsCount > 0 && <span className={styles.settingsItemDetail}>{conversationsCount}</span>}
              </button>
            )}
            {onShowMetrics && (
              <button className={styles.settingsItem} onClick={onShowMetrics}>
                <AnalyticsIcon />
                <span>Metrics</span>
              </button>
            )}
            {onShowMemoryLibrary && (
              <button className={styles.settingsItem} onClick={onShowMemoryLibrary}>
                <MemoryIcon />
                <span>Memory Library</span>
                {memoriesCount !== undefined && memoriesCount > 0 && <span className={styles.settingsItemDetail}>{memoriesCount}</span>}
              </button>
            )}
            {onShowGroups && (
              <button className={styles.settingsItem} onClick={onShowGroups}>
                <TargetIcon />
                <span>Clusters</span>
                {groupsCount !== undefined && groupsCount > 0 && <span className={styles.settingsItemDetail}>{groupsCount}</span>}
              </button>
            )}
            <button className={styles.settingsItem} onClick={() => { if (onShowSettingsSticker) onShowSettingsSticker(); }}>
              <SearchIcon />
              <span>Global Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Section (Bottom) */}
      <div className={styles.userSection} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px' }}>
        {isLoggedIn && user ? (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(typeof user.name === 'string' && user.name.length > 0) ? user.name.charAt(0).toUpperCase() : (typeof user.email === 'string' && user.email.length > 0) ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.name || user.email}</div>
            </div>
            <button
              className={styles.profileButton}
              onClick={handleSettings} // Go to settings
              title="Settings"
            >
              <SettingsIcon />
            </button>
          </div>
        ) : (
          <div className={styles.userInfo}>
            <div className={styles.signInContainer}>
              <div className={styles.signInIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.signInContent}>
                <div className={styles.signInTitle}>Not signed in</div>
                <button
                  className={styles.signInButton}
                  onClick={() => navigate('/login')}
                  title="Sign In"
                >
                  <span>Sign In</span>
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSidebar;
