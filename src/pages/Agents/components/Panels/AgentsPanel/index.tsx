import React, { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useAgentStore, useUIStore, selectAgents, selectSelectedAgent } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { startAgentSession, stopAgentSession, deleteAgent } from '../../../../../api/agents';
import { getSession as getAgentSession } from '../../../../../api/agentEngine';
import { executeAgentTask } from '../../../../../api/executions';
import { useToastContext } from '../../../../../context/ToastContext';
import styles from './AgentsPanel.module.css';

// ============== AGENTS PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy, network]

interface AgentsPanelProps {
  className?: string;
}

// Modal types
type ModalType = 'run' | 'message' | 'detail' | null;

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const AgentsPanelComponent: React.FC<AgentsPanelProps> = ({ className }) => {
  const agents = useAgentStore(selectAgents);
  const selectedAgent = useAgentStore(selectSelectedAgent);
  const { selectAgent, startAgent, stopAgent, pauseAgent, archiveAgent, updateAgent, removeAgent } = useAgentStore();
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
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalAgentId, setModalAgentId] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const modalAgent = modalAgentId ? agents.find((a: Agent) => a.id === modalAgentId) || null : null;

  const pinnedSet = useMemo(() => new Set(pinnedAgentIds || []), [pinnedAgentIds]);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = agents
      .filter((agent: Agent) => {
        if (filter === 'favorites' && !pinnedSet.has(agent.id)) return false;
        if (filter !== 'all' && filter !== 'favorites' && agent.status !== filter) return false;
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
    if (!confirm(`Delete ${bulkSelectedCount} agent(s)? This cannot be undone.`)) return;

    const ids = Array.from(selectedIds);
    let deleted = 0;
    for (const id of ids) {
      try {
        await deleteAgent(id);
        removeAgent(id);
        deleted += 1;
      } catch (e: any) {
        toast.error(e?.message || `Failed to delete agent ${id}`);
      }
    }

    if (deleted > 0) toast.success(`Deleted ${deleted} agent(s)`);
    exitBulkMode();
  }, [bulkSelectedCount, exitBulkMode, removeAgent, selectedIds, toast]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open modal
  const openModal = useCallback((type: ModalType, agent: Agent) => {
    lastActiveElementRef.current = (document.activeElement as HTMLElement) || null;
    setModalAgentId(agent.id);
    setActiveModal(type);
    setGoalInput('');
    setMessageInput('');
    setError(null);
  }, []);

  useEffect(() => {
    const onOpenModal = (e: Event) => {
      const detail = (e as CustomEvent).detail as { type?: ModalType; agentId?: string } | undefined;
      if (!detail?.type || !detail?.agentId) return;
      const agent = agents.find((a) => a.id === detail.agentId);
      if (!agent) return;
      openModal(detail.type, agent);
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

    document.addEventListener('agentos:agents:openModal', onOpenModal as any);
    document.addEventListener('agentos:agents:toggleFavoritesFilter', onToggleFavoritesFilter as any);
    document.addEventListener('agentos:agents:toggleBulkMode', onToggleBulkMode as any);
    return () => {
      document.removeEventListener('agentos:agents:openModal', onOpenModal as any);
      document.removeEventListener('agentos:agents:toggleFavoritesFilter', onToggleFavoritesFilter as any);
      document.removeEventListener('agentos:agents:toggleBulkMode', onToggleBulkMode as any);
    };
  }, [agents, openModal]);

  // Close modal
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalAgentId(null);
    setGoalInput('');
    setMessageInput('');
    setError(null);

    // Restore focus back to the triggering element for keyboard users
    const el = lastActiveElementRef.current;
    if (el && typeof el.focus === 'function') {
      setTimeout(() => el.focus(), 0);
    }
  }, []);

  // ESC to close any modal
  useEffect(() => {
    if (!activeModal) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, closeModal]);

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

  // Session state for run modal
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'starting' | 'running' | 'completed' | 'failed'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Handle Run agent
  const handleRunAgent = useCallback(async () => {
    if (!modalAgent || !goalInput.trim()) return;

    if (modalAgent.persisted === false) {
      setError('This agent is not persisted on the server, so it cannot run sessions. Create the agent on the server first.');
      return;
    }
    
    setIsRunning(true);
    setSessionStatus('starting');
    setError(null);
    
    try {
      const session = await startAgentSession(modalAgent.id, goalInput.trim());
      setSessionId(session.id);
      setSessionStatus('running');
      updateAgent(modalAgent.id, { status: 'active' as const });
      
      // Poll for session status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await getAgentSession(session.id);
          if (data.status === 'completed') {
            setSessionStatus('completed');
            toast.success('Agent run completed');
            setMessages([{
              id: `msg-${Date.now()}`,
              role: 'agent',
              content: data.final_output || 'Task completed successfully.',
              timestamp: new Date(),
            }]);
            updateAgent(modalAgent.id, { status: 'idle' as const });
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else if (data.status === 'failed') {
            setSessionStatus('failed');
            const msg = data.error_message || 'Agent execution failed';
            toast.error(msg);
            setError(msg);
            updateAgent(modalAgent.id, { status: 'idle' as const });
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } catch (e) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setSessionStatus('failed');
          toast.error('Failed to fetch agent session status. Please try again.');
          setError('Failed to fetch agent session status. Please try again.');
          updateAgent(modalAgent.id, { status: 'idle' as const });
        }
      }, 2000);
      
      setGoalInput('');
    } catch (err: any) {
      const msg = err.message || 'Failed to start agent';
      toast.error(msg);
      setError(msg);
      setSessionStatus('failed');
      console.error('Failed to start agent:', err);
    } finally {
      setIsRunning(false);
    }
  }, [modalAgent, goalInput, toast, updateAgent]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!modalAgent || !messageInput.trim() || isSendingMessage) return;

    if (modalAgent.persisted === false) {
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

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setError(null);
    setIsSendingMessage(true);

    try {
      const result = await executeAgentTask(modalAgent.id, content, { mode: 'chat' });
      const outputText = typeof result?.output === 'string'
        ? result.output
        : result?.output
          ? JSON.stringify(result.output, null, 2)
          : '';

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: outputText || (result?.success ? 'Done.' : (result?.error || 'Failed to execute task.')),
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      const msg = err?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
      setError(msg);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: msg,
        timestamp: new Date(),
      }]);
    } finally {
      setIsSendingMessage(false);
    }
  }, [modalAgent, messageInput, isSendingMessage, toast]);

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
          if (confirm('Are you sure you want to delete this agent?')) {
            await deleteAgent(agentId);
            removeAgent(agentId);
            toast.success('Agent deleted');
            closeModal();
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
  }, [stopAgent, pauseAgent, removeAgent, closeModal, toast]);

  const copyAgentId = useCallback((id: string) => {
    (async () => {
      try {
        await navigator.clipboard.writeText(id);
        toast.success('Copied Agent ID');
      } catch {
        toast.error('Failed to copy');
      }
    })();
  }, [toast]);

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

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Agents /> Agent Management</h2>
        <div className={styles.headerMeta}>
          <span className={styles.countPill}>{filteredAgents.length}</span>
          <button className={styles.toolbarBtn} type="button" onClick={() => setActiveSection('factory')} title="Create agent">
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
        </div>
      </div>

      <div className={styles.panelToolbar}>
        <div className={styles.searchBox}>
          <Icons.Search />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name"
          />
          {searchQuery && (
            <button className={styles.clearBtn} type="button" onClick={() => setSearchQuery('')} title="Clear">
              <Icons.X />
            </button>
          )}
        </div>

        <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="favorites">Favorites</option>
          <option value="active">Active</option>
          <option value="idle">Idle</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>

        <select className={styles.filterSelect} value={`${sortKey}:${sortDir}`} onChange={(e) => {
          const [k, d] = String(e.target.value).split(':');
          setSortKey(k as any);
          setSortDir(d as any);
        }}>
          <option value="name:asc">Name (A→Z)</option>
          <option value="name:desc">Name (Z→A)</option>
          <option value="status:asc">Status</option>
          <option value="executions:desc">Executions (high→low)</option>
          <option value="executions:asc">Executions (low→high)</option>
          <option value="costToday:desc">Cost (high→low)</option>
          <option value="costToday:asc">Cost (low→high)</option>
        </select>

        {bulkMode && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{bulkSelectedCount} selected</span>
            <button className={styles.bulkBtn} type="button" onClick={bulkSelectAll}>Select all</button>
            <button className={styles.bulkBtn} type="button" onClick={bulkSelectNone}>None</button>
            <button className={styles.bulkBtn} type="button" onClick={bulkArchive} disabled={bulkSelectedCount === 0}>Archive</button>
            <button className={styles.bulkDangerBtn} type="button" onClick={bulkDelete} disabled={bulkSelectedCount === 0}>Delete</button>
          </div>
        )}
      </div>

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
                  <span className={styles.typeBadge}>{agent.type}</span>
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
              
              {/* Action buttons - Run, Message, Detail, Delete */}
              <div className={styles.cardActions}>
                {loadingAgentId === agent.id ? (
                  <span className={styles.loadingIndicator}>...</span>
                ) : (
                  <>
                    {/* Run/Play button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.runBtn}`}
                      disabled={bulkMode}
                      onClick={(e) => { e.stopPropagation(); openModal('run', agent); }}
                      title="Run Agent"
                    >
                      <Icons.Play />
                    </button>
                    
                    {/* Message button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.messageBtn}`}
                      disabled={bulkMode}
                      onClick={(e) => { e.stopPropagation(); openModal('message', agent); }}
                      title="Message Agent"
                    >
                      <Icons.MessageSquare />
                    </button>
                    
                    {/* Detail button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.detailBtn}`}
                      disabled={bulkMode}
                      onClick={(e) => { e.stopPropagation(); openModal('detail', agent); }}
                      title="View Details"
                    >
                      <Icons.Info />
                    </button>
                    
                    {/* Delete button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      disabled={bulkMode}
                      onClick={(e) => { e.stopPropagation(); handleAgentAction('delete', agent.id); }}
                      title="Delete"
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
            </div>
          )}
        </div>
      </div>

      {/* ============== MODALS ============== */}
      
      {/* Run Modal */}
      {activeModal === 'run' && modalAgent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Run ${modalAgent.name}`}>
            <div className={styles.modalHeader}>
              <h3><Icons.Play /> Run {modalAgent.name}</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {error && <div className={styles.errorMsg}>{error}</div>}
              
              {/* Status Indicator - Compact */}
              {sessionStatus !== 'idle' && (
                <div className={styles.statusIndicator} data-status={sessionStatus}>
                  <div className={styles.statusDot} />
                  <span className={styles.statusText}>
                    {sessionStatus === 'starting' && 'Starting agent...'}
                    {sessionStatus === 'running' && 'Processing task...'}
                    {sessionStatus === 'completed' && 'Completed'}
                    {sessionStatus === 'failed' && 'Failed'}
                  </span>
                  {(sessionStatus === 'starting' || sessionStatus === 'running') && (
                    <div className={styles.statusLoader} />
                  )}
                </div>
              )}
              
              {/* Show input only when idle or failed */}
              {(sessionStatus === 'idle' || sessionStatus === 'failed') && (
                <div className={styles.inputGroup}>
                  <label>What should the agent do?</label>
                  <textarea
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    placeholder="Enter a goal or task for the agent..."
                    rows={3}
                    autoFocus
                  />
                </div>
              )}
              
              {/* Show result when completed */}
              {sessionStatus === 'completed' && messages.length > 0 && (
                <div className={styles.resultArea}>
                  <div className={styles.resultHeader}>
                    <Icons.CheckCircle /> Result
                  </div>
                  <div className={styles.resultContent}>
                    {messages[messages.length - 1]?.content}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setSessionStatus('idle');
                setMessages([]);
                closeModal();
              }}>
                {sessionStatus === 'completed' ? 'Close' : 'Cancel'}
              </button>
              {(sessionStatus === 'idle' || sessionStatus === 'failed') && (
                <button 
                  className={styles.primaryBtn} 
                  onClick={handleRunAgent}
                  disabled={!goalInput.trim() || isRunning}
                >
                  {isRunning ? 'Starting...' : 'Run Agent'}
                </button>
              )}
              {sessionStatus === 'completed' && (
                <button 
                  className={styles.primaryBtn} 
                  onClick={() => {
                    setSessionStatus('idle');
                    setMessages([]);
                  }}
                >
                  Run Another Task
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {activeModal === 'message' && modalAgent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Chat with ${modalAgent.name}`}>
            <div className={styles.modalHeader}>
              <h3><Icons.MessageSquare /> Chat with {modalAgent.name}</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              {error && <div className={styles.errorMsg}>{error}</div>}
              {/* Messages area */}
              <div className={styles.messagesArea}>
                {messages.length === 0 && (
                  <div className={styles.emptyMessages}>
                    <Icons.MessageSquare />
                    <p>Start a conversation with {modalAgent.name}</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                    <div className={styles.messageContent}>{msg.content}</div>
                    <div className={styles.messageTime}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className={styles.messageInputArea}>
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
                  <Icons.Send />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModal === 'detail' && modalAgent && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`${modalAgent.name} details`}>
            <div className={styles.modalHeader}>
              <h3><Icons.Info /> {modalAgent.name} Details</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailHeader}>
                <span className={`${styles.statusDot} ${styles[modalAgent.status]}`} />
                <span className={`${styles.modeBadge} ${modalAgent.mode === 'unbounded' ? styles.unbounded : ''}`}>
                  {modalAgent.mode === 'governed' ? <><Icons.Lock /> Governed</> : <><Icons.Unlock /> Unbounded</>}
                </span>
              </div>

              {/* Agent ID/Hash Copy Section */}
              <div className={styles.agentIdSection}>
                <div className={styles.agentIdRow}>
                  <span className={styles.agentIdLabel}>Agent ID</span>
                  <div className={styles.agentIdValue}>
                    <code>{modalAgent.id}</code>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => copyAgentId(modalAgent.id)}
                      title="Copy Agent ID"
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                </div>
                <div className={styles.agentIdRow}>
                  <span className={styles.agentIdLabel}>Agent Hash</span>
                  <div className={styles.agentIdValue}>
                    <code>{modalAgent.hash || modalAgent.id}</code>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => copyAgentHash(modalAgent)}
                      title="Copy Agent Hash"
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                </div>

                <div className={styles.agentIdRow}>
                  <span className={styles.agentIdLabel}>DSID</span>
                  <div className={styles.agentIdValue}>
                    <code>{modalAgent.dsid || '—'}</code>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => copyAgentDsid(modalAgent)}
                      title="Copy DSID"
                      disabled={!modalAgent.dsid}
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>{modalAgent.type}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>{modalAgent.status}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Executions</span>
                  <span className={styles.detailValue}>{modalAgent.executions.toLocaleString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Cost Today</span>
                  <span className={styles.detailValue}>${modalAgent.costToday.toFixed(2)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Wallet Balance</span>
                  <span className={styles.detailValue}>${modalAgent.walletBalance.toFixed(2)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Risk Level</span>
                  <span className={`${styles.detailValue} ${styles[modalAgent.riskLevel]}`}>
                    {modalAgent.riskLevel}
                  </span>
                </div>
              </div>

              <div className={styles.detailCapabilities}>
                <h4>Capabilities</h4>
                <div className={styles.capsList}>
                  {modalAgent.capabilities.map((cap: string) => (
                    <span key={cap} className={styles.capBadge}>{cap}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Close</button>
              <button 
                className={`${styles.primaryBtn} ${styles.runBtn}`}
                onClick={() => { closeModal(); openModal('run', modalAgent); }}
              >
                <Icons.Play /> Run Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const AgentsPanel = memo(AgentsPanelComponent);
export default AgentsPanel;
