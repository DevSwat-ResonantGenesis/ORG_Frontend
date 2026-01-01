/**
 * Governance API Client
 * Handles governance policies, rules, and compliance
 */

import fastapiClient from './fastapiClient';

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  policy_type: string;
  type?: 'approval' | 'limit' | 'restriction' | 'automation';
  scope?: 'global' | 'agent' | 'workflow';
  rules: any[];
  status: string;
  created_at: string;
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
    const response = await fastapiClient.get('/blockchain/governance/policies');
    return response.data;
  } catch (error: any) {
    console.error('Failed to list policies:', error);
    return [];
  }
};

/**
 * Get policy by ID
 */
export const getPolicy = async (policyId: string): Promise<GovernancePolicy | null> => {
  try {
    const response = await fastapiClient.get(`/blockchain/governance/policies/${policyId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get policy:', error);
    return null;
  }
};

/**
 * Check compliance
 */
export const checkCompliance = async (entityId: string): Promise<ComplianceCheck[]> => {
  try {
    const response = await fastapiClient.post('/blockchain/governance/check-compliance', {
      entity_id: entityId,
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to check compliance:', error);
    return [];
  }
};
