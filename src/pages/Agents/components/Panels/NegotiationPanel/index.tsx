import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as teamsApi from '../../../../../api/teams';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './NegotiationPanel.module.css';

// ============== NEGOTIATION PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Connected to: /api/v1/negotiations/*, /api/v1/agents/teams/*, /api/v1/executions/agents/*/delegate

interface Negotiation {
  id: string;
  agents: string[];
  topic: string;
  status: string;
  progress: number;
  type?: string;
  created_at?: string;
}

interface Delegation {
  id: string;
  from_agent: string;
  to_agent: string;
  task: string;
  status: string;
  created_at?: string;
}

interface ConsensusProposal {
  id: string;
  title: string;
  proposer: string;
  votes_for: number;
  votes_against: number;
  status: string;
  created_at?: string;
}

interface NegotiationPanelProps {
  className?: string;
}

const NegotiationPanelComponent: React.FC<NegotiationPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const [activeTab, setActiveTab] = useState<'negotiations' | 'delegations' | 'consensus' | 'contracts'>('negotiations');
  const [teams, setTeams] = useState<teamsApi.AgentTeam[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [proposals, setProposals] = useState<ConsensusProposal[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [auctionTask, setAuctionTask] = useState('');
  const [showDelegateForm, setShowDelegateForm] = useState(false);
  const [delegateTask, setDelegateTask] = useState('');
  const [delegateTarget, setDelegateTarget] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [negSearchTerm, setNegSearchTerm] = useState('');
  const [negStatusFilter, setNegStatusFilter] = useState<string>('all');

  const fetchTeams = useCallback(async () => {
    try {
      const data = await teamsApi.listTeams();
      setTeams(data);
    } catch (err: any) {
      console.error('Failed to load teams:', err);
    }
  }, []);

  const fetchNegotiations = useCallback(async () => {
    if (!selectedAgent?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [negRes, contractsRes] = await Promise.allSettled([
        fastapiClient.get(`/api/v1/negotiations/${selectedAgent.id}`),
        fastapiClient.get(`/api/v1/negotiations/${selectedAgent.id}/contracts`)
      ]);
      if (negRes.status === 'fulfilled') {
        setNegotiations((negRes.value.data || []).map((n: any) => ({
          id: n.id,
          agents: [n.initiator_agent_id, ...(Array.isArray(n.target_agent_ids) ? n.target_agent_ids : [])].filter(Boolean),
          topic: n.description || n.type || 'Negotiation',
          status: n.status || 'pending',
          progress: n.status === 'completed' ? 100 : n.status === 'active' ? 50 : 0,
          type: n.type,
          created_at: n.created_at,
        })));
      }
      if (contractsRes.status === 'fulfilled') {
        setContracts(contractsRes.value.data || []);
      }
    } catch { setNegotiations([]); }
    finally { setIsLoading(false); }
  }, [selectedAgent?.id]);

  // Fetch delegations
  const fetchDelegations = useCallback(async () => {
    if (!selectedAgent?.id) return;
    try {
      // Try to get delegations from execution router
      const res = await fastapiClient.get(`/api/v1/agents/${selectedAgent.id}/collective-knowledge`);
      // Parse delegation data if available
      if (res.data?.delegations) {
        setDelegations(res.data.delegations);
      }
    } catch { /* Delegations endpoint may not exist yet */ }
  }, [selectedAgent?.id]);

  // Fetch consensus proposals
  const fetchProposals = useCallback(async () => {
    try {
      // Consensus proposals are team-wide
      const teamIds = teams.map(t => t.id);
      const allProposals: ConsensusProposal[] = [];
      for (const teamId of teamIds.slice(0, 3)) {
        try {
          const wfRes = await fastapiClient.get(`/api/v1/agents/teams/${teamId}/workflows`);
          const workflows = wfRes.data || [];
          workflows.forEach((wf: any) => {
            if (wf.status === 'pending_review' || wf.trigger_type === 'consensus') {
              allProposals.push({
                id: wf.id,
                title: wf.name || 'Workflow Proposal',
                proposer: wf.created_by || 'system',
                votes_for: 0,
                votes_against: 0,
                status: wf.status || 'pending',
                created_at: wf.created_at,
              });
            }
          });
        } catch { /* skip team */ }
      }
      setProposals(allProposals);
    } catch { /* silent */ }
  }, [teams]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);
  useEffect(() => { fetchNegotiations(); fetchDelegations(); }, [fetchNegotiations, fetchDelegations]);
  useEffect(() => { if (teams.length > 0) fetchProposals(); }, [teams, fetchProposals]);

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || id.slice(0, 8);

  // Create a task auction
  const handleCreateAuction = async () => {
    if (!selectedAgent?.id || !auctionTask.trim()) return;
    setIsLoading(true);
    try {
      await fastapiClient.post(`/api/v1/negotiations/${selectedAgent.id}/auction`, {
        task_description: auctionTask,
        required_capabilities: [],
      });
      setShowAuctionForm(false);
      setAuctionTask('');
      setSuccessMsg('Auction created successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchNegotiations();
    } catch (err: any) {
      setError(err.message || 'Failed to create auction');
    } finally { setIsLoading(false); }
  };

  // Delegate a task
  const handleDelegate = async () => {
    if (!selectedAgent?.id || !delegateTask.trim() || !delegateTarget) return;
    setIsLoading(true);
    try {
      await fastapiClient.post(`/api/v1/executions/agents/${selectedAgent.id}/delegate`, {
        task_description: delegateTask,
        target_agent_id: delegateTarget,
      });
      setShowDelegateForm(false);
      setDelegateTask('');
      setDelegateTarget('');
      setSuccessMsg('Task delegated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delegate task');
    } finally { setIsLoading(false); }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Fork /> Agent Negotiation</h2>
        <div className={styles.tabs}>
          {(['negotiations', 'delegations', 'consensus', 'contracts'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {!selectedAgent && activeTab !== 'consensus' && (
          <div className={styles.notice}>Select an agent to view negotiations</div>
        )}

        {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
        {error && <div className={styles.errorBanner}>{error}</div>}

        {/* Negotiations Tab */}
        {activeTab === 'negotiations' && selectedAgent && (
          <>
            <div className={styles.actionBar}>
              <button className={styles.actionBtn} onClick={() => setShowAuctionForm(!showAuctionForm)}>
                + Create Auction
              </button>
            </div>

            {showAuctionForm && (
              <div className={styles.formCard}>
                <h4>Create Task Auction</h4>
                <textarea
                  value={auctionTask}
                  onChange={e => setAuctionTask(e.target.value)}
                  placeholder="Describe the task to auction..."
                  className={styles.formTextarea}
                />
                <div className={styles.formActions}>
                  <button onClick={handleCreateAuction} className={styles.submitBtn} disabled={isLoading}>Create</button>
                  <button onClick={() => setShowAuctionForm(false)} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.negotiationsList}>
              {isLoading && <div className={styles.loading}>Loading...</div>}
              {negotiations.length === 0 && !isLoading && (
                <div className={styles.emptyState}>No active negotiations. Create an auction to start.</div>
              )}
              {negotiations.filter(n => { if (negSearchTerm && !n.topic.toLowerCase().includes(negSearchTerm.toLowerCase())) return false; if (negStatusFilter !== 'all' && n.status !== negStatusFilter) return false; return true; }).map(neg => (
                <div key={neg.id} className={styles.negotiationCard}>
                  <div className={styles.negHeader}>
                    <span className={styles.topic}>{neg.topic}</span>
                    <span className={`${styles.status} ${styles[neg.status]}`}>{neg.status}</span>
                  </div>
                  <div className={styles.agents}>
                    {neg.agents.map(id => getAgentName(id)).join(' ↔ ')}
                  </div>
                  {neg.type && <div className={styles.negType}>Type: {neg.type}</div>}
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${neg.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delegations Tab */}
        {activeTab === 'delegations' && selectedAgent && (
          <>
            <div className={styles.actionBar}>
              <button className={styles.actionBtn} onClick={() => setShowDelegateForm(!showDelegateForm)}>
                + Delegate Task
              </button>
            </div>

            {showDelegateForm && (
              <div className={styles.formCard}>
                <h4>Delegate Task</h4>
                <select
                  value={delegateTarget}
                  onChange={e => setDelegateTarget(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="">Select target agent</option>
                  {agents.filter(a => a.id !== selectedAgent.id).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <textarea
                  value={delegateTask}
                  onChange={e => setDelegateTask(e.target.value)}
                  placeholder="Describe the task to delegate..."
                  className={styles.formTextarea}
                />
                <div className={styles.formActions}>
                  <button onClick={handleDelegate} className={styles.submitBtn} disabled={isLoading || !delegateTarget}>Delegate</button>
                  <button onClick={() => setShowDelegateForm(false)} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            )}

            <div className={styles.delegationsList}>
              {delegations.length === 0 && !isLoading && (
                <div className={styles.emptyState}>No active delegations. Delegate a task to another agent.</div>
              )}
              {delegations.map(del => (
                <div key={del.id} className={styles.delegationCard}>
                  <div className={styles.delHeader}>
                    <span>{del.task}</span>
                    <span className={`${styles.status} ${styles[del.status]}`}>{del.status}</span>
                  </div>
                  <div className={styles.delMeta}>
                    {getAgentName(del.from_agent)} → {getAgentName(del.to_agent)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Consensus Tab */}
        {activeTab === 'consensus' && (
          <div className={styles.consensusView}>
            <h3>Team Consensus Proposals</h3>
            {teams.length === 0 && (
              <div className={styles.emptyState}>No teams found. Create a team to use consensus.</div>
            )}
            {teams.length > 0 && (
              <>
                <div className={styles.teamsOverview}>
                  {teams.map(team => (
                    <div key={team.id} className={styles.teamCard}>
                      <span className={styles.teamName}>{team.name}</span>
                      <span className={styles.teamStatus}>{team.status}</span>
                      <span className={styles.teamMembers}>{team.member_count || 0} members</span>
                    </div>
                  ))}
                </div>

                {proposals.length > 0 ? (
                  <div className={styles.proposalsList}>
                    {proposals.filter(p => { if (negSearchTerm && !p.title.toLowerCase().includes(negSearchTerm.toLowerCase())) return false; if (negStatusFilter !== 'all' && p.status !== negStatusFilter) return false; return true; }).map(p => (
                      <div key={p.id} className={styles.proposalCard}>
                        <div className={styles.proposalHeader}>
                          <span>{p.title}</span>
                          <span className={`${styles.status} ${styles[p.status]}`}>{p.status}</span>
                        </div>
                        <div className={styles.proposalMeta}>
                          Proposer: {p.proposer}
                        </div>
                        <div className={styles.voteBar}>
                          <span className={styles.voteFor}>For: {p.votes_for}</span>
                          <span className={styles.voteAgainst}>Against: {p.votes_against}</span>
                          {p.status === 'pending' && (
                            <>
                              <button style={{ padding: '2px 8px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', color: '#22c55e', fontSize: '10px', cursor: 'pointer', marginLeft: '8px' }}
                                onClick={() => setProposals(prev => prev.map(pr => pr.id === p.id ? { ...pr, votes_for: pr.votes_for + 1 } : pr))}>
                                Vote For
                              </button>
                              <button style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', color: '#ef4444', fontSize: '10px', cursor: 'pointer' }}
                                onClick={() => setProposals(prev => prev.map(pr => pr.id === p.id ? { ...pr, votes_against: pr.votes_against + 1 } : pr))}>
                                Vote Against
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>No pending proposals</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className={styles.contractsList}>
            {contracts.length === 0 && !isLoading && (
              <div className={styles.emptyState}>No contracts yet</div>
            )}
            {contracts.map((contract: any) => (
              <div key={contract.id} className={styles.contractCard}>
                <div className={styles.contractHeader}>
                  <span>{contract.task_description || 'Contract'}</span>
                  <span className={styles.contractStatus}>{contract.status}</span>
                </div>
                <div className={styles.contractMeta}>
                  Value: {contract.agreed_value || 0} credits
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const NegotiationPanel = memo(NegotiationPanelComponent);
export default NegotiationPanel;
