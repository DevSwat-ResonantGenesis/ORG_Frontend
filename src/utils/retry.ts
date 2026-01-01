/**
 * Retry utility with exponential backoff
 * Used for API calls that may fail due to transient errors
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, rate limit, server errors
  retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'],
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any, options: Required<RetryOptions>): boolean {
  // Check status code
  const status = error?.response?.status;
  if (status && options.retryableStatuses.includes(status)) {
    return true;
  }

  // Check error code
  const code = error?.code;
  if (code && options.retryableErrors.includes(code)) {
    return true;
  }

  // Check if it's a network error
  if (error?.message && (
    error.message.includes('Network Error') ||
    error.message.includes('timeout') ||
    error.message.includes('Failed to fetch')
  )) {
    return true;
  }

  return false;
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error, opts)) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Retry decorator for async functions
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

