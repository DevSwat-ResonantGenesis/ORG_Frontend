import fastapiClient from './fastapiClient';

export interface Policy {
  id: string;
  name: string;
  rule_type: string;
  threshold: number;
  active: boolean;
  violations: number;
}

export const fetchPolicies = async (): Promise<Policy[]> => {
  const res = await fastapiClient.get('/policies');
  // Backend returns an array directly, not an object with items
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const createPolicy = async (payload: {
  name: string;
  rule_type: string;
  threshold: number;
}) => {
  const res = await fastapiClient.post('/policies', payload);
  return res.data;
};

export const updatePolicy = async (id: string, payload: Partial<Policy>) => {
  const res = await fastapiClient.put(`/policies/${id}`, payload);
  return res.data;
};

export const deletePolicy = async (id: string) => {
  const res = await fastapiClient.delete(`/policies/${id}`);
  return res.data;
};
