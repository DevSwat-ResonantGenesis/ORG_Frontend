/**
 * useUserPreferences Hook
 * 
 * Manages user preferences with backend sync and localStorage fallback.
 * Automatically migrates old localStorage preferences to backend on first use.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getUserPreferences, 
  updatePreferenceCategory,
  migrateLocalPreferencesToBackend,
  DEFAULT_PREFERENCES,
  type UserPreferences,
  type ChatPreferences,
  type AgentPreferences,
} from '../api/userPreferences';
import { isAuthenticated } from '../api/auth';
import { logger } from '../utils/logger';

interface UseUserPreferencesReturn {
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  
  // Chat preference setters
  setAutoSave: (value: boolean) => void;
  setShowTimestamps: (value: boolean) => void;
  setShowProviderBadges: (value: boolean) => void;
  setShowValidityScores: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setFontSize: (value: string) => void;
  setInputAutoResize: (value: boolean) => void;
  setSoundNotifications: (value: boolean) => void;
  setKeyboardShortcuts: (value: boolean) => void;
  setFocusHighlights: (value: boolean) => void;
  setSplitView: (value: boolean) => void;
  setSplitWidth: (value: number) => void;
  
  // Agent preference setters
  setSelectedAgentHash: (value: string | null) => void;
  setSelectedTeamId: (value: string | null) => void;
  setAgentMode: (value: boolean) => void;
  
  // Utility
  refreshPreferences: () => Promise<void>;
}

export const useUserPreferences = (): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const isLoggedIn = isAuthenticated();
        
        if (isLoggedIn) {
          // Migrate old localStorage preferences to backend (once)
          if (!hasMigrated) {
            await migrateLocalPreferencesToBackend();
            setHasMigrated(true);
          }
          
          // Load from backend
          const prefs = await getUserPreferences();
          setPreferences(prefs);
        } else {
          // Not logged in - use localStorage directly
          const cached = localStorage.getItem('resonant-chat-preferences-cache');
          if (cached) {
            setPreferences(JSON.parse(cached));
          }
        }
      } catch (err) {
        logger.error('Failed to load preferences', err);
        setError('Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [hasMigrated]);

  // Generic updater for chat preferences
  const updateChatPref = useCallback(async (key: keyof ChatPreferences, value: any) => {
    // Optimistic update
    setPreferences(prev => ({
      ...prev,
      chat: { ...prev.chat, [key]: value },
    }));
    
    // Sync to backend if logged in
    if (isAuthenticated()) {
      try {
        await updatePreferenceCategory('chat', { [key]: value });
      } catch (err) {
        logger.error(`Failed to sync ${key} preference`, err);
        // Don't revert - localStorage fallback will keep the value
      }
    } else {
      // Save to localStorage for guests
      const cached = localStorage.getItem('resonant-chat-preferences-cache');
      const current = cached ? JSON.parse(cached) : DEFAULT_PREFERENCES;
      current.chat[key] = value;
      localStorage.setItem('resonant-chat-preferences-cache', JSON.stringify(current));
    }
  }, []);

  // Generic updater for agent preferences
  const updateAgentPref = useCallback(async (key: keyof AgentPreferences, value: any) => {
    // Optimistic update
    setPreferences(prev => ({
      ...prev,
      agent: { ...prev.agent, [key]: value },
    }));
    
    // Sync to backend if logged in
    if (isAuthenticated()) {
      try {
        await updatePreferenceCategory('agent', { [key]: value });
      } catch (err) {
        logger.error(`Failed to sync ${key} preference`, err);
      }
    } else {
      // Save to localStorage for guests
      const cached = localStorage.getItem('resonant-chat-preferences-cache');
      const current = cached ? JSON.parse(cached) : DEFAULT_PREFERENCES;
      current.agent[key] = value;
      localStorage.setItem('resonant-chat-preferences-cache', JSON.stringify(current));
    }
  }, []);

  // Refresh preferences from backend
  const refreshPreferences = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const prefs = await getUserPreferences();
        setPreferences(prefs);
      } catch (err) {
        logger.error('Failed to refresh preferences', err);
      }
    }
  }, []);

  return {
    preferences,
    isLoading,
    error,
    
    // Chat preference setters
    setAutoSave: (v) => updateChatPref('auto_save', v),
    setShowTimestamps: (v) => updateChatPref('show_timestamps', v),
    setShowProviderBadges: (v) => updateChatPref('show_provider_badges', v),
    setShowValidityScores: (v) => updateChatPref('show_validity_scores', v),
    setCompactMode: (v) => updateChatPref('compact_mode', v),
    setFontSize: (v) => updateChatPref('font_size', v),
    setInputAutoResize: (v) => updateChatPref('input_auto_resize', v),
    setSoundNotifications: (v) => updateChatPref('sound_notifications', v),
    setKeyboardShortcuts: (v) => updateChatPref('keyboard_shortcuts', v),
    setFocusHighlights: (v) => updateChatPref('focus_highlights', v),
    setSplitView: (v) => updateChatPref('split_view', v),
    setSplitWidth: (v) => updateChatPref('split_width', v),
    
    // Agent preference setters
    setSelectedAgentHash: (v) => updateAgentPref('selected_agent_hash', v),
    setSelectedTeamId: (v) => updateAgentPref('selected_team_id', v),
    setAgentMode: (v) => updateAgentPref('agent_mode', v),
    
    // Utility
    refreshPreferences,
  };
};

export default useUserPreferences;
