/**
 * Centralized logging utility
 * Uses Sentry for error tracking and provides development console logging
 */

import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log debug messages (development only)
   * Note: Uses console.debug intentionally - this is the logger implementation itself
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log info messages (development only)
   * Note: Uses console.info intentionally - this is the logger implementation itself
   */
  info(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log warnings (development console + Sentry)
   * Note: Uses console.warn intentionally - this is the logger implementation itself
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, context);
    }
    Sentry.captureMessage(message, 'warning');
    if (context) {
      Sentry.setContext('warning_context', context);
    }
  }

  /**
   * Log errors (Sentry + development console)
   * Note: Uses console.error intentionally - this is the logger implementation itself
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, error, context);
    }

    if (error instanceof Error) {
      if (context) {
        Sentry.withScope((scope) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, { [key]: value });
          });
          Sentry.captureException(error);
        });
      } else {
        Sentry.captureException(error);
      }
    } else {
      Sentry.captureMessage(message, 'error');
      if (context) {
        Sentry.setContext('error_context', context);
      }
    }
  }

  /**
   * Log API errors with context
   */
  apiError(endpoint: string, error: Error | unknown, context?: Record<string, unknown>): void {
    const errorContext = {
      endpoint,
      ...context,
    };

    if (error instanceof Error) {
      this.error(`API Error: ${endpoint}`, error, errorContext);
    } else {
      this.error(`API Error: ${endpoint}`, new Error(String(error)), errorContext);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for convenience
export default logger;

