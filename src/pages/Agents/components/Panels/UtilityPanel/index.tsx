import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as executionsApi from '../../../../../api/executions';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './UtilityPanel.module.css';

// ============== UTILITY PANEL ==============
// Contract: reads [agent, execution], writes [agent]

type ViewMode = 'overview' | 'agents' | 'trends';

interface AgentUtility {
  id: string;
  name: string;
  score: number;
  executions: number;
  successRate: number;
  avgDuration: number;
  totalTokens: number;
  costToday: number;
}

interface UtilityPanelProps {
  className?: string;
}

const UtilityPanelComponent: React.FC<UtilityPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<executionsApi.Execution[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [agentUtilities, setAgentUtilities] = useState<AgentUtility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [trendsData, setTrendsData] = useState<any>(null);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch platform-wide metrics
  const fetchPlatformMetrics = useCallback(async () => {
    try {
      const res = await fastapiClient.get('/api/v1/agents/metrics');
      setPlatformMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch platform metrics:', err);
    }
  }, []);

  // Fetch executions for selected agent or all
  const fetchExecutions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedAgentId) {
        const data = await executionsApi.getExecutions(selectedAgentId);
        setExecutions((data as any).executions || data || []);
      } else {
        // Fetch metrics for all agents
        const utilities: AgentUtility[] = [];
        for (const agent of agents) {
          try {
            const metricsRes = await fastapiClient.get(`/api/v1/agents/${agent.id}/metrics`);
            const m = metricsRes.data || {};
            const total = Number(m.sessions_total || 0);
            const completed = Number(m.sessions_by_status?.completed || 0);
            const failed = Number(m.sessions_by_status?.failed || 0);
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const score = Math.round(rate * 0.6 + Math.min(total, 100) * 0.4);
            utilities.push({
              id: agent.id,
              name: agent.name,
              score,
              executions: total,
              successRate: rate,
              avgDuration: Number(m.avg_duration_ms || 0) / 1000,
              totalTokens: Number(m.total_tokens_used || 0),
              costToday: agent.costToday || 0,
            });
          } catch {
            utilities.push({
              id: agent.id,
              name: agent.name,
              score: 0,
              executions: 0,
              successRate: 0,
              avgDuration: 0,
              totalTokens: 0,
              costToday: 0,
            });
          }
        }
        setAgentUtilities(utilities);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load utility data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId, agents]);

  // Fetch analytics trends from backend
  useEffect(() => {
    if (activeView === 'trends') {
      fastapiClient.get('/api/v1/analytics/trends?period=7d')
        .then(res => setTrendsData(res.data))
        .catch(() => {});
    }
  }, [activeView]);

  useEffect(() => {
    fetchPlatformMetrics();
    fetchExecutions();
    pollRef.current = setInterval(() => {
      fetchPlatformMetrics();
    }, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchPlatformMetrics, fetchExecutions]);

  // Calculate utility metrics from executions
  const calculateMetrics = () => {
    if (selectedAgentId && executions.length > 0) {
      const completed = executions.filter(e => e.status === 'completed').length;
      const failed = executions.filter(e => e.status === 'failed').length;
      const total = executions.length;
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const avgDuration = executions.reduce((sum, e) => {
        if (e.completed_at && e.started_at) {
          return sum + (new Date(e.completed_at).getTime() - new Date(e.started_at).getTime()) / 1000;
        }
        return sum;
      }, 0) / (completed || 1);

      return { completed, failed, total, successRate, avgDuration };
    }

    // Platform-wide from metrics endpoint
    const pm = platformMetrics || {};
    return {
      completed: Number(pm.total_completed || 0),
      failed: Number(pm.total_failed || 0),
      total: Number(pm.total_sessions || pm.total_agents || 0),
      successRate: Number(pm.success_rate || 0),
      avgDuration: Number(pm.avg_duration_ms || 0) / 1000,
    };
  };

  const metrics = calculateMetrics();
  const overallScore = metrics.total > 0
    ? Math.round(metrics.successRate * 0.6 + Math.min(metrics.total, 100) * 0.4)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.TrendingUp /> Utility Analytics</h2>
        <div className={styles.headerControls}>
          <div className={styles.viewTabs}>
            {(['overview', 'agents', 'trends'] as ViewMode[]).map(v => (
              <button
                key={v}
                className={`${styles.viewTab} ${activeView === v ? styles.active : ''}`}
                onClick={() => setActiveView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.agentSelector}>
            <select
              value={selectedAgentId || ''}
              onChange={e => setSelectedAgentId(e.target.value || null)}
            >
              <option value="">All Agents</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.panelContent}>
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Overview */}
        {activeView === 'overview' && (
          <>
            <div className={styles.scoreSection}>
              <div className={styles.overallScore}>
                <div className={styles.scoreCircle} style={{ borderColor: getScoreColor(overallScore) }}>
                  <span className={styles.scoreValue} style={{ color: getScoreColor(overallScore) }}>{overallScore}</span>
                  <span className={styles.scoreLabel}>Utility Score</span>
                </div>
              </div>
              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{agents.length}</span>
                  <span className={styles.quickLabel}>Total Agents</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{metrics.total}</span>
                  <span className={styles.quickLabel}>Total Executions</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{metrics.successRate}%</span>
                  <span className={styles.quickLabel}>Success Rate</span>
                </div>
              </div>
            </div>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <h4>Task Completion Rate</h4>
                <div className={styles.metricValue}>{metrics.successRate}%</div>
                <div className={styles.metricTarget}>Target: 95%</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(metrics.successRate / 95 * 100, 100)}%` }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h4>Avg Duration</h4>
                <div className={styles.metricValue}>{metrics.avgDuration.toFixed(1)}s</div>
                <div className={styles.metricTarget}>Target: 30s</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(100, Math.max(0, (1 - metrics.avgDuration / 60) * 100))}%` }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h4>Completed Tasks</h4>
                <div className={styles.metricValue}>{metrics.completed}</div>
                <div className={styles.metricTarget}>Target: 100</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(metrics.completed, 100)}%` }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h4>Failed Tasks</h4>
                <div className={`${styles.metricValue} ${styles.failedValue}`}>{metrics.failed}</div>
                <div className={styles.metricTarget}>Target: &lt;5</div>
                <div className={styles.progressBar}>
                  <div className={`${styles.progressFill} ${styles.progressDanger}`} style={{ width: `${Math.min(metrics.failed / 5 * 100, 100)}%` }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h4>Total Executions</h4>
                <div className={styles.metricValue}>{metrics.total}</div>
                <div className={styles.metricTarget}>Target: 100</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${Math.min(metrics.total, 100)}%` }}></div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <h4>Platform Agents</h4>
                <div className={styles.metricValue}>{platformMetrics?.total_agents || agents.length}</div>
                <div className={styles.metricTarget}>Active: {platformMetrics?.active_agents || agents.filter(a => a.status === 'active').length}</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Agent Comparison */}
        {activeView === 'agents' && (
          <div className={styles.agentComparison}>
            <h3>Agent Utility Ranking</h3>
            {isLoading ? (
              <div className={styles.loadingState}>Loading agent metrics...</div>
            ) : agentUtilities.length > 0 ? (
              <div className={styles.agentRanking}>
                {[...agentUtilities].sort((a, b) => b.score - a.score).map((au, idx) => (
                  <div key={au.id} className={styles.rankCard}>
                    <span className={styles.rankNumber}>#{idx + 1}</span>
                    <div className={styles.rankInfo}>
                      <span className={styles.rankName}>{au.name}</span>
                      <div className={styles.rankStats}>
                        <span>{au.executions} runs</span>
                        <span>{au.successRate}% success</span>
                        <span>{au.avgDuration.toFixed(1)}s avg</span>
                        <span>{au.totalTokens.toLocaleString()} tokens</span>
                      </div>
                    </div>
                    <div className={styles.rankScore} style={{ color: getScoreColor(au.score) }}>
                      {au.score}
                    </div>
                    <div className={styles.rankBar}>
                      <div className={styles.rankBarFill} style={{ width: `${au.score}%`, background: getScoreColor(au.score) }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>No agents with metrics yet. Run some executions first.</div>
            )}
          </div>
        )}

        {/* Trends */}
        {activeView === 'trends' && (
          <div className={styles.trendsView}>
            <h3>Performance Trends</h3>
            <div className={styles.trendCards}>
              <div className={styles.trendCard}>
                <h4>Execution Volume</h4>
                <div className={styles.trendValue}>{metrics.total}</div>
                <div className={styles.trendChange}>
                  <span className={styles.trendUp}>Tracking live</span>
                </div>
              </div>
              <div className={styles.trendCard}>
                <h4>Success Rate Trend</h4>
                <div className={styles.trendValue}>{metrics.successRate}%</div>
                <div className={styles.trendChange}>
                  <span className={styles.trendUp}>Current</span>
                </div>
              </div>
              <div className={styles.trendCard}>
                <h4>Avg Response Time</h4>
                <div className={styles.trendValue}>{metrics.avgDuration.toFixed(1)}s</div>
                <div className={styles.trendChange}>
                  <span>{metrics.avgDuration < 30 ? 'Within target' : 'Above target'}</span>
                </div>
              </div>
              <div className={styles.trendCard}>
                <h4>Error Rate</h4>
                <div className={styles.trendValue}>{metrics.total > 0 ? Math.round((metrics.failed / metrics.total) * 100) : 0}%</div>
                <div className={styles.trendChange}>
                  <span>{metrics.failed < 5 ? 'Healthy' : 'Needs attention'}</span>
                </div>
              </div>
            </div>

            <h3>Agent Distribution</h3>
            <div className={styles.distributionGrid}>
              {agents.map(agent => (
                <div key={agent.id} className={styles.distCard}>
                  <span className={`${styles.distDot} ${styles[agent.status]}`}></span>
                  <span className={styles.distName}>{agent.name}</span>
                  <span className={styles.distStatus}>{agent.status}</span>
                  <span className={styles.distExec}>{agent.executions || 0} runs</span>
                </div>
              ))}
              {agents.length === 0 && (
                <div className={styles.emptyState}>No agents created yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const UtilityPanel = memo(UtilityPanelComponent);
export default UtilityPanel;
