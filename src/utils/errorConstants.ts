/**
 * Error Constants
 * Centralized error code definitions for consistent error handling
 */

export const ERROR_BAD_REQUEST = 'BAD_REQUEST';
export const ERROR_UNAUTHORIZED = 'UNAUTHORIZED';
export const ERROR_FORBIDDEN = 'FORBIDDEN';
export const ERROR_NOT_FOUND = 'NOT_FOUND';
export const ERROR_CONFLICT = 'CONFLICT';
export const ERROR_RATE_LIMIT = 'RATE_LIMIT';
export const ERROR_SERVER_ERROR = 'SERVER_ERROR';
export const ERROR_NETWORK_ERROR = 'NETWORK_ERROR';
export const ERROR_TIMEOUT = 'TIMEOUT';

/**
 * HTTP Status Code to Error Constant Mapping
 */
export const STATUS_TO_ERROR: Record<number, string> = {
  400: ERROR_BAD_REQUEST,
  401: ERROR_UNAUTHORIZED,
  403: ERROR_FORBIDDEN,
  404: ERROR_NOT_FOUND,
  409: ERROR_CONFLICT,
  429: ERROR_RATE_LIMIT,
  500: ERROR_SERVER_ERROR,
  502: ERROR_SERVER_ERROR,
  503: ERROR_SERVER_ERROR,
};

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_BAD_REQUEST]: 'Please check your input and try again',
  [ERROR_UNAUTHORIZED]: 'Your session has expired. Please sign in again',
  [ERROR_FORBIDDEN]: 'You do not have permission to perform this action',
  [ERROR_NOT_FOUND]: 'The requested resource was not found',
  [ERROR_CONFLICT]: 'This resource already exists',
  [ERROR_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again',
  [ERROR_SERVER_ERROR]: 'A server error occurred. Please try again later',
  [ERROR_NETWORK_ERROR]: 'Network error. Please check your connection',
  [ERROR_TIMEOUT]: 'Request timed out. Please try again',
};

/**
 * FastAPI Validation Error Structure
 */
export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ParsedValidationError {
  field: string;
  message: string;
  type?: string;
}

/**
 * Parse FastAPI validation error format
 */
export const parseFastAPIValidationErrors = (
  detail: unknown
): ParsedValidationError[] => {
  if (!detail) return [];

  // FastAPI returns validation errors as an array
  if (Array.isArray(detail)) {
    return detail.map((err: FastAPIValidationError) => ({
      field: err.loc?.slice(1).join('.') || 'unknown', // Skip 'body' from loc
      message: err.msg || 'Validation error',
      type: err.type,
    }));
  }

  // Single string error
  if (typeof detail === 'string') {
    return [{ field: 'general', message: detail }];
  }

  return [];
};

