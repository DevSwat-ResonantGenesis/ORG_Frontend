import React from 'react';

interface PanelSkeletonProps {
  title?: string;
}

export const PanelSkeleton: React.FC<PanelSkeletonProps> = ({ title }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      {/* Header Skeleton */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          }} />
          <div style={{
            width: '120px',
            height: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          }} />
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: '60px',
              height: '28px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
            }} />
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div style={{
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }} />
              <div style={{
                width: '150px',
                height: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
              }} />
              <div style={{
                width: '60px',
                height: '18px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '4px',
                marginLeft: 'auto',
              }} />
            </div>
            <div style={{
              display: 'flex',
              gap: '16px',
            }}>
              {[1, 2, 3].map(j => (
                <div key={j} style={{
                  width: '80px',
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default PanelSkeleton;
