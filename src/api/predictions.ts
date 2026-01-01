import fastapiClient from './fastapiClient';

export interface Prediction {
  id: string;
  external_id?: string | null;
  input_text?: string;
  input_excerpt?: string;
  timestamp?: string;
  created_at?: string;
  validity: number;
  anchor_probability?: number;
  anchor_prob?: number;
  resonance_score?: number;
  xyz?: [number, number, number];
  cluster?: number;
  entropy: number;
  anchors?: string[];
  policies?: string[];
  policies_triggered?: string[];
  status?: string;
}

export const fetchPredictions = async (): Promise<Prediction[]> => {
  // Use ML service compatibility endpoint via gateway
  const res = await fastapiClient.get('/ml/predictions');
  const payload = res.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }
  return [];
};

export const fetchPredictionById = async (id: string): Promise<Prediction> => {
  const res = await fastapiClient.get(`/ml/predictions/${id}`);
  return res.data;
};

export const runPrediction = async (text: string) => {
  const res = await fastapiClient.post('/predict', { text });
  return res.data;
};

export const createPrediction = async (inputText: string, context?: Record<string, any>) => {
  // For now, createPrediction is not backed by a dedicated ML endpoint.
  // Keep using the existing fastapiClient behavior targeting the gateway root
  // and let the backend route /predict as needed.
  const res = await fastapiClient.post('/predict', {
    text: inputText,
    context: context || null,
  });
  return res.data;
};
