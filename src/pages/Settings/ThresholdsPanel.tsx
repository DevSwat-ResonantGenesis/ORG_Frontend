import React, { useState } from 'react';

type Thresholds = {
  validity: number;
  entropy: number;
  anchor_prob: number;
};

type ThresholdsPanelProps = {
  thresholds: Thresholds;
  onUpdate: (payload: Thresholds) => Promise<void>;
};

const ThresholdsPanel = ({ thresholds, onUpdate }: ThresholdsPanelProps) => {
  const [validity, setValidity] = useState(thresholds.validity);
  const [entropy, setEntropy] = useState(thresholds.entropy);
  const [anchorProb, setAnchorProb] = useState(thresholds.anchor_prob);

  const handleSave = async () => {
    await onUpdate({ validity, entropy, anchor_prob: anchorProb });
  };

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
      <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Model Thresholds</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px', maxWidth: '420px' }}>
        <div>
          <label style={{ color: 'var(--text-secondary)' }}>Minimum Validity</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={validity}
            onChange={(e) => setValidity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{ color: 'var(--text-secondary)' }}>Maximum Entropy (Risk)</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={entropy}
            onChange={(e) => setEntropy(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{ color: 'var(--text-secondary)' }}>Minimum Anchor Probability</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={anchorProb}
            onChange={(e) => setAnchorProb(parseFloat(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '6px',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--color-primary-500)',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Save Thresholds
        </button>
      </div>
    </div>
  );
};

export default ThresholdsPanel;
