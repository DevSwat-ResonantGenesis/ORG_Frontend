import React from 'react';

interface OrgUsageData {
  predictions?: number;
  compliance?: number;
  policy_triggers?: number;
}

interface OrgUsagePanelProps {
  usage?: OrgUsageData;
}

const OrgUsagePanel = ({ usage }: OrgUsagePanelProps) => {
  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}
    >
      <h2 style={{ marginTop: 0 }}>Usage &amp; Quotas</h2>
      <div style={{ marginTop: '10px', fontSize: '14px' }}>
        <div>Predictions This Month: {usage?.predictions ?? 0}</div>
        <div>Compliance Checks: {usage?.compliance ?? 0}</div>
        <div>Policy Triggers: {usage?.policy_triggers ?? 0}</div>
      </div>
    </div>
  );
};

export default OrgUsagePanel;
