import React from 'react';
import styles from './TeamVisualization.module.css';

interface TeamVisualizationProps {
  teamName: string;
  agents: string[];
  workflow: 'sequential' | 'parallel_merge';
  currentAgent?: string;
  isRunning?: boolean;
}

const TeamVisualization: React.FC<TeamVisualizationProps> = ({
  teamName,
  agents,
  workflow,
  currentAgent,
  isRunning = false,
}) => {
  const getAgentIcon = (agentType: string): string => {
    const icons: Record<string, string> = {
      reasoning: '🧠', code: '💻', debug: '🔧', research: '🔍',
      summary: '📝', planning: '📋', math: '🔢', security: '🔒',
      architecture: '🏗️', test: '🧪', review: '👀', explain: '💡',
      optimization: '⚡', documentation: '📚', migration: '🔄',
      api: '🔌', database: '🗄️', devops: '🚀', refactor: '♻️',
      accessibility: '♿', i18n: '🌍', regex: '🔤', git: '📦', css: '🎨',
    };
    return icons[agentType] || '🤖';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.teamIcon}>👥</span>
        <span className={styles.teamName}>{teamName}</span>
        {isRunning && <span className={styles.runningBadge}>Running...</span>}
      </div>

      <div className={`${styles.agentFlow} ${styles[workflow]}`}>
        {agents.map((agent, index) => (
          <React.Fragment key={agent}>
            <div
              className={`${styles.agentNode} ${
                currentAgent === agent ? styles.active : ''
              } ${
                isRunning && agents.indexOf(currentAgent || '') > index
                  ? styles.completed
                  : ''
              }`}
            >
              <span className={styles.agentIcon}>{getAgentIcon(agent)}</span>
              <span className={styles.agentName}>{agent}</span>
            </div>
            {index < agents.length - 1 && (
              <div className={styles.connector}>
                {workflow === 'sequential' ? '→' : '+'}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.workflowLabel}>
        {workflow === 'sequential' ? '🔄 Sequential' : '⚡ Parallel Merge'}
      </div>
    </div>
  );
};

export default TeamVisualization;
