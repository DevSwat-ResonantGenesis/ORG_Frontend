import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import { fetchUsers, createUser, updateUser, deleteUser, suspendUser, reactivateUser, type User } from '../../api/users';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { ResponsiveTable } from '../../components/shared/ResponsiveTable';
import { EmptyState } from '../../components/shared/EmptyState';
import { logger } from '../../utils/logger';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', full_name: '', password: '', role: 'viewer' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data || []);
    } catch (err: any) {
      logger.error('Users load error', err, { component: 'UserManagementPage' });
      setError(err?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createUser(formData);
      setShowCreateModal(false);
      setFormData({ email: '', full_name: '', password: '', role: 'viewer' });
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, { full_name: formData.full_name, role: formData.role });
      setEditingUser(null);
      setFormData({ email: '', full_name: '', password: '', role: 'viewer' });
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendUser(id);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to suspend user');
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateUser(id);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reactivate user');
    }
  };

  const headerActions = (
    <Button size="md" onClick={() => setShowCreateModal(true)}>
      Create User
    </Button>
  );

  return (
    <ModernPageLayout
      title="Platform User Management"
      subtitle="Manage platform users, assign roles, suspend/reactivate accounts, and control access. Enterprise-grade user administration with role-based permissions and immutable audit logging with advanced verification for compliance."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={loadUsers}
      maxWidth="xl"
    >
      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="No users are currently registered on the platform."
          icon="👥"
        />
      ) : (
        <Card variant="elevated" padding="none">
          <ResponsiveTable
            columns={[
              {
                key: 'email',
                label: 'Email',
                render: (value) => <span>{String(value ?? '')}</span>
              },
              {
                key: 'full_name',
                label: 'Name',
                render: (value) => <span>{String(value || '—')}</span>
              },
              {
                key: 'role',
                label: 'Role',
                render: (value) => <span>{String(value || '—')}</span>
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => (
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: value === 'active' ? '#dcfce7' : '#fef3c7',
                      color: value === 'active' ? '#166534' : '#92400e',
                    }}
                  >
                    {String(value || 'active')}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (value, row) => (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingUser(row as unknown as User);
                        setFormData({ 
                          email: (row.email as string) || '', 
                          full_name: (row.full_name as string) || '', 
                          password: '', 
                          role: (row.role as string) || 'viewer' 
                        });
                      }}
                    >
                      Edit
                    </Button>
                    {(row.status as string) === 'active' ? (
                      <Button size="sm" variant="secondary" onClick={() => handleSuspend(row.id as string)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleReactivate(row.id as string)}>
                        Reactivate
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(row.id as string)}>
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={users as unknown as Record<string, unknown>[]}
          />
        </Card>
      )}

      {showCreateModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <Card variant="elevated" padding="lg" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <Card.Header>
              <Text variant="h2" color="primary">Create User</Text>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Full Name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div>
                  <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                    Role
                  </Text>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ 
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)', 
                      borderRadius: 'var(--border-radius-md)', 
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-surface)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="org_admin">Org Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {editingUser && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setEditingUser(null)}
        >
          <Card variant="elevated" padding="lg" style={{ maxWidth: '500px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <Card.Header>
              <Text variant="h2" color="primary">Edit User</Text>
            </Card.Header>
            <Card.Body>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Full Name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
                <div>
                  <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                    Role
                  </Text>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ 
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)', 
                      borderRadius: 'var(--border-radius-md)', 
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-surface)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="org_admin">Org Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button variant="secondary" onClick={() => setEditingUser(null)}>Cancel</Button>
                  <Button onClick={handleUpdate}>Update</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </ModernPageLayout>
  );
};

export default UserManagementPage;
