import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as agentEngine from '../../../../../api/agentEngine';
import type { AgentSession, AgentStep } from '../../../../../api/agentEngine';
import styles from './MemoryPanel.module.css';

// ============== MEMORY PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy]
// Data source: Agent Engine sessions & steps (real execution data)

interface MemoryEntry {
  id: string;
  type: 'short_term' | 'long_term' | 'vector';
  content: string;
  timestamp: Date;
  agentId: string;
  tokens?: number;
  status?: string;
  goal?: string;
}

interface MemoryPanelProps {
  className?: string;
}

const MemoryPanelComponent: React.FC<MemoryPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const storeSelectedAgentId = useAgentStore(state => state.selectedAgentId);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'short_term' | 'long_term' | 'vector'>('short_term');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, AgentStep[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select the agent from the store when it changes
  useEffect(() => {
    if (storeSelectedAgentId && storeSelectedAgentId !== selectedAgentId) {
      setSelectedAgentId(storeSelectedAgentId);
    }
  }, [storeSelectedAgentId]);

  // Fetch sessions from Agent Engine
  const fetchSessions = useCallback(async () => {
    if (!selectedAgentId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const allSessions = await agentEngine.listSessions(selectedAgentId);
      setSessions(allSessions);
    } catch (err: any) {
      console.error('Failed to fetch agent sessions:', err);
      setError(err.message || 'Failed to load agent memory');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    fetchSessions();
    setExpandedSteps({});
  }, [fetchSessions]);

  // Load steps for a session
  const loadSteps = useCallback(async (sessionId: string) => {
    if (expandedSteps[sessionId]) {
      // Toggle off
      setExpandedSteps(prev => { const n = { ...prev }; delete n[sessionId]; return n; });
      return;
    }
    try {
      const steps = await agentEngine.getSessionSteps(sessionId);
      setExpandedSteps(prev => ({ ...prev, [sessionId]: steps }));
    } catch (err: any) {
      console.error('Failed to load steps:', err);
    }
  }, [expandedSteps]);

  // Compute stats from real session data
  const runningSessions = sessions.filter(s => s.status === 'running' || s.status === 'initializing');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const allSessions = sessions;
  const totalTokens = sessions.reduce((sum, s) => sum + (s.total_tokens_used || 0), 0);
  const totalOutputs = completedSessions.filter(s => s.final_output).length;

  // Build memory entries from sessions based on active tab
  const memoryEntries: MemoryEntry[] = (() => {
    let src: AgentSession[] = [];
    if (activeTab === 'short_term') {
      // Short-term = running + recent sessions (last 5)
      src = [...runningSessions, ...sessions.filter(s => s.status !== 'running' && s.status !== 'initializing').slice(0, 5)];
    } else if (activeTab === 'long_term') {
      // Long-term = completed sessions with outputs
      src = completedSessions.filter(s => s.final_output);
    } else {
      // Vector = all sessions (full history)
      src = allSessions;
    }
    return src.map(s => ({
      id: s.id,
      type: activeTab,
      content: activeTab === 'long_term' 
        ? (s.final_output || s.current_goal || 'No output') 
        : (s.current_goal || 'No goal'),
      timestamp: s.created_at ? new Date(s.created_at) : new Date(),
      agentId: s.agent_id,
      tokens: s.total_tokens_used || 0,
      status: s.status,
      goal: s.current_goal,
    }));
  })();

  const filteredEntries = searchQuery
    ? memoryEntries.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : memoryEntries;

  // Export all session data as JSON
  const handleExportAll = () => {
    const exportData = {
      agent_id: selectedAgentId,
      exported_at: new Date().toISOString(),
      sessions: sessions.map(s => ({
        id: s.id, status: s.status, goal: s.current_goal,
        tokens: s.total_tokens_used, output: s.final_output,
        created_at: s.created_at, completed_at: s.completed_at,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-memory-${selectedAgentId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'running': case 'initializing': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Memory /> Agent Memory</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">Select Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
            {agents.length === 0 && (
              <option value="" disabled>No agents available - create one first</option>
            )}
          </select>
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
            <span>Loading memories...</span>
          </div>
        )}
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4>Short-Term Memory</h4>
            <div className={styles.statValue}>{runningSessions.length + Math.min(sessions.length, 5)}</div>
            <div className={styles.statMeta}>{totalTokens.toLocaleString()} tokens</div>
          </div>
          <div className={styles.statCard}>
            <h4>Long-Term Memory</h4>
            <div className={styles.statValue}>{totalOutputs}</div>
            <div className={styles.statMeta}>{completedSessions.length} completed</div>
          </div>
          <div className={styles.statCard}>
            <h4>Vector Store</h4>
            <div className={styles.statValue}>{allSessions.length}</div>
            <div className={styles.statMeta}>{allSessions.length} sessions</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsBar}>
          <div className={styles.tabs}>
            {(['short_term', 'long_term', 'vector'] as const).map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'short_term' && 'Short-Term'}
                {tab === 'long_term' && 'Long-Term'}
                {tab === 'vector' && 'Vector Store'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Memory List */}
        <div className={styles.memoryList}>
          {filteredEntries.map(entry => (
            <div key={entry.id} className={styles.memoryCard}>
              <div className={styles.memoryHeader}>
                <span className={styles.memoryType} style={{ color: statusColor(entry.status) }}>
                  {entry.status || 'unknown'}
                </span>
                <span className={styles.memoryTime}>
                  {entry.timestamp.toLocaleString()}
                </span>
              </div>
              {entry.goal && activeTab === 'long_term' && (
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>Goal: {entry.goal.slice(0, 120)}{entry.goal.length > 120 ? '...' : ''}</div>
              )}
              <div className={styles.memoryContent}>
                {entry.content.slice(0, activeTab === 'long_term' ? 500 : 200)}
                {entry.content.length > (activeTab === 'long_term' ? 500 : 200) ? '...' : ''}
              </div>
              <div className={styles.memoryMeta}>
                {entry.tokens ? <span><Icons.Zap /> {entry.tokens.toLocaleString()} tokens</span> : null}
              </div>
              <div className={styles.memoryActions}>
                <button className={styles.viewBtn} onClick={() => loadSteps(entry.id)}>
                  <Icons.Eye /> {expandedSteps[entry.id] ? 'Hide Steps' : 'View Steps'}
                </button>
              </div>
              {expandedSteps[entry.id] && (
                <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid rgba(1,166,188,0.3)' }}>
                  {expandedSteps[entry.id].length === 0 && (
                    <div style={{ fontSize: 12, opacity: 0.5 }}>No steps recorded</div>
                  )}
                  {expandedSteps[entry.id].map((step, idx) => (
                    <div key={step.id || idx} style={{ fontSize: 12, marginBottom: 6, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: statusColor(step.status), fontWeight: 600 }}>{step.step_type}</span>
                      {step.tool_name && <span style={{ opacity: 0.7 }}> → {step.tool_name}</span>}
                      {step.output_data?.output && (
                        <div style={{ opacity: 0.6, marginTop: 2 }}>{String(step.output_data.output).slice(0, 150)}...</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {filteredEntries.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <Icons.Memory />
              <p>{selectedAgentId ? 'No sessions found — run your agent to build memory' : 'Select an agent to view memory'}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsBar}>
          <button className={styles.syncBtn} onClick={fetchSessions} disabled={!selectedAgentId || isLoading}>
            <Icons.Refresh /> Refresh
          </button>
          <button className={styles.exportBtn} onClick={handleExportAll} disabled={!selectedAgentId || sessions.length === 0}>
            <Icons.Download /> Export All
          </button>
        </div>
      </div>
    </div>
  );
};

export const MemoryPanel = memo(MemoryPanelComponent);
export default MemoryPanel;
