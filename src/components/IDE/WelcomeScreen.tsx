// ============== WELCOME SCREEN ==============
// IDE welcome screen with quick actions and recent files

import React, { memo, useState, useCallback } from 'react';
import styles from './WelcomeScreen.module.css';

interface RecentFile {
  path: string;
  name: string;
  lastOpened: Date;
}

interface RecentProject {
  path: string;
  name: string;
  lastOpened: Date;
}

interface WelcomeScreenProps {
  recentFiles?: RecentFile[];
  recentProjects?: RecentProject[];
  onOpenFile?: (path: string) => void;
  onOpenProject?: (path: string) => void;
  onNewFile?: () => void;
  onNewProject?: () => void;
  onOpenFolder?: () => void;
  onCloneRepo?: () => void;
  onOpenSettings?: () => void;
  onOpenDocs?: () => void;
  className?: string;
}

const WelcomeScreenComponent: React.FC<WelcomeScreenProps> = ({
  recentFiles = [],
  recentProjects = [],
  onOpenFile,
  onOpenProject,
  onNewFile,
  onNewProject,
  onOpenFolder,
  onCloneRepo,
  onOpenSettings,
  onOpenDocs,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'projects'>('projects');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return '🔷';
      case 'js': case 'jsx': return '🟨';
      case 'py': return '🐍';
      case 'css': case 'scss': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>ResonantGraph IDE</span>
          </div>
          <p className={styles.tagline}>AI-Powered Development Environment</p>
        </div>

        <div className={styles.main}>
          <div className={styles.actions}>
            <h3 className={styles.sectionTitle}>Start</h3>
            <div className={styles.actionList}>
              <button className={styles.actionBtn} onClick={onNewFile}>
                <span className={styles.actionIcon}>📄</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>New File</span>
                  <span className={styles.actionShortcut}>⌘N</span>
                </div>
              </button>
              <button className={styles.actionBtn} onClick={onNewProject}>
                <span className={styles.actionIcon}>📁</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>New Project</span>
                  <span className={styles.actionShortcut}>⌘⇧N</span>
                </div>
              </button>
              <button className={styles.actionBtn} onClick={onOpenFolder}>
                <span className={styles.actionIcon}>📂</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>Open Folder</span>
                  <span className={styles.actionShortcut}>⌘O</span>
                </div>
              </button>
              <button className={styles.actionBtn} onClick={onCloneRepo}>
                <span className={styles.actionIcon}>📦</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>Clone Repository</span>
                  <span className={styles.actionShortcut}>⌘⇧G</span>
                </div>
              </button>
            </div>

            <h3 className={styles.sectionTitle}>Help</h3>
            <div className={styles.actionList}>
              <button className={styles.actionBtn} onClick={onOpenDocs}>
                <span className={styles.actionIcon}>📚</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>Documentation</span>
                </div>
              </button>
              <button className={styles.actionBtn} onClick={onOpenSettings}>
                <span className={styles.actionIcon}>⚙️</span>
                <div className={styles.actionInfo}>
                  <span className={styles.actionLabel}>Settings</span>
                  <span className={styles.actionShortcut}>⌘,</span>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.recent}>
            <div className={styles.recentTabs}>
              <button
                className={`${styles.recentTab} ${activeTab === 'projects' ? styles.active : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                Recent Projects
              </button>
              <button
                className={`${styles.recentTab} ${activeTab === 'files' ? styles.active : ''}`}
                onClick={() => setActiveTab('files')}
              >
                Recent Files
              </button>
            </div>

            <div className={styles.recentList}>
              {activeTab === 'projects' && (
                recentProjects.length === 0 ? (
                  <div className={styles.emptyRecent}>
                    <span className={styles.emptyIcon}>📁</span>
                    <p>No recent projects</p>
                    <small>Open a folder to get started</small>
                  </div>
                ) : (
                  recentProjects.map((project, i) => (
                    <button
                      key={i}
                      className={styles.recentItem}
                      onClick={() => onOpenProject?.(project.path)}
                    >
                      <span className={styles.recentIcon}>📁</span>
                      <div className={styles.recentInfo}>
                        <span className={styles.recentName}>{project.name}</span>
                        <span className={styles.recentPath}>{project.path}</span>
                      </div>
                      <span className={styles.recentDate}>{formatDate(project.lastOpened)}</span>
                    </button>
                  ))
                )
              )}

              {activeTab === 'files' && (
                recentFiles.length === 0 ? (
                  <div className={styles.emptyRecent}>
                    <span className={styles.emptyIcon}>📄</span>
                    <p>No recent files</p>
                    <small>Open a file to get started</small>
                  </div>
                ) : (
                  recentFiles.map((file, i) => (
                    <button
                      key={i}
                      className={styles.recentItem}
                      onClick={() => onOpenFile?.(file.path)}
                    >
                      <span className={styles.recentIcon}>{getFileIcon(file.name)}</span>
                      <div className={styles.recentInfo}>
                        <span className={styles.recentName}>{file.name}</span>
                        <span className={styles.recentPath}>{file.path}</span>
                      </div>
                      <span className={styles.recentDate}>{formatDate(file.lastOpened)}</span>
                    </button>
                  ))
                )
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.tips}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipText}>
              Press <kbd>⌘K</kbd> to open the command palette
            </span>
          </div>
          <div className={styles.version}>v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export const WelcomeScreen = memo(WelcomeScreenComponent);
export default WelcomeScreen;
