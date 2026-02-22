import React, { useState } from 'react';
import { GitBranch, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Search, ChevronRight, ChevronDown, Eye, RotateCcw, Rocket, Box, Server, Globe } from 'lucide-react';

type PipelineStatus = 'running' | 'success' | 'failed' | 'pending' | 'cancelled';
type StageType = 'build' | 'test' | 'deploy' | 'verify';
type Environment = 'development' | 'staging' | 'production';

interface PipelineStage {
  id: string;
  name: string;
  type: StageType;
  status: PipelineStatus;
  duration?: number;
  startedAt?: Date;
  completedAt?: Date;
  logs?: string[];
}

interface Deployment {
  id: string;
  name: string;
  branch: string;
  commit: string;
  commitMessage: string;
  author: string;
  environment: Environment;
  status: PipelineStatus;
  stages: PipelineStage[];
  triggeredAt: Date;
  completedAt?: Date;
  duration?: number;
}

interface DeploymentPipelineProps {
  deployments: Deployment[];
  onTriggerDeploy?: (environment: Environment) => void;
  onViewDeployment?: (deploymentId: string) => void;
  onRetryDeployment?: (deploymentId: string) => void;
  onCancelDeployment?: (deploymentId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface DeploymentCardProps {
  deployment: Deployment;
  onView?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

const STATUS_CONFIG: Record<PipelineStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  running: {
    label: 'Running',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Play size={12} />,
  },
  success: {
    label: 'Success',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
};

const STAGE_TYPE_CONFIG: Record<StageType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  build: { label: 'Build', icon: <Box size={14} />, color: '#3b82f6' },
  test: { label: 'Test', icon: <CheckCircle size={14} />, color: '#8b5cf6' },
  deploy: { label: 'Deploy', icon: <Rocket size={14} />, color: '#10b981' },
  verify: { label: 'Verify', icon: <Eye size={14} />, color: '#f59e0b' },
};

const ENVIRONMENT_CONFIG: Record<Environment, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  development: { label: 'Development', color: '#3b82f6', icon: <Server size={14} /> },
  staging: { label: 'Staging', color: '#f59e0b', icon: <Server size={14} /> },
  production: { label: 'Production', color: '#10b981', icon: <Globe size={14} /> },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '180px',
  },
  deployButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  deploymentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  deploymentCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  deploymentCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  deploymentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  deploymentTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  deploymentIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deploymentInfo: {
    flex: 1,
  },
  deploymentName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  deploymentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  branchBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
  },
  envBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  deploymentActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  retryButton: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  cancelButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  pipelineStages: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.25rem',
    gap: '0.5rem',
    overflowX: 'auto',
  },
  stageCard: {
    flex: '1 1 0',
    minWidth: '120px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '1rem',
    textAlign: 'center',
    position: 'relative',
  },
  stageIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.5rem',
  },
  stageName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.25rem',
  },
  stageDuration: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  stageConnector: {
    width: '24px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  },
  commitInfo: {
    padding: '0.75rem 1.25rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
  },
  commitHash: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#888',
    marginRight: '0.5rem',
  },
  commitMessage: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const DeploymentCard: React.FC<DeploymentCardProps> = ({
  deployment,
  onView,
  onRetry,
  onCancel,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(deployment.status === 'running');

  const statusConfig = STATUS_CONFIG[deployment.status];
  const envConfig = ENVIRONMENT_CONFIG[deployment.environment];

  return (
    <div
      style={{
        ...styles.deploymentCard,
        ...(isHovered ? styles.deploymentCardHover : {}),
        borderLeftWidth: '4px',
        borderLeftColor: statusConfig.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.deploymentHeader}>
        <div style={styles.deploymentTitle}>
          <div
            style={{
              ...styles.deploymentIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Rocket size={20} />
          </div>
          <div style={styles.deploymentInfo}>
            <div style={styles.deploymentName}>{deployment.name}</div>
            <div style={styles.deploymentMeta}>
              <span style={styles.branchBadge}>
                <GitBranch size={10} />
                {deployment.branch}
              </span>
              <span
                style={{
                  ...styles.envBadge,
                  background: `${envConfig.color}20`,
                  color: envConfig.color,
                }}
              >
                {envConfig.icon}
                {envConfig.label}
              </span>
              <span
                style={{
                  ...styles.statusBadge,
                  background: statusConfig.bgColor,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span>
                <Clock size={12} style={{ marginRight: '0.25rem' }} />
                {formatTimeAgo(deployment.triggeredAt)}
              </span>
              {deployment.duration && (
                <span>Duration: {formatDuration(deployment.duration)}</span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.deploymentActions}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {deployment.status === 'failed' && onRetry && (
            <button style={{ ...styles.actionButton, ...styles.retryButton }} onClick={onRetry}>
              <RotateCcw size={12} />
              Retry
            </button>
          )}
          {deployment.status === 'running' && onCancel && (
            <button style={{ ...styles.actionButton, ...styles.cancelButton }} onClick={onCancel}>
              <Pause size={12} />
              Cancel
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView}>
              <Eye size={12} />
              View
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <>
          <div style={styles.pipelineStages}>
            {deployment.stages.map((stage, idx) => {
              const stageStatusConfig = STATUS_CONFIG[stage.status];
              const stageTypeConfig = STAGE_TYPE_CONFIG[stage.type];

              return (
                <React.Fragment key={stage.id}>
                  {idx > 0 && (
                    <div
                      style={{
                        ...styles.stageConnector,
                        background: stage.status === 'success' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      ...styles.stageCard,
                      borderColor: stageStatusConfig.color,
                    }}
                  >
                    <div
                      style={{
                        ...styles.stageIcon,
                        background: stageStatusConfig.bgColor,
                        color: stageStatusConfig.color,
                      }}
                    >
                      {stageTypeConfig.icon}
                    </div>
                    <div style={styles.stageName}>{stage.name}</div>
                    <div style={styles.stageDuration}>
                      {stage.duration ? formatDuration(stage.duration) : '--'}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          <div style={styles.commitInfo}>
            <span style={styles.commitHash}>{deployment.commit.slice(0, 7)}</span>
            <span style={styles.commitMessage}>{deployment.commitMessage}</span>
            <span style={{ marginLeft: '0.75rem', fontSize: '0.6875rem', color: '#888' }}>
              by {deployment.author}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const DeploymentPipeline: React.FC<DeploymentPipelineProps> = ({
  deployments,
  onTriggerDeploy,
  onViewDeployment,
  onRetryDeployment,
  onCancelDeployment,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeployments = deployments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningCount = deployments.filter(d => d.status === 'running').length;
  const successCount = deployments.filter(d => d.status === 'success').length;
  const failedCount = deployments.filter(d => d.status === 'failed').length;
  const totalCount = deployments.length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Rocket size={22} />
          Deployment Pipeline
          {runningCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                marginLeft: '0.5rem',
              }}
            >
              {runningCount} Running
            </span>
          )}
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search deployments..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onTriggerDeploy && (
            <button style={styles.deployButton} onClick={() => onTriggerDeploy('production')}>
              <Rocket size={14} />
              Deploy
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3b82f6' }}>{runningCount}</div>
          <div style={styles.statLabel}>Running</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{successCount}</div>
          <div style={styles.statLabel}>Success</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{failedCount}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalCount}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
      </div>

      {/* Deployments List */}
      {filteredDeployments.length === 0 ? (
        <div style={styles.empty}>
          <Rocket size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No deployments found</span>
        </div>
      ) : (
        <div style={styles.deploymentsList}>
          {filteredDeployments.map((deployment) => (
            <DeploymentCard
              key={deployment.id}
              deployment={deployment}
              onView={onViewDeployment ? () => onViewDeployment(deployment.id) : undefined}
              onRetry={onRetryDeployment ? () => onRetryDeployment(deployment.id) : undefined}
              onCancel={onCancelDeployment ? () => onCancelDeployment(deployment.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeploymentPipeline;
