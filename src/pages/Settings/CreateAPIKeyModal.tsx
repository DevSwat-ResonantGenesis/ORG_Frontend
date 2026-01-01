import React, { useState } from 'react';

type CreateAPIKeyModalProps = {
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

const CreateAPIKeyModal = ({ onClose, onSubmit }: CreateAPIKeyModalProps) => {
  const [name, setName] = useState('');

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
          width: '400px',
          maxWidth: '90vw',
          background: 'var(--surface, #ffffff)',
          borderRadius: '8px',
          border: '1px solid var(--border, #e5e7eb)',
          padding: '24px',
          zIndex: 10001,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ 
          marginBottom: '16px', 
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary, #111827)'
        }}>
          Create API Key
        </h3>

        <label style={{ 
          fontSize: '14px', 
          color: 'var(--text-secondary, #374151)',
          display: 'block',
          marginBottom: '8px',
          fontWeight: 500
        }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border, #e5e7eb)',
            marginBottom: '20px',
            background: 'var(--surface, #ffffff)',
            color: 'var(--text-primary, #111827)',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Internal key name"
        />

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px', 
          marginTop: '20px' 
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: 'var(--text-secondary, #374151)',
              borderRadius: '6px',
              border: '1px solid var(--border, #e5e7eb)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (name.trim()) {
                await onSubmit(name);
                onClose();
              }
            }}
            style={{
              background: 'var(--color-primary, #111827)',
              color: '#fff',
              borderRadius: '6px',
              padding: '8px 16px',
              border: 'none',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 500,
              opacity: name.trim() ? 1 : 0.5
            }}
            disabled={!name.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAPIKeyModal;
