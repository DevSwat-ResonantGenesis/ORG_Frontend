import React from 'react';
import styles from './AgentSelector.module.css';

export interface Agent {
    id: string | null;
    name: string;
    description: string;
    icon: string;
}

interface AgentSelectorProps {
    selectedAgent: string | null;
    onSelectAgent: (agentId: string | null) => void;
    agentMode: boolean;
    className?: string;
}

const AGENTS: Agent[] = [
    {
        id: null,
        name: 'Default',
        description: 'Standard multi-provider chat',
        icon: '💬'
    },
    {
        id: 'reasoning',
        name: 'Reasoning Agent',
        description: 'Deep analysis and problem-solving',
        icon: '🧠'
    },
    {
        id: 'code',
        name: 'Code Agent',
        description: 'Code generation and implementation',
        icon: '💻'
    },
    {
        id: 'research',
        name: 'Research Agent',
        description: 'Information gathering and synthesis',
        icon: '🔍'
    },
    {
        id: 'summary',
        name: 'Summary Agent',
        description: 'Concise summarization',
        icon: '📝'
    },
    {
        id: 'debug',
        name: 'Debug Agent',
        description: 'Error detection and fixing',
        icon: '🐛'
    },
    {
        id: 'planning',
        name: 'Planning Agent',
        description: 'Strategic planning and roadmaps',
        icon: '📋'
    }
];

export const AgentSelector: React.FC<AgentSelectorProps> = ({
    selectedAgent,
    onSelectAgent,
    agentMode,
    className = ''
}) => {
    if (!agentMode) {
        return null;
    }

    const currentAgent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0];

    return (
        <div className={`${styles.agentSelector} ${className}`}>
            <label className={styles.label}>
                <span className={styles.labelText}>Agent:</span>
                <select
                    className={styles.select}
                    value={selectedAgent || ''}
                    onChange={(e) => onSelectAgent(e.target.value || null)}
                    title="Select an agent for specialized tasks"
                >
                    {AGENTS.map(agent => (
                        <option key={agent.id || 'default'} value={agent.id || ''}>
                            {agent.icon} {agent.name} - {agent.description}
                        </option>
                    ))}
                </select>
            </label>

            {/* Visual indicator of selected agent */}
            <div className={styles.selectedIndicator}>
                <span className={styles.agentIcon}>{currentAgent.icon}</span>
                <span className={styles.agentName}>{currentAgent.name}</span>
            </div>
        </div>
    );
};

export default AgentSelector;
