import React, { memo, useState, useEffect } from 'react';
import { useIDE } from '../context/IDEContext';
import { CursorFileTree, type FileNode } from '../CursorFileTree';
import { CodeSearchPanel } from '../CodeSearchPanel';
import { GitPanel } from '../GitPanel';
import { IDESettingsPanel } from '../IDESettingsPanel';
import { ResizablePanel } from '../ResizablePanel';
import { DebuggerPanel } from '../DebuggerPanel';
import { useDSIDP } from '@/hooks/useDSIDPAccelerator';
import styles from '../CursorIDELayout.module.css';

interface IDESidePanelProps {
  projectId?: string;
  files: FileNode[];
  onFileClick: (path: string) => void;
  onFileDoubleClick?: (path: string) => void;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onRename?: (path: string, newName?: string) => void;
  onDelete?: (path: string) => void;
  onArchive?: (path: string) => void;
  onMove?: (sourcePath: string, targetPath: string) => void;
  onClearProject?: () => void;
  onUploadClick?: () => void;
  loading?: boolean;
  monacoEditor?: any;
  onRunCode?: () => void;
  activeFilePath?: string;
}

export const IDESidePanel = memo(function IDESidePanel({
  projectId,
  files,
  onFileClick,
  onFileDoubleClick,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onArchive,
  onMove,
  onClearProject,
  onUploadClick,
  loading,
  monacoEditor,
  onRunCode,
  activeFilePath,
}: IDESidePanelProps) {
  const { state, dispatch } = useIDE();
  const {
    activeView,
    showFileExplorer,
    showGitPanel,
    expandedFolders,
    activeTabId,
    fileTreeWidth,
    gitPanelWidth,
  } = state;

  const handleToggleFolder = (path: string) => {
    dispatch({ type: 'TOGGLE_FOLDER', payload: path });
  };

  const handleFileTreeWidthChange = (width: number) => {
    dispatch({ type: 'SET_FILE_TREE_WIDTH', payload: width });
  };

  const handleGitPanelWidthChange = (width: number) => {
    dispatch({ type: 'SET_GIT_PANEL_WIDTH', payload: width });
  };

  // File Explorer View
  if (activeView === 'files' && showFileExplorer) {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={fileTreeWidth}
        minSize={180}
        maxSize={500}
        onResize={handleFileTreeWidthChange}
        className={styles.fileExplorerContainer}
      >
        {files.length === 0 ? (
          <div className={styles.uploadPrompt}>
            <p>No project loaded</p>
            <button
              className={styles.uploadButton}
              onClick={onUploadClick}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload Project ZIP'}
            </button>
            {loading && <p className={styles.uploadHint}>Please wait while your project is being processed...</p>}
          </div>
        ) : (
          <CursorFileTree
            files={files}
            onFileClick={onFileClick}
            onFileDoubleClick={onFileDoubleClick}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            activeFile={activeTabId}
            onNewFile={onNewFile}
            onNewFolder={onNewFolder}
            onRename={onRename}
            onDelete={onDelete}
            onArchive={onArchive}
            onMove={onMove}
            onClearProject={onClearProject}
            projectId={projectId}
          />
        )}
      </ResizablePanel>
    );
  }

  // Search View
  if (activeView === 'search') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={400}
        minSize={300}
        maxSize={800}
        className={styles.searchViewContainer}
      >
        <CodeSearchPanel
          onFileSelect={(filePath, lineNumber) => {
            onFileClick(filePath);
            setTimeout(() => {
              if (monacoEditor && lineNumber > 0) {
                monacoEditor.setPosition({ lineNumber, column: 1 });
                monacoEditor.revealLineInCenter(lineNumber);
              }
            }, 300);
          }}
          onClose={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' })}
        />
      </ResizablePanel>
    );
  }

  // Git View / Source Control
  if (activeView === 'git') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={gitPanelWidth}
        minSize={280}
        maxSize={600}
        onResize={handleGitPanelWidthChange}
        className={styles.gitViewContainer}
      >
        {projectId ? (
          <GitPanel projectId={projectId} />
        ) : (
          <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
              <h3>Source Control</h3>
            </div>
            <div className={styles.viewContent} style={{ padding: '16px' }}>
              <div className={styles.featureSection}>
                <h4>Git Integration</h4>
                <p style={{ color: 'var(--ide-text-secondary)', marginBottom: '12px' }}>
                  No project loaded. Upload or create a project to use Git features.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    className={styles.actionButton}
                    onClick={onUploadClick}
                  >
                    📁 Upload Project
                  </button>
                </div>
              </div>
              <div className={styles.featureSection}>
                <h4>Features</h4>
                <ul style={{ color: 'var(--ide-text-secondary)', fontSize: '12px', paddingLeft: '16px' }}>
                  <li>Initialize repositories</li>
                  <li>Stage & commit changes</li>
                  <li>Branch management</li>
                  <li>View commit history</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </ResizablePanel>
    );
  }

  // Collaboration View
  if (activeView === 'collaboration') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={350}
        minSize={300}
        maxSize={600}
        className={styles.collaborationViewContainer}
      >
        <div className={styles.viewContainer}>
          <div className={styles.viewHeader}>
            <h3>Collaboration</h3>
          </div>
          <div className={styles.viewContent}>
            <div className={styles.featureSection}>
              <h4>Live Collaboration</h4>
              <p>Real-time code editing with team members</p>
              <button className={styles.actionButton}>Start Session</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Team Chat</h4>
              <p>Integrated team communication</p>
              <button className={styles.actionButton}>Open Chat</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Shared Clipboard</h4>
              <p>Share code snippets instantly</p>
              <button className={styles.actionButton}>Enable</button>
            </div>
          </div>
        </div>
      </ResizablePanel>
    );
  }

  // Deployment View
  if (activeView === 'deployment') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={350}
        minSize={300}
        maxSize={600}
        className={styles.deploymentViewContainer}
      >
        <div className={styles.viewContainer}>
          <div className={styles.viewHeader}>
            <h3>Deployment</h3>
          </div>
          <div className={styles.viewContent}>
            <div className={styles.featureSection}>
              <h4>Cloud Deploy</h4>
              <p>Deploy to AWS, Azure, GCP</p>
              <button className={styles.actionButton}>Configure</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Docker</h4>
              <p>Containerize and deploy</p>
              <button className={styles.actionButton}>Build Image</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Monitoring</h4>
              <p>Track deployment status</p>
              <button className={styles.actionButton}>View Logs</button>
            </div>
          </div>
        </div>
      </ResizablePanel>
    );
  }

  // Run and Debug View
  if (activeView === 'run') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={400}
        minSize={300}
        maxSize={700}
        className={styles.runViewContainer}
      >
        <DebuggerPanel 
          filePath={activeFilePath}
          onClose={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' })}
        />
      </ResizablePanel>
    );
  }

  // Testing View
  if (activeView === 'testing') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={350}
        minSize={300}
        maxSize={600}
        className={styles.testingViewContainer}
      >
        <div className={styles.viewContainer}>
          <div className={styles.viewHeader}>
            <h3>Testing</h3>
          </div>
          <div className={styles.viewContent}>
            <div className={styles.featureSection}>
              <h4>Unit Tests</h4>
              <p>Run and manage unit tests</p>
              <button className={styles.actionButton}>Run All Tests</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Coverage</h4>
              <p>View code coverage reports</p>
              <button className={styles.actionButton}>Generate Report</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Continuous Testing</h4>
              <p>Auto-run tests on save</p>
              <button className={styles.actionButton}>Enable</button>
            </div>
          </div>
        </div>
      </ResizablePanel>
    );
  }

  // Extensions View
  if (activeView === 'extensions') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={350}
        minSize={300}
        maxSize={600}
        className={styles.extensionsViewContainer}
      >
        <div className={styles.viewContainer}>
          <div className={styles.viewHeader}>
            <h3>Extensions</h3>
          </div>
          <div className={styles.viewContent}>
            <div className={styles.featureSection}>
              <h4>Installed Extensions</h4>
              <p>No extensions installed</p>
              <button className={styles.actionButton}>Browse Marketplace</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Recommended</h4>
              <p>Extensions for your workspace</p>
              <button className={styles.actionButton}>View Recommendations</button>
            </div>
            <div className={styles.featureSection}>
              <h4>Custom Extensions</h4>
              <p>Create your own extensions</p>
              <button className={styles.actionButton}>Developer Guide</button>
            </div>
          </div>
        </div>
      </ResizablePanel>
    );
  }

  // Settings View
  if (activeView === 'settings') {
    return (
      <ResizablePanel
        direction="horizontal"
        defaultSize={400}
        minSize={300}
        maxSize={600}
        className={styles.settingsViewContainer}
      >
        <IDESettingsPanel onClose={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' })} />
      </ResizablePanel>
    );
  }

  // DSID-P Accelerator Metrics Panel
  if (activeView === 'dsidp') {
    return <DSIDPMetricsPanel />;
  }

  return null;
});

// DSID-P Metrics Panel Component
const DSIDPMetricsPanel: React.FC = () => {
  const { dispatch } = useIDE();
  const {
    initialized,
    executing,
    costMetrics,
    performanceMetrics,
    currentTask,
  } = useDSIDP();

  return (
    <ResizablePanel
      direction="horizontal"
      defaultSize={350}
      minSize={300}
      maxSize={600}
      className={styles.dsidpViewContainer}
    >
      <div className={styles.viewContainer}>
        <div className={styles.viewHeader}>
          <h3>DSID-P Accelerator</h3>
          <span style={{ 
            fontSize: 10, 
            padding: '2px 6px', 
            borderRadius: 4,
            background: initialized ? 'var(--ide-success)' : 'var(--ide-warning)',
            color: 'white'
          }}>
            {initialized ? 'Active' : 'Initializing'}
          </span>
        </div>
        <div className={styles.viewContent}>
          {/* Status */}
          <div className={styles.featureSection}>
            <h4>Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>State:</span>
                <span style={{ color: executing ? 'var(--ide-accent)' : 'var(--ide-text-secondary)' }}>
                  {executing ? '⚡ Executing' : '● Idle'}
                </span>
              </div>
              {currentTask && (
                <div style={{ fontSize: 11, color: 'var(--ide-text-secondary)' }}>
                  Current: {currentTask.description?.substring(0, 40) || 'Task'}...
                </div>
              )}
            </div>
          </div>

          {/* Cost Metrics */}
          <div className={styles.featureSection}>
            <h4>💰 Cost Metrics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Cost:</span>
                <span style={{ fontWeight: 600, color: 'var(--ide-accent)' }}>
                  ${costMetrics?.totalCost?.toFixed(4) || '0.0000'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Tokens:</span>
                <span>{costMetrics?.totalTokens?.toLocaleString() || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Requests:</span>
                <span>{costMetrics?.totalRequests?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={styles.featureSection}>
            <h4>⚡ Performance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Response Time:</span>
                <span>{performanceMetrics?.responseTime?.toFixed(0) || 0}ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Memory Usage:</span>
                <span>{performanceMetrics?.memoryUsage?.toFixed(1) || 0} MB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cache Hit Rate:</span>
                <span style={{ color: 'var(--ide-success)' }}>
                  {(performanceMetrics?.cacheHitRate * 100)?.toFixed(1) || 0}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Connections:</span>
                <span>{performanceMetrics?.activeConnections || 0}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.featureSection}>
            <h4>Actions</h4>
            <button 
              className={styles.actionButton}
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' })}
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>
    </ResizablePanel>
  );
};
