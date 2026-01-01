/**
 * COMPLETE IDE SERVICE API
 * ========================
 * 
 * Full IDE service API client covering:
 * - File operations
 * - Terminal
 * - Git integration
 * - Code execution
 * - Project management
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
  children?: FileNode[];
}

export interface FileContent {
  path: string;
  content: string;
  encoding: string;
  size: number;
  modified: string;
  language?: string;
}

export interface Terminal {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  status: 'running' | 'idle' | 'closed';
  created_at: string;
}

export interface TerminalOutput {
  terminal_id: string;
  output: string;
  timestamp: string;
}

export interface ExecutionResult {
  id: string;
  status: 'success' | 'error' | 'timeout';
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
  conflicts: string[];
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  type: string;
  language: string;
  created_at: string;
  last_opened: string;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  content: string;
  match: string;
}

// ============== FILE OPERATIONS ==============

/**
 * List directory contents.
 */
export const listDirectory = async (
  projectId: string,
  path: string = '/'
): Promise<FileNode[]> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/files`, {
    params: { path },
  });
  return response.data;
};

/**
 * Get file tree.
 */
export const getFileTree = async (
  projectId: string,
  depth: number = 3
): Promise<FileNode> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/tree`, {
    params: { depth },
  });
  return response.data;
};

/**
 * Read file content.
 */
export const readFile = async (
  projectId: string,
  path: string
): Promise<FileContent> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/file`, {
    params: { path },
  });
  return response.data;
};

/**
 * Write file content.
 */
export const writeFile = async (
  projectId: string,
  path: string,
  content: string
): Promise<{ success: boolean; path: string }> => {
  try {
    const response = await fastapiClient.post(`/ide/projects/${projectId}/file`, {
      path,
      content,
    });
    logger.info('File saved', { path });
    return response.data;
  } catch (error) {
    logger.error('Failed to save file', error);
    throw error;
  }
};

/**
 * Create file or directory.
 */
export const createFileOrDir = async (
  projectId: string,
  path: string,
  type: 'file' | 'directory',
  content?: string
): Promise<{ success: boolean; path: string }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/create`, {
    path,
    type,
    content,
  });
  return response.data;
};

/**
 * Delete file or directory.
 */
export const deleteFileOrDir = async (
  projectId: string,
  path: string
): Promise<{ success: boolean }> => {
  const response = await fastapiClient.delete(`/ide/projects/${projectId}/file`, {
    params: { path },
  });
  return response.data;
};

/**
 * Rename/move file or directory.
 */
export const renameFile = async (
  projectId: string,
  oldPath: string,
  newPath: string
): Promise<{ success: boolean; path: string }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/rename`, {
    old_path: oldPath,
    new_path: newPath,
  });
  return response.data;
};

/**
 * Copy file or directory.
 */
export const copyFile = async (
  projectId: string,
  sourcePath: string,
  destPath: string
): Promise<{ success: boolean; path: string }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/copy`, {
    source_path: sourcePath,
    dest_path: destPath,
  });
  return response.data;
};

// ============== SEARCH ==============

/**
 * Search files by content.
 */
export const searchInFiles = async (
  projectId: string,
  query: string,
  options?: {
    regex?: boolean;
    caseSensitive?: boolean;
    includePatterns?: string[];
    excludePatterns?: string[];
    maxResults?: number;
  }
): Promise<SearchResult[]> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/search`, {
    query,
    ...options,
  });
  return response.data;
};

/**
 * Find files by name.
 */
export const findFiles = async (
  projectId: string,
  pattern: string,
  maxResults: number = 100
): Promise<string[]> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/find`, {
    params: { pattern, max_results: maxResults },
  });
  return response.data;
};

// ============== TERMINAL ==============

/**
 * Create terminal.
 */
export const createTerminal = async (
  projectId: string,
  name?: string,
  shell?: string
): Promise<Terminal> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/terminal`, {
    name,
    shell,
  });
  return response.data;
};

/**
 * List terminals.
 */
export const listTerminals = async (projectId: string): Promise<Terminal[]> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/terminals`);
  return response.data;
};

/**
 * Send command to terminal.
 */
export const sendTerminalCommand = async (
  projectId: string,
  terminalId: string,
  command: string
): Promise<{ sent: boolean }> => {
  const response = await fastapiClient.post(
    `/ide/projects/${projectId}/terminal/${terminalId}/send`,
    { command }
  );
  return response.data;
};

/**
 * Get terminal output.
 */
export const getTerminalOutput = async (
  projectId: string,
  terminalId: string,
  lines?: number
): Promise<TerminalOutput> => {
  const response = await fastapiClient.get(
    `/ide/projects/${projectId}/terminal/${terminalId}/output`,
    { params: { lines } }
  );
  return response.data;
};

/**
 * Close terminal.
 */
export const closeTerminal = async (
  projectId: string,
  terminalId: string
): Promise<{ closed: boolean }> => {
  const response = await fastapiClient.delete(
    `/ide/projects/${projectId}/terminal/${terminalId}`
  );
  return response.data;
};

// ============== CODE EXECUTION ==============

/**
 * Execute code snippet.
 */
export const executeCode = async (
  projectId: string,
  code: string,
  language: string,
  timeout?: number
): Promise<ExecutionResult> => {
  try {
    const response = await fastapiClient.post(`/ide/projects/${projectId}/execute`, {
      code,
      language,
      timeout,
    });
    return response.data;
  } catch (error) {
    logger.error('Code execution failed', error);
    throw error;
  }
};

/**
 * Run file.
 */
export const runFile = async (
  projectId: string,
  path: string,
  args?: string[]
): Promise<ExecutionResult> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/run`, {
    path,
    args,
  });
  return response.data;
};

// ============== GIT ==============

/**
 * Get git status.
 */
export const getGitStatus = async (projectId: string): Promise<GitStatus> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/git/status`);
  return response.data;
};

/**
 * Get git log.
 */
export const getGitLog = async (
  projectId: string,
  limit: number = 50
): Promise<GitCommit[]> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/git/log`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Stage files.
 */
export const gitStage = async (
  projectId: string,
  paths: string[]
): Promise<{ staged: string[] }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/git/stage`, {
    paths,
  });
  return response.data;
};

/**
 * Unstage files.
 */
export const gitUnstage = async (
  projectId: string,
  paths: string[]
): Promise<{ unstaged: string[] }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/git/unstage`, {
    paths,
  });
  return response.data;
};

/**
 * Commit changes.
 */
export const gitCommit = async (
  projectId: string,
  message: string
): Promise<{ hash: string; message: string }> => {
  try {
    const response = await fastapiClient.post(`/ide/projects/${projectId}/git/commit`, {
      message,
    });
    logger.info('Git commit created', response.data);
    return response.data;
  } catch (error) {
    logger.error('Git commit failed', error);
    throw error;
  }
};

/**
 * Push changes.
 */
export const gitPush = async (
  projectId: string,
  remote: string = 'origin',
  branch?: string
): Promise<{ pushed: boolean }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/git/push`, {
    remote,
    branch,
  });
  return response.data;
};

/**
 * Pull changes.
 */
export const gitPull = async (
  projectId: string,
  remote: string = 'origin',
  branch?: string
): Promise<{ pulled: boolean; commits: number }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/git/pull`, {
    remote,
    branch,
  });
  return response.data;
};

/**
 * Get file diff.
 */
export const getFileDiff = async (
  projectId: string,
  path: string
): Promise<{ diff: string }> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/git/diff`, {
    params: { path },
  });
  return response.data;
};

/**
 * List branches.
 */
export const listBranches = async (
  projectId: string
): Promise<Array<{ name: string; current: boolean }>> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}/git/branches`);
  return response.data;
};

/**
 * Checkout branch.
 */
export const checkoutBranch = async (
  projectId: string,
  branch: string,
  create: boolean = false
): Promise<{ branch: string }> => {
  const response = await fastapiClient.post(`/ide/projects/${projectId}/git/checkout`, {
    branch,
    create,
  });
  return response.data;
};

// ============== PROJECTS ==============

/**
 * List projects.
 */
export const listProjects = async (): Promise<Project[]> => {
  const response = await fastapiClient.get('/ide/projects');
  return response.data;
};

/**
 * Get project.
 */
export const getProject = async (projectId: string): Promise<Project> => {
  const response = await fastapiClient.get(`/ide/projects/${projectId}`);
  return response.data;
};

/**
 * Create project.
 */
export const createProject = async (
  name: string,
  template?: string
): Promise<Project> => {
  const response = await fastapiClient.post('/ide/projects', { name, template });
  return response.data;
};

/**
 * Delete project.
 */
export const deleteProject = async (projectId: string): Promise<{ deleted: boolean }> => {
  const response = await fastapiClient.delete(`/ide/projects/${projectId}`);
  return response.data;
};

/**
 * Clone repository.
 */
export const cloneRepository = async (
  url: string,
  name?: string
): Promise<Project> => {
  const response = await fastapiClient.post('/ide/projects/clone', { url, name });
  return response.data;
};

// ============== EXPORTS ==============

export default {
  // Files
  listDirectory,
  getFileTree,
  readFile,
  writeFile,
  createFileOrDir,
  deleteFileOrDir,
  renameFile,
  copyFile,
  // Search
  searchInFiles,
  findFiles,
  // Terminal
  createTerminal,
  listTerminals,
  sendTerminalCommand,
  getTerminalOutput,
  closeTerminal,
  // Execution
  executeCode,
  runFile,
  // Git
  getGitStatus,
  getGitLog,
  gitStage,
  gitUnstage,
  gitCommit,
  gitPush,
  gitPull,
  getFileDiff,
  listBranches,
  checkoutBranch,
  // Projects
  listProjects,
  getProject,
  createProject,
  deleteProject,
  cloneRepository,
};
