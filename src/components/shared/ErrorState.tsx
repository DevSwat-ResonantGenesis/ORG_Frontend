import React from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load data',
  message,
  onRetry,
  retryLabel = 'Retry',
  icon = '⚠️'
}) => {
  return (
    <div className="page-container">
      <div className="page-card" style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        textAlign: 'center',
        padding: '64px 32px'
      }}>
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '24px',
          lineHeight: 1
        }}>
          {icon}
        </div>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--text-primary)'
        }}>
          {title}
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '16px',
          lineHeight: 1.6,
          marginBottom: '32px',
          maxWidth: '480px',
          margin: '0 auto 32px'
        }}>
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} style={{ minWidth: '140px' }}>
            {retryLabel}
          </Button>
        )}
        <div style={{ 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ 
            fontSize: '13px', 
            color: 'var(--text-tertiary)',
            marginBottom: '12px'
          }}>
            Common solutions:
          </p>
          <ul style={{ 
            fontSize: '13px', 
            color: 'var(--text-tertiary)',
            textAlign: 'left',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.8
          }}>
            <li>Check your internet connection</li>
            <li>Wait a moment and try again (rate limiting may be active)</li>
            <li>Refresh the page</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;

