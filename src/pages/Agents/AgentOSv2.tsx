import React, { Suspense, lazy, memo, useEffect, useCallback, useState, useRef } from 'react';
import { useUIStore, useAgentStore, useExecutionStore, useEconomyStore } from '../../stores';
import { Sidebar } from './components/Shell';
import { PanelErrorBoundary, PanelSkeleton, Icons } from './components/shared';
import { Header } from '../../components/layout/Header/Header';
import { listAgents } from '../../api/agents';
import agentOSApi from './services/api';
import fastapiClient from "../../api/fastapiClient";
import type { Agent } from '../../types';
import styles from './AgentOSv2.module.css';
import { CommandPalette } from '../../components/IDE/CommandPalette';
import type { Command } from '../../components/IDE/CommandPalette';

// ============== LAZY LOADED PANELS ==============
// Each panel is loaded only when needed

const AgentsPanel = lazy(() => import('./components/Panels/AgentsPanel'));
const SessionsPanel = lazy(() => import('./components/Panels/SessionsPanel'));
const FactoryPanel = lazy(() => import('./components/Panels/FactoryPanel'));
const EconomyPanel = lazy(() => import('./components/Panels/EconomyPanel'));
const ExecutionPanel = lazy(() => import('./components/Panels/ExecutionPanel'));
const WorkflowPanel = lazy(() => import('./components/Panels/WorkflowPanel'));
const SettingsPanel = lazy(() => import('./components/Panels/SettingsPanel'));
const MonitorPanel = lazy(() => import('./components/Panels/MonitorPanel'));
const ChatPanel = lazy(() => import('./components/Panels/ChatPanel'));
const AuditPanel = lazy(() => import('./components/Panels/AuditPanel'));
const GovernancePanel = lazy(() => import('./components/Panels/GovernancePanel'));
const MemoryPanel = lazy(() => import('./components/Panels/MemoryPanel'));
const CapabilitiesPanel = lazy(() => import('./components/Panels/CapabilitiesPanel'));
const GoalsPanel = lazy(() => import('./components/Panels/GoalsPanel'));
const DebugPanel = lazy(() => import('./components/Panels/DebugPanel'));
const UtilityPanel = lazy(() => import('./components/Panels/UtilityPanel'));
const NegotiationPanel = lazy(() => import('./components/Panels/NegotiationPanel'));
const ExternalPanel = lazy(() => import('./components/Panels/ExternalPanel'));

// Placeholder panels - will be replaced as they are extracted
const PlaceholderPanel: React.FC<{ name: string }> = memo(({ name }) => (
  <div className={styles.placeholderPanel}>
    <h2>{name}</h2>
    <p>This panel is being migrated to the new architecture.</p>
    <p>Enterprise Readiness: In Progress</p>
  </div>
));

// AgentOS toolbar removed - now integrated into global Header component

// ============== METRICS FOOTER COMPONENT ==============
const NotificationBell: React.FC = memo(() => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fastapiClient.get('/api/v1/platform/notifications')
      .then(res => setNotifications(res.data || []))
      .catch(() => {});
  }, []);

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
  const activeSection = useUIStore((state) => state.activeSection);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setAgents = useAgentStore((state) => state.setAgents);
  const setLoading = useAgentStore((state) => state.setLoading);
  const updateAgent = useAgentStore((state) => state.updateAgent);
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
          type: 'executor',
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
            provider: 'openai',
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
        }));
        setAgents(agents);

        await Promise.allSettled(
          agents
            .filter((a) => a.persisted)
            .map(async (a) => {
              try {
                const metrics: any = await agentOSApi.getAgentMetrics(a.id);

                const executions = Number(metrics?.sessions_total ?? metrics?.executions ?? 0) || 0;
                const running = Number(metrics?.sessions_by_status?.running ?? 0) || 0;
                const completed = Number(metrics?.sessions_by_status?.completed ?? 0) || 0;
                const failed = Number(metrics?.sessions_by_status?.failed ?? 0) || 0;
                const totalTokens = Number(metrics?.total_tokens_used ?? 0) || 0;

                updateAgent(a.id, {
                  executions,
                  utilityScore: a.utilityScore,
                  costToday: a.costToday,
                  riskLevel: a.riskLevel,
                  walletBalance: a.walletBalance,
                });

                void running;
                void completed;
                void failed;
                void totalTokens;
              } catch {
                return;
              }
            })
        );
      } catch (error) {
        console.error('Failed to load agents from backend:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAgentsFromBackend();
  }, [setAgents, setLoading, updateAgent]);

  // Cmd/Ctrl+K opens Agents command palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Quick panel navigation: Ctrl+1-9
      if (e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const panelMap: Record<string, string> = {
          '1': 'agents', '2': 'sessions', '3': 'workflow', '4': 'execution',
          '5': 'goals', '6': 'memory', '7': 'chat', '8': 'governance', '9': 'audit',
        };
        if (panelMap[e.key]) {
          e.preventDefault();
          useUIStore.getState().setActiveSection(panelMap[e.key] as any);
          return;
        }
      }

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

  const buildCommands = useCallback((): Command[] => {
    const canRun = Boolean(selectedAgentId);
    return [
      { id: 'agents:create', label: 'Create Agent', category: 'Agents' },
      { id: 'agents:run', label: canRun ? 'Run Selected Agent' : 'Run Selected Agent (select one first)', category: 'Agents' },
      { id: 'agents:details', label: canRun ? 'Open Selected Agent Details' : 'Open Selected Agent Details (select one first)', category: 'Agents' },
      { id: 'agents:toggle-favorites', label: 'Toggle Favorites Filter', category: 'Agents' },
      { id: 'agents:toggle-bulk', label: 'Toggle Bulk Mode', category: 'Agents' },
      { id: 'nav:agents', label: 'Go to Agents', category: 'Navigate' },
      { id: 'nav:sessions', label: 'Go to Sessions', category: 'Navigate' },
      { id: 'nav:factory', label: 'Go to Factory', category: 'Navigate' },
      { id: 'nav:workflow', label: 'Go to Workflows', category: 'Navigate' },
      { id: 'nav:execution', label: 'Go to Execution', category: 'Navigate' },
      { id: 'nav:goals', label: 'Go to Goals', category: 'Navigate' },
      { id: 'nav:memory', label: 'Go to Memory', category: 'Navigate' },
      { id: 'nav:chat', label: 'Go to Chat', category: 'Navigate' },
      { id: 'nav:governance', label: 'Go to Governance', category: 'Navigate' },
      { id: 'nav:audit', label: 'Go to Audit', category: 'Navigate' },
      { id: 'nav:monitor', label: 'Go to Monitor', category: 'Navigate' },
      { id: 'nav:settings', label: 'Go to Settings', category: 'Navigate' },
      { id: 'nav:economy', label: 'Go to Economy', category: 'Navigate' },
      { id: 'nav:debug', label: 'Go to Debug', category: 'Navigate' },
      { id: 'nav:capabilities', label: 'Go to Capabilities', category: 'Navigate' },
      { id: 'nav:negotiation', label: 'Go to Negotiation', category: 'Navigate' },
      { id: 'nav:external', label: 'Go to External', category: 'Navigate' },
      { id: 'nav:utility', label: 'Go to Utility', category: 'Navigate' },
    ];
  }, [selectedAgentId]);

  const onCommandSelect = useCallback((cmd: Command) => {
    if (cmd.id === 'agents:create') {
      useUIStore.getState().setActiveSection('factory');
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

    // Navigation commands
    if (cmd.id.startsWith('nav:')) {
      const section = cmd.id.replace('nav:', '');
      useUIStore.getState().setActiveSection(section as any);
    }
  }, [selectedAgentId]);

  // Render the appropriate panel based on active section
  const renderPanel = () => {
    switch (activeSection) {
      case 'agents':
        return <AgentsPanel />;
      case 'sessions':
        return <SessionsPanel />;
      case 'factory':
        return <FactoryPanel />;
      case 'economy':
        return <EconomyPanel />;
      case 'capabilities':
        return <CapabilitiesPanel />;
      case 'utility':
        return <UtilityPanel />;
      case 'goals':
        return <GoalsPanel />;
      case 'execution':
        return <ExecutionPanel />;
      case 'memory':
        return <MemoryPanel />;
      case 'negotiation':
        return <NegotiationPanel />;
      case 'governance':
        return <GovernancePanel />;
      case 'audit':
        return <AuditPanel />;
      case 'debug':
        return <DebugPanel />;
      case 'workflow':
        return <WorkflowPanel />;
      case 'chat':
        return <ChatPanel />;
      case 'monitor':
        return <MonitorPanel />;
      case 'external':
        return <ExternalPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <PlaceholderPanel name="Unknown Panel" />;
    }
  };

  return (
    <>
      <Header />
      <div className={styles.agentOS}>
        <Sidebar />
        
        <div className={`${styles.mainWrapper} ${sidebarCollapsed ? styles.expanded : ''}`}>
          <div style={{ position: 'absolute', top: '8px', right: '16px', zIndex: 100 }}>
            <NotificationBell />
          </div>
          <main className={styles.mainContent}>
            <PanelErrorBoundary>
              <Suspense fallback={<PanelSkeleton />}>
                {renderPanel()}
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
