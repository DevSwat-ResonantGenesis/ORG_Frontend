import React, { useState } from 'react';
import { updateUserRole } from '../../api/org';
import logger from '../../utils/logger';

const OrgUserRoleModal = ({
  user,
  onClose,
  onComplete
}: {
  user: any;
  onClose: () => void;
  onComplete: () => void;
}) => {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await updateUserRole(user.id, role);
      onComplete();
    } catch (error) {
      logger.error('Role update failed', error);
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
          width: '360px',
          background: 'var(--surface)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Change Role</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{user.email}</p>

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

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgUserRoleModal;
