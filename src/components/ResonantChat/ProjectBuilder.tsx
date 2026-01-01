import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { Editor } from '@monaco-editor/react';
import { generateProject, type ProjectFile, type ProjectGenerationRequest } from '@/api/code';
import { uploadProject } from '@/api/code';
import { logger } from '@/utils/logger';
import { DownloadIcon, CloseIcon, ArrowLeftIcon, FileIcon } from '@/components/Icons/ResonantChatIcons';
import { FileIcon as FileIconComponent } from '@/components/IDE/FileIcon';
import styles from './ProjectBuilder.module.css';

interface ProjectBuilderProps {
  description: string;
  projectType?: string;
  onClose?: () => void;
  onProjectGenerated?: (files: ProjectFile[]) => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  description,
  projectType,
  onClose,
  onProjectGenerated
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [setupInstructions, setSetupInstructions] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [projectStructure, setProjectStructure] = useState<any>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showSetupInstructions, setShowSetupInstructions] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate on mount
  useEffect(() => {
    if (description) {
      handleGenerate();
    }
  }, [description]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: ProjectGenerationRequest = {
        description,
        project_type: projectType
      };

      const response = await generateProject(request);
      
      logger.info('Project generation response', { 
        fileCount: response.files?.length || 0,
        files: response.files,
        hasSetupInstructions: !!response.setup_instructions
      });
      
      if (response.files && Array.isArray(response.files) && response.files.length > 0) {
        setFiles(response.files);
        if (response.files[0]) {
          setSelectedFile(response.files[0]);
        }
        // Auto-expand all folders
        const folders = new Set<string>();
        response.files.forEach(file => {
          const parts = file.path.split('/');
          for (let i = 1; i < parts.length; i++) {
            folders.add(parts.slice(0, i).join('/'));
          }
        });
        setExpandedFolders(folders);
      } else {
        logger.error('No files in response', response);
        setError('Project generated but no files were returned. Please try again.');
        setFiles([]);
      }
      
      setSetupInstructions(response.setup_instructions || '');
      setProjectStructure(response.project_structure || {});
      
      if (onProjectGenerated && response.files) {
        onProjectGenerated(response.files);
      }
    } catch (err: any) {
      logger.error('Failed to generate project', err);
      setError(err?.message || 'Failed to generate project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (files.length === 0) return;

    try {
      const zip = new JSZip();
      files.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectType || 'project'}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('Failed to create ZIP', err);
      setError('Failed to create ZIP file');
    }
  };

  const handleOpenInIDE = async () => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      // Create ZIP
      const zip = new JSZip();
      files.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const file = new File([blob], 'project.zip', { type: 'application/zip' });
      
      // Upload to IDE
      const response = await uploadProject(file);
      
      console.log('✅ Project uploaded:', {
        project_id: response.project_id,
        files_indexed: response.files_indexed,
        message: response.message
      });
      
      // Wait a moment for backend to finish indexing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to IDE with project ID
      navigate(`/ide?projectId=${response.project_id}`);
    } catch (err: any) {
      logger.error('Failed to upload project', err);
      setError(err?.message || 'Failed to upload project to IDE');
    } finally {
      setUploading(false);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'py': 'python',
      'json': 'json',
      'md': 'markdown',
      'css': 'css',
      'html': 'html',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sh': 'shell',
      'bash': 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const buildFileTree = (): Array<{ path: string; name: string; type: 'file' | 'folder'; children?: any[] }> => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            path: parts.slice(0, index + 1).join('/'),
            name: part,
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: index === parts.length - 1 ? undefined : {},
            file: index === parts.length - 1 ? file : undefined
          };
        }
        if (index < parts.length - 1) {
          current = current[part].children;
        }
      });
    });
    
    const convertToArray = (obj: any): any[] => {
      return Object.values(obj).map((item: any) => ({
        ...item,
        children: item.children ? convertToArray(item.children) : undefined
      }));
    };
    
    return convertToArray(tree);
  };

  const fileTree = buildFileTree();

  const renderFileTree = (nodes: any[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile?.path === node.path;
      
      if (node.type === 'folder') {
        return (
          <div key={node.path}>
            <div
              className={`${styles.treeNode} ${isExpanded ? styles.expanded : ''}`}
              style={{ paddingLeft: `${level * 16 + 12}px` }}
              onClick={() => {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(node.path);
                } else {
                  newExpanded.add(node.path);
                }
                setExpandedFolders(newExpanded);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.folderIcon}>
                <path d={isExpanded 
                  ? "M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z"
                  : "M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z"
                } />
              </svg>
              <span className={styles.treeNodeName}>{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div className={styles.treeChildren}>
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        );
      }
      
      return (
        <div
          key={node.path}
          className={`${styles.treeNode} ${styles.fileNode} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => setSelectedFile(node.file)}
        >
          <FileIconComponent fileName={node.name} />
          <span className={styles.treeNodeName}>{node.name}</span>
          <span className={styles.fileLanguage}>{getLanguageFromPath(node.path)}</span>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={styles.projectBuilder}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <h3>Generating Your Project</h3>
          <p className={styles.loadingText}>Using AI to create your project files...</p>
          <p className={styles.loadingSubtext}>This may take 10-15 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.projectBuilder}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Generation Failed</h3>
          <p className={styles.errorText}>{error}</p>
          <div className={styles.errorActions}>
            <button onClick={handleGenerate} className={styles.primaryButton}>
              Try Again
            </button>
            {onClose && (
              <button onClick={onClose} className={styles.secondaryButton}>
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={styles.projectBuilder}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Ready to Generate</h3>
          <p className={styles.emptyText}>Click below to generate your project</p>
          <button onClick={handleGenerate} className={styles.primaryButton}>
            Generate Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {onClose && (
            <button onClick={onClose} className={styles.backButton} title="Back to chat">
              <ArrowLeftIcon />
            </button>
          )}
          <div className={styles.headerTitle}>
            <h2>✨ Generated Project</h2>
            <span className={styles.projectMeta}>
              {files.length} {files.length === 1 ? 'file' : 'files'} • {description}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleOpenInIDE} 
            className={styles.primaryButton}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '🚀 Open in IDE'}
          </button>
          <button onClick={handleDownloadAll} className={styles.secondaryButton}>
            <DownloadIcon /> Download ZIP
          </button>
          {onClose && (
            <button onClick={onClose} className={styles.iconButton} title="Close">
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* File Tree Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Project Files</h3>
            <span className={styles.fileCount}>{files.length}</span>
          </div>
          <div className={styles.fileTree}>
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Code Editor */}
        <div className={styles.editorSection}>
          {selectedFile ? (
            <>
              <div className={styles.editorHeader}>
                <div className={styles.editorHeaderLeft}>
                  <FileIconComponent fileName={selectedFile.path} />
                  <span className={styles.editorPath}>{selectedFile.path}</span>
                </div>
                <div className={styles.editorHeaderRight}>
                  <span className={styles.editorStats}>
                    {selectedFile.content.split('\n').length} lines • {getLanguageFromPath(selectedFile.path)}
                  </span>
                </div>
              </div>
              {selectedFile.explanation && (
                <div className={styles.fileExplanation}>
                  <p>{selectedFile.explanation}</p>
                </div>
              )}
              <div className={styles.editorContainer}>
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={getLanguageFromPath(selectedFile.path)}
                  value={selectedFile.content}
                  options={{
                    readOnly: true,
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
              <div className={styles.noSelectionIcon}>📄</div>
              <h3>Select a File</h3>
              <p>Click on any file in the sidebar to view its contents</p>
            </div>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      {setupInstructions && (
        <div className={styles.setupSection}>
          <button
            className={styles.setupToggle}
            onClick={() => setShowSetupInstructions(!showSetupInstructions)}
          >
            <h3>📋 Setup Instructions</h3>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`${styles.chevron} ${showSetupInstructions ? styles.expanded : ''}`}
            >
              <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showSetupInstructions && (
            <div className={styles.setupContent}>
              <pre className={styles.instructionsText}>{setupInstructions}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
