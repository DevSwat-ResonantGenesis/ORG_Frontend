import React, { useState } from 'react';
import { FlaskConical, Plus, Search, Play, CheckCircle, XCircle, Clock, AlertTriangle, BarChart3, TrendingUp, TrendingDown, Eye, Settings, RefreshCw, Download, ChevronRight, ChevronDown } from 'lucide-react';

type EvaluationStatus = 'running' | 'completed' | 'failed' | 'pending' | 'cancelled';
type MetricType = 'accuracy' | 'latency' | 'cost' | 'quality' | 'safety' | 'relevance';
type TestType = 'unit' | 'integration' | 'regression' | 'benchmark' | 'ab_test';

interface EvaluationMetric {
  type: MetricType;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
}

interface EvaluationRun {
  id: string;
  name: string;
  description?: string;
  type: TestType;
  status: EvaluationStatus;
  modelId: string;
  modelName: string;
  metrics: EvaluationMetric[];
  testCases: TestCase[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

interface EvaluationDashboardProps {
  evaluations: EvaluationRun[];
  onCreateEvaluation?: () => void;
  onViewEvaluation?: (evaluationId: string) => void;
  onRunEvaluation?: (evaluationId: string) => void;
  onExportResults?: (evaluationId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface EvaluationCardProps {
  evaluation: EvaluationRun;
  onView?: () => void;
  onRun?: () => void;
  onExport?: () => void;
}

const STATUS_CONFIG: Record<EvaluationStatus, {
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
  completed: {
    label: 'Completed',
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
    icon: <AlertTriangle size={12} />,
  },
};

const TEST_TYPE_CONFIG: Record<TestType, {
  label: string;
  color: string;
}> = {
  unit: { label: 'Unit', color: '#3b82f6' },
  integration: { label: 'Integration', color: '#10b981' },
  regression: { label: 'Regression', color: '#8b5cf6' },
  benchmark: { label: 'Benchmark', color: '#f59e0b' },
  ab_test: { label: 'A/B Test', color: '#ec4899' },
};

const METRIC_TYPE_CONFIG: Record<MetricType, {
  label: string;
  color: string;
}> = {
  accuracy: { label: 'Accuracy', color: '#10b981' },
  latency: { label: 'Latency', color: '#3b82f6' },
  cost: { label: 'Cost', color: '#f59e0b' },
  quality: { label: 'Quality', color: '#8b5cf6' },
  safety: { label: 'Safety', color: '#ef4444' },
  relevance: { label: 'Relevance', color: '#14b8a6' },
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
  evaluationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  evaluationCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  evaluationCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  evaluationHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  evaluationTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  evaluationIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  evaluationInfo: {
    flex: 1,
  },
  evaluationName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  evaluationMeta: {
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
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
  },
  evaluationBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  testResultsSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  testResultsBar: {
    display: 'flex',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  testResultsSegment: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  testResultsStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
  },
  testStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  testStatDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  metricItem: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  metricTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
    fontSize: '0.5625rem',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  metricTarget: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  evaluationFooter: {
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
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  onView,
  onRun,
  onExport,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[evaluation.status];
  const typeConfig = TEST_TYPE_CONFIG[evaluation.type];
  const passRate = evaluation.totalTests > 0
    ? (evaluation.passedTests / evaluation.totalTests) * 100
    : 0;

  return (
    <div
      style={{
        ...styles.evaluationCard,
        ...(isHovered ? styles.evaluationCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.evaluationHeader}>
        <div style={styles.evaluationTitle}>
          <div
            style={{
              ...styles.evaluationIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <FlaskConical size={22} />
          </div>
          <div style={styles.evaluationInfo}>
            <div style={styles.evaluationName}>{evaluation.name}</div>
            <div style={styles.evaluationMeta}>
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
                  ...styles.typeBadge,
                  background: `${typeConfig.color}20`,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
              <span style={styles.modelBadge}>{evaluation.modelName}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.evaluationBody}>
        {evaluation.description && (
          <p style={styles.description}>{evaluation.description}</p>
        )}

        <div style={styles.testResultsSection}>
          <div style={styles.sectionTitle}>Test Results</div>
          <div style={styles.testResultsBar}>
            <div
              style={{
                ...styles.testResultsSegment,
                width: `${(evaluation.passedTests / evaluation.totalTests) * 100}%`,
                background: '#10b981',
              }}
            />
            <div
              style={{
                ...styles.testResultsSegment,
                width: `${(evaluation.failedTests / evaluation.totalTests) * 100}%`,
                background: '#ef4444',
              }}
            />
            <div
              style={{
                ...styles.testResultsSegment,
                width: `${(evaluation.skippedTests / evaluation.totalTests) * 100}%`,
                background: '#888',
              }}
            />
          </div>
          <div style={styles.testResultsStats}>
            <span style={styles.testStat}>
              <span style={{ ...styles.testStatDot, background: '#10b981' }} />
              {evaluation.passedTests} passed
            </span>
            <span style={styles.testStat}>
              <span style={{ ...styles.testStatDot, background: '#ef4444' }} />
              {evaluation.failedTests} failed
            </span>
            <span style={styles.testStat}>
              <span style={{ ...styles.testStatDot, background: '#888' }} />
              {evaluation.skippedTests} skipped
            </span>
            <span style={{ marginLeft: 'auto', fontWeight: '600', color: passRate >= 90 ? '#10b981' : passRate >= 70 ? '#f59e0b' : '#ef4444' }}>
              {passRate.toFixed(1)}% pass rate
            </span>
          </div>
        </div>

        {evaluation.metrics.length > 0 && (
          <div style={styles.metricsGrid}>
            {evaluation.metrics.slice(0, 6).map((metric) => {
              const metricConfig = METRIC_TYPE_CONFIG[metric.type];
              const trendColor = metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#888';
              const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : BarChart3;

              return (
                <div key={metric.type} style={styles.metricItem}>
                  <div style={styles.metricHeader}>
                    <span style={{ ...styles.metricLabel, color: metricConfig.color }}>
                      {metricConfig.label}
                    </span>
                    <span style={{ ...styles.metricTrend, color: trendColor }}>
                      <TrendIcon size={10} />
                      {metric.trendPercent > 0 ? '+' : ''}{metric.trendPercent.toFixed(1)}%
                    </span>
                  </div>
                  <span style={styles.metricValue}>
                    {metric.value}{metric.unit}
                  </span>
                  <span style={styles.metricTarget}> / {metric.target}{metric.unit}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.evaluationFooter}>
        <div style={styles.footerMeta}>
          <span>Duration: {formatDuration(evaluation.duration)}</span>
          <span>By {evaluation.createdBy}</span>
          <span>{formatTimeAgo(evaluation.createdAt)}</span>
        </div>
        <div style={styles.actionButtons}>
          {onRun && evaluation.status !== 'running' && (
            <button style={{ ...styles.actionButton, ...styles.runButton }} onClick={onRun} title="Run">
              <Play size={14} />
            </button>
          )}
          {onExport && evaluation.status === 'completed' && (
            <button style={styles.actionButton} onClick={onExport} title="Export">
              <Download size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  evaluations,
  onCreateEvaluation,
  onViewEvaluation,
  onRunEvaluation,
  onExportResults,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvaluations = evaluations.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
  const runningEvaluations = evaluations.filter(e => e.status === 'running').length;
  const totalTests = evaluations.reduce((sum, e) => sum + e.totalTests, 0);
  const avgPassRate = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + (e.passedTests / e.totalTests) * 100, 0) / evaluations.length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FlaskConical size={22} />
          Evaluation Dashboard
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search evaluations..."
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
          {onCreateEvaluation && (
            <button style={styles.createButton} onClick={onCreateEvaluation}>
              <Plus size={14} />
              New Evaluation
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
          <div style={styles.statValue}>{completedEvaluations}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Play size={20} />
          </div>
          <div style={styles.statValue}>{runningEvaluations}</div>
          <div style={styles.statLabel}>Running</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <FlaskConical size={20} />
          </div>
          <div style={styles.statValue}>{totalTests}</div>
          <div style={styles.statLabel}>Total Tests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{avgPassRate.toFixed(1)}%</div>
          <div style={styles.statLabel}>Avg Pass Rate</div>
        </div>
      </div>

      {/* Evaluations Grid */}
      {filteredEvaluations.length === 0 ? (
        <div style={styles.empty}>
          <FlaskConical size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No evaluations found</span>
        </div>
      ) : (
        <div style={styles.evaluationsGrid}>
          {filteredEvaluations.map((evaluation) => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onView={onViewEvaluation ? () => onViewEvaluation(evaluation.id) : undefined}
              onRun={onRunEvaluation ? () => onRunEvaluation(evaluation.id) : undefined}
              onExport={onExportResults ? () => onExportResults(evaluation.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationDashboard;
