import React, { memo, useState, useCallback, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, useUIStore, selectAgents, selectSelectedAgent } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { deleteAgent } from '../../../../../api/agents';
import { publishAgent as publishAgentAPI } from '../../../../../services/nodeApi';
import type { PublishAgentRequest } from '../../../../../services/nodeApi';
import fastapiClient from '../../../../../api/fastapiClient';
import { executeAgentTask } from '../../../../../api/executions';
import { useToastContext } from '../../../../../context/ToastContext';
import { SessionsPanel } from '../SessionsPanel';
import { FactoryPanel } from '../FactoryPanel';
const ExecutionPanel = lazy(() => import('../ExecutionPanel'));
const MemoryPanel = lazy(() => import('../MemoryPanel'));
const GoalsPanel = lazy(() => import('../GoalsPanel'));
const WorkflowPanel = lazy(() => import('../WorkflowPanel'));
const MonitorPanel = lazy(() => import('../MonitorPanel'));
const SettingsPanel = lazy(() => import('../SettingsPanel'));
const ScheduleCalendarPanel = lazy(() => import('../ScheduleCalendarPanel'));
import styles from './AgentsPanel.module.css';

// ============== AGENTS PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy, network]

interface AgentsPanelProps {
  className?: string;
}


interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const AgentsPanelComponent: React.FC<AgentsPanelProps> = ({ className }) => {
  const agents = useAgentStore(selectAgents);
  const selectedAgent = useAgentStore(selectSelectedAgent);
  const { selectAgent, startAgent, stopAgent, pauseAgent, archiveAgent, updateAgent, removeAgent, addAgent } = useAgentStore();
  const navigate = useNavigate();
  const isLoadingAgents = useAgentStore((s) => s.loading);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const pinnedAgentIds = useUIStore((s) => s.pinnedAgentIds);
  const togglePinnedAgent = useUIStore((s) => s.togglePinnedAgent);
  const toast = useToastContext();
  
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'status' | 'executions' | 'costToday'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Chat pane state (inline, replaces sessions pane)
  const [chatAgentId, setChatAgentId] = useState<string | null>(null);
  const chatAgent = chatAgentId ? agents.find((a: Agent) => a.id === chatAgentId) || null : null;

  // Detail pane state (inline, replaces sessions pane)
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const detailAgent = detailAgentId ? agents.find((a: Agent) => a.id === detailAgentId) || null : null;
  const [agentVersions, setAgentVersions] = useState<any[]>([]);
  const [agentActivity, setAgentActivity] = useState<any[]>([]);
  const [agentBenchmarks, setAgentBenchmarks] = useState<any>(null);

  // Factory pane state (inline, replaces sessions pane)
  const [showFactory, setShowFactory] = useState(false);

  // Inline sub-panel state (all panels now open inline)
  type InlinePanelType = 'execution' | 'memory' | 'goals' | 'workflow' | 'monitor' | 'settings' | 'sessions' | 'calendar';
  const [inlinePanel, setInlinePanel] = useState<{ type: InlinePanelType; agentId?: string } | null>(null);

  // Publish pane state (inline, replaces sessions pane)
  const [publishAgentId, setPublishAgentId] = useState<string | null>(null);
  const publishAgent = publishAgentId ? agents.find((a: Agent) => a.id === publishAgentId) || null : null;
  const [publishManifest, setPublishManifest] = useState({ name: '', version: '1.0.0', description: '', authorName: '', authorEmail: '', license: 'MIT', tags: [] as string[], runtime: 'python', entrypoint: 'main.py', trustTier: 1, category: 'utility', permissions: ['memory:read', 'memory:write'] as string[] });
  const [publishCode, setPublishCode] = useState(`"""My Agent"""\nfrom typing import Any, Dict\n\ndef handle(input_data: Dict[str, Any], context: Any) -> Dict[str, Any]:\n    message = input_data.get("message", "")\n    return {"success": True, "output": {"message": f"Received: {message}"}}\n`);
  const [publishTagInput, setPublishTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; manifestHash?: string; codeChecksum?: string; error?: string } | null>(null);

  const [messageInput, setMessageInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<Record<string, AgentMessage[]>>({});
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile swipe navigation
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [mobilePanel, setMobilePanel] = useState(0);

  // Mobile toolbar collapse toggle
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(true);

  const pinnedSet = useMemo(() => new Set(pinnedAgentIds || []), [pinnedAgentIds]);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = agents
      .filter((agent: Agent) => {
        if (filter === 'favorites' && !pinnedSet.has(agent.id)) return false;
        if (filter === 'openclaw' && agent.agent_source !== 'openclaw') return false;
        if (filter !== 'all' && filter !== 'favorites' && filter !== 'openclaw' && agent.status !== filter) return false;
        if (q && !agent.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .slice();

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      // Pinned agents always float to the top
      const ap = pinnedSet.has(a.id) ? 1 : 0;
      const bp = pinnedSet.has(b.id) ? 1 : 0;
      if (ap !== bp) return (bp - ap);
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'status') return String(a.status).localeCompare(String(b.status)) * dir;
      if (sortKey === 'executions') return ((a.executions || 0) - (b.executions || 0)) * dir;
      if (sortKey === 'costToday') return ((a.costToday || 0) - (b.costToday || 0)) * dir;
      return 0;
    });

    return list;
  }, [agents, filter, searchQuery, sortDir, sortKey, pinnedSet]);

  const bulkSelectedCount = selectedIds.size;

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearBulkSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const enterBulkMode = useCallback(() => {
    setBulkMode(true);
    clearBulkSelection();
  }, [clearBulkSelection]);

  const exitBulkMode = useCallback(() => {
    setBulkMode(false);
    clearBulkSelection();
  }, [clearBulkSelection]);

  const bulkSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAgents.map((a) => a.id)));
  }, [filteredAgents]);

  const bulkSelectNone = useCallback(() => {
    clearBulkSelection();
  }, [clearBulkSelection]);

  const bulkArchive = useCallback(async () => {
    if (bulkSelectedCount === 0) return;
    if (!confirm(`Archive ${bulkSelectedCount} agent(s)?`)) return;
    Array.from(selectedIds).forEach((id) => archiveAgent(id));
    toast.success(`Archived ${bulkSelectedCount} agent(s)`);
    exitBulkMode();
  }, [archiveAgent, bulkSelectedCount, exitBulkMode, selectedIds, toast]);

  const bulkDelete = useCallback(async () => {
    if (bulkSelectedCount === 0) return;
    if (!confirm(`Archive ${bulkSelectedCount} agent(s)? They will be hidden but preserved on the blockchain.`)) return;

    const ids = Array.from(selectedIds);
    let archived = 0;
    for (const id of ids) {
      try {
        await deleteAgent(id);
        removeAgent(id);
        archived += 1;
      } catch (e: any) {
        toast.error(e?.message || `Failed to archive agent ${id}`);
      }
    }

    if (archived > 0) toast.success(`Archived ${archived} agent(s)`);
    exitBulkMode();
  }, [bulkSelectedCount, exitBulkMode, removeAgent, selectedIds, toast]);

  // Scroll to bottom of messages (inline chat pane)
  const chatMessages = chatAgentId ? (agentMessages[chatAgentId] || []) : [];
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSendingMessage]);

  // Custom event listeners for command palette integration
  useEffect(() => {
    const onOpenModal = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: string; agentId?: string } | undefined;
      if (!detail?.type || !detail?.agentId) return;
      if (detail.type === 'run') {
        selectAgent(detail.agentId);
        setChatAgentId(null);
        setDetailAgentId(null);
      } else if (detail.type === 'detail') {
        setDetailAgentId(detail.agentId);
        setChatAgentId(null);
      }
    };

    const onToggleFavoritesFilter = () => {
      setFilter((prev) => (prev === 'favorites' ? 'all' : 'favorites'));
    };

    const onToggleBulkMode = () => {
      setBulkMode((prev) => {
        const next = !prev;
        if (!next) setSelectedIds(new Set());
        return next;
      });
    };

    const onOpenFactory = () => {
      setShowFactory(true);
      setChatAgentId(null);
      setDetailAgentId(null);
      setPublishAgentId(null);
      setInlinePanel(null);
    };

    document.addEventListener('agentos:agents:openModal', onOpenModal as any);
    document.addEventListener('agentos:agents:openFactory', onOpenFactory as any);
    document.addEventListener('agentos:agents:toggleFavoritesFilter', onToggleFavoritesFilter as any);
    document.addEventListener('agentos:agents:toggleBulkMode', onToggleBulkMode as any);
    return () => {
      document.removeEventListener('agentos:agents:openModal', onOpenModal as any);
      document.removeEventListener('agentos:agents:openFactory', onOpenFactory as any);
      document.removeEventListener('agentos:agents:toggleFavoritesFilter', onToggleFavoritesFilter as any);
      document.removeEventListener('agentos:agents:toggleBulkMode', onToggleBulkMode as any);
    };
  }, [agents, selectAgent]);

  // Panel-level shortcuts (avoid when typing)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isInputField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if (isInputField) return;

      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setBulkMode((prev) => {
          const next = !prev;
          if (!next) setSelectedIds(new Set());
          return next;
        });
      }

      if ((e.key === 'f' || e.key === 'F') && selectedAgent?.id) {
        e.preventDefault();
        if (typeof togglePinnedAgent === 'function') togglePinnedAgent(selectedAgent.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedAgent?.id, togglePinnedAgent]);

  // Mobile swipe: detect which panel is visible
  const handleMobileSplitScroll = useCallback(() => {
    if (!splitContainerRef.current) return;
    const { scrollLeft, clientWidth } = splitContainerRef.current;
    setMobilePanel(scrollLeft > clientWidth * 0.4 ? 1 : 0);
  }, []);

  // Mobile swipe: scroll to a specific panel
  const scrollToMobilePanel = useCallback((index: number) => {
    if (!splitContainerRef.current) return;
    splitContainerRef.current.scrollTo({ left: index * splitContainerRef.current.clientWidth, behavior: 'smooth' });
    setMobilePanel(index);
  }, []);

  // Auto-scroll to right panel on mobile when it opens
  const hasRightPanel = !!(selectedAgent || showFactory || inlinePanel || chatAgentId || detailAgentId || publishAgentId);
  const activePanelLabel = showFactory ? 'Factory' : publishAgentId ? 'Publish' : detailAgentId ? 'Details' : chatAgentId ? 'Chat' : inlinePanel ? inlinePanel.type.charAt(0).toUpperCase() + inlinePanel.type.slice(1) : selectedAgent ? 'Sessions' : null;

  useEffect(() => {
    if (hasRightPanel && typeof window !== 'undefined' && window.innerWidth <= 768) {
      setTimeout(() => scrollToMobilePanel(1), 150);
    }
  }, [hasRightPanel, selectedAgent?.id, showFactory, inlinePanel?.type, chatAgentId, detailAgentId, publishAgentId, scrollToMobilePanel]);

  // Handle send message (inline chat pane)
  const handleSendMessage = useCallback(async () => {
    if (!chatAgent || !messageInput.trim() || isSendingMessage) return;

    if (chatAgent.persisted === false) {
      setError('This agent is not persisted on the server, so it cannot receive messages. Create the agent on the server first.');
      return;
    }

    const content = messageInput.trim();
    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setAgentMessages(prev => ({
      ...prev,
      [chatAgent.id]: [...(prev[chatAgent.id] || []), userMessage],
    }));
    setMessageInput('');
    setError(null);
    setIsSendingMessage(true);

    try {
      let outputText = '';
      if (chatAgent.agent_source === 'openclaw') {
        // Route through OpenClaw webhook relay
        const resp = await fastapiClient.post(`/api/v1/openclaw/relay/${chatAgent.id}`, {
          type: 'chat',
          payload: { message: content, context: (agentMessages[chatAgent.id] || []).slice(-10).map(m => ({ role: m.role === 'agent' ? 'assistant' : m.role, content: m.content })) },
        });
        outputText = resp.data?.response || resp.data?.output || JSON.stringify(resp.data || {});
      } else {
        const result = await executeAgentTask(chatAgent.id, content, { mode: 'chat' });
        outputText = typeof result?.output === 'string'
          ? result.output
          : result?.output
            ? JSON.stringify(result.output, null, 2)
            : (result?.success ? 'Done.' : (result?.error || 'Failed to execute task.'));
      }

      const agentReply: AgentMessage = {
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: outputText || 'No response.',
        timestamp: new Date(),
      };
      setAgentMessages(prev => ({
        ...prev,
        [chatAgent.id]: [...(prev[chatAgent.id] || []), agentReply],
      }));
    } catch (err: any) {
      const msg = err?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
      setError(msg);
      const errorReply: AgentMessage = {
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: msg,
        timestamp: new Date(),
      };
      setAgentMessages(prev => ({
        ...prev,
        [chatAgent.id]: [...(prev[chatAgent.id] || []), errorReply],
      }));
    } finally {
      setIsSendingMessage(false);
    }
  }, [chatAgent, messageInput, isSendingMessage, agentMessages, toast]);

  // Fetch agent versions and activity when detail pane opens
  useEffect(() => {
    if (detailAgentId) {
      (async () => {
        try {
          const [versionsRes, activityRes, benchmarksRes] = await Promise.allSettled([
            fastapiClient.get('/api/v1/agents/' + detailAgentId + '/versions'),
            fastapiClient.get('/api/v1/agents/' + detailAgentId + '/activity?limit=5'),
            fastapiClient.get('/api/v1/agents/' + detailAgentId + '/benchmarks').catch(() => ({ data: null })),
          ]);
          if (versionsRes.status === 'fulfilled') setAgentVersions(versionsRes.value.data?.versions || []);
          if (activityRes.status === 'fulfilled') setAgentActivity(activityRes.value.data || []);
          if (benchmarksRes.status === 'fulfilled') setAgentBenchmarks(benchmarksRes.value.data);
        } catch { setAgentVersions([]); setAgentActivity([]); }
      })();
    }
  }, [detailAgentId]);

  // Handle agent actions
  const handleAgentAction = useCallback(async (action: 'stop' | 'pause' | 'delete', agentId: string) => {
    setLoadingAgentId(agentId);
    setError(null);
    
    try {
      switch (action) {
        case 'stop':
          stopAgent(agentId);
          break;
        case 'pause':
          pauseAgent(agentId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to archive this agent? It will be hidden but preserved on the blockchain.')) {
            await deleteAgent(agentId);
            removeAgent(agentId);
            toast.success('Agent archived');
            setDetailAgentId(null);
          }
          break;
      }
    } catch (err: any) {
      const msg = err.message || 'Action failed';
      toast.error(msg);
      setError(msg);
      console.error('Agent action failed:', err);
    } finally {
      setLoadingAgentId(null);
    }
  }, [stopAgent, pauseAgent, removeAgent, toast]);

  const copyAgentId = useCallback((id: string) => {
    (async () => {
      try {
        await navigator.clipboard.writeText(id);
        toast.success('Copied Agent ID');
      } catch {
        toast.error('Failed to copy');
      }
    })();
  }, [toast, addAgent]);

  // Clone agent — deep copy all properties from the original
  const handleCloneAgent = useCallback(async (agent: Agent) => {
    try {
      const { createAgent } = await import('../../../../../api/agentEngine');
      const srcConfig = agent.config || {} as any;
      const cloned = await createAgent({
        name: agent.name + ' (Clone)',
        description: 'Cloned from ' + agent.name + (agent.description ? '. ' + agent.description : ''),
        system_prompt: srcConfig.systemPrompt || '',
        model: srcConfig.model || 'gpt-4-turbo-preview',
        temperature: srcConfig.temperature ?? 0.7,
        max_tokens: srcConfig.maxTokens ?? 4096,
        tools: srcConfig.tools?.map?.((t: any) => typeof t === 'string' ? t : t.name || t.id).filter(Boolean) || agent.capabilities || [],
        safety_config: agent.safetyConfig || undefined,
      });
      toast.success('Agent cloned: ' + cloned.name);
      // Add the cloned agent to the store — preserve original type, config, capabilities
      addAgent({
        id: cloned.id,
        hash: '0x' + cloned.id.replace(/-/g, '').slice(0, 40),
        persisted: true,
        name: cloned.name,
        type: agent.type || 'executor',
        status: 'idle' as const,
        mode: agent.mode || 'governed' as const,
        version: String(cloned.version || 1) + '.0.0',
        capabilities: [...(agent.capabilities || [])],
        executions: 0, costToday: 0, walletBalance: 0, pendingApprovals: 0,
        riskLevel: agent.riskLevel || 'low' as const,
        utilityScore: 0.5, ownerId: agent.ownerId || '',
        config: {
          provider: srcConfig.provider || 'openai',
          model: cloned.model || srcConfig.model || 'gpt-4-turbo-preview',
          systemPrompt: srcConfig.systemPrompt || '',
          temperature: srcConfig.temperature ?? 0.7,
          maxTokens: srcConfig.maxTokens ?? 4096,
          tools: srcConfig.tools ? [...srcConfig.tools] : [],
          memoryConfig: srcConfig.memoryConfig
            ? { ...srcConfig.memoryConfig }
            : { shortTermLimit: 10, longTermEnabled: false, vectorStoreEnabled: false, contextWindow: 4096 },
          autonomyConfig: srcConfig.autonomyConfig
            ? { ...srcConfig.autonomyConfig }
            : { canSpawnSubAgents: false, canModifySelf: false, canAccessNetwork: false, canExecuteCode: false, maxConcurrentTasks: 5 },
        },
        createdAt: new Date(), updatedAt: new Date(),
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone agent');
    }
  }, [toast, addAgent]);

  const copyAgentHash = useCallback((agent: Agent) => {
    const hash = agent.hash || agent.id;
    (async () => {
      try {
        await navigator.clipboard.writeText(hash);
        toast.success('Copied Agent Hash');
      } catch {
        toast.error('Failed to copy');
      }
    })();
  }, [toast]);

  const copyAgentDsid = useCallback((agent: Agent) => {
    if (!agent.dsid) return;
    (async () => {
      try {
        await navigator.clipboard.writeText(agent.dsid);
        toast.success('Copied DSID');
      } catch {
        toast.error('Failed to copy');
      }
    })();
  }, [toast]);

  // Publish handler
  const handlePublishAgent = useCallback(async () => {
    if (!publishManifest.name || !publishManifest.description || !publishCode) {
      setPublishResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const fullManifest = {
        $schema: 'https://resonantgenesis.io/schemas/agent-manifest-v1.json',
        manifestVersion: '1.0.0',
        agent: { id: '', name: publishManifest.name, version: publishManifest.version, description: publishManifest.description, author: { name: publishManifest.authorName, contact: publishManifest.authorEmail }, license: publishManifest.license, tags: publishManifest.tags },
        code: { entrypoint: publishManifest.entrypoint, runtime: publishManifest.runtime, runtimeVersion: '>=3.11' },
        capabilities: { tools: publishManifest.permissions.filter((p: string) => p.startsWith('memory:')), permissions: publishManifest.permissions },
        trust: { tier: publishManifest.trustTier, requiredTier: 0 },
        governance: { category: publishManifest.category, auditLevel: 'standard' },
      };
      const computeHash = async (data: string) => {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        return '0x' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      };
      const manifestHash = await computeHash(JSON.stringify(fullManifest, Object.keys(fullManifest).sort()));
      const codeChecksum = await computeHash(publishCode);
      // Publish to DSID Network (optional, may fail)
      try {
        const publishRequest: PublishAgentRequest = {
          name: publishManifest.name, description: publishManifest.description, category: publishManifest.category,
          manifest: { ...fullManifest, agent: { ...fullManifest.agent, id: manifestHash } },
          price_per_execution: 0, allow_rental: false, trust_requirements: publishManifest.trustTier,
        };
        await publishAgentAPI(publishRequest).catch(() => {});
      } catch { /* DSID network publish is best-effort */ }

      setPublishResult({ success: true, manifestHash, codeChecksum });
      toast.success('Agent published successfully');
    } catch (error: any) {
      setPublishResult({ success: false, error: error.message });
      toast.error('Publish failed: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  }, [publishManifest, publishCode, toast]);

  const updatePublishManifest = useCallback((key: string, value: any) => {
    setPublishManifest(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2>
          <button
            className={styles.mobileToggleBtn}
            type="button"
            onClick={() => setMobileToolbarOpen(prev => !prev)}
            title={mobileToolbarOpen ? 'Collapse toolbar' : 'Expand toolbar'}
          >
            <Icons.Agents />
            <span className={`${styles.mobileToggleChevron} ${mobileToolbarOpen ? styles.mobileToggleOpen : ''}`}>▾</span>
          </button>
          <span className={styles.desktopAgentIcon}><Icons.Agents /></span>
          {' '}Agent Management
        </h2>
        
        {/* Panel navigation icons — replaces sidebar */}
        <div className={styles.navIcons}>
          {([
            { type: 'goals', icon: <Icons.Goals />, label: 'Goals' },
            { type: 'execution', icon: <Icons.Execution />, label: 'Execution' },
            { type: 'workflow', icon: <Icons.Fork />, label: 'Workflow' },
            { type: 'memory', icon: <Icons.Memory />, label: 'Memory' },
            { type: 'monitor', icon: <Icons.Health />, label: 'Monitor' },
            { type: 'calendar', icon: <Icons.Calendar />, label: 'Schedule Calendar' },
            { type: 'settings', icon: <Icons.Settings />, label: 'Settings' },
          ] as { type: string; icon: React.ReactNode; label: string }[]).map((nav) => (
            <button
              key={nav.type}
              className={`${styles.navIconBtn} ${inlinePanel?.type === nav.type ? styles.navIconActive : ''}`}
              type="button"
              onClick={() => { setInlinePanel({ type: nav.type as any }); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); }}
              title={nav.label}
            >
              {nav.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible toolbar area — toggled on mobile via Agent icon */}
      <div className={`${styles.collapsibleToolbar} ${mobileToolbarOpen ? styles.collapsibleToolbarOpen : ''}`}>
        <div className={styles.headerMeta}>
          <span className={styles.countPill}>{filteredAgents.length}</span>
          <button className={styles.toolbarBtn} type="button" onClick={() => { setShowFactory(true); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setInlinePanel(null); }} title="Create agent">
            <Icons.Plus /> Create
          </button>
          <button
            className={styles.toolbarBtn}
            type="button"
            onClick={() => (bulkMode ? exitBulkMode() : enterBulkMode())}
            title={bulkMode ? 'Exit bulk mode' : 'Bulk actions'}
          >
            <Icons.MousePointer /> {bulkMode ? 'Done' : 'Bulk'}
          </button>

          <div className={styles.headerControls}>
            <div className={styles.searchBox}>
              <Icons.Search />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents"
              />
              {searchQuery && (
                <button className={styles.clearBtn} type="button" onClick={() => setSearchQuery('')} title="Clear">
                  <Icons.X />
                </button>
              )}
            </div>

            <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '80px', minWidth: '80px', maxWidth: '80px' }}>
              <option value="all">All</option>
              <option value="favorites">Favorites</option>
              <option value="openclaw">OpenClaw</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>

            <select className={styles.filterSelect} value={`${sortKey}:${sortDir}`} onChange={(e) => {
              const [k, d] = String(e.target.value).split(':');
              setSortKey(k as any);
              setSortDir(d as any);
            }} style={{ width: '100px', minWidth: '100px', maxWidth: '100px' }}>
              <option value="name:asc">Name (A→Z)</option>
              <option value="name:desc">Name (Z→A)</option>
              <option value="status:asc">Status</option>
              <option value="executions:desc">Executions (high→low)</option>
              <option value="executions:asc">Executions (low→high)</option>
              <option value="costToday:desc">Cost (high→low)</option>
              <option value="costToday:asc">Cost (low→high)</option>
            </select>
          </div>
        </div>

        {/* Mobile swipe tab bar */}
        {hasRightPanel && (
          <div className={styles.mobileTabs}>
            <button
              className={`${styles.mobileTab} ${mobilePanel === 0 ? styles.mobileTabActive : ''}`}
              onClick={() => scrollToMobilePanel(0)}
            >
              Agents
            </button>
            <button
              className={`${styles.mobileTab} ${mobilePanel === 1 && inlinePanel?.type !== 'execution' ? styles.mobileTabActive : ''}`}
              onClick={() => { if (inlinePanel?.type === 'execution') { setInlinePanel(null); } scrollToMobilePanel(1); }}
            >
              {activePanelLabel}
            </button>
            <button
              className={`${styles.mobileTab} ${mobilePanel === 1 && inlinePanel?.type === 'execution' ? styles.mobileTabActive : ''}`}
              onClick={() => { setInlinePanel({ type: 'execution' }); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); scrollToMobilePanel(1); }}
            >
              Steps
            </button>
          </div>
        )}
      </div>

      <div className={styles.splitContainer} ref={splitContainerRef} onScroll={handleMobileSplitScroll}>
        {/* Left pane: agents grid */}
        <div className={`${styles.agentsPane} ${(selectedAgent || showFactory || inlinePanel || chatAgentId || detailAgentId || publishAgentId) ? styles.hasSessions : ''}`}>
          {bulkMode && (
            <div className={styles.panelToolbar}>
              <div className={styles.bulkBar}>
                <span className={styles.bulkCount}>{bulkSelectedCount} selected</span>
                <button className={styles.bulkBtn} type="button" onClick={bulkSelectAll}>Select all</button>
                <button className={styles.bulkBtn} type="button" onClick={bulkSelectNone}>None</button>
                <button className={styles.bulkDangerBtn} type="button" onClick={bulkDelete} disabled={bulkSelectedCount === 0}>Archive</button>
              </div>
            </div>
          )}

          <div className={styles.panelContent}>
            <div className={styles.agentsGrid}>
              {isLoadingAgents && (
                <div className={styles.emptyState}>
                  <Icons.Refresh />
                  <p>Loading agents…</p>
                </div>
              )}
              {filteredAgents.map((agent: Agent) => (
                <div 
                  key={agent.id} 
                  className={`${styles.agentCard} ${selectedAgent?.id === agent.id ? styles.selected : ''}`}
                  onClick={() => selectAgent(agent.id)}
                >
                  {/* Status indicator bar */}
                  <div className={`${styles.statusBar} ${styles[agent.status]}`} />
                  
                  {/* Card header with icon and name */}
                  <div className={styles.cardHeader}>
                    <div className={styles.agentIcon}>
                      <Icons.Agents />
                    </div>
                    <div className={styles.agentInfo}>
                      <h3>{agent.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className={styles.typeBadge}>{agent.type}</span>
                        {agent.agent_source === 'openclaw' && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#121214', letterSpacing: '0.5px', textTransform: 'uppercase',
                          }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: agent.openclaw_config?.connection_status === 'online' ? '#22c55e'
                                : agent.openclaw_config?.connection_status === 'degraded' ? '#f59e0b'
                                : '#ef4444',
                              boxShadow: agent.openclaw_config?.connection_status === 'online'
                                ? '0 0 4px #22c55e' : 'none',
                            }} />
                            OpenClaw
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardTopActions}>
                      {bulkMode && (
                        <button
                          className={`${styles.pinBtn} ${selectedIds.has(agent.id) ? styles.pinActive : ''}`}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelectId(agent.id); }}
                          title={selectedIds.has(agent.id) ? 'Deselect' : 'Select'}
                        >
                          <input className={styles.bulkCheckbox} type="checkbox" readOnly checked={selectedIds.has(agent.id)} />
                        </button>
                      )}

                      <button
                        className={`${styles.pinBtn} ${pinnedSet.has(agent.id) ? styles.pinActive : ''}`}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); if (typeof togglePinnedAgent === 'function') togglePinnedAgent(agent.id); }}
                        title={pinnedSet.has(agent.id) ? 'Unpin (favorite)' : 'Pin (favorite)'}
                      >
                        {pinnedSet.has(agent.id) ? <Icons.StarFilled /> : <Icons.Star />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats row */}
                  <div className={styles.cardStats}>
                    <div className={styles.stat}>
                      <Icons.Zap />
                      <span>{agent.executions}</span>
                    </div>
                    <div className={styles.stat}>
                      <Icons.DollarSign />
                      <span>${agent.costToday.toFixed(2)}</span>
                    </div>
                    <div className={`${styles.modeBadge} ${agent.mode === 'unbounded' ? styles.unbounded : ''}`}>
                      {agent.mode === 'governed' ? <Icons.Lock /> : <Icons.Unlock />}
                    </div>
                  </div>

                  {/* Created timestamp */}
                  <div style={{ padding: '2px 8px 0', fontSize: 9, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icons.Clock />
                    <span>Created {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                  </div>

                  {/* OpenClaw hardware info row */}
                  {agent.agent_source === 'openclaw' && agent.openclaw_config && (
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 8px',
                      fontSize: 9, color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {agent.openclaw_config.hardware?.gpu && (
                        <span style={{ background: 'rgba(139,92,246,0.15)', padding: '1px 5px', borderRadius: 3, color: '#a78bfa' }}>
                          GPU: {agent.openclaw_config.hardware.gpu}
                        </span>
                      )}
                      {agent.openclaw_config.hardware?.cpu && (
                        <span style={{ background: 'rgba(59,130,246,0.15)', padding: '1px 5px', borderRadius: 3, color: '#93c5fd' }}>
                          {agent.openclaw_config.hardware.cpu}
                        </span>
                      )}
                      {agent.openclaw_config.memory_mode && (
                        <span style={{ background: 'rgba(34,197,94,0.15)', padding: '1px 5px', borderRadius: 3, color: '#86efac' }}>
                          Memory: {agent.openclaw_config.memory_mode}
                        </span>
                      )}
                      {agent.openclaw_config.models_available && agent.openclaw_config.models_available.length > 0 && (
                        <span style={{ background: 'rgba(251,191,36,0.15)', padding: '1px 5px', borderRadius: 3, color: '#fcd34d' }}>
                          {agent.openclaw_config.models_available[0]}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons - Run, Message, Detail, Delete */}
                  <div className={styles.cardActions}>
                    {loadingAgentId === agent.id ? (
                      <span className={styles.loadingIndicator}>...</span>
                    ) : (
                      <>
                        {/* Run/Play button — opens sessions panel for this agent */}
                        <button 
                          className={`${styles.actionBtn} ${styles.runBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); selectAgent(agent.id); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); setInlinePanel(null); }}
                          title="Run Agent"
                        >
                          <Icons.Play />
                        </button>
                        
                        {/* Message button — opens inline chat pane */}
                        <button 
                          className={`${styles.actionBtn} ${styles.messageBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setChatAgentId(agent.id); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); setInlinePanel(null); setMessageInput(''); setError(null); }}
                          title="Message Agent"
                        >
                          <Icons.MessageSquare />
                        </button>
                        
                        {/* Detail button — opens inline detail pane */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setDetailAgentId(agent.id); setChatAgentId(null); setPublishAgentId(null); setShowFactory(false); setInlinePanel(null); }}
                          title="View Details"
                        >
                          <Icons.Info />
                        </button>
                        
                        {/* Execution button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setInlinePanel({ type: 'execution', agentId: agent.id }); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); }}
                          title="Execution Monitor"
                        >
                          <Icons.Execution />
                        </button>

                        {/* Utility button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setInlinePanel({ type: 'monitor', agentId: agent.id }); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); }}
                          title="Monitor"
                        >
                          <Icons.TrendingUp />
                        </button>

                        {/* Memory button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setInlinePanel({ type: 'memory', agentId: agent.id }); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setShowFactory(false); }}
                          title="Agent Memory"
                        >
                          <Icons.Memory />
                        </button>

                        {/* Clone button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); handleCloneAgent(agent); }}
                          title="Clone Agent"
                        >
                          <Icons.Copy />
                        </button>
                        
                        {/* Publish button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.detailBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); setPublishAgentId(agent.id); setChatAgentId(null); setDetailAgentId(null); setShowFactory(false); setInlinePanel(null); setPublishManifest(prev => ({ ...prev, name: agent.name, description: '', category: agent.type || 'utility', tags: [] })); setPublishResult(null); }}
                          title="Publish to DSID Network"
                        >
                          <Icons.Upload />
                        </button>
                        
                        {/* Archive button */}
                        <button 
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          disabled={bulkMode}
                          onClick={(e) => { e.stopPropagation(); handleAgentAction('delete', agent.id); }}
                          title="Archive"
                        >
                          <Icons.Trash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!isLoadingAgents && filteredAgents.length === 0 && (
                <div className={styles.emptyState}>
                  <Icons.Agents />
                  <p>No agents found</p>
                  <button
                    className={styles.toolbarBtn}
                    style={{ marginTop: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600 }}
                    onClick={() => { setShowFactory(true); setChatAgentId(null); setDetailAgentId(null); setPublishAgentId(null); setInlinePanel(null); }}
                  >
                    <Icons.Plus /> Create Your First Agent
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: factory > inlinePanel > publish > detail > chat > sessions */}
        {showFactory ? (
          <div className={styles.sessionsPane}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Factory header */}
              <div className={styles.publishHeader}>
                <Icons.Factory />
                <span className={styles.publishTitle}>Create Agent</span>
                <button onClick={() => setShowFactory(false)} className={styles.publishCloseBtn} title="Close">×</button>
              </div>

              {/* Factory content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <FactoryPanel />
              </div>
            </div>
          </div>
        ) : inlinePanel ? (
          <div className={styles.sessionsPane}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Inline panel header */}
              <div className={styles.publishHeader}>
                {{ execution: <Icons.Execution />, memory: <Icons.Memory />, goals: <Icons.Goals />, workflow: <Icons.Fork />, monitor: <Icons.Health />, settings: <Icons.Settings />, sessions: <Icons.Agents />, calendar: <Icons.Calendar /> }[inlinePanel.type]}
                <span className={styles.publishTitle}>
                  {{ execution: 'Execution', memory: 'Memory', goals: 'Goals', workflow: 'Workflow', monitor: 'Monitor', settings: 'Settings', sessions: 'Sessions', calendar: 'Schedule Calendar' }[inlinePanel.type]}
                </span>
                <button onClick={() => setInlinePanel(null)} className={styles.publishCloseBtn} title="Close">×</button>
              </div>

              {/* Inline panel content */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Suspense fallback={<div style={{ padding: 16, color: '#888', fontSize: 12 }}>Loading…</div>}>
                  {inlinePanel.type === 'execution' && <ExecutionPanel />}
                  {inlinePanel.type === 'memory' && <MemoryPanel />}
                  {inlinePanel.type === 'goals' && <GoalsPanel />}
                  {inlinePanel.type === 'workflow' && <WorkflowPanel />}
                  {inlinePanel.type === 'monitor' && <MonitorPanel />}
                  {inlinePanel.type === 'settings' && <SettingsPanel />}
                  {inlinePanel.type === 'sessions' && <SessionsPanel />}
                  {inlinePanel.type === 'calendar' && <ScheduleCalendarPanel />}
                </Suspense>
              </div>
            </div>
          </div>
        ) : publishAgent ? (
          <div className={styles.sessionsPane}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Publish header */}
              <div className={styles.publishHeader}>
                <Icons.Upload />
                <span className={styles.publishTitle}>Publish {publishAgent.name}</span>
                <button
                  onClick={handlePublishAgent}
                  disabled={isPublishing}
                  className={styles.publishBtn}
                >
                  {isPublishing ? 'Publishing…' : 'Publish'}
                </button>
                <button onClick={() => { setPublishAgentId(null); setPublishResult(null); }} className={styles.publishCloseBtn} title="Close">×</button>
              </div>

              {/* Publish content */}
              <div className={styles.publishContent}>
                {/* Result banner */}
                {publishResult && (
                  <div className={`${styles.publishResultBanner} ${publishResult.success ? styles.success : styles.error}`}>
                    {publishResult.success ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>✓ Published Successfully</div>
                        <div style={{ fontSize: 10, color: '#888', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span>Manifest: <code style={{ fontSize: 9 }}>{publishResult.manifestHash?.slice(0, 20)}…</code></span>
                          <span>Checksum: <code style={{ fontSize: 9 }}>{publishResult.codeChecksum?.slice(0, 20)}…</code></span>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#ef4444', fontSize: 12 }}>✗ {publishResult.error}</div>
                    )}
                  </div>
                )}

                {/* Form fields */}
                <div className={styles.publishForm}>
                  <div className={styles.publishFormGridNameVer}>
                    <div>
                      <label className={styles.publishLabel}>Name *</label>
                      <input type="text" className={styles.publishInput} value={publishManifest.name} onChange={e => updatePublishManifest('name', e.target.value)} />
                    </div>
                    <div>
                      <label className={styles.publishLabel}>Version</label>
                      <input type="text" className={styles.publishInput} value={publishManifest.version} onChange={e => updatePublishManifest('version', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className={styles.publishLabel}>Description *</label>
                    <textarea className={styles.publishTextarea} value={publishManifest.description} onChange={e => updatePublishManifest('description', e.target.value)} placeholder="What does your agent do…" />
                  </div>

                  <div className={styles.publishFormGrid2}>
                    <div>
                      <label className={styles.publishLabel}>Category</label>
                      <select className={styles.publishSelect} value={publishManifest.category} onChange={e => updatePublishManifest('category', e.target.value)}>
                        {['utility','analysis','automation','communication','data','developer-tools','productivity','security'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={styles.publishLabel}>License</label>
                      <select className={styles.publishSelect} value={publishManifest.license} onChange={e => updatePublishManifest('license', e.target.value)}>
                        {['MIT','Apache-2.0','GPL-3.0','BSD-3-Clause','Proprietary'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.publishFormGrid2}>
                    <div>
                      <label className={styles.publishLabel}>Author</label>
                      <input type="text" className={styles.publishInput} placeholder="Name" value={publishManifest.authorName} onChange={e => updatePublishManifest('authorName', e.target.value)} />
                    </div>
                    <div>
                      <label className={styles.publishLabel}>Email</label>
                      <input type="email" className={styles.publishInput} placeholder="you@example.com" value={publishManifest.authorEmail} onChange={e => updatePublishManifest('authorEmail', e.target.value)} />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={styles.publishLabel}>Tags</label>
                    <div className={styles.publishTagsWrap}>
                      {publishManifest.tags.map(t => (
                        <span key={t} className={styles.publishTag}>
                          {t} <span onClick={() => updatePublishManifest('tags', publishManifest.tags.filter((x: string) => x !== t))} className={styles.publishTagRemove}>×</span>
                        </span>
                      ))}
                      <input type="text" placeholder="Add…" value={publishTagInput} onChange={e => setPublishTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (publishTagInput.trim() && !publishManifest.tags.includes(publishTagInput.trim())) { updatePublishManifest('tags', [...publishManifest.tags, publishTagInput.trim()]); setPublishTagInput(''); } } }} className={styles.publishTagInput} />
                    </div>
                  </div>

                  {/* Trust Tier */}
                  <div>
                    <label className={styles.publishLabel}>Trust Tier</label>
                    <div className={styles.trustTierRow}>
                      {[{ v: 0, l: 'T0', d: 'Minimal' }, { v: 1, l: 'T1', d: 'Sandbox' }, { v: 2, l: 'T2', d: 'Network' }, { v: 3, l: 'T3', d: 'Extended' }].map(t => (
                        <button key={t.v} onClick={() => updatePublishManifest('trustTier', t.v)} className={`${styles.trustTierBtn} ${publishManifest.trustTier === t.v ? styles.active : ''}`}>
                          <div className={styles.trustTierLabel}>{t.l}</div>
                          <div className={styles.trustTierDesc}>{t.d}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className={styles.publishLabel}>Permissions</label>
                    <div className={styles.permissionsWrap}>
                      {['memory:read','memory:write','network:http','network:websocket','filesystem:read','agent:spawn'].map(p => {
                        const active = publishManifest.permissions.includes(p);
                        return (
                          <button key={p} onClick={() => updatePublishManifest('permissions', active ? publishManifest.permissions.filter((x: string) => x !== p) : [...publishManifest.permissions, p])} className={`${styles.permBtn} ${active ? styles.active : ''}`}>
                            <span className={`${styles.permCheck} ${active ? styles.active : ''}`}>{active ? '✓' : ''}</span>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Code */}
                  <div>
                    <div className={styles.codeRow}>
                      <label className={styles.publishLabel} style={{ marginBottom: 0 }}>Agent Code</label>
                      <div style={{ flex: 1 }} />
                      <select className={styles.codeSelect} value={publishManifest.runtime} onChange={e => updatePublishManifest('runtime', e.target.value)}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                      </select>
                      <input type="text" className={styles.codeEntrypoint} value={publishManifest.entrypoint} onChange={e => updatePublishManifest('entrypoint', e.target.value)} />
                    </div>
                    <textarea className={styles.codeEditor} value={publishCode} onChange={e => setPublishCode(e.target.value)} spellCheck={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : detailAgent ? (
          <div className={styles.sessionsPane}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Detail header */}
              <div className={styles.publishHeader}>
                <Icons.Info />
                <span className={styles.publishTitle}>{detailAgent.name} Details</span>
                <button onClick={() => setDetailAgentId(null)} className={styles.publishCloseBtn} title="Close details">×</button>
              </div>

              {/* Detail content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                <div className={styles.detailHeader}>
                  <span className={`${styles.statusDot} ${styles[detailAgent.status]}`} />
                  <span className={`${styles.modeBadge} ${detailAgent.mode === 'unbounded' ? styles.unbounded : ''}`}>
                    {detailAgent.mode === 'governed' ? <><Icons.Lock /> Governed</> : <><Icons.Unlock /> Unbounded</>}
                  </span>
                </div>

                <div className={styles.agentIdSection}>
                  <div className={styles.agentIdRow}>
                    <span className={styles.agentIdLabel}>Agent ID</span>
                    <div className={styles.agentIdValue}>
                      <code>{detailAgent.id}</code>
                      <button className={styles.copyBtn} onClick={() => copyAgentId(detailAgent.id)} title="Copy Agent ID"><Icons.Copy /></button>
                    </div>
                  </div>
                  <div className={styles.agentIdRow}>
                    <span className={styles.agentIdLabel}>Agent Hash</span>
                    <div className={styles.agentIdValue}>
                      <code>{detailAgent.hash || detailAgent.id}</code>
                      <button className={styles.copyBtn} onClick={() => copyAgentHash(detailAgent)} title="Copy Agent Hash"><Icons.Copy /></button>
                    </div>
                  </div>
                  <div className={styles.agentIdRow}>
                    <span className={styles.agentIdLabel}>DSID</span>
                    <div className={styles.agentIdValue}>
                      <code>{detailAgent.dsid || '—'}</code>
                      <button className={styles.copyBtn} onClick={() => copyAgentDsid(detailAgent)} title="Copy DSID" disabled={!detailAgent.dsid}><Icons.Copy /></button>
                    </div>
                  </div>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Type</span><span className={styles.detailValue}>{detailAgent.type}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Status</span><span className={styles.detailValue}>{detailAgent.status}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Executions</span><span className={styles.detailValue}>{detailAgent.executions.toLocaleString()}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Cost Today</span><span className={styles.detailValue}>${detailAgent.costToday.toFixed(2)}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Wallet Balance</span><span className={styles.detailValue}>${detailAgent.walletBalance.toFixed(2)}</span></div>
                  <div className={styles.detailItem}><span className={styles.detailLabel}>Risk Level</span><span className={`${styles.detailValue} ${styles[detailAgent.riskLevel]}`}>{detailAgent.riskLevel}</span></div>
                </div>

                <div className={styles.detailCapabilities}>
                  <h4>Capabilities</h4>
                  <div className={styles.capsList}>
                    {detailAgent.capabilities.map((cap: string) => (
                      <span key={cap} className={styles.capBadge}>{cap}</span>
                    ))}
                  </div>
                </div>

                {detailAgent.agent_source === 'openclaw' && (
                  <div className={styles.versionSection}>
                    <h4 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#1a1a2e' }}>OpenClaw</span>
                      Federation
                    </h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Source</span>
                        <span className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: detailAgent.openclaw_config?.connection_status === 'online' ? '#22c55e' : detailAgent.openclaw_config?.connection_status === 'degraded' ? '#f59e0b' : '#ef4444' }} />
                          {detailAgent.openclaw_config?.connection_status || 'unknown'}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Memory Mode</span>
                        <span className={styles.detailValue}>{detailAgent.openclaw_config?.memory_mode || 'cloud'}</span>
                      </div>
                      {detailAgent.openclaw_config?.hardware?.gpu && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>GPU</span>
                          <span className={styles.detailValue}>{detailAgent.openclaw_config.hardware.gpu}</span>
                        </div>
                      )}
                      {detailAgent.openclaw_config?.hardware?.cpu && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>CPU</span>
                          <span className={styles.detailValue}>{detailAgent.openclaw_config.hardware.cpu}</span>
                        </div>
                      )}
                      {detailAgent.openclaw_config?.hardware?.ram && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>RAM</span>
                          <span className={styles.detailValue}>{detailAgent.openclaw_config.hardware.ram}</span>
                        </div>
                      )}
                      {detailAgent.openclaw_config?.endpoint_url && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Endpoint</span>
                          <span className={styles.detailValue} style={{ fontSize: 9, wordBreak: 'break-all' }}>{detailAgent.openclaw_config.endpoint_url}</span>
                        </div>
                      )}
                      {detailAgent.openclaw_config?.last_heartbeat && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Last Heartbeat</span>
                          <span className={styles.detailValue}>{new Date(detailAgent.openclaw_config.last_heartbeat).toLocaleString()}</span>
                        </div>
                      )}
                      {detailAgent.openclaw_config?.available_models && detailAgent.openclaw_config.available_models.length > 0 && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Models</span>
                          <span className={styles.detailValue}>{detailAgent.openclaw_config.available_models.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Governance & DSID badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {detailAgent.dsid && (
                        <span style={{ background: 'rgba(139,92,246,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
                          DSID: {detailAgent.dsid.slice(0, 12)}…
                        </span>
                      )}
                      {detailAgent.openclaw_config?.rara_enrolled && (
                        <span style={{ background: 'rgba(34,197,94,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10, color: '#86efac', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                          RARA Governed
                        </span>
                      )}
                      {detailAgent.openclaw_config?.custom_skills && detailAgent.openclaw_config.custom_skills.length > 0 && (
                        <span style={{ background: 'rgba(251,191,36,0.15)', padding: '3px 10px', borderRadius: 6, fontSize: 10, color: '#fcd34d' }}>
                          {detailAgent.openclaw_config.custom_skills.length} custom skills
                        </span>
                      )}
                    </div>

                    {/* Action buttons for OpenClaw agents */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button
                        style={{ flex: 1, padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#1a1a2e' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const resp = await fetch('/api/v1/openclaw/marketplace/list', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` },
                              body: JSON.stringify({ agent_id: detailAgent.id, price: 0, description: detailAgent.name }),
                            });
                            if (resp.ok) alert('Listed on Marketplace!');
                            else { const d = await resp.json(); alert(d.detail || 'Failed'); }
                          } catch { alert('Failed to list'); }
                        }}
                        title="List this agent on the OpenClaw Marketplace"
                      >List on Marketplace</button>
                      <button
                        style={{ flex: 1, padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const resp = await fetch(`/api/v1/openclaw/governance/${detailAgent.id}`, {
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` },
                            });
                            if (resp.ok) { const d = await resp.json(); alert(JSON.stringify(d, null, 2)); }
                            else { const d = await resp.json(); alert(d.detail || 'Failed'); }
                          } catch { alert('Failed to fetch governance'); }
                        }}
                        title="View RARA governance status"
                      >Governance Status</button>
                      <button
                        style={{ flex: 1, padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer', background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const skillName = prompt('Skill name to import from your OpenClaw agent:');
                          if (!skillName) return;
                          const skillDesc = prompt('Skill description:') || skillName;
                          try {
                            const resp = await fastapiClient.post('/api/v1/openclaw/skills/import', {
                              agent_id: detailAgent.id,
                              skills: [{ name: skillName, description: skillDesc, handler: `openclaw://${detailAgent.id}/${skillName}` }],
                            });
                            if (resp.data?.imported) alert(`Imported ${resp.data.imported} skill(s)!`);
                            else alert('Import complete');
                          } catch (err: any) { alert(err?.response?.data?.detail || 'Failed to import skill'); }
                        }}
                        title="Import custom skills from your OpenClaw agent"
                      >Import Skills</button>
                    </div>
                  </div>
                )}

                {agentBenchmarks && (
                  <div className={styles.versionSection}>
                    <h4 className={styles.sectionTitle}><Icons.TrendingUp /> Performance</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>Avg Response</span><span className={styles.detailValue}>{agentBenchmarks.benchmarks?.avg_response_time_ms}ms</span></div>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>P95 Response</span><span className={styles.detailValue}>{agentBenchmarks.benchmarks?.p95_response_time_ms}ms</span></div>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>Success Rate</span><span className={styles.detailValue}>{agentBenchmarks.benchmarks?.success_rate}%</span></div>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>Throughput</span><span className={styles.detailValue}>{agentBenchmarks.benchmarks?.throughput_rpm} req/min</span></div>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>Rank</span><span className={styles.detailValue}>#{agentBenchmarks.comparison?.rank} of {agentBenchmarks.comparison?.total_agents}</span></div>
                      <div className={styles.detailItem}><span className={styles.detailLabel}>vs Platform Avg</span><span className={styles.detailValue} style={{ color: (agentBenchmarks.comparison?.vs_platform_avg || 0) > 0 ? '#22c55e' : '#ef4444' }}>{(agentBenchmarks.comparison?.vs_platform_avg || 0) > 0 ? '+' : ''}{agentBenchmarks.comparison?.vs_platform_avg}%</span></div>
                    </div>
                  </div>
                )}

                {agentActivity.length > 0 && (
                  <div className={styles.versionSection}>
                    <h4 className={styles.sectionTitle}><Icons.Zap /> Recent Activity</h4>
                    <div className={styles.versionList}>
                      {agentActivity.slice(0, 5).map((a: any) => (
                        <div key={a.id} className={styles.versionItem}>
                          <span className={styles.versionNumber}>{a.action_type}</span>
                          <span className={styles.versionChangelog}>{a.description}</span>
                          <span className={styles.versionDate}>{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agentVersions.length > 0 && (
                  <div className={styles.versionSection}>
                    <h4 className={styles.sectionTitle}><Icons.Code /> Version History</h4>
                    <div className={styles.versionList}>
                      {agentVersions.slice(0, 5).map((v: any, idx: number) => (
                        <div key={v.version_number || idx} className={styles.versionItem}>
                          <span className={styles.versionNumber}>v{v.version_number}</span>
                          <span className={styles.versionHash}>{(v.agent_version_hash || '').slice(0, 12)}...</span>
                          <span className={styles.versionDate}>{v.created_at ? new Date(v.created_at).toLocaleDateString() : '-'}</span>
                          {v.changelog && <span className={styles.versionChangelog}>{v.changelog}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions at bottom of detail pane */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
                  <button className={`${styles.primaryBtn} ${styles.runBtn}`} onClick={() => { selectAgent(detailAgent.id); setDetailAgentId(null); }}>
                    <Icons.Play /> Open Sessions
                  </button>
                  <button className={styles.primaryBtn} onClick={() => { setChatAgentId(detailAgent.id); setDetailAgentId(null); }}>
                    <Icons.MessageSquare /> Chat
                  </button>
                  <button className={styles.primaryBtn} onClick={() => { selectAgent(detailAgent.id); setInlinePanel({ type: 'settings', agentId: detailAgent.id }); setDetailAgentId(null); setChatAgentId(null); setPublishAgentId(null); setShowFactory(false); }}>
                    <Icons.Settings /> Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : chatAgent ? (
          <div className={styles.sessionsPane}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Chat header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                <Icons.MessageSquare />
                <span style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Chat with {chatAgent.name}</span>
                <button onClick={() => setChatAgentId(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }} title="Close chat">×</button>
              </div>

              {/* Messages area */}
              <div className={styles.messagesArea} style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                {(agentMessages[chatAgent.id] || []).length === 0 && (
                  <div className={styles.emptyMessages}>
                    <Icons.MessageSquare />
                    <p>Start a conversation with {chatAgent.name}</p>
                  </div>
                )}
                {(agentMessages[chatAgent.id] || []).map((msg) => (
                  <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                    <div className={styles.messageContent}>{msg.content}</div>
                    <div className={styles.messageTime}>{msg.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
                {isSendingMessage && (
                  <div className={`${styles.message} ${styles.agent} ${styles.thinkingMessage}`}>
                    <div className={styles.thinkingRow}>
                      <span className={styles.thinkingSpinner} aria-hidden="true" />
                      <span className={styles.thinkingText}>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className={styles.messageInputArea} style={{ flexShrink: 0, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSendingMessage}
                  onKeyDown={(e) => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSendingMessage}
                >
                  {isSendingMessage ? <span className={styles.sendSpinner} aria-hidden="true" /> : <Icons.Send />}
                </button>
              </div>
            </div>
          </div>
        ) : selectedAgent ? (
          <div className={styles.sessionsPane}>
            <SessionsPanel />
          </div>
        ) : null}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const AgentsPanel = memo(AgentsPanelComponent);
export default AgentsPanel;
