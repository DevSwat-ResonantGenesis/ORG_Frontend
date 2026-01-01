import fastapiClient from './fastapiClient';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  status?: string;
  created_at?: string;
  crypto_hash?: string;
  user_hash?: string;
}

export interface UserCreatePayload {
  email: string;
  full_name: string;
  password: string;
  role?: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fastapiClient.get('/users');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const fetchUserById = async (id: string): Promise<User> => {
  const res = await fastapiClient.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (payload: UserCreatePayload): Promise<User> => {
  const res = await fastapiClient.post('/users', payload);
  return res.data;
};

export const updateUser = async (id: string, payload: Partial<User>): Promise<User> => {
  const res = await fastapiClient.put(`/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await fastapiClient.delete(`/users/${id}`);
};

export const assignUserRole = async (id: string, role: string): Promise<void> => {
  await fastapiClient.post(`/users/${id}/assign-role`, { role });
};

export const suspendUser = async (id: string): Promise<void> => {
  await fastapiClient.post(`/users/${id}/suspend`);
};

export const reactivateUser = async (id: string): Promise<void> => {
  await fastapiClient.post(`/users/${id}/reactivate`);
};

export const revealSeed = async (password: string): Promise<{ mnemonic: string }> => {
  const res = await fastapiClient.post('/users/reveal-seed', { password });
  return res.data;
};

