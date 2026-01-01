import fastapiClient from './fastapiClient';

export interface EvidenceNode {
  id: string;
  label: string;
  type: 'input' | 'token' | 'anchor' | 'policy';
}

export interface EvidenceEdge {
  source: string;
  target: string;
  relation: string;
}

export const fetchEvidenceGraph = async (predictionId: string) => {
  const res = await fastapiClient.get(`/predictions/evidence/${predictionId}`);
  return res.data as { nodes: EvidenceNode[]; edges: EvidenceEdge[] };
};
