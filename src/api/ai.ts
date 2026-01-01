import fastapiClient from './fastapiClient';
import { logger } from '@/utils/logger';

export interface RefactorRequest {
  file_path: string;
  instruction: string;
  project_id?: string;
}

export interface RefactorResponse {
  old_code: string;
  new_code: string;
  changes_summary?: string;
}

export interface InlineFixRequest {
  file_path: string;
  line_number: number;
  code_snippet: string;
  issue_description?: string;
  project_id?: string;
}

export interface InlineFixResponse {
  fixed_code: string;
  explanation?: string;
}

/**
 * Request AI refactoring for a file
 */
export const requestRefactor = async (
  request: RefactorRequest
): Promise<RefactorResponse> => {
  try {
    const response = await fastapiClient.post<RefactorResponse>('/ai/refactor', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to request refactor', error);
    throw error;
  }
};

/**
 * Request inline code fix
 */
export const requestInlineFix = async (
  request: InlineFixRequest
): Promise<InlineFixResponse> => {
  try {
    const response = await fastapiClient.post<InlineFixResponse>('/ai/inline-fix', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to request inline fix', error);
    throw error;
  }
};

/**
 * Request code explanation
 */
export const requestExplanation = async (
  filePath: string,
  codeSnippet: string,
  projectId?: string
): Promise<string> => {
  try {
    const response = await fastapiClient.post<{ explanation: string }>('/ai/explain', {
      file_path: filePath,
      code_snippet: codeSnippet,
      project_id: projectId,
    });
    return response.data.explanation;
  } catch (error: any) {
    logger.error('Failed to request explanation', error);
    throw error;
  }
};

