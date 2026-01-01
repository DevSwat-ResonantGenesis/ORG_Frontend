import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

/**
 * AI Review Pipeline API Client
 * 
 * Human-in-the-Loop Review System for AI-generated code changes.
 * Enterprise-grade approval workflow for government & enterprise clients.
 */

// Request/Response Types
export type ReviewTaskStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'modifications_requested' 
  | 'applied';

export interface ApprovalChainStep {
  role: string;
  user_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  reviewed_at?: string;
}

export interface ReviewTask {
  id: string;
  org_id: string;
  user_id: string;
  file_path: string;
  old_code: string;
  new_code: string;
  description?: string | null;
  status: ReviewTaskStatus;
  reviewer_user_id?: string | null;
  review_comment?: string | null;
  approval_chain: ApprovalChainStep[];
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  applied_at?: string | null;
  metadata: Record<string, any>;
}

export interface SubmitPatchRequest {
  file_path: string;
  old_code: string;
  new_code: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface SubmitPatchResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface ApproveRequest {
  comment?: string;
}

export interface RejectRequest {
  comment: string;
}

export interface RequestModificationsRequest {
  comment: string;
}

/**
 * Submit an AI-generated patch for human review
 * POST /ai-review/submit
 */
export const submitPatchForReview = async (
  request: SubmitPatchRequest
): Promise<SubmitPatchResponse> => {
  try {
    const response = await fastapiClient.post<SubmitPatchResponse>(
      '/ai-review/submit',
      request
    );
    return response.data;
  } catch (error: any) {
    logger.error('Failed to submit patch for review:', error);
    throw error;
  }
};

/**
 * List all review tasks
 * GET /ai-review/tasks
 */
export const listReviewTasks = async (params?: {
  status?: ReviewTaskStatus;
  user_id?: string;
}): Promise<ReviewTask[]> => {
  try {
    const response = await fastapiClient.get<ReviewTask[]>(
      '/ai-review/tasks',
      { params }
    );
    return response.data;
  } catch (error: any) {
    logger.error('Failed to list review tasks:', error);
    throw error;
  }
};

/**
 * Get a single review task by ID
 * GET /ai-review/tasks/{task_id}
 */
export const getReviewTask = async (taskId: string): Promise<ReviewTask> => {
  try {
    const response = await fastapiClient.get<ReviewTask>(
      `/ai-review/tasks/${taskId}`
    );
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to get review task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Approve a review task
 * POST /ai-review/tasks/{task_id}/approve
 */
export const approveReviewTask = async (
  taskId: string,
  request: ApproveRequest = {}
): Promise<ReviewTask> => {
  try {
    const response = await fastapiClient.post<ReviewTask>(
      `/ai-review/tasks/${taskId}/approve`,
      request
    );
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to approve review task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Reject a review task
 * POST /ai-review/tasks/{task_id}/reject
 */
export const rejectReviewTask = async (
  taskId: string,
  request: RejectRequest
): Promise<ReviewTask> => {
  try {
    const response = await fastapiClient.post<ReviewTask>(
      `/ai-review/tasks/${taskId}/reject`,
      request
    );
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to reject review task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Request modifications for a review task
 * POST /ai-review/tasks/{task_id}/request-modifications
 */
export const requestModifications = async (
  taskId: string,
  request: RequestModificationsRequest
): Promise<ReviewTask> => {
  try {
    const response = await fastapiClient.post<ReviewTask>(
      `/ai-review/tasks/${taskId}/request-modifications`,
      request
    );
    return response.data;
  } catch (error: any) {
    logger.error(`Failed to request modifications for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get pending review tasks count (utility function)
 */
export const getPendingReviewCount = async (): Promise<number> => {
  try {
    const tasks = await listReviewTasks({ status: 'pending' });
    return tasks.length;
  } catch (error: any) {
    logger.error('Failed to get pending review count:', error);
    return 0;
  }
};

/**
 * Get review tasks by status (utility function)
 */
export const getReviewTasksByStatus = async (
  status: ReviewTaskStatus
): Promise<ReviewTask[]> => {
  try {
    return await listReviewTasks({ status });
  } catch (error: any) {
    logger.error(`Failed to get review tasks by status ${status}:`, error);
    throw error;
  }
};

