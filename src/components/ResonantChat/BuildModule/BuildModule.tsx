/**
 * Build Module - Full project builder from code blocks
 * Creates a complete file tree and allows editing/preview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildProject, getProject, updateProjectFile, downloadProject, type BuildResponse, type ProjectFile, type CodeBlock } from '@/api/build';
import { 
  RocketIcon, 
  DownloadIcon, 
  CloseIcon, 
  RefreshIcon,
  HtmlFileIcon,
  CssFileIcon,
  JsFileIcon,
  JsonFileIcon,
  PythonFileIcon,
  DefaultFileIcon
} from '@/components/Icons/ResonantChatIcons';
import styles from './BuildModule.module.css';

interface BuildModuleProps {
  codeBlocks: CodeBlock[];
  projectName?: string;
  onClose: () => void;
  onProjectBuilt?: (project: BuildResponse) => void;
}

export const BuildModule: React.FC<BuildModuleProps> = ({
  codeBlocks,
  projectName,
  onClose,
  onProjectBuilt,
}) => {
  const navigate = useNavigate();
  const [isBuilding, setIsBuilding] = useState(false);
  const [project, setProject] = useState<BuildResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Build project on mount
  useEffect(() => {
    if (codeBlocks.length > 0 && !project) {
      handleBuild();
    }
  }, [codeBlocks]);

  const handleBuild = async () => {
    setIsBuilding(true);
    setError(null);
    
    try {
      const result = await buildProject({
        code_blocks: codeBlocks,
        project_name: projectName,
      });
      
      setProject(result);
      onProjectBuilt?.(result);
      
      // Select entry point file by default
      const entryFile = result.files.find(f => f.path === result.entry_point);
      if (entryFile) {
        setSelectedFile(entryFile);
        setEditedContent(entryFile.content);
      }
      
      // Generate preview
      generatePreview(result.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to build project');
    } finally {
      setIsBuilding(false);
    }
  };

  const generatePreview = (files: ProjectFile[]) => {
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    const cssFiles = files.filter(f => f.path.endsWith('.css'));
    const jsFiles = files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.jsx'));
    
    // Build CSS content
    const cssContent = cssFiles.map(css => css.content).join('\n');
    
    // Build JS content
    const jsContent = jsFiles.map(js => js.content).join('\n');
    
    if (htmlFile) {
      let html = htmlFile.content;
      
      // Inject CSS inline - try multiple approaches
      if (html.includes('</head>')) {
        html = html.replace('</head>', `<style>${cssContent}</style></head>`);
      } else if (html.includes('<body')) {
        html = html.replace('<body', `<style>${cssContent}</style><body`);
      } else {
        // Prepend style
        html = `<style>${cssContent}</style>${html}`;
      }
      
      // Inject JS inline - try multiple approaches
      if (html.includes('</body>')) {
        html = html.replace('</body>', `<script>${jsContent}</script></body>`);
      } else {
        // Append script
        html = `${html}<script>${jsContent}</script>`;
      }
      
      setPreviewHtml(html);
    } else if (jsFiles.length > 0 || cssFiles.length > 0) {
      // No HTML file - create a basic one
      const canvasMatch = jsFiles.some(js => js.content.includes('canvas') || js.content.includes('Canvas'));
      
      const generatedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project?.project_name || 'Preview'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
    ${cssContent}
  </style>
</head>
<body>
  ${canvasMatch ? '<canvas id="game" width="600" height="400"></canvas>' : '<div id="app"></div>'}
  <script>
    ${jsContent}
  </script>
</body>
</html>`;
      
      setPreviewHtml(generatedHtml);
    }
  };

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
    setEditedContent(file.content);
  };

  const handleSaveFile = async () => {
    if (!project || !selectedFile) return;
    
    setIsSaving(true);
    try {
      await updateProjectFile(project.project_id, selectedFile.path, editedContent);
      
      // Update local state
      const updatedFiles = project.files.map(f =>
        f.path === selectedFile.path ? { ...f, content: editedContent } : f
      );
      setProject({ ...project, files: updatedFiles });
      setSelectedFile({ ...selectedFile, content: editedContent });
      
      // Regenerate preview
      generatePreview(updatedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!project) return;
    
    try {
      const result = await downloadProject(project.project_id);
      window.open(`http://localhost:8003${result.download_url}`, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download project');
    }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.html') || path.endsWith('.htm')) return <HtmlFileIcon />;
    if (path.endsWith('.css')) return <CssFileIcon />;
    if (path.endsWith('.js') || path.endsWith('.jsx')) return <JsFileIcon />;
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return <JsFileIcon />;
    if (path.endsWith('.json')) return <JsonFileIcon />;
    if (path.endsWith('.py')) return <PythonFileIcon />;
    return <DefaultFileIcon />;
  };

  if (isBuilding) {
    return (
      <div className={styles.buildModule}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Building project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.buildModule}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={handleBuild}>Retry</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.buildModule}>
        <div className={styles.empty}>
          <p>No code blocks to build</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.buildModule}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.projectInfo}>
          <h3>{project.project_name}</h3>
          <span className={styles.projectType}>{project.project_type}</span>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => {
              // Navigate to IDE with project files
              navigate('/ide', { state: { projectFiles: project.files, projectName: project.project_name } });
            }} 
            className={styles.ideBtn}
          >
            <RocketIcon /> Open in IDE
          </button>
          <button onClick={handleDownload} className={styles.downloadBtn}>
            <DownloadIcon /> Download
          </button>
          <button onClick={onClose} className={styles.closeBtn}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* File Tree */}
        <div className={styles.fileTree}>
          <div className={styles.fileTreeHeader}>
            <span>Files</span>
          </div>
          <div className={styles.fileList}>
            {project.files.map(file => (
              <div
                key={file.path}
                className={`${styles.fileItem} ${selectedFile?.path === file.path ? styles.selected : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <span className={styles.fileIcon}>{getFileIcon(file.path)}</span>
                <span className={styles.fileName}>{file.path}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className={styles.editor}>
          {selectedFile ? (
            <>
              <div className={styles.editorHeader}>
                <span>{selectedFile.path}</span>
                <button
                  onClick={handleSaveFile}
                  disabled={isSaving || editedContent === selectedFile.content}
                  className={styles.saveBtn}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
              <textarea
                className={styles.editorTextarea}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                spellCheck={false}
              />
            </>
          ) : (
            <div className={styles.editorEmpty}>
              Select a file to edit
            </div>
          )}
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span>Preview</span>
            <button onClick={() => generatePreview(project.files)} className={styles.refreshBtn}>
              <RefreshIcon />
            </button>
          </div>
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className={styles.previewIframe}
              title="Project Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className={styles.previewEmpty}>
              No preview available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildModule;
