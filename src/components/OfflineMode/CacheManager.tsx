/**
 * Cache Manager Component
 * 
 * Manages project cache:
 * - List cached projects
 * - Sync project
 * - View cache statistics
 * - Clear cache
 */

import React, { useState, useEffect } from 'react';
import styles from './CacheManager.module.css';

interface CacheStats {
  projectCount: number;
  totalFiles: number;
  totalSize: number;
}

interface CachedProject {
  projectId: string;
  fileCount?: number;
  size?: number;
}

export const CacheManager: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [projects, setProjects] = useState<CachedProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncPath, setSyncPath] = useState<string>('');
  const [syncProjectId, setSyncProjectId] = useState<string>('');

  useEffect(() => {
    if (!window.electron) {
      setLoading(false);
      return;
    }

    loadStats();
  }, []);

  const loadStats = async () => {
    if (!window.electron) return;

    try {
      const response = await window.electron.cache.getStats();
      if (response.success) {
        setStats({
          projectCount: response.projectCount || 0,
          totalFiles: response.totalFiles || 0,
          totalSize: response.totalSize || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!syncProjectId || !syncPath || !window.electron) {
      return;
    }

    setSyncing(syncProjectId);
    try {
      const response = await window.electron.cache.syncProject(syncProjectId, syncPath);
      if (response.success) {
        setSyncPath('');
        setSyncProjectId('');
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to sync project:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleClearProject = async (projectId: string) => {
    if (!window.electron || !confirm(`Clear cache for project "${projectId}"?`)) {
      return;
    }

    try {
      const response = await window.electron.cache.clearProject(projectId);
      if (response.success) {
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to clear project cache:', error);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!window.electron) {
    return (
      <div className={styles.container}>
        <div className={styles.notElectron}>
          Cache manager is only available in the Electron desktop application.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Project Cache Manager</h3>
        <p className={styles.subtitle}>Manage cached project files</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.projectCount}</div>
            <div className={styles.statLabel}>Cached Projects</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{stats.totalFiles}</div>
            <div className={styles.statLabel}>Total Files</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{formatSize(stats.totalSize)}</div>
            <div className={styles.statLabel}>Total Size</div>
          </div>
        </div>
      )}

      {/* Sync Project */}
      <div className={styles.syncSection}>
        <h4>Sync Project</h4>
        <div className={styles.syncForm}>
          <input
            type="text"
            value={syncProjectId}
            onChange={(e) => setSyncProjectId(e.target.value)}
            placeholder="Project ID"
            className={styles.input}
          />
          <input
            type="text"
            value={syncPath}
            onChange={(e) => setSyncPath(e.target.value)}
            placeholder="/path/to/project"
            className={styles.input}
          />
          <button
            onClick={handleSync}
            disabled={!syncProjectId || !syncPath || syncing !== null}
            className={styles.syncButton}
          >
            {syncing ? 'Syncing...' : 'Sync Project'}
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className={styles.projectsSection}>
        <h4>Cached Projects</h4>
        {stats && stats.projectCount === 0 ? (
          <div className={styles.emptyState}>
            No projects cached yet. Sync a project to get started.
          </div>
        ) : (
          <div className={styles.projectsList}>
            {projects.map((project) => (
              <div key={project.projectId} className={styles.projectItem}>
                <div className={styles.projectInfo}>
                  <div className={styles.projectId}>{project.projectId}</div>
                  {project.fileCount !== undefined && (
                    <div className={styles.projectMeta}>
                      {project.fileCount} files
                      {project.size !== undefined && ` • ${formatSize(project.size)}`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleClearProject(project.projectId)}
                  className={styles.clearButton}
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

