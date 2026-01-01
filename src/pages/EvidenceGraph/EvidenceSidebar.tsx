import React from 'react';
import type { Prediction } from '../../api/predictions';

interface SelectedNode {
  id: string;
  label?: string;
  type?: string;
  description?: string;
}

interface EvidenceSidebarProps {
  prediction: Prediction | null;
  selected: SelectedNode | null;
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>{title}</div>
    {children}
  </div>
);

const EvidenceSidebar = ({ prediction, selected }: EvidenceSidebarProps) => {
  if (!prediction) {
    return <div style={{ width: 300 }}>No prediction data available.</div>;
  }

  const anchors = Array.isArray(prediction.anchors) ? prediction.anchors : [];
  const policies = Array.isArray(prediction.policies_triggered) 
    ? prediction.policies_triggered 
    : (Array.isArray(prediction.policies) ? prediction.policies : []);

  return (
    <div style={{ width: 300 }}>
      <Block title="Prediction">
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {prediction.input_text || prediction.input_excerpt || 'N/A'}
        </div>
        <div style={{ marginTop: 10, fontSize: 13 }}>
          <div>Validity: {(prediction.validity || 0).toFixed(2)}</div>
          <div>Risk (Entropy): {(prediction.entropy || 0).toFixed(3)}</div>
          {prediction.cluster && <div>Cluster: {prediction.cluster}</div>}
        </div>
      </Block>
      <Block title="Anchors">
        <div style={{ fontSize: 13 }}>
          {anchors.length > 0 ? anchors.join(', ') : 'None'}
        </div>
      </Block>
      <Block title="Policies Violated">
        <div style={{ fontSize: 13, color: policies.length > 0 ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
          {policies.length > 0 ? policies.join(', ') : 'None'}
        </div>
      </Block>
      {selected && (
        <Block title="Selected Node">
          <div style={{ fontSize: 14, fontWeight: 600 }}>{selected.label || selected.id}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Type: {selected.type || 'unknown'}</div>
          {selected.description && <div style={{ marginTop: 10, fontSize: 13 }}>{selected.description}</div>}
        </Block>
      )}
    </div>
  );
};

export default EvidenceSidebar;
