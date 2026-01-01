import React from 'react';

type DeleteAPIKeyModalProps = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

const DeleteAPIKeyModal = ({ onClose, onConfirm }: DeleteAPIKeyModalProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          background: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          padding: '20px'
        }}
      >
        <h3 style={{ marginBottom: '8px' }}>Delete API Key?</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          This action cannot be undone. Clients using this key will lose access immediately.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={async () => {
              await onConfirm();
            }}
            style={{
              background: 'var(--color-error)',
              color: '#fff',
              borderRadius: '6px',
              padding: '8px 14px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAPIKeyModal;
