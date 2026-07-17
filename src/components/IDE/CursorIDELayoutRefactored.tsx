/**
 * CursorIDELayout - Refactored Modular Version
 * 
 * This is the refactored version of the IDE layout that uses:
 * - IDEContext for centralized state management
 * - Custom hooks for file operations
 * - Modular components for toolbar, activity bar, and side panels
 * 
 * Original: 2464 lines with 40+ useState hooks
 * Refactored: ~400 lines with clean separation of concerns
 */

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Context & Hooks
import { IDEProvider, useIDE } from './context/IDEContext';
import { useFileOperations } from './hooks/useFileOperations';

// Modular Components
import { IDEToolbar } from './components/IDEToolbar';
import { IDEActivityBar } from './components/IDEActivityBar';
import { IDESidePanel } from './components/IDESidePanel';

// Existing Components
import { CursorChatPanel, type Agent } from './CursorChatPanel';
import { CursorEditorView } from './CursorEditorView';
import { CursorTabsBar } from './CursorTabsBar';
import { CursorTerminalPanel } from './CursorTerminalPanel';
import { CommandPalette, type Command } from './CommandPalette';
import { StatusBar } from './StatusBar';
import { ResizablePanel } from './ResizablePanel';
import { PatchModal } from './PatchModal';
import { InlineComment } from './InlineComment';
import { AdvancedFeaturesPanel } from './AdvancedFeaturesPanel';
import { IDEDropdownMenu } from './IDEDropdownMenu';
import { ProjectArchiveDialog } from './ProjectArchiveDialog';
import { ProjectRestoreDialog } from './ProjectRestoreDialog';
import { ProjectTransferDialog } from './ProjectTransferDialog';
import { CursorPreviewPanel } from './CursorPreviewPanel';

// API & Utils
import { sendResonantMessage } from '@/api/resonantChat';
import { readProjectFile, writeProjectFile, createProjectFile, deleteProjectFile, uploadProject, downloadProject } from '@/api/code';
import { initializeDSIDP, trackLLMUsage } from '@/api/dsidpAccelerator';
import { useToastContext } from '@/context/ToastContext';
import { useThemeStore } from '@/store/themeStore';
import { logger } from '@/utils/logger';
import { getSessionData } from '@/utils/auth-cookies';
import { LLMErrorNotification, isLLMError } from '@/components/shared/LLMErrorNotification';

// Initialize DSID-P Accelerator on module load
initializeDSIDP();

import styles from './CursorIDELayout.module.css';

// ============================================================================
// Props
// ============================================================================

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface CursorIDELayoutProps {
  projectId?: string;
  onClose?: () => void;
  onProjectIdChange?: (projectId: string) => void;
  initialFiles?: ProjectFile[];
  initialProjectName?: string;
}

// ============================================================================
// Inner Component (uses context)
// ============================================================================

function IDELayoutInner({ projectId, onClose, onProjectIdChange, initialFiles, initialProjectName }: CursorIDELayoutProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useIDE();
  const initialFilesLoadedRef = useRef(false);
  const hasLoadedAnyFilesRef = useRef(false);
  const [showLLMErrorModal, setShowLLMErrorModal] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  const session = getSessionData();
  const userId = session?.userId || session?.email || 'guest';
  const projectFilesStorageKey = `ide-project-files-${userId}`;
  const projectNameStorageKey = `ide-project-name-${userId}`;
  const { success, error: showError } = useToastContext();
  const { theme, toggleTheme } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File operations hook
  const {
    files,
    openFiles,
    activeTabId,
    unsavedChanges,
    loadProjectFiles,
    handleFileClick,
    handleSave,
    handleNewFile,
    handleNewFolder,
    handleRename,
    handleDelete,
    handleMove,
    handleClearProject,
    flattenFiles,
    findFirstFile,
  } = useFileOperations({
    projectId,
    onSuccess: success,
    onError: showError,
  });

  // Destructure state
  const {
    tabs,
    showChat,
    activeView,
    showTerminal,
    commandPaletteOpen,
    commandPaletteMode,
    cursorPosition,
    currentLanguage,
    gitBranch,
    gitStatus,
    errors,
    warnings,
    monacoEditor,
    selectedProvider,
    selectedAgent,
    teams,
    patchModal,
    inlineComment,
    showAdvancedPanel,
    showPreview,
    showRestoreDialog,
    showTransferDialog,
    showArchiveDialog,
    archiveDialogData,
    chatPanelWidth,
    previewPanelWidth,
    loading,
    showMinimap,
    wordWrap,
    showGitPanel,
    showAgentTeams,
    showSearch,
    showFileExplorer,
  } = state;

  // Active file content
  const activeFileContent = activeTabId ? openFiles.get(activeTabId) || '' : '';

  // Merge file contents from openFiles into files array for chat context
  const filesWithContent = useMemo(() => {
    return files.map(file => ({
      ...file,
      content: openFiles.get(file.path) || file.content || '',
    }));
  }, [files, openFiles]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load initial files from BuildModule navigation FIRST (before project load)
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && !initialFilesLoadedRef.current) {
      initialFilesLoadedRef.current = true;
      
      // Convert to IDE file format and dispatch
      const ideFiles = initialFiles.map(f => ({
        id: f.path,
        name: f.path.split('/').pop() || f.path,
        path: f.path,
        type: 'file' as const,
        language: f.language,
        content: f.content,
      }));
      
      dispatch({ type: 'SET_FILES', payload: ideFiles });
      
      // Open the first file
      if (ideFiles.length > 0) {
        const firstFile = ideFiles[0];
        dispatch({ type: 'OPEN_FILE', payload: { path: firstFile.path, content: firstFile.content } });
      }
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem(projectFilesStorageKey, JSON.stringify(ideFiles));
        localStorage.setItem(projectNameStorageKey, initialProjectName || 'Untitled Project');
      } catch (e) {
        console.error('Failed to save project to localStorage:', e);
      }
      
      success(`Loaded ${initialFiles.length} files from Build${initialProjectName ? `: ${initialProjectName}` : ''}`);
    }
  }, [initialFiles, initialProjectName, dispatch, success]);

  // Load project files on mount - check localStorage first, then backend
  useEffect(() => {
    // Skip if we have initial files from Build navigation
    if (initialFilesLoadedRef.current) {
      return;
    }
    
    // Build tree from flat file list
    const buildTreeFromFlat = (flatFiles: any[]): any[] => {
      const tree: any[] = [];
      const pathMap = new Map<string, any>();
      
      // Sort by path to ensure parents are processed before children
      const normalized = Array.isArray(flatFiles) ? flatFiles.filter((f) => f && typeof f.path === 'string') : [];
      const sorted = [...normalized].sort((a, b) => a.path.localeCompare(b.path));
      
      sorted.forEach((file) => {
        const parts = file.path.split('/');
        let currentPath = '';
        
        parts.forEach((part: string, index: number) => {
          const isLast = index === parts.length - 1;
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!pathMap.has(currentPath)) {
            const node = isLast ? { ...file } : {
              path: currentPath,
              name: part,
              type: 'folder' as const,
              children: [],
            };
            pathMap.set(currentPath, node);
            
            if (index === 0) {
              tree.push(node);
            } else {
              const parentPath = parts.slice(0, index).join('/');
              const parent = pathMap.get(parentPath);
              if (parent) {
                const children = Array.isArray(parent.children) ? parent.children : [];
                parent.children = children;
                if (!children.some((c: any) => c.path === currentPath)) {
                  children.push(node);
                }
              }
            }
          }
        });
      });
      
      return tree;
    };
    
    // Load from backend FIRST if we have a projectId (source of truth)
    // localStorage is only used as fallback for offline/no projectId scenarios
    if (projectId) {
      console.log('📂 Loading from backend (source of truth)...');
      (async () => {
        const loadedCount = await loadProjectFiles();
        if (loadedCount > 0) {
          return;
        }

        try {
          const perUserSavedFiles = localStorage.getItem(projectFilesStorageKey);
          const legacySavedFiles = localStorage.getItem('ide-project-files');
          const savedFiles = perUserSavedFiles || legacySavedFiles;
          if (savedFiles) {
            const parsedFiles = JSON.parse(savedFiles);
            if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
              const fileTree = buildTreeFromFlat(parsedFiles);
              dispatch({ type: 'SET_FILES', payload: fileTree });

              const firstFile = parsedFiles.find((f: any) => f.type === 'file');
              if (firstFile && firstFile.content) {
                dispatch({ type: 'OPEN_FILE', payload: { path: firstFile.path, content: firstFile.content } });
              }

              initialFilesLoadedRef.current = true;
              console.log('📂 Backend empty; loaded from localStorage fallback:', parsedFiles.length, 'files');

              if (!perUserSavedFiles && legacySavedFiles) {
                localStorage.setItem(projectFilesStorageKey, legacySavedFiles);
                localStorage.removeItem('ide-project-files');
              }
            }
          }
        } catch (e) {
          console.error('Failed to load project from localStorage fallback:', e);
        }
      })();
      return;
    }
    
    // Fallback: Try to load from localStorage only if no projectId
    try {
      const perUserSavedFiles = localStorage.getItem(projectFilesStorageKey);
      const legacySavedFiles = localStorage.getItem('ide-project-files');
      const savedFiles = perUserSavedFiles || legacySavedFiles;
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
          // Rebuild tree structure from flat files
          const fileTree = buildTreeFromFlat(parsedFiles);
          dispatch({ type: 'SET_FILES', payload: fileTree });
          
          // Open the first file
          const firstFile = parsedFiles.find((f: any) => f.type === 'file');
          if (firstFile && firstFile.content) {
            dispatch({ type: 'OPEN_FILE', payload: { path: firstFile.path, content: firstFile.content } });
          }
          
          initialFilesLoadedRef.current = true;
          console.log('📂 Loaded from localStorage (fallback):', parsedFiles.length, 'files');

          if (!perUserSavedFiles && legacySavedFiles) {
            localStorage.setItem(projectFilesStorageKey, legacySavedFiles);
            localStorage.removeItem('ide-project-files');
          }
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load project from localStorage:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, dispatch]); // Remove loadProjectFiles from deps to prevent re-runs

  // Poll for file changes made outside the browser tab - specifically,
  // Claude Code CLI writing into this project's terminal /workspace
  // (RG_Terminal_Sandbox's periodic sync pushes those into the same
  // Hash Sphere project_id every ~10s, see workspace_sync.py). Not a
  // websocket push, so "live" here means "within one poll interval",
  // not instant - a reasonable middle ground without a new transport.
  useEffect(() => {
    if (!projectId) return;
    const interval = setInterval(() => {
      loadProjectFiles();
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Save files to localStorage whenever they change
  useEffect(() => {
    // Flatten tree structure for localStorage
    const flattenTree = (nodes: typeof files): typeof files => {
      const result: typeof files = [];
      const traverse = (items: typeof files) => {
        for (const item of items) {
          result.push(item);
          if (item.children && item.children.length > 0) {
            traverse(item.children);
          }
        }
      };
      traverse(nodes);
      return result;
    };
    
    if (files.length > 0) {
      hasLoadedAnyFilesRef.current = true;
      const timer = setTimeout(() => {
        try {
          // Flatten and include content from openFiles
          const flatFiles = flattenTree(files);
          const filesWithContent = flatFiles.map(f => {
            const content = openFiles.get(f.path);
            return content !== undefined ? { ...f, content } : f;
          });
          console.log('💾 Saving to localStorage:', filesWithContent.length, 'files');
          localStorage.setItem(projectFilesStorageKey, JSON.stringify(filesWithContent));
        } catch (e) {
          console.error('Failed to save project to localStorage:', e);
        }
      }, 500); // Reduced debounce
      return () => clearTimeout(timer);
    } else {
      // Clear localStorage when no files
      console.log('💾 Clearing localStorage - no files');
      if (hasLoadedAnyFilesRef.current) {
        localStorage.removeItem(projectFilesStorageKey);
        localStorage.removeItem(projectNameStorageKey);
        localStorage.removeItem('ide-project-files');
        localStorage.removeItem('ide-project-name');
      }
    }
  }, [files, openFiles]);

  // Auto-open first file
  useEffect(() => {
    if (files.length > 0 && openFiles.size === 0 && tabs.length === 0 && projectId) {
      const firstFile = findFirstFile(files);
      if (firstFile) {
        setTimeout(() => handleFileClick(firstFile.path), 100);
      }
    }
  }, [files.length, projectId, openFiles.size, tabs.length, findFirstFile, handleFileClick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isInputField) {
        e.preventDefault();
        dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: true, mode: 'command' } });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'p' && !isInputField) {
        e.preventDefault();
        dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: true, mode: 'file' } });
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !isInputField) {
        e.preventDefault();
        if (activeTabId && unsavedChanges.has(activeTabId)) {
          handleSave();
        }
      }

      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: false } });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, activeTabId, unsavedChanges, handleSave, dispatch]);

  // Update cursor position from Monaco
  useEffect(() => {
    if (!monacoEditor) return;

    const updateCursorPosition = () => {
      const position = monacoEditor.getPosition();
      if (position) {
        dispatch({
          type: 'SET_CURSOR_POSITION',
          payload: { line: position.lineNumber, column: position.column },
        });
      }
    };

    const disposable = monacoEditor.onDidChangeCursorPosition(updateCursorPosition);
    updateCursorPosition();

    return () => disposable.dispose();
  }, [monacoEditor, dispatch]);

  // Update language from active file
  useEffect(() => {
    if (activeTabId) {
      const ext = activeTabId.split('.').pop()?.toLowerCase() || '';
      const langMap: Record<string, string> = {
        ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
        py: 'Python', json: 'JSON', md: 'Markdown', css: 'CSS', html: 'HTML',
      };
      dispatch({ type: 'SET_CURRENT_LANGUAGE', payload: langMap[ext] || ext.toUpperCase() });
    } else {
      dispatch({ type: 'SET_CURRENT_LANGUAGE', payload: '' });
    }
  }, [activeTabId, dispatch]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleTabClick = useCallback((tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  }, [dispatch]);

  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_FILE', payload: tabId });
  }, [dispatch]);

  const handleEditorChange = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (value: string | undefined) => {
      if (!activeTabId) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { path: activeTabId, content: value || '' } });
        dispatch({ type: 'MARK_UNSAVED', payload: activeTabId });
      }, 150);
    };
  }, [activeTabId, dispatch]);

  const handleEditorMount = useCallback((editor: any) => {
    dispatch({ type: 'SET_MONACO_EDITOR', payload: editor });
  }, [dispatch]);

  const handleChatMessage = useCallback(async (message: string): Promise<string> => {
    try {
      const response = await sendResonantMessage({
        message,
        preferred_provider: selectedProvider,
        use_rag: true,
      });
      
      // Track token usage for DSID-P cost metrics
      const responseContent = response.message?.content || 'No response received';
      const inputTokens = Math.ceil(message.length / 4); // Estimate ~4 chars per token
      const outputTokens = Math.ceil(responseContent.length / 4);
      const model = (response as any).model || (selectedProvider === 'auto' ? 'gpt-4' : selectedProvider);
      trackLLMUsage(model, inputTokens, outputTokens);
      
      return responseContent;
    } catch (error: any) {
      logger.error('Failed to send chat message', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to send message';
      
      // Check if this is an LLM provider error
      if (isLLMError(errorMessage)) {
        setLlmError(errorMessage);
        setShowLLMErrorModal(true);
        return 'AI service unavailable. Please check the error modal for details.';
      }
      
      return 'Sorry, I encountered an error. Please try again.';
    }
  }, [selectedProvider]);

  const handleUploadProject = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      showError('Please select a ZIP file');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await uploadProject(file);
      if (response.project_id && onProjectIdChange) {
        onProjectIdChange(response.project_id);
      }
      await loadProjectFiles(response.project_id);
      success('Project uploaded successfully');
    } catch (error: any) {
      logger.error('Failed to upload project', error);
      showError('Failed to upload project');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, loadProjectFiles, onProjectIdChange, success, showError]);

  const handleScreenshot = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.querySelector(`.${styles.ideContainer}`) as HTMLElement;
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `ide-screenshot-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        success('Screenshot saved');
      }
    } catch (error) {
      showError('Failed to take screenshot');
    }
  }, [success, showError]);

  const handleToggleSplitView = useCallback((mode: 'horizontal' | 'vertical') => {
    dispatch({ type: 'SET_SPLIT_VIEW', payload: state.splitView === mode ? 'none' : mode });
  }, [dispatch, state.splitView]);

  const handleToggleMinimap = useCallback(() => {
    if (monacoEditor) {
      monacoEditor.updateOptions({ minimap: { enabled: !showMinimap } });
      dispatch({ type: 'TOGGLE_MINIMAP' });
    }
  }, [monacoEditor, showMinimap, dispatch]);

  const handleToggleWordWrap = useCallback(() => {
    if (monacoEditor) {
      monacoEditor.updateOptions({ wordWrap: wordWrap ? 'off' : 'on' });
      dispatch({ type: 'TOGGLE_WORD_WRAP' });
    }
  }, [monacoEditor, wordWrap, dispatch]);

  const handleFormatDocument = useCallback(() => {
    monacoEditor?.getAction('editor.action.formatDocument')?.run();
  }, [monacoEditor]);

  const handleGoToLine = useCallback(() => {
    monacoEditor?.getAction('editor.action.gotoLine')?.run();
  }, [monacoEditor]);

  // Run current file code
  const handleRunCode = useCallback(async () => {
    if (!activeTabId || !activeFileContent) {
      showError('No file open to run');
      return;
    }

    // Detect language from file extension
    const ext = activeTabId.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      py: 'python',
      js: 'javascript',
      ts: 'typescript',
      jsx: 'jsx',
      tsx: 'tsx',
      sh: 'bash',
    };
    const language = langMap[ext];

    if (!language) {
      showError(`Cannot run .${ext} files directly. Use terminal instead.`);
      return;
    }

    // Show terminal and execute
    dispatch({ type: 'TOGGLE_TERMINAL', payload: true });

    try {
      const CODE_EXECUTION_URL = 'http://localhost:8002';
      const response = await fetch(`${CODE_EXECUTION_URL}/code/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: activeFileContent,
          language: language,
          timeout: 30,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        success(`✅ Code executed successfully`);
        console.log('Execution output:', result.output);
      } else {
        showError(`❌ Execution failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      showError(`Failed to execute code: ${error.message}`);
    }
  }, [activeTabId, activeFileContent, dispatch, success, showError]);

  // Command action map
  const commandActions = useMemo(() => ({
    save: handleSave,
    format: handleFormatDocument,
    goto: handleGoToLine,
    'toggle-terminal': () => dispatch({ type: 'TOGGLE_TERMINAL' }),
    'toggle-sidebar': () => dispatch({ type: 'TOGGLE_FILE_EXPLORER' }),
  }), [handleSave, handleFormatDocument, handleGoToLine, dispatch]);

  // Build commands for command palette
  const buildCommands = useCallback((): Command[] => [
    { id: 'save', label: 'Save File', shortcut: 'Ctrl+S' },
    { id: 'format', label: 'Format Document', shortcut: 'Ctrl+Shift+F' },
    { id: 'goto', label: 'Go to Line', shortcut: 'Ctrl+G' },
    { id: 'toggle-terminal', label: 'Toggle Terminal' },
    { id: 'toggle-sidebar', label: 'Toggle Sidebar' },
  ], []);

  const handleCommandSelect = useCallback((command: Command) => {
    if (command.type === 'file' && command.path) {
      handleFileClick(command.path);
    } else {
      const action = commandActions[command.id as keyof typeof commandActions];
      if (action) action();
    }
    dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: false } });
  }, [handleFileClick, commandActions, dispatch]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={styles.ideContainer} data-theme={theme}>
      {/* Toolbar */}
      <IDEToolbar
        onSave={handleSave}
        onUpload={() => fileInputRef.current?.click()}
        onScreenshot={handleScreenshot}
        onToggleSplitView={handleToggleSplitView}
        onMenuClick={() => dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: true, mode: 'command' } })}
        hasUnsavedChanges={activeTabId ? unsavedChanges.has(activeTabId) : false}
        onRunCode={handleRunCode}
      />

      {/* Dialogs */}
      {archiveDialogData && (
        <ProjectArchiveDialog
          isOpen={showArchiveDialog}
          onClose={() => dispatch({ type: 'SET_ARCHIVE_DIALOG', payload: { show: false } })}
          onArchived={() => loadProjectFiles()}
          projectId={archiveDialogData.projectId}
          projectPath={archiveDialogData.path}
        />
      )}

      <ProjectRestoreDialog
        isOpen={showRestoreDialog}
        onClose={() => dispatch({ type: 'SET_RESTORE_DIALOG', payload: false })}
        onRestored={async (newProjectId: string) => {
          await loadProjectFiles();
          if (newProjectId && onProjectIdChange) {
            onProjectIdChange(newProjectId);
          }
        }}
      />

      <ProjectTransferDialog
        isOpen={showTransferDialog}
        onClose={() => dispatch({ type: 'SET_TRANSFER_DIALOG', payload: false })}
        projectId={projectId || ''}
      />

      {/* IDE Content */}
      <div className={styles.ideContent}>
        {/* Activity Bar */}
        <IDEActivityBar />

        {/* Side Panel */}
        <IDESidePanel
          projectId={projectId}
          files={files}
          onFileClick={handleFileClick}
          onFileDoubleClick={handleFileClick}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={handleRename}
          onDelete={handleDelete}
          onMove={handleMove}
          onClearProject={handleClearProject}
          onUploadClick={() => fileInputRef.current?.click()}
          loading={loading}
          monacoEditor={monacoEditor}
          onRunCode={handleRunCode}
          activeFilePath={activeTabId || undefined}
        />

        {/* Main Panel */}
        <div className={styles.mainPanel}>
          <CursorTabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />

          <div className={styles.editorContainer}>
            <CursorEditorView
              filePath={activeTabId}
              content={activeFileContent}
              onChange={handleEditorChange}
              onSave={handleSave}
              onEditorMount={handleEditorMount}
            />
            {showTerminal && (
              <CursorTerminalPanel projectId={projectId} files={files} onProjectIdChange={onProjectIdChange} />
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={previewPanelWidth}
            minSize={300}
            maxSize={600}
            onResize={(w) => dispatch({ type: 'SET_PREVIEW_PANEL_WIDTH', payload: w })}
            className={styles.previewPanelContainer}
            handlePosition="left"
          >
            <CursorPreviewPanel />
          </ResizablePanel>
        )}

        {/* Chat Panel */}
        {(showChat || activeView === 'ai') && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={chatPanelWidth}
            minSize={300}
            maxSize={600}
            onResize={(w) => dispatch({ type: 'SET_CHAT_PANEL_WIDTH', payload: w })}
            className={styles.chatPanelContainer}
            handlePosition="left"
          >
            <CursorChatPanel
              onClose={() => {
                dispatch({ type: 'TOGGLE_CHAT', payload: false });
                if (activeView === 'ai') {
                  dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'files' });
                }
              }}
              onSendMessage={handleChatMessage}
              selectedProvider={selectedProvider}
              onProviderChange={(p) => dispatch({ type: 'SET_PROVIDER', payload: p })}
              projectId={projectId}
              selectedAgent={selectedAgent}
              onAgentChange={(a) => dispatch({ type: 'SET_AGENT', payload: a })}
              teams={teams}
              onOpenFile={handleFileClick}
              files={filesWithContent}
              activeFilePath={activeTabId || undefined}
              onApplyChanges={async (changes) => {
                console.log('🔧 Applying changes:', changes, 'projectId:', projectId);
                
                // Helper function to apply changes locally (in state)
                const applyLocally = (change: typeof changes[0], filePath: string) => {
                  if (change.type === 'create' || change.type === 'modify') {
                    const existingFile = files.find(f => f.path === filePath || f.path === change.path);
                    
                    if (existingFile) {
                      dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { path: existingFile.path, content: change.content || '' } });
                      dispatch({ type: 'OPEN_FILE', payload: { path: existingFile.path, content: change.content || '' } });
                      console.log(`✅ Updated existing file: ${existingFile.path}`);
                    } else {
                      const fileName = filePath.split('/').pop() || filePath;
                      const newFile = {
                        name: fileName,
                        path: filePath,
                        type: 'file' as const,
                        content: change.content || '',
                      };
                      dispatch({ type: 'ADD_FILE', payload: newFile });
                      dispatch({ type: 'OPEN_FILE', payload: { path: filePath, content: change.content || '' } });
                      console.log(`✅ Created new file: ${filePath}`);
                    }
                  } else if (change.type === 'delete') {
                    dispatch({ type: 'DELETE_FILE', payload: change.path });
                    console.log(`✅ Deleted file: ${change.path}`);
                  }
                };
                
                let appliedCount = 0;
                
                for (const change of changes) {
                  // Normalize the file path
                  let filePath = change.path;
                  if (!filePath.startsWith('/')) {
                    filePath = '/' + filePath;
                  }
                  
                  console.log(`📝 Processing ${change.type} for ${filePath}`);
                  
                  if (projectId) {
                    // Try backend API first, fallback to local state on error
                    try {
                      if (change.type === 'create') {
                        await createProjectFile(filePath, false, change.content || '', projectId);
                      } else if (change.type === 'modify') {
                        await writeProjectFile(filePath, change.content || '', undefined, projectId);
                      } else if (change.type === 'delete') {
                        await deleteProjectFile(filePath, projectId);
                      }
                      appliedCount++;
                    } catch (err: any) {
                      console.warn(`⚠️ Backend failed for ${change.path}, applying locally:`, err.message);
                      // Fallback: apply changes locally in state
                      applyLocally(change, filePath);
                      appliedCount++;
                    }
                  } else {
                    // No projectId - apply directly to local state
                    applyLocally(change, filePath);
                    appliedCount++;
                  }
                }
                
                // Reload project files if using backend (only if some succeeded via backend)
                if (projectId) {
                  try {
                    await loadProjectFiles();
                  } catch (err) {
                    console.warn('Failed to reload project files:', err);
                  }
                }
                
                success(`Applied ${appliedCount} change(s)`);
              }}
            />
          </ResizablePanel>
        )}
      </div>

      {/* Modals */}
      {patchModal && (
        <PatchModal
          oldCode={patchModal.oldCode}
          newCode={patchModal.newCode}
          fileName={patchModal.fileName}
          onApply={async () => {
            await writeProjectFile(patchModal.filePath, patchModal.newCode, undefined, projectId);
            dispatch({ type: 'SET_PATCH_MODAL', payload: null });
            success('Patch applied');
          }}
          onCancel={() => dispatch({ type: 'SET_PATCH_MODAL', payload: null })}
        />
      )}

      {inlineComment && (
        <InlineComment
          top={inlineComment.top}
          left={inlineComment.left}
          message={inlineComment.message}
          examples={inlineComment.examples}
          relatedConcepts={inlineComment.relatedConcepts}
          onClose={() => dispatch({ type: 'SET_INLINE_COMMENT', payload: null })}
        />
      )}

      {showAdvancedPanel && (
        <AdvancedFeaturesPanel
          projectId={projectId}
          onClose={() => dispatch({ type: 'TOGGLE_ADVANCED_PANEL', payload: false })}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        mode={commandPaletteMode}
        commands={buildCommands()}
        files={files.map(f => ({ path: f.path, name: f.name, type: f.type }))}
        onSelect={handleCommandSelect}
        onClose={() => dispatch({ type: 'SET_COMMAND_PALETTE', payload: { open: false } })}
      />

      {/* Status Bar */}
      <StatusBar
        activeFile={activeTabId}
        lineNumber={cursorPosition.line}
        columnNumber={cursorPosition.column}
        language={currentLanguage}
        encoding="UTF-8"
        lineEnding="LF"
        gitBranch={gitBranch}
        gitStatus={gitStatus}
        errors={errors}
        warnings={warnings}
        onBranchClick={() => {
          dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'git' });
          dispatch({ type: 'TOGGLE_GIT_PANEL', payload: true });
        }}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadProject(file);
        }}
        onClick={(e) => ((e.target as HTMLInputElement).value = '')}
      />

      {/* LLM Error Modal */}
      {showLLMErrorModal && (
        <LLMErrorNotification
          error={llmError || undefined}
          service="code"
          showModal={true}
          onDismiss={() => {
            setShowLLMErrorModal(false);
            setLlmError(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Exported Component (with Provider)
// ============================================================================

export const CursorIDELayoutRefactored: React.FC<CursorIDELayoutProps> = (props) => {
  return (
    <IDEProvider initialProjectId={props.projectId}>
      <IDELayoutInner {...props} />
    </IDEProvider>
  );
};

export default CursorIDELayoutRefactored;
