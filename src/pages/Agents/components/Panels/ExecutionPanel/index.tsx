import React, { memo, useState, useCallback, useEffect } from 'react';
import { useExecutionStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Execution } from '../../../../../types';
import * as executionsApi from '../../../../../api/executions';
import { LiveWorkflowView } from './LiveWorkflowView';
import styles from './ExecutionPanel.module.css';

// ============== EXECUTION PANEL ==============
// Contract: reads [execution, agent, workflow], writes [execution]
// Forbidden: [economy]

type ViewMode = 'active' | 'live' | 'history' | 'queue' | 'metrics';

interface ExecutionStats {
  total_executions: number;
  successful: number;
  failed: number;
  avg_duration_ms: number;
  total_tokens: number;
  total_cost: number;
}

interface ExecutionPanelProps {
  className?: string;
}

const ExecutionPanelComponent: React.FC<ExecutionPanelProps> = ({ className }) => {
  const executions = useExecutionStore(state => state.executions);
  const activeExecutionId = useExecutionStore(state => state.activeExecutionId);
  const { cancelExecution, pauseExecution, resumeExecution, setActiveExecution } = useExecutionStore();
  const agents = useAgentStore(state => state.agents);
  
  const activeExecution = executions.find(e => e.id === activeExecutionId) || null;
  
  const [activeView, setActiveView] = useState<ViewMode>('active');
  const [filter, setFilter] = useState<string>('all');
  const [realExecutions, setRealExecutions] = useState<executionsApi.Execution[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<executionsApi.Execution | null>(null);
  const [executionStats, setExecutionStats] = useState<ExecutionStats | null>(null);

  const runningExecutions = realExecutions?.filter(e => e.status === 'running') || [];
  const completedExecutions = realExecutions?.filter(e => e.status === 'completed') || [];
  const failedExecutions = realExecutions?.filter(e => e.status === 'failed') || [];
  const queuedExecutions = realExecutions?.filter(e => e.status === 'initializing') || [];

  const getAgentName = useCallback((agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || 'Unknown Agent';
  }, [agents]);

  const getStatusColor = (status: executionsApi.Execution['status']) => {
    switch (status) {
      case 'running': return styles.running;
      case 'completed': return styles.completed;
      case 'failed': return styles.failed;
      case 'paused': return styles.paused;
      case 'initializing': return styles.pending;
      case 'waiting_approval': return styles.pending;
      case 'cancelled': return styles.failed;
      default: return '';
    }
  };

  const getProgress = (exec: executionsApi.Execution) => {
    const current =
      typeof exec.currentStep === 'number'
        ? exec.currentStep
        : typeof exec.loop_count === 'number'
          ? exec.loop_count
          : 0;

    const total =
      typeof exec.totalSteps === 'number'
        ? exec.totalSteps
        : Array.isArray(exec.steps) && exec.steps.length > 0
          ? exec.steps.length
          : 0;

    const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0;
    return { current, total, pct };
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Fetch executions from backend
  const fetchExecutions = useCallback(async () => {
    if (!selectedAgentId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await executionsApi.getAgentExecutions(selectedAgentId, {
        limit: 50,
        status: filter !== 'all' ? filter : undefined,
      });

      const normalized = (response.executions || []).map((e) => {
        const metrics = {
          durationMs: e.metrics?.durationMs ?? e.duration_ms ?? 0,
          tokensUsed: e.metrics?.tokensUsed ?? e.tokens_used ?? 0,
          costUsd: e.metrics?.costUsd ?? e.metrics?.cost ?? e.cost ?? 0,
          successRate: e.metrics?.successRate ?? 0,
        };

        const currentStep = typeof e.currentStep === 'number' ? e.currentStep : (e.loop_count ?? 0);
        const totalSteps = typeof e.totalSteps === 'number' ? e.totalSteps : (e.steps?.length ?? 0);

        return {
          ...e,
          agentId: e.agentId ?? e.agent_id,
          metrics,
          currentStep,
          totalSteps,
        };
      });

      setRealExecutions(normalized);
    } catch (err: any) {
      console.error('Failed to fetch executions:', err);
      setError(err.message || 'Failed to load executions');
      setRealExecutions([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId, filter]);

  // Fetch execution stats for metrics view
  const fetchStats = useCallback(async () => {
    if (!selectedAgentId) return;
    
    try {
      const stats = await executionsApi.getExecutionStats(selectedAgentId);
      setExecutionStats(stats);
    } catch (err: any) {
      console.error('Failed to fetch execution stats:', err);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    fetchExecutions();
    // Refresh every 5 seconds for active executions
    const interval = setInterval(() => {
      if (activeView === 'active') {
        fetchExecutions();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchExecutions, activeView]);

  // Fetch stats when metrics view is active
  useEffect(() => {
    if (activeView === 'metrics') {
      fetchStats();
    }
  }, [activeView, fetchStats]);

  // Set default agent if none selected
  useEffect(() => {
    if (!selectedAgentId && agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  const displayExecutions = realExecutions;

  const handleCancelSession = useCallback(async (sessionId: string) => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);
    try {
      await executionsApi.cancelAgentSession(sessionId);
      cancelExecution(sessionId);
      await fetchExecutions();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel execution');
    } finally {
      setIsLoading(false);
    }
  }, [cancelExecution, fetchExecutions]);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Execution /> Execution Monitor</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">Select Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.viewTabs}>
          {(['active', 'live', 'history', 'queue', 'metrics'] as ViewMode[]).map(view => (
            <button
              key={view}
              className={`${styles.viewTab} ${activeView === view ? styles.active : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view === 'live' && (
                <>
                  <Icons.Activity />
                  Live Workflow
                </>
              )}
              {view !== 'live' && view.charAt(0).toUpperCase() + view.slice(1)}
              {view === 'active' && runningExecutions.length > 0 && (
                <span className={styles.badge}>{runningExecutions.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Error Message */}
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingBanner}>
            <span>Loading executions...</span>
          </div>
        )}

        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Running</span>
            <span className={`${styles.statValue} ${styles.running}`}>{runningExecutions.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Queued</span>
            <span className={styles.statValue}>{queuedExecutions.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Completed</span>
            <span className={`${styles.statValue} ${styles.completed}`}>{completedExecutions.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Failed</span>
            <span className={`${styles.statValue} ${styles.failed}`}>{failedExecutions.length}</span>
          </div>
        </div>

        {/* Active Executions View */}
        {activeView === 'active' && (
          <div className={styles.executionsList}>
            <h3>Active Executions</h3>
            {displayExecutions.filter(e => e.status === 'running').map(exec => {
              const progress = getProgress(exec);

              return (
              <div 
                key={exec.id} 
                className={`${styles.executionCard} ${activeExecution?.id === exec.id ? styles.selected : ''}`}
                onClick={() => {
                  setActiveExecution(exec.id);
                  setSelectedExecution(exec);
                }}
              >
                <div className={styles.execHeader}>
                  <span className={`${styles.statusDot} ${getStatusColor(exec.status)}`} />
                  <span className={styles.execAgent}>{getAgentName(exec.agentId)}</span>
                  <span className={styles.execId}>#{exec.id.slice(-6)}</span>
                </div>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                  <span className={styles.progressText}>
                    {progress.total > 0
                      ? `Step ${progress.current} of ${progress.total}`
                      : `Step ${progress.current}`}
                  </span>
                </div>

                <div className={styles.execMeta}>
                  <span><Icons.Clock /> {formatDuration(exec.metrics.durationMs)}</span>
                  <span><Icons.Zap /> {exec.metrics.tokensUsed} tokens</span>
                  <span><Icons.DollarSign /> ${exec.metrics.costUsd.toFixed(3)}</span>
                </div>

                <div className={styles.execActions}>
                  {exec.status === 'running' && (
                    <>
                      <button disabled>
                        <Icons.Pause /> Pause
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleCancelSession(exec.id); }}>
                        <Icons.Stop /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
              );
            })}
            {displayExecutions.filter(e => e.status === 'running').length === 0 && (
              <div className={styles.emptyState}>
                <Icons.Execution />
                <p>No active executions</p>
              </div>
            )}
          </div>
        )}

        {/* Live Workflow View */}
        {activeView === 'live' && (
          <div className={styles.liveWorkflowView}>
            {selectedExecution ? (
              <LiveWorkflowView
                sessionId={selectedExecution.id}
                agentId={selectedExecution.agentId}
                agentName={getAgentName(selectedExecution.agentId)}
                isActive={selectedExecution.status === 'running' || selectedExecution.status === 'initializing'}
              />
            ) : (
              <div className={styles.noSelection}>
                <div className={styles.noSelectionContent}>
                  <Icons.Activity />
                  <h3>Select an Execution</h3>
                  <p>Choose an active execution from the Active tab to see its live workflow.</p>
                  <button 
                    className={styles.switchToActiveTab}
                    onClick={() => setActiveView('active')}
                  >
                    <Icons.Eye />
                    View Active Executions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <div className={styles.executionsList}>
            <h3>Execution History</h3>
            {displayExecutions.filter(e => e.status === 'completed' || e.status === 'failed').map(exec => (
              <div key={exec.id} className={styles.executionCard}>
                <div className={styles.execHeader}>
                  <span className={`${styles.statusDot} ${getStatusColor(exec.status)}`} />
                  <span className={styles.execAgent}>{getAgentName(exec.agentId)}</span>
                  <span className={`${styles.statusBadge} ${getStatusColor(exec.status)}`}>
                    {exec.status.toUpperCase()}
                  </span>
                </div>
                
                {exec.error && (
                  <div className={styles.errorMessage}>
                    <Icons.AlertTriangle /> {exec.error}
                  </div>
                )}

                <div className={styles.execMeta}>
                  <span><Icons.Clock /> {formatDuration(exec.metrics.durationMs)}</span>
                  <span><Icons.Zap /> {exec.metrics.tokensUsed} tokens</span>
                  <span><Icons.DollarSign /> ${exec.metrics.costUsd.toFixed(3)}</span>
                  <span><Icons.CheckCircle /> {exec.metrics.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Queue View */}
        {activeView === 'queue' && (
          <div className={styles.queueSection}>
            <h3>Execution Queue</h3>
            <div className={styles.emptyState}>
              <Icons.Clock />
              <p>No executions in queue</p>
              <button className={styles.primaryBtn}>
                <Icons.Plus /> Schedule Execution
              </button>
            </div>
          </div>
        )}

        {/* Metrics View */}
        {activeView === 'metrics' && (
          <div className={styles.metricsSection}>
            <h3>Execution Metrics</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <h4>Total Executions</h4>
                <span className={styles.metricValue}>
                  {executionStats?.total_executions ?? 0}
                </span>
                <span className={styles.metricChange}>All time</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Success Rate</h4>
                <span className={styles.metricValue}>
                  {executionStats && executionStats.total_executions > 0
                    ? ((executionStats.successful / executionStats.total_executions) * 100).toFixed(1)
                    : '0.0'}%
                </span>
                <span className={styles.metricChange}>
                  {executionStats?.successful ?? 0} successful / {executionStats?.failed ?? 0} failed
                </span>
              </div>
              <div className={styles.metricCard}>
                <h4>Avg Duration</h4>
                <span className={styles.metricValue}>
                  {executionStats?.avg_duration_ms 
                    ? formatDuration(executionStats.avg_duration_ms)
                    : '0s'}
                </span>
                <span className={styles.metricChange}>Per execution</span>
              </div>
              <div className={styles.metricCard}>
                <h4>Total Cost</h4>
                <span className={styles.metricValue}>
                  ${(executionStats?.total_cost ?? 0).toFixed(2)}
                </span>
                <span className={styles.metricChange}>
                  {executionStats?.total_tokens?.toLocaleString() ?? 0} tokens used
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ExecutionPanel = memo(ExecutionPanelComponent);
export default ExecutionPanel;
