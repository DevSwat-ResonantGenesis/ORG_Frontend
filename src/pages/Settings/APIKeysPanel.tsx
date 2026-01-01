import React, { useState } from 'react';
import CreateAPIKeyModal from './CreateAPIKeyModal';
import DeleteAPIKeyModal from './DeleteAPIKeyModal';
import type { APIKey } from '../../types';

type APIKeysPanelProps = {
  keys: APIKey[];
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const APIKeysPanel = ({ keys, onCreate, onDelete }: APIKeysPanelProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>API Keys</h3>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: '#FFFFFF',
            color: '#000000',
            borderRadius: '0',
            padding: '10px 16px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.85';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          + Create Key
        </button>
      </div>

      <div className="table-container">
        <table width="100%" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>NAME</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>KEY</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>CREATED</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '16px' }}>
                  No API keys found.
                </td>
              </tr>
            ) : (
              keys.map((key) => {
                const keyId = key.id || key.key_id || key.api_key_id;
                const keyName = key.name || key.key_name || 'Unnamed Key';
                const keyValue = key.key || key.token || key.api_key || key.key_value || '—';
                const createdAt = key.created_at || key.created || key.created_at_iso || null;
                
                return (
                  <tr key={keyId || Math.random()} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-primary)' }}>{keyName}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {keyValue}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setDeleteId(keyId || null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '0',
                          border: '1px solid var(--border)',
                          background: '#FFFFFF',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.85';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateAPIKeyModal
          onClose={() => setShowCreate(false)}
          onSubmit={async (name) => {
            await onCreate(name);
            setShowCreate(false);
          }}
        />
      )}

      {deleteId && (
        <DeleteAPIKeyModal
          onClose={() => setDeleteId(null)}
          onConfirm={async () => {
            await onDelete(deleteId);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

export default APIKeysPanel;
