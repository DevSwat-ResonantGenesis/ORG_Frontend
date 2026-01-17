import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
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
  
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalAgent, setModalAgent] = useState<Agent | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredAgents = agents.filter((agent: Agent) => {
    if (filter !== 'all' && agent.status !== filter) return false;
    if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open modal
  const openModal = useCallback((type: ModalType, agent: Agent) => {
    setModalAgent(agent);
    setActiveModal(type);
    setGoalInput('');
    setMessageInput('');
    setError(null);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalAgent(null);
    setGoalInput('');
    setMessageInput('');
    setError(null);
  }, []);

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
          const res = await fetch(`/api/v1/agents/${modalAgent.id}/sessions/${session.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setSessionStatus('completed');
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
              setError(data.error_message || 'Agent execution failed');
              updateAgent(modalAgent.id, { status: 'idle' as const });
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 2000);
      
      setGoalInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to start agent');
      setSessionStatus('failed');
      console.error('Failed to start agent:', err);
    } finally {
      setIsRunning(false);
    }
  }, [modalAgent, goalInput, updateAgent]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!modalAgent || !messageInput.trim()) return;
    
    const userMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageInput.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'agent',
        content: `Processing your message: "${userMessage.content}"\n\nI'll work on this and get back to you shortly.`,
        timestamp: new Date(),
      }]);
    }, 1500);
  }, [modalAgent, messageInput]);

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
            closeModal();
          }
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
      console.error('Agent action failed:', err);
    } finally {
      setLoadingAgentId(null);
    }
  }, [stopAgent, pauseAgent, removeAgent, closeModal]);

  const copyAgentId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
  }, []);

  const copyAgentHash = useCallback((agent: Agent) => {
    const hash = agent.hash || agent.id;
    navigator.clipboard.writeText(hash);
  }, []);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Agents /> Agent Management</h2>
      </div>

      <div className={styles.panelContent}>
        <div className={styles.agentsGrid}>
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
                      onClick={(e) => { e.stopPropagation(); openModal('run', agent); }}
                      title="Run Agent"
                    >
                      <Icons.Play />
                    </button>
                    
                    {/* Message button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.messageBtn}`}
                      onClick={(e) => { e.stopPropagation(); openModal('message', agent); }}
                      title="Message Agent"
                    >
                      <Icons.MessageSquare />
                    </button>
                    
                    {/* Detail button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.detailBtn}`}
                      onClick={(e) => { e.stopPropagation(); openModal('detail', agent); }}
                      title="View Details"
                    >
                      <Icons.Info />
                    </button>
                    
                    {/* Delete button */}
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
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
          {filteredAgents.length === 0 && (
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><Icons.MessageSquare /> Chat with {modalAgent.name}</h3>
              <button className={styles.modalClose} onClick={closeModal}>×</button>
            </div>
            <div className={styles.modalBody}>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
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
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
                    <code>{`0x${modalAgent.id.split('-').join('').slice(0, 40)}`}</code>
                    <button 
                      className={styles.copyBtn} 
                      onClick={() => copyAgentHash(modalAgent)}
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
