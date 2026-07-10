/**
 * A workspace is a persistent, titled project identity shared across the
 * IDE, sandboxed terminal, Builder, and Agent OS - opening any of those
 * surfaces for the same workspace reconnects to the same terminal
 * container and file set, even after logout or on a different device
 * (see RG_Auth's Workspace model).
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
  type Workspace,
} from '@/api/workspaces';
// Reuse the BYOK panel's styling - same generic form/list/card patterns.
import styles from '../ApiKeyManager/ApiKeyManager.module.css';

export interface WorkspaceManagerProps {
  onSelect?: (workspace: Workspace) => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ onSelect }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setWorkspaces(await fetchWorkspaces());
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!titleInput.trim()) {
      setError('Please enter a title');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const workspace = await createWorkspace(titleInput.trim());
      setWorkspaces([workspace, ...workspaces]);
      setShowAddForm(false);
      setTitleInput('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workspaceId: string) => {
    if (!confirm('Delete this workspace? Its terminal and files stay reachable by id, but it disappears from this list.')) return;
    try {
      await deleteWorkspace(workspaceId);
      setWorkspaces(workspaces.filter((w) => w.id !== workspaceId));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete workspace');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {workspaces.length > 0 && (
        <div className={styles.keysList}>
          {workspaces.map((w) => (
            <div key={w.id} className={styles.keyItem}>
              <div className={styles.keyInfo} onClick={() => onSelect?.(w)} style={onSelect ? { cursor: 'pointer' } : undefined}>
                <div className={styles.keyProvider}>{w.title}</div>
                <div className={styles.keyPrefix}>
                  <code>{w.id}</code>
                </div>
                {w.lastActiveAt && (
                  <div className={styles.keyUsage}>Last active {new Date(w.lastActiveAt).toLocaleString()}</div>
                )}
              </div>
              <button className={styles.deleteButton} onClick={() => handleDelete(w.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddForm ? (
        <div className={styles.addForm}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="e.g., Personal website"
              className={styles.input}
            />
          </div>
          <div className={styles.formActions}>
            <Button variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={saving || !titleInput.trim()}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)} className={styles.addButton}>
          + New workspace
        </Button>
      )}
    </div>
  );
};

export default WorkspaceManager;
