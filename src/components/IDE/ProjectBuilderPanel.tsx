/**
 * Project Builder Panel
 * =====================
 * 
 * IDE panel for managing project builds, viewing progress,
 * and accessing delivery packages.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  startBuild,
  getBuildProgress,
  cancelBuild,
  listTemplates,
  listProjects,
  deleteProject,
  archiveProject,
  createDelivery,
  getWorkspaceStats,
  type BuildRequest,
  type BuildProgress,
  type ProjectTemplate,
  type UserProject,
  type WorkspaceStats,
} from '@/api/projectBuilder';
import { logger } from '@/utils/logger';
import styles from './ProjectBuilderPanel.module.css';

// Custom SVG Icons
const BuilderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20M5 20V10l7-7 7 7v10M9 20v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const HammerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
    <path d="M17.64 15L22 10.64" /><path d="M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ReactIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="2.5" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(120 12 12)" />
  </svg>
);

const PythonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2c-1.7 0-3 .8-3 2v3c0 1.1.9 2 2 2h2c1.1 0 2 .9 2 2v3c0 1.2-1.3 2-3 2H8c-1.7 0-3 .8-3 2v4" />
    <path d="M12 22c1.7 0 3-.8 3-2v-3c0-1.1-.9-2-2-2h-2c-1.1 0-2-.9-2-2V10c0-1.2 1.3-2 3-2h4c1.7 0 3-.8 3-2V2" />
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const MailboxIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 12h-6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2z" />
    <path d="M2 7v10a2 2 0 0 0 2 2h8" /><path d="M2 7l8 5 8-5" /><path d="M2 7h16a2 2 0 0 1 2 2v3" />
  </svg>
);

const FileIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CoinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M8 14h8" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const OpenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const DeliverIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinnerIcon}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

interface ProjectBuilderPanelProps {
  onProjectSelect?: (projectId: string) => void;
  onClose?: () => void;
}

type TabType = 'new' | 'projects' | 'builds';

export const ProjectBuilderPanel: React.FC<ProjectBuilderPanelProps> = ({
  onProjectSelect,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [activeBuilds, setActiveBuilds] = useState<Map<string, BuildProgress>>(new Map());
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New build form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('fullstack_react_fastapi');
  const [isBuilding, setIsBuilding] = useState(false);

  // Load initial data
  useEffect(() => {
    loadTemplates();
    loadProjects();
    loadStats();
  }, []);

  // Poll active builds
  useEffect(() => {
    if (activeBuilds.size === 0) return;

    const interval = setInterval(() => {
      activeBuilds.forEach(async (_, projectId) => {
        try {
          const progress = await getBuildProgress(projectId);
          setActiveBuilds(prev => {
            const next = new Map(prev);
            if (progress.phase === 'completed' || progress.phase === 'failed') {
              next.delete(projectId);
              loadProjects(); // Refresh projects list
            } else {
              next.set(projectId, progress);
            }
            return next;
          });
        } catch (err) {
          logger.error('Failed to poll build progress', err);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeBuilds.size]);

  const loadTemplates = async () => {
    try {
      const response = await listTemplates();
      setTemplates(response?.templates || []);
    } catch (err) {
      logger.error('Failed to load templates', err);
      // Set default templates on error
      setTemplates([
        { type: 'fullstack_react_fastapi', name: 'Fullstack React + FastAPI', description: 'Complete fullstack app', tech_stack: ['React', 'FastAPI', 'PostgreSQL'], estimated_files: 25, estimated_cost: 500 },
        { type: 'frontend_react', name: 'React Frontend', description: 'Modern React SPA', tech_stack: ['React', 'TypeScript', 'TailwindCSS'], estimated_files: 15, estimated_cost: 300 },
        { type: 'backend_fastapi', name: 'FastAPI Backend', description: 'Python REST API', tech_stack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL'], estimated_files: 12, estimated_cost: 250 },
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await listProjects();
      setProjects(response?.projects || []);
    } catch (err) {
      logger.error('Failed to load projects', err);
      setProjects([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getWorkspaceStats();
      setStats(response);
    } catch (err) {
      logger.error('Failed to load stats', err);
    }
  };

  const handleStartBuild = async () => {
    if (!projectName.trim() || !description.trim()) {
      setError('Please fill in project name and description');
      return;
    }

    setIsBuilding(true);
    setError(null);

    try {
      const request: BuildRequest = {
        project_name: projectName.trim(),
        description: description.trim(),
        project_type: selectedTemplate,
        initial_budget: 10000,
      };

      const result = await startBuild(request);
      
      // Add to active builds for tracking
      const progress = await getBuildProgress(result.project_id);
      setActiveBuilds(prev => new Map(prev).set(result.project_id, progress));
      
      // Switch to builds tab
      setActiveTab('builds');
      
      // Clear form
      setProjectName('');
      setDescription('');
      
      logger.info('Build started successfully', { project_id: result.project_id });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to start build');
      logger.error('Failed to start build', err);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleCancelBuild = async (projectId: string) => {
    try {
      await cancelBuild(projectId);
      setActiveBuilds(prev => {
        const next = new Map(prev);
        next.delete(projectId);
        return next;
      });
    } catch (err) {
      logger.error('Failed to cancel build', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(projectId);
      loadProjects();
      loadStats();
    } catch (err) {
      logger.error('Failed to delete project', err);
    }
  };

  const handleArchiveProject = async (projectId: string) => {
    try {
      await archiveProject(projectId);
      loadProjects();
    } catch (err) {
      logger.error('Failed to archive project', err);
    }
  };

  const handleCreateDelivery = async (projectId: string) => {
    try {
      const delivery = await createDelivery(projectId);
      alert(`Delivery package created: ${delivery.archive_path}`);
    } catch (err) {
      logger.error('Failed to create delivery', err);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'initializing': return <SpinnerIcon />;
      case 'planning': return <ClipboardIcon />;
      case 'generating': return <BoltIcon />;
      case 'validating': return <SearchIcon />;
      case 'correcting': return <WrenchIcon />;
      case 'finalizing': return <PackageIcon />;
      case 'completed': return <CheckIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <ClockIcon />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'generating': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}><BuilderIcon /></span>
          <h2>Project Builder</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total_projects}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.active_builds}</span>
            <span className={styles.statLabel}>Active Builds</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.total_files}</span>
            <span className={styles.statLabel}>Files</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{(stats.storage_used_mb ?? stats.total_size_mb ?? 0).toFixed(1)} MB</span>
            <span className={styles.statLabel}>Storage</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'new' ? styles.active : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <PlusIcon /> New Build
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'projects' ? styles.active : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderIcon /> Projects ({projects?.length || 0})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'builds' ? styles.active : ''}`}
          onClick={() => setActiveTab('builds')}
        >
          <HammerIcon /> Active Builds ({activeBuilds?.size || 0})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* New Build Tab */}
        {activeTab === 'new' && (
          <div className={styles.newBuildForm}>
            <div className={styles.formGroup}>
              <label>Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="my-awesome-project"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you want to build..."
                className={styles.textarea}
                rows={4}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Template</label>
              <div className={styles.templateGrid}>
                {templates.map((template) => (
                  <div
                    key={template.type}
                    className={`${styles.templateCard} ${selectedTemplate === template.type ? styles.selected : ''}`}
                    onClick={() => setSelectedTemplate(template.type)}
                  >
                    <div className={styles.templateIcon}>
                      {template.type.includes('react') ? <ReactIcon /> : 
                       template.type.includes('fastapi') ? <PythonIcon /> : 
                       template.type.includes('vue') ? <ReactIcon /> : <PackageIcon />}
                    </div>
                    <div className={styles.templateInfo}>
                      <h4>{template.name}</h4>
                      <p>{template.description}</p>
                      <div className={styles.templateMeta}>
                        <span>~{template.estimated_files} files</span>
                        <span>~{template.estimated_cost} credits</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <WarningIcon /> {error}
              </div>
            )}

            <button
              onClick={handleStartBuild}
              disabled={isBuilding || !projectName.trim() || !description.trim()}
              className={styles.buildButton}
            >
              {isBuilding ? (
                <>
                  <span className={styles.spinner}></span>
                  Starting Build...
                </>
              ) : (
                <><RocketIcon /> Start Build</>
              )}
            </button>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className={styles.projectsList}>
            {loading ? (
              <div className={styles.loading}>Loading projects...</div>
            ) : !projects || projects.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><MailboxIcon /></span>
                <h3>No Projects Yet</h3>
                <p>Start your first build to create a project</p>
                <button onClick={() => setActiveTab('new')} className={styles.primaryButton}>
                  Create New Project
                </button>
              </div>
            ) : (
              (projects || []).map((project) => (
                <div key={project.project_id} className={styles.projectCard}>
                  <div className={styles.projectHeader}>
                    <h3>{project.name}</h3>
                    <span className={`${styles.status} ${styles[project.status]}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className={styles.projectDescription}>{project.description}</p>
                  <div className={styles.projectMeta}>
                    <span><FileIcon /> {project.files_count} files</span>
                    <span><CoinIcon /> {project.total_cost} credits</span>
                    <span><CalendarIcon /> {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.techStack}>
                    {(project.tech_stack || []).map((tech) => (
                      <span key={tech} className={styles.techBadge}>{tech}</span>
                    ))}
                  </div>
                  <div className={styles.projectActions}>
                    <button
                      onClick={() => onProjectSelect?.(project.project_id)}
                      className={styles.actionButton}
                    >
                      <OpenIcon /> Open
                    </button>
                    <button
                      onClick={() => handleCreateDelivery(project.project_id)}
                      className={styles.actionButton}
                    >
                      <DeliverIcon /> Deliver
                    </button>
                    <button
                      onClick={() => handleArchiveProject(project.project_id)}
                      className={styles.actionButton}
                    >
                      <ArchiveIcon /> Archive
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.project_id)}
                      className={`${styles.actionButton} ${styles.danger}`}
                    >
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Builds Tab */}
        {activeTab === 'builds' && (
          <div className={styles.buildsList}>
            {activeBuilds.size === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><HammerIcon /></span>
                <h3>No Active Builds</h3>
                <p>Start a new build to see progress here</p>
                <button onClick={() => setActiveTab('new')} className={styles.primaryButton}>
                  Start New Build
                </button>
              </div>
            ) : (
              Array.from(activeBuilds.entries()).map(([projectId, progress]) => (
                <div key={projectId} className={styles.buildCard}>
                  <div className={styles.buildHeader}>
                    <span className={styles.buildIcon}>{getPhaseIcon(progress.phase)}</span>
                    <div className={styles.buildInfo}>
                      <h4>Project: {projectId.slice(0, 8)}...</h4>
                      <span className={styles.buildPhase} style={{ color: getPhaseColor(progress.phase) }}>
                        {progress.phase.charAt(0).toUpperCase() + progress.phase.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${progress.progress_percent}%`,
                        backgroundColor: getPhaseColor(progress.phase),
                      }}
                    />
                  </div>
                  
                  <div className={styles.buildDetails}>
                    <p className={styles.currentStep}>{progress.current_step || progress.current_file || ''}</p>
                    <div className={styles.buildStats}>
                      <span><FileIcon /> {progress.files_created ?? progress.files_generated ?? 0} files</span>
                      {progress.budget_used != null && progress.budget_remaining != null && (
                        <span><CoinIcon /> {progress.budget_used.toFixed(0)} / {(progress.budget_used + progress.budget_remaining).toFixed(0)} credits</span>
                      )}
                      <span><ClockIcon /> {Math.round(progress.progress_percent)}%</span>
                    </div>
                  </div>

                  {progress.errors.length > 0 && (
                    <div className={styles.buildErrors}>
                      {progress.errors.map((err, i) => (
                        <div key={i} className={styles.errorItem}><WarningIcon /> {err}</div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleCancelBuild(projectId)}
                    className={`${styles.actionButton} ${styles.danger}`}
                  >
                    <CloseIcon /> Cancel Build
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectBuilderPanel;
