import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useAgentStore, useExecutionStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { getAutonomyStatus, getAutonomyStats, type AutonomyStatus, type AutonomyStats } from '../../../../../api/autonomy';
import fastapiClient from '../../../../../api/fastapiClient';
import * as executionsApi from '../../../../../api/executions';
import styles from './MonitorPanel.module.css';

// ============== MONITOR PANEL ==============
// Contract: reads [execution, agent, network], writes []
// Forbidden: [economy]

type ViewMode = 'overview' | 'agents' | 'system' | 'logs' | 'utility';

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
  uptime: string;
  lastRestart: Date;
}

interface MonitorPanelProps {
  className?: string;
}

const MonitorPanelComponent: React.FC<MonitorPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const executions = useExecutionStore(state => state.executions);
  
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autonomyStatus, setAutonomyStatus] = useState<AutonomyStatus | null>(null);
  const [autonomyStats, setAutonomyStats] = useState<AutonomyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [platformHealth, setPlatformHealth] = useState<any>(null);
  const [utilityExecs, setUtilityExecs] = useState<executionsApi.Execution[]>([]);
  const [agentUtilities, setAgentUtilities] = useState<any[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleExportMetrics = () => {
    const exportData = { exported_at: new Date().toISOString(), systemMetrics, platformHealth, trendsData };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system-metrics-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportUtility = () => {
    const exportData = { exported_at: new Date().toISOString(), trendsData };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utility-trends-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 0, memory: 0, network: 0, disk: 0,
    uptime: 'Loading...', lastRestart: new Date(),
  });
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memHistory, setMemHistory] = useState<number[]>([]);
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string;
    timestamp: Date;
    level: string;
    source: string;
    message: string;
  }>>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch platform metrics
  const fetchPlatformMetrics = useCallback(async () => {
    try {
      const res = await fastapiClient.get('/api/v1/agents/metrics');
      setPlatformMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch platform metrics:', err);
    }
  }, []);

  // Fetch executions for utility analytics
  const fetchExecutions = useCallback(async () => {
    try {
      if (selectedAgentId) {
        const data = await executionsApi.getExecutions(selectedAgentId);
        setUtilityExecs((data as any).executions || data || []);
      } else {
        // Fetch metrics for all agents
        const utilities: any[] = [];
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
      console.error('Failed to load utility data:', err);
    }
  }, [selectedAgentId, agents]);

  // Fetch REAL system metrics from backend
  const fetchSystemMetrics = useCallback(async () => {
    try {
      const res = await fastapiClient.get('/owner/dashboard/system/metrics');
      const data = res.data;
      if (data) {
        const cpuVal = Math.round(data.cpu?.percent || 0);
        const memVal = Math.round(data.memory?.percent || 0);
        const diskVal = Math.round(data.disk?.percent || 0);
        const netSentMB = Math.round((data.network?.bytes_sent || 0) / 1048576);
        const netRecvMB = Math.round((data.network?.bytes_recv || 0) / 1048576);
        const networkPercent = Math.min(100, Math.round((netSentMB + netRecvMB) / 100));

        setSystemMetrics({
          cpu: cpuVal,
          memory: memVal,
          network: networkPercent,
          disk: diskVal,
          uptime: data.uptime || 'Unknown',
          lastRestart: data.boot_time ? new Date(data.boot_time * 1000) : new Date(),
        });

        setCpuHistory(prev => [...prev.slice(-29), cpuVal]);
        setMemHistory(prev => [...prev.slice(-29), memVal]);
      }
    } catch (err) {
      console.error('Failed to fetch system metrics:', err);
    }
  }, []);

  // Fetch analytics trends from backend (platform + per-agent if selected)
  useEffect(() => {
    if (activeView === 'utility') {
      const fetches: Promise<any>[] = [
        fastapiClient.get('/api/v1/analytics/trends?period=7d'),
      ];
      if (selectedAgentId) {
        fetches.push(fastapiClient.get('/api/v1/analytics/agent/' + selectedAgentId + '/trends').catch(() => ({ data: null })));
      }
      Promise.all(fetches).then(([platformRes, agentRes]) => {
        const merged = { ...platformRes.data };
        if (agentRes?.data) merged.agent_trends = agentRes.data;
        setTrendsData(merged);
      }).catch(() => {});
    }
  }, [activeView, selectedAgentId]);

  // Fetch autonomy metrics
  const fetchAutonomyMetrics = useCallback(async () => {
    try {
      const [status, stats] = await Promise.allSettled([
        getAutonomyStatus(),
        getAutonomyStats()
      ]);
      
      if (status.status === 'fulfilled') {
        setAutonomyStatus(status.value);
        const logs = Object.entries(status.value.subsystems || {}).map(([name, info]: [string, any], i) => ({
          id: `log-${i}`,
          timestamp: info.started_at ? new Date(info.started_at) : new Date(),
          level: info.error ? 'error' : info.running ? 'info' : 'warn',
          source: name,
          message: info.error || (info.running ? `${name} running` : `${name} stopped`)
        }));
        setRecentLogs(logs.slice(0, 10));
      }
      
      if (stats.status === 'fulfilled') {
        setAutonomyStats(stats.value);
      }
    } catch (err) {
      console.error('Failed to fetch autonomy metrics:', err);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all metrics on mount and poll every 5 seconds
  useEffect(() => {
    fetchSystemMetrics();
    fetchAutonomyMetrics();
    fetchPlatformMetrics();
    fetchExecutions();
    pollRef.current = setInterval(() => {
      fetchSystemMetrics();
      fetchAutonomyMetrics();
      fetchPlatformMetrics();
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSystemMetrics, fetchAutonomyMetrics, fetchPlatformMetrics, fetchExecutions]);

  const activeAgents = autonomyStats?.network?.active_agents || agents.filter(a => a.status === 'active').length;
  const runningExecutions = autonomyStats?.queue?.pending_tasks || executions.filter(e => e.status === 'running').length;
  const totalExecutionsToday = autonomyStats?.network?.total_tasks_completed || executions.length || 0;
  const healthySubsystems = autonomyStatus?.healthy_subsystems || 0;
  const totalSubsystems = autonomyStatus?.total_subsystems || 9;
  const successRate = totalSubsystems > 0 ? Math.round((healthySubsystems / totalSubsystems) * 100) : 0;

  const getLogLevelClass = (level: string) => {
    switch (level) {
      case 'error': return styles.error;
      case 'warn': return styles.warn;
      case 'info': return styles.info;
      default: return '';
    }
  };

  const getBarColor = (value: number) => {
    if (value >= 80) return '#ef4444';
    if (value >= 60) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Activity /> System Monitor</h2>
        {activeView === 'utility' ? (
          <button onClick={handleExportUtility} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.Download /> Export
          </button>
        ) : (
          <button onClick={handleExportMetrics} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icons.Download /> Export
          </button>
        )}
        <div className={styles.headerRight}>
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            Live
          </span>
          <span className={styles.timestamp}>{currentTime.toLocaleTimeString()}</span>
        </div>
        <div className={styles.viewTabs}>
          {(['overview', 'agents', 'system', 'logs', 'utility'] as ViewMode[]).map(view => (
            <button
              key={view}
              className={`${styles.viewTab} ${activeView === view ? styles.active : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Overview */}
        {activeView === 'overview' && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Icons.Agents /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{activeAgents}</span>
                  <span className={styles.statLabel}>Active Agents</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Icons.Execution /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{runningExecutions}</span>
                  <span className={styles.statLabel}>Running</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Icons.CheckCircle /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{totalExecutionsToday}</span>
                  <span className={styles.statLabel}>Executions Today</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Icons.TrendingUp /></div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{successRate}%</span>
                  <span className={styles.statLabel}>Success Rate</span>
                </div>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <h3>Execution Activity</h3>
                <div className={styles.miniChart}>
                  {cpuHistory.length > 1 ? (
                    <svg viewBox="0 0 300 60" className={styles.sparkline}>
                      <polyline
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="2"
                        points={cpuHistory.map((v, i) => `${(i / (cpuHistory.length - 1)) * 300},${60 - (v / 100) * 55}`).join(' ')}
                      />
                    </svg>
                  ) : (
                    <p className={styles.chartMessage}>Collecting data...</p>
                  )}
                </div>
              </div>
              <div className={styles.chartCard}>
                <h3>Resource Usage</h3>
                <div className={styles.resourceBars}>
                  <div className={styles.resourceItem}>
                    <span>CPU</span>
                    <div className={styles.resourceBar}>
                      <div className={styles.resourceFill} style={{ width: `${systemMetrics.cpu}%`, background: getBarColor(systemMetrics.cpu) }}></div>
                    </div>
                    <span>{systemMetrics.cpu}%</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span>Memory</span>
                    <div className={styles.resourceBar}>
                      <div className={styles.resourceFill} style={{ width: `${systemMetrics.memory}%`, background: getBarColor(systemMetrics.memory) }}></div>
                    </div>
                    <span>{systemMetrics.memory}%</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span>Disk</span>
                    <div className={styles.resourceBar}>
                      <div className={styles.resourceFill} style={{ width: `${systemMetrics.disk}%`, background: getBarColor(systemMetrics.disk) }}></div>
                    </div>
                    <span>{systemMetrics.disk}%</span>
                  </div>
                  <div className={styles.resourceItem}>
                    <span>Network</span>
                    <div className={styles.resourceBar}>
                      <div className={styles.resourceFill} style={{ width: `${systemMetrics.network}%`, background: getBarColor(systemMetrics.network) }}></div>
                    </div>
                    <span>{systemMetrics.network}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.logsPreview}>
              <h3>Recent Activity</h3>
              {recentLogs.length > 0 ? recentLogs.slice(0, 4).map(log => (
                <div key={log.id} className={styles.logItem}>
                  <span className={`${styles.logLevel} ${getLogLevelClass(log.level)}`}>{log.level.toUpperCase()}</span>
                  <span className={styles.logSource}>{log.source}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                  <span className={styles.logTime}>{log.timestamp.toLocaleTimeString()}</span>
                </div>
              )) : (
                <div className={styles.emptyState}>No recent activity logs</div>
              )}
            </div>
          </>
        )}

        {/* Agents View */}
        {activeView === 'agents' && (
          <div className={styles.agentsMonitor}>
            <h3>Agent Status</h3>
            <div className={styles.agentsList}>
              {agents.length > 0 ? agents.map((agent: any) => (
                <div key={agent.id} className={styles.agentRow}>
                  <span className={`${styles.statusDot} ${styles[agent.status]}`}></span>
                  <span className={styles.agentName}>{agent.name}</span>
                  <span className={styles.agentStat}>{agent.executions || 0} runs</span>
                  <span className={styles.agentStat}>${agent.costToday?.toFixed(2) || '0.00'}</span>
                  <span className={`${styles.statusBadge} ${styles[agent.status]}`}>{agent.status}</span>
                </div>
              )) : (
                <div className={styles.emptyState}>No agents created yet. Create an agent in the Factory panel.</div>
              )}
            </div>
          </div>
        )}

        {/* System View */}
        {activeView === 'system' && (
          <div className={styles.systemMonitor}>
            <h3>System Health</h3>
            <div className={styles.systemGrid}>
              <div className={styles.systemCard}>
                <h4>CPU Usage</h4>
                <div className={styles.gaugeContainer}>
                  <div className={styles.gauge}>
                    <span className={styles.gaugeValue} style={{ color: getBarColor(systemMetrics.cpu) }}>{systemMetrics.cpu}%</span>
                  </div>
                  {cpuHistory.length > 1 && (
                    <svg viewBox="0 0 120 30" className={styles.miniSparkline}>
                      <polyline
                        fill="none"
                        stroke={getBarColor(systemMetrics.cpu)}
                        strokeWidth="1.5"
                        points={cpuHistory.slice(-15).map((v, i, arr) => `${(i / (arr.length - 1)) * 120},${30 - (v / 100) * 28}`).join(' ')}
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className={styles.systemCard}>
                <h4>Memory Usage</h4>
                <div className={styles.gaugeContainer}>
                  <div className={styles.gauge}>
                    <span className={styles.gaugeValue} style={{ color: getBarColor(systemMetrics.memory) }}>{systemMetrics.memory}%</span>
                  </div>
                  {memHistory.length > 1 && (
                    <svg viewBox="0 0 120 30" className={styles.miniSparkline}>
                      <polyline
                        fill="none"
                        stroke={getBarColor(systemMetrics.memory)}
                        strokeWidth="1.5"
                        points={memHistory.slice(-15).map((v, i, arr) => `${(i / (arr.length - 1)) * 120},${30 - (v / 100) * 28}`).join(' ')}
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className={styles.systemCard}>
                <h4>Network I/O</h4>
                <div className={styles.gaugeContainer}>
                  <div className={styles.gauge}>
                    <span className={styles.gaugeValue}>{systemMetrics.network}%</span>
                  </div>
                </div>
              </div>
              <div className={styles.systemCard}>
                <h4>Disk Usage</h4>
                <div className={styles.gaugeContainer}>
                  <div className={styles.gauge}>
                    <span className={styles.gaugeValue} style={{ color: getBarColor(systemMetrics.disk) }}>{systemMetrics.disk}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.uptimeInfo}>
              <div className={styles.uptimeItem}>
                <label>Uptime</label>
                <span>{systemMetrics.uptime}</span>
              </div>
              <div className={styles.uptimeItem}>
                <label>Last Restart</label>
                <span>{systemMetrics.lastRestart.toLocaleDateString()}</span>
              </div>
              <div className={styles.uptimeItem}>
                <label>Subsystems</label>
                <span>{healthySubsystems}/{totalSubsystems} healthy</span>
              </div>
            </div>
          </div>
        )}

        {/* Utility Analytics View */}
        {activeView === 'utility' && (
          <div className={styles.utilityView}>
            <div className={styles.utilityHeader}>
              <h3>Utility Analytics</h3>
              <div className={styles.utilityControls}>
                <select
                  value={selectedAgentId || ''}
                  onChange={e => setSelectedAgentId(e.target.value || null)}
                  style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#94a3b8', fontSize: '11px' }}
                >
                  <option value="">All Agents</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.utilityOverview}>
              <div className={styles.overallScore}>
                <div className={styles.scoreCircle} style={{ borderColor: '#22c55e' }}>
                  <span className={styles.scoreValue} style={{ color: '#22c55e' }}>85</span>
                  <span className={styles.scoreLabel}>Utility Score</span>
                </div>
              </div>
              <div className={styles.quickStats}>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{agents.length}</span>
                  <span className={styles.quickLabel}>Total Agents</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{platformMetrics?.total_sessions || 0}</span>
                  <span className={styles.quickLabel}>Total Executions</span>
                </div>
                <div className={styles.quickStat}>
                  <span className={styles.quickValue}>{platformMetrics?.success_rate || 0}%</span>
                  <span className={styles.quickLabel}>Success Rate</span>
                </div>
              </div>
            </div>

            <div className={styles.agentRanking}>
              <h4>Agent Utility Ranking</h4>
              {[...agentUtilities].sort((a, b) => b.score - a.score).map((au, idx) => (
                <div key={au.id} className={styles.rankCard}>
                  <span className={styles.rankNumber}>#{idx + 1}</span>
                  <div className={styles.rankInfo}>
                    <span className={styles.rankName}>{au.name}</span>
                    <div className={styles.rankStats}>
                      <span>{au.executions} runs</span>
                      <span>{au.successRate}% success</span>
                      <span>{au.avgDuration.toFixed(1)}s avg</span>
                    </div>
                  </div>
                  <div className={styles.rankScore} style={{ color: '#22c55e' }}>
                    {au.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs View */}
        {activeView === 'logs' && (
          <div className={styles.logsSection}>
            <div className={styles.logsHeader}>
              <h3>System Logs</h3>
              <div className={styles.logsFilters}>
                <select defaultValue="all">
                  <option value="all">All Levels</option>
                  <option value="error">Errors</option>
                  <option value="warn">Warnings</option>
                  <option value="info">Info</option>
                </select>
                <input type="text" placeholder="Filter logs..." />
              </div>
            </div>
            <div className={styles.logsList}>
              {recentLogs.length > 0 ? recentLogs.map(log => (
                <div key={log.id} className={styles.logItem}>
                  <span className={`${styles.logLevel} ${getLogLevelClass(log.level)}`}>{log.level.toUpperCase()}</span>
                  <span className={styles.logSource}>{log.source}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                  <span className={styles.logTime}>{log.timestamp.toLocaleTimeString()}</span>
                </div>
              )) : (
                <div className={styles.emptyState}>No logs available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MonitorPanel = memo(MonitorPanelComponent);
export default MonitorPanel;
