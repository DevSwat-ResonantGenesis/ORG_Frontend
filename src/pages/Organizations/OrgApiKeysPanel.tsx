import React, { useState } from 'react';
import { createOrgApiKey, revokeOrgApiKey } from '../../api/org';
import { logger } from '../../utils/logger';
import type { APIKey } from '../../types';

interface OrgApiKeysPanelProps {
  keys: APIKey[];
  onRefresh: () => void;
}

const OrgApiKeysPanel = ({ keys, onRefresh }: OrgApiKeysPanelProps) => {
  const [creating, setCreating] = useState(false);

  const createKey = async () => {
    setCreating(true);
    try {
      await createOrgApiKey('org key');
      onRefresh();
    } catch (error) {
      logger.error('Create org API key failed', error, { component: 'OrgApiKeysPanel' });
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    await revokeOrgApiKey(id);
    onRefresh();
  };

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>API Keys</h2>
        <button
          onClick={createKey}
          disabled={creating}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--color-primary-500)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            opacity: creating ? 0.6 : 1
          }}
        >
          + Create Key
        </button>
      </div>

      <table width="100%" style={{ marginTop: '16px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Key</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Created</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {keys.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No API keys yet.
              </td>
            </tr>
          )}
          {keys.map((key) => (
            <tr key={key.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>{key.name}</td>
              <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>{key.token || key.key || '—'}</td>
              <td style={{ padding: '12px' }}>{key.created_at}</td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => revokeKey(key.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--color-error)',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Revoke
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrgApiKeysPanel;
