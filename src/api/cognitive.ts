/**
 * Cognitive Service API - Text analysis, summarization, classification, and insights
 */

import client from './client';

// Types
export interface AnalysisResult {
  text: string;
  sentiment: {
    label: 'positive' | 'negative' | 'neutral' | 'mixed';
    score: number;
    confidence: number;
  };
  entities: Entity[];
  keywords: string[];
  language: string;
  word_count: number;
}

export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'percent' | 'other';
  start: number;
  end: number;
  confidence: number;
}

export interface SummaryResult {
  original_length: number;
  summary_length: number;
  summary: string;
  key_points: string[];
  compression_ratio: number;
}

export interface ExtractionResult {
  facts: string[];
  entities: Entity[];
  relationships: Relationship[];
  dates: string[];
  numbers: NumberExtract[];
}

export interface Relationship {
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
}

export interface NumberExtract {
  value: number;
  unit?: string;
  context: string;
}

export interface ClassificationResult {
  text: string;
  categories: CategoryScore[];
  primary_category: string;
  confidence: number;
}

export interface CategoryScore {
  category: string;
  score: number;
}

export interface Insight {
  id: string;
  type: 'trend' | 'pattern' | 'anomaly' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Cluster {
  id: string;
  name: string;
  description?: string;
  centroid: number[];
  size: number;
  members: string[];
  keywords: string[];
}

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  data: Record<string, unknown>;
  detected_at: string;
}

export interface Tick {
  id: string;
  timestamp: string;
  value: number;
  metadata?: Record<string, unknown>;
}

// Analysis APIs
export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  const res = await client.post('/cognitive/analyze', { text });
  return res.data;
};

export const summarizeText = async (
  text: string,
  maxLength?: number,
  style?: 'brief' | 'detailed' | 'bullets'
): Promise<SummaryResult> => {
  const res = await client.post('/cognitive/summarize', {
    text,
    max_length: maxLength,
    style,
  });
  return res.data;
};

export const extractInfo = async (text: string): Promise<ExtractionResult> => {
  const res = await client.post('/cognitive/extract', { text });
  return res.data;
};

export const classifyText = async (
  text: string,
  categories?: string[]
): Promise<ClassificationResult> => {
  const res = await client.post('/cognitive/classify', { text, categories });
  return res.data;
};

// Batch Analysis
export const analyzeBatch = async (texts: string[]): Promise<AnalysisResult[]> => {
  const res = await client.post('/cognitive/analyze/batch', { texts });
  return res.data;
};

// Insights APIs
export const getInsights = async (
  type?: string,
  limit?: number
): Promise<Insight[]> => {
  const params: Record<string, unknown> = {};
  if (type) params.type = type;
  if (limit) params.limit = limit;
  const res = await client.get('/cognitive/insights', { params });
  return res.data;
};

export const getInsight = async (insightId: string): Promise<Insight> => {
  const res = await client.get(`/cognitive/insights/${insightId}`);
  return res.data;
};

// Clustering APIs
export const getClusters = async (): Promise<Cluster[]> => {
  const res = await client.get('/cognitive/clusters');
  return res.data;
};

export const getCluster = async (clusterId: string): Promise<Cluster> => {
  const res = await client.get(`/cognitive/clusters/${clusterId}`);
  return res.data;
};

export const createCluster = async (
  name: string,
  texts: string[]
): Promise<Cluster> => {
  const res = await client.post('/cognitive/clusters', { name, texts });
  return res.data;
};

// Anomaly Detection APIs
export const getAnomalies = async (
  severity?: string,
  limit?: number
): Promise<Anomaly[]> => {
  const params: Record<string, unknown> = {};
  if (severity) params.severity = severity;
  if (limit) params.limit = limit;
  const res = await client.get('/cognitive/anomalies', { params });
  return res.data;
};

export const detectAnomalies = async (
  data: number[],
  threshold?: number
): Promise<Anomaly[]> => {
  const res = await client.post('/cognitive/anomalies/detect', { data, threshold });
  return res.data;
};

// Time Series / Ticks APIs
export const getTicks = async (
  startTime?: string,
  endTime?: string,
  limit?: number
): Promise<Tick[]> => {
  const params: Record<string, unknown> = {};
  if (startTime) params.start_time = startTime;
  if (endTime) params.end_time = endTime;
  if (limit) params.limit = limit;
  const res = await client.get('/cognitive/ticks', { params });
  return res.data;
};

export const addTick = async (
  value: number,
  metadata?: Record<string, unknown>
): Promise<Tick> => {
  const res = await client.post('/cognitive/ticks', { value, metadata });
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/cognitive/health');
  return res.data;
};

export default {
  analyzeText,
  summarizeText,
  extractInfo,
  classifyText,
  analyzeBatch,
  getInsights,
  getInsight,
  getClusters,
  getCluster,
  createCluster,
  getAnomalies,
  detectAnomalies,
  getTicks,
  addTick,
  healthCheck,
};
