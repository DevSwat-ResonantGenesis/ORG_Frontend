/**
 * Floating Home Component - Super Minimal Design
 * Warm grey semi-transparent glass effect
 * No lines, no boxes - pure minimal aesthetic
 */

import React, { useEffect, useState } from 'react';
import { listAgentTeams, type AgentTeam } from '@/api/agentTeams';
import { listAgents, type AgentResponse } from '@/api/agents';
import { fetchAvailableProviders } from '@/api/userApiKeys';
import styles from './FloatingHome.module.css';

// Icons as simple SVG components
const AgentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
  </svg>
);

const ProviderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
);

const TeamIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="7" r="3"/>
    <circle cx="15" cy="7" r="3"/>
    <path d="M3 18c0-3 3-5 6-5"/>
    <path d="M15 13c3 0 6 2 6 5"/>
    <circle cx="12" cy="14" r="3"/>
    <path d="M6 21c0-2.5 2.5-4 6-4s6 1.5 6 4"/>
  </svg>
);

interface FloatingHomeProps {
  onPromptSelect: (prompt: string) => void;
  onAgentSelect?: (agentHash: string | null) => void;
  onTeamSelect?: (teamId: string | null) => void;
  onProviderSelect?: (provider: string) => void;
  selectedAgentHash?: string | null;
  selectedTeamId?: string | null;
  selectedProvider?: string;
  isLoggedIn?: boolean;
}

const allProviders = [
  { id: 'auto', name: 'Auto' },
  { id: 'openai', name: 'GPT-4' },
  { id: 'anthropic', name: 'Claude' },
  { id: 'google', name: 'Gemini' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'groq', name: 'Groq' },
];

export const FloatingHome: React.FC<FloatingHomeProps> = ({
  onPromptSelect,
  onAgentSelect,
  onTeamSelect,
  onProviderSelect,
  selectedAgentHash,
  selectedTeamId,
  selectedProvider = 'auto',
  isLoggedIn = false,
}) => {
  const [agents, setAgents] = useState<AgentResponse[]>([]);
  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSelector, setActiveSelector] = useState<'agent' | 'provider' | 'team' | null>(null);

  // Load agents, teams, and available providers
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [agentsData, teamsData, providersData] = await Promise.all([
          listAgents().catch(() => []),
          listAgentTeams().catch(() => []),
          fetchAvailableProviders().catch(() => ({ providers: [], hasUserKeys: false, userKeyProviders: [] })),
        ]);
        setAgents(agentsData.slice(0, 8));
        setTeams(teamsData.slice(0, 8));
        setAvailableProviders(providersData.providers || []);
      } catch (err) {
        console.error('Failed to load agents/teams', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isLoggedIn]);
  
  // Filter providers based on user's available providers
  const providers = allProviders.filter(p => 
    p.id === 'auto' || availableProviders.includes(p.id) || availableProviders.length === 0
  );

  const toggleSelector = (type: 'agent' | 'provider' | 'team') => {
    setActiveSelector(activeSelector === type ? null : type);
  };

  return (
    <div className={styles.floatingHome}>
      <div className={styles.minimalContainer}>
        {/* Title */}
        <h1 className={styles.minimalTitle}>Resonant</h1>
        
        {/* Selector Icons */}
        <div className={styles.selectorIcons}>
          <button
            className={`${styles.iconButton} ${activeSelector === 'agent' ? styles.active : ''} ${selectedAgentHash ? styles.hasSelection : ''}`}
            onClick={() => toggleSelector('agent')}
            title="Select Agent"
          >
            <AgentIcon />
          </button>
          <button
            className={`${styles.iconButton} ${activeSelector === 'provider' ? styles.active : ''} ${selectedProvider !== 'auto' ? styles.hasSelection : ''}`}
            onClick={() => toggleSelector('provider')}
            title="Select Provider"
          >
            <ProviderIcon />
          </button>
          <button
            className={`${styles.iconButton} ${activeSelector === 'team' ? styles.active : ''} ${selectedTeamId ? styles.hasSelection : ''}`}
            onClick={() => toggleSelector('team')}
            title="Select Team"
          >
            <TeamIcon />
          </button>
        </div>

        {/* Expandable Selector Panel */}
        {activeSelector && (
          <div className={styles.selectorPanel}>
            {activeSelector === 'agent' && (
              <>
                <button
                  className={`${styles.selectorOption} ${!selectedAgentHash ? styles.selected : ''}`}
                  onClick={() => { onAgentSelect?.(null); setActiveSelector(null); }}
                >
                  Auto
                </button>
                {loading ? (
                  <span className={styles.loadingText}>...</span>
                ) : agents.length > 0 ? (
                  agents.map((agent) => (
                    <button
                      key={agent.id}
                      className={`${styles.selectorOption} ${selectedAgentHash === agent.id ? styles.selected : ''}`}
                      onClick={() => { onAgentSelect?.(agent.id); setActiveSelector(null); }}
                    >
                      {agent.name}
                    </button>
                  ))
                ) : (
                  <span className={styles.emptyText}>No agents</span>
                )}
              </>
            )}
            
            {activeSelector === 'provider' && (
              providers.map((provider) => (
                <button
                  key={provider.id}
                  className={`${styles.selectorOption} ${selectedProvider === provider.id ? styles.selected : ''}`}
                  onClick={() => { onProviderSelect?.(provider.id); setActiveSelector(null); }}
                >
                  {provider.name}
                </button>
              ))
            )}
            
            {activeSelector === 'team' && (
              <>
                <button
                  className={`${styles.selectorOption} ${!selectedTeamId ? styles.selected : ''}`}
                  onClick={() => { onTeamSelect?.(null); setActiveSelector(null); }}
                >
                  None
                </button>
                {loading ? (
                  <span className={styles.loadingText}>...</span>
                ) : teams.length > 0 ? (
                  teams.map((team) => (
                    <button
                      key={team.id}
                      className={`${styles.selectorOption} ${selectedTeamId === team.id ? styles.selected : ''}`}
                      onClick={() => { onTeamSelect?.(team.id); setActiveSelector(null); }}
                    >
                      {team.name}
                    </button>
                  ))
                ) : (
                  <span className={styles.emptyText}>No teams</span>
                )}
              </>
            )}
          </div>
        )}

        {/* Subtle hint */}
        <p className={styles.minimalHint}>Type to start</p>
      </div>
    </div>
  );
};

export default FloatingHome;
