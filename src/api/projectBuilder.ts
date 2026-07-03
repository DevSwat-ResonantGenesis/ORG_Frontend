/**
 * Project Builder API Client
 * ==========================
 * 
 * API client for the Project Builder service endpoints.
 * Provides build management, progress tracking, and project delivery.
 */

import fastapiClient from './fastapiClient';
import { logger } from '@/utils/logger';

// ============================================
// Types
// ============================================

export interface BuildRequest {
  project_name: string;
  description: string;
  project_type?: string;
  tech_stack?: string[];
  initial_budget?: number;
  custom_requirements?: string;
}

export interface BuildProgress {
  project_id: string;
  phase: 'initializing' | 'planning' | 'generating' | 'validating' | 'correcting' | 'finalizing' | 'completed' | 'failed';
  progress_percent: number;
  // Real backend (RG_Agent_Engine's ProgressResponse) sends current_file/files_generated,
  // not current_step/files_created/budget_*. Keep the legacy names optional for compatibility.
  current_step?: string;
  current_file?: string;
  files_created?: number;
  files_generated?: number;
  files_total?: number;
  budget_used?: number;
  budget_remaining?: number;
  errors: string[];
  started_at?: string;
  estimated_completion?: string;
}

export interface BuildResult {
  success: boolean;
  project_id: string;
  project_path?: string;
  files_created: number;
  total_cost: number;
  build_time_seconds: number;
  validation_result?: {
    status: string;
    broken_imports: number;
    governance_violations: number;
  };
  errors: string[];
}

export interface ProjectTemplate {
  type: string;
  name: string;
  description: string;
  tech_stack: string[];
  estimated_files: number;
  estimated_cost: number;
}

export interface UserProject {
  project_id: string;
  name: string;
  description: string;
  tech_stack: string[];
  status: 'active' | 'building' | 'archived';
  created_at: string;
  updated_at: string;
  files_count: number;
  total_cost: number;
}

export interface DeliveryPackage {
  package_id: string;
  project_id: string;
  project_name: string;
  archive_path: string;
  archive_size: number;
  files_count: number;
  created_at: string;
  includes_docs: boolean;
  includes_tests: boolean;
}

export interface WorkspaceStats {
  total_projects: number;
  // Real backend (RG_Agent_Engine's workspace_manager.get_workspace_stats) only
  // guarantees these fields; the rest are legacy/optional and may be absent.
  total_size_mb?: number;
  total_size_bytes?: number;
  projects_by_status?: Record<string, number>;
  active_builds?: number;
  total_files?: number;
  total_cost?: number;
  storage_used_mb?: number;
}

// ============================================
// API Functions
// ============================================

/**
 * Start a new project build
 */
export const startBuild = async (request: BuildRequest): Promise<BuildResult> => {
  try {
    const response = await fastapiClient.post('/code/project-builder/build', request);
    logger.info('Build started', { project_id: response.data.project_id });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to start build', error);
    throw error;
  }
};

/**
 * Get build progress
 */
export const getBuildProgress = async (projectId: string): Promise<BuildProgress> => {
  try {
    const response = await fastapiClient.get(`/code/project-builder/progress/${projectId}`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get build progress', error);
    throw error;
  }
};

/**
 * Cancel an active build
 */
export const cancelBuild = async (projectId: string): Promise<{ cancelled: boolean }> => {
  try {
    const response = await fastapiClient.post(`/code/project-builder/cancel/${projectId}`);
    logger.info('Build cancelled', { project_id: projectId });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to cancel build', error);
    throw error;
  }
};

/**
 * List available project templates
 */
export const listTemplates = async (): Promise<{ templates: ProjectTemplate[] }> => {
  try {
    const response = await fastapiClient.get('/code/project-builder/templates');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to list templates', error);
    throw error;
  }
};

/**
 * List user's projects
 */
export const listProjects = async (): Promise<{ projects: UserProject[] }> => {
  try {
    const response = await fastapiClient.get('/code/project-builder/projects');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to list projects', error);
    throw error;
  }
};

/**
 * Get project details
 */
export const getProject = async (projectId: string): Promise<UserProject> => {
  try {
    const response = await fastapiClient.get(`/code/project-builder/projects/${projectId}`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get project', error);
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<{ deleted: boolean }> => {
  try {
    const response = await fastapiClient.delete(`/code/project-builder/projects/${projectId}`);
    logger.info('Project deleted', { project_id: projectId });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to delete project', error);
    throw error;
  }
};

/**
 * Archive a project
 */
export const archiveProject = async (projectId: string): Promise<{ archived: boolean }> => {
  try {
    const response = await fastapiClient.post(`/code/project-builder/projects/${projectId}/archive`);
    logger.info('Project archived', { project_id: projectId });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to archive project', error);
    throw error;
  }
};

/**
 * Create delivery package
 */
export const createDelivery = async (projectId: string): Promise<DeliveryPackage> => {
  try {
    const response = await fastapiClient.post(`/code/project-builder/projects/${projectId}/deliver`);
    logger.info('Delivery created', { project_id: projectId });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to create delivery', error);
    throw error;
  }
};

/**
 * List delivery packages
 */
export const listDeliveries = async (projectId?: string): Promise<{ deliveries: DeliveryPackage[] }> => {
  try {
    const params = projectId ? { project_id: projectId } : {};
    const response = await fastapiClient.get('/code/project-builder/deliveries', { params });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to list deliveries', error);
    throw error;
  }
};

/**
 * Get workspace statistics
 */
export const getWorkspaceStats = async (): Promise<WorkspaceStats> => {
  try {
    const response = await fastapiClient.get('/code/project-builder/workspace/stats');
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get workspace stats', error);
    throw error;
  }
};

/**
 * Check Project Builder health
 */
export const checkHealth = async (): Promise<{ status: string; version: string }> => {
  try {
    const response = await fastapiClient.get('/code/project-builder/health');
    return response.data;
  } catch (error: any) {
    logger.error('Project Builder health check failed', error);
    throw error;
  }
};

/**
 * Get project files
 */
export const getProjectFiles = async (projectId: string): Promise<{
  project_id: string;
  files: Array<{ path: string; content: string; language: string }>;
  total_files: number;
}> => {
  try {
    const response = await fastapiClient.get(`/code/project-builder/projects/${projectId}/files`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get project files', error);
    throw error;
  }
};

/**
 * Get project governance state
 */
export const getProjectState = async (projectId: string): Promise<{
  project_id: string;
  project_state: 'generated' | 'runtime';
  can_modify: boolean;
  promoted_at: string | null;
  snapshot_id: string | null;
  transitions_count: number;
}> => {
  try {
    const response = await fastapiClient.get(`/code/project-builder/projects/${projectId}/state`);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to get project state', error);
    throw error;
  }
};

/**
 * Promote project from GENERATED to RUNTIME state
 * Required before modifications can be made
 */
export const promoteProject = async (
  projectId: string,
  reason?: string
): Promise<{
  success: boolean;
  project_id: string;
  from_state: string;
  to_state: string;
  snapshot_id: string;
  transition_id: string;
  already_runtime?: boolean;
}> => {
  try {
    const response = await fastapiClient.post(`/code/project-builder/projects/${projectId}/promote`, {
      reason: reason || 'User requested promotion for modification',
    });
    logger.info('Project promoted', { project_id: projectId, snapshot: response.data.snapshot_id });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to promote project', error);
    throw error;
  }
};

/**
 * Modify an existing project using LLM
 * NOTE: Project must be in RUNTIME state (promoted) before modification
 */
export const modifyProject = async (
  projectId: string,
  modificationRequest: string,
  targetFiles?: string[]
): Promise<{
  success: boolean;
  modified_files: Array<{ path: string; action: string }>;
  total_modified: number;
  error?: string;
  error_code?: string;
  action_required?: string;
}> => {
  try {
    const response = await fastapiClient.post(`/code/project-builder/projects/${projectId}/modify`, {
      modification_request: modificationRequest,
      target_files: targetFiles,
    });
    logger.info('Project modified', { project_id: projectId, modified: response.data.total_modified });
    return response.data;
  } catch (error: any) {
    logger.error('Failed to modify project', error);
    
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
      // Return structured error for UI to show LLM notification
      return {
        success: false,
        modified_files: [],
        total_modified: 0,
        error: 'AI service requires your own API key. Please go to Settings → API Keys to add your OpenAI or Anthropic key.',
        error_code: 'LLM_KEY_REQUIRED',
        action_required: 'add-api-key',
      };
    }
    
    throw error;
  }
};
