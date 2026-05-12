import React, { Suspense, lazy, memo, useEffect, useCallback, useState } from 'react';
import { useAgentStore, useExecutionStore } from '../../stores';
// Sidebar removed — all panels now inline in AgentsPanel
import { PanelErrorBoundary, PanelSkeleton, Icons } from './components/shared';
import { Header } from '../../components/layout/Header/Header';
import { listAgents } from '../../api/agents';
import agentOSApi from './services/api';
import fastapiClient from "../../api/fastapiClient";
import type { Agent } from '../../types';
import styles from './AgentOSv2.module.css';

// All panels now inline in AgentsPanel — only AgentsPanel is loaded here
const AgentsPanel = lazy(() => import('./components/Panels/AgentsPanel'));

// AgentOS toolbar removed - now integrated into global Header component

// ============== METRICS FOOTER COMPONENT ==============
const MetricsFooter: React.FC = memo(() => {
  const agents = useAgentStore((state) => state.agents);
  const executions = useExecutionStore((state) => (Array.isArray(state.executions) ? state.executions : []));
  const [platformMetrics, setPlatformMetrics] = useState<any>(null);

  // Poll real platform metrics from backend every 15 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [metricsRes, summaryRes] = await Promise.allSettled([
          fastapiClient.get('/api/v1/agents/metrics'),
          fastapiClient.get('/api/v1/agents/metrics/summary'),
        ]);
        const merged: any = {};
        if (metricsRes.status === 'fulfilled' && metricsRes.value.data) Object.assign(merged, metricsRes.value.data);
        if (summaryRes.status === 'fulfilled' && summaryRes.value.data) Object.assign(merged, summaryRes.value.data);
        if (Object.keys(merged).length > 0) setPlatformMetrics(merged);
      } catch { /* silent */ }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeAgents = platformMetrics?.active_agents || agents.filter(a => a.status === 'active').length;
  const runningExecutions = platformMetrics?.running_sessions || executions.filter(e => e.status === 'running').length;
  const completedToday = platformMetrics?.total_completed || executions.filter(e => e.status === 'completed').length;
  const totalCost = agents.reduce((sum, a) => sum + (a.costToday || 0), 0);
  
  const totalExecutions = platformMetrics?.total_sessions || executions.length;
  const successfulExecutions = platformMetrics?.total_completed || executions.filter(e => e.status === 'completed').length;
  const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : '0.0';

  return (
    <footer className={styles.metricsFooter}>
      <div className={styles.metricItem}>
        <Icons.Agents />
        <span className={styles.metricValue}>{activeAgents}</span>
        <span className={styles.metricLabel}>Active Agents</span>
      </div>
      <div className={styles.metricItem}>
        <Icons.Execution />
        <span className={styles.metricValue}>{runningExecutions}</span>
        <span className={styles.metricLabel}>Running</span>
      </div>
      <div className={styles.metricItem}>
        <Icons.CheckCircle />
        <span className={styles.metricValue}>{completedToday}</span>
        <span className={styles.metricLabel}>Completed Today</span>
      </div>
      <div className={styles.metricItem}>
        <Icons.DollarSign />
        <span className={styles.metricValue}>${totalCost.toFixed(2)}</span>
        <span className={styles.metricLabel}>Today's Cost</span>
      </div>
      <div className={styles.metricItem}>
        <Icons.TrendingUp />
        <span className={styles.metricValue}>{successRate}%</span>
        <span className={styles.metricLabel}>Success Rate</span>
      </div>
      <div className={styles.metricItem}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: platformMetrics?.status === 'healthy' ? '#22c55e' : '#f59e0b', display: 'inline-block' }} />
        <span className={styles.metricValue}>{platformMetrics?.avg_response_ms || '—'}ms</span>
        <span className={styles.metricLabel}>Avg Response</span>
      </div>
    </footer>
  );
});

// ============== MAIN AGENTOS COMPONENT ==============

const AgentOSv2: React.FC = () => {
  const isEmbedded = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const setAgents = useAgentStore((state) => state.setAgents);
  const setLoading = useAgentStore((state) => state.setLoading);
  const updateAgent = useAgentStore((state) => state.updateAgent);
  const agents = useAgentStore((state) => state.agents);
  const selectedAgentId = useAgentStore((state) => state.selectedAgentId);

  // Load agents from backend on mount
  useEffect(() => {
    const loadAgentsFromBackend = async () => {
      setLoading(true);
      try {
        const backendAgents = await listAgents();
        // Transform backend response to match Agent type
        const agents: Agent[] = backendAgents.map((a) => ({
          id: a.id,
          hash: a.manifest_hash || `0x${a.id.replace(/-/g, '').slice(0, 40)}`,
          dsid: a.dsid || undefined,
          persisted: true,
          name: a.name,
          type: ((a as any).agent_source === 'openclaw' || (a as any).agent_source === 'federated') ? 'openclaw' : ((a as any).type || 'executor'),
          status: ((a as any).running_sessions > 0 ? 'active' : 'idle') as 'idle' | 'active' | 'paused' | 'archived',
          mode: ((a as any).mode === 'unbounded' ? 'unbounded' : 'governed') as 'governed' | 'unbounded',
          version: String(a.version) + '.0.0',
          capabilities: Array.isArray((a as any).tools) ? ((a as any).tools as string[]) : [],
          executions: 0,
          costToday: 0,
          walletBalance: 0,
          pendingApprovals: 0,
          riskLevel: 'low' as const,
          utilityScore: 0.5,
          ownerId: '',
          config: {
            provider: (a as any).provider || 'tokenrouter',
            model: a.model || 'google/gemini-3-flash-preview',
            systemPrompt: (a as any).system_prompt || '',
            temperature: (a as any).temperature ?? 0.7,
            maxTokens: (a as any).max_tokens ?? 4096,
            tools: [],
            memoryConfig: {
              shortTermLimit: 10,
              longTermEnabled: false,
              vectorStoreEnabled: false,
              contextWindow: 4096,
            },
            autonomyConfig: {
              canSpawnSubAgents: false,
              canModifySelf: false,
              canAccessNetwork: false,
              canExecuteCode: false,
              maxConcurrentTasks: 5,
            },
          },
          createdAt: (a as any).created_at ? new Date((a as any).created_at) : new Date(),
          updatedAt: (a as any).updated_at ? new Date((a as any).updated_at) : new Date(),
          // OpenClaw federation fields
          agent_source: ((a as any).agent_source || 'cloud') as 'cloud' | 'openclaw' | 'federated',
          openclaw_config: (a as any).openclaw_config || undefined,
        }));
        setAgents(agents);
        // Show agents immediately — don't block on metrics
        setLoading(false);

        // Fire-and-forget: load per-agent metrics in background
        Promise.allSettled(
          agents
            .filter((a) => a.persisted)
            .map(async (a) => {
              try {
                const metrics: any = await agentOSApi.getAgentMetrics(a.id);

                const executions = Number(metrics?.sessions_total ?? metrics?.executions ?? 0) || 0;

                updateAgent(a.id, {
                  executions,
                  utilityScore: a.utilityScore,
                  costToday: a.costToday,
                  riskLevel: a.riskLevel,
                  walletBalance: a.walletBalance,
                });
              } catch {
                return;
              }
            })
        );
      } catch (error) {
        console.error('Failed to load agents from backend:', error);
        setLoading(false);
      }
    };

    loadAgentsFromBackend();
  }, [setAgents, setLoading, updateAgent]);


  // Poll OpenClaw agent connection status every 30s
  useEffect(() => {
    const poll = async () => {
      try {
        const resp = await fastapiClient.get('/api/v1/openclaw/agents/openclaw');
        const ocAgents: any[] = resp.data?.agents || [];
        for (const oc of ocAgents) {
          if (oc.agent_id && oc.connection_status) {
            updateAgent(oc.agent_id, {
              openclaw_config: {
                ...(agents.find(a => a.id === oc.agent_id)?.openclaw_config || {}),
                connection_status: oc.connection_status,
                last_heartbeat: oc.last_heartbeat,
              },
            } as any);
          }
        }
      } catch { /* silently ignore — user may not have OpenClaw agents */ }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [agents, updateAgent]);


  return (
    <>
      {!isEmbedded && <Header />}
      <div className={`${styles.agentOS} ${isEmbedded ? styles.embedded : ''}`}>
        <div className={styles.mainWrapper} style={{ marginLeft: 0, width: '100%' }}>
          <main className={styles.mainContent}>
            <PanelErrorBoundary>
              <Suspense fallback={<PanelSkeleton />}>
                <AgentsPanel />
              </Suspense>
            </PanelErrorBoundary>
          </main>
          
          <MetricsFooter />
        </div>
      </div>
    </>
  );
};

export default memo(AgentOSv2);
