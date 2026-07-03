// ============== WORKSPACE MANAGER ==============
// Multi-project workspace management with recent projects

import React, { memo, useState, useCallback } from 'react';
import styles from './WorkspaceManager.module.css';

interface Project {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'git' | 'remote';
  language?: string;
  lastOpened: Date;
  isFavorite?: boolean;
  description?: string;
  stats?: {
    files: number;
    lines: number;
    size: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  projects: Project[];
  createdAt: Date;
  isActive: boolean;
}

interface WorkspaceManagerProps {
  workspaces?: Workspace[];
  currentProject?: Project;
  onOpenProject?: (project: Project) => void;
  onCreateProject?: () => void;
  onCloneRepo?: (url: string) => void;
  onOpenFolder?: () => void;
  className?: string;
}

const mockProjects: Project[] = [
  { id: '1', name: 'ResonantGraphAI', path: '/Applications/ResonantGraphAI_FrontendV0.1', type: 'git', language: 'TypeScript', lastOpened: new Date(), isFavorite: true, stats: { files: 245, lines: 42000, size: '12.5 MB' } },
  { id: '2', name: 'Backend API', path: '/Users/devswat/resonantgenesis_backend', type: 'git', language: 'Python', lastOpened: new Date(Date.now() - 3600000), stats: { files: 180, lines: 28000, size: '8.2 MB' } },
  { id: '3', name: 'Mobile App', path: '/Users/devswat/mobile-app', type: 'folder', language: 'React Native', lastOpened: new Date(Date.now() - 86400000) },
  { id: '4', name: 'Design System', path: '/Users/devswat/design-system', type: 'folder', language: 'TypeScript', lastOpened: new Date(Date.now() - 172800000) },
];

const WorkspaceManagerComponent: React.FC<WorkspaceManagerProps> = ({
  workspaces = [],
  currentProject,
  onOpenProject,
  onCreateProject,
  onCloneRepo,
  onOpenFolder,
  className,
}) => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'favorite'>('recent');
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorite' | 'git'>('all');

  const toggleFavorite = useCallback((projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  }, []);

  const removeProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const handleClone = useCallback(() => {
    if (cloneUrl.trim()) {
      onCloneRepo?.(cloneUrl);
      setCloneUrl('');
      setShowCloneModal(false);
    }
  }, [cloneUrl, onCloneRepo]);

  const getLanguageIcon = (lang?: string) => {
    switch (lang?.toLowerCase()) {
      case 'typescript': return '🔷';
      case 'javascript': return '🟨';
      case 'python': return '🐍';
      case 'react native': return '📱';
      case 'rust': return '🦀';
      case 'go': return '🐹';
      default: return '📁';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'git': return '⎇';
      case 'remote': return '☁️';
      default: return '📂';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const filteredProjects = projects
    .filter(p => {
      if (filter === 'favorite' && !p.isFavorite) return false;
      if (filter === 'git' && p.type !== 'git') return false;
      if (searchQuery) {
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.path.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'favorite': return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        default: return b.lastOpened.getTime() - a.lastOpened.getTime();
      }
    });

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🗂️</span>
          <span>Workspace Manager</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={onOpenFolder}>
            📂 Open Folder
          </button>
          <button className={styles.actionBtn} onClick={() => setShowCloneModal(true)}>
            📦 Clone Repo
          </button>
          <button className={styles.primaryBtn} onClick={onCreateProject}>
            + New Project
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {(['all', 'favorite', 'git'] as const).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' && 'All'}
              {f === 'favorite' && '⭐ Favorites'}
              {f === 'git' && '⎇ Git'}
            </button>
          ))}
        </div>
        <div className={styles.viewControls}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
            <option value="recent">Recent</option>
            <option value="name">Name</option>
            <option value="favorite">Favorites</option>
          </select>
          <button
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ▦
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            ≡
          </button>
        </div>
      </div>

      <div className={`${styles.projectsContainer} ${styles[viewMode]}`}>
        {filteredProjects.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📁</span>
            <p>No projects found</p>
            <small>Create a new project or open a folder to get started</small>
          </div>
        ) : (
          filteredProjects.map(project => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${currentProject?.id === project.id ? styles.current : ''}`}
              onClick={() => onOpenProject?.(project)}
            >
              <div className={styles.projectHeader}>
                <span className={styles.langIcon}>{getLanguageIcon(project.language)}</span>
                <div className={styles.projectInfo}>
                  <span className={styles.projectName}>{project.name}</span>
                  <span className={styles.projectPath}>{project.path}</span>
                </div>
                <button
                  className={`${styles.favoriteBtn} ${project.isFavorite ? styles.active : ''}`}
                  onClick={e => { e.stopPropagation(); toggleFavorite(project.id); }}
                >
                  {project.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
              
              <div className={styles.projectMeta}>
                <span className={styles.typeTag}>
                  {getTypeIcon(project.type)} {project.type}
                </span>
                {project.language && (
                  <span className={styles.langTag}>{project.language}</span>
                )}
                <span className={styles.lastOpened}>{formatDate(project.lastOpened)}</span>
              </div>

              {project.stats && viewMode === 'grid' && (
                <div className={styles.projectStats}>
                  <span>{project.stats.files} files</span>
                  <span>{(project.stats.lines / 1000).toFixed(1)}k lines</span>
                  <span>{project.stats.size}</span>
                </div>
              )}

              <div className={styles.projectActions}>
                <button className={styles.openBtn}>Open</button>
                <button
                  className={styles.removeBtn}
                  onClick={e => { e.stopPropagation(); removeProject(project.id); }}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCloneModal && (
        <div className={styles.modal} onClick={() => setShowCloneModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>📦 Clone Repository</span>
              <button className={styles.closeBtn} onClick={() => setShowCloneModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <label>Repository URL</label>
              <input
                type="text"
                placeholder="https://github.com/user/repo.git"
                value={cloneUrl}
                onChange={e => setCloneUrl(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCloneModal(false)}>
                Cancel
              </button>
              <button className={styles.cloneBtn} onClick={handleClone}>
                Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkspaceManager = memo(WorkspaceManagerComponent);
export default WorkspaceManager;
