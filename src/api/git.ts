import fastapiClient from './fastapiClient';
import { logger } from '@/utils/logger';

export interface GitStatusResponse {
  changes: Array<{
    path: string;
    status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
  }>;
}

export interface GitCommitRequest {
  message: string;
  paths: string[];
}

export interface GitCommitResponse {
  success: boolean;
  commit_hash?: string;
  message?: string;
}

/**
 * Get git status for a project
 */
export const getGitStatus = async (projectId?: string): Promise<GitStatusResponse> => {
  try {
    const response = await fastapiClient.post<GitStatusResponse>('/git/status', {
      project_id: projectId,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get git status', error);
    throw error;
  }
};

/**
 * Stage a file for commit
 */
export const stageFile = async (filePath: string, projectId?: string): Promise<void> => {
  try {
    await fastapiClient.post('/git/stage', {
      file_path: filePath,
      project_id: projectId,
    });
  } catch (error: any) {
    logger.error('Failed to stage file', error);
    throw error;
  }
};

/**
 * Unstage a file
 */
export const unstageFile = async (filePath: string, projectId?: string): Promise<void> => {
  try {
    await fastapiClient.post('/git/unstage', {
      file_path: filePath,
      project_id: projectId,
    });
  } catch (error: any) {
    logger.error('Failed to unstage file', error);
    throw error;
  }
};

/**
 * Commit staged changes
 */
export const commitChanges = async (
  request: GitCommitRequest,
  projectId?: string
): Promise<GitCommitResponse> => {
  try {
    const response = await fastapiClient.post<GitCommitResponse>('/git/commit', {
      ...request,
      project_id: projectId,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to commit changes', error);
    throw error;
  }
};

/**
 * Push commits to remote
 */
export const pushCommits = async (projectId?: string): Promise<void> => {
  try {
    await fastapiClient.post('/git/push', {
      project_id: projectId,
    });
  } catch (error: any) {
    logger.error('Failed to push commits', error);
    throw error;
  }
};

