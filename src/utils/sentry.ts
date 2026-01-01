/**
 * Sentry Error Tracking Configuration
 * 
 * Initializes Sentry for frontend error tracking and performance monitoring.
 * 
 * Environment Variables Required:
 * - VITE_SENTRY_DSN: Sentry project DSN
 * - VITE_SENTRY_ENVIRONMENT: Environment name (development, production)
 * - VITE_SENTRY_TRACES_SAMPLE_RATE: Sample rate for performance traces (0.0-1.0)
 */

import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development";
const tracesSampleRate = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.1");

export const initSentry = () => {
  // Only initialize if DSN is provided
  if (!dsn) {
    // eslint-disable-next-line no-console
    // Intentional: Use console.warn before Sentry is initialized
    console.warn("Sentry DSN not provided. Error tracking disabled.");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      tracesSampleRate, // 10% of transactions by default
      beforeSend(event, hint) {
        // Filter out info-level events
        if (event.level === "info") {
          return null;
        }
        
        // Add custom context
        if (event.user) {
          event.user.ip_address = undefined; // Don't track IP
        }
        
        return event;
      },
      beforeBreadcrumb(breadcrumb) {
        // Filter out sensitive data
        if (breadcrumb.category === "console") {
          const message = breadcrumb.message || "";
          // Don't log sensitive patterns
          if (
            message.includes("password") ||
            message.includes("token") ||
            message.includes("api_key")
          ) {
            return null;
          }
        }
        return breadcrumb;
      },
    });

    // Log initialization in development only
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      // Intentional: Development logging after successful initialization
      console.info(`Sentry initialized for environment: ${environment}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    // Intentional: Use console.error here since Sentry isn't initialized yet
    console.error("Failed to initialize Sentry:", error);
  }
};

/**
 * Set user context for Sentry
 */
export const setSentryUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Capture message manually
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

