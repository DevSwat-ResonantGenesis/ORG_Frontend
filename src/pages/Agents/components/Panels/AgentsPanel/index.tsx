import React, { memo, useState, useCallback } from 'react';
import { useAgentStore, selectAgents, selectSelectedAgent } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { startAgentSession, stopAgentSession, deleteAgent } from '../../../../../api/agents';
import styles from './AgentsPanel.module.css';

// ============== AGENTS PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy, network]

interface AgentsPanelProps {
  className?: string;
}

const AgentsPanelComponent: React.FC<AgentsPanelProps> = ({ className }) => {
  const agents = useAgentStore(selectAgents);
  const selectedAgent = useAgentStore(selectSelectedAgent);
  const { selectAgent, startAgent, stopAgent, pauseAgent, archiveAgent, updateAgent, removeAgent } = useAgentStore();
  
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'messages'>('list');
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredAgents = agents.filter((agent: Agent) => {
    if (filter !== 'all' && agent.status !== filter) return false;
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAgentAction = useCallback(async (action: 'start' | 'stop' | 'pause' | 'archive' | 'delete', agentId: string) => {
    setLoadingAgentId(agentId);
    setError(null);
    
    try {
      switch (action) {
        case 'start':
          // Call backend to start a session
          const goal = prompt('Enter a goal for the agent:');
          if (goal) {
            const session = await startAgentSession(agentId, goal);
            updateAgent(agentId, { status: 'active' as const });
            console.log('Started session:', session.id);
          }
          break;
        case 'stop':
          // For now, just update local state - would need active session ID
          stopAgent(agentId);
          break;
        case 'pause':
          pauseAgent(agentId);
          break;
        case 'archive':
          archiveAgent(agentId);
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this agent?')) {
            await deleteAgent(agentId);
            removeAgent(agentId);
          }
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
      console.error('Agent action failed:', err);
    } finally {
      setLoadingAgentId(null);
    }
  }, [startAgent, stopAgent, pauseAgent, archiveAgent, updateAgent, removeAgent]);

  const copyAgentId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
  }, []);

  const copyAgentHash = useCallback((agent: Agent) => {
    const hash = `0x${agent.id.split('-').join('').slice(0, 40)}`;
    navigator.clipboard.writeText(hash);
  }, []);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Agents /> Agent Management</h2>
        <div className={styles.viewTabs}>
          <button 
            className={`${styles.viewTab} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button 
            className={`${styles.viewTab} ${viewMode === 'detail' ? styles.active : ''}`}
            onClick={() => setViewMode('detail')}
          >
            Detail
          </button>
          <button 
            className={`${styles.viewTab} ${viewMode === 'messages' ? styles.active : ''}`}
            onClick={() => setViewMode('messages')}
          >
            Messages
          </button>
        </div>
      </div>


      <div className={styles.panelContent}>
        {viewMode === 'list' && (
          <div className={styles.agentsList}>
            {filteredAgents.map((agent: Agent) => (
              <div 
                key={agent.id} 
                className={`${styles.agentCard} ${selectedAgent?.id === agent.id ? styles.selected : ''}`}
                onClick={() => selectAgent(agent.id)}
              >
                <div className={styles.agentHeader}>
                  <span className={`${styles.statusDot} ${styles[agent.status]}`} />
                  <h3>{agent.name}</h3>
                  <span className={styles.typeBadge}>{agent.type}</span>
                </div>
                <div className={styles.agentMeta}>
                  <span><Icons.Zap /> {agent.executions} runs</span>
                  <span><Icons.DollarSign /> ${agent.costToday.toFixed(2)}</span>
                  <span className={`${styles.modeBadge} ${agent.mode === 'unbounded' ? styles.unbounded : ''}`}>
                    {agent.mode === 'governed' ? <Icons.Lock /> : <Icons.Unlock />}
                    {agent.mode}
                  </span>
                </div>
                <div className={styles.agentActions}>
                  {loadingAgentId === agent.id ? (
                    <span className={styles.loadingIndicator}>Loading...</span>
                  ) : (
                    <>
                      {agent.status === 'idle' && (
                        <button onClick={(e) => { e.stopPropagation(); handleAgentAction('start', agent.id); }}>
                          <Icons.Play /> Start
                        </button>
                      )}
                      {agent.status === 'active' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); handleAgentAction('pause', agent.id); }}>
                            <Icons.Pause /> Pause
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleAgentAction('stop', agent.id); }}>
                            <Icons.Stop /> Stop
                          </button>
                        </>
                      )}
                      {agent.status === 'paused' && (
                        <button onClick={(e) => { e.stopPropagation(); handleAgentAction('start', agent.id); }}>
                          <Icons.Play /> Resume
                        </button>
                      )}
                      <button 
                        className={styles.deleteBtn}
                        onClick={(e) => { e.stopPropagation(); handleAgentAction('delete', agent.id); }}
                        title="Delete agent"
                      >
                        <Icons.Trash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filteredAgents.length === 0 && (
              <div className={styles.emptyState}>
                <Icons.Agents />
                <p>No agents found</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'detail' && selectedAgent && (
          <div className={styles.agentDetail}>
            <div className={styles.detailHeader}>
              <span className={`${styles.statusDot} ${styles[selectedAgent.status]}`} />
              <h3>{selectedAgent.name}</h3>
              <span className={`${styles.modeBadge} ${selectedAgent.mode === 'unbounded' ? styles.unbounded : ''}`}>
                {selectedAgent.mode === 'governed' ? <><Icons.Lock /> Governed</> : <><Icons.Unlock /> Unbounded</>}
              </span>
            </div>

            {/* Agent ID/Hash Copy Section */}
            <div className={styles.agentIdSection}>
              <div className={styles.agentIdRow}>
                <span className={styles.agentIdLabel}>Agent ID</span>
                <div className={styles.agentIdValue}>
                  <code>{selectedAgent.id}</code>
                  <button 
                    className={styles.copyBtn} 
                    onClick={() => copyAgentId(selectedAgent.id)}
                    title="Copy Agent ID"
                  >
                    <Icons.Copy />
                  </button>
                </div>
              </div>
              <div className={styles.agentIdRow}>
                <span className={styles.agentIdLabel}>Agent Hash</span>
                <div className={styles.agentIdValue}>
                  <code>{`0x${selectedAgent.id.split('-').join('').slice(0, 40)}`}</code>
                  <button 
                    className={styles.copyBtn} 
                    onClick={() => copyAgentHash(selectedAgent)}
                    title="Copy Agent Hash"
                  >
                    <Icons.Copy />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Type</span>
                <span className={styles.detailValue}>{selectedAgent.type}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={styles.detailValue}>{selectedAgent.status}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Executions</span>
                <span className={styles.detailValue}>{selectedAgent.executions.toLocaleString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cost Today</span>
                <span className={styles.detailValue}>${selectedAgent.costToday.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Wallet Balance</span>
                <span className={styles.detailValue}>${selectedAgent.walletBalance.toFixed(2)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Risk Level</span>
                <span className={`${styles.detailValue} ${styles[selectedAgent.riskLevel]}`}>
                  {selectedAgent.riskLevel}
                </span>
              </div>
            </div>

            <div className={styles.detailCapabilities}>
              <h4>Capabilities</h4>
              <div className={styles.capsList}>
                {selectedAgent.capabilities.map((cap: string) => (
                  <span key={cap} className={styles.capBadge}>{cap}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'detail' && !selectedAgent && (
          <div className={styles.emptyState}>
            <Icons.User />
            <p>Select an agent to view details</p>
          </div>
        )}

        {viewMode === 'messages' && (
          <div className={styles.messagesView}>
            <div className={styles.emptyState}>
              <Icons.MessageSquare />
              <p>Agent messages will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const AgentsPanel = memo(AgentsPanelComponent);
export default AgentsPanel;
