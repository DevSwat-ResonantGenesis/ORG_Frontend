/**
 * Build Page - Standalone Project Builder
 * ========================================
 * 
 * A dedicated page for the Project Builder that can be accessed:
 * 1. Directly via /build route
 * 2. From ResonantChat when user clicks "Build"
 * 3. With query params for pre-filled description: /build?description=...&type=react
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import JSZip from 'jszip';

// Custom SVG Icons
const BuilderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l1.3-1.3a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-1.3 1.3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const RocketIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12.5 3.5s1 3-2 6l-2 2-3-3 2-2c3-3 6-2 6-2zM6.5 9.5l-3 3M4 7L2 9l2.5.5L4 7zM9 12l2-2-.5-2.5L9 12z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2v8m0 0l-3-3m3 3l3-3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 10V2m0 0L5 5m3-3l3 3M3 12v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12.5 14h-9a1 1 0 01-1-1V3a1 1 0 011-1h7l3 3v8a1 1 0 01-1 1z" />
    <path d="M10 14v-4H6v4M6 2v3h4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 4L1 8l4 4M11 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 1L1 14h14L8 1zM8 5v4M8 11v1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="spin">
    <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.76 3.76l1.41 1.41M10.83 10.83l1.41 1.41M3.76 12.24l1.41-1.41M10.83 5.17l1.41-1.41" strokeLinecap="round" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 2H6a1 1 0 00-1 1v1H4a1 1 0 00-1 1v9a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-1-1h-1V3a1 1 0 00-1-1z" />
    <path d="M6 6h4M6 9h4M6 12h2" strokeLinecap="round" />
  </svg>
);

const BoltIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 1L3 9h5l-1 6 6-8H8l1-6z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="4" />
    <path d="M10 10l4 4" strokeLinecap="round" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12.5 3.5a4 4 0 00-5.66 5.66L3 13l1 1 3.84-3.84a4 4 0 005.66-5.66l-2 2-1.5-1.5 2-2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" />
    <path d="M8 8v6M2 5l6 3 6-3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4v4l2 2" strokeLinecap="round" />
  </svg>
);

const FileDocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-4z" />
    <path d="M9 2v4h4" />
  </svg>
);

const CoinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4v8M6 6h3a1.5 1.5 0 010 3H6h3a1.5 1.5 0 010 3H6" strokeLinecap="round" />
  </svg>
);

const ReactIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <ellipse cx="8" cy="8" rx="6" ry="2.5" />
    <ellipse cx="8" cy="8" rx="6" ry="2.5" transform="rotate(60 8 8)" />
    <ellipse cx="8" cy="8" rx="6" ry="2.5" transform="rotate(120 8 8)" />
  </svg>
);

const PythonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2c-3 0-3 1.5-3 2v1.5h3v.5H4c-1.5 0-2 1.5-2 3s.5 3 2 3h1v-1.5c0-1 .5-2 2-2h3c1 0 2-.5 2-2V4c0-1-1-2-4-2zM6 3.5a.5.5 0 110 1 .5.5 0 010-1z" />
    <path d="M8 14c3 0 3-1.5 3-2v-1.5H8V10h4c1.5 0 2-1.5 2-3s-.5-3-2-3h-1v1.5c0 1-.5 2-2 2H6c-1 0-2 .5-2 2v2c0 1 1 2 4 2zM10 12.5a.5.5 0 110-1 .5.5 0 010 1z" />
  </svg>
);

const VueIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 12L2 3h3l3 5 3-5h3L8 12z" />
    <path d="M8 9L5 4h2l1 2 1-2h2L8 9z" />
  </svg>
);

const MailboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 6v7a1 1 0 001 1h10a1 1 0 001-1V6" />
    <path d="M2 6l6 4 6-4" />
    <path d="M2 6V4a1 1 0 011-1h10a1 1 0 011 1v2" />
  </svg>
);
import {
  startBuild,
  getBuildProgress,
  cancelBuild,
  listTemplates,
  listProjects,
  getWorkspaceStats,
  modifyProject,
  getProjectFiles,
  getProjectState,
  promoteProject,
  type BuildRequest,
  type BuildProgress,
  type ProjectTemplate,
  type UserProject,
  type WorkspaceStats,
} from '@/api/projectBuilder';
import { generateProject, uploadProject, type ProjectFile } from '@/api/code';
import { getGitHubStatus, connectGitHub, listGitHubRepos, syncGitHub, type GitHubStatus, type GitHubRepo } from '@/api/github';
import { logger } from '@/utils/logger';
import { isAuthenticated } from '@/api/auth';
import { FileIcon } from '@/components/IDE/FileIcon';
import { LLMErrorNotification, isLLMError, getLLMErrorMessage } from '@/components/shared/LLMErrorNotification';
import styles from './BuildPage.module.css';

type ViewMode = 'create' | 'building' | 'result' | 'projects';

export const BuildPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login?redirect=/build');
    }
  }, [navigate]);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('create');
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('fullstack_react_fastapi');
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  
  // Build state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Result state
  const [generatedFiles, setGeneratedFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [setupInstructions, setSetupInstructions] = useState('');
  
  // Projects state
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  const [showLLMError, setShowLLMError] = useState(false);
  
  // Modification state
  const [modificationRequest, setModificationRequest] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [projectState, setProjectState] = useState<'generated' | 'runtime'>('generated');
  const [isPromoting, setIsPromoting] = useState(false);
  
  // GitHub state
  const [githubStatus, setGithubStatus] = useState<GitHubStatus | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [newRepoName, setNewRepoName] = useState('');
  const [isPushingToGitHub, setIsPushingToGitHub] = useState(false);
  
  // Upload state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize from URL params
  useEffect(() => {
    const descParam = searchParams.get('description');
    const typeParam = searchParams.get('type');
    
    if (descParam) {
      setDescription(descParam);
      // Auto-generate project name from description
      const autoName = descParam.slice(0, 30).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setProjectName(autoName || 'my-project');
    }
    
    if (typeParam) {
      setSelectedTemplate(typeParam);
    }
    
    // Auto-start build if description provided
    if (descParam && descParam.length > 10) {
      // Small delay to show the form first
      setTimeout(() => {
        handleStartBuild();
      }, 500);
    }
  }, [searchParams]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
    loadProjects();
    loadStats();
  }, []);

  // Poll build progress
  useEffect(() => {
    if (!currentProjectId || viewMode !== 'building') return;

    const interval = setInterval(async () => {
      try {
        const progress = await getBuildProgress(currentProjectId);
        setBuildProgress(progress);
        
        if (progress.phase === 'completed') {
          clearInterval(interval);
          // Fetch the generated files
          await fetchGeneratedProject();
        } else if (progress.phase === 'failed') {
          clearInterval(interval);
          setError(progress.errors.join(', ') || 'Build failed');
          setViewMode('create');
        }
      } catch (err) {
        logger.error('Failed to poll progress', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentProjectId, viewMode]);

  const loadTemplates = async () => {
    try {
      const response = await listTemplates();
      setTemplates(response.templates);
    } catch (err) {
      // Use default templates if API fails
      setTemplates([
        { type: 'fullstack_react_fastapi', name: 'Fullstack React + FastAPI', description: 'Complete fullstack app', tech_stack: ['React', 'FastAPI', 'PostgreSQL'], estimated_files: 25, estimated_cost: 500 },
        { type: 'frontend_react', name: 'React Frontend', description: 'Modern React SPA', tech_stack: ['React', 'TypeScript', 'TailwindCSS'], estimated_files: 15, estimated_cost: 300 },
        { type: 'backend_fastapi', name: 'FastAPI Backend', description: 'Python REST API', tech_stack: ['FastAPI', 'SQLAlchemy', 'PostgreSQL'], estimated_files: 12, estimated_cost: 250 },
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await listProjects();
      setProjects(response.projects);
    } catch (err) {
      logger.error('Failed to load projects', err);
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
    if (!description.trim()) {
      setError('Please provide a project description');
      return;
    }

    setIsBuilding(true);
    setError(null);
    setViewMode('building');

    try {
      // Use the frontend-compatible endpoint
      const response = await generateProject({
        description: description.trim(),
        project_type: selectedTemplate,
      });

      if (response.files && response.files.length > 0) {
        setGeneratedFiles(response.files);
        setSelectedFile(response.files[0]);
        setSetupInstructions(response.setup_instructions || '');
        setViewMode('result');
        
        if (response.anchors && response.anchors[0]) {
          setCurrentProjectId(response.anchors[0]);
        }
      } else {
        setError('No files were generated. Please try again.');
        setViewMode('create');
      }
    } catch (err: any) {
      logger.error('Build failed', err);
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Build failed';
      
      // Check if this is an LLM-related error
      if (isLLMError(errorMsg)) {
        setShowLLMError(true);
        setError(getLLMErrorMessage(errorMsg, 'builder'));
      } else {
        setError(errorMsg);
      }
      setViewMode('create');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleCancelBuild = async () => {
    if (currentProjectId) {
      try {
        await cancelBuild(currentProjectId);
      } catch (err) {
        logger.error('Failed to cancel', err);
      }
    }
    setViewMode('create');
    setIsBuilding(false);
    setBuildProgress(null);
  };

  // Handle project promotion (GENERATED → RUNTIME)
  const handlePromoteProject = async () => {
    if (!currentProjectId) return;
    
    setIsPromoting(true);
    setError(null);
    
    try {
      const result = await promoteProject(currentProjectId, 'User requested promotion for modification');
      
      if (result.success) {
        setProjectState('runtime');
        logger.info('Project promoted to RUNTIME', { snapshot: result.snapshot_id });
      }
    } catch (err: any) {
      logger.error('Promotion failed', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to promote project');
    } finally {
      setIsPromoting(false);
    }
  };

  // Handle project modification (requires RUNTIME state)
  const handleModifyProject = async () => {
    if (!currentProjectId || !modificationRequest.trim()) return;
    
    // Check if project needs promotion first
    if (projectState !== 'runtime') {
      setError('Project must be promoted to RUNTIME state before modification. Click "Enable Modifications" first.');
      return;
    }
    
    setIsModifying(true);
    setError(null);
    
    try {
      const result = await modifyProject(currentProjectId, modificationRequest);
      
      if (result.success) {
        // Reload project files
        const filesResponse = await getProjectFiles(currentProjectId);
        if (filesResponse.files) {
          const updatedFiles = filesResponse.files.map(f => ({
            path: f.path,
            content: f.content,
            language: f.language,
            explanation: `Modified: ${f.path}`,
          }));
          setGeneratedFiles(updatedFiles);
          if (updatedFiles.length > 0) {
            setSelectedFile(updatedFiles[0]);
          }
        }
        setModificationRequest('');
        logger.info('Project modified successfully', { modified: result.total_modified });
      } else if (result.error_code === 'PROJECT_NOT_PROMOTED') {
        // Project needs promotion
        setProjectState('generated');
        setError('Project must be promoted first. Click "Enable Modifications" to continue.');
      } else if (result.error_code === 'LLM_KEY_REQUIRED') {
        // LLM service requires user's own API key
        setShowLLMError(true);
        setError(result.error || 'AI service requires your own API key.');
      } else {
        setError(result.error || 'Modification failed. Please try again.');
      }
    } catch (err: any) {
      logger.error('Modification failed', err);
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Modification failed';
      
      // Check if this is an LLM-related error (quota, credits, etc.)
      if (isLLMError(errorMsg)) {
        setShowLLMError(true);
        setError(getLLMErrorMessage(errorMsg, 'builder'));
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsModifying(false);
    }
  };

  // Handle opening an existing project
  const handleOpenProject = async (project: UserProject) => {
    setError(null);
    setCurrentProjectId(project.project_id);
    setProjectName(project.name);
    
    try {
      // Load project files
      const filesResponse = await getProjectFiles(project.project_id);
      if (filesResponse.files && filesResponse.files.length > 0) {
        const loadedFiles = filesResponse.files.map(f => ({
          path: f.path,
          content: f.content,
          language: f.language || 'text',
          explanation: '',
        }));
        setGeneratedFiles(loadedFiles);
        setSelectedFile(loadedFiles[0]);
        
        // Load project state
        try {
          const stateResponse = await getProjectState(project.project_id);
          setProjectState(stateResponse.project_state === 'runtime' ? 'runtime' : 'generated');
        } catch {
          setProjectState('generated');
        }
        
        setViewMode('result');
      } else {
        setError('No files found in project');
      }
    } catch (err: any) {
      logger.error('Failed to open project', err);
      setError(err?.response?.data?.detail || err?.message || 'Failed to load project files');
    }
  };

  const handleDownloadZip = async () => {
    if (generatedFiles.length === 0) return;

    try {
      const zip = new JSZip();
      generatedFiles.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'project'}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('Failed to create ZIP', err);
      setError('Failed to create ZIP file');
    }
  };

  // Download a specific project from the projects list
  const handleDownloadProject = async (project: UserProject) => {
    try {
      // First, fetch the project files
      const response = await getProjectFiles(project.project_id);
      const files = response?.files || [];
      
      if (files.length > 0) {
        const zip = new JSZip();
        files.forEach((file: { path: string; content: string }) => {
          zip.file(file.path, file.content);
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError('No files found in project');
      }
    } catch (err: any) {
      logger.error('Failed to download project', err);
      setError(err?.message || 'Failed to download project');
    }
  };

  // Upload project ZIP file
  const handleUploadProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a ZIP file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Upload the ZIP file to backend - it will create a project with ID
      const response = await uploadProject(file);
      
      if (response?.project_id) {
        // Set the current project ID
        setCurrentProjectId(response.project_id);
        setProjectName(file.name.replace('.zip', ''));
        
        // Fetch the project files to display
        const filesResponse = await getProjectFiles(response.project_id);
        const files = filesResponse?.files || [];
        
        if (files.length > 0) {
          const projectFiles = files.map((f: { path: string; content: string; language?: string }) => ({
            path: f.path,
            content: f.content,
            language: f.language || 'plaintext',
            explanation: '',
          })) as ProjectFile[];
          
          setGeneratedFiles(projectFiles);
          setSelectedFile(projectFiles[0]);
          setViewMode('result');
          
          // Refresh projects list
          loadProjects();
        }
        
        alert(`Project uploaded successfully! ID: ${response.project_id}`);
      } else {
        setError('Failed to upload project - no project ID returned');
      }
    } catch (err: any) {
      logger.error('Failed to upload project', err);
      setError(err?.message || 'Failed to upload project');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Live Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Generate preview HTML from files
  const generatePreviewHtml = () => {
    // Find key files
    const htmlFile = generatedFiles.find(f => f.path.endsWith('index.html') && !f.path.includes('node_modules'));
    const appFile = generatedFiles.find(f => f.path.match(/App\.(tsx|jsx|js)$/));
    const cssFiles = generatedFiles.filter(f => f.path.endsWith('.css') && !f.path.includes('node_modules'));
    const readmeFile = generatedFiles.find(f => f.path.toLowerCase() === 'readme.md');
    
    // Collect all CSS content
    const cssContent = cssFiles.map(f => f.content).join('\n');
    
    // If we have an index.html, use it directly with injected CSS
    if (htmlFile) {
      let html = htmlFile.content;
      if (cssContent) {
        html = html.replace('</head>', `<style>${cssContent}</style></head>`);
      }
      return html;
    }
    
    // Group files by directory for better display
    const filesByDir: Record<string, string[]> = {};
    generatedFiles.forEach(f => {
      const parts = f.path.split('/');
      const dir = parts.length > 1 ? parts[0] : 'root';
      if (!filesByDir[dir]) filesByDir[dir] = [];
      filesByDir[dir].push(f.path);
    });
    
    // Determine project type
    const hasPackageJson = generatedFiles.some(f => f.path === 'package.json');
    const hasRequirements = generatedFiles.some(f => f.path === 'requirements.txt');
    const hasDockerCompose = generatedFiles.some(f => f.path === 'docker-compose.yml');
    
    let projectType = 'Project';
    let runCommand = 'See README for instructions';
    
    if (hasPackageJson && hasRequirements) {
      projectType = 'Full-Stack Project';
      runCommand = 'docker-compose up (or run frontend/backend separately)';
    } else if (hasPackageJson) {
      projectType = appFile ? 'React Project' : 'Node.js Project';
      runCommand = 'npm install && npm run dev';
    } else if (hasRequirements) {
      projectType = 'Python/FastAPI Project';
      runCommand = 'pip install -r requirements.txt && uvicorn main:app --reload';
    }
    
    // Build file tree HTML
    const fileTreeHtml = Object.entries(filesByDir).map(([dir, files]) => `
      <div class="dir-group">
        <div class="dir-name">📁 ${dir}/</div>
        ${files.map(f => `<div class="file-item">📄 ${f}</div>`).join('')}
      </div>
    `).join('');
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Preview</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      margin: 0; 
      padding: 24px; 
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); 
      color: #e4e4e7; 
      min-height: 100vh;
    }
    .header { 
      text-align: center; 
      margin-bottom: 32px; 
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .header h1 { 
      margin: 0 0 8px 0; 
      font-size: 28px; 
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header .type { 
      color: #a1a1aa; 
      font-size: 14px; 
      margin-bottom: 16px;
    }
    .stats { 
      display: flex; 
      justify-content: center; 
      gap: 24px; 
      margin-top: 16px;
    }
    .stat { 
      background: rgba(99, 102, 241, 0.1); 
      padding: 12px 20px; 
      border-radius: 8px; 
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .stat-value { font-size: 24px; font-weight: 700; color: #818cf8; }
    .stat-label { font-size: 12px; color: #71717a; margin-top: 4px; }
    .run-command {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    }
    .run-command h3 { margin: 0 0 8px 0; color: #4ade80; font-size: 14px; }
    .run-command code { 
      background: rgba(0,0,0,0.3); 
      padding: 8px 12px; 
      border-radius: 4px; 
      display: block;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 13px;
      color: #a7f3d0;
    }
    .file-tree { 
      background: rgba(255,255,255,0.03); 
      border-radius: 12px; 
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .file-tree h3 { margin: 0 0 16px 0; font-size: 16px; }
    .dir-group { margin-bottom: 16px; }
    .dir-name { 
      font-weight: 600; 
      color: #fbbf24; 
      margin-bottom: 8px;
      font-size: 14px;
    }
    .file-item { 
      padding: 6px 12px 6px 24px; 
      font-family: monospace; 
      font-size: 12px; 
      color: #a1a1aa;
      border-left: 2px solid rgba(255,255,255,0.1);
      margin-left: 8px;
    }
    ${cssContent}
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 ${projectType} Generated</h1>
    <div class="type">Built with ResonantGenesis Project Builder</div>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${generatedFiles.length}</div>
        <div class="stat-label">Files Created</div>
      </div>
      <div class="stat">
        <div class="stat-value">${Object.keys(filesByDir).length}</div>
        <div class="stat-label">Directories</div>
      </div>
    </div>
  </div>
  
  <div class="run-command">
    <h3>▶️ Quick Start</h3>
    <code>${runCommand}</code>
  </div>
  
  <div class="file-tree">
    <h3>📂 Project Structure</h3>
    ${fileTreeHtml}
  </div>
</body>
</html>`;
  };

  useEffect(() => {
    if (viewMode === 'result' && generatedFiles.length > 0) {
      setPreviewHtml(generatePreviewHtml());
    }
  }, [viewMode, generatedFiles]);

  // Check GitHub status on mount
  useEffect(() => {
    const checkGitHubStatus = async () => {
      try {
        const status = await getGitHubStatus();
        setGithubStatus(status);
        if (status.connected) {
          const repos = await listGitHubRepos();
          setGithubRepos(repos);
        }
      } catch (err) {
        logger.error('Failed to check GitHub status', err);
      }
    };
    checkGitHubStatus();
  }, []);

  // Push to GitHub
  const handlePushToGitHub = async () => {
    // Check if connected to GitHub
    if (!githubStatus?.connected) {
      // Show modal to connect
      setShowGitHubModal(true);
      return;
    }
    
    // Show modal to select/create repo
    setNewRepoName(projectName || 'my-project');
    setShowGitHubModal(true);
  };

  // Connect to GitHub OAuth
  const handleConnectGitHub = () => {
    connectGitHub();
  };

  // Push project to selected repo
  const handleConfirmPushToGitHub = async () => {
    if (!currentProjectId) {
      setError('No project to push');
      return;
    }

    setIsPushingToGitHub(true);
    try {
      const result = await syncGitHub(
        currentProjectId,
        'push',
        `Initial commit from Project Builder: ${projectName || 'New Project'}`
      );
      
      if (result.success) {
        setShowGitHubModal(false);
        alert('Successfully pushed to GitHub!');
      } else {
        setError(result.message || 'Failed to push to GitHub');
      }
    } catch (err: any) {
      logger.error('Failed to push to GitHub', err);
      setError(err?.message || 'Failed to push to GitHub');
    } finally {
      setIsPushingToGitHub(false);
    }
  };

  // Update file content (make editor editable)
  const handleFileChange = (newContent: string | undefined) => {
    if (!selectedFile || !newContent) return;
    setGeneratedFiles(prev => prev.map(f => 
      f.path === selectedFile.path ? { ...f, content: newContent } : f
    ));
    setSelectedFile({ ...selectedFile, content: newContent });
  };

  const handleSaveToBackend = async () => {
    if (generatedFiles.length === 0) return;

    try {
      // Create ZIP and upload
      const zip = new JSZip();
      generatedFiles.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const file = new File([blob], 'project.zip', { type: 'application/zip' });
      
      const response = await uploadProject(file);
      alert(`Project saved! ID: ${response.project_id}`);
    } catch (err: any) {
      logger.error('Failed to save project', err);
      setError(err?.message || 'Failed to upload to IDE');
    }
  };

  const fetchGeneratedProject = async () => {
    // This would fetch files from the backend after build completes
    // For now, we use the direct generateProject response
    setViewMode('result');
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'tsx': 'typescript', 'ts': 'typescript', 'jsx': 'javascript', 'js': 'javascript',
      'py': 'python', 'json': 'json', 'md': 'markdown', 'css': 'css', 'html': 'html',
      'yml': 'yaml', 'yaml': 'yaml', 'sql': 'sql', 'sh': 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
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
      case 'failed': return <CloseIcon />;
      default: return <ClockIcon />;
    }
  };

  const getTemplateIcon = (type: string) => {
    if (type.includes('fullstack')) return <RocketIcon />;
    if (type.includes('react')) return <ReactIcon />;
    if (type.includes('fastapi') || type.includes('python')) return <PythonIcon />;
    if (type.includes('vue')) return <VueIcon />;
    return <PackageIcon />;
  };

  // Build file tree structure
  const buildFileTree = () => {
    const tree: any = {};
    generatedFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = idx === parts.length - 1 ? { _file: file } : {};
        }
        current = current[part];
      });
    });
    return tree;
  };

  const renderFileTree = (node: any, path = '', level = 0) => {
    return Object.entries(node).map(([key, value]: [string, any]) => {
      if (key === '_file') return null;
      
      const fullPath = path ? `${path}/${key}` : key;
      const isFile = value._file;
      const isSelected = selectedFile?.path === value._file?.path;
      
      if (isFile) {
        return (
          <div
            key={fullPath}
            className={`${styles.treeItem} ${styles.file} ${isSelected ? styles.selected : ''}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => setSelectedFile(value._file)}
          >
            <FileIcon fileName={key} />
            <span>{key}</span>
          </div>
        );
      }
      
      return (
        <div key={fullPath}>
          <div
            className={`${styles.treeItem} ${styles.folder}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <span className={styles.folderIcon}><FolderIcon /></span>
            <span>{key}</span>
          </div>
          {renderFileTree(value, fullPath, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className={styles.buildPage}>
      {/* Unified Single Top Bar - 30px height, 20px spacing */}
      <div className={styles.tabBar}>
        <div className={styles.tabBarLeft}>
          {/* View Mode Tabs */}
          <button
            className={`${styles.tabButton} ${viewMode === 'create' || viewMode === 'building' ? styles.active : ''}`}
            onClick={() => setViewMode('create')}
          >
            <PlusIcon />
            <span>New Build</span>
          </button>
          
          {/* Result View Tabs - Show when in result mode */}
          {viewMode === 'result' && (
            <>
              <button 
                className={`${styles.tabButton} ${!showPreview ? styles.active : ''}`}
                onClick={() => setShowPreview(false)}
              >
                <FolderIcon />
                <span>Project Files</span>
                <span className={styles.badge}>{generatedFiles.length}</span>
              </button>
              <button 
                className={`${styles.tabButton} ${showPreview ? styles.active : ''}`}
                onClick={() => setShowPreview(true)}
              >
                <EyeIcon />
                <span>Live Preview</span>
              </button>
            </>
          )}
          
          <button
            className={`${styles.tabButton} ${viewMode === 'projects' ? styles.active : ''}`}
            onClick={() => { setViewMode('projects'); loadProjects(); }}
          >
            <FolderIcon />
            <span>My Projects</span>
            {projects.length > 0 && <span className={styles.badge}>{projects.length}</span>}
          </button>
          
          {/* Stats */}
          {generatedFiles.length > 0 && (
            <span className={styles.statItem}>{generatedFiles.length} files created</span>
          )}
        </div>
        
        <div className={styles.tabBarRight}>
          {/* Upload Project Button - Always visible */}
          <button onClick={() => fileInputRef.current?.click()} className={styles.tabButton}>
            <UploadIcon />
            <span>Upload Project</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadProject}
            accept=".zip"
            style={{ display: 'none' }}
          />
          
          {/* Action Buttons - Show when in result mode */}
          {viewMode === 'result' && generatedFiles.length > 0 && (
            <>
              <button onClick={handleDownloadZip} className={styles.tabButton}>
                <DownloadIcon />
                <span>Download ZIP</span>
              </button>
              <button onClick={handlePushToGitHub} className={styles.tabButton}>
                <GitHubIcon />
                <span>Push to GitHub</span>
              </button>
              <button onClick={handleSaveToBackend} className={styles.tabButton}>
                <SaveIcon />
                <span>Save Project</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {/* CREATE VIEW */}
        {viewMode === 'create' && (
          <div className={styles.createView}>
            <div className={styles.formSection}>
              <h2>What do you want to build?</h2>
              
              <div className={styles.formGroup}>
                <label>Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project in detail... e.g., 'An e-commerce platform with user authentication, product catalog, shopping cart, and Stripe payment integration'"
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Project Name (optional)</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-awesome-project"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Project Template</label>
                <div className={styles.templateGrid}>
                  {templates.map((template) => (
                    <div
                      key={template.type}
                      className={`${styles.templateCard} ${selectedTemplate === template.type ? styles.selected : ''}`}
                      onClick={() => setSelectedTemplate(template.type)}
                    >
                      <div className={styles.templateIcon}>
                        {getTemplateIcon(template.type)}
                      </div>
                      <div className={styles.templateInfo}>
                        <h4>{template.name}</h4>
                        <p>{template.description}</p>
                        <div className={styles.templateTech}>
                          {template.tech_stack?.map((tech) => (
                            <span key={tech} className={styles.techBadge}>{tech}</span>
                          ))}
                        </div>
                        <div className={styles.templateMeta}>
                          <span>~{template.estimated_files} files</span>
                          <span>~{template.estimated_cost} credits</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showLLMError && (
                <LLMErrorNotification 
                  service="builder" 
                  inline={true}
                  onDismiss={() => setShowLLMError(false)}
                />
              )}

              {error && !showLLMError && (
                <div className={styles.error}><WarningIcon /> {error}</div>
              )}

              <button
                onClick={handleStartBuild}
                disabled={isBuilding || !description.trim()}
                className={styles.buildButton}
              >
                {isBuilding ? (
                  <>
                    <span className={styles.spinner}></span>
                    Building...
                  </>
                ) : (
                  <><RocketIcon /> Start Building</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* BUILDING VIEW */}
        {viewMode === 'building' && (
          <div className={styles.buildingView}>
            <div className={styles.buildingCard}>
              <div className={styles.buildingHeader}>
                <span className={styles.buildingIcon}>
                  {buildProgress ? getPhaseIcon(buildProgress.phase) : <BoltIcon />}
                </span>
                <h2>Building Your Project</h2>
              </div>
              
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${buildProgress?.progress_percent || 10}%` }}
                  />
                </div>
                <div className={styles.progressInfo}>
                  <span className={styles.phase}>
                    {buildProgress?.phase || 'Initializing'}
                  </span>
                  <span className={styles.percent}>
                    {buildProgress?.progress_percent || 0}%
                  </span>
                </div>
              </div>

              <p className={styles.currentStep}>
                {buildProgress?.current_step || 'Starting build process...'}
              </p>

              {buildProgress && (
                <div className={styles.buildStats}>
                  <span><FolderIcon /> {buildProgress.files_created} files created</span>
                  <span><CoinIcon /> {buildProgress.budget_used.toFixed(0)} credits used</span>
                </div>
              )}

              <button onClick={handleCancelBuild} className={styles.cancelButton}>
                <CloseIcon /> Cancel Build
              </button>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {viewMode === 'result' && (
          <div className={styles.resultView}>
            {/* Result Header */}
            <div className={styles.resultHeader}>
              <div className={styles.resultTitle}>
                <span className={styles.successIcon}><CheckIcon /></span>
                <div>
                  <h2>Project Generated!</h2>
                  <p>{generatedFiles.length} files created</p>
                </div>
              </div>
              <div className={styles.resultActions}>
                <button onClick={handleDownloadZip} className={styles.primaryButton}>
                  <DownloadIcon /> Download ZIP
                </button>
                <button onClick={handlePushToGitHub} className={styles.secondaryButton}>
                  <GitHubIcon /> Push to GitHub
                </button>
                <button onClick={handleSaveToBackend} className={styles.secondaryButton}>
                  <SaveIcon /> Save Project
                </button>
                <button onClick={() => setViewMode('create')} className={styles.secondaryButton}>
                  <PlusIcon /> New Build
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={styles.resultTabs}>
              <button 
                className={`${styles.resultTab} ${!showPreview ? styles.activeTab : ''}`}
                onClick={() => setShowPreview(false)}
              >
                <FolderIcon /> Project Files
                <span className={styles.tabBadge}>{generatedFiles.length}</span>
              </button>
              <button 
                className={`${styles.resultTab} ${showPreview ? styles.activeTab : ''}`}
                onClick={() => setShowPreview(true)}
              >
                <EyeIcon /> Live Preview
              </button>
              <span className={styles.previewNote}>Static preview - download for full interactivity</span>
            </div>

            {/* Tab Content */}
            <div className={styles.resultContent}>
              {!showPreview ? (
                /* File Browser with Monaco Editor */
                <div className={styles.fileBrowser}>
                  {/* File Tree */}
                  <div className={styles.fileTree}>
                    <div className={styles.fileTreeContent}>
                      {generatedFiles.length > 0 ? (
                        renderFileTree(buildFileTree())
                      ) : (
                        <div className={styles.emptyTree}>No files generated</div>
                      )}
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className={styles.codePreview}>
                    {selectedFile ? (
                      <>
                        <div className={styles.codeHeader}>
                          <div className={styles.codeHeaderLeft}>
                            <FileIcon fileName={selectedFile.path} />
                            <span>{selectedFile.path}</span>
                          </div>
                          <span className={styles.codeLang}>
                            {getLanguageFromPath(selectedFile.path)}
                          </span>
                        </div>
                        {selectedFile.explanation && (
                          <div className={styles.fileExplanation}>
                            {selectedFile.explanation}
                          </div>
                        )}
                        <div className={styles.editorContainer}>
                          <Editor
                            height="100%"
                            theme="vs-dark"
                            language={getLanguageFromPath(selectedFile.path)}
                            value={selectedFile.content}
                            onChange={handleFileChange}
                            options={{
                              readOnly: false,
                              minimap: { enabled: true },
                              fontSize: 13,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              wordWrap: 'on',
                              automaticLayout: true,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className={styles.noSelection}>
                        <span><FileDocIcon /></span>
                        <p>Select a file from the tree to view and edit</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Live Preview */
                <div className={styles.livePreview}>
                  <iframe
                    srcDoc={previewHtml || `<!DOCTYPE html><html><head><style>body{font-family:system-ui;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}.msg{text-align:center;}.msg h2{color:#6366f1;margin-bottom:8px;}.msg p{color:#71717a;font-size:14px;}</style></head><body><div class="msg"><h2>📦 ${generatedFiles.length} Files Generated</h2><p>Click "Project Files" tab to browse code</p></div></body></html>`}
                    className={styles.previewFrame}
                    title="Project Preview"
                    sandbox="allow-scripts allow-same-origin"
                    style={{ width: '100%', height: '100%', border: 'none', background: '#0a0a0a' }}
                  />
                </div>
              )}
            </div>

            {/* Project Modification */}
            <div className={styles.modificationSection}>
              <div className={styles.modificationHeader}>
                <h3><BuilderIcon /> Continue Building</h3>
                <div className={styles.projectStateIndicator}>
                  <span className={`${styles.stateLabel} ${projectState === 'runtime' ? styles.stateRuntime : styles.stateGenerated}`}>
                    {projectState === 'runtime' ? '🟢 RUNTIME' : '🔒 GENERATED'}
                  </span>
                </div>
              </div>
              
              {projectState !== 'runtime' ? (
                /* Promotion required */
                <div className={styles.promotionRequired}>
                  <p className={styles.promotionHint}>
                    <strong>Governance:</strong> This project is in <code>GENERATED</code> state (read-only). 
                    To enable modifications, you must promote it to <code>RUNTIME</code> state.
                  </p>
                  <p className={styles.promotionDetail}>
                    Promotion creates a snapshot for rollback and enables governed mutations.
                  </p>
                  <button
                    onClick={handlePromoteProject}
                    disabled={isPromoting}
                    className={styles.promoteButton}
                  >
                    {isPromoting ? (
                      <>
                        <span className={styles.spinner}></span>
                        Promoting...
                      </>
                    ) : (
                      <>
                        <CheckIcon /> Enable Modifications (Promote to RUNTIME)
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Modification enabled */
                <>
                  <p className={styles.modificationHint}>Request changes to your project using natural language</p>
                  <div className={styles.modificationInput}>
                    <textarea
                      value={modificationRequest}
                      onChange={(e) => setModificationRequest(e.target.value)}
                      placeholder="e.g., 'Add user authentication with JWT', 'Change the color scheme to dark blue', 'Add a contact form page'..."
                      className={styles.modificationTextarea}
                      rows={3}
                      disabled={isModifying}
                    />
                    <button
                      onClick={handleModifyProject}
                      disabled={isModifying || !modificationRequest.trim()}
                      className={styles.modifyButton}
                    >
                      {isModifying ? (
                        <>
                          <span className={styles.spinner}></span>
                          Modifying...
                        </>
                      ) : (
                        <>
                          <RocketIcon /> Apply Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
              
              {showLLMError && (
                <LLMErrorNotification 
                  service="builder" 
                  inline={true}
                  onDismiss={() => setShowLLMError(false)}
                />
              )}

              {error && !showLLMError && (
                <div className={styles.modificationError}>
                  <WarningIcon /> {error}
                </div>
              )}
            </div>

            {/* Setup Instructions */}
            {setupInstructions && (
              <div className={styles.setupSection}>
                <h3><ClipboardIcon /> Setup Instructions</h3>
                <pre className={styles.setupContent}>{setupInstructions}</pre>
              </div>
            )}
          </div>
        )}

        {/* PROJECTS VIEW */}
        {viewMode === 'projects' && (
          <div className={styles.projectsView}>
            <h2>My Projects</h2>
            {projects.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><MailboxIcon /></span>
                <h3>No Projects Yet</h3>
                <p>Start building to create your first project</p>
                <button onClick={() => setViewMode('create')} className={styles.primaryButton}>
                  <PlusIcon /> Create New Project
                </button>
              </div>
            ) : (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <div key={project.project_id} className={styles.projectCard}>
                    {/* Row 1: Title + Status */}
                    <div className={styles.projectHeader}>
                      <h3 title={project.name}>{project.name}</h3>
                      <span className={`${styles.status} ${styles[project.status]}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Row 2: Meta + Tech badges */}
                    <div className={styles.projectMeta}>
                      <span><FolderIcon /> {project.files_count} files</span>
                      <span><CoinIcon /> credits</span>
                      {project.tech_stack?.slice(0, 4).map((tech) => (
                        <span key={tech} className={styles.techBadge}>{tech}</span>
                      ))}
                    </div>
                    
                    {/* Row 3: Compact action buttons */}
                    <div className={styles.projectActions}>
                      <button
                        onClick={() => handleOpenProject(project)}
                        className={styles.actionButton}
                      >
                        <FolderIcon /> Open
                      </button>
                      <button
                        onClick={() => handleDownloadProject(project)}
                        className={styles.actionButton}
                      >
                        <DownloadIcon /> Download
                      </button>
                    </div>
                    
                    {/* Description tooltip on hover */}
                    <p className={styles.projectDesc}>{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* GitHub Modal */}
      {showGitHubModal && (
        <div className={styles.modalOverlay} onClick={() => setShowGitHubModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3><GitHubIcon /> Push to GitHub</h3>
              <button onClick={() => setShowGitHubModal(false)} className={styles.modalClose}>
                <CloseIcon />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              {!githubStatus?.connected ? (
                /* Not connected - show connect button */
                <div className={styles.githubConnect}>
                  <p style={{ marginBottom: '16px', fontSize: '13px', color: '#a1a1aa' }}>
                    Connect your GitHub account to push projects directly.
                  </p>
                  <button onClick={handleConnectGitHub} className={styles.githubConnectButton}>
                    <GitHubIcon /> Connect GitHub Account
                  </button>
                  
                  <div style={{ margin: '20px 0', borderTop: '1px solid #27272a', paddingTop: '20px' }}>
                    <p style={{ marginBottom: '12px', fontSize: '12px', color: '#71717a' }}>
                      Or push manually:
                    </p>
                    <ol style={{ margin: '0 0 16px 0', padding: '0 0 0 20px', fontSize: '11px', color: '#71717a', lineHeight: '1.8' }}>
                      <li>Download the ZIP file</li>
                      <li>Create a new repository on GitHub</li>
                      <li>Extract and run git commands</li>
                    </ol>
                    <button onClick={handleDownloadZip} className={styles.githubPushButton} style={{ fontSize: '12px', padding: '8px 16px' }}>
                      <DownloadIcon /> Download ZIP
                    </button>
                  </div>
                </div>
              ) : (
                /* Connected - show repo selection */
                <div className={styles.githubRepoSelect}>
                  <p style={{ marginBottom: '12px', fontSize: '13px', color: '#a1a1aa' }}>
                    Connected as <strong style={{ color: '#fff' }}>{githubStatus.username}</strong>
                  </p>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#71717a' }}>
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value)}
                      placeholder="my-project"
                      className={styles.githubInput}
                      style={{ width: '100%', padding: '10px 12px', background: '#0a0a0a', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleConfirmPushToGitHub} 
                      className={styles.githubPushButton}
                      disabled={isPushingToGitHub}
                    >
                      {isPushingToGitHub ? 'Pushing...' : 'Push to GitHub'}
                    </button>
                    <button onClick={() => setShowGitHubModal(false)} className={styles.githubConnectButton} style={{ background: 'transparent', border: '1px solid #27272a' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildPage;
