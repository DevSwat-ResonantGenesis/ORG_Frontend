/**
 * Build Service API Client
 * Connects to the Build microservice on port 8003
 */

import axios from 'axios';
import { ENV } from '../config/env';

const BUILD_SERVICE_URL = ENV.apiUrl;

const buildClient = axios.create({
  baseURL: BUILD_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface BuildRequest {
  code_blocks: CodeBlock[];
  project_name?: string;
  project_type?: 'web' | 'react' | 'node' | 'python';
}

export interface BuildResponse {
  project_id: string;
  project_name: string;
  project_type: string;
  files: ProjectFile[];
  entry_point: string;
  created_at: string;
  preview_url?: string;
}

export interface ProjectMetadata {
  project_id: string;
  project_name: string;
  project_type: string;
  files: { path: string; language: string }[];
  created_at: string;
}

/**
 * Build a project from code blocks
 */
export async function buildProject(request: BuildRequest): Promise<BuildResponse> {
  const response = await buildClient.post<BuildResponse>('/build', request);
  return response.data;
}

/**
 * List all built projects
 */
export async function listProjects(): Promise<ProjectMetadata[]> {
  const response = await buildClient.get<{ projects: ProjectMetadata[] }>('/projects');
  return response.data.projects;
}

/**
 * Get project details with file contents
 */
export async function getProject(projectId: string): Promise<BuildResponse> {
  const response = await buildClient.get<BuildResponse>(`/projects/${projectId}`);
  return response.data;
}

/**
 * Get a specific file from a project
 */
export async function getProjectFile(projectId: string, filePath: string): Promise<{ path: string; content: string }> {
  const response = await buildClient.get<{ path: string; content: string }>(
    `/projects/${projectId}/files/${filePath}`
  );
  return response.data;
}

/**
 * Update a file in a project
 */
export async function updateProjectFile(
  projectId: string,
  filePath: string,
  content: string
): Promise<{ status: string; path: string }> {
  const response = await buildClient.put<{ status: string; path: string }>(
    `/projects/${projectId}/files/${filePath}`,
    { content }
  );
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ status: string; project_id: string }> {
  const response = await buildClient.delete<{ status: string; project_id: string }>(
    `/projects/${projectId}`
  );
  return response.data;
}

/**
 * Download project as zip
 */
export async function downloadProject(projectId: string): Promise<{ download_url: string }> {
  const response = await buildClient.post<{ download_url: string }>(
    `/projects/${projectId}/download`
  );
  return response.data;
}

/**
 * Health check
 */
export async function checkBuildServiceHealth(): Promise<boolean> {
  try {
    const response = await buildClient.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}

export default {
  buildProject,
  listProjects,
  getProject,
  getProjectFile,
  updateProjectFile,
  deleteProject,
  downloadProject,
  checkBuildServiceHealth,
};
