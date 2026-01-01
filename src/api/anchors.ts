import client from './client';

export interface Anchor {
  id: string;
  word: string;
  category: string;
  created_at: string;
}

export const fetchAnchors = async (): Promise<Anchor[]> => {
  const res = await client.get('/anchors');
  return res.data.items;
};

export const createAnchor = async (payload: { word: string; category: string }) => {
  const res = await client.post('/anchors', payload);
  return res.data;
};

export const deleteAnchor = async (id: string) => {
  const res = await client.delete(`/anchors/${id}`);
  return res.data;
};
