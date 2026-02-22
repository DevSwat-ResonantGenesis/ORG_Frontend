import React, { useState } from 'react';
import { FlaskConical, Plus, Search, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Eye, Edit2, Trash2, BarChart3, TrendingUp, TrendingDown, Users, Target, Percent } from 'lucide-react';

type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';
type VariantType = 'control' | 'treatment';

interface ExperimentVariant {
  id: string;
  name: string;
  type: VariantType;
  traffic: number;
  conversions: number;
  visitors: number;
  conversionRate: number;
  improvement?: number;
  isWinner?: boolean;
}

interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  hypothesis?: string;
  metric: string;
  variants: ExperimentVariant[];
  totalVisitors: number;
  confidence: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ABTestingManagerProps {
  experiments: Experiment[];
  onCreateExperiment?: () => void;
  onViewExperiment?: (experimentId: string) => void;
  onEditExperiment?: (experimentId: string) => void;
  onStartExperiment?: (experimentId: string) => void;
  onPauseExperiment?: (experimentId: string) => void;
  onEndExperiment?: (experimentId: string) => void;
  onDeleteExperiment?: (experimentId: string) => void;
  className?: string;
}

interface ExperimentCardProps {
  experiment: Experiment;
  onView?: () => void;
  onEdit?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<ExperimentStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  draft: {
    label: 'Draft',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Edit2 size={12} />,
  },
  running: {
    label: 'Running',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Play size={12} />,
  },
  paused: {
    label: 'Paused',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
  completed: {
    label: 'Completed',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  archived: {
    label: 'Archived',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
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
  experimentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  experimentCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  experimentCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  experimentCardRunning: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  experimentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  experimentTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  experimentIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  experimentMeta: {
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
  metricBadge: {
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
  experimentBody: {
    padding: '1.25rem',
  },
  hypothesis: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
  variantsSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  variantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  variantItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  variantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  variantIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  variantName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  variantType: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  variantStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  variantStat: {
    textAlign: 'right',
  },
  variantStatValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  variantStatLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  variantImprovement: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  winnerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
  },
  confidenceSection: {
    marginBottom: '1rem',
  },
  confidenceBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  confidenceTrack: {
    flex: 1,
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  confidenceValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e4e4e7',
    minWidth: '48px',
  },
  confidenceThreshold: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  experimentFooter: {
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
  startButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  pauseButton: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  endButton: {
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 95) return '#10b981';
  if (confidence >= 80) return '#f59e0b';
  return '#ef4444';
};

const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onView,
  onEdit,
  onStart,
  onPause,
  onEnd,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[experiment.status];
  const controlVariant = experiment.variants.find(v => v.type === 'control');
  const treatmentVariants = experiment.variants.filter(v => v.type === 'treatment');

  return (
    <div
      style={{
        ...styles.experimentCard,
        ...(isHovered ? styles.experimentCardHover : {}),
        ...(experiment.status === 'running' ? styles.experimentCardRunning : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.experimentHeader}>
        <div style={styles.experimentTitle}>
          <div
            style={{
              ...styles.experimentIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <FlaskConical size={22} />
          </div>
          <div style={styles.experimentInfo}>
            <div style={styles.experimentName}>{experiment.name}</div>
            <div style={styles.experimentMeta}>
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
              <span style={styles.metricBadge}>
                <Target size={10} />
                {experiment.metric}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.experimentBody}>
        {experiment.hypothesis && (
          <p style={styles.hypothesis}>"{experiment.hypothesis}"</p>
        )}

        <div style={styles.variantsSection}>
          <div style={styles.sectionTitle}>Variants ({experiment.variants.length})</div>
          <div style={styles.variantsList}>
            {experiment.variants.map((variant) => (
              <div key={variant.id} style={styles.variantItem}>
                <div style={styles.variantInfo}>
                  <div
                    style={{
                      ...styles.variantIndicator,
                      background: variant.type === 'control' ? '#888' : '#8b5cf6',
                    }}
                  />
                  <div>
                    <div style={styles.variantName}>{variant.name}</div>
                    <div style={styles.variantType}>
                      {variant.type} • {variant.traffic}% traffic
                    </div>
                  </div>
                </div>
                <div style={styles.variantStats}>
                  <div style={styles.variantStat}>
                    <div style={styles.variantStatValue}>{formatNumber(variant.visitors)}</div>
                    <div style={styles.variantStatLabel}>Visitors</div>
                  </div>
                  <div style={styles.variantStat}>
                    <div style={styles.variantStatValue}>{variant.conversionRate.toFixed(2)}%</div>
                    <div style={styles.variantStatLabel}>Conv Rate</div>
                  </div>
                  {variant.improvement !== undefined && variant.type === 'treatment' && (
                    <div
                      style={{
                        ...styles.variantImprovement,
                        color: variant.improvement >= 0 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {variant.improvement >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {variant.improvement >= 0 ? '+' : ''}{variant.improvement.toFixed(1)}%
                    </div>
                  )}
                  {variant.isWinner && (
                    <span style={styles.winnerBadge}>
                      <CheckCircle size={10} />
                      Winner
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.confidenceSection}>
          <div style={styles.sectionTitle}>Statistical Confidence</div>
          <div style={styles.confidenceBar}>
            <div style={styles.confidenceTrack}>
              <div
                style={{
                  ...styles.confidenceFill,
                  width: `${experiment.confidence}%`,
                  background: getConfidenceColor(experiment.confidence),
                }}
              />
            </div>
            <span style={styles.confidenceValue}>{experiment.confidence.toFixed(1)}%</span>
          </div>
          <span style={styles.confidenceThreshold}>
            {experiment.confidence >= 95 ? 'Statistically significant' : 'Need more data for significance'}
          </span>
        </div>
      </div>

      <div style={styles.experimentFooter}>
        <div style={styles.footerMeta}>
          <span>
            <Users size={12} style={{ marginRight: '0.25rem' }} />
            {formatNumber(experiment.totalVisitors)} visitors
          </span>
          {experiment.startDate && (
            <span>Started {formatDate(experiment.startDate)}</span>
          )}
        </div>
        <div style={styles.actionButtons}>
          {experiment.status === 'draft' && onStart && (
            <button style={{ ...styles.iconButton, ...styles.startButton }} onClick={onStart} title="Start">
              <Play size={14} />
            </button>
          )}
          {experiment.status === 'running' && onPause && (
            <button style={{ ...styles.iconButton, ...styles.pauseButton }} onClick={onPause} title="Pause">
              <Pause size={14} />
            </button>
          )}
          {experiment.status === 'paused' && onStart && (
            <button style={{ ...styles.iconButton, ...styles.startButton }} onClick={onStart} title="Resume">
              <Play size={14} />
            </button>
          )}
          {(experiment.status === 'running' || experiment.status === 'paused') && onEnd && (
            <button style={{ ...styles.iconButton, ...styles.endButton }} onClick={onEnd} title="End">
              <CheckCircle size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && experiment.status === 'draft' && (
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

export const ABTestingManager: React.FC<ABTestingManagerProps> = ({
  experiments,
  onCreateExperiment,
  onViewExperiment,
  onEditExperiment,
  onStartExperiment,
  onPauseExperiment,
  onEndExperiment,
  onDeleteExperiment,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExperiments = experiments.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningExperiments = experiments.filter(e => e.status === 'running').length;
  const completedExperiments = experiments.filter(e => e.status === 'completed').length;
  const totalVisitors = experiments.reduce((sum, e) => sum + e.totalVisitors, 0);
  const avgConfidence = experiments.length > 0
    ? experiments.reduce((sum, e) => sum + e.confidence, 0) / experiments.length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FlaskConical size={22} />
          A/B Testing Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search experiments..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateExperiment && (
            <button style={styles.createButton} onClick={onCreateExperiment}>
              <Plus size={14} />
              New Experiment
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Play size={20} />
          </div>
          <div style={styles.statValue}>{runningExperiments}</div>
          <div style={styles.statLabel}>Running</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{completedExperiments}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalVisitors)}</div>
          <div style={styles.statLabel}>Total Visitors</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Percent size={20} />
          </div>
          <div style={styles.statValue}>{avgConfidence.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Confidence</div>
        </div>
      </div>

      {/* Experiments Grid */}
      {filteredExperiments.length === 0 ? (
        <div style={styles.empty}>
          <FlaskConical size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No experiments found</span>
        </div>
      ) : (
        <div style={styles.experimentsGrid}>
          {filteredExperiments.map((experiment) => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onView={onViewExperiment ? () => onViewExperiment(experiment.id) : undefined}
              onEdit={onEditExperiment ? () => onEditExperiment(experiment.id) : undefined}
              onStart={onStartExperiment ? () => onStartExperiment(experiment.id) : undefined}
              onPause={onPauseExperiment ? () => onPauseExperiment(experiment.id) : undefined}
              onEnd={onEndExperiment ? () => onEndExperiment(experiment.id) : undefined}
              onDelete={onDeleteExperiment ? () => onDeleteExperiment(experiment.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ABTestingManager;
