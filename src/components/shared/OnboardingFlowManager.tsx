import React, { useState } from 'react';
import { Compass, Plus, Search, Play, Pause, CheckCircle, XCircle, Clock, Settings, Eye, Edit2, Trash2, Users, BarChart3, ArrowRight, ChevronRight, ChevronDown, Layers } from 'lucide-react';

type FlowStatus = 'active' | 'inactive' | 'draft' | 'archived';
type StepType = 'welcome' | 'form' | 'tour' | 'checklist' | 'video' | 'custom';

interface OnboardingStep {
  id: string;
  name: string;
  type: StepType;
  order: number;
  required: boolean;
  completionRate: number;
  avgDuration: number;
}

interface OnboardingFlow {
  id: string;
  name: string;
  description?: string;
  status: FlowStatus;
  steps: OnboardingStep[];
  targetAudience?: string;
  totalUsers: number;
  completedUsers: number;
  completionRate: number;
  avgCompletionTime: number;
  dropoffRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OnboardingFlowManagerProps {
  flows: OnboardingFlow[];
  onCreateFlow?: () => void;
  onViewFlow?: (flowId: string) => void;
  onEditFlow?: (flowId: string) => void;
  onToggleFlow?: (flowId: string) => void;
  onDeleteFlow?: (flowId: string) => void;
  onViewAnalytics?: (flowId: string) => void;
  className?: string;
}

interface FlowCardProps {
  flow: OnboardingFlow;
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onViewAnalytics?: () => void;
}

const STATUS_CONFIG: Record<FlowStatus, {
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
  archived: {
    label: 'Archived',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const STEP_TYPE_CONFIG: Record<StepType, {
  label: string;
  color: string;
}> = {
  welcome: { label: 'Welcome', color: '#3b82f6' },
  form: { label: 'Form', color: '#10b981' },
  tour: { label: 'Tour', color: '#8b5cf6' },
  checklist: { label: 'Checklist', color: '#f59e0b' },
  video: { label: 'Video', color: '#ec4899' },
  custom: { label: 'Custom', color: '#888' },
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
  flowsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  flowCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  flowCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  flowCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  flowHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  flowTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  flowIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flowInfo: {
    flex: 1,
  },
  flowName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  flowMeta: {
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
  audienceBadge: {
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
  flowBody: {
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
  stepsFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    overflowX: 'auto',
    padding: '0.5rem 0',
  },
  stepNode: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  stepArrow: {
    color: '#888',
    flexShrink: 0,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  metricItem: {
    textAlign: 'center',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  flowFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
  toggleButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  analyticsButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
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

const formatDuration = (minutes: number): string => {
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes}m`;
};

const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  onView,
  onEdit,
  onToggle,
  onDelete,
  onViewAnalytics,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[flow.status];

  return (
    <div
      style={{
        ...styles.flowCard,
        ...(isHovered ? styles.flowCardHover : {}),
        ...(flow.status === 'active' ? styles.flowCardActive : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.flowHeader}>
        <div style={styles.flowTitle}>
          <div
            style={{
              ...styles.flowIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Compass size={22} />
          </div>
          <div style={styles.flowInfo}>
            <div style={styles.flowName}>{flow.name}</div>
            <div style={styles.flowMeta}>
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
              {flow.targetAudience && (
                <span style={styles.audienceBadge}>
                  <Users size={10} />
                  {flow.targetAudience}
                </span>
              )}
              <span style={{ fontSize: '0.6875rem', color: '#888' }}>
                {flow.steps.length} steps
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.flowBody}>
        {flow.description && (
          <p style={styles.description}>{flow.description}</p>
        )}

        <div style={styles.stepsSection}>
          <div style={styles.sectionTitle}>Flow Steps</div>
          <div style={styles.stepsFlow}>
            {flow.steps.slice(0, 5).map((step, idx) => {
              const typeConfig = STEP_TYPE_CONFIG[step.type];
              return (
                <React.Fragment key={step.id}>
                  <span
                    style={{
                      ...styles.stepNode,
                      background: `${typeConfig.color}20`,
                      color: typeConfig.color,
                    }}
                  >
                    {step.name}
                  </span>
                  {idx < Math.min(flow.steps.length - 1, 4) && (
                    <ArrowRight size={12} style={styles.stepArrow} />
                  )}
                </React.Fragment>
              );
            })}
            {flow.steps.length > 5 && (
              <span style={{ ...styles.stepNode, background: 'rgba(255, 255, 255, 0.05)', color: '#888' }}>
                +{flow.steps.length - 5} more
              </span>
            )}
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatNumber(flow.totalUsers)}</div>
            <div style={styles.metricLabel}>Total Users</div>
          </div>
          <div style={styles.metricItem}>
            <div style={{ ...styles.metricValue, color: flow.completionRate >= 70 ? '#10b981' : flow.completionRate >= 50 ? '#f59e0b' : '#ef4444' }}>
              {flow.completionRate.toFixed(1)}%
            </div>
            <div style={styles.metricLabel}>Completion</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatDuration(flow.avgCompletionTime)}</div>
            <div style={styles.metricLabel}>Avg Time</div>
          </div>
        </div>
      </div>

      <div style={styles.flowFooter}>
        <div style={styles.footerMeta}>
          <span>By {flow.createdBy}</span>
          <span>{flow.completedUsers.toLocaleString()} completed</span>
        </div>
        <div style={styles.actionButtons}>
          {onViewAnalytics && (
            <button style={{ ...styles.iconButton, ...styles.analyticsButton }} onClick={onViewAnalytics} title="Analytics">
              <BarChart3 size={14} />
            </button>
          )}
          {onToggle && (
            <button
              style={{
                ...styles.iconButton,
                ...(flow.status === 'active' ? {} : styles.toggleButton),
              }}
              onClick={onToggle}
              title={flow.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {flow.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
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

export const OnboardingFlowManager: React.FC<OnboardingFlowManagerProps> = ({
  flows,
  onCreateFlow,
  onViewFlow,
  onEditFlow,
  onToggleFlow,
  onDeleteFlow,
  onViewAnalytics,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlows = flows.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlows = flows.filter(f => f.status === 'active').length;
  const totalUsers = flows.reduce((sum, f) => sum + f.totalUsers, 0);
  const avgCompletion = flows.length > 0
    ? flows.reduce((sum, f) => sum + f.completionRate, 0) / flows.length
    : 0;
  const totalCompleted = flows.reduce((sum, f) => sum + f.completedUsers, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Compass size={22} />
          Onboarding Flow Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search flows..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateFlow && (
            <button style={styles.createButton} onClick={onCreateFlow}>
              <Plus size={14} />
              New Flow
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{activeFlows}</div>
          <div style={styles.statLabel}>Active Flows</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalUsers)}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{avgCompletion.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Completion</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Layers size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalCompleted)}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      {/* Flows Grid */}
      {filteredFlows.length === 0 ? (
        <div style={styles.empty}>
          <Compass size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No onboarding flows found</span>
        </div>
      ) : (
        <div style={styles.flowsGrid}>
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onView={onViewFlow ? () => onViewFlow(flow.id) : undefined}
              onEdit={onEditFlow ? () => onEditFlow(flow.id) : undefined}
              onToggle={onToggleFlow ? () => onToggleFlow(flow.id) : undefined}
              onDelete={onDeleteFlow ? () => onDeleteFlow(flow.id) : undefined}
              onViewAnalytics={onViewAnalytics ? () => onViewAnalytics(flow.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingFlowManager;
