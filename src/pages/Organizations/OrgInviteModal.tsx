import React, { useState } from 'react';
import { inviteUser } from '../../api/org';
import logger from '../../utils/logger';

const OrgInviteModal = ({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      await inviteUser(email.trim(), role);
      onComplete();
    } catch (error) {
      logger.error('Invite failed', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '380px',
          background: 'var(--surface)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Invite User</h3>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@company.com"
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border)'
          }}
        />

        <label style={{ marginTop: '14px', display: 'block' }}>Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border)'
          }}
        >
          <option value="viewer">Viewer</option>
          <option value="analyst">Analyst</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>

        <div style={{ marginTop: '20px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 14px' }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{
              padding: '8px 14px',
              background: 'var(--color-primary-500)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgInviteModal;
