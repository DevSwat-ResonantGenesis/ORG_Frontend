import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

/**
 * LSP (Language Server Protocol) API Client
 * Provides code intelligence features: completion, definition, references, hover
 */

export interface LSPCompletionRequest {
  project_id: string;
  file_path: string;
  language: string;
  line: number;
  character: number;
  content: string;
}

export interface LSPCompletionItem {
  label: string;
  kind: number;
  detail?: string;
  documentation?: string | { value: string };
  insertText?: string;
  textEdit?: {
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    newText: string;
  };
}

export interface LSPLocation {
  uri: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

export interface LSPHover {
  contents: string | { value: string } | Array<string | { value: string }>;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

/**
 * Get code completions
 * POST /code/lsp/completion
 */
export const getLSPCompletion = async (
  request: LSPCompletionRequest
): Promise<{ completions: LSPCompletionItem[] }> => {
  try {
    const response = await fastapiClient.post('/code/lsp/completion', request);
    return response.data;
  } catch (error) {
    logger.error('LSP completion error', error);
    throw error;
  }
};

/**
 * Get definition location
 * POST /code/lsp/definition
 */
export const getLSPDefinition = async (
  request: Omit<LSPCompletionRequest, 'content'> & { content: string }
): Promise<{ definition: LSPLocation | null }> => {
  try {
    const response = await fastapiClient.post('/code/lsp/definition', request);
    return response.data;
  } catch (error) {
    logger.error('LSP definition error', error);
    throw error;
  }
};

/**
 * Get symbol references
 * POST /code/lsp/references
 */
export const getLSPReferences = async (
  request: Omit<LSPCompletionRequest, 'content'> & { content: string }
): Promise<{ references: LSPLocation[] }> => {
  try {
    const response = await fastapiClient.post('/code/lsp/references', request);
    return response.data;
  } catch (error) {
    logger.error('LSP references error', error);
    throw error;
  }
};

/**
 * Get hover information
 * POST /code/lsp/hover
 */
export const getLSPHover = async (
  request: Omit<LSPCompletionRequest, 'content'> & { content: string }
): Promise<{ hover: LSPHover | null }> => {
  try {
    const response = await fastapiClient.post('/code/lsp/hover', request);
    return response.data;
  } catch (error) {
    logger.error('LSP hover error', error);
    throw error;
  }
};

