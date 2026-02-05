import React, { Suspense, lazy, memo, useEffect, useCallback } from 'react';
import { useUIStore, useAgentStore, useExecutionStore, useEconomyStore } from '../../stores';
import { Sidebar } from './components/Shell';
import { PanelErrorBoundary, PanelSkeleton, Icons } from './components/shared';
import { Header } from '../../components/layout/Header/Header';
import { listAgents } from '../../api/agents';
import agentOSApi from './services/api';
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
const MetricsFooter: React.FC = memo(() => {
  const agents = useAgentStore((state) => state.agents);
  const executions = useExecutionStore((state) => (Array.isArray(state.executions) ? state.executions : []));
  const wallet = useEconomyStore((state) => state.wallet);

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const runningExecutions = executions.filter(e => e.status === 'running').length;
  const completedToday = executions.filter(e => e.status === 'completed').length;
  const totalCost = agents.reduce((sum, a) => sum + (a.costToday || 0), 0);
  
  // Calculate real success rate from executions
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
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
