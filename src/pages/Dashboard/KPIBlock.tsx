import React from 'react';

const KPIBlock = ({ title, value }: { title: string; value: string | number }) => (
  <div
    style={{
      background: 'var(--surface-alt)',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      minWidth: 180,
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.transform = '';
    }}
  >
    <div style={{ 
      fontSize: '13px', 
      color: 'var(--text-muted)', 
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 500,
    }}>
      {title}
    </div>
    <div style={{ 
      fontSize: '32px', 
      fontWeight: 700, 
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
  </div>
);

export default KPIBlock;
