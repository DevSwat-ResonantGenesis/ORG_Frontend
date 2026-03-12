import React, { Suspense, lazy, memo, useEffect, useCallback, useState, useRef } from 'react';
import { useUIStore, useAgentStore, useExecutionStore, useEconomyStore } from '../../stores';
// Sidebar removed — all panels now inline in AgentsPanel
import { PanelErrorBoundary, PanelSkeleton, Icons } from './components/shared';
import { Header } from '../../components/layout/Header/Header';
import { listAgents } from '../../api/agents';
import agentOSApi from './services/api';
import fastapiClient from "../../api/fastapiClient";
import type { Agent } from '../../types';
import styles from './AgentOSv2.module.css';
import { CommandPalette } from '../../components/IDE/CommandPalette';
import type { Command } from '../../components/IDE/CommandPalette';

// All panels now inline in AgentsPanel — only AgentsPanel is loaded here
const AgentsPanel = lazy(() => import('./components/Panels/AgentsPanel'));

// AgentOS toolbar removed - now integrated into global Header component

// ============== METRICS FOOTER COMPONENT ==============
const NotificationBell: React.FC = memo(() => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Notifications endpoint not yet implemented — skip the API call
  // to avoid 404 errors and wasted network round-trips

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative', padding: '4px' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount}
          </span>
        )}
      </button>
      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', right: 0, width: '280px', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px', padding: '4px' }}>Notifications</div>
          {notifications.map(n => (
            <div key={n.id} style={{ padding: '8px', borderRadius: '6px', marginBottom: '4px', background: n.read ? 'transparent' : 'rgba(14,165,233,0.06)', fontSize: '11px', color: '#94a3b8' }}>
              <div style={{ fontWeight: 600, color: n.type === 'warning' ? '#f59e0b' : n.type === 'error' ? '#ef4444' : '#e2e8f0', marginBottom: '2px' }}>{n.title}</div>
              <div>{n.message}</div>
            </div>
          ))}
          {notifications.length === 0 && <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>No notifications</div>}
        </div>
      )}
    </div>
  );
});

const MetricsFooter: React.FC = memo(() => {
  const agents = useAgentStore((state) => state.agents);
  const executions = useExecutionStore((state) => (Array.isArray(state.executions) ? state.executions : []));
  const wallet = useEconomyStore((state) => state.wallet);
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
        <Icons.Wallet />
        <span className={styles.metricValue}>${(wallet.totalBalance || 0).toFixed(2)}</span>
        <span className={styles.metricLabel}>Balance</span>
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
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

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
          type: (a as any).agent_source === 'openclaw' ? 'openclaw' : 'executor',
          status: (a.is_active ? 'active' : 'idle') as 'idle' | 'active' | 'paused' | 'archived',
          mode: 'governed' as const,
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
            provider: (a as any).provider || 'openai',
            model: a.model || 'gpt-4-turbo-preview',
            systemPrompt: '',
            temperature: 0.7,
            maxTokens: 4096,
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
          createdAt: new Date(),
          updatedAt: new Date(),
          // OpenClaw federation fields
          agent_source: ((a as any).agent_source || 'cloud') as 'cloud' | 'openclaw',
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

  // Cmd/Ctrl+K opens Agents command palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isInputField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if (isInputField) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (typeof setCommandPaletteOpen === 'function') setCommandPaletteOpen(true);
      }

      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        if (typeof setCommandPaletteOpen === 'function') setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

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

  const buildCommands = useCallback((): Command[] => {
    const canRun = Boolean(selectedAgentId);
    return [
      { id: 'agents:create', label: 'Create Agent', category: 'Agents' },
      { id: 'agents:run', label: canRun ? 'Run Selected Agent' : 'Run Selected Agent (select one first)', category: 'Agents' },
      { id: 'agents:details', label: canRun ? 'Open Selected Agent Details' : 'Open Selected Agent Details (select one first)', category: 'Agents' },
      { id: 'agents:toggle-favorites', label: 'Toggle Favorites Filter', category: 'Agents' },
      { id: 'agents:toggle-bulk', label: 'Toggle Bulk Mode', category: 'Agents' },
      // All navigation now handled via inline panel icons in AgentsPanel header
    ];
  }, [selectedAgentId]);

  const onCommandSelect = useCallback((cmd: Command) => {
    if (cmd.id === 'agents:create') {
      document.dispatchEvent(new CustomEvent('agentos:agents:openFactory'));
    }

    if (cmd.id === 'agents:run') {
      if (!selectedAgentId) return;
      document.dispatchEvent(new CustomEvent('agentos:agents:openModal', { detail: { type: 'run', agentId: selectedAgentId } }));
    }

    if (cmd.id === 'agents:details') {
      if (!selectedAgentId) return;
      document.dispatchEvent(new CustomEvent('agentos:agents:openModal', { detail: { type: 'detail', agentId: selectedAgentId } }));
    }

    if (cmd.id === 'agents:toggle-favorites') {
      document.dispatchEvent(new CustomEvent('agentos:agents:toggleFavoritesFilter'));
    }

    if (cmd.id === 'agents:toggle-bulk') {
      document.dispatchEvent(new CustomEvent('agentos:agents:toggleBulkMode'));
    }

  }, [selectedAgentId]);

  return (
    <>
      {!isEmbedded && <Header />}
      <div className={`${styles.agentOS} ${isEmbedded ? styles.embedded : ''}`}>
        <div className={styles.mainWrapper} style={{ marginLeft: 0, width: '100%' }}>
          <div style={{ position: 'absolute', top: '8px', right: '16px', zIndex: 100 }}>
            <NotificationBell />
          </div>
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

      <CommandPalette
        open={Boolean(commandPaletteOpen)}
        mode="command"
        commands={buildCommands()}
        files={[]}
        onSelect={onCommandSelect}
        onClose={() => typeof setCommandPaletteOpen === 'function' && setCommandPaletteOpen(false)}
        placeholder="Search agent commands…"
      />
    </>
  );
};

export default memo(AgentOSv2);
