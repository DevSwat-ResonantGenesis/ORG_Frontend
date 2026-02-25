import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as governanceApi from '../../../../../api/governance';
import styles from './GovernancePanel.module.css';

// ============== GOVERNANCE PANEL ==============
// Contract: reads [agent, session], writes [agent]
// Forbidden: [economy]

interface GovernancePanelProps {
  className?: string;
}

const GovernancePanelComponent: React.FC<GovernancePanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [activeTab, setActiveTab] = useState<'policies' | 'approvals' | 'limits'>('policies');
  const [policies, setPolicies] = useState<governanceApi.GovernancePolicy[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<governanceApi.PendingApproval[]>([]);
  const [resourceLimits, setResourceLimits] = useState<governanceApi.ResourceLimit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<governanceApi.GovernancePolicy | null>(null);

  // Fetch policies
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

  // Fetch pending approvals
  const fetchApprovals = useCallback(async () => {
    try {
      const data = await governanceApi.listPendingApprovals();
      setPendingApprovals(data);
    } catch (err: any) {
      console.error('Failed to load approvals:', err);
    }
  }, []);

  // Fetch resource limits
  const fetchLimits = useCallback(async () => {
    try {
      const data = await governanceApi.getResourceLimits();
      setResourceLimits(data);
    } catch (err: any) {
      console.error('Failed to load limits:', err);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'policies') {
      fetchPolicies();
    } else if (activeTab === 'approvals') {
      fetchApprovals();
    } else if (activeTab === 'limits') {
      fetchLimits();
    }
  }, [activeTab, fetchPolicies, fetchApprovals, fetchLimits]);

  // Handle approve action
  const handleApprove = async (approvalId: string) => {
    const success = await governanceApi.approveAction(approvalId);
    if (success) {
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
    }
  };

  // Handle reject action
  const handleReject = async (approvalId: string) => {
    const success = await governanceApi.rejectAction(approvalId);
    if (success) {
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
    }
  };

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
              <button className={styles.createBtn} onClick={() => alert("Policy creation requires backend endpoint. Coming soon.")}>
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
                        <button className={styles.editBtn} onClick={() => alert("Policy editing requires backend endpoint. Coming soon.")}><Icons.Edit /> Edit</button>
                        {policy.status === 'active' ? (
                          <button className={styles.disableBtn} onClick={() => { governanceApi.updatePolicy(policy.id, { status: "inactive" }).then(() => fetchPolicies()); }}><Icons.Pause /> Disable</button>
                        ) : (
                          <button className={styles.enableBtn} onClick={() => { governanceApi.updatePolicy(policy.id, { status: "active" }).then(() => fetchPolicies()); }}><Icons.Play /> Enable</button>
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
                        {Math.round((Date.now() - new Date(approval.requestedAt).getTime()) / 60000)}m ago
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
                      <button className={styles.approveBtn} onClick={() => handleApprove(approval.id)}>
                        <Icons.Check /> Approve
                      </button>
                      <button className={styles.rejectBtn} onClick={() => handleReject(approval.id)}>
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
              {resourceLimits.map(limit => {
                const percentage = limit.limit > 0 ? (limit.used / limit.limit) * 100 : 0;
                const formatValue = (val: number, unit: string) => {
                  if (unit === '$') return `$${val.toFixed(2)}`;
                  if (val >= 1000) return val.toLocaleString();
                  return val.toString();
                };
                return (
                  <div key={limit.id} className={styles.limitCard}>
                    <h4>{limit.name}</h4>
                    <div className={styles.limitValue}>
                      {limit.unit === '$' ? `$${limit.limit.toFixed(2)}` : limit.limit.toLocaleString()}
                    </div>
                    <div className={styles.limitProgress}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span>
                        {formatValue(limit.used, limit.unit)} / {formatValue(limit.limit, limit.unit)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GovernancePanel = memo(GovernancePanelComponent);
export default GovernancePanel;
