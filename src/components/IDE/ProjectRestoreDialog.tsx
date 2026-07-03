import { restoreProject, restoreProjectByCryptoHash } from '@/api/code';
import { logger } from '@/utils/logger';
import React, { useState } from 'react';
import styles from './ProjectRestoreDialog.module.css';

interface ProjectRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRestored: (projectId: string) => void;
}

export const ProjectRestoreDialog: React.FC<ProjectRestoreDialogProps> = ({
  isOpen,
  onClose,
  onRestored,
}) => {
  const [projectHash, setProjectHash] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = async () => {
    if (!projectHash.trim()) {
      setError('Please enter a Hash Sphere hash');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (mnemonic.trim()) {
        result = await restoreProjectByCryptoHash(projectHash.trim(), mnemonic.trim());
      } else {
        result = await restoreProject(projectHash.trim());
      }

      console.log('✅ Restore result:', result);

      alert(`Project restored successfully!\n\nNew Project ID: ${result.project_id}\n${result.restored_files_count} files restored.`);

      // Clear form and close
      setProjectHash('');
      setMnemonic('');
      onRestored(result.project_id);
      onClose();
    } catch (error: any) {
      logger.error('Failed to restore project', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || error?.message || 'Failed to restore project';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Restore Archived Project</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Enter the Hash Sphere hash of the archived project to restore it.
            The project will be restored with a new project ID.
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="projectHash">Hash Sphere Hash:</label>
            <input
              id="projectHash"
              type="text"
              value={projectHash}
              onChange={(e) => setProjectHash(e.target.value)}
              placeholder="Enter hash (e.g., sha256:abc123...)"
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
            <label htmlFor="mnemonic">Mnemonic Phrase (Required for encrypted projects):</label>
            <textarea
              id="mnemonic"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your 12-word mnemonic phrase..."
              className={styles.input}
              disabled={loading}
              style={{ minHeight: '80px', fontFamily: 'monospace' }}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.restoreButton}
            onClick={handleRestore}
            disabled={loading || !projectHash.trim()}
          >
            {loading ? 'Restoring...' : 'Restore Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

