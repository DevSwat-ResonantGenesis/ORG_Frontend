import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
// Using refactored modular IDE layout for better performance
import { CursorIDELayoutRefactored as CursorIDELayout } from '@/components/IDE/CursorIDELayoutRefactored';
import { IDEHeader } from '@/components/IDE/IDEHeader';
import { OpenProjectModal } from '@/components/IDE/OpenProjectModal';
import { LoadingState } from '@/components/shared/LoadingState';
import { getSessionData } from '@/utils/auth-cookies';
import { listUserProjects } from '@/api/code';
import { createWorkspace } from '@/api/workspaces';
import styles from './IDEPage.module.css';

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface LocationState {
  projectFiles?: ProjectFile[];
  projectName?: string;
}

/**
 * Get user-specific storage key for IDE project
 * This ensures each user has their own project storage on this device
 */
const getUserProjectKey = (): string => {
  const session = getSessionData();
  const userId = session?.userId || session?.email || 'guest';
  return `ide-project-id-${userId}`;
};

/**
 * IDE Page Component
 * Standalone IDE page accessible via /ide route
 * Uses Cursor-style interface
 * 
 * Project Loading Priority:
 * 1. URL parameter (?projectId=xxx)
 * 2. Navigation state (from BuildModule)
 * 3. Local storage (user-specific key)
 * 4. Backend API (cross-device sync)
 */
const IDEPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const urlProjectId = searchParams.get('projectId');
  
  // Get project files from navigation state (from BuildModule)
  const locationState = location.state as LocationState | null;
  const [initialProjectFiles, setInitialProjectFiles] = useState<ProjectFile[] | undefined>(
    locationState?.projectFiles
  );
  const [initialProjectName, setInitialProjectName] = useState<string | undefined>(
    locationState?.projectName
  );
  
  // Use user-specific project storage key
  const userProjectKey = getUserProjectKey();
  const [projectId, setProjectId] = useState<string | undefined>(
    urlProjectId || localStorage.getItem(userProjectKey) || undefined
  );
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showOpenProjectModal, setShowOpenProjectModal] = useState(false);
  
  // Update projectId when URL param changes
  useEffect(() => {
    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem(userProjectKey, urlProjectId);
    }
  }, [urlProjectId, userProjectKey]);
  
  // Handle project files from BuildModule navigation
  useEffect(() => {
    if (locationState?.projectFiles && locationState.projectFiles.length > 0) {
      setInitialProjectFiles(locationState.projectFiles);
      setInitialProjectName(locationState.projectName);
      // Clear the location state to prevent re-loading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);
  
  // Load user's most recent project from backend if no local project
  // This enables cross-device project access
  useEffect(() => {
    const loadFromBackend = async () => {
      // Skip if we already have a project from URL, navigation, or localStorage
      if (projectId || urlProjectId || locationState?.projectFiles) {
        return;
      }
      
      const session = getSessionData();
      if (!session?.email) {
        // Not logged in, skip backend fetch
        return;
      }
      
      setLoadingProjects(true);
      try {
        const { projects } = await listUserProjects();
        if (projects && projects.length > 0) {
          // Load the most recent project
          const mostRecent = projects[0];
          setProjectId(mostRecent.project_id);
          localStorage.setItem(userProjectKey, mostRecent.project_id);
          if (mostRecent.name) {
            setInitialProjectName(mostRecent.name);
          }
          console.log('📂 Loaded project from backend:', mostRecent.project_id);
        }
      } catch (error) {
        console.warn('Failed to load projects from backend:', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    
    loadFromBackend();
  }, [userProjectKey]); // Only run once per user

  useEffect(() => {
    // Remove any padding/margin from body when IDE is mounted
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    // Remove padding from main content area if it exists
    const mainContent = document.querySelector('main');
    if (mainContent) {
      (mainContent as HTMLElement).style.margin = '0';
      (mainContent as HTMLElement).style.padding = '0';
    }
    
    return () => {
      // Restore on unmount
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleProjectIdChange = (newProjectId: string) => {
    if (newProjectId) {
      setProjectId(newProjectId);
      localStorage.setItem(userProjectKey, newProjectId);
    } else {
      // Clear project
      setProjectId(undefined);
      localStorage.removeItem(userProjectKey);
    }
  };

  const handleNewProject = async () => {
    const title = prompt('Name your new project:');
    if (!title?.trim()) return;
    try {
      const workspace = await createWorkspace(title.trim());
      handleProjectIdChange(workspace.id);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div className={`${styles.idePageContainer} ide-container`}>
      <IDEHeader
        projectName={initialProjectName || 'Untitled Project'}
        onNewProject={handleNewProject}
        onOpenProject={() => setShowOpenProjectModal(true)}
      />
      {showOpenProjectModal && (
        <OpenProjectModal
          onClose={() => setShowOpenProjectModal(false)}
          onSelect={handleProjectIdChange}
        />
      )}
      <Suspense fallback={<LoadingState message="Loading IDE..." />}>
        <CursorIDELayout
          projectId={projectId}
          onProjectIdChange={handleProjectIdChange}
          initialFiles={initialProjectFiles}
          initialProjectName={initialProjectName}
        />
      </Suspense>
    </div>
  );
};

export default IDEPage;

