// SplitView Module - Main refactored component using modular architecture

import React, { useEffect, useCallback, useState, Suspense } from 'react';
import { 
  CloseIcon, 
  CodeIcon, 
  PreviewIcon, 
  TerminalIcon, 
  PlayIcon, 
  LoadingIcon,
  RocketIcon,
  BuildIcon,
  VisualizerIcon
} from '@/components/Icons/ResonantChatIcons';

// Lazy load BuildModule
const BuildModule = React.lazy(() => 
  import('@/components/ResonantChat/BuildModule').then(m => ({ default: m.BuildModule }))
);

// Types
import type { ProjectFile, TabType } from './types';

// Hooks
import { useSplitViewState, useFileTree, useCodeBlocks, useResizable } from './hooks';

// Components
import { 
  FileTree, 
  CodeEditor, 
  Terminal, 
  Preview, 
  CodeBlockList,
  NewFileDialog,
  DeleteConfirmDialog 
} from './components';

// Constants
import { getDefaultContent, DEFAULT_SPLIT_WIDTH } from './constants';

// API Client
import { 
  executeCode, 
  executeTerminalCommand, 
  writeProjectFile,
  startProjectPreview
} from '@/api/code';

// Styles
import styles from './EnhancedSplitView.module.css';

interface MessageType {
  id: string;
  content: string;
  role: string;
  [key: string]: any; // Allow additional properties
}

type SplitViewPane = 'chat' | 'split';

export interface SplitViewModuleProps {
  children: React.ReactNode;
  enabled: boolean;
  onClose: () => void;
  selectedMessageId: string | null;
  messages: MessageType[];
  onCopyCode: (code: string) => void;
  initialWidth?: number;
  onWidthChange?: (width: number) => void;
  embedded?: boolean;
  mobileSinglePane?: boolean;
  mobilePane?: SplitViewPane;
  autoOpenRequest?: {
    requestId: number;
    tab: TabType;
    previewUrl?: string | null;
  };
  // Project mode props
  projectMode?: boolean;
  projectFiles?: ProjectFile[];
  projectId?: string;
  // Build module props (controlled from parent)
  showBuildModule?: boolean;
  onCloseBuildModule?: () => void;
  // Code Visualizer integration
  visualizerAnalysisId?: string | null;
  // Agents OS integration
  agentsPanelUrl?: string;
}

const AgentsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export const SplitViewModule: React.FC<SplitViewModuleProps> = ({
  children,
  enabled,
  onClose,
  selectedMessageId,
  messages,
  onCopyCode,
  initialWidth = DEFAULT_SPLIT_WIDTH,
  onWidthChange,
  embedded = false,
  mobileSinglePane = false,
  mobilePane = 'chat',
  autoOpenRequest,
  projectMode = false,
  projectFiles: initialProjectFiles = [],
  projectId,
  showBuildModule: showBuildModuleProp = false,
  onCloseBuildModule,
  visualizerAnalysisId = null,
  agentsPanelUrl = '/agents',
}) => {
  // Local state for project files (editable)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(initialProjectFiles);
  
  // Build mode state - use prop if provided, otherwise local state
  const [showBuildModuleLocal, setShowBuildModuleLocal] = useState(false);
  const showBuildModule = showBuildModuleProp || showBuildModuleLocal;
  const setShowBuildModule = (value: boolean) => {
    if (onCloseBuildModule && !value) {
      onCloseBuildModule();
    }
    setShowBuildModuleLocal(value);
  };

  // Sync project files when prop changes
  useEffect(() => {
    setProjectFiles(initialProjectFiles);
  }, [initialProjectFiles]);

  // State management
  const { state, actions } = useSplitViewState(initialWidth);
  
  // Resizable panel
  const { containerRef, width, startResize } = useResizable({
    initialWidth,
    onWidthChange,
    enabled,
  });

  // File tree
  const { fileTree } = useFileTree(projectFiles);

  // Code blocks from messages
  const { codeBlocks } = useCodeBlocks(messages, selectedMessageId);

  const lastAutoOpenRequestIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!autoOpenRequest) return;
    if (lastAutoOpenRequestIdRef.current === autoOpenRequest.requestId) return;

    lastAutoOpenRequestIdRef.current = autoOpenRequest.requestId;
    if (autoOpenRequest.previewUrl) {
      actions.setPreviewConfig({ url: autoOpenRequest.previewUrl });
    }
    actions.setActiveTab(autoOpenRequest.tab);
  }, [enabled, autoOpenRequest, actions]);

  // Auto-switch to visualizer tab when analysisId is provided
  const prevAnalysisIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (visualizerAnalysisId && visualizerAnalysisId !== prevAnalysisIdRef.current) {
      prevAnalysisIdRef.current = visualizerAnalysisId;
      actions.setActiveTab('visualizer');
    }
  }, [visualizerAnalysisId, actions]);

  // Auto-select first file when project files change
  useEffect(() => {
    if (projectFiles.length > 0 && !state.selectedFile) {
      actions.setSelectedFile(projectFiles[0]);
    }
  }, [projectFiles, state.selectedFile, actions]);

  // Handle terminal command submission - Connected to IDE backend
  const handleTerminalSubmit = useCallback(async () => {
    if (!state.terminalInput.trim()) return;

    const command = state.terminalInput.trim();
    actions.addTerminalOutput({ content: command, type: 'command' });
    actions.setTerminalInput('');
    actions.setIsRunning(true);

    try {
      const result = await executeTerminalCommand(command);
      if (result.stdout) {
        actions.addTerminalOutput({ content: result.stdout, type: 'stdout' });
      }
      if (result.stderr) {
        actions.addTerminalOutput({ content: result.stderr, type: 'stderr' });
      }
      if (result.exit_code !== 0) {
        actions.addTerminalOutput({ content: `Exit code: ${result.exit_code}`, type: 'info' });
      }
    } catch (err: any) {
      actions.addTerminalOutput({ content: err.message || 'Command failed', type: 'stderr' });
    } finally {
      actions.setIsRunning(false);
    }
  }, [state.terminalInput, actions]);

  // Handle run code - Connected to IDE backend
  const handleRunCode = useCallback(async () => {
    // Try to run selected file first, then fall back to code blocks
    const codeToRun = state.selectedFile 
      ? { code: state.selectedFile.content, language: state.selectedFile.language, name: state.selectedFile.path }
      : codeBlocks && codeBlocks.length > 0 
        ? { code: codeBlocks[0].code, language: codeBlocks[0].language, name: 'code block' }
        : null;

    if (!codeToRun) return;

    actions.setIsRunning(true);
    actions.setActiveTab('terminal');
    actions.addTerminalOutput({ 
      content: `Running ${codeToRun.name}...`, 
      type: 'info' 
    });

    try {
      const result = await executeCode(codeToRun.code, codeToRun.language);
      if (result.output) {
        actions.addTerminalOutput({ content: result.output, type: 'stdout' });
      }
      if (result.error) {
        actions.addTerminalOutput({ content: result.error, type: 'stderr' });
      }
      if (!result.output && !result.error) {
        actions.addTerminalOutput({ content: 'Execution completed (no output)', type: 'info' });
      }
    } catch (err: any) {
      actions.addTerminalOutput({ content: err.message || 'Execution failed', type: 'stderr' });
    } finally {
      actions.setIsRunning(false);
    }
  }, [state.selectedFile, codeBlocks, actions]);

  // Handle file change - Connected to IDE backend
  const handleFileChange = useCallback(async (path: string, content: string) => {
    // Update local state
    setProjectFiles(prev => prev.map(f => 
      f.path === path ? { ...f, content } : f
    ));
    
    // Save to backend if project exists
    if (projectId) {
      try {
        await writeProjectFile(path, content, undefined, projectId);
      } catch (err) {
        console.error('Failed to save file:', err);
      }
    }
  }, [projectId]);

  // Handle create file
  const handleCreateFile = useCallback(async () => {
    if (!state.newFileName.trim()) return;

    const path = state.newFileName.trim();
    const language = state.newFileLanguage;
    const content = getDefaultContent(language);
    
    // Add to local state
    const newFile: ProjectFile = { path, content, language };
    setProjectFiles(prev => [...prev, newFile]);
    actions.setSelectedFile(newFile);
    
    // Save to backend if project exists
    if (projectId) {
      try {
        await writeProjectFile(path, content, language, projectId);
      } catch (err) {
        console.error('Failed to create file:', err);
      }
    }

    actions.setShowNewFileDialog(false);
    actions.setNewFileName('');
  }, [state.newFileName, state.newFileLanguage, projectId, actions]);

  // Handle delete file
  const handleDeleteFile = useCallback((path: string) => {
    setProjectFiles(prev => prev.filter(f => f.path !== path));
    actions.setShowDeleteConfirm(null);
    if (state.selectedFile?.path === path) {
      actions.setSelectedFile(projectFiles.find(f => f.path !== path) || null);
    }
  }, [state.selectedFile, projectFiles, actions]);

  // Handle start preview - Connected to IDE backend
  const handleStartPreview = useCallback(async () => {
    if (!projectId) return;
    
    actions.addTerminalOutput({ content: 'Starting preview server...', type: 'info' });
    
    try {
      const result = await startProjectPreview(projectId);
      if (result.preview_url) {
        actions.setPreviewConfig({ url: result.preview_url, port: result.port, processId: result.process_id });
        actions.addTerminalOutput({ content: `Preview running at ${result.preview_url}`, type: 'info' });
        actions.setActiveTab('preview');
      }
    } catch (err: any) {
      actions.addTerminalOutput({ content: err.message || 'Failed to start preview', type: 'stderr' });
    }
  }, [projectId, actions]);

  // If not enabled, just render children
  if (!enabled) {
    return <>{children}</>;
  }

  if (mobileSinglePane) {
    return (
      <div
        className={styles.splitViewContainer}
        ref={containerRef}
        style={embedded ? { height: '100%', overflow: 'visible' } : undefined}
      >
        {mobilePane === 'chat' ? (
          <div className={styles.chatPanel} style={{ width: '100%', overflow: embedded ? 'visible' : undefined }}>
            {children}
          </div>
        ) : (
          <div className={styles.codePanel} style={{ width: '100%' }}>
            {/* Header with Tabs */}
            <div className={styles.codePanelHeader}>
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${state.activeTab === 'code' ? styles.activeTab : ''}`}
                  onClick={() => actions.setActiveTab('code')}
                  title="Code"
                  aria-label="Code"
                >
                  <span className={styles.tabIcon}><CodeIcon /></span>
                </button>
                <button
                  className={`${styles.tab} ${state.activeTab === 'preview' ? styles.activeTab : ''}`}
                  onClick={() => actions.setActiveTab('preview')}
                  title="Preview"
                  aria-label="Preview"
                >
                  <span className={styles.tabIcon}><PreviewIcon /></span>
                </button>
                <button
                  className={`${styles.tab} ${state.activeTab === 'terminal' ? styles.activeTab : ''}`}
                  onClick={() => actions.setActiveTab('terminal')}
                  title="Terminal"
                  aria-label="Terminal"
                >
                  <span className={styles.tabIcon}><TerminalIcon /></span>
                </button>
                <button
                  className={`${styles.tab} ${state.activeTab === 'visualizer' ? styles.activeTab : ''} ${styles.visualizerTab}`}
                  onClick={() => actions.setActiveTab('visualizer')}
                  title="Visualizer"
                  aria-label="Visualizer"
                >
                  <span className={styles.tabIcon}><VisualizerIcon /></span>
                </button>
                <button
                  className={`${styles.tab} ${state.activeTab === 'agents' ? styles.activeTab : ''} ${styles.agentsTab}`}
                  onClick={() => actions.setActiveTab('agents')}
                  title="Agents OS"
                  aria-label="Agents OS"
                >
                  <span className={styles.tabIcon}><AgentsIcon /></span>
                </button>
              </div>
              <div className={styles.headerActions}>
                {codeBlocks && codeBlocks.length > 0 && (
                  <button
                    className={styles.buildButton}
                    onClick={() => setShowBuildModule(true)}
                    title="Build project from code"
                  >
                    <BuildIcon /> Build
                  </button>
                )}
                {state.activeTab === 'code' && codeBlocks && codeBlocks.length > 0 && (
                  <button
                    className={styles.runButton}
                    onClick={handleRunCode}
                    disabled={state.isRunning}
                    title="Run code"
                  >
                    {state.isRunning ? <LoadingIcon /> : <PlayIcon />} Run
                  </button>
                )}
                {state.activeTab === 'preview' && (
                  <button
                    className={styles.runButton}
                    onClick={handleStartPreview}
                    title="Start preview"
                  >
                    <RocketIcon /> Start Preview
                  </button>
                )}
                {state.activeTab === 'visualizer' && (
                  <button
                    className={styles.runButton}
                    onClick={() => window.open(visualizerAnalysisId ? `/code-visualizer?analysis_id=${visualizerAnalysisId}` : '/code-visualizer', '_blank')}
                    title="Open in full screen"
                  >
                    <RocketIcon /> Full Screen
                  </button>
                )}
                {state.activeTab === 'agents' && (
                  <button
                    className={styles.runButton}
                    onClick={() => window.open(agentsPanelUrl, '_blank')}
                    title="Open Agents OS in full screen"
                  >
                    <RocketIcon /> Full Screen
                  </button>
                )}
                <button
                  className={styles.codePanelClose}
                  onClick={onClose}
                  title="Close split view"
                >
                  <CloseIcon />
                </button>
              </div>

            </div>
            {/* Tab Content */}
            <div className={styles.codePanelContent}>
              {/* Code Tab */}
              {state.activeTab === 'code' && (
                <div className={styles.codeTabContent}>
                  {projectMode && projectFiles.length > 0 ? (
                    <div className={styles.projectView}>
                      {/* File Tree Sidebar */}
                      <div className={styles.fileTreeSidebar}>
                        <div className={styles.fileTreeHeader}>
                          <span>Files</span>
                          <div className={styles.fileTreeActions}>
                            <span className={styles.fileCount}>{projectFiles.length}</span>
                            <button
                              className={styles.newFileButton}
                              onClick={() => actions.setShowNewFileDialog(true)}
                              title="New file"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className={styles.fileTree}>
                          <FileTree
                            nodes={fileTree}
                            selectedFile={state.selectedFile}
                            expandedFolders={state.expandedFolders}
                            onSelectFile={actions.setSelectedFile}
                            onToggleFolder={actions.toggleFolder}
                            onDeleteFile={(path) => actions.setShowDeleteConfirm(path)}
                          />
                        </div>
                      </div>

                      {/* Editor */}
                      <div className={styles.editorArea}>
                        <CodeEditor
                          file={state.selectedFile}
                          onFileChange={handleFileChange}
                          onCopyCode={onCopyCode}
                        />
                      </div>
                    </div>
                  ) : codeBlocks ? (
                    <CodeBlockList codeBlocks={codeBlocks} onCopyCode={onCopyCode} />
                  ) : (
                    <div className={styles.codePanelEmpty}>
                      {selectedMessageId
                        ? 'No code blocks in this message'
                        : 'Click on a message with code to view it here'}
                    </div>
                  )}
                </div>
              )}

              {/* Preview Tab - only render iframe when active to save CPU */}
              {state.activeTab === 'preview' && (
                <Preview 
                  config={state.previewConfig} 
                  codeBlocks={codeBlocks || undefined} 
                  isActive={state.activeTab === 'preview'}
                />
              )}

              {/* Terminal Tab */}
              {state.activeTab === 'terminal' && (
                <Terminal
                  output={state.terminalOutput}
                  input={state.terminalInput}
                  isRunning={state.isRunning}
                  onInputChange={actions.setTerminalInput}
                  onSubmit={handleTerminalSubmit}
                  onClear={actions.clearTerminal}
                  disabled={false}
                />
              )}

              {/* Visualizer Tab - Code Visualizer UI */}
              {state.activeTab === 'visualizer' && (
                <div className={styles.visualizerTabContent}>
                  {visualizerAnalysisId ? (
                    <iframe
                      title="Code Visualizer"
                      src={`/api/v1/code-visualizer-ui/?analysis_id=${visualizerAnalysisId}`}
                      className={styles.visualizerIframe}
                      allow="fullscreen"
                    />
                  ) : (
                    <div className={styles.codePanelEmpty}>
                      Run a code visualizer analysis or open the full Visualizer page to start a new scan.
                    </div>
                  )}
                </div>
              )}

              {/* Agents Tab - Agents OS UI */}
              {state.activeTab === 'agents' && (
                <div className={styles.agentsTabContent}>
                  <iframe
                    title="Agents OS"
                    src={agentsPanelUrl}
                    className={styles.agentsIframe}
                    allow="fullscreen"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dialogs */}
        <NewFileDialog
          isOpen={state.showNewFileDialog}
          fileName={state.newFileName}
          language={state.newFileLanguage}
          onFileNameChange={actions.setNewFileName}
          onLanguageChange={actions.setNewFileLanguage}
          onSubmit={handleCreateFile}
          onClose={() => actions.setShowNewFileDialog(false)}
        />

        <DeleteConfirmDialog
          filePath={state.showDeleteConfirm}
          onConfirm={handleDeleteFile}
          onCancel={() => actions.setShowDeleteConfirm(null)}
        />

        {/* Build Module Modal */}
        {showBuildModule && codeBlocks && (
          <div className={styles.buildModuleOverlay}>
            <Suspense fallback={<div className={styles.buildModuleLoading}>Loading Build Module...</div>}>
              <BuildModule
                codeBlocks={codeBlocks}
                onClose={() => setShowBuildModule(false)}
              />
            </Suspense>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.splitViewContainer}
      ref={containerRef}
      style={embedded ? { height: '100%', overflow: 'visible' } : undefined}
    >
      {/* Chat Panel */}
      <div className={styles.chatPanel} style={{ width: `${width}%`, overflow: embedded ? 'visible' : undefined }}>
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className={styles.resizeHandle}
        onMouseDown={startResize}
      />

      {/* Code Panel */}
      <div className={styles.codePanel} style={{ width: `${100 - width}%` }}>
        {/* Header with Tabs */}
        <div className={styles.codePanelHeader}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${state.activeTab === 'code' ? styles.activeTab : ''}`}
              onClick={() => actions.setActiveTab('code')}
              title="Code"
              aria-label="Code"
            >
              <span className={styles.tabIcon}><CodeIcon /></span>
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'preview' ? styles.activeTab : ''}`}
              onClick={() => actions.setActiveTab('preview')}
              title="Preview"
              aria-label="Preview"
            >
              <span className={styles.tabIcon}><PreviewIcon /></span>
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'terminal' ? styles.activeTab : ''}`}
              onClick={() => actions.setActiveTab('terminal')}
              title="Terminal"
              aria-label="Terminal"
            >
              <span className={styles.tabIcon}><TerminalIcon /></span>
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'visualizer' ? styles.activeTab : ''} ${styles.visualizerTab}`}
              onClick={() => actions.setActiveTab('visualizer')}
              title="Visualizer"
              aria-label="Visualizer"
            >
              <span className={styles.tabIcon}><VisualizerIcon /></span>
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'agents' ? styles.activeTab : ''} ${styles.agentsTab}`}
              onClick={() => actions.setActiveTab('agents')}
              title="Agents OS"
              aria-label="Agents OS"
            >
              <span className={styles.tabIcon}><AgentsIcon /></span>
            </button>
          </div>
          <div className={styles.headerActions}>
            {codeBlocks && codeBlocks.length > 0 && (
              <button
                className={styles.buildButton}
                onClick={() => setShowBuildModule(true)}
                title="Build project from code"
              >
                <BuildIcon /> Build
              </button>
            )}
            {state.activeTab === 'code' && codeBlocks && codeBlocks.length > 0 && (
              <button
                className={styles.runButton}
                onClick={handleRunCode}
                disabled={state.isRunning}
                title="Run code"
              >
                {state.isRunning ? <LoadingIcon /> : <PlayIcon />} Run
              </button>
            )}
            {state.activeTab === 'preview' && (
              <button
                className={styles.runButton}
                onClick={handleStartPreview}
                title="Start preview"
              >
                <RocketIcon /> Start Preview
              </button>
            )}
            {state.activeTab === 'visualizer' && (
              <button
                className={styles.runButton}
                onClick={() => window.open(visualizerAnalysisId ? `/code-visualizer?analysis_id=${visualizerAnalysisId}` : '/code-visualizer', '_blank')}
                title="Open in full screen"
              >
                <RocketIcon /> Full Screen
              </button>
            )}
            {state.activeTab === 'agents' && (
              <button
                className={styles.runButton}
                onClick={() => window.open(agentsPanelUrl, '_blank')}
                title="Open Agents OS in full screen"
              >
                <RocketIcon /> Full Screen
              </button>
            )}
            <button
              className={styles.codePanelClose}
              onClick={onClose}
              title="Close split view"
            >
              <CloseIcon />
            </button>
          </div>

        </div>
        {/* Tab Content */}
        <div className={styles.codePanelContent}>
          {/* Code Tab */}
          {state.activeTab === 'code' && (
            <div className={styles.codeTabContent}>
              {projectMode && projectFiles.length > 0 ? (
                <div className={styles.projectView}>
                  {/* File Tree Sidebar */}
                  <div className={styles.fileTreeSidebar}>
                    <div className={styles.fileTreeHeader}>
                      <span>Files</span>
                      <div className={styles.fileTreeActions}>
                        <span className={styles.fileCount}>{projectFiles.length}</span>
                        <button
                          className={styles.newFileButton}
                          onClick={() => actions.setShowNewFileDialog(true)}
                          title="New file"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className={styles.fileTree}>
                      <FileTree
                        nodes={fileTree}
                        selectedFile={state.selectedFile}
                        expandedFolders={state.expandedFolders}
                        onSelectFile={actions.setSelectedFile}
                        onToggleFolder={actions.toggleFolder}
                        onDeleteFile={(path) => actions.setShowDeleteConfirm(path)}
                      />
                    </div>
                  </div>

                  {/* Editor */}
                  <div className={styles.editorArea}>
                    <CodeEditor
                      file={state.selectedFile}
                      onFileChange={handleFileChange}
                      onCopyCode={onCopyCode}
                    />
                  </div>
                </div>
              ) : codeBlocks ? (
                <CodeBlockList codeBlocks={codeBlocks} onCopyCode={onCopyCode} />
              ) : (
                <div className={styles.codePanelEmpty}>
                  {selectedMessageId
                    ? 'No code blocks in this message'
                    : 'Click on a message with code to view it here'}
                </div>
              )}
            </div>
          )}

          {/* Preview Tab - only render iframe when active to save CPU */}
          {state.activeTab === 'preview' && (
            <Preview 
              config={state.previewConfig} 
              codeBlocks={codeBlocks || undefined} 
              isActive={state.activeTab === 'preview'}
            />
          )}

          {/* Terminal Tab */}
          {state.activeTab === 'terminal' && (
            <Terminal
              output={state.terminalOutput}
              input={state.terminalInput}
              isRunning={state.isRunning}
              onInputChange={actions.setTerminalInput}
              onSubmit={handleTerminalSubmit}
              onClear={actions.clearTerminal}
              disabled={false}
            />
          )}

          {/* Visualizer Tab - Code Visualizer UI */}
          {state.activeTab === 'visualizer' && (
            <div className={styles.visualizerTabContent}>
              {visualizerAnalysisId ? (
                <iframe
                  title="Code Visualizer"
                  src={`/api/v1/code-visualizer-ui/?analysis_id=${visualizerAnalysisId}`}
                  className={styles.visualizerIframe}
                  allow="fullscreen"
                />
              ) : (
                <div className={styles.codePanelEmpty}>
                  Run a code visualizer analysis or open the full Visualizer page to start a new scan.
                </div>
              )}
            </div>
          )}

          {/* Agents Tab - Agents OS UI */}
          {state.activeTab === 'agents' && (
            <div className={styles.agentsTabContent}>
              <iframe
                title="Agents OS"
                src={agentsPanelUrl}
                className={styles.agentsIframe}
                allow="fullscreen"
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NewFileDialog
        isOpen={state.showNewFileDialog}
        fileName={state.newFileName}
        language={state.newFileLanguage}
        onFileNameChange={actions.setNewFileName}
        onLanguageChange={actions.setNewFileLanguage}
        onSubmit={handleCreateFile}
        onClose={() => actions.setShowNewFileDialog(false)}
      />

      <DeleteConfirmDialog
        filePath={state.showDeleteConfirm}
        onConfirm={handleDeleteFile}
        onCancel={() => actions.setShowDeleteConfirm(null)}
      />

      {/* Build Module Modal */}
      {showBuildModule && codeBlocks && (
        <div className={styles.buildModuleOverlay}>
          <Suspense fallback={<div className={styles.buildModuleLoading}>Loading Build Module...</div>}>
            <BuildModule
              codeBlocks={codeBlocks}
              onClose={() => setShowBuildModule(false)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(SplitViewModule);
