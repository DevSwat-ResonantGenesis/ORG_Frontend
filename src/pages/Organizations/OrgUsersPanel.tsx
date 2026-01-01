import React, { useState } from 'react';
import OrgInviteModal from './OrgInviteModal';
import OrgUserRoleModal from './OrgUserRoleModal';
import type { User } from '../../types';

interface OrgUsersPanelProps {
  users: User[];
  onRefresh: () => void;
}

const OrgUsersPanel = ({ users, onRefresh }: OrgUsersPanelProps) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Users</h2>
        <button
          onClick={() => setInviteOpen(true)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--color-primary-500)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          + Invite User
        </button>
      </div>

      <table width="100%" style={{ marginTop: '16px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users found.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>{user.email}</td>
              <td style={{ padding: '12px' }}>{user.role}</td>
              <td style={{ padding: '12px' }}>{user.status || 'active'}</td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => setSelectedUser(user)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    cursor: 'pointer'
                  }}
                >
                  Change Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inviteOpen && (
        <OrgInviteModal
          onClose={() => setInviteOpen(false)}
          onComplete={() => {
            setInviteOpen(false);
            onRefresh();
          }}
        />
      )}

      {selectedUser && (
        <OrgUserRoleModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onComplete={() => {
            setSelectedUser(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default OrgUsersPanel;
