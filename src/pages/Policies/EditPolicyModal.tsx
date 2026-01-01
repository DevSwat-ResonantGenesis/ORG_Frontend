import { useState } from 'react';
import type { Policy } from '../../types';

interface EditPolicyPayload {
  threshold?: number;
  active?: boolean;
}

interface EditPolicyModalProps {
  policy: Policy;
  onClose: () => void;
  onSubmit: (payload: EditPolicyPayload) => void;
}

const EditPolicyModal = ({ policy, onClose, onSubmit }: EditPolicyModalProps) => {
  const [threshold, setThreshold] = useState(policy.threshold);
  const [active, setActive] = useState(policy.active);

  const submit = () => {
    onSubmit({ threshold: parseFloat(String(threshold)), active });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ width: 400, background: 'var(--surface)', borderRadius: 8, padding: 20, border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: 16 }}>Edit Policy</h3>
        <div style={{ marginBottom: 12 }}>
          <label>Threshold</label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
            style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 6 }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ marginRight: 10 }}>Active</label>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={submit} style={{ background: 'var(--color-primary-500)', padding: '8px 14px', color: '#fff', borderRadius: 6, border: 'none' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPolicyModal;
