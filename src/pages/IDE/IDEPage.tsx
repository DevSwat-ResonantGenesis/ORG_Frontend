import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
// Using refactored modular IDE layout for better performance
import { CursorIDELayoutRefactored as CursorIDELayout } from '@/components/IDE/CursorIDELayoutRefactored';
import { IDEHeader } from '@/components/IDE/IDEHeader';
import { LoadingState } from '@/components/shared/LoadingState';
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
 * IDE Page Component
 * Standalone IDE page accessible via /ide route
 * Uses Cursor-style interface
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
  
  const [projectId, setProjectId] = useState<string | undefined>(
    urlProjectId || localStorage.getItem('ide-project-id') || undefined
  );
  
  // Update projectId when URL param changes
  useEffect(() => {
    if (urlProjectId) {
      setProjectId(urlProjectId);
      localStorage.setItem('ide-project-id', urlProjectId);
    }
  }, [urlProjectId]);
  
  // Handle project files from BuildModule navigation
  useEffect(() => {
    if (locationState?.projectFiles && locationState.projectFiles.length > 0) {
      setInitialProjectFiles(locationState.projectFiles);
      setInitialProjectName(locationState.projectName);
      // Clear the location state to prevent re-loading on refresh
      window.history.replaceState({}, document.title);
    }
  }, [locationState]);

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
      localStorage.setItem('ide-project-id', newProjectId);
    } else {
      // Clear project
      setProjectId(undefined);
      localStorage.removeItem('ide-project-id');
    }
  };

  return (
    <div className={styles.idePageContainer}>
      <IDEHeader projectName={initialProjectName || 'Untitled Project'} />
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

