/**
 * GitHub API Client
 * Module 3: GitHub Sync Integration
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';
import { getApiUrl } from '../utils/apiUrl';

export interface GitHubRepo {
  name: string;
  full_name: string;
  url: string;
  private: boolean;
}

export interface GitHubStatus {
  connected: boolean;
  username?: string;
  repos?: GitHubRepo[];
}

/**
 * Check GitHub connection status
 */
export const getGitHubStatus = async (): Promise<GitHubStatus> => {
  try {
    const response = await fastapiClient.get<GitHubStatus>('/github/status');
    return response.data;
  } catch (error) {
    logger.error('Error getting GitHub status', error);
    return { connected: false };
  }
};

/**
 * Initiate GitHub OAuth flow
 * Redirects to backend OAuth endpoint
 */
export const connectGitHub = (): void => {
  // Use getApiUrl to get the correct API base URL
  const apiUrl = getApiUrl();
  
  // Redirect to backend OAuth endpoint
  window.location.href = `${apiUrl}/github/oauth/authorize`;
};

/**
 * List user's GitHub repositories
 */
export const listGitHubRepos = async (): Promise<GitHubRepo[]> => {
  try {
    const response = await fastapiClient.get<{ repos: GitHubRepo[] }>('/github/repos');
    return response.data.repos || [];
  } catch (error) {
    logger.error('Error listing GitHub repos', error);
    throw error;
  }
};

/**
 * Clone a GitHub repository
 */
export const cloneGitHubRepo = async (
  repoUrl: string,
  projectId: string,
  branch?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fastapiClient.post('/github/clone', {
      repo_url: repoUrl,
      project_id: projectId,
      branch: branch || 'main',
    });
    return response.data;
  } catch (error) {
    logger.error('Error cloning GitHub repo', error);
    throw error;
  }
};

/**
 * Sync project with GitHub (pull or push)
 */
export const syncGitHub = async (
  projectId: string,
  action: 'pull' | 'push',
  commitMessage?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fastapiClient.post('/github/sync', {
      project_id: projectId,
      action,
      commit_message: commitMessage,
    });
    return response.data;
  } catch (error) {
    logger.error('Error syncing with GitHub', error);
    throw error;
  }
};

