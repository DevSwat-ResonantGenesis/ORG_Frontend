/**
 * Audit API Client
 * Handles audit trail and compliance logging
 */

import fastapiClient from './fastapiClient';

export interface AuditEntry {
  id?: string;
  entry_hash: string;
  sequence_number: number;
  event_type: string;
  event_category: string;
  action: string;
  actor_dsid?: string;
  actor_id?: string;
  actor_type?: string;
  user?: string;
  target_type?: string;
  target_id?: string;
  success: boolean;
  timestamp: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}

// Alias for backwards compatibility
export type AuditLog = AuditEntry;

export interface AuditStats {
  total_entries: number;
  categories: Record<string, number>;
  success_rate: number;
  recent_activity: number;
}

/**
 * Fetch audit logs with pagination
 */
export const fetchAuditLogs = async ({
  page = 1,
  limit = 50,
  category,
  actor,
}: {
  page?: number;
  limit?: number;
  category?: string;
  actor?: string;
} = {}) => {
  try {
    const response = await fastapiClient.get('/blockchain/ai-audit/logs', {
      params: { page, limit, category, actor },
    });
    return response.data as { items: AuditEntry[]; total: number; page: number; limit: number };
  } catch (error: any) {
    console.error('Failed to fetch audit logs:', error);
    return { items: [], total: 0, page: 1, limit: 50 };
  }
};

/**
 * Get audit entry by hash
 */
export const getAuditEntry = async (entryHash: string): Promise<AuditEntry | null> => {
  try {
    const response = await fastapiClient.get(`/blockchain/audit/${entryHash}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to get audit entry:', error);
    return null;
  }
};

/**
 * Get audit logs by actor
 */
export const getAuditByActor = async (actorDsid: string, limit: number = 100): Promise<AuditEntry[]> => {
  try {
    const response = await fastapiClient.get(`/blockchain/audit/actor/${actorDsid}`, {
      params: { limit },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get audit by actor:', error);
    return [];
  }
};

/**
 * Get audit logs by category
 */
export const getAuditByCategory = async (category: string, limit: number = 100): Promise<AuditEntry[]> => {
  try {
    const response = await fastapiClient.get(`/blockchain/audit/category/${category}`, {
      params: { limit },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to get audit by category:', error);
    return [];
  }
};

/**
 * Get audit statistics
 */
export const getAuditStats = async (): Promise<AuditStats> => {
  try {
    const response = await fastapiClient.get('/blockchain/audit/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to get audit stats:', error);
    return {
      total_entries: 0,
      categories: {},
      success_rate: 0,
      recent_activity: 0,
    };
  }
};

/**
 * Verify audit chain integrity
 */
export const verifyAuditChain = async (
  fromSequence: number = 0,
  toSequence?: number
): Promise<{ valid: boolean; message: string }> => {
  try {
    const response = await fastapiClient.post('/blockchain/audit/verify', null, {
      params: { from_sequence: fromSequence, to_sequence: toSequence },
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to verify audit chain:', error);
    return { valid: false, message: 'Verification failed' };
  }
};

/**
 * Format event category for display
 */
export const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    agent: 'Agent',
    workflow: 'Workflow',
    execution: 'Execution',
    auth: 'Authentication',
    billing: 'Billing',
    system: 'System',
    security: 'Security',
  };
  return categoryMap[category] || category;
};

/**
 * Get category color for UI
 */
export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    agent: '#3b82f6',
    workflow: '#a855f7',
    execution: '#14b8a6',
    auth: '#f59e0b',
    billing: '#ec4899',
    system: '#6b7280',
    security: '#ef4444',
  };
  return colorMap[category] || '#6b7280';
};

/**
 * Format timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};
