import React from 'react';

type MetadataModalProps = {
  data: Record<string, unknown>;
  onClose: () => void;
};

const MetadataModal = ({ data, onClose }: MetadataModalProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '500px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          padding: '20px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Metadata</h3>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: 'var(--surface)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text-primary)'
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
        <div style={{ textAlign: 'right', marginTop: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--color-primary-500)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;
