// ============== WORKFLOW PERFORMANCE MONITOR ==============
// Real-time performance monitoring for workflow execution

import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { usePerformanceMonitor, useExecutionHistory } from '../../hooks/useWorkflowPerformance';
import styles from './WorkflowPerformanceMonitor.module.css';

interface WorkflowMetrics {
  executionTime: number;
  stepCount: number;
  successRate: number;
  avgStepDuration: number;
  memoryPeak: number;
  cpuPeak: number;
}

interface PerformanceEvent {
  id: string;
  timestamp: Date;
  type: 'start' | 'step' | 'complete' | 'error' | 'warning';
  message: string;
  duration?: number;
  metadata?: Record<string, any>;
}

interface WorkflowPerformanceMonitorProps {
  workflowId?: string;
  executionId?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const WorkflowPerformanceMonitorComponent: React.FC<WorkflowPerformanceMonitorProps> = ({
  workflowId,
  executionId,
  isExpanded = true,
  onToggle,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'timeline' | 'history'>('metrics');
  const [events, setEvents] = useState<PerformanceEvent[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    executionTime: 0,
    stepCount: 0,
    successRate: 100,
    avgStepDuration: 0,
    memoryPeak: 0,
    cpuPeak: 0,
  });

  const perfMetrics = usePerformanceMonitor();
  const { executions, stats } = useExecutionHistory(workflowId, 20);
  const startTimeRef = useRef<number>(0);
  const eventIdRef = useRef(0);

  // Track execution metrics
  useEffect(() => {
    if (executionId) {
      startTimeRef.current = performance.now();
      addEvent('start', 'Workflow execution started');
    }
  }, [executionId]);

  const addEvent = useCallback((type: PerformanceEvent['type'], message: string, metadata?: Record<string, any>) => {
    const duration = startTimeRef.current ? performance.now() - startTimeRef.current : 0;
    setEvents(prev => [...prev.slice(-99), {
      id: `event-${eventIdRef.current++}`,
      timestamp: new Date(),
      type,
      message,
      duration: Math.round(duration),
      metadata,
    }]);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!executionId) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        executionTime: Math.round(performance.now() - startTimeRef.current),
        memoryPeak: Math.max(prev.memoryPeak, perfMetrics.memory),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [executionId, perfMetrics.memory]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getEventIcon = (type: PerformanceEvent['type']) => {
    switch (type) {
      case 'start': return '🚀';
      case 'step': return '⚡';
      case 'complete': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '•';
    }
  };

  if (!isExpanded) {
    return (
      <div className={`${styles.collapsed} ${className || ''}`} onClick={onToggle}>
        <span className={styles.collapsedIcon}>📊</span>
        <span className={styles.collapsedLabel}>Performance</span>
        <span className={styles.collapsedFps}>{perfMetrics.fps} FPS</span>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>📊</span>
          Performance Monitor
        </h3>
        <div className={styles.headerStats}>
          <span className={styles.fps}>{perfMetrics.fps} FPS</span>
          <span className={styles.memory}>{perfMetrics.memory}MB</span>
        </div>
        {onToggle && (
          <button className={styles.toggleBtn} onClick={onToggle}>−</button>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'metrics' ? styles.active : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'metrics' && (
          <div className={styles.metricsPanel}>
            <div className={styles.metricsGrid}>
              <MetricCard
                label="Execution Time"
                value={formatDuration(metrics.executionTime)}
                icon="⏱️"
                trend={metrics.executionTime > 5000 ? 'warning' : 'normal'}
              />
              <MetricCard
                label="Steps Completed"
                value={`${metrics.stepCount}`}
                icon="📋"
              />
              <MetricCard
                label="Success Rate"
                value={`${metrics.successRate.toFixed(1)}%`}
                icon="✅"
                trend={metrics.successRate < 90 ? 'warning' : 'good'}
              />
              <MetricCard
                label="Avg Step Duration"
                value={formatDuration(metrics.avgStepDuration)}
                icon="⚡"
              />
              <MetricCard
                label="Memory Peak"
                value={`${metrics.memoryPeak}MB`}
                icon="💾"
                trend={metrics.memoryPeak > 500 ? 'warning' : 'normal'}
              />
              <MetricCard
                label="Current FPS"
                value={`${perfMetrics.fps}`}
                icon="🖥️"
                trend={perfMetrics.fps < 30 ? 'warning' : 'good'}
              />
            </div>

            {stats && (
              <div className={styles.statsSection}>
                <h4 className={styles.sectionTitle}>Historical Stats</h4>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Executions</span>
                    <span className={styles.statValue}>{stats.total}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Completed</span>
                    <span className={styles.statValue}>{stats.completed}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Failed</span>
                    <span className={styles.statValue}>{stats.failed}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Avg Duration</span>
                    <span className={styles.statValue}>{formatDuration(stats.avgDuration)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className={styles.timelinePanel}>
            {events.length === 0 ? (
              <div className={styles.emptyTimeline}>
                <span className={styles.emptyIcon}>📜</span>
                <p>No events yet</p>
                <small>Start a workflow to see events</small>
              </div>
            ) : (
              <div className={styles.timeline}>
                {events.slice().reverse().map(event => (
                  <div key={event.id} className={`${styles.timelineEvent} ${styles[event.type]}`}>
                    <span className={styles.eventIcon}>{getEventIcon(event.type)}</span>
                    <div className={styles.eventContent}>
                      <span className={styles.eventMessage}>{event.message}</span>
                      <span className={styles.eventMeta}>
                        {event.timestamp.toLocaleTimeString()}
                        {event.duration !== undefined && ` • ${formatDuration(event.duration)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.historyPanel}>
            {executions.length === 0 ? (
              <div className={styles.emptyHistory}>
                <span className={styles.emptyIcon}>📚</span>
                <p>No execution history</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {executions.map(exec => (
                  <div key={exec.id} className={`${styles.historyItem} ${styles[exec.status]}`}>
                    <div className={styles.historyStatus}>
                      {exec.status === 'completed' && '✅'}
                      {exec.status === 'failed' && '❌'}
                      {exec.status === 'running' && '🔄'}
                      {exec.status === 'pending' && '⏳'}
                    </div>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyId}>{exec.id.slice(-8)}</span>
                      <span className={styles.historyTime}>
                        {new Date(exec.startedAt).toLocaleString()}
                      </span>
                    </div>
                    {exec.completedAt && (
                      <span className={styles.historyDuration}>
                        {formatDuration(
                          new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============== METRIC CARD ==============

interface MetricCardProps {
  label: string;
  value: string;
  icon: string;
  trend?: 'good' | 'warning' | 'normal';
}

const MetricCard: React.FC<MetricCardProps> = memo(({ label, value, icon, trend = 'normal' }) => (
  <div className={`${styles.metricCard} ${styles[trend]}`}>
    <span className={styles.metricIcon}>{icon}</span>
    <div className={styles.metricInfo}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  </div>
));

MetricCard.displayName = 'MetricCard';

export const WorkflowPerformanceMonitor = memo(WorkflowPerformanceMonitorComponent);
export default WorkflowPerformanceMonitor;
