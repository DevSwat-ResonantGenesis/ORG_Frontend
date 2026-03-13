/**
 * Governance API Client
 * Handles governance policies, rules, compliance, approvals, and limits
 */

import fastapiClient from './fastapiClient';

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  policy_type?: string;
  type: 'approval' | 'limit' | 'restriction' | 'automation';
  scope: 'global' | 'agent' | 'workflow';
  rules: string[];
  status: 'active' | 'inactive' | 'draft';
  created_at?: string;
}

export interface PendingApproval {
  id: string;
  agentName: string;
  agentId: string;
  action: string;
  cost: number;
  requestedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ResourceLimit {
  id: string;
  name: string;
  limit: number;
  used: number;
  unit: string;
}

export interface ComplianceCheck {
  policy_id: string;
  status: 'compliant' | 'non_compliant' | 'warning';
  violations: string[];
  checked_at: string;
}

/**
 * List governance policies
 */
export const listPolicies = async (): Promise<GovernancePolicy[]> => {
  try {
    const response = await fastapiClient.get('/api/v1/governance/policies');
    // Transform backend response to frontend format
    const policies = response.data?.policies || [];
    return policies.map((p: any) => ({
      id: p.policy_id || p.id,
      name: p.name,
      description: p.description || '',
      type: p.type || 'approval',
      scope: p.scope || 'global',
      rules: p.constraints || p.rules || [],
      status: p.status || 'active',
      created_at: p.created_at,
    }));
  } catch (error: any) {
    console.error('Failed to list policies:', error);
    return [];
  }
};

/**
 * Create a new policy
 */
export const createPolicy = async (policy: Partial<GovernancePolicy>): Promise<GovernancePolicy | null> => {
  try {
    const response = await fastapiClient.post('/api/v1/governance/policies', {
      name: policy.name,
      description: policy.description,
      source: 'user',
      constraints: policy.rules || [],
      applies_to: policy.scope || 'global',
      priority: 1,
    });
    return response.data?.policy || null;
  } catch (error: any) {
    console.error('Failed to create policy:', error);
    throw error;
  }
};

/**
 * Get pending approvals
 */
export const listPendingApprovals = async (): Promise<PendingApproval[]> => {
  try {
    const response = await fastapiClient.get('/api/v1/agents/approvals/pending');
    return (response.data?.approvals || []).map((a: any) => ({
      id: a.id,
      agentName: a.agent_name || a.agentName,
      agentId: a.agent_id || a.agentId,
      action: a.action,
      cost: a.cost || 0,
      requestedAt: new Date(a.requested_at || a.requestedAt),
      reason: a.reason,
      status: a.status || 'pending',
    }));
  } catch (error: any) {
    console.error('Failed to list pending approvals:', error);
    return [];
  }
};

/**
 * Approve an action
 */
export const approveAction = async (approvalId: string): Promise<boolean> => {
  try {
    await fastapiClient.post(`/api/v1/agents/approvals/${approvalId}/approve`);
    return true;
  } catch (error: any) {
    console.error('Failed to approve action:', error);
    return false;
  }
};

/**
 * Reject an action
 */
export const rejectAction = async (approvalId: string, reason?: string): Promise<boolean> => {
  try {
    await fastapiClient.post(`/api/v1/agents/approvals/${approvalId}/reject`, { reason });
    return true;
  } catch (error: any) {
    console.error('Failed to reject action:', error);
    return false;
  }
};

/**
 * Get resource limits
 */
export const getResourceLimits = async (): Promise<ResourceLimit[]> => {
  try {
    const response = await fastapiClient.get('/api/v1/agents/limits');
    return response.data?.limits || [];
  } catch (error: any) {
    console.error('Failed to get resource limits:', error);
    // Return default limits if API fails
    return [
      { id: 'daily_spend', name: 'Daily Spend Limit', limit: 100, used: 0, unit: '$' },
      { id: 'hourly_tokens', name: 'Token Limit (Hourly)', limit: 50000, used: 0, unit: 'tokens' },
      { id: 'concurrent_exec', name: 'Concurrent Executions', limit: 10, used: 0, unit: 'executions' },
      { id: 'daily_api', name: 'API Calls (Daily)', limit: 10000, used: 0, unit: 'calls' },
    ];
  }
};

/**
 * Update a resource limit
 */
export const updateResourceLimit = async (limitId: string, newLimit: number): Promise<boolean> => {
  try {
    await fastapiClient.put(`/api/v1/agents/limits/${limitId}`, { limit: newLimit });
    return true;
  } catch (error: any) {
    console.error('Failed to update resource limit:', error);
    return false;
  }
};

/**
 * Check compliance
 */
export const checkCompliance = async (entityId: string): Promise<ComplianceCheck[]> => {
  try {
    const response = await fastapiClient.post('/api/v1/governance/policies', {
      entity_id: entityId,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to check compliance:', error);
    return [];
  }
};

// ============== SOC2/ISO Compliance (P4.1) ==============

export interface ComplianceScoreResult {
  compliance_score: number;
  max_score: number;
  grade: string;
  framework: string;
  checks: { control: string; status: string; detail: string; weight: number }[];
}

export interface EvidenceItem {
  criteria: string;
  artifact: string;
  endpoint: string;
  available: boolean;
}

export interface AuditExportRecord {
  session_id: string;
  agent_name: string;
  agent_id: string;
  goal: string;
  status: string;
  loop_count: number;
  tokens_used: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Get SOC2 compliance score
 */
export const getComplianceScore = async (): Promise<ComplianceScoreResult | null> => {
  try {
    const response = await fastapiClient.get('/api/v1/agents/compliance/score');
    return response.data;
  } catch (error: any) {
    console.error('Failed to get compliance score:', error);
    return null;
  }
};

/**
 * Get evidence checklist for SOC2/ISO compliance
 */
export const getEvidenceChecklist = async (): Promise<{ framework: string; evidence: EvidenceItem[]; generated_at: string } | null> => {
  try {
    const response = await fastapiClient.get('/api/v1/agents/compliance/evidence-checklist');
    return response.data;
  } catch (error: any) {
    console.error('Failed to get evidence checklist:', error);
    return null;
  }
};

/**
 * Export audit trail in JSON or CSV format
 */
export const getAuditExport = async (format: 'json' | 'csv' = 'json', startDate?: string, endDate?: string, agentId?: string) => {
  try {
    const params = new URLSearchParams({ format });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    if (agentId) params.set('agent_id', agentId);
    const response = await fastapiClient.get(`/api/v1/agents/compliance/audit-export?${params}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to export audit trail:', error);
    return null;
  }
};

/**
 * Get governance audit trail
 */
export const getGovernanceAuditTrail = async (agentId?: string, limit: number = 100) => {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agentId) params.set('agent_id', agentId);
    const response = await fastapiClient.get(`/api/v1/agents/governance/audit-trail?${params}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get governance audit trail:', error);
    return null;
  }
};

/**
 * Get governance compliance report
 */
export const getGovernanceComplianceReport = async (startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    const response = await fastapiClient.get(`/api/v1/agents/governance/compliance-report${qs ? '?' + qs : ''}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get governance compliance report:', error);
    return null;
  }
};
