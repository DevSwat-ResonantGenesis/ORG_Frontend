// Dropdown in the terminal panel letting a user switch between their OWN
// workspaces (never other users' - GET /auth/user/workspaces is already
// scoped server-side to the logged-in account) so they can always
// continue on a given project's terminal/files instead of losing track
// of which session belongs to which project.
import React, { useEffect, useRef, useState } from 'react';
import { fetchWorkspaces, createWorkspace, type Workspace } from '@/api/workspaces';
import styles from './WorkspaceSwitcher.module.css';

interface WorkspaceSwitcherProps {
  activeProjectId?: string;
  onSelect: (workspaceId: string) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ activeProjectId, onSelect }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces().then(setWorkspaces).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = workspaces.find((w) => w.id === activeProjectId);

  const handleCreate = async () => {
    const title = prompt('Name this workspace:');
    if (!title?.trim()) return;
    setCreating(true);
    try {
      const workspace = await createWorkspace(title.trim());
      setWorkspaces([workspace, ...workspaces]);
      onSelect(workspace.id);
      setOpen(false);
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button className={styles.trigger} onClick={() => setOpen(!open)} title="Switch workspace">
        <span className={styles.triggerLabel}>{active?.title || 'No workspace'}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 3.5L5 6.5L8 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {workspaces.map((w) => (
            <button
              key={w.id}
              className={`${styles.item} ${w.id === activeProjectId ? styles.itemActive : ''}`}
              onClick={() => {
                onSelect(w.id);
                setOpen(false);
              }}
            >
              {w.id === activeProjectId && <span className={styles.checkmark}>✓</span>}
              {w.title}
            </button>
          ))}
          {workspaces.length === 0 && <div className={styles.empty}>No workspaces yet</div>}
          <button className={styles.newItem} onClick={handleCreate} disabled={creating}>
            + New workspace
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
