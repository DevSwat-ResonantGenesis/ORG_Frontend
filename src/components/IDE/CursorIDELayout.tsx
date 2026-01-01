import { type AgentTeam } from '@/api/agentTeams';
import { type Provider } from '@/components/ui/ProviderSelector';
import { useThemeStore } from '@/store/themeStore';
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandPalette, type Command } from './CommandPalette';
import { CursorChatPanel, type Agent } from './CursorChatPanel';
import { CursorEditorView } from './CursorEditorView';
import { CursorFileTree, type FileNode } from './CursorFileTree';
import { CursorTabsBar, type Tab } from './CursorTabsBar';
import { CursorTerminalPanel } from './CursorTerminalPanel';
import { GitPanel } from './GitPanel';
import { InlineComment } from './InlineComment';
import { PatchModal } from './PatchModal';
import { ProjectArchiveDialog } from './ProjectArchiveDialog';
import { ProjectRestoreDialog } from './ProjectRestoreDialog';
import { ProjectTransferDialog } from './ProjectTransferDialog';
import { ResizablePanel } from './ResizablePanel';
import { StatusBar } from './StatusBar';
// Essential Modules
import {
  createProjectFile,
  deleteProjectFile,
  getGitStatus,
  listProjectFiles,
  moveProjectFile,
  readProjectFile,
  renameProjectFile,
  uploadProject,
  writeProjectFile
} from '@/api/code';
import { sendResonantMessage } from '@/api/resonantChat';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useToastContext } from '@/context/ToastContext';
import { logger } from '@/utils/logger';
import { AdvancedFeaturesPanel } from './AdvancedFeaturesPanel';
import { CodeSearchPanel } from './CodeSearchPanel';
import { DSIDPOrchestrationPanel } from './DSIDPOrchestrationPanel';
import styles from './CursorIDELayout.module.css';
import { IDEDropdownMenu } from './IDEDropdownMenu';
import { IDESettingsPanel } from './IDESettingsPanel';
// Modular Components

interface CursorIDELayoutProps {
  projectId?: string;
  onClose?: () => void;
  onProjectIdChange?: (projectId: string) => void;
}

export const CursorIDELayout: React.FC<CursorIDELayoutProps> = ({
  projectId,
  onClose,
  onProjectIdChange,
}) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<Map<string, string>>(new Map());
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('files');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteMode, setCommandPaletteMode] = useState<'command' | 'file'>('command');
  const [selectedProvider, setSelectedProvider] = useState<Provider>('auto');
  const [selectedAgent, setSelectedAgent] = useState<Agent>('default');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(true); // Always visible (no hover required)
  const [showToolbarMenu, setShowToolbarMenu] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const sidebarExplicitlyToggled = useRef(false);
  const [showIDEMenu, setShowIDEMenu] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [fileTreeWidth, setFileTreeWidth] = useState(240);
  const [gitPanelWidth, setGitPanelWidth] = useState(320);
  const [chatPanelWidth, setChatPanelWidth] = useState(350);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced Features Panel State
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [advancedPanelTab, setAdvancedPanelTab] = useState<any>('collaboration');

  // DSID-P Orchestration Panel State
  const [showDSIDPPanel, setShowDSIDPPanel] = useState(true);
  const [dsidpPanelWidth, setDsidpPanelWidth] = useState(320);
  const [dsidpPanelMode, setDsidpPanelMode] = useState<'orchestration' | 'accelerator'>('accelerator');

  // Module A: Project Runner
  const [running, setRunning] = useState(false);


  // Module B: AI Patch System
  const [patchModal, setPatchModal] = useState<{
    oldCode: string;
    newCode: string;
    fileName: string;
    filePath: string;
  } | null>(null);

  // Module C: Inline AI Comments
  const [inlineComment, setInlineComment] = useState<{
    top: number;
    left: number;
    message: string;
    examples?: string[];
    relatedConcepts?: string[];
  } | null>(null);

  const editorRef = useRef<any>(null);
  const [monacoEditor, setMonacoEditor] = useState<any>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveDialogData, setArchiveDialogData] = useState<{ projectId?: string, path: string } | null>(null);

  // Teams Support
  const [teams, setTeams] = useState<AgentTeam[]>([]);

  // Settings menu state
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [gitBranch, setGitBranch] = useState<string | undefined>();
  const [gitStatus, setGitStatus] = useState<'clean' | 'modified' | 'conflict'>('clean');
  const [errors, setErrors] = useState(0);
  const [warnings, setWarnings] = useState(0);

  // Missing buttons: Panel toggles
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  // Essential new features
  const [showAgentTeams, setShowAgentTeams] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Navigation history for forward/back buttons
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [navigationIndex, setNavigationIndex] = useState(-1);

  // Split view state
  const [splitView, setSplitView] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [splitActiveTabId, setSplitActiveTabId] = useState<string | null>(null);

  const { success, error: showError } = useToastContext();

  // Get active file info
  const activeFileContent = activeTabId ? openFiles.get(activeTabId) || '' : '';
  const activeFilePath = activeTabId;


  // Track cursor position and language for status bar
  useEffect(() => {
    if (!monacoEditor) return;

    const updateCursorPosition = () => {
      const position = monacoEditor.getPosition();
      if (position) {
        setCursorPosition({
          line: position.lineNumber,
          column: position.column,
        });
      }
    };

    // Update language from active file
    if (activeTabId) {
      const extension = activeTabId.split('.').pop()?.toLowerCase() || '';
      const languageMap: Record<string, string> = {
        'ts': 'TypeScript',
        'tsx': 'TypeScript',
        'js': 'JavaScript',
        'jsx': 'JavaScript',
        'py': 'Python',
        'json': 'JSON',
        'md': 'Markdown',
        'css': 'CSS',
        'html': 'HTML',
        'txt': 'Plain Text',
      };
      setCurrentLanguage(languageMap[extension] || extension.toUpperCase());
    } else {
      setCurrentLanguage('');
    }

    // Update on cursor change
    const disposable = monacoEditor.onDidChangeCursorPosition(updateCursorPosition);

    // Initial update
    updateCursorPosition();

    return () => {
      disposable.dispose();
    };
  }, [monacoEditor, activeTabId]);

  // Load settings on mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('resonant-ide-provider');
    if (savedProvider) {
      try {
        setSelectedProvider(JSON.parse(savedProvider));
      } catch (e) {
        // ignore invalid json
      }
    }

    // Load teams (DISABLED - backend endpoint not ready)
    // TODO: Re-enable when backend /agent-teams endpoint is fixed
    /*
    listAgentTeams()
      .then(setTeams)
      .catch(err => {
        console.warn('Teams unavailable (backend may be offline)');
        setTeams([]);
      });
    */
    setTeams([]); // Set empty array for now
  }, []);
  // Handle click outside settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  // Helper to find first file in tree
  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Load project files on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      loadProjectFiles();
    } else {
      // Clear files when projectId is cleared
      setFiles([]);
      setOpenFiles(new Map());
      setTabs([]);
      setActiveTabId(null);
    }
  }, [projectId]);

  // Auto-open first file when files are loaded (separate effect to track files state)
  useEffect(() => {
    if (files.length > 0 && openFiles.size === 0 && tabs.length === 0 && projectId) {
      const firstFile = findFirstFile(files);
      if (firstFile) {
        // Use setTimeout to avoid state update during render
        setTimeout(() => {
          handleFileClick(firstFile.path);
        }, 100);
      }
    }
  }, [files.length, projectId]); // Trigger when files array length changes or projectId changes

  // Listen for AST refactor events from editor
  useEffect(() => {
    const handleASTRefactor = (e: CustomEvent) => {
      const { selectedText, filePath } = e.detail;
      if (filePath && projectId && selectedText) {
        // Show chat panel and send refactor request
        setShowChat(true);
        const message = `Refactor this code using AST from ${filePath}:\n\`\`\`\n${selectedText}\n\`\`\``;
        // Use setTimeout to ensure chat is visible before sending
        setTimeout(() => {
          handleChatMessage(message).catch((err) => {
            logger.error('AST refactor via chat failed', err);
          });
        }, 100);
      }
    };

    window.addEventListener('ide-ast-refactor', handleASTRefactor as EventListener);
    return () => {
      window.removeEventListener('ide-ast-refactor', handleASTRefactor as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeTabId]); // handleChatMessage is stable, no need to include

  // Listen for IDE settings changes
  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent) => {
      const newSettings = e.detail;
      // Settings are applied via localStorage, editor will read them on next render
    };

    window.addEventListener('ide-settings-changed', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('ide-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  // Keyboard shortcuts for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input/textarea (don't trigger shortcuts)
      const isInputField =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      // Cmd+K (or Ctrl+K) - Open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isInputField) {
        e.preventDefault();
        setCommandPaletteMode('command');
        setCommandPaletteOpen(true);
      }

      // Cmd+P (or Ctrl+P) - Open file search
      if ((e.metaKey || e.ctrlKey) && e.key === 'p' && !isInputField) {
        e.preventDefault();
        setCommandPaletteMode('file');
        setCommandPaletteOpen(true);
      }

      // Cmd+S (or Ctrl+S) - Save file
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !isInputField) {
        e.preventDefault();
        if (activeTabId && unsavedChanges.has(activeTabId)) {
          handleSave();
        }
      }

      // Cmd+F (or Ctrl+F) - Find/Replace
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && !isInputField) {
        e.preventDefault();
        if (monacoEditor) {
          monacoEditor.getAction('actions.find')?.run();
        }
      }

      // Ctrl+Shift+E - Explorer
      if (e.ctrlKey && e.shiftKey && e.key === 'e' && !isInputField) {
        e.preventDefault();
        setActiveView('files');
      }

      // Ctrl+Shift+F - Search
      if (e.ctrlKey && e.shiftKey && e.key === 'f' && !isInputField) {
        e.preventDefault();
        setActiveView('search');
        setCommandPaletteOpen(true);
        setCommandPaletteMode('file');
      }

      // Ctrl+Shift+G - Source Control
      if (e.ctrlKey && e.shiftKey && e.key === 'g' && !isInputField) {
        e.preventDefault();
        setActiveView('git');
        setShowGitPanel(true);
      }

      // Ctrl+, - Settings
      if (e.ctrlKey && e.key === ',' && !isInputField) {
        e.preventDefault();
        setActiveView('settings');
      }

      // Cmd+Z (or Ctrl+Z) - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !isInputField) {
        e.preventDefault();
        if (monacoEditor) {
          monacoEditor.getAction('undo')?.run();
        }
      }

      // Cmd+Shift+Z (or Ctrl+Shift+Z) - Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey && !isInputField) {
        e.preventDefault();
        if (monacoEditor) {
          monacoEditor.getAction('redo')?.run();
        }
      }

      // Cmd+Shift+F (or Ctrl+Shift+F) - Format Document
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f' && !isInputField) {
        e.preventDefault();
        if (monacoEditor) {
          monacoEditor.getAction('editor.action.formatDocument')?.run();
        }
      }

      // Cmd+G (or Ctrl+G) - Go to Line
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && !isInputField) {
        e.preventDefault();
        if (monacoEditor) {
          monacoEditor.getAction('editor.action.gotoLine')?.run();
        }
      }

      // Escape - Close command palette
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, activeTabId, unsavedChanges, monacoEditor]);

  // Update tabs when openFiles changes
  useEffect(() => {
    const newTabs: Tab[] = Array.from(openFiles.keys()).map(path => ({
      id: path,
      path,
      name: path.split('/').pop() || path,
      isDirty: unsavedChanges.has(path),
    }));
    setTabs(newTabs);

    // Set first tab as active if no active tab
    if (!activeTabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  }, [openFiles, unsavedChanges]);

  const loadProjectFiles = async (projectIdToLoad?: string): Promise<number> => {
    const idToUse = projectIdToLoad || projectId;
    if (!idToUse) {
      return 0;
    }

    setLoading(true);
    try {
      const [filesResponse, gitStatusResponse] = await Promise.allSettled([
        listProjectFiles(idToUse),
        getGitStatus(idToUse).catch(() => null)
      ]);

      const response = filesResponse.status === 'fulfilled' ? filesResponse.value : null;
      const gitStatus = gitStatusResponse.status === 'fulfilled' ? gitStatusResponse.value : null;

      if (response && response.files && Array.isArray(response.files)) {
        // Create a map of git statuses by file path
        const gitStatusMap = new Map<string, 'modified' | 'added' | 'deleted'>();
        if (gitStatus?.files) {
          gitStatus.files.forEach((change: { status: string; file: string }) => {
            // Map git status to file tree status
            if (change.status === 'modified' || change.status === 'renamed') {
              gitStatusMap.set(change.file, 'modified');
            } else if (change.status === 'added' || change.status === 'untracked') {
              gitStatusMap.set(change.file, 'added');
            } else if (change.status === 'deleted') {
              gitStatusMap.set(change.file, 'deleted');
            }
          });
        }

        // Update git branch and status for status bar
        if (gitStatus) {
          setGitBranch(gitStatus.branch || 'main');
          const hasModified = gitStatus.files && gitStatus.files.length > 0;
          const hasConflict = gitStatus.files?.some((f: any) => f.status === 'conflict');
          if (hasConflict) {
            setGitStatus('conflict');
          } else if (hasModified) {
            setGitStatus('modified');
          } else {
            setGitStatus('clean');
          }
        }

        const fileTree = buildFileTree(response.files, gitStatusMap);
        setFiles(fileTree);
        return response.files.length;
      } else {
        setFiles([]);
        return 0;
      }
    } catch (error: any) {
      logger.error('Failed to load project files', error);
      setFiles([]);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const buildFileTree = (
    fileList: Array<{ path: string; language?: string }>,
    gitStatusMap?: Map<string, 'modified' | 'added' | 'deleted'>
  ): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    fileList.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          // Get git status for this file (only for files, not folders)
          const gitStatus = isLast && gitStatusMap ? gitStatusMap.get(file.path) : undefined;

          const node: FileNode = {
            path: currentPath,
            name: part,
            type: isLast ? 'file' : 'folder',
            language: isLast ? file.language : undefined,
            gitStatus: gitStatus || null,
            children: []
          };

          pathMap.set(currentPath, node);

          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(node);
            }
          }
        }
      });
    });

    return tree;
  };

  const handleFileClick = useCallback(async (filePath: string) => {
    setOpenFiles(prev => {
      if (prev.has(filePath)) {
        setActiveTabId(filePath);
        return prev;
      }
      return prev;
    });

    // Check if already open
    if (openFiles.has(filePath)) {
      setActiveTabId(filePath);
      return;
    }

    setLoading(true);
    try {
      const response = await readProjectFile(filePath);
      if (response.exists) {
        setOpenFiles(prev => {
          const newOpenFiles = new Map(prev);
          newOpenFiles.set(filePath, response.content);
          return newOpenFiles;
        });
        setActiveTabId(filePath);
      }
    } catch (error) {
      logger.error('Failed to read file', error);
    } finally {
      setLoading(false);
    }
  }, [openFiles]);

  const handleFileDoubleClick = useCallback((filePath: string) => {
    handleFileClick(filePath);
  }, [handleFileClick]);

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenFiles(prev => {
      const newOpenFiles = new Map(prev);
      newOpenFiles.delete(tabId);
      return newOpenFiles;
    });

    setActiveTabId(prev => {
      if (prev === tabId) {
        // Get remaining tabs from current state
        return null; // Will be set by useEffect
      }
      return prev;
    });
  }, []);

  // Debounced editor change handler for better performance
  const handleEditorChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string | undefined) => {
      if (!activeTabId) return;

      // Clear previous timeout
      clearTimeout(timeoutId);

      // Debounce the state update (150ms)
      timeoutId = setTimeout(() => {
        const newOpenFiles = new Map(openFiles);
        newOpenFiles.set(activeTabId, value || '');
        setOpenFiles(newOpenFiles);
        setUnsavedChanges(prev => new Set(prev).add(activeTabId));
      }, 150);
    };
  }, [activeTabId, openFiles]);

  const handleSave = async () => {
    if (!activeTabId) return;

    const content = openFiles.get(activeTabId);
    if (!content) return;

    setLoading(true);
    try {
      await writeProjectFile(activeTabId, content, undefined, projectId);
      setUnsavedChanges(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeTabId);
        return newSet;
      });
      await loadProjectFiles();
      success('File saved successfully');
    } catch (error) {
      logger.error('Failed to save file', error);
      showError('Failed to save file');
    } finally {
      setLoading(false);
    }
  };

  // Editor action handlers
  const handleFindReplace = () => {
    if (monacoEditor) {
      monacoEditor.getAction('actions.find')?.run();
    }
  };

  const handleUndo = () => {
    if (monacoEditor) {
      monacoEditor.getAction('undo')?.run();
    }
  };

  const handleRedo = () => {
    if (monacoEditor) {
      monacoEditor.getAction('redo')?.run();
    }
  };

  const handleFormatDocument = () => {
    if (monacoEditor) {
      monacoEditor.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleGoToLine = () => {
    if (monacoEditor) {
      monacoEditor.getAction('editor.action.gotoLine')?.run();
    }
  };

  const handleToggleMinimap = () => {
    if (monacoEditor) {
      monacoEditor.updateOptions({ minimap: { enabled: !showMinimap } });
      setShowMinimap(!showMinimap);
    }
  };

  const handleToggleWordWrap = () => {
    if (monacoEditor) {
      const newValue = wordWrap ? 'off' : 'on';
      monacoEditor.updateOptions({ wordWrap: newValue });
      setWordWrap(!wordWrap);
    }
  };

  // Navigation handlers
  const handleNavigateBack = () => {
    if (navigationIndex > 0) {
      const newIndex = navigationIndex - 1;
      const filePath = navigationHistory[newIndex];
      setNavigationIndex(newIndex);
      setActiveTabId(filePath);
    }
  };

  const handleNavigateForward = () => {
    if (navigationIndex < navigationHistory.length - 1) {
      const newIndex = navigationIndex + 1;
      const filePath = navigationHistory[newIndex];
      setNavigationIndex(newIndex);
      setActiveTabId(filePath);
    }
  };

  // Screenshot handler
  const handleScreenshot = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const ideElement = document.querySelector('.ide-container') as HTMLElement;
      if (!ideElement) {
        showError('IDE container not found');
        return;
      }

      const canvas = await html2canvas(ideElement, {
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        scale: 2, // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resonant-ide-screenshot-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          success('Screenshot saved successfully!');
        }
      }, 'image/png');
    } catch (error) {
      logger.error('Screenshot failed', error);
      showError('Failed to capture screenshot');
    }
  };

  // Split view handlers
  const handleToggleSplitView = (direction: 'horizontal' | 'vertical') => {
    if (splitView === direction) {
      setSplitView('none');
      setSplitActiveTabId(null);
    } else {
      setSplitView(direction);
      // Set split to current file or first available file
      if (activeTabId) {
        setSplitActiveTabId(activeTabId);
      } else if (tabs.length > 0) {
        setSplitActiveTabId(tabs[0].id);
      }
    }
  };



  const handleChatMessage = async (message: string): Promise<string> => {
    // Add logging for debugging
    console.log('💬 handleChatMessage called with:', message);
    console.log('📁 projectId:', projectId);
    console.log('🔐 isAuthenticated:', isAuthenticated());
    
    const messageLower = message.toLowerCase();
    const allFiles = flattenFiles(files);
    
    // Handle greetings without requiring project
    if (messageLower === 'hi' || messageLower === 'hello' || messageLower === 'help') {
      const status = isAuthenticated() ? '✅ Logged in' : '❌ Not logged in';
      const projectStatus = projectId ? `📁 Project: ${projectId}` : '📂 No project';
      return `👋 **Hello!**\n\n**Status:** ${status}\n**Project:** ${projectStatus}\n\n**Commands:**\n- \`list files\` - Show files\n- \`help\` - Show this message\n\nType anything to chat with AI!`;
    }
    
    try {
      if (!projectId) {
        return "📂 **No Project Open**\n\nUpload a project first:\n1. Click ☰ Menu → Upload Project\n2. Select a ZIP file";
      }

      const currentFileContent = activeTabId ? openFiles.get(activeTabId) || '' : '';
      const currentFilePath = activeTabId || '';

      // Check if message is asking to read/check files
      const isFileRequest = messageLower.includes('file') ||
        messageLower.includes('check') ||
        messageLower.includes('read') ||
        messageLower.includes('show') ||
        messageLower.includes('list') ||
        messageLower.includes('project');

      // If asking about files, provide file information
      if (isFileRequest && projectId) {
        if (allFiles.length === 0) {
          return "I don't see any files in your project. Please upload a project first using the 'Upload Project ZIP' button.";
        }

        // Try to read files if requested
        if (messageLower.includes('read') || messageLower.includes('show') || messageLower.includes('content')) {
          // Read first few files to provide context
          const filesToRead = allFiles.slice(0, 5).filter(f => f.type === 'file');
          let fileContents = '';

          for (const file of filesToRead) {
            try {
              const fileData = await readProjectFile(file.path);
              if (fileData.exists) {
                fileContents += `\n\n**${file.path}:**\n\`\`\`\n${fileData.content.substring(0, 500)}${fileData.content.length > 500 ? '...' : ''}\n\`\`\``;
              }
            } catch (err) {
              // Skip files that can't be read
            }
          }

          if (fileContents) {
            return `Here are the contents of your project files:${fileContents}\n\nI can help you edit these files. Just ask me to modify, add, or change anything!`;
          }
        }

        // List files
        const fileList = allFiles.map(f => `- ${f.path} (${f.type})`).join('\n');
        return `Here are the files in your project:\n\n${fileList}\n\nI can help you:\n- Read file contents\n- Edit files\n- Create new files\n- Modify code\n\nJust ask me what you'd like to do!`;
      }

      // Build context with file information for AI
      const fileContext = currentFilePath ? {
        currentFile: {
          path: currentFilePath,
          content: currentFileContent.substring(0, 2000), // Limit context size
        },
        projectFiles: allFiles.map(f => ({ path: f.path, type: f.type })),
      } : {
        projectFiles: allFiles.map(f => ({ path: f.path, type: f.type })),
      };

      // Smart context: Only include file content when explicitly needed
      const needsFileContent =
        messageLower.includes('analyze') ||
        messageLower.includes('review') ||
        messageLower.includes('read') ||
        messageLower.includes('show') ||
        messageLower.includes('explain') && (messageLower.includes('code') || messageLower.includes('file')) ||
        messageLower.includes('what does') && (messageLower.includes('this') || messageLower.includes('code')) ||
        messageLower.includes('how does') && (messageLower.includes('this') || messageLower.includes('work'));

      // Only include file contents if explicitly requested - MAX 300 chars
      let fileContentContext = '';
      if (needsFileContent) {
        // Include only currently open file (the one user is looking at)
        if (currentFilePath && currentFileContent) {
          const preview = currentFileContent.substring(0, 300); // Limit to 300 chars
          fileContentContext = `\n\nCurrently viewing file: ${currentFilePath}\nFile content (preview):\n\`\`\`\n${preview}${currentFileContent.length > 300 ? '...' : ''}\n\`\`\``;
        }
      }

      const projectContext = projectId
        ? `\n\nProject: ${projectId}\nFiles: ${allFiles.length}\n${allFiles.length > 0 ? allFiles.slice(0, 20).map(f => f.path).join('\n') : ''}${allFiles.length > 20 ? `\n... and ${allFiles.length - 20} more` : ''}\n${currentFilePath ? `Current file: ${currentFilePath}` : ''}\n\n`
        : '';

      const agentPrompt = selectedAgent === 'code-assistant'
        ? '[Code Assistant]\n\n'
        : selectedAgent === 'debugger'
          ? '[Debugger Assistant]\n\n'
          : selectedAgent === 'documentation'
            ? '[Documentation Assistant]\n\n'
            : selectedAgent === 'refactor'
              ? '[Refactoring Assistant]\n\n'
              : '';

      const enhancedMessage = `${agentPrompt}${projectContext}${message}${fileContentContext}`;

      // Check authentication before calling AI backend
      if (!isAuthenticated()) {
        console.log('❌ User not authenticated, returning login prompt');
        return `🔐 **Login Required**\n\nPlease log in to use AI features.\n\n[Go to Login](/login)`;
      }

      console.log('🤖 Calling AI backend with message:', enhancedMessage.substring(0, 100) + '...');

      const chatId = projectId ? `ide-project-${projectId}` : undefined;
      const isTeam = selectedAgent.startsWith('team:');
      const teamId = isTeam ? selectedAgent.split(':')[1] : undefined;

      const response = await sendResonantMessage({
        message: enhancedMessage,
        chatId: chatId, // Shared chat per project - allows context sharing between AI Dev Agent and Chat
        teamId,
        context: {
          previousMessages: [], // Will be populated by backend from Hash Sphere using chatId
          userPreferences: {
            currentProjectId: projectId,
            currentProjectFiles: allFiles.map(f => f.path),
            selectedAgent: selectedAgent, // Pass agent selection
            // Allow Hash Sphere memory but filter to current project only
            useOnlyCurrentProject: true,
            // Enable memory retrieval for this project's conversation history
            skipMemoryRetrieval: false,
          },
        },
        attached_files: fileContext.projectFiles?.map(f => f.path) || [],
        use_rag: false, // Use Hash Sphere (not RAG) to get conversation history
      });

      const messageContent = response.message?.content || '';
      if (typeof messageContent === 'string' && messageContent) {
        // Check if this is a request for automatic changes (AI Dev Agent mode)
        // Single file operations should also trigger auto-apply
        const hasActionKeyword = (
          messageLower.includes('apply') ||
          messageLower.includes('change') ||
          messageLower.includes('modify') ||
          messageLower.includes('add') ||
          messageLower.includes('create') ||
          messageLower.includes('refactor') ||
          messageLower.includes('update') ||
          messageLower.includes('fix') ||
          messageLower.includes('implement') ||
          messageLower.includes('write') ||
          messageLower.includes('generate')
        );

        const hasFileContext = (
          messageLower.includes('file') ||
          messageLower.includes('new file') ||
          messageLower.includes('create file') ||
          messageLower.includes('add file') ||
          messageLower.includes('all') ||
          messageLower.includes('every') ||
          messageLower.includes('multiple') ||
          messageLower.includes('project')
        );

        // Also check for code block patterns or file extensions
        const hasFilePattern = /\.(ts|tsx|js|jsx|py|json|md|css|html|txt|java|cpp|c|go|rs|rb|php)$/i.test(message);

        const isAutoApplyRequest = hasActionKeyword && (hasFileContext || hasFilePattern);

        // If it's an auto-apply request, try to extract actions from response
        if (isAutoApplyRequest && projectId) {
          // Extract code blocks and create actions
          const codeBlockRegex = /```(\w+)?\s*(?:file:\s*)?([^\n]+)?\n([\s\S]*?)```/g;
          const codeMatches = [...messageContent.matchAll(codeBlockRegex)];

          if (codeMatches.length > 0) {
            const filePathMatch = message.match(/(?:create|new|file|called|named)\s+(?:a\s+)?(?:new\s+)?(?:file\s+)?(?:called\s+)?([^\s]+\.(ts|tsx|js|jsx|py|json|md|css|html|txt))/i);
            const detectedPath = filePathMatch ? filePathMatch[1] : `newfile.${codeMatches[0][1] || 'ts'}`;

            const actions = codeMatches.map((match, idx) => ({
              type: 'create' as const,
              path: idx === 0 ? detectedPath : `${detectedPath.replace(/\.\w+$/, '')}-${idx + 1}.${match[1] || 'ts'}`,
              content: match[3] || '',
              explanation: 'Generated from AI response'
            }));

            if (actions.length > 0) {
              return `${messageContent}\n\n✨ **I can apply these changes automatically:**\n\n${actions.map((a, i) => `${i + 1}. ➕ ${a.path}`).join('\n')}\n\n💡 **Click "Apply Changes Automatically" button below!**\n\n\`\`\`json\n${JSON.stringify({ actions }, null, 2)}\n\`\`\``;
            }
          }
        }

        // Check if AI wants to edit a file (single file changes)
        if (messageContent.includes('```') && currentFilePath) {
          // Extract code blocks and offer to apply
          // Return message with file previews attached
          const responseWithPreviews = messageContent + '\n\n💡 **Tip:** I can apply these changes to your file. Just ask me to "apply changes" or "update the file".';
          // Attach file previews to response (will be handled by chat panel)
          return responseWithPreviews;
        }

        // Check if response contains code blocks for file creation (even without current file)
        if (messageContent.includes('```') && messageLower.includes('create') && messageLower.includes('file')) {
          // Try to extract file path and code
          const codeBlockRegex = /```(\w+)?\s*(?:file:\s*)?([^\n]+)?\n([\s\S]*?)```/g;
          const codeMatches = [...messageContent.matchAll(codeBlockRegex)];

          if (codeMatches.length > 0) {
            const filePathMatch = message.match(/(?:create|new|file|called|named)\s+(?:a\s+)?(?:new\s+)?(?:file\s+)?(?:called\s+)?([^\s]+\.(ts|tsx|js|jsx|py|json|md|css|html|txt))/i);
            const detectedPath = filePathMatch ? filePathMatch[1] : `test.${codeMatches[0][1] || 'ts'}`;

            const actions = codeMatches.map((match, idx) => ({
              type: 'create',
              path: idx === 0 ? detectedPath : `${detectedPath.replace(/\.\w+$/, '')}-${idx + 1}.${match[1] || 'ts'}`,
              content: match[3] || '',
              explanation: 'Generated from AI response'
            }));

            logger.info('Created actions from code blocks in main response:', actions);
            return `${messageContent}\n\n✨ **I can create these files automatically:**\n\n${actions.map((a: any, i: number) => `${i + 1}. ➕ ${a.path}`).join('\n')}\n\n💡 **Click "Apply Changes Automatically" button below to create the files!**\n\n\`\`\`json\n${JSON.stringify({ actions }, null, 2)}\n\`\`\``;
          }
        }

        // Return message content with file previews metadata
        // The chat panel will extract and display file previews
        return messageContent;
      }
      if (messageContent !== null && typeof messageContent === 'object' && 'content' in (messageContent as object)) {
        return (messageContent as any).content || 'I understand. How can I help you?';
      }
      return 'I understand. How can I help you?';
    } catch (error) {
      logger.error('Failed to send chat message', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  // Handle AI view - toggle chat panel
  useEffect(() => {
    if (activeView === 'ai') {
      setShowChat(true);
    }
  }, [activeView]);

  const handleUploadProject = async (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.zip')) {
      alert('Please select a ZIP file');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 700 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size exceeds 100MB limit');
      return;
    }

    setLoading(true);
    try {
      const response = await uploadProject(file);
      const projectId = response.project_id;
      const filesIndexed = response.files_indexed || 0;

      if (projectId) {
        if (onProjectIdChange) {
          onProjectIdChange(projectId);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        let retries = 3;
        let filesLoaded = false;
        let filesCount = 0;

        while (retries > 0 && !filesLoaded) {
          try {
            filesCount = await loadProjectFiles(projectId);
            filesLoaded = filesCount > 0;
            if (!filesLoaded) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (loadError) {
            logger.error('Error loading files', loadError);
          }
          retries--;
        }

        if (filesLoaded) {
          alert(`Project uploaded successfully! ${filesCount} files loaded (${filesIndexed} indexed)`);
        } else {
          alert(`Project uploaded! However, files may still be processing. Files indexed: ${filesIndexed}. Please refresh the page or wait a moment and try again.`);
        }
      } else {
        alert('Upload completed but no project ID returned.');
      }
    } catch (error: any) {
      logger.error('Failed to upload project', error);

      const errorMessage = error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Unknown error';
      alert(`Failed to upload project: ${errorMessage}\n\nCheck browser console (F12) for details.`);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleNewFile = async (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const filePath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
    setLoading(true);
    try {
      await createProjectFile(filePath, false, '');
      await loadProjectFiles();
    } catch (error) {
      logger.error('Failed to create file', error);
      alert('Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const handleNewFolder = async (parentPath: string) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const folderPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
    setLoading(true);
    try {
      await createProjectFile(folderPath, true, '');
      await loadProjectFiles();
    } catch (error) {
      logger.error('Failed to create folder', error);
      alert('Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (path: string, newName?: string) => {
    const node = findNodeInTree(files, path);
    if (!node) return;

    // If newName is provided (from inline rename), use it; otherwise prompt
    let finalNewName: string | null = newName || null;
    if (!finalNewName) {
      finalNewName = prompt('Enter new name:', node.name);
    }
    if (!finalNewName || finalNewName === node.name) return;

    const parentPath = path.substring(0, path.length - node.name.length - 1) || '/';
    const newPath = parentPath === '/' ? `/${finalNewName}` : `${parentPath}/${finalNewName}`;

    setLoading(true);
    try {
      await renameProjectFile(path, newPath);
      await loadProjectFiles();

      // Update active tab if it was the renamed file
      if (activeTabId === path) {
        setActiveTabId(newPath);
        const content = openFiles.get(path);
        if (content) {
          const newOpenFiles = new Map(openFiles);
          newOpenFiles.delete(path);
          newOpenFiles.set(newPath, content);
          setOpenFiles(newOpenFiles);
        }
      }
    } catch (error) {
      logger.error('Failed to rename file', error);
      alert('Failed to rename file');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find node in file tree
  const findNodeInTree = (nodes: FileNode[], targetPath: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) {
        return node;
      }
      if (node.children) {
        const found = findNodeInTree(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDelete = async (path: string) => {
    if (!path || path === '/' || path.trim() === '') {
      alert('Cannot delete root project folder. Please delete individual files or subfolders.');
      return;
    }

    const node = findNodeInTree(files, path);

    // Check if it's a folder by:
    // 1. Node type is 'folder'
    // 2. Node has children (folders have children array)
    // 3. Check if any files in the tree have this path as a parent
    const isFolderByNode = node && (node.type === 'folder' || (node.children && node.children.length > 0));

    // Helper to check if path is a folder by looking at all files
    const checkIfFolderInTree = (nodes: FileNode[], folderPath: string): boolean => {
      for (const n of nodes) {
        // If any file starts with folderPath + '/', it's a folder
        if (n.path.startsWith(folderPath + '/') && n.path !== folderPath) {
          return true;
        }
        if (n.children) {
          if (checkIfFolderInTree(n.children, folderPath)) return true;
        }
      }
      return false;
    };

    const isFolderByTree = checkIfFolderInTree(files, path);
    const isFolder = isFolderByNode || isFolderByTree;

    let deletePath = path;
    if (isFolder) {
      deletePath = path.endsWith('/') ? path : `${path}/`;
    }

    // Ensure we have a projectId
    if (!projectId) {
      alert('Cannot delete: No project selected. Please open a project first.');
      return;
    }

    if (!confirm(`Delete ${path}? This action cannot be undone.`)) return;

    setLoading(true);
    try {
      const result = await deleteProjectFile(deletePath, projectId);

      if (result && result.success === false) {
        throw new Error(result.message || 'Deletion failed on server');
      }

      const newOpenFiles = new Map(openFiles);
      const isFolderDelete = deletePath.endsWith('/') || (node && node.type === 'folder');
      if (isFolderDelete) {
        const folderPath = deletePath.endsWith('/') ? deletePath : `${deletePath}/`;
        Array.from(newOpenFiles.keys()).forEach(filePath => {
          if (filePath.startsWith(folderPath) || filePath.startsWith(path + '/')) {
            newOpenFiles.delete(filePath);
          }
        });
      } else {
        newOpenFiles.delete(path);
        newOpenFiles.delete(deletePath);
      }
      setOpenFiles(newOpenFiles);

      if (activeTabId === path || (path.endsWith('/') && activeTabId?.startsWith(path))) {
        const remainingTabs = Array.from(newOpenFiles.keys());
        setActiveTabId(remainingTabs[0] || null);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      await loadProjectFiles();
    } catch (error: any) {
      logger.error('Failed to delete file/folder', error);

      // Extract error message from various possible locations
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        'Failed to delete file/folder';

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = (path: string) => {
    // Find the node to check if it's a folder
    const node = findNodeInTree(files, path);
    const isFolder = node?.type === 'folder' || (node?.children && node.children.length > 0);

    // For folders, use folder_path; for projects, use project_id
    // Open archive dialog to show hash preview and allow copying
    setArchiveDialogData({
      projectId: isFolder ? undefined : projectId,  // Only use projectId if not a folder
      path
    });
    setShowArchiveDialog(true);
  };

  const handleArchiveConfirmed = async (projectHash: string) => {
    if (!archiveDialogData) return;

    setLoading(true);
    try {
      // Reload files to remove archived project from tree
      await loadProjectFiles();
      setShowArchiveDialog(false);
      setArchiveDialogData(null);
    } catch (error: any) {
      logger.error('Failed to reload files after archive', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (sourcePath: string, targetPath: string) => {
    setLoading(true);
    try {
      await moveProjectFile(sourcePath, targetPath);
      await loadProjectFiles();

      // Update active tab if it was the moved file
      if (activeTabId === sourcePath) {
        setActiveTabId(targetPath);
        const content = openFiles.get(sourcePath);
        if (content) {
          const newOpenFiles = new Map(openFiles);
          newOpenFiles.delete(sourcePath);
          newOpenFiles.set(targetPath, content);
          setOpenFiles(newOpenFiles);
        }
      }
    } catch (error) {
      logger.error('Failed to move file', error);
      alert('Failed to move file');
    } finally {
      setLoading(false);
    }
  };


  const handleClearProject = () => {
    if (!confirm('Clear current project? This will close all files and allow you to upload a new project.')) {
      return;
    }

    // Clear project state
    setFiles([]);
    setOpenFiles(new Map());
    setTabs([]);
    setActiveTabId(null);
    setExpandedFolders(new Set());
    setUnsavedChanges(new Set());

    // Clear projectId from parent
    if (onProjectIdChange) {
      onProjectIdChange('');
    }

    // Clear from localStorage
    localStorage.removeItem('ide-project-id');

  };

  // Build file list for command palette
  const flattenFiles = (nodes: FileNode[]): Array<{ path: string; name: string; type: 'file' | 'folder' }> => {
    const result: Array<{ path: string; name: string; type: 'file' | 'folder' }> = [];
    const traverse = (node: FileNode) => {
      result.push({ path: node.path, name: node.name, type: node.type });
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return result;
  };

  // Build command list
  const buildCommands = (): Command[] => {
    const commands: Command[] = [
      {
        id: 'new-file',
        label: 'New File',
        description: 'Create a new file',
        category: 'File',
        shortcut: 'Cmd+N',
        type: 'command',
      },
      {
        id: 'new-folder',
        label: 'New Folder',
        description: 'Create a new folder',
        category: 'File',
        type: 'command',
      },
      {
        id: 'save-file',
        label: 'Save File',
        description: 'Save the current file',
        category: 'File',
        shortcut: 'Cmd+S',
        type: 'command',
      },
      {
        id: 'upload-project',
        label: 'Upload Project',
        description: 'Upload a project ZIP file',
        category: 'Project',
        type: 'command',
      },
      {
        id: 'clear-project',
        label: 'Clear Project',
        description: 'Clear the current project',
        category: 'Project',
        type: 'command',
      },
      {
        id: 'toggle-terminal',
        label: 'Toggle Terminal',
        description: 'Show/hide terminal panel',
        category: 'View',
        shortcut: 'Ctrl+`',
        type: 'command',
      },
      {
        id: 'toggle-code-search',
        label: 'Toggle Code Search',
        description: 'Show/hide code search panel',
        category: 'View',
        shortcut: 'Cmd+Shift+F',
        type: 'command',
      },
      {
        id: 'toggle-chat',
        label: 'Toggle AI Chat',
        description: 'Show/hide AI chat panel',
        category: 'View',
        type: 'command',
      },
    ];
    return commands;
  };


  const handleToggleAdvancedFeature = (feature: string) => {
    setAdvancedPanelTab(feature);
    setShowAdvancedPanel(true);
  };

  // Handle command palette selection
  const handleCommandSelect = (command: Command) => {
    switch (command.id) {
      case 'new-file':
        handleNewFile('/');
        break;
      case 'new-folder':
        handleNewFolder('/');
        break;
      case 'save-file':
        if (activeTabId) {
          handleSave();
        }
        break;
      case 'upload-project':
        fileInputRef.current?.click();
        break;
      case 'clear-project':
        handleClearProject();
        break;
      case 'toggle-terminal':
        setShowTerminal(!showTerminal);
        break;
      case 'toggle-chat':
        setShowChat(!showChat);
        break;
      case 'toggle-code-search':
        // Toggle to search view in sidebar
        if (activeView === 'search') {
          setActiveView('files');
        } else {
          setActiveView('search');
        }
        break;
      default:
        // Handle file selection
        if (command.type === 'file' && command.path) {
          handleFileClick(command.path);
        }
        break;
    }
  };

  return (
    <div className={`${styles.cursorIDE} ide-container`}>
      {/* Top Toolbar - Full Width */}
      <div className={styles.toolbarActions}>
        {/* Burger Menu Toggle Button - Toggles Sidebar */}
        <button
          className={`${styles.toolbarButton} ${styles.burgerMenuButton} ${showSidebar ? styles.active : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSidebar(!showSidebar);
          }}
          title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 4H13M3 8H13M3 12H13" strokeLinecap="round" />
          </svg>
        </button>

        {/* Navigation Buttons */}
        <button
          className={styles.toolbarButton}
          onClick={handleNavigateBack}
          disabled={navigationIndex <= 0}
          title="Navigate Back"
          aria-label="Navigate Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8L10 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={styles.toolbarButton}
          onClick={handleNavigateForward}
          disabled={navigationIndex >= navigationHistory.length - 1}
          title="Navigate Forward"
          aria-label="Navigate Forward"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4L10 8L6 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Resonant IDE Logo */}
        <div className={styles.ideLogo}>
          <span className={styles.logoText}>Resonant IDE</span>
        </div>

        {/* Top Right Toolbar - Clean Icon Design */}
        <div className={styles.toolbarRight}>
          {/* Screenshot */}
          <button
            className={styles.toolbarButton}
            onClick={handleScreenshot}
            title="Screenshot"
            aria-label="Screenshot"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="14" height="11" rx="2" />
              <circle cx="10" cy="10.5" r="2.5" />
              <path d="M7 5L8 3H12L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Collaboration */}
          <button
            className={styles.toolbarButton}
            onClick={() => setActiveView('collaboration')}
            title="Collaboration"
            aria-label="Collaboration"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="6" r="2.5" />
              <circle cx="13" cy="6" r="2.5" />
              <path d="M3 16C3 13.5 5 11.5 7 11.5C9 11.5 11 13.5 11 16M11 16C11 13.5 13 11.5 15 11.5C17 11.5 19 13.5 19 16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Deployment */}
          <button
            className={styles.toolbarButton}
            onClick={() => setActiveView('deployment')}
            title="Deployment"
            aria-label="Deployment"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 3L17 10L10 17L3 10L10 3Z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
          </button>

          {/* Agent Manager */}
          <button
            className={styles.toolbarButton}
            onClick={() => setShowAgentTeams(!showAgentTeams)}
            title="Agent Manager"
            aria-label="Agent Manager"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="6" r="3" />
              <path d="M4 17C4 14 6.5 12 10 12C13.5 12 16 14 16 17" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 12V14M8 13H12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Split Vertical */}
          <button
            className={styles.toolbarButton}
            onClick={() => handleToggleSplitView('vertical')}
            title="Split Vertical"
            aria-label="Split Vertical"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="6" height="14" rx="1" />
              <rect x="11" y="3" width="6" height="14" rx="1" />
            </svg>
          </button>

          {/* Split Horizontal */}
          <button
            className={styles.toolbarButton}
            onClick={() => handleToggleSplitView('horizontal')}
            title="Split Horizontal"
            aria-label="Split Horizontal"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="14" height="6" rx="1" />
              <rect x="3" y="11" width="14" height="6" rx="1" />
            </svg>
          </button>

          {/* Toggle Sidebar */}
          <button
            className={styles.toolbarButton}
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="14" height="14" rx="2" />
              <path d="M3 7H17M7 3V17" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Search */}
          <button
            className={styles.toolbarButton}
            onClick={() => {
              setActiveView('search');
              setCommandPaletteOpen(true);
              setCommandPaletteMode('file');
            }}
            title="Search"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14L18 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Settings */}
          <button
            className={styles.toolbarButton}
            onClick={() => setActiveView('settings')}
            title="Settings"
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="3" />
              <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.5 15.5L14 14M6 6L4.5 4.5M15.5 4.5L14 6M6 14L4.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* AI Chat Toggle */}
          {!(showChat || activeView === 'ai') ? (
            <button
              className={styles.toolbarButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setActiveView('ai');
                  setShowChat(true);
                } catch (error) {
                  logger.error('Open chat error', error);
                }
              }}
              title="AI Chat"
              aria-label="AI Chat"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 8C17 11.866 13.866 15 10 15C9 15 8 14.8 7.2 14.4L3 16L4.6 11.8C4.2 11 4 10 4 9C4 5.134 7.134 2 11 2C14.866 2 18 5.134 18 9Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              className={styles.toolbarButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setShowChat(false);
                  if (activeView === 'ai') {
                    setActiveView('files');
                  }
                } catch (error) {
                  logger.error('Close chat error', error);
                }
              }}
              title="Close Chat"
              aria-label="Close Chat"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* More Menu - Opens IDE Dropdown with all functions */}
          <button
            className={`${styles.toolbarButton} ${showIDEMenu ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowIDEMenu(!showIDEMenu);
            }}
            title="More Options"
            aria-label="More Options"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="4" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="10" cy="16" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Archive Dialog */}
      {archiveDialogData && (
        <ProjectArchiveDialog
          isOpen={showArchiveDialog}
          onClose={() => {
            setShowArchiveDialog(false);
            setArchiveDialogData(null);
          }}
          onArchived={handleArchiveConfirmed}
          projectId={archiveDialogData.projectId}
          projectPath={archiveDialogData.path}
        />
      )}

      {/* Restore Dialog */}
      <ProjectRestoreDialog
        isOpen={showRestoreDialog}
        onClose={() => setShowRestoreDialog(false)}
        onRestored={async (newProjectId: string) => {
          // Reload files to show restored project
          await loadProjectFiles();
          // Optionally switch to the restored project
          if (newProjectId && onProjectIdChange) {
            onProjectIdChange(newProjectId);
          }
        }}
      />

      {/* Transfer Dialog */}
      <ProjectTransferDialog
        isOpen={showTransferDialog}
        onClose={() => setShowTransferDialog(false)}
        projectId={projectId || ''}
      />

      {/* IDE Content Container */}
      <div
        className={styles.ideContent}
      >
        {/* Left Sidebar - Toggle with burger menu */}
        {showSidebar && (
        <div
          className={`${styles.sidebarContainer} ${styles.visible}`}
        >
          {/* Activity Bar - Cursor-style sidebar with enhanced tooltips */}
          <div className={styles.sidebarViewButtons}>
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'files' ? styles.active : ''}`}
              onClick={() => setActiveView('files')}
              title="Explorer (Ctrl+Shift+E)"
              aria-label="Explorer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5C3 4.44772 3.44772 4 4 4H7.58579C7.851 4 8.10536 4.10536 8.29289 4.29289L10.7071 6.70711C10.8946 6.89464 11.149 7 11.4142 7H16C16.5523 7 17 7.44772 17 8V15C17 15.5523 16.5523 16 16 16H4C3.44772 16 3 15.5523 3 15V5Z" />
              </svg>
            </button>
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'search' ? styles.active : ''}`}
              onClick={() => {
                setActiveView('search');
                setCommandPaletteOpen(true);
                setCommandPaletteMode('file');
              }}
              title="Search (Ctrl+Shift+F)"
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="9" r="6" />
                <path d="M15 15L12.5 12.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'git' ? styles.active : ''}`}
              onClick={() => {
                setActiveView('git');
                setShowGitPanel(true);
              }}
              title="Source Control (Ctrl+Shift+G)"
              aria-label="Source Control"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.48 0 0 4.48 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19.5c0 .27.16.59.67.5C17.14 18.18 20 14.42 20 10c0-5.52-4.48-10-10-10z" />
              </svg>
            </button>

            {/* Collaboration Panel */}
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'collaboration' ? styles.active : ''}`}
              onClick={() => setActiveView('collaboration')}
              title="Collaboration (Ctrl+Shift+C)"
              aria-label="Collaboration"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6" cy="6" r="3" />
                <circle cx="14" cy="6" r="3" />
                <path d="M2 16C2 13 4 11 6 11C8 11 10 13 10 16M10 16C10 13 12 11 14 11C16 11 18 13 18 16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Deployment Panel */}
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'deployment' ? styles.active : ''}`}
              onClick={() => setActiveView('deployment')}
              title="Deployment (Ctrl+Shift+Y)"
              aria-label="Deployment"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 3L17 10L10 17L3 10L10 3Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.5" />
                <path d="M10 7.5V5M10 15V12.5M7.5 10H5M15 10H12.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Run and Debug */}
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'run' ? styles.active : ''}`}
              onClick={() => setActiveView('run')}
              title="Run and Debug (Ctrl+Shift+D)"
              aria-label="Run and Debug"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 5L14 10L7 15V5Z" fill="currentColor" stroke="none" />
                <circle cx="16" cy="16" r="3" strokeWidth="1.2" />
                <path d="M16 14.5V17.5M14.5 16H17.5" strokeLinecap="round" strokeWidth="1.2" />
              </svg>
            </button>

            {/* Testing */}
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'testing' ? styles.active : ''}`}
              onClick={() => setActiveView('testing')}
              title="Testing (Ctrl+Shift+T)"
              aria-label="Testing"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 3H13M10 3V6M6 6H14C14.5523 6 15 6.44772 15 7V16C15 16.5523 14.5523 17 14 17H6C5.44772 17 5 16.5523 5 16V7C5 6.44772 5.44772 6 6 6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="11" r="2" />
                <path d="M10 13V15" strokeLinecap="round" />
              </svg>
            </button>

            {/* Extensions */}
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'extensions' ? styles.active : ''}`}
              onClick={() => setActiveView('extensions')}
              title="Extensions (Ctrl+Shift+X)"
              aria-label="Extensions"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="11" y="3" width="6" height="6" rx="1" />
                <rect x="3" y="11" width="6" height="6" rx="1" />
                <rect x="11" y="11" width="6" height="6" rx="1" />
              </svg>
            </button>

            <button
              className={`${styles.sidebarViewButton} ${activeView === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveView('settings')}
              title="Settings (Ctrl+,)"
              aria-label="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className={`${styles.sidebarViewButton} ${activeView === 'dsidp' ? styles.active : ''}`}
              onClick={() => setActiveView(activeView === 'dsidp' ? 'files' : 'dsidp')}
              title="DSID-P Accelerator (Ctrl+Shift+A)"
              aria-label="DSID-P Accelerator"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2L17 10L10 18L3 10L10 2Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="3" />
                <path d="M10 7V4M10 16V13M7 10H4M16 10H13" strokeLinecap="round" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </div>
        )}

        {/* File Explorer (shown when files view is active and toggle is on) */}
        {activeView === 'files' && showFileExplorer && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={fileTreeWidth}
            minSize={180}
            maxSize={500}
            onResize={setFileTreeWidth}
            className={styles.fileExplorerContainer}
          >
            {files.length === 0 ? (
              <div className={styles.uploadPrompt}>
                <p>No project loaded</p>
                <button
                  className={styles.uploadButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    } else {
                      alert('Upload button not properly initialized. Please refresh the page.');
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Project ZIP'}
                </button>
                {loading && <p className={styles.uploadHint}>Please wait while your project is being processed...</p>}
              </div>
            ) : (
              <CursorFileTree
                files={files}
                onFileClick={handleFileClick}
                onFileDoubleClick={handleFileDoubleClick}
                expandedFolders={expandedFolders}
                onToggleFolder={handleToggleFolder}
                activeFile={activeTabId}
                onNewFile={handleNewFile}
                onNewFolder={handleNewFolder}
                onRename={handleRename}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onMove={handleMove}
                onClearProject={handleClearProject}
                projectId={projectId}
              />
            )}
          </ResizablePanel>
        )}

        {/* Search View */}
        {activeView === 'search' && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={400}
            minSize={300}
            maxSize={800}
            className={styles.searchViewContainer}
          >
            <CodeSearchPanel
              onFileSelect={(filePath, lineNumber) => {
                handleFileClick(filePath);
                // Navigate to line number after file opens
                setTimeout(() => {
                  if (monacoEditor && lineNumber > 0) {
                    monacoEditor.setPosition({ lineNumber, column: 1 });
                    monacoEditor.revealLineInCenter(lineNumber);
                  }
                }, 300);
              }}
              onClose={() => setActiveView('files')}
            />
          </ResizablePanel>
        )}

        {/* Git View - Show when git panel toggle is on */}
        {activeView === 'git' && showGitPanel && projectId && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={gitPanelWidth}
            minSize={280}
            maxSize={600}
            onResize={setGitPanelWidth}
            className={styles.gitViewContainer}
          >
            <GitPanel projectId={projectId} />
          </ResizablePanel>
        )}
        {activeView === 'git' && !projectId && (
          <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>Git</div>
            <div className={styles.viewContent}>
              <p>No project loaded. Upload a project to use Git features.</p>
            </div>
          </div>
        )}

        {/* Collaboration View */}
        {activeView === 'collaboration' && (
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
        )}

        {/* Deployment View */}
        {activeView === 'deployment' && (
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
        )}

        {/* Run and Debug View */}
        {activeView === 'run' && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={350}
            minSize={300}
            maxSize={600}
            className={styles.runViewContainer}
          >
            <div className={styles.viewContainer}>
              <div className={styles.viewHeader}>
                <h3>Run & Debug</h3>
              </div>
              <div className={styles.viewContent}>
                <div className={styles.featureSection}>
                  <h4>Launch Configurations</h4>
                  <p>No configurations yet</p>
                  <button className={styles.actionButton}>Create Configuration</button>
                </div>
                <div className={styles.featureSection}>
                  <h4>Breakpoints</h4>
                  <p>Set breakpoints to debug code</p>
                  <button className={styles.actionButton}>Add Breakpoint</button>
                </div>
                <div className={styles.featureSection}>
                  <h4>Watch Variables</h4>
                  <p>Monitor variable values</p>
                  <button className={styles.actionButton}>Add Watch</button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        )}

        {/* Testing View */}
        {activeView === 'testing' && (
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
        )}

        {/* Extensions View */}
        {activeView === 'extensions' && (
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
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={400}
            minSize={300}
            maxSize={600}
            className={styles.settingsViewContainer}
          >
            <IDESettingsPanel onClose={() => setActiveView('files')} />
          </ResizablePanel>
        )}

        {/* DSID-P Accelerator View */}
        {activeView === 'dsidp' && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={340}
            minSize={300}
            maxSize={500}
            className={styles.dsidpViewContainer}
          >
            <div className={styles.dsidpPanelWrapper}>
              {/* Panel Mode Toggle */}
              <div className={styles.dsidpPanelToggle}>
                <button
                  className={`${styles.dsidpToggleBtn} ${dsidpPanelMode === 'accelerator' ? styles.active : ''}`}
                  onClick={() => setDsidpPanelMode('accelerator')}
                >
                  ⚡ Accelerator
                </button>
                <button
                  className={`${styles.dsidpToggleBtn} ${dsidpPanelMode === 'orchestration' ? styles.active : ''}`}
                  onClick={() => setDsidpPanelMode('orchestration')}
                >
                  ◈ Governance
                </button>
              </div>
              
              {/* Panel Content - Accelerator now in chat toggle */}
              {dsidpPanelMode === 'accelerator' ? (
                <div style={{ padding: '20px', color: '#888', fontSize: '13px', textAlign: 'center' }}>
                  <p>⚡ Accelerator is now in Chat</p>
                  <p style={{ fontSize: '11px', marginTop: '8px', color: '#555' }}>Use the toggle in the chat toolbar</p>
                </div>
              ) : (
                <DSIDPOrchestrationPanel
                  agentId={selectedAgent}
                  sessionId={projectId}
                  onExecutionClick={(execution) => {
                    logger.info('DSID-P execution clicked:', execution);
                  }}
                />
              )}
            </div>
          </ResizablePanel>
        )}

        {/* Main Panel */}
        <div className={styles.mainPanel}>
          {/* Tabs Bar */}
          <CursorTabsBar
            tabs={tabs}
            activeTabId={activeTabId}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
          />

          {/* Editor + Terminal */}
          <div className={styles.editorContainer}>
            <CursorEditorView
              filePath={activeFilePath}
              content={activeFileContent}
              onChange={handleEditorChange}
              onSave={handleSave}
              onEditorMount={setMonacoEditor}
            />
            {showTerminal && (
              <CursorTerminalPanel projectId={projectId} />
            )}
          </div>
        </div>


        {/* AI Chat Dock - Show when AI view is active or explicitly shown */}
        {(showChat || activeView === 'ai') && (
          <ResizablePanel
            direction="horizontal"
            defaultSize={chatPanelWidth}
            minSize={300}
            maxSize={600}
            onResize={setChatPanelWidth}
            className={styles.chatPanelContainer}
            handlePosition="left"
          >
            <CursorChatPanel
              onClose={() => {
                setShowChat(false);
                if (activeView === 'ai') {
                  setActiveView('files');
                }
              }}
              onSendMessage={handleChatMessage}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              projectId={projectId}
              selectedAgent={selectedAgent}
              onAgentChange={setSelectedAgent}
              teams={teams}
              onOpenFile={async (filePath: string) => {
                // Open file in editor when clicked from chat
                logger.info('Opening file from chat:', filePath);
                try {
                  if (!openFiles.has(filePath)) {
                    const fileData = await readProjectFile(filePath);
                    if (fileData.exists) {
                      setOpenFiles(prev => {
                        const newMap = new Map(prev);
                        newMap.set(filePath, fileData.content);
                        return newMap;
                      });
                    } else {
                      showError(`File ${filePath} does not exist`);
                      return;
                    }
                  }
                  // Set active tab and switch to editor view
                  setActiveTabId(filePath);
                  setActiveView('editor');
                  logger.info('File opened successfully:', filePath);
                } catch (err: any) {
                  logger.error('Failed to open file from chat', err);
                  showError(`Failed to open file: ${err.message || 'Unknown error'}`);
                }
              }}
              onApplyChanges={async (changes) => {
                if (!projectId) {
                  showError('No project selected');
                  return;
                }
                try {
                  logger.info('Applying changes from chat:', changes);

                  for (const change of changes) {
                    try {
                      if (change.type === 'create') {
                        await createProjectFile(change.path, false, change.content || '', projectId);
                        setOpenFiles(prev => {
                          const newMap = new Map(prev);
                          newMap.set(change.path, change.content || '');
                          return newMap;
                        });
                        setActiveTabId(change.path);
                        setActiveView('editor');
                      } else if (change.type === 'modify') {
                        await writeProjectFile(change.path, change.content || '', undefined, projectId);

                        // Update the file in editor if it's open
                        if (openFiles.has(change.path)) {
                          setOpenFiles(prev => {
                            const newMap = new Map(prev);
                            newMap.set(change.path, change.content || '');
                            return newMap;
                          });
                        }
                      } else if (change.type === 'delete') {
                        // Delete file
                        logger.info(`Deleting file: ${change.path}`);
                        await deleteProjectFile(change.path, projectId);

                        // Close the file if it's open
                        if (openFiles.has(change.path)) {
                          setOpenFiles(prev => {
                            const newMap = new Map(prev);
                            newMap.delete(change.path);
                            return newMap;
                          });
                          if (activeTabId === change.path) {
                            // Switch to another tab if available
                            const remainingTabs = Array.from(openFiles.keys()).filter(p => p !== change.path);
                            if (remainingTabs.length > 0) {
                              setActiveTabId(remainingTabs[0]);
                            } else {
                              setActiveTabId(null);
                            }
                          }
                        }
                      }
                    } catch (fileErr: any) {
                      logger.error(`Failed to ${change.type} file ${change.path}:`, fileErr);
                      showError(`Failed to ${change.type} ${change.path}: ${fileErr.message || 'Unknown error'}`);
                    }
                  }

                  // Reload files to show changes in file tree
                  await loadProjectFiles();

                  success(`Applied ${changes.length} change(s) successfully`);
                } catch (err: any) {
                  logger.error('Failed to apply changes', err);
                  showError(err.message || 'Failed to apply changes');
                }
              }}
            />
          </ResizablePanel>
        )}

      </div>

      {/* Module B: AI Patch Modal */}
      {patchModal && (
        <PatchModal
          oldCode={patchModal.oldCode}
          newCode={patchModal.newCode}
          fileName={patchModal.fileName}
          onApply={async () => {
            if (patchModal) {
              try {
                await writeProjectFile(patchModal.filePath, patchModal.newCode, undefined, projectId);
                success('Patch applied successfully');
                // Reload file content
                const newContent = await readProjectFile(patchModal.filePath);
                setOpenFiles(prev => {
                  const updated = new Map(prev);
                  updated.set(patchModal.filePath, newContent.content);
                  return updated;
                });
                setPatchModal(null);
              } catch (err: any) {
                showError(`Failed to apply patch: ${err.message || 'Unknown error'}`);
              }
            }
          }}
          onCancel={() => setPatchModal(null)}
        />
      )}

      {/* Module C: Inline AI Comment */}
      {inlineComment && (
        <InlineComment
          top={inlineComment.top}
          left={inlineComment.left}
          message={inlineComment.message}
          examples={inlineComment.examples}
          relatedConcepts={inlineComment.relatedConcepts}
          onClose={() => setInlineComment(null)}
        />
      )}

      {/* Advanced Features Panel */}
      {showAdvancedPanel && (
        <AdvancedFeaturesPanel
          initialTab={advancedPanelTab}
          projectId={projectId}
          onClose={() => setShowAdvancedPanel(false)}
        />
      )}

      {/* IDE Dropdown Menu - CLEANED */}
      <IDEDropdownMenu
        isOpen={showIDEMenu}
        onClose={() => setShowIDEMenu(false)}
        onSave={handleSave}
        onUpload={() => fileInputRef.current?.click()}
        onDownloadProject={async () => {
          if (!projectId) {
            showError('No project loaded');
            return;
          }
          try {
            const { downloadProject } = await import('@/api/code');
            const blob = await downloadProject(projectId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            success('Project downloaded successfully');
          } catch (err: any) {
            showError(`Failed to download project: ${err.message || 'Unknown error'}`);
          }
        }}
        onRestoreProject={() => setShowRestoreDialog(true)}
        onTransferOwnership={() => setShowTransferDialog(true)}
        onToggleFileExplorer={() => setShowFileExplorer(!showFileExplorer)}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        onToggleTheme={toggleTheme}
        onToggleMinimap={handleToggleMinimap}
        onToggleWordWrap={handleToggleWordWrap}
        onFormatDocument={handleFormatDocument}
        onGoToLine={handleGoToLine}
        onCommandPalette={() => setCommandPaletteOpen(true)}
        onToggleGit={() => setShowGitPanel(!showGitPanel)}
        onToggleAgentTeams={() => setShowAgentTeams(!showAgentTeams)}
        onScreenshot={handleScreenshot}
        onToggleSearch={() => setShowSearch(!showSearch)}
        showFileExplorer={showFileExplorer}
        showTerminal={showTerminal}
        showMinimap={showMinimap}
        wordWrap={wordWrap}
        showGit={showGitPanel}
        showAgentTeams={showAgentTeams}
        showSearch={showSearch}
        hasActiveFile={!!activeTabId}
        hasUnsavedChanges={activeTabId ? unsavedChanges.has(activeTabId) : false}
        hasMonacoEditor={!!monacoEditor}
        projectId={projectId}
        theme={theme}
        onOpenAdvancedFeature={handleToggleAdvancedFeature}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        mode={commandPaletteMode}
        commands={buildCommands()}
        files={flattenFiles(files)}
        onSelect={handleCommandSelect}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Status Bar - Bottom of IDE */}
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
          if (activeView !== 'git') {
            setActiveView('git');
            setShowGitPanel(true);
          }
        }}
        onErrorsClick={() => {
          // Could open problems panel
        }}
        onWarningsClick={() => {
          // Could open problems panel
        }}
      />

      {/* Hidden file input for project upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadProject(file);
          } else {
          }
        }}
        onClick={(e) => {
          // Reset value to allow selecting the same file again
          (e.target as HTMLInputElement).value = '';
        }}
      />
    </div>
  );
};

