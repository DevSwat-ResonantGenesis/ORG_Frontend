import { useState } from 'react';
import type { Policy } from '../../types';

interface CreatePolicyPayload {
  name: string;
  rule_type: string;
  threshold: number;
}

interface CreatePolicyModalProps {
  onClose: () => void;
  onSubmit: (payload: CreatePolicyPayload) => void;
}

const CreatePolicyModal = ({ onClose, onSubmit }: CreatePolicyModalProps) => {
  const [name, setName] = useState('');
  const [ruleType, setRuleType] = useState('missing_anchor');
  const [threshold, setThreshold] = useState(0.5);

  const submit = () => {
    onSubmit({ name, rule_type: ruleType, threshold: parseFloat(String(threshold)) });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 }}>
      <div style={{ width: 500, background: 'var(--surface)', borderRadius: '0', padding: '32px', border: '1px solid var(--border)', maxWidth: '90vw' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>Create New Policy</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '0', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '14px' }} 
              placeholder="Enter policy name"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Rule Type</label>
            <select 
              value={ruleType} 
              onChange={(e) => setRuleType(e.target.value)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '0', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '14px' }}
            >
              <option value="missing_anchor">Missing Anchor</option>
              <option value="forbidden_word">Forbidden Word</option>
              <option value="low_validity">Low Validity</option>
              <option value="high_risk">High Risk</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>Threshold</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              max="1" 
              value={threshold} 
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)} 
              style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: '0', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: '14px' }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              onClick={onClose}
              style={{ 
                padding: '10px 20px', 
                background: 'transparent', 
                border: '1px solid var(--border)', 
                color: 'var(--text-primary)', 
                borderRadius: '0', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 400,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button 
              onClick={submit} 
              style={{ 
                padding: '10px 20px', 
                background: '#FFFFFF', 
                color: '#000000', 
                borderRadius: '0', 
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 400,
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Create Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePolicyModal;
