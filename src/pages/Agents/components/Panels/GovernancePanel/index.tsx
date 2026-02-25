import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as governanceApi from '../../../../../api/governance';
import fastapiClient from '../../../../../api/fastapiClient';
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
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyForm, setPolicyForm] = useState({ name: '', description: '', type: 'restriction', scope: 'global', rules: '' });

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

  // Load data based on active tab + auto-refresh approvals
  useEffect(() => {
    if (activeTab === 'policies') {
      fetchPolicies();
    } else if (activeTab === 'approvals') {
      fetchApprovals();
    } else if (activeTab === 'limits') {
      fetchLimits();
    }
    if (activeTab === 'approvals') {
      const interval = setInterval(fetchApprovals, 15000);
      return () => clearInterval(interval);
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

  const handleExportPolicies = () => {
    const data = JSON.stringify(policies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'governance-policies-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreatePolicy = async () => {
    if (!policyForm.name.trim()) return;
    try {
      await fastapiClient.post('/api/v1/governance/policies', {
        name: policyForm.name,
        description: policyForm.description,
        type: policyForm.type,
        scope: policyForm.scope,
        rules: policyForm.rules.split('\n').filter(Boolean),
        status: 'draft',
      });
      setShowPolicyForm(false);
      setPolicyForm({ name: '', description: '', type: 'restriction', scope: 'global', rules: '' });
      fetchPolicies();
    } catch (err: any) {
      console.error('Failed to create policy:', err);
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
              <button className={styles.exportBtn} onClick={handleExportPolicies} style={{ marginLeft: 'auto', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icons.Download /> Export
              </button>
              <button className={styles.createBtn} onClick={() => setShowPolicyForm(!showPolicyForm)}>
                <Icons.Plus /> New Policy
              </button>
            </div>
            {showPolicyForm && (
              <div className={styles.policyForm}>
                <input type="text" placeholder="Policy Name" value={policyForm.name}
                  onChange={e => setPolicyForm(p => ({ ...p, name: e.target.value }))}
                  className={styles.formInput} />
                <input type="text" placeholder="Description" value={policyForm.description}
                  onChange={e => setPolicyForm(p => ({ ...p, description: e.target.value }))}
                  className={styles.formInput} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={policyForm.type} onChange={e => setPolicyForm(p => ({ ...p, type: e.target.value }))}
                    className={styles.formSelect}>
                    <option value="restriction">Restriction</option>
                    <option value="approval">Approval</option>
                    <option value="limit">Limit</option>
                    <option value="automation">Automation</option>
                  </select>
                  <select value={policyForm.scope} onChange={e => setPolicyForm(p => ({ ...p, scope: e.target.value }))}
                    className={styles.formSelect}>
                    <option value="global">Global</option>
                    <option value="agent">Agent</option>
                    <option value="workflow">Workflow</option>
                  </select>
                </div>
                <textarea placeholder="Rules (one per line)" value={policyForm.rules}
                  onChange={e => setPolicyForm(p => ({ ...p, rules: e.target.value }))}
                  className={styles.formTextarea} rows={3} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className={styles.createBtn} onClick={handleCreatePolicy}>Create Policy</button>
                  <button className={styles.cancelFormBtn} onClick={() => setShowPolicyForm(false)}>Cancel</button>
                </div>
              </div>
            )}

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
                        <button className={styles.editBtn} onClick={async () => {
                          const newName = prompt('Edit policy name:', policy.name);
                          if (newName && newName !== policy.name) {
                            try {
                              await fastapiClient.put('/api/v1/governance/policies/' + policy.id, { name: newName });
                              fetchPolicies();
                            } catch (err) { console.error('Failed to update policy:', err); }
                          }
                        }}><Icons.Edit /> Edit</button>
                        {policy.status === 'active' ? (
                          <button className={styles.disableBtn} onClick={() => { fastapiClient.put('/api/v1/governance/policies/' + policy.id, { status: 'inactive' }).then(() => fetchPolicies()).catch(() => {}); }}><Icons.Pause /> Disable</button>
                        ) : (
                          <button className={styles.enableBtn} onClick={() => { fastapiClient.put('/api/v1/governance/policies/' + policy.id, { status: 'active' }).then(() => fetchPolicies()).catch(() => {}); }}><Icons.Play /> Enable</button>
                        )}
                        <button className={styles.disableBtn} onClick={async () => {
                          if (!confirm('Delete policy "' + policy.name + '"?')) return;
                          try {
                            await fastapiClient.delete('/api/v1/governance/policies/' + policy.id);
                            fetchPolicies();
                          } catch (err) { console.error('Failed to delete policy:', err); }
                        }}><Icons.Trash /> Delete</button>
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
