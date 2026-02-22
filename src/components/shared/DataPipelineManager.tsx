import React, { useState } from 'react';
import { GitBranch, Plus, Search, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Eye, Edit2, Trash2, RefreshCw, Database, ArrowRight, Zap, BarChart3 } from 'lucide-react';

type PipelineStatus = 'running' | 'idle' | 'failed' | 'paused' | 'scheduled';
type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
type StageType = 'extract' | 'transform' | 'load' | 'validate' | 'enrich' | 'aggregate';

interface PipelineStage {
  id: string;
  name: string;
  type: StageType;
  status: StageStatus;
  duration?: number;
  recordsProcessed?: number;
  error?: string;
}

interface PipelineRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  recordsProcessed: number;
  duration: number;
}

interface DataPipeline {
  id: string;
  name: string;
  description?: string;
  status: PipelineStatus;
  stages: PipelineStage[];
  schedule?: string;
  source: string;
  destination: string;
  lastRun?: PipelineRun;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DataPipelineManagerProps {
  pipelines: DataPipeline[];
  onCreatePipeline?: () => void;
  onViewPipeline?: (pipelineId: string) => void;
  onEditPipeline?: (pipelineId: string) => void;
  onRunPipeline?: (pipelineId: string) => void;
  onPausePipeline?: (pipelineId: string) => void;
  onDeletePipeline?: (pipelineId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface PipelineCardProps {
  pipeline: DataPipeline;
  onView?: () => void;
  onEdit?: () => void;
  onRun?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
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
  idle: {
    label: 'Idle',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  paused: {
    label: 'Paused',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
  scheduled: {
    label: 'Scheduled',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Clock size={12} />,
  },
};

const STAGE_TYPE_CONFIG: Record<StageType, {
  label: string;
  color: string;
}> = {
  extract: { label: 'Extract', color: '#3b82f6' },
  transform: { label: 'Transform', color: '#8b5cf6' },
  load: { label: 'Load', color: '#10b981' },
  validate: { label: 'Validate', color: '#f59e0b' },
  enrich: { label: 'Enrich', color: '#ec4899' },
  aggregate: { label: 'Aggregate', color: '#14b8a6' },
};

const STAGE_STATUS_CONFIG: Record<StageStatus, {
  color: string;
  icon: React.ReactNode;
}> = {
  pending: { color: '#888', icon: <Clock size={10} /> },
  running: { color: '#3b82f6', icon: <RefreshCw size={10} /> },
  completed: { color: '#10b981', icon: <CheckCircle size={10} /> },
  failed: { color: '#ef4444', icon: <XCircle size={10} /> },
  skipped: { color: '#888', icon: <ArrowRight size={10} /> },
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
    width: '200px',
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
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
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  pipelinesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  pipelineCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  pipelineCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pipelineCardRunning: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  pipelineHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  pipelineTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  pipelineIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pipelineInfo: {
    flex: 1,
  },
  pipelineName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  pipelineMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
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
  scheduleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  pipelineBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  flowSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  flowDiagram: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  flowNode: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  flowArrow: {
    color: '#888',
    flexShrink: 0,
  },
  stagesSection: {
    marginBottom: '1rem',
  },
  stagesList: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  stageBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  metricItem: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  pipelineFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  runButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  pauseButton: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
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

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const PipelineCard: React.FC<PipelineCardProps> = ({
  pipeline,
  onView,
  onEdit,
  onRun,
  onPause,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[pipeline.status];

  return (
    <div
      style={{
        ...styles.pipelineCard,
        ...(isHovered ? styles.pipelineCardHover : {}),
        ...(pipeline.status === 'running' ? styles.pipelineCardRunning : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.pipelineHeader}>
        <div style={styles.pipelineTitle}>
          <div
            style={{
              ...styles.pipelineIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <GitBranch size={22} />
          </div>
          <div style={styles.pipelineInfo}>
            <div style={styles.pipelineName}>{pipeline.name}</div>
            <div style={styles.pipelineMeta}>
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
              {pipeline.schedule && (
                <span style={styles.scheduleBadge}>
                  <Clock size={10} />
                  {pipeline.schedule}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.pipelineBody}>
        {pipeline.description && (
          <p style={styles.description}>{pipeline.description}</p>
        )}

        <div style={styles.flowSection}>
          <div style={styles.sectionTitle}>Data Flow</div>
          <div style={styles.flowDiagram}>
            <span
              style={{
                ...styles.flowNode,
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
              }}
            >
              <Database size={12} />
              {pipeline.source}
            </span>
            <ArrowRight size={14} style={styles.flowArrow} />
            {pipeline.stages.slice(0, 3).map((stage, idx) => {
              const stageConfig = STAGE_TYPE_CONFIG[stage.type];
              const stageStatusConfig = STAGE_STATUS_CONFIG[stage.status];
              return (
                <React.Fragment key={stage.id}>
                  <span
                    style={{
                      ...styles.flowNode,
                      background: `${stageConfig.color}20`,
                      color: stageConfig.color,
                    }}
                  >
                    {stageStatusConfig.icon}
                    {stage.name}
                  </span>
                  {idx < Math.min(pipeline.stages.length - 1, 2) && (
                    <ArrowRight size={14} style={styles.flowArrow} />
                  )}
                </React.Fragment>
              );
            })}
            {pipeline.stages.length > 3 && (
              <>
                <ArrowRight size={14} style={styles.flowArrow} />
                <span style={{ ...styles.flowNode, background: 'rgba(255, 255, 255, 0.05)', color: '#888' }}>
                  +{pipeline.stages.length - 3} more
                </span>
              </>
            )}
            <ArrowRight size={14} style={styles.flowArrow} />
            <span
              style={{
                ...styles.flowNode,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
              }}
            >
              <Database size={12} />
              {pipeline.destination}
            </span>
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{pipeline.totalRuns}</div>
            <div style={styles.metricLabel}>Total Runs</div>
          </div>
          <div style={styles.metricItem}>
            <div style={{ ...styles.metricValue, color: pipeline.successRate >= 95 ? '#10b981' : pipeline.successRate >= 80 ? '#f59e0b' : '#ef4444' }}>
              {pipeline.successRate.toFixed(1)}%
            </div>
            <div style={styles.metricLabel}>Success Rate</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatDuration(pipeline.avgDuration)}</div>
            <div style={styles.metricLabel}>Avg Duration</div>
          </div>
        </div>
      </div>

      <div style={styles.pipelineFooter}>
        <span style={styles.footerMeta}>
          {pipeline.lastRun ? `Last run: ${formatTimeAgo(pipeline.lastRun.startedAt)}` : 'Never run'}
        </span>
        <div style={styles.actionButtons}>
          {pipeline.status === 'running' && onPause && (
            <button style={{ ...styles.iconButton, ...styles.pauseButton }} onClick={onPause} title="Pause">
              <Pause size={14} />
            </button>
          )}
          {pipeline.status !== 'running' && onRun && (
            <button style={{ ...styles.iconButton, ...styles.runButton }} onClick={onRun} title="Run">
              <Play size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const DataPipelineManager: React.FC<DataPipelineManagerProps> = ({
  pipelines,
  onCreatePipeline,
  onViewPipeline,
  onEditPipeline,
  onRunPipeline,
  onPausePipeline,
  onDeletePipeline,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPipelines = pipelines.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningPipelines = pipelines.filter(p => p.status === 'running').length;
  const scheduledPipelines = pipelines.filter(p => p.status === 'scheduled').length;
  const failedPipelines = pipelines.filter(p => p.status === 'failed').length;
  const totalRuns = pipelines.reduce((sum, p) => sum + p.totalRuns, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <GitBranch size={22} />
          Data Pipeline Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search pipelines..."
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
          {onCreatePipeline && (
            <button style={styles.createButton} onClick={onCreatePipeline}>
              <Plus size={14} />
              New Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Play size={20} />
          </div>
          <div style={styles.statValue}>{runningPipelines}</div>
          <div style={styles.statLabel}>Running</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{scheduledPipelines}</div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{failedPipelines}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalRuns)}</div>
          <div style={styles.statLabel}>Total Runs</div>
        </div>
      </div>

      {/* Pipelines Grid */}
      {filteredPipelines.length === 0 ? (
        <div style={styles.empty}>
          <GitBranch size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No pipelines found</span>
        </div>
      ) : (
        <div style={styles.pipelinesGrid}>
          {filteredPipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onView={onViewPipeline ? () => onViewPipeline(pipeline.id) : undefined}
              onEdit={onEditPipeline ? () => onEditPipeline(pipeline.id) : undefined}
              onRun={onRunPipeline ? () => onRunPipeline(pipeline.id) : undefined}
              onPause={onPausePipeline ? () => onPausePipeline(pipeline.id) : undefined}
              onDelete={onDeletePipeline ? () => onDeletePipeline(pipeline.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DataPipelineManager;
