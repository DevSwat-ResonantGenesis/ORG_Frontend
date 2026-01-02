/**
 * User Preferences API
 * 
 * Handles storing and retrieving user preferences from the backend.
 * Falls back to localStorage if backend is unavailable.
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

export interface ChatPreferences {
  auto_save: boolean;
  show_timestamps: boolean;
  show_provider_badges: boolean;
  show_validity_scores: boolean;
  compact_mode: boolean;
  font_size: string;
  input_auto_resize: boolean;
  sound_notifications: boolean;
  keyboard_shortcuts: boolean;
  focus_highlights: boolean;
  split_view: boolean;
  split_width: number;
}

export interface AgentPreferences {
  selected_agent_hash: string | null;
  selected_team_id: string | null;
  agent_mode: boolean;
}

export interface DisplayPreferences {
  theme: string;
  sidebar_collapsed: boolean;
}

export interface UserPreferences {
  chat: ChatPreferences;
  agent: AgentPreferences;
  display: DisplayPreferences;
}

export interface UserPreferencesResponse {
  preferences: UserPreferences;
  updated_at: string | null;
}

// Default preferences (matches backend)
export const DEFAULT_PREFERENCES: UserPreferences = {
  chat: {
    auto_save: true,
    show_timestamps: true,
    show_provider_badges: true,
    show_validity_scores: false,
    compact_mode: false,
    font_size: 'medium',
    input_auto_resize: true,
    sound_notifications: false,
    keyboard_shortcuts: true,
    focus_highlights: true,
    split_view: false,
    split_width: 50,
  },
  agent: {
    selected_agent_hash: null,
    selected_team_id: null,
    agent_mode: false,
  },
  display: {
    theme: 'dark',
    sidebar_collapsed: false,
  },
};

// localStorage keys for fallback
const PREFERENCES_CACHE_KEY = 'resonant-chat-preferences-cache';

/**
 * Get user preferences from backend
 * Falls back to localStorage cache if backend unavailable
 */
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await fastapiClient.get('/user/preferences');
    const data: UserPreferencesResponse = response.data;
    
    // Cache in localStorage for offline access
    localStorage.setItem(PREFERENCES_CACHE_KEY, JSON.stringify(data.preferences));
    
    return data.preferences;
  } catch (error: any) {
    // Check if it's a connection error
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error');
    
    if (isConnectionError) {
      // Try to load from localStorage cache
      const cached = localStorage.getItem(PREFERENCES_CACHE_KEY);
      if (cached) {
        logger.info('Using cached preferences (backend unavailable)');
        return JSON.parse(cached);
      }
    }
    
    // Return defaults if no cache
    logger.warn('Failed to load preferences, using defaults', { error });
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Update user preferences in backend
 * Also updates localStorage cache
 */
export const updateUserPreferences = async (
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> => {
  try {
    const response = await fastapiClient.put('/user/preferences', preferences);
    const data: UserPreferencesResponse = response.data;
    
    // Update localStorage cache
    localStorage.setItem(PREFERENCES_CACHE_KEY, JSON.stringify(data.preferences));
    
    return data.preferences;
  } catch (error: any) {
    logger.error('Failed to update preferences', error);
    
    // Still update localStorage as fallback
    const cached = localStorage.getItem(PREFERENCES_CACHE_KEY);
    const current = cached ? JSON.parse(cached) : DEFAULT_PREFERENCES;
    const updated = {
      chat: { ...current.chat, ...preferences.chat },
      agent: { ...current.agent, ...preferences.agent },
      display: { ...current.display, ...preferences.display },
    };
    localStorage.setItem(PREFERENCES_CACHE_KEY, JSON.stringify(updated));
    
    throw error;
  }
};

/**
 * Update a single preference category
 */
export const updatePreferenceCategory = async (
  category: 'chat' | 'agent' | 'display',
  values: Record<string, any>
): Promise<void> => {
  try {
    await fastapiClient.patch(`/user/preferences/${category}`, values);
    
    // Update localStorage cache
    const cached = localStorage.getItem(PREFERENCES_CACHE_KEY);
    const current = cached ? JSON.parse(cached) : DEFAULT_PREFERENCES;
    current[category] = { ...current[category], ...values };
    localStorage.setItem(PREFERENCES_CACHE_KEY, JSON.stringify(current));
  } catch (error: any) {
    logger.error(`Failed to update ${category} preferences`, error);
    
    // Still update localStorage as fallback
    const cached = localStorage.getItem(PREFERENCES_CACHE_KEY);
    const current = cached ? JSON.parse(cached) : DEFAULT_PREFERENCES;
    current[category] = { ...current[category], ...values };
    localStorage.setItem(PREFERENCES_CACHE_KEY, JSON.stringify(current));
    
    throw error;
  }
};

/**
 * Reset preferences to defaults
 */
export const resetUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const response = await fastapiClient.delete('/user/preferences');
    
    // Clear localStorage cache
    localStorage.removeItem(PREFERENCES_CACHE_KEY);
    
    return response.data.preferences;
  } catch (error: any) {
    logger.error('Failed to reset preferences', error);
    
    // Clear localStorage anyway
    localStorage.removeItem(PREFERENCES_CACHE_KEY);
    
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Migrate localStorage preferences to backend
 * Call this once when user logs in to sync their local settings
 */
export const migrateLocalPreferencesToBackend = async (): Promise<void> => {
  try {
    // Collect all localStorage preferences - start with defaults
    const localPrefs: UserPreferences = {
      chat: { ...DEFAULT_PREFERENCES.chat },
      agent: { ...DEFAULT_PREFERENCES.agent },
      display: { ...DEFAULT_PREFERENCES.display },
    };
    
    // Chat preferences
    const autoSave = localStorage.getItem('resonant-chat-auto-save');
    if (autoSave !== null) localPrefs.chat!.auto_save = autoSave === 'true';
    
    const showTimestamps = localStorage.getItem('resonant-chat-show-timestamps');
    if (showTimestamps !== null) localPrefs.chat!.show_timestamps = showTimestamps === 'true';
    
    const showProviderBadges = localStorage.getItem('resonant-chat-show-provider-badges');
    if (showProviderBadges !== null) localPrefs.chat!.show_provider_badges = showProviderBadges === 'true';
    
    const showValidityScores = localStorage.getItem('resonant-chat-show-validity-scores');
    if (showValidityScores !== null) localPrefs.chat!.show_validity_scores = showValidityScores === 'true';
    
    const compactMode = localStorage.getItem('resonant-chat-compact-mode');
    if (compactMode !== null) localPrefs.chat!.compact_mode = compactMode === 'true';
    
    const fontSize = localStorage.getItem('resonant-chat-font-size');
    if (fontSize !== null) localPrefs.chat!.font_size = fontSize;
    
    const inputAutoResize = localStorage.getItem('resonant-chat-input-auto-resize');
    if (inputAutoResize !== null) localPrefs.chat!.input_auto_resize = inputAutoResize === 'true';
    
    const soundNotifications = localStorage.getItem('resonant-chat-sound-notifications');
    if (soundNotifications !== null) localPrefs.chat!.sound_notifications = soundNotifications === 'true';
    
    const keyboardShortcuts = localStorage.getItem('resonant-chat-keyboard-shortcuts');
    if (keyboardShortcuts !== null) localPrefs.chat!.keyboard_shortcuts = keyboardShortcuts === 'true';
    
    const focusHighlights = localStorage.getItem('resonant-chat-focus-highlights');
    if (focusHighlights !== null) localPrefs.chat!.focus_highlights = focusHighlights === 'true';
    
    const splitView = localStorage.getItem('resonant-chat-split-view');
    if (splitView !== null) localPrefs.chat!.split_view = splitView === 'true';
    
    const splitWidth = localStorage.getItem('resonant-chat-split-width');
    if (splitWidth !== null) localPrefs.chat!.split_width = parseInt(splitWidth, 10);
    
    // Agent preferences
    const selectedAgentHash = localStorage.getItem('resonant-chat-selected-agent-hash');
    if (selectedAgentHash !== null) localPrefs.agent!.selected_agent_hash = selectedAgentHash;
    
    // Only migrate if we have any preferences to migrate
    const hasPrefs = Object.values(localPrefs.chat!).length > 0 || 
                     Object.values(localPrefs.agent!).length > 0;
    
    if (hasPrefs) {
      logger.info('Migrating localStorage preferences to backend', { 
        chatPrefs: Object.keys(localPrefs.chat!).length,
        agentPrefs: Object.keys(localPrefs.agent!).length,
      });
      
      await updateUserPreferences(localPrefs);
      
      // Clear old localStorage keys after successful migration
      const keysToRemove = [
        'resonant-chat-auto-save',
        'resonant-chat-show-timestamps',
        'resonant-chat-show-provider-badges',
        'resonant-chat-show-validity-scores',
        'resonant-chat-compact-mode',
        'resonant-chat-font-size',
        'resonant-chat-input-auto-resize',
        'resonant-chat-sound-notifications',
        'resonant-chat-keyboard-shortcuts',
        'resonant-chat-focus-highlights',
        'resonant-chat-split-view',
        'resonant-chat-split-width',
        'resonant-chat-selected-agent-hash',
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      logger.info('Successfully migrated preferences to backend');
    }
  } catch (error) {
    logger.error('Failed to migrate preferences to backend', error);
    // Don't throw - migration failure shouldn't break the app
  }
};
