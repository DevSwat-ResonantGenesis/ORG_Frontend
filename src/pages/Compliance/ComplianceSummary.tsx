import React from 'react';

type Summary = {
  hipaa_violations: number;
  risky_predictions: number;
  low_validity_count: number;
  anchor_coverage: number;
};

const Block = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div
    style={{
      background: 'var(--surface)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      padding: '20px',
      minWidth: '160px'
    }}
  >
    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</div>
    <div style={{ fontSize: '26px', fontWeight: 600 }}>{value}</div>
  </div>
);

const ComplianceSummary = ({ summary }: { summary: Summary }) => {
  if (!summary) return null;

  return (
    <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
      <Block label="HIPAA Violations" value={summary.hipaa_violations} />
      <Block label="Risky Predictions" value={summary.risky_predictions} />
      <Block label="Low Validity Count" value={summary.low_validity_count} />
      <Block label="Anchor Coverage %" value={`${(summary.anchor_coverage * 100).toFixed(1)}%`} />
    </div>
  );
};

export default ComplianceSummary;
