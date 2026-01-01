import fastapiClient from './fastapiClient';

export interface AIAuditLog {
  id: string;
  org_id: string;
  user_id?: string | null;
  prompt: string;
  llm_output: string;
  model_name?: string | null;
  model_version?: string | null;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  safe_to_use: boolean;
  pii_detected: boolean;
  pii_types: string[];
  compliance_flags: string[];
  hallucination_flags: string[];
  bias_flags: string[];
  toxicity_flags: string[];
  evidence_hash: string;
  previous_hash?: string | null;
  created_at: string;
  request_ip?: string | null;
  session_id?: string | null;
}

export interface AIAuditLogCreate {
  prompt: string;
  llm_output: string;
  model_name?: string;
  model_version?: string;
  risk_analysis: Record<string, any>;
  session_id?: string;
  prediction_id?: string;
}

export interface AIAuditLogListResponse {
  items: AIAuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuditStatistics {
  total_logs: number;
  pii_detected: number;
  unsafe_outputs: number;
  compliance_violations: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  model_distribution: Record<string, number>;
  period: {
    start?: string | null;
    end?: string | null;
  };
}

export interface HashChainVerification {
  verified: boolean;
  total_checked: number;
  broken_links: Array<{
    log_id: string;
    expected?: string;
    actual?: string;
    type?: string;
  }>;
  message: string;
}

export interface ComplianceBundle {
  bundle_type: string;
  generated_at: string;
  period: {
    start: string;
    end: string;
  };
  organization_id: string;
  total_logs: number;
  summary: {
    total_operations: number;
    pii_detected_count: number;
    compliance_violations: number;
    unsafe_outputs: number;
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  };
  logs: Array<{
    id: string;
    timestamp: string;
    prompt: string;
    llm_output: string;
    model_name?: string;
    risk_level: string;
    risk_score: number;
    safe_to_use: boolean;
    pii_detected: boolean;
    pii_types: string[];
    compliance_flags: string[];
    evidence_hash: string;
    previous_hash?: string;
  }>;
  hash_chain_verification: HashChainVerification;
}

export const createAIAuditLog = async (data: AIAuditLogCreate): Promise<{ id: string; evidence_hash: string; created_at: string; message: string }> => {
  // Create audit entry via blockchain_service compatibility endpoint
  const res = await fastapiClient.post('/audit/audit', data);
  return res.data;
};

export const fetchAIAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  risk_level?: string;
  safe_to_use?: boolean;
  pii_detected?: boolean;
  model_name?: string;
  search?: string;
}): Promise<AIAuditLogListResponse> => {
  const res = await fastapiClient.get('/audit/ai-audit/logs', { params });
  return res.data;
};

export const fetchAIAuditLogById = async (id: string): Promise<AIAuditLog> => {
  const res = await fastapiClient.get(`/audit/ai-audit/logs/${id}`);
  return res.data;
};

export const fetchAuditStatistics = async (params?: {
  start_date?: string;
  end_date?: string;
}): Promise<AuditStatistics> => {
  const res = await fastapiClient.get('/audit/audit/stats', { params });
  return res.data;
};

export const verifyHashChain = async (limit?: number): Promise<HashChainVerification> => {
  const res = await fastapiClient.get('/audit/audit/verify', { params: { from_sequence: 0, to_sequence: limit } });
  return res.data;
};

export const generateComplianceBundle = async (
  start_date: string,
  end_date: string,
  bundle_type: 'gdpr' | 'hipaa' | 'general' = 'general'
): Promise<ComplianceBundle> => {
  const res = await fastapiClient.get('/audit/compliance/soc2', {
    params: { from_date: start_date, to_date: end_date }
  });
  return res.data;
};

export const exportAuditLogsJSON = async (params?: {
  start_date?: string;
  end_date?: string;
  risk_level?: string;
  safe_to_use?: boolean;
  pii_detected?: boolean;
  model_name?: string;
  search?: string;
}): Promise<Blob> => {
  const res = await fastapiClient.get('/audit/audit/export', {
    params,
    responseType: 'blob'
  });
  return res.data;
};

export const exportAuditLogsCSV = async (params?: {
  start_date?: string;
  end_date?: string;
  risk_level?: string;
  safe_to_use?: boolean;
  pii_detected?: boolean;
  model_name?: string;
  search?: string;
}): Promise<Blob> => {
  const res = await fastapiClient.get('/audit/audit/export', {
    params,
    responseType: 'blob'
  });
  return res.data;
};
