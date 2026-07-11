// Modal for the IDE header's "Open Project" menu action - lists the
// user's existing Unify Workspaces (same GET /auth/user/workspaces used by
// WorkspaceSwitcher in the terminal panel) so opening a project here and
// switching workspace in the terminal always resolve to the same set.
import React, { useEffect, useState } from 'react';
import { fetchWorkspaces, createWorkspace, type Workspace } from '@/api/workspaces';
import { useToastContext } from '@/context/ToastContext';
import styles from './OpenProjectModal.module.css';

interface OpenProjectModalProps {
  onClose: () => void;
  onSelect: (workspaceId: string) => void;
}

export const OpenProjectModal: React.FC<OpenProjectModalProps> = ({ onClose, onSelect }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { error: showError } = useToastContext();

  useEffect(() => {
    fetchWorkspaces()
      .then(setWorkspaces)
      .catch((err) => showError(err?.response?.data?.detail || 'Failed to load projects'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    const title = prompt('Name this project:');
    if (!title?.trim()) return;
    setCreating(true);
    try {
      const workspace = await createWorkspace(title.trim());
      onSelect(workspace.id);
      onClose();
    } catch (err: any) {
      console.error('Failed to create project:', err);
      showError(err?.response?.data?.detail || 'Failed to create project. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>Open Project</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.list}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : workspaces.length === 0 ? (
            <div className={styles.empty}>No projects yet</div>
          ) : (
            workspaces.map((w) => (
              <button
                key={w.id}
                className={styles.item}
                onClick={() => {
                  onSelect(w.id);
                  onClose();
                }}
              >
                <span className={styles.itemTitle}>{w.title}</span>
                {w.lastActiveAt && (
                  <span className={styles.itemMeta}>
                    {new Date(w.lastActiveAt).toLocaleString()}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <button className={styles.newBtn} onClick={handleCreate} disabled={creating}>
          + New Project
        </button>
      </div>
    </div>
  );
};

export default OpenProjectModal;
