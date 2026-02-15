import { logger } from '../utils/logger';
import fastapiClient from './fastapiClient';
import axios from 'axios';

// Direct client for Code Execution microservice (bypasses Gateway auth)
const codeExecutionClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true,
});

// Direct client for IDE Service (bypasses Gateway auth for Git operations)
const ideServiceClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

/**
 * Code Features API Client
 * Provides code completion, generation, refactoring, indexing, and search
 */

// Request/Response Types
export interface CodeSelection {
  file: string;
  lines: number[];
  code?: string;
}

export interface CodeCompletionRequest {
  file_path: string;
  prefix: string;
  cursor_position: { line: number; column: number };
  language: string;
}

export interface CodeCompletionResponse {
  completions: Array<{
    text: string;
    score: number;
  }>;
  from_memory: boolean;
}

export interface CodeGenerationRequest {
  description: string;
  language: string;
  file_path?: string;
  context_files?: string[];
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  tests?: string;
}

export interface CodeRefactorRequest {
  file_path: string;
  code: string;
  refactor_request: string;
  language: string;
}

export interface CodeRefactorResponse {
  original_code: string;
  refactored_code: string;
  diff: string;
  explanation: string;
  safety_checks: Record<string, boolean>;
}

export interface CodeIndexRequest {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
}

export interface CodeIndexResponse {
  indexed: number;
  updated: number;
  errors: number;
}

export interface CodeSearchResult {
  chunk_id: string;
  file_path: string;
  language: string;
  chunk_type: string;
  code: string;
  start_line: number;
  end_line: number;
  resonance_score?: number;
  similarity_score?: number;
}

export interface CodeSearchResponse {
  results: CodeSearchResult[];
  count: number;
}

// Project Generation Types
export interface ProjectGenerationRequest {
  description: string;
  project_type?: string; // 'react', 'python', 'node', 'nextjs', 'vue', etc.
  files?: Array<{
    path: string;
    purpose: string;
    language: string;
  }>;
  context?: {
    existing_files?: string[];
    project_structure?: any;
  };
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  explanation: string;
}

export interface ProjectGenerationResponse {
  files: ProjectFile[];
  project_structure: any;
  setup_instructions: string;
  anchors: string[];
}

/**
 * Code Completion
 * POST /code/complete
 */
export const completeCode = async (
  request: CodeCompletionRequest
): Promise<CodeCompletionResponse> => {
  try {
    const response = await fastapiClient.post('/code/complete', request);
    const data = response.data;
    if (data?.port) {
      data.preview_url = `/preview/proxy/${data.port}`;
    }
    return data;
  } catch (error) {
    logger.error('Code completion error', error);
    throw error;
  }
};

/**
 * Generate Code
 * POST /code/generate
 */
export const generateCode = async (
  request: CodeGenerationRequest
): Promise<CodeGenerationResponse> => {
  try {
    const response = await fastapiClient.post('/code/generate', request);
    return response.data;
  } catch (error) {
    logger.error('Code generation error', error);
    throw error;
  }
};

/**
 * Refactor Code
 * POST /code/refactor
 */
export const refactorCode = async (
  request: CodeRefactorRequest
): Promise<CodeRefactorResponse> => {
  try {
    const response = await fastapiClient.post('/code/refactor', request);
    return response.data;
  } catch (error) {
    logger.error('Code refactoring error', error);
    throw error;
  }
};

/**
 * Index Codebase
 * POST /code/index
 */
export const indexCodebase = async (
  request: CodeIndexRequest
): Promise<CodeIndexResponse> => {
  try {
    const response = await fastapiClient.post('/code/index', request);
    return response.data;
  } catch (error) {
    logger.error('Code indexing error', error);
    throw error;
  }
};

/**
 * Search Codebase (Hash Sphere)
 * GET /code/search
 */
export const searchCodebase = async (
  query: string,
  language?: string,
  limit: number = 10
): Promise<CodeSearchResponse> => {
  try {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    if (language) params.append('language', language);

    const response = await fastapiClient.get(`/code/search?${params.toString()}`);
    return response.data;
  } catch (error) {
    logger.error('Code search error', error);
    throw error;
  }
};

/**
 * Search Codebase (ML Embeddings)
 * GET /code/search/ml
 */
export const searchCodebaseML = async (
  query: string,
  language?: string,
  limit: number = 10
): Promise<CodeSearchResponse> => {
  try {
    const params = new URLSearchParams({ query, limit: limit.toString() });
    if (language) params.append('language', language);

    const response = await fastapiClient.get(`/code/search/ml?${params.toString()}`);
    return response.data;
  } catch (error) {
    logger.error('Code ML search error', error);
    throw error;
  }
};

/**
 * Generate Complete Project
 * POST /code/project/generate
 * Uses Hash Sphere to find similar project patterns and generates multiple files
 */
export const generateProject = async (
  request: ProjectGenerationRequest
): Promise<ProjectGenerationResponse> => {
  try {
    const response = await fastapiClient.post('/code/project/generate', request);

    // Debug: Log response structure
    logger.info('Project generation API response', {
      status: response.status,
      hasData: !!response.data,
      fileCount: response.data?.files?.length || 0,
      files: response.data?.files,
      hasSetupInstructions: !!response.data?.setup_instructions
    });

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response: no data received');
    }

    if (!response.data.files || !Array.isArray(response.data.files)) {
      logger.warn('Invalid files array in response', { data: response.data });
      throw new Error('Invalid response: files array missing or invalid');
    }

    // Ensure all files have required fields
    const validatedFiles = response.data.files.map((file: any, idx: number) => ({
      path: file.path || `file_${idx}.txt`,
      content: file.content || '',
      language: file.language || 'text',
      explanation: file.explanation || `Generated file: ${file.path || `file_${idx}`}`
    }));

    return {
      files: validatedFiles,
      project_structure: response.data.project_structure || {},
      setup_instructions: response.data.setup_instructions || '',
      anchors: response.data.anchors || []
    };
  } catch (error: any) {
    logger.error('Project generation error', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Check for LLM-related errors and provide user-friendly message
    const errorMsg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || '';
    const isLLMError = 
      errorMsg.toLowerCase().includes('quota') ||
      errorMsg.toLowerCase().includes('rate limit') ||
      errorMsg.toLowerCase().includes('insufficient') ||
      errorMsg.toLowerCase().includes('credit') ||
      errorMsg.toLowerCase().includes('api key') ||
      errorMsg.toLowerCase().includes('failed to generate') ||
      error?.response?.status === 429;
    
    if (isLLMError) {
      throw new Error(
        'AI service requires your own API key. Please go to Settings → API Keys to add your OpenAI or Anthropic key to use Project Builder.'
      );
    }
    
    throw error;
  }
};

// IDE File Operations
export interface FileReadRequest {
  file_path: string;
}

export interface FileReadResponse {
  path: string;
  content: string;
  language: string;
  exists: boolean;
}

export interface FileWriteRequest {
  file_path: string;
  content: string;
  language?: string;
}

export interface FileWriteResponse {
  path: string;
  success: boolean;
  indexed: boolean;
  anchor_created?: string;
}

export interface FileDeleteRequest {
  file_path: string;
}

export interface FileListResponse {
  files: Array<{
    path: string;
    language?: string;
    size?: number;
    modified?: string;
  }>;
  project_id?: string;
}

/**
 * List project files
 * GET /code/project/files
 */
export const listProjectFiles = async (
  projectId?: string
): Promise<FileListResponse> => {
  try {
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await fastapiClient.get(`/code/project/files${params}`);
    return response.data;
  } catch (error) {
    logger.error('List project files error', error);
    throw error;
  }
};

/**
 * Read a file from project
 * POST /code/project/read
 */
export const readProjectFile = async (
  filePath: string,
  projectId?: string
): Promise<FileReadResponse> => {
  try {
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await fastapiClient.post(`/code/project/read${params}`, {
      file_path: filePath
    });
    return response.data;
  } catch (error) {
    logger.error('Read file error', error);
    throw error;
  }
};

/**
 * Write/update a file in project
 * POST /code/project/write
 */
export const writeProjectFile = async (
  filePath: string,
  content: string,
  language?: string,
  projectId?: string
): Promise<FileWriteResponse> => {
  try {
    const params = projectId ? `?project_id=${projectId}` : '';
    const response = await fastapiClient.post(`/code/project/write${params}`, {
      file_path: filePath,
      content,
      language
    });
    return response.data;
  } catch (error) {
    logger.error('Write file error', error);
    throw error;
  }
};

/**
 * Delete (archive) a file or folder from project
 * POST /code/project/delete-file
 * 
 * Note: Hash Sphere is immutable - this archives the file instead of deleting.
 * Archived files won't be loaded but can be restored later.
 */
export const deleteProjectFile = async (
  filePath: string,
  projectId?: string
): Promise<{ success: boolean; message: string; archived?: boolean; archived_count?: number }> => {
  try {
    const response = await fastapiClient.post('/code/project/delete-file', {
      file_path: filePath,
      project_id: projectId
    });
    return response.data;
  } catch (error) {
    logger.error('Archive file error', error);
    throw error;
  }
};

/**
 * Archive a specific file (Hash Sphere immutable pattern)
 * POST /memory/archive/file
 */
export const archiveFile = async (
  filePath: string,
  projectId?: string
): Promise<{ success: boolean; archived_count: number; message: string }> => {
  try {
    const response = await fastapiClient.post('/memory/archive/file', {
      file_path: filePath,
      project_id: projectId
    });
    return response.data;
  } catch (error) {
    logger.error('Archive file error', error);
    throw error;
  }
};

/**
 * Restore an archived file
 * POST /memory/unarchive/file
 */
export const restoreArchivedFile = async (
  filePath: string,
  projectId?: string
): Promise<{ success: boolean; archived_count: number; message: string }> => {
  try {
    const response = await fastapiClient.post('/memory/unarchive/file', {
      file_path: filePath,
      project_id: projectId
    });
    return response.data;
  } catch (error) {
    logger.error('Restore file error', error);
    throw error;
  }
};

/**
 * List all archived files for the current user
 * GET /memory/archived/files
 */
export const listArchivedFiles = async (): Promise<{ archived_files: string[]; count: number }> => {
  try {
    const response = await fastapiClient.get('/memory/archived/files');
    return response.data;
  } catch (error) {
    logger.error('List archived files error', error);
    throw error;
  }
};

export interface ProjectArchiveRequest {
  project_id?: string;
  folder_path?: string;  // For archiving virtual folders by path
  project_hash?: string;
}

export interface ProjectArchiveResponse {
  success: boolean;
  message: string;
  project_hash: string;
  archived_files_count: number;
}

export interface ProjectRestoreRequest {
  project_hash: string;
  new_project_id?: string;
}

export interface ProjectRestoreResponse {
  success: boolean;
  message: string;
  project_id: string;
  restored_files_count: number;
}

/**
 * Archive a project (virtual folder)
 * Archives all files but keeps them in Hash Sphere
 * POST /code/project/archive
 */
export const archiveProject = async (
  projectId?: string,
  folderPath?: string,
  projectHash?: string
): Promise<ProjectArchiveResponse> => {
  try {
    const response = await fastapiClient.post('/code/project/archive', {
      project_id: projectId,
      folder_path: folderPath,
      project_hash: projectHash
    });
    return response.data;
  } catch (error) {
    logger.error('Archive project error', error);
    throw error;
  }
};

/**
 * Restore an archived project by Hash Sphere hash
 * Only restores if requested by user (not automatic)
 * POST /code/project/restore
 */
export const restoreProject = async (
  projectHash: string,
  newProjectId?: string
): Promise<ProjectRestoreResponse> => {
  try {
    const response = await fastapiClient.post('/code/project/restore', {
      project_hash: projectHash,
      new_project_id: newProjectId
    });
    return response.data;
  } catch (error) {
    logger.error('Restore project error', error);
    throw error;
  }
};

/**
 * Restore an archived project by Crypto Hash + Mnemonic
 * POST /code/project/restore-by-hash
 */
export const restoreProjectByCryptoHash = async (
  cryptoHash: string,
  mnemonic: string
): Promise<ProjectRestoreResponse> => {
  try {
    const response = await fastapiClient.post('/code/project/restore-by-hash', null, {
      params: {
        crypto_hash: cryptoHash,
        mnemonic: mnemonic
      }
    });
    return response.data;
  } catch (error) {
    logger.error('Restore project by hash error', error);
    throw error;
  }
};

/**
 * Transfer project ownership
 * POST /code/project/{id}/transfer
 */
export const transferProjectOwnership = async (
  projectId: string,
  newOwnerEmail: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fastapiClient.post(`/code/project/${projectId}/transfer`, null, {
      params: { new_owner_email: newOwnerEmail }
    });
    return response.data;
  } catch (error) {
    logger.error('Transfer project ownership error', error);
    throw error;
  }
};

/**
 * Create a new file or folder
 * POST /code/project/create
 */
export const createProjectFile = async (
  filePath: string,
  isFolder: boolean = false,
  content: string = '',
  projectId?: string,
  language?: string
): Promise<{ success: boolean; message: string; path: string; indexed?: boolean }> => {
  try {
    const params = projectId ? `?project_id=${projectId}` : '';
    const requestBody: any = {
      file_path: filePath,
      is_folder: isFolder,
      content,
      language
    };

    const response = await fastapiClient.post(`/code/project/create${params}`, requestBody);
    return response.data;
  } catch (error) {
    logger.error('Create file error', error);
    throw error;
  }
};

/**
 * Rename a file or folder
 * POST /code/project/file/rename
 */
export const renameProjectFile = async (
  oldPath: string,
  newPath: string
): Promise<{ success: boolean; message: string; new_path: string }> => {
  try {
    const response = await fastapiClient.post('/code/project/file/rename', {
      old_path: oldPath,
      new_path: newPath
    });
    return response.data;
  } catch (error) {
    logger.error('Rename file error', error);
    throw error;
  }
};

/**
 * Move a file or folder (drag and drop)
 * POST /code/project/file/move
 */
export const moveProjectFile = async (
  sourcePath: string,
  targetPath: string
): Promise<{ success: boolean; message: string; new_path: string }> => {
  try {
    const response = await fastapiClient.post('/code/project/file/move', {
      source_path: sourcePath,
      target_path: targetPath
    });
    return response.data;
  } catch (error) {
    logger.error('Move file error', error);
    throw error;
  }
};

/**
 * Upload a project (ZIP file)
 * POST /code/project/upload
 */
export const uploadProject = async (
  file: File
): Promise<{ project_id: string; files_indexed: number; message: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Sending upload request to /code/project/upload');
    console.log('📦 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const response = await fastapiClient.post('/code/project/upload', formData, {
      // Don't set Content-Type - axios will set it automatically with boundary for FormData
      headers: {
        // Remove Content-Type to let axios handle it
      },
      timeout: 300000, // 5 minutes timeout for large files
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Upload progress: ${percentCompleted}%`);
        }
      },
    });

    console.log('✅ Upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload project error:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText
    });
    logger.error('Upload project error', error);
    throw error;
  }
};

// ============================================
// User Projects API
// ============================================

export interface UserProject {
  project_id: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  files_count?: number;
}

/**
 * List all projects for the authenticated user
 * GET /code/projects
 * Enables cross-device project access
 * Note: This endpoint may not be available in all deployments
 */
export const listUserProjects = async (): Promise<{ projects: UserProject[]; count: number }> => {
  try {
    const response = await fastapiClient.get('/code/projects');
    return response.data;
  } catch (error: any) {
    // Don't log error for 404 - endpoint may not be deployed yet
    if (error?.response?.status !== 404) {
      logger.error('List user projects error', error);
    }
    return { projects: [], count: 0 };
  }
};

// ============================================
// Git Operations API
// ============================================

export interface GitStatus {
  initialized: boolean;
  is_repo?: boolean;
  files: Array<{
    status: string;
    file: string;
    status_text?: string;
  }>;
  has_changes?: boolean;
  branch: string | null;
  message?: string;
  error?: string;
  staged?: Array<{ path: string; status: string }>;
  modified?: Array<{ path: string; status: string }>;
  untracked?: Array<{ path: string; status: string }>;
}

export interface GitCommitResponse {
  success: boolean;
  message: string;
  output: string;
  error?: string;
}

export interface GitBranchResponse {
  success: boolean;
  branch: string;
  output: string;
  error?: string;
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
}

/**
 * Initialize git repository
 * POST /git/init - Direct to IDE Service
 */
export const initGitRepo = async (
  projectId: string
): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await ideServiceClient.post('/git/init', {
      project_id: projectId
    });
    return response.data;
  } catch (error: any) {
    logger.error('Init git repo error', error);
    return { success: false, message: 'Failed to initialize', error: error.message };
  }
};

/**
 * Get git status
 * POST /git/status - Direct to IDE Service
 */
export const getGitStatus = async (
  projectId: string
): Promise<GitStatus> => {
  try {
    const response = await ideServiceClient.post('/git/status', {
      project_id: projectId
    });
    const data = response.data;
    // Transform to expected format
    const files: Array<{ file: string; status: string }> = [
      ...(data.staged || []).map((f: any) => ({ file: f.path || f, status: 'A' })),
      ...(data.modified || []).map((f: any) => ({ file: f.path || f, status: 'M' })),
      ...(data.untracked || []).map((f: any) => ({ file: f.path || f, status: '??' })),
    ];
    return { ...data, files };
  } catch (error) {
    logger.error('Get git status error', error);
    return { initialized: false, branch: null, files: [] };
  }
};

/**
 * Stage files
 * POST /git/stage - Direct to IDE Service
 */
export const stageFiles = async (
  projectId: string,
  files?: string[]
): Promise<{ success: boolean; message: string; error?: string }> => {
  try {
    const response = await ideServiceClient.post('/git/stage', {
      project_id: projectId,
      file_paths: files
    });
    return response.data;
  } catch (error: any) {
    logger.error('Stage files error', error);
    return { success: false, message: 'Failed to stage', error: error.message };
  }
};

/**
 * Commit changes
 * POST /git/commit - Direct to IDE Service
 */
export const commitChanges = async (
  projectId: string,
  message?: string,
  autoGenerate: boolean = true
): Promise<GitCommitResponse> => {
  try {
    const commitMessage = message || (autoGenerate ? 'Auto-generated commit' : 'Commit');
    const response = await ideServiceClient.post('/git/commit', {
      project_id: projectId,
      message: commitMessage
    });
    return response.data;
  } catch (error: any) {
    logger.error('Commit changes error', error);
    return { success: false, message: 'Failed to commit', output: '', error: error.message };
  }
};

/**
 * Create or switch branch
 * POST /git/branch - Direct to IDE Service
 */
export const manageBranch = async (
  projectId: string,
  branchName: string,
  create: boolean = true
): Promise<GitBranchResponse> => {
  try {
    const response = await ideServiceClient.post('/git/branch', {
      project_id: projectId,
      branch_name: branchName,
      action: create ? 'create' : 'checkout'
    });
    return { ...response.data, branch: branchName };
  } catch (error: any) {
    logger.error('Manage branch error', error);
    return { success: false, branch: '', output: '', error: error.message };
  }
};

/**
 * List branches
 * POST /git/branch - Direct to IDE Service
 */
export const listBranches = async (
  projectId: string
): Promise<{ branches: string[] }> => {
  try {
    const response = await ideServiceClient.post('/git/branch', {
      project_id: projectId,
      action: 'list'
    });
    return { branches: response.data.branches || [] };
  } catch (error) {
    logger.error('List branches error', error);
    return { branches: [] };
  }
};

/**
 * Get commit log
 * GET /git/log - Direct to IDE Service
 */
export const getCommitLog = async (
  projectId: string,
  limit: number = 10
): Promise<{ commits: GitCommit[] }> => {
  try {
    const response = await ideServiceClient.get(`/git/log/${projectId}?limit=${limit}`);
    return { commits: response.data.commits || [] };
  } catch (error) {
    logger.error('Get commit log error', error);
    return { commits: [] };
  }
};

// ============================================
// MODULE A: PROJECT RUNNER
// ============================================

export interface ProjectRunRequest {
  project_id: string;
  command?: string; // Optional: custom command (e.g., "npm run dev", "python main.py")
  language?: string; // Auto-detect if not provided
}

export interface ProjectRunResponse {
  success: boolean;
  output: string;
  error?: string;
  exit_code: number;
  execution_time: number;
  command: string;
}

/**
 * Run project (Module A)
 * POST /code/run
 */
export const runProject = async (
  projectId: string,
  command?: string
): Promise<ProjectRunResponse> => {
  try {
    const response = await fastapiClient.post<ProjectRunResponse>('/code/run', {
      project_id: projectId,
      command,
    });
    return response.data;
  } catch (error) {
    logger.error('Run project error', error);
    throw error;
  }
};

// ============================================
// MODULE B: AI PATCH SYSTEM
// ============================================

export interface PatchRequest {
  file_path: string;
  instructions: string;
  project_id?: string;
}

export interface PatchResponse {
  oldCode: string;
  newCode: string;
  explanation?: string;
}

/**
 * AI Patch System (Module B)
 * POST /code/patch
 */
export const patchFile = async (
  filePath: string,
  instructions: string,
  projectId?: string
): Promise<PatchResponse> => {
  try {
    const response = await fastapiClient.post<PatchResponse>('/code/patch', {
      file_path: filePath,
      instructions,
      project_id: projectId,
    });
    return response.data;
  } catch (error) {
    logger.error('Patch file error', error);
    throw error;
  }
};

// ============================================
// MODULE C: INLINE AI COMMENTS
// ============================================

export interface ExplainCodeRequest {
  code: string;
  language: string;
  context?: string;
  line_number?: number;
}

export interface ExplainCodeResponse {
  explanation: string;
  examples?: string[];
  related_concepts?: string[];
}

/**
 * Inline AI Comments - Explain Code (Module C)
 * POST /code/explain
 */
export const explainCode = async (
  code: string,
  language: string,
  context?: string,
  lineNumber?: number
): Promise<ExplainCodeResponse> => {
  try {
    const response = await fastapiClient.post<ExplainCodeResponse>('/code/explain', {
      code,
      language,
      context,
      line_number: lineNumber,
    });
    return response.data;
  } catch (error) {
    logger.error('Explain code error', error);
    throw error;
  }
};

// ============================================
// MODULE D: PROJECT DOWNLOAD
// ============================================

/**
 * Download project as ZIP (Module D)
 * GET /code/project/download
 */
export const downloadProject = async (projectId: string): Promise<Blob> => {
  try {
    const response = await fastapiClient.get(`/code/project/download?project_id=${projectId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    logger.error('Download project error', error);
    throw error;
  }
};

// ============================================
// MODULE E: AST AUTO-REFACTOR ENGINE
// ============================================

export interface ASTRefactorRequest {
  file_path: string;
  rule: string; // e.g., "rename_symbol", "extract_function", "remove_unused"
  parameters?: Record<string, any>; // e.g., { old_name: "foo", new_name: "bar" }
  project_id?: string;
}

export interface ASTRefactorResponse {
  oldCode: string;
  newCode: string;
  changes: Array<{
    type: string;
    description: string;
    line: number;
  }>;
  safety_checks: Record<string, boolean>;
}

/**
 * AST Auto-Refactor Engine (Module E)
 * POST /code/refactor/ast
 */
export const astRefactor = async (
  filePath: string,
  rule: string,
  parameters?: Record<string, any>,
  projectId?: string
): Promise<ASTRefactorResponse> => {
  try {
    const response = await fastapiClient.post<ASTRefactorResponse>('/code/refactor/ast', {
      file_path: filePath,
      rule,
      parameters,
      project_id: projectId,
    });
    return response.data;
  } catch (error) {
    logger.error('AST refactor error', error);
    throw error;
  }
};

// ============================================
// Code Execution API
// ============================================

export interface CodeExecutionRequest {
  code: string;
  language: string;
  inputs?: string[];
  timeout?: number;
}

export interface CodeExecutionResponse {
  success: boolean;
  output: string;
  error?: string;
  exit_code: number;
  execution_time: number;
}

/**
 * Execute code in sandbox
 * POST /code/execute - Direct to Code Execution microservice
 */
export const executeCode = async (
  code: string,
  language: string,
  inputs?: string[],
  timeout?: number
): Promise<CodeExecutionResponse> => {
  try {
    const response = await codeExecutionClient.post('/code/execute', {
      code,
      language,
      inputs,
      timeout
    });
    return response.data;
  } catch (error) {
    logger.error('Code execution error', error);
    throw error;
  }
};

// ============================================
// Advanced Refactoring API
// ============================================

export interface AdvancedRefactorRequest {
  project_id: string;
  refactor_request: string;
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
}

export interface AdvancedRefactorResponse {
  files: Array<{
    path: string;
    original: string;
    refactored: string;
    diff: string;
  }>;
  validation: {
    valid: boolean;
    issues: Array<{
      file: string;
      type: 'error' | 'warning';
      message: string;
    }>;
  };
  dependency_changes: {
    added_dependencies?: Array<{
      file: string;
      dependencies: string[];
    }>;
    removed_dependencies?: Array<{
      file: string;
      dependencies: string[];
    }>;
    modified_dependencies?: Array<{
      file: string;
      dependencies: string[];
    }>;
  };
}

/**
 * Advanced multi-file refactoring
 * POST /code/refactor/advanced
 */
export const advancedRefactor = async (
  request: AdvancedRefactorRequest
): Promise<AdvancedRefactorResponse> => {
  try {
    const response = await fastapiClient.post('/code/refactor/advanced', request);
    return response.data;
  } catch (error) {
    logger.error('Advanced refactoring error', error);
    throw error;
  }
};

// ============================================
// Terminal API (IDE Backend)
// ============================================

export interface TerminalExecuteRequest {
  command: string;
  cwd?: string;
  timeout?: number;
}

export interface TerminalExecuteResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  exit_code: number;
}

/**
 * Execute a terminal command
 * POST /terminal/execute - Direct to Code Execution microservice
 */
export const executeTerminalCommand = async (
  command: string,
  cwd?: string,
  timeout?: number
): Promise<TerminalExecuteResponse> => {
  try {
    const response = await codeExecutionClient.post('/terminal/execute', {
      command,
      cwd: cwd || '.',
      timeout: timeout || 30
    });
    return response.data;
  } catch (error) {
    logger.error('Terminal command error', error);
    throw error;
  }
};

/**
 * Create a terminal session
 * POST /terminal/session/create
 */
export const createTerminalSession = async (
  sessionId: string,
  cwd?: string
): Promise<{ session_id: string; cwd: string; is_active: boolean }> => {
  try {
    const response = await fastapiClient.post('/terminal/session/create', {
      session_id: sessionId,
      cwd: cwd || '.'
    });
    return response.data;
  } catch (error) {
    logger.error('Create terminal session error', error);
    throw error;
  }
};

/**
 * Execute command in existing session
 * POST /terminal/session/{sessionId}/execute
 */
export const executeInSession = async (
  sessionId: string,
  command: string,
  timeout?: number
): Promise<TerminalExecuteResponse> => {
  try {
    const response = await fastapiClient.post(`/terminal/session/${sessionId}/execute`, {
      command,
      timeout: timeout || 30
    });
    return response.data;
  } catch (error) {
    logger.error('Session execute error', error);
    throw error;
  }
};

/**
 * Stop a terminal session
 * DELETE /terminal/session/{sessionId}
 */
export const stopTerminalSession = async (
  sessionId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fastapiClient.delete(`/terminal/session/${sessionId}`);
    return response.data;
  } catch (error) {
    logger.error('Stop terminal session error', error);
    throw error;
  }
};

// ============================================
// IDE Project Preview API
// ============================================

export interface PreviewStartRequest {
  project_id: string;
  port?: number;
  command?: string;
}

export interface PreviewStartResponse {
  success: boolean;
  preview_url: string;
  port: number;
  process_id: string;
}

/**
 * Start a preview server for a project
 * POST /preview/start - Direct to Code Execution microservice
 */
export const startProjectPreview = async (
  projectId: string,
  projectPath?: string,
  port?: number,
  command?: string
): Promise<PreviewStartResponse> => {
  try {
    const response = await codeExecutionClient.post('/preview/start', {
      project_id: projectId,
      project_path: projectPath || `/tmp/projects/${projectId}`,
      port,
      command
    });
    const data = response.data;
    if (data?.port) {
      data.preview_url = `/preview/proxy/${data.port}`;
    }
    return data;
  } catch (error) {
    logger.error('Start preview error', error);
    throw error;
  }
};

/**
 * Stop a preview server
 * POST /preview/stop - Direct to Code Execution microservice
 */
export const stopProjectPreview = async (
  projectId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await codeExecutionClient.post('/preview/stop', {
      project_id: projectId
    });
    return response.data;
  } catch (error) {
    logger.error('Stop preview error', error);
    throw error;
  }
};

