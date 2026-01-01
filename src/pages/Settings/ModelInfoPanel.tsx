import React from 'react';

type ModelRecord = {
  id?: string;
  name?: string;
  version?: string;
  updated_at?: string;
};

type ModelInfoPanelProps = {
  models: ModelRecord[];
};

const ModelInfoPanel = ({ models }: ModelInfoPanelProps) => {
  return (
    <div
      style={{
        marginTop: '30px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px'
      }}
    >
      <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Model Versions</h2>

      {models.length === 0 ? (
        <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No model version info available.</div>
      ) : (
        <table width="100%" style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Model</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Version</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model, idx) => {
              const name = model?.name || `Model ${idx + 1}`;
              const version = model?.version || '—';
              const updatedAt = model?.updated_at || '—';
              return (
                <tr key={model?.id ?? `${name}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{name}</td>
                  <td style={{ padding: '12px' }}>{version}</td>
                  <td style={{ padding: '12px' }}>{updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModelInfoPanel;
