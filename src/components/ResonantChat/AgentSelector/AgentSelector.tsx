import React, { useState, useEffect } from 'react';
import styles from './AgentSelector.module.css';

interface Agent {
  id: string;
  name: string;
  keywords: string[];
}

interface Team {
  id: string;
  name: string;
  agents: string[];
  workflow: string;
  description: string;
}

interface AgentSelectorProps {
  onSelectAgent?: (agentId: string) => void;
  onSelectTeam?: (teamId: string) => void;
  selectedAgent?: string;
  selectedTeam?: string;
  showTeams?: boolean;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  onSelectAgent,
  onSelectTeam,
  selectedAgent,
  selectedTeam,
  showTeams = true,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'teams'>('agents');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentsAndTeams();
  }, []);

  const fetchAgentsAndTeams = async () => {
    try {
      const [agentsRes, teamsRes] = await Promise.all([
        fetch('/resonant-chat/agents/list'),
        fetch('/resonant-chat/teams'),
      ]);

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data.agents || []);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents/teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    onSelectAgent?.(agentId);
    setIsOpen(false);
  };

  const handleTeamSelect = (teamId: string) => {
    onSelectTeam?.(teamId);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    if (selectedTeam) {
      const team = teams.find(t => t.id === selectedTeam);
      return team?.name || 'Select Team';
    }
    if (selectedAgent) {
      const agent = agents.find(a => a.id === selectedAgent);
      return agent?.name || 'Auto';
    }
    return 'Auto (Smart Routing)';
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.icon}>🤖</span>
        <span className={styles.label}>{getSelectedLabel()}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {showTeams && (
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'agents' ? styles.active : ''}`}
                onClick={() => setActiveTab('agents')}
              >
                Agents ({agents.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'teams' ? styles.active : ''}`}
                onClick={() => setActiveTab('teams')}
              >
                Teams ({teams.length})
              </button>
            </div>
          )}

          <div className={styles.list}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : activeTab === 'agents' ? (
              <>
                <button
                  className={`${styles.item} ${!selectedAgent ? styles.selected : ''}`}
                  onClick={() => handleAgentSelect('')}
                >
                  <span className={styles.itemIcon}>✨</span>
                  <div className={styles.itemContent}>
                    <span className={styles.itemName}>Auto (Smart Routing)</span>
                    <span className={styles.itemDesc}>Automatically selects best agent</span>
                  </div>
                </button>
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    className={`${styles.item} ${selectedAgent === agent.id ? styles.selected : ''}`}
                    onClick={() => handleAgentSelect(agent.id)}
                  >
                    <span className={styles.itemIcon}>{getAgentIcon(agent.id)}</span>
                    <div className={styles.itemContent}>
                      <span className={styles.itemName}>{agent.name}</span>
                      <span className={styles.itemDesc}>{agent.keywords.slice(0, 3).join(', ')}</span>
                    </div>
                  </button>
                ))}
              </>
            ) : (
              teams.map(team => (
                <button
                  key={team.id}
                  className={`${styles.item} ${selectedTeam === team.id ? styles.selected : ''}`}
                  onClick={() => handleTeamSelect(team.id)}
                >
                  <span className={styles.itemIcon}>👥</span>
                  <div className={styles.itemContent}>
                    <span className={styles.itemName}>{team.name}</span>
                    <span className={styles.itemDesc}>
                      {team.agents.join(' → ')} ({team.workflow})
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getAgentIcon = (agentId: string): string => {
  const icons: Record<string, string> = {
    reasoning: '🧠',
    code: '💻',
    debug: '🔧',
    research: '🔍',
    summary: '📝',
    planning: '📋',
    math: '🔢',
    security: '🔒',
    architecture: '🏗️',
    test: '🧪',
    review: '👀',
    explain: '💡',
    optimization: '⚡',
    documentation: '📚',
    migration: '🔄',
    api: '🔌',
    database: '🗄️',
    devops: '🚀',
    refactor: '♻️',
    accessibility: '♿',
    i18n: '🌍',
    regex: '🔤',
    git: '📦',
    css: '🎨',
  };
  return icons[agentId] || '🤖';
};

export default AgentSelector;
