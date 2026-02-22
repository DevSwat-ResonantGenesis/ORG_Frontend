import React, { useState } from 'react';
import { Workflow, Plus, Search, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Eye, Edit2, Trash2, Copy, ChevronRight, ChevronDown, Zap, GitBranch, Timer, Mail, Database, Code } from 'lucide-react';

type WorkflowStatus = 'active' | 'inactive' | 'draft' | 'error';
type TriggerType = 'manual' | 'schedule' | 'webhook' | 'event' | 'api';
type StepType = 'action' | 'condition' | 'loop' | 'delay' | 'notification';
type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  config?: Record<string, unknown>;
  nextStepId?: string;
  onSuccessStepId?: string;
  onFailureStepId?: string;
}

interface WorkflowTrigger {
  type: TriggerType;
  config?: Record<string, unknown>;
  schedule?: string;
}

interface WorkflowExecution {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  stepsCompleted: number;
  totalSteps: number;
}

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  version: string;
  executions: number;
  successRate: number;
  avgDuration: number;
  lastExecution?: WorkflowExecution;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowBuilderProps {
  workflows: WorkflowData[];
  onCreateWorkflow?: () => void;
  onViewWorkflow?: (workflowId: string) => void;
  onEditWorkflow?: (workflowId: string) => void;
  onCloneWorkflow?: (workflowId: string) => void;
  onToggleWorkflow?: (workflowId: string) => void;
  onDeleteWorkflow?: (workflowId: string) => void;
  onRunWorkflow?: (workflowId: string) => void;
  className?: string;
}

interface WorkflowCardProps {
  workflow: WorkflowData;
  onView?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onRun?: () => void;
}

const STATUS_CONFIG: Record<WorkflowStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  inactive: {
    label: 'Inactive',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Pause size={12} />,
  },
  draft: {
    label: 'Draft',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Edit2 size={12} />,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const TRIGGER_CONFIG: Record<TriggerType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  manual: { label: 'Manual', icon: <Play size={12} />, color: '#3b82f6' },
  schedule: { label: 'Schedule', icon: <Timer size={12} />, color: '#10b981' },
  webhook: { label: 'Webhook', icon: <Zap size={12} />, color: '#8b5cf6' },
  event: { label: 'Event', icon: <GitBranch size={12} />, color: '#f59e0b' },
  api: { label: 'API', icon: <Code size={12} />, color: '#ec4899' },
};

const STEP_TYPE_CONFIG: Record<StepType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  action: { label: 'Action', icon: <Zap size={12} />, color: '#3b82f6' },
  condition: { label: 'Condition', icon: <GitBranch size={12} />, color: '#8b5cf6' },
  loop: { label: 'Loop', icon: <Workflow size={12} />, color: '#10b981' },
  delay: { label: 'Delay', icon: <Timer size={12} />, color: '#f59e0b' },
  notification: { label: 'Notification', icon: <Mail size={12} />, color: '#ec4899' },
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
  workflowsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1rem',
  },
  workflowCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  workflowCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  workflowHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  workflowTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  workflowIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  workflowMeta: {
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
  triggerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  versionBadge: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  workflowBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  stepsSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  stepsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexWrap: 'wrap',
  },
  stepBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  stepConnector: {
    color: '#888',
    fontSize: '0.75rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
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
  lastExecution: {
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  executionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  executionStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  executionTime: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  executionProgress: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  executionFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  workflowFooter: {
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
  actionButton: {
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
  toggleButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
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
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
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
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onView,
  onEdit,
  onClone,
  onToggle,
  onDelete,
  onRun,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[workflow.status];
  const triggerConfig = TRIGGER_CONFIG[workflow.trigger.type];

  return (
    <div
      style={{
        ...styles.workflowCard,
        ...(isHovered ? styles.workflowCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.workflowHeader}>
        <div style={styles.workflowTitle}>
          <div
            style={{
              ...styles.workflowIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Workflow size={22} />
          </div>
          <div style={styles.workflowInfo}>
            <div style={styles.workflowName}>{workflow.name}</div>
            <div style={styles.workflowMeta}>
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
              <span
                style={{
                  ...styles.triggerBadge,
                  background: `${triggerConfig.color}20`,
                  color: triggerConfig.color,
                }}
              >
                {triggerConfig.icon}
                {triggerConfig.label}
              </span>
              <span style={styles.versionBadge}>v{workflow.version}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.workflowBody}>
        {workflow.description && (
          <p style={styles.description}>{workflow.description}</p>
        )}

        <div style={styles.stepsSection}>
          <div style={styles.sectionTitle}>Steps ({workflow.steps.length})</div>
          <div style={styles.stepsList}>
            {workflow.steps.slice(0, 5).map((step, idx) => {
              const stepConfig = STEP_TYPE_CONFIG[step.type];
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && <span style={styles.stepConnector}>→</span>}
                  <span style={{ ...styles.stepBadge, color: stepConfig.color }}>
                    {stepConfig.icon}
                    {step.name}
                  </span>
                </React.Fragment>
              );
            })}
            {workflow.steps.length > 5 && (
              <>
                <span style={styles.stepConnector}>→</span>
                <span style={styles.stepBadge}>+{workflow.steps.length - 5} more</span>
              </>
            )}
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatNumber(workflow.executions)}</div>
            <div style={styles.metricLabel}>Executions</div>
          </div>
          <div style={styles.metricItem}>
            <div style={{ ...styles.metricValue, color: workflow.successRate >= 95 ? '#10b981' : workflow.successRate >= 80 ? '#f59e0b' : '#ef4444' }}>
              {workflow.successRate.toFixed(1)}%
            </div>
            <div style={styles.metricLabel}>Success Rate</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatDuration(workflow.avgDuration)}</div>
            <div style={styles.metricLabel}>Avg Duration</div>
          </div>
        </div>

        {workflow.lastExecution && (
          <div style={styles.lastExecution}>
            <div style={styles.executionHeader}>
              <span
                style={{
                  ...styles.executionStatus,
                  color: workflow.lastExecution.status === 'completed' ? '#10b981' : workflow.lastExecution.status === 'failed' ? '#ef4444' : '#3b82f6',
                }}
              >
                {workflow.lastExecution.status === 'completed' ? <CheckCircle size={12} /> : workflow.lastExecution.status === 'failed' ? <XCircle size={12} /> : <Clock size={12} />}
                Last run: {workflow.lastExecution.status}
              </span>
              <span style={styles.executionTime}>{formatTimeAgo(workflow.lastExecution.startedAt)}</span>
            </div>
            <div style={styles.executionProgress}>
              <div
                style={{
                  ...styles.executionFill,
                  width: `${(workflow.lastExecution.stepsCompleted / workflow.lastExecution.totalSteps) * 100}%`,
                  background: workflow.lastExecution.status === 'completed' ? '#10b981' : workflow.lastExecution.status === 'failed' ? '#ef4444' : '#3b82f6',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div style={styles.workflowFooter}>
        <span style={styles.footerMeta}>Updated {formatTimeAgo(workflow.updatedAt)}</span>
        <div style={styles.actionButtons}>
          {onRun && workflow.status === 'active' && (
            <button style={{ ...styles.actionButton, ...styles.runButton }} onClick={onRun} title="Run">
              <Play size={14} />
            </button>
          )}
          {onToggle && (
            <button
              style={{
                ...styles.actionButton,
                ...(workflow.status === 'active' ? {} : styles.toggleButton),
              }}
              onClick={onToggle}
              title={workflow.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {workflow.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          {onClone && (
            <button style={styles.actionButton} onClick={onClone} title="Clone">
              <Copy size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  workflows,
  onCreateWorkflow,
  onViewWorkflow,
  onEditWorkflow,
  onCloneWorkflow,
  onToggleWorkflow,
  onDeleteWorkflow,
  onRunWorkflow,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalExecutions = workflows.reduce((sum, w) => sum + w.executions, 0);
  const avgSuccessRate = workflows.length > 0
    ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length
    : 0;
  const runningWorkflows = workflows.filter(w => w.lastExecution?.status === 'running').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Workflow size={22} />
          Workflow Builder
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search workflows..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateWorkflow && (
            <button style={styles.createButton} onClick={onCreateWorkflow}>
              <Plus size={14} />
              Create Workflow
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Workflow size={20} />
          </div>
          <div style={styles.statValue}>{activeWorkflows}</div>
          <div style={styles.statLabel}>Active Workflows</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Play size={20} />
          </div>
          <div style={styles.statValue}>{runningWorkflows}</div>
          <div style={styles.statLabel}>Running</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalExecutions)}</div>
          <div style={styles.statLabel}>Total Executions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{avgSuccessRate.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Success Rate</div>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div style={styles.empty}>
          <Workflow size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No workflows found</span>
        </div>
      ) : (
        <div style={styles.workflowsGrid}>
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onView={onViewWorkflow ? () => onViewWorkflow(workflow.id) : undefined}
              onEdit={onEditWorkflow ? () => onEditWorkflow(workflow.id) : undefined}
              onClone={onCloneWorkflow ? () => onCloneWorkflow(workflow.id) : undefined}
              onToggle={onToggleWorkflow ? () => onToggleWorkflow(workflow.id) : undefined}
              onDelete={onDeleteWorkflow ? () => onDeleteWorkflow(workflow.id) : undefined}
              onRun={onRunWorkflow ? () => onRunWorkflow(workflow.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowBuilder;
