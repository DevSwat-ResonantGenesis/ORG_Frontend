/**
 * Agent List Component
 * Displays all agents with actions to create, edit, and delete
 */
import { settingsApi, type Agent } from '@/api/settings';
import { AddIcon, DeleteIcon, EditIcon } from '@/components/Icons/SettingsIcons';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { CopyButton } from '@/components/ui/CopyButton';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Tooltip } from '@/components/ui/Tooltip';
import { logger } from '@/utils/logger';
import React, { useEffect, useState } from 'react';
import styles from './AgentList.module.css';
import { AgentRestoreDialog } from './AgentRestoreDialog';

interface AgentListProps {
  onEditAgent: (agentId: string) => void;
  onCreateAgent: () => void;
}

export const AgentList: React.FC<AgentListProps> = ({ onEditAgent, onCreateAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.listAgents();
      setAgents(data);
    } catch (err: any) {
      logger.error('Failed to load agents', err);
      setError(err?.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      await settingsApi.deleteAgent(agentId);
      await loadAgents();
    } catch (err: any) {
      logger.error('Failed to delete agent', err);
      alert(err?.message || 'Failed to delete agent');
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      // If activating, first deactivate all other agents (only one active at a time)
      if (newStatus === 'active') {
        const activeAgents = agents.filter(a => a.status === 'active' && a.id !== agentId);
        for (const activeAgent of activeAgents) {
          await settingsApi.updateAgent(activeAgent.id, { status: 'inactive' });
        }
      }

      await settingsApi.updateAgent(agentId, { status: newStatus });

      // Reload agents to get updated data including agent_hash
      await loadAgents();

      // Agent hash is managed in ResonantChat state only - no localStorage persistence
      // The chat page will fetch active agents from backend when needed
      if (newStatus === 'active') {
        logger.info('Agent activated', { agentId });
      } else {
        logger.info('Agent deactivated', { agentId });
      }
    } catch (err: any) {
      logger.error('Failed to update agent status', err);
      alert(err?.message || 'Failed to update agent status');
    }
  };

  if (loading) {
    return <LoadingState message="Loading agents..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadAgents} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Agents</h1>
          <p className={styles.subtitle}>Manage your AI agents</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={styles.createButton}
            onClick={() => setShowRestoreDialog(true)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <span>Restore Agent</span>
          </button>
          <Tooltip content="Create a new AI agent with custom configuration, system prompts, and behavior settings">
            <button className={styles.createButton} onClick={onCreateAgent}>
              <AddIcon size={16} />
              <span>Create Agent</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No agents yet. Create your first agent to get started.</p>
          <button className={styles.createButton} onClick={onCreateAgent}>
            Create Agent
          </button>
        </div>
      ) : (
        <div className={styles.agentGrid}>
          {agents.map((agent) => (
            <div key={agent.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentTitleRow}>
                  <h3 className={styles.agentName}>{agent.name}</h3>
                  <div className={styles.toggleContainer}>
                    <Tooltip content={agent.status === 'active' ? 'Deactivate agent' : 'Activate agent'}>
                      <ToggleSwitch
                        checked={agent.status === 'active'}
                        onChange={() => handleToggleStatus(agent.id, agent.status)}
                        size="small"
                      />
                    </Tooltip>
                    <span className={`${styles.statusLabel} ${agent.status === 'active' ? styles.statusOn : styles.statusOff}`}>
                      {agent.status === 'active' ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
                <span className={`${styles.status} ${styles[agent.status]}`}>
                  {agent.status}
                </span>
              </div>

              {agent.description && (
                <p className={styles.agentDescription}>{agent.description}</p>
              )}

              <div className={styles.agentMeta}>
                {agent.agent_hash && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Hash:</span>
                    <code className={styles.metaValue}>{agent.agent_hash}</code>
                    <CopyButton text={agent.agent_hash} size="small" />
                  </div>
                )}
                {agent.enabled_patches && agent.enabled_patches.length > 0 && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Patches:</span>
                    <span className={styles.metaValue}>{agent.enabled_patches.length} enabled</span>
                  </div>
                )}
              </div>

              <div className={styles.agentActions}>
                {agent.is_imported && (
                  <div className={styles.importedBadge}>
                    <span className={styles.badgeText}>📥 Imported (Read-only)</span>
                  </div>
                )}
                {!agent.is_imported && (
                  <>
                    <Tooltip content="Edit agent configuration, system prompts, memory settings, and patches">
                      <button
                        className={styles.editButton}
                        onClick={() => onEditAgent(agent.id)}
                      >
                        <EditIcon size={14} />
                        <span>Edit</span>
                      </button>
                    </Tooltip>
                    <Tooltip content="Permanently delete this agent. This action cannot be undone.">
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(agent.id)}
                      >
                        <DeleteIcon size={14} />
                        <span>Delete</span>
                      </button>
                    </Tooltip>
                  </>
                )}
                {agent.is_imported && (
                  <Tooltip content="This is a shared agent. You can use it but cannot edit or delete it. Only the creator can modify it.">
                    <button
                      className={styles.viewButton}
                      onClick={() => onEditAgent(agent.id)}
                      disabled
                    >
                      <EditIcon size={14} />
                      <span>View Only</span>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AgentRestoreDialog
        isOpen={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onRestored={() => loadAgents()}
      />
    </div>
  );
};

