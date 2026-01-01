import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@/utils/sentry';
import logger from '@/utils/logger';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches React component errors and reports them to Sentry.
 * Provides a user-friendly error message.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '32px',
          textAlign: 'center',
          background: 'var(--bg)',
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '48px',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--color-error)',
              marginBottom: '16px',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}>
              We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
            </p>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details style={{
                marginBottom: '24px',
                padding: '16px',
                background: 'var(--surface)',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '12px',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button onClick={this.handleReset}>
                Go to Home
              </Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
