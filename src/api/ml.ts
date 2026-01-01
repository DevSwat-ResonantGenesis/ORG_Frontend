import fastapiClient from './fastapiClient';

export interface TrainingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  dataset_hash?: string;
  model_version?: string;
  started_at?: string;
  completed_at?: string;
  metrics?: Record<string, any>;
  created_at?: string;
}

export interface ModelVersion {
  id: string;
  version: string;
  created_at: string;
  is_active: boolean;
  accuracy?: number;
  metrics?: Record<string, any>;
  training_job_id?: string;
}

export interface WorkerMetrics {
  queue_length: number;
  memory_usage_mb?: number;
  last_heartbeat?: string;
  current_job?: string;
  status: 'healthy' | 'unhealthy';
}

export const fetchTrainingJobs = async (): Promise<TrainingJob[]> => {
  const res = await fastapiClient.get('/ml/training-jobs');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const fetchTrainingJobById = async (id: string): Promise<TrainingJob> => {
  const res = await fastapiClient.get(`/ml/training-jobs/${id}`);
  return res.data;
};

export const createTrainingJob = async (payload: {
  dataset_hash?: string;
  config?: Record<string, any>;
}) => {
  const res = await fastapiClient.post('/ml/training-jobs', payload);
  return res.data;
};

export const stopTrainingJob = async (id: string) => {
  const res = await fastapiClient.post(`/ml/training-jobs/${id}/stop`);
  return res.data;
};

export const fetchModelVersions = async (): Promise<ModelVersion[]> => {
  const res = await fastapiClient.get('/ml/model-versions');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const promoteModelVersion = async (versionId: string) => {
  const res = await fastapiClient.post(`/ml/model-versions/${versionId}/promote`);
  return res.data;
};

export const rollbackModelVersion = async (versionId: string) => {
  const res = await fastapiClient.post(`/ml/model-versions/${versionId}/rollback`);
  return res.data;
};

export const fetchWorkerMetrics = async (): Promise<WorkerMetrics> => {
  const res = await fastapiClient.get('/ml/worker/metrics');
  return res.data?.metrics || res.data || {};
};

export const fetchWorkerLogs = async (): Promise<string[]> => {
  const res = await fastapiClient.get('/ml/worker/logs');
  return res.data?.logs || [];
};

export interface ModelEvaluation {
  id: string;
  model_version_id: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  created_at: string;
}

export interface DriftDetection {
  id: string;
  model_version_id: string;
  drift_score: number;
  drift_detected: boolean;
  feature_drift?: Record<string, number>;
  created_at: string;
}

export const fetchModelEvaluations = async (modelVersionId?: string): Promise<ModelEvaluation[]> => {
  const params = modelVersionId ? { model_version_id: modelVersionId } : {};
  const res = await fastapiClient.get('/ml/evaluations', { params });
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const fetchDriftDetections = async (modelVersionId?: string): Promise<DriftDetection[]> => {
  const params = modelVersionId ? { model_version_id: modelVersionId } : {};
  const res = await fastapiClient.get('/ml/drift-detections', { params });
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const runEvaluation = async (modelVersionId: string): Promise<ModelEvaluation> => {
  const res = await fastapiClient.post('/ml/evaluations', { model_version_id: modelVersionId });
  return res.data;
};

export const runDriftDetection = async (modelVersionId: string): Promise<DriftDetection> => {
  const res = await fastapiClient.post('/ml/drift-detections', { model_version_id: modelVersionId });
  return res.data;
};

