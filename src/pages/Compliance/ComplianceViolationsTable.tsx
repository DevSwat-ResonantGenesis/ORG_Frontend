import React from 'react';

type Prediction = {
  id: string;
  external_id?: string | null;
  input_text?: string;
  validity: number;
  entropy: number;
  policies?: string[];
  policies_triggered?: string[];
  created_at?: string;
  timestamp?: string;
};

const ComplianceViolationsTable = ({ predictions = [] }: { predictions?: Prediction[] }) => {
  const safePredictions = Array.isArray(predictions) ? predictions : [];
  const risky = safePredictions.filter((p) => (p.entropy || 0) > 0.6 || (p.policies_triggered && p.policies_triggered.length > 0));

  return (
    <div
      style={{
        marginTop: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px'
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>Violations &amp; High-Risk Predictions</h3>
      <table width="100%">
        <thead>
          <tr>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Input</th>
            <th style={{ padding: '12px' }}>Validity</th>
            <th style={{ padding: '12px' }}>Risk</th>
            <th style={{ padding: '12px' }}>Policies</th>
          </tr>
        </thead>
        <tbody>
          {risky.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>{p.id}</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                {p.external_id ? p.external_id.slice(0, 60) : (p.id ? p.id.slice(0, 60) : 'N/A')}…
              </td>
              <td style={{ padding: '12px' }}>{(p.validity || 0).toFixed(2)}</td>
              <td
                style={{
                  padding: '12px',
                  fontWeight: 600,
                  color: (p.entropy || 0) > 0.6 ? 'var(--color-error)' : 'var(--text-primary)'
                }}
              >
                {(p.entropy || 0).toFixed(2)}
              </td>
              <td
                style={{
                  padding: '12px',
                  color: (p.policies_triggered && p.policies_triggered.length) ? 'var(--color-warning)' : 'var(--text-secondary)'
                }}
              >
                {(p.policies_triggered && p.policies_triggered.length) ? p.policies_triggered.join(', ') : '—'}
              </td>
            </tr>
          ))}
          {risky.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>
                No policy violations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComplianceViolationsTable;
