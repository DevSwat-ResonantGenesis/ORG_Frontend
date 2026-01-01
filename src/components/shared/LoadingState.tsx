import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  fullPage = false
}) => {
  const containerStyle: React.CSSProperties = fullPage
    ? {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '64px 32px'
      }
    : {
        padding: '32px'
      };

  return (
    <div className="page-container" style={containerStyle}>
      <div style={{ 
        textAlign: 'center',
        width: '100%'
      }}>
        <div className="loading-spinner" style={{ 
          width: '48px',
          height: '48px',
          margin: '0 auto 24px',
          borderWidth: '4px'
        }}></div>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '16px',
          margin: 0
        }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingState;

