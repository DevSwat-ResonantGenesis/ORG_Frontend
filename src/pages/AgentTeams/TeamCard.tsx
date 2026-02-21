import React from 'react';
import { AgentTeam } from '../../api/agentTeams';
import { Button } from '../../components/ui';
import styles from './TeamCard.module.css';

interface TeamCardProps {
  team: AgentTeam;
  activeWorkflowCount?: number;
  onViewDashboard: (teamId: string) => void;
  onExecute: (teamId: string) => void;
  onEdit: (teamId: string) => void;
  onArchive: (teamId: string, teamName: string) => void;
  onUnarchive: (teamId: string, teamName: string) => void;
  onClick?: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  activeWorkflowCount = 0,
  onViewDashboard,
  onExecute,
  onEdit,
  onArchive,
  onUnarchive,
  onClick,
}) => {
  const statusColor = team.status === 'active' 
    ? 'var(--color-success-500)' 
    : team.status === 'archived'
    ? 'var(--color-gray-400)'
    : 'var(--color-warning-500)';

  const workflowTypeIcons = {
    sequential: '→',
    parallel: '⫸',
    branching: '⎇',
  };

  const workflowType = team.workflow_config?.type || 'sequential';

  return (
    <div 
      className={styles.teamCard}
      style={{ borderLeft: `4px solid ${statusColor}` }}
      onClick={() => onClick?.(team.id)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <div className={styles.teamTitle}>
            <span className={styles.teamIcon}>👥</span>
            <h3>{team.name}</h3>
            {team.status === 'active' && activeWorkflowCount > 0 && (
              <span className={styles.badge} style={{ background: 'var(--color-primary-500)' }}>
                {activeWorkflowCount} running
              </span>
            )}
          </div>
          <div className={styles.metadata}>
            <span className={styles.metaItem}>
              <span className={styles.statusDot} style={{ background: statusColor }} />
              {team.status}
            </span>
            <span className={styles.metaItem}>
              {workflowTypeIcons[workflowType]} {workflowType}
            </span>
            <span className={styles.metaItem}>
              🤖 {team.member_count} agents
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewDashboard(team.id);
            }}
            variant="primary"
            size="sm"
          >
            Dashboard
          </Button>
          {team.status === 'active' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onExecute(team.id);
              }}
              variant="secondary"
              size="sm"
            >
              Execute
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(team.id);
            }}
            variant="secondary"
            size="sm"
          >
            Edit
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              team.status === 'archived' 
                ? onUnarchive(team.id, team.name)
                : onArchive(team.id, team.name);
            }}
            variant="secondary"
            size="sm"
          >
            {team.status === 'archived' ? 'Restore' : 'Archive'}
          </Button>
        </div>
      </div>

      {team.description && (
        <p className={styles.description}>{team.description}</p>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.timestamp}>
          Created {new Date(team.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
