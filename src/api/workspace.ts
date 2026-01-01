/**
 * Module A: Container Sandbox API
 * Workspace management endpoints
 */
import { getApiUrl } from '@/utils/apiUrl';

export interface WorkspaceStartRequest {
  project_id: string;
  image?: string;
  memory_limit?: string;
  cpu_limit?: string;
  volumes?: Record<string, { bind: string; mode: string }>;
}

export interface WorkspaceResponse {
  workspace_id: string;
  container_id: string;
  status: string;
  project_id: string;
  image: string;
}

export interface WorkspaceStatus {
  workspace_id: string;
  status: string;
  container_id?: string;
  image?: string;
  project_id?: string;
  docker_available?: boolean;
}

/**
 * Start a workspace container
 */
export async function startWorkspace(request: WorkspaceStartRequest): Promise<WorkspaceResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/workspace/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to start workspace' }));
    throw new Error(error.detail || 'Failed to start workspace');
  }

  return response.json();
}

/**
 * Stop a workspace container
 */
export async function stopWorkspace(workspaceId: string): Promise<{ status: string; workspace_id: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/workspace/${workspaceId}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to stop workspace' }));
    throw new Error(error.detail || 'Failed to stop workspace');
  }

  return response.json();
}

/**
 * Get workspace status
 */
export async function getWorkspaceStatus(workspaceId: string): Promise<WorkspaceStatus> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/workspace/${workspaceId}/status`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get workspace status' }));
    throw new Error(error.detail || 'Failed to get workspace status');
  }

  return response.json();
}

/**
 * Get workspace logs
 */
export async function getWorkspaceLogs(workspaceId: string, tail: number = 100): Promise<{ workspace_id: string; logs: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/workspace/${workspaceId}/logs?tail=${tail}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get workspace logs' }));
    throw new Error(error.detail || 'Failed to get workspace logs');
  }

  return response.json();
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ status: string; workspace_id: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/workspace/${workspaceId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete workspace' }));
    throw new Error(error.detail || 'Failed to delete workspace');
  }

  return response.json();
}

