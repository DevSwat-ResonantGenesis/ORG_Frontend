import fastapiClient from './fastapiClient';

export interface Workspace {
  id: string;
  title: string;
  createdAt: string | null;
  lastActiveAt: string | null;
}

const mapWorkspace = (w: any): Workspace => ({
  id: w.id,
  title: w.title,
  createdAt: w.created_at ?? null,
  lastActiveAt: w.last_active_at ?? null,
});

export const fetchWorkspaces = async (): Promise<Workspace[]> => {
  const { data } = await fastapiClient.get('/auth/user/workspaces');
  return (data.workspaces || []).map(mapWorkspace);
};

export const createWorkspace = async (title: string): Promise<Workspace> => {
  const { data } = await fastapiClient.post('/auth/user/workspaces', { title });
  return mapWorkspace(data);
};

export const touchWorkspace = async (workspaceId: string): Promise<Workspace> => {
  const { data } = await fastapiClient.patch(`/auth/user/workspaces/${workspaceId}`, { touch: true });
  return mapWorkspace(data);
};

export const renameWorkspace = async (workspaceId: string, title: string): Promise<Workspace> => {
  const { data } = await fastapiClient.patch(`/auth/user/workspaces/${workspaceId}`, { title });
  return mapWorkspace(data);
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  await fastapiClient.delete(`/auth/user/workspaces/${workspaceId}`);
};
