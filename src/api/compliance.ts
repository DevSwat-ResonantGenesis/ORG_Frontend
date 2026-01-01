import fastapiClient from './fastapiClient';

export interface ComplianceSummary {
  hipaa_violations: number;
  risky_predictions: number;
  low_validity_count: number;
  anchor_coverage: number;
  active_policies?: number;
  overall_score?: number;
  failed_checks?: number;
  not_evaluated?: number;
}

export const fetchComplianceSummary = async (): Promise<ComplianceSummary> => {
  const res = await fastapiClient.get('/compliance/summary');
  return res.data;
};

export const generateReport = async (period: 'daily' | 'weekly' | 'monthly') => {
  const res = await fastapiClient.post('/compliance/report', { period });
  return res.data;
};
