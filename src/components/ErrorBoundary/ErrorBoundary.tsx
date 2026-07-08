/**
 * Error Boundary - Catch and display errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, Bug, Copy } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service (e.g., Sentry)
    this.reportError(error, errorInfo);
  }

  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      // Silently fail - don't cause another error
      console.warn('Failed to report error:', e);
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  handleCopyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    const { hasError, error, errorInfo, showDetails, copied } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div style={{ maxWidth: '500px', margin: '64px auto', padding: '0 16px' }}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
              
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>
              Oops! Something went wrong
            </h2>
              
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
              We're sorry, but something unexpected happened. Our team has been notified
              and is working to fix the issue.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              <button
                onClick={this.handleRefresh}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #4b5563', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Home size={16} /> Go Home
              </button>
            </div>

            <button
              onClick={this.handleToggleDetails}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto', background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer' }}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
              <ChevronDown size={16} style={{ transform: showDetails ? 'rotate(180deg)' : 'none' }} />
            </button>

            {showDetails && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#0f0f1a', borderRadius: '8px', textAlign: 'left', overflow: 'auto', maxHeight: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444', fontWeight: 500 }}>{error?.message}</span>
                  <button onClick={this.handleCopyError} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <span style={{ color: '#22c55e', fontSize: '12px' }}>Copied to clipboard!</span>}
                <pre style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#9ca3af' }}>
                  {error?.stack}
                </pre>
                {errorInfo?.componentStack && (
                  <>
                    <strong style={{ color: '#fff', display: 'block', marginTop: '16px' }}>Component Stack:</strong>
                    <pre style={{ fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', color: '#9ca3af' }}>
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <a
                href={`mailto:support@dev-swat.com?subject=Bug Report&body=${encodeURIComponent(
                  `Error: ${error?.message}\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`
                )}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#9ca3af', textDecoration: 'none' }}
              >
                <Bug size={16} /> Report This Issue
              </a>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

/**
 * Hook version for functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    console.error('Error handled:', err);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

/**
 * 404 Not Found Page
 */
export function NotFoundPage() {
  return (
    <div style={{ maxWidth: '500px', margin: '64px auto', padding: '0 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '8rem', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>404</h1>
      <h2 style={{ color: '#fff', marginBottom: '8px' }}>Page Not Found</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', textDecoration: 'none' }}>
          <Home size={16} /> Go Home
        </a>
        <button onClick={() => window.history.back()} style={{ padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #4b5563', borderRadius: '8px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    </div>
  );
}

/**
 * 500 Server Error Page
 */
export function ServerErrorPage() {
  return (
    <div style={{ maxWidth: '500px', margin: '64px auto', padding: '0 16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '8rem', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>500</h1>
      <h2 style={{ color: '#fff', marginBottom: '8px' }}>Server Error</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Something went wrong on our end. We're working to fix it.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <RefreshCw size={16} /> Try Again
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid #4b5563', borderRadius: '8px', textDecoration: 'none' }}>
          <Home size={16} /> Go Home
        </a>
      </div>
    </div>
  );
}

/**
 * Maintenance Page
 */
export function MaintenancePage() {
  return (
    <div style={{ maxWidth: '500px', margin: '64px auto', padding: '0 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔧</div>
      <h2 style={{ color: '#fff', marginBottom: '8px' }}>Under Maintenance</h2>
      <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
        We're performing scheduled maintenance. We'll be back shortly.
      </p>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        Expected completion: Check our status page for updates.
      </p>
    </div>
  );
}
