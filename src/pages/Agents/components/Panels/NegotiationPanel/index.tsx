import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as teamsApi from '../../../../../api/teams';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './NegotiationPanel.module.css';

// ============== NEGOTIATION PANEL ==============
// Contract: reads [agent, execution], writes [agent]

interface Negotiation {
  id: string;
  agents: string[];
  topic: string;
  status: string;
  progress: number;
  type?: string;
  created_at?: string;
}

interface NegotiationPanelProps {
  className?: string;
}

const NegotiationPanelComponent: React.FC<NegotiationPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'proposals' | 'settings'>('active');
  const [teams, setTeams] = useState<teamsApi.AgentTeam[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamsApi.listTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Fetch negotiations from backend
  const fetchNegotiations = useCallback(async () => {
    if (!selectedAgent?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [negResponse, contractsResponse] = await Promise.allSettled([
        fastapiClient.get(`/agents/negotiations/${selectedAgent.id}`),
        fastapiClient.get(`/agents/negotiations/${selectedAgent.id}/contracts`)
      ]);

      if (negResponse.status === 'fulfilled') {
        const negs = (negResponse.value.data || []).map((n: any) => ({
          id: n.id,
          agents: [n.initiator_id, n.target_id || 'Network'].filter(Boolean),
          topic: n.task_description || n.type || 'Negotiation',
          status: n.status || 'pending',
          progress: n.status === 'completed' ? 100 : n.status === 'active' ? 50 : 0,
          type: n.type,
          created_at: n.created_at
        }));
        setNegotiations(negs);
      }

      if (contractsResponse.status === 'fulfilled') {
        setContracts(contractsResponse.value.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch negotiations:', err);
      setNegotiations([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id]);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Fork /> Agent Negotiation</h2>
        <div className={styles.tabs}>
          {(['active', 'history', 'settings'] as const).map(tab => (
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
        {!selectedAgent && (
          <div className={styles.notice}>Select an agent to view negotiations</div>
        )}

        {isLoading && <div className={styles.loading}>Loading negotiations...</div>}

        {activeTab === 'active' && (
          <div className={styles.negotiationsList}>
            {negotiations.length === 0 && !isLoading && selectedAgent && (
              <div className={styles.emptyState}>No active negotiations</div>
            )}
            {negotiations.map(neg => (
              <div key={neg.id} className={styles.negotiationCard}>
                <div className={styles.negHeader}>
                  <span className={styles.topic}>{neg.topic}</span>
                  <span className={`${styles.status} ${styles[neg.status]}`}>{neg.status}</span>
                </div>
                <div className={styles.agents}>
                  {neg.agents.join(' ↔ ')}
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${neg.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.contractsList}>
            {contracts.length === 0 && !isLoading && (
              <div className={styles.emptyState}>No contract history</div>
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

        {activeTab === 'settings' && (
          <div className={styles.settingsSection}>
            <p>Negotiation settings will be configurable here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const NegotiationPanel = memo(NegotiationPanelComponent);
export default NegotiationPanel;
