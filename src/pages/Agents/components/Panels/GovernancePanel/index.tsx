import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as governanceApi from '../../../../../api/governance';
import styles from './GovernancePanel.module.css';

// ============== GOVERNANCE PANEL ==============
// Contract: reads [agent, session], writes [agent]
// Forbidden: [economy]

interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'approval' | 'limit' | 'restriction' | 'automation';
  status: 'active' | 'inactive' | 'draft';
  scope: 'global' | 'agent' | 'workflow';
  rules: string[];
}

interface GovernancePanelProps {
  className?: string;
}

const GovernancePanelComponent: React.FC<GovernancePanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [activeTab, setActiveTab] = useState<'policies' | 'approvals' | 'limits'>('policies');
  const [policies, setPolicies] = useState<governanceApi.GovernancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await governanceApi.listPolicies();
      setPolicies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);

  const pendingApprovals = [
    { id: 'ap1', agentName: 'Research-01', action: 'Execute workflow', cost: 15.50, requestedAt: new Date(Date.now() - 300000), reason: 'Cost exceeds $10 threshold' },
    { id: 'ap2', agentName: 'Data-Analyzer', action: 'External API call', cost: 0, requestedAt: new Date(Date.now() - 600000), reason: 'Domain not in whitelist' },
    { id: 'ap3', agentName: 'Code-Generator', action: 'Code execution', cost: 2.30, requestedAt: new Date(Date.now() - 900000), reason: 'Requires elevated permissions' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return styles.active;
      case 'inactive': return styles.inactive;
      case 'draft': return styles.draft;
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval': return <Icons.CheckCircle />;
      case 'limit': return <Icons.DollarSign />;
      case 'restriction': return <Icons.Lock />;
      case 'automation': return <Icons.Zap />;
      default: return <Icons.Settings />;
    }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Governance /> Governance</h2>
        <div className={styles.tabs}>
          {(['policies', 'approvals', 'limits'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'approvals' && pendingApprovals.length > 0 && (
                <span className={styles.badge}>{pendingApprovals.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className={styles.policiesSection}>
            <div className={styles.sectionHeader}>
              <h3>Governance Policies</h3>
              <button className={styles.createBtn}>
                <Icons.Plus /> New Policy
              </button>
            </div>
            <div className={styles.policiesList}>
              {Array.isArray(policies) && policies.map((policy) => (
                <div 
                  key={policy.id}
                  className={`${styles.policyCard} ${selectedPolicy?.id === policy.id ? styles.selected : ''}`}
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <div className={styles.policyHeader}>
                    <span className={styles.policyIcon}>{getTypeIcon(policy.type)}</span>
                    <div className={styles.policyInfo}>
                      <span className={styles.policyName}>{policy.name}</span>
                      <span className={styles.policyDesc}>{policy.description}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusColor(policy.status)}`}>
                      {policy.status}
                    </span>
                  </div>
                  <div className={styles.policyMeta}>
                    <span className={styles.scopeBadge}>{policy.scope}</span>
                    <span className={styles.rulesCount}>{policy.rules.length} rules</span>
                  </div>
                  {selectedPolicy?.id === policy.id && (
                    <div className={styles.policyDetails}>
                      <h4>Rules</h4>
                      <ul>
                        {policy.rules.map((rule, i) => (
                          <li key={i}>{rule}</li>
                        ))}
                      </ul>
                      <div className={styles.policyActions}>
                        <button className={styles.editBtn}><Icons.Edit /> Edit</button>
                        {policy.status === 'active' ? (
                          <button className={styles.disableBtn}><Icons.Pause /> Disable</button>
                        ) : (
                          <button className={styles.enableBtn}><Icons.Play /> Enable</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className={styles.approvalsSection}>
            <h3>Pending Approvals</h3>
            {pendingApprovals.length > 0 ? (
              <div className={styles.approvalsList}>
                {pendingApprovals.map(approval => (
                  <div key={approval.id} className={styles.approvalCard}>
                    <div className={styles.approvalHeader}>
                      <span className={styles.agentName}>{approval.agentName}</span>
                      <span className={styles.approvalTime}>
                        {Math.round((Date.now() - approval.requestedAt.getTime()) / 60000)}m ago
                      </span>
                    </div>
                    <div className={styles.approvalAction}>{approval.action}</div>
                    <div className={styles.approvalReason}>{approval.reason}</div>
                    {approval.cost > 0 && (
                      <div className={styles.approvalCost}>
                        Estimated cost: <strong>${approval.cost.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className={styles.approvalActions}>
                      <button className={styles.approveBtn}>
                        <Icons.Check /> Approve
                      </button>
                      <button className={styles.rejectBtn}>
                        <Icons.XCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Icons.CheckCircle />
                <p>No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div className={styles.limitsSection}>
            <h3>Resource Limits</h3>
            <div className={styles.limitsGrid}>
              <div className={styles.limitCard}>
                <h4>Daily Spend Limit</h4>
                <div className={styles.limitValue}>$100.00</div>
                <div className={styles.limitProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '45%' }}></div>
                  </div>
                  <span>$45.00 / $100.00</span>
                </div>
              </div>
              <div className={styles.limitCard}>
                <h4>Token Limit (Hourly)</h4>
                <div className={styles.limitValue}>50,000</div>
                <div className={styles.limitProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '32%' }}></div>
                  </div>
                  <span>16,000 / 50,000</span>
                </div>
              </div>
              <div className={styles.limitCard}>
                <h4>Concurrent Executions</h4>
                <div className={styles.limitValue}>10</div>
                <div className={styles.limitProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '30%' }}></div>
                  </div>
                  <span>3 / 10</span>
                </div>
              </div>
              <div className={styles.limitCard}>
                <h4>API Calls (Daily)</h4>
                <div className={styles.limitValue}>10,000</div>
                <div className={styles.limitProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '67%' }}></div>
                  </div>
                  <span>6,700 / 10,000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GovernancePanel = memo(GovernancePanelComponent);
export default GovernancePanel;
