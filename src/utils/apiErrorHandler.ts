import logger from './logger';
import {
  ERROR_BAD_REQUEST,
  ERROR_SERVER_ERROR,
  ERROR_TIMEOUT,
  ERROR_NETWORK_ERROR,
  ERROR_MESSAGES,
  STATUS_TO_ERROR,
  parseFastAPIValidationErrors,
  type ParsedValidationError,
} from './errorConstants';

export interface APIError {
  error: string;
  message: string;
  status?: number;
  details?: ParsedValidationError[];
  originalError?: unknown;
}

/**
 * Enhanced API Error Handler
 * Parses errors and provides user-friendly messages
 */
export const apiErrorHandler = (error: unknown): APIError => {
  // Handle axios errors with response
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // Map status code to error constant
    const errorCode = status ? STATUS_TO_ERROR[status] || ERROR_BAD_REQUEST : ERROR_BAD_REQUEST;
    
    // Handle 400 Bad Request with FastAPI validation errors
    if (status === 400) {
      const detail = data?.detail;
      const validationErrors = parseFastAPIValidationErrors(detail);
      
      // If we have validation errors, format them nicely
      if (validationErrors.length > 0) {
        const firstError = validationErrors[0];
        return {
          error: ERROR_BAD_REQUEST,
          message: firstError.message || ERROR_MESSAGES[ERROR_BAD_REQUEST],
          status: 400,
          details: validationErrors,
          originalError: error,
        };
      }
      
      // Single string error from FastAPI
      if (typeof detail === 'string') {
        return {
          error: ERROR_BAD_REQUEST,
          message: detail,
          status: 400,
          originalError: error,
        };
      }
    }

    // Handle other status codes
    const message = data?.message || data?.detail || ERROR_MESSAGES[errorCode] || 'An error occurred';
    
    return {
      error: errorCode,
      message: typeof message === 'string' ? message : ERROR_MESSAGES[errorCode] || 'An error occurred',
      status,
      originalError: error,
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    logger.error('[API]', error);
    return {
      error: ERROR_SERVER_ERROR,
      message: error.message || ERROR_MESSAGES[ERROR_SERVER_ERROR],
      originalError: error,
    };
  }

  // Handle network/timeout errors
  if (error && typeof error === 'object' && 'code' in error) {
    const networkError = error as any;
    if (networkError.code === 'ECONNABORTED' || networkError.code === 'ETIMEDOUT') {
      return {
        error: ERROR_TIMEOUT,
        message: ERROR_MESSAGES[ERROR_TIMEOUT],
        originalError: error,
      };
    }
    if (networkError.code === 'ERR_NETWORK' || networkError.code === 'ECONNREFUSED') {
      return {
        error: ERROR_NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_NETWORK_ERROR],
        originalError: error,
      };
    }
  }

  // Fallback for unknown errors
  logger.error('[API] Unexpected error', error);
  return {
    error: ERROR_SERVER_ERROR,
    message: ERROR_MESSAGES[ERROR_SERVER_ERROR],
    originalError: error,
  };
};
