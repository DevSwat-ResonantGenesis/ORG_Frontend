import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { type FileNode } from '../CursorFileTree';
import { type Tab } from '../CursorTabsBar';
import { type Provider } from '@/components/ui/ProviderSelector';
import { type Agent } from '../CursorChatPanel';
import { type AgentTeam } from '@/api/agentTeams';

// ============================================================================
// Types
// ============================================================================

export type ActiveView = 
  | 'files' 
  | 'search' 
  | 'git' 
  | 'collaboration' 
  | 'deployment' 
  | 'run' 
  | 'testing' 
  | 'extensions' 
  | 'settings' 
  | 'ai' 
  | 'editor'
  | 'dsidp'
  | 'builder';

export type SplitView = 'none' | 'horizontal' | 'vertical';
export type GitStatus = 'clean' | 'modified' | 'conflict';

export interface PatchModalData {
  oldCode: string;
  newCode: string;
  fileName: string;
  filePath: string;
}

export interface InlineCommentData {
  top: number;
  left: number;
  message: string;
  examples?: string[];
  relatedConcepts?: string[];
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface IDEState {
  // File Management
  files: FileNode[];
  openFiles: Map<string, string>;
  tabs: Tab[];
  activeTabId: string | null;
  expandedFolders: Set<string>;
  unsavedChanges: Set<string>;
  
  // UI State
  activeView: ActiveView;
  showChat: boolean;
  showSidebar: boolean;
  showFileExplorer: boolean;
  showTerminal: boolean;
  showGitPanel: boolean;
  showSettings: boolean;
  showMinimap: boolean;
  showSearch: boolean;
  showAgentTeams: boolean;
  showAdvancedPanel: boolean;
  showPreview: boolean;
  commandPaletteOpen: boolean;
  commandPaletteMode: 'command' | 'file';
  
  // Panel Widths
  fileTreeWidth: number;
  gitPanelWidth: number;
  chatPanelWidth: number;
  previewPanelWidth: number;
  
  // Editor State
  cursorPosition: CursorPosition;
  currentLanguage: string;
  wordWrap: boolean;
  monacoEditor: any;
  
  // Git State
  gitBranch: string | undefined;
  gitStatus: GitStatus;
  
  // Navigation
  navigationHistory: string[];
  navigationIndex: number;
  splitView: SplitView;
  splitActiveTabId: string | null;
  
  // AI & Providers
  selectedProvider: Provider;
  selectedAgent: Agent;
  teams: AgentTeam[];
  
  // Modals
  patchModal: PatchModalData | null;
  inlineComment: InlineCommentData | null;
  showRestoreDialog: boolean;
  showTransferDialog: boolean;
  showArchiveDialog: boolean;
  archiveDialogData: { projectId?: string; path: string } | null;
  
  // Status
  loading: boolean;
  running: boolean;
  errors: number;
  warnings: number;
}

// ============================================================================
// Actions
// ============================================================================

type IDEAction =
  // File Actions
  | { type: 'SET_FILES'; payload: FileNode[] }
  | { type: 'SET_OPEN_FILES'; payload: Map<string, string> }
  | { type: 'OPEN_FILE'; payload: { path: string; content: string } }
  | { type: 'CLOSE_FILE'; payload: string }
  | { type: 'ADD_FILE'; payload: { name: string; path: string; type: 'file'; content: string } }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string | null }
  | { type: 'SET_TABS'; payload: Tab[] }
  | { type: 'TOGGLE_FOLDER'; payload: string }
  | { type: 'MARK_UNSAVED'; payload: string }
  | { type: 'MARK_SAVED'; payload: string }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { path: string; content: string } }
  
  // UI Actions
  | { type: 'SET_ACTIVE_VIEW'; payload: ActiveView }
  | { type: 'TOGGLE_CHAT'; payload?: boolean }
  | { type: 'TOGGLE_SIDEBAR'; payload?: boolean }
  | { type: 'TOGGLE_FILE_EXPLORER'; payload?: boolean }
  | { type: 'TOGGLE_TERMINAL'; payload?: boolean }
  | { type: 'TOGGLE_GIT_PANEL'; payload?: boolean }
  | { type: 'TOGGLE_SETTINGS'; payload?: boolean }
  | { type: 'TOGGLE_MINIMAP'; payload?: boolean }
  | { type: 'TOGGLE_SEARCH'; payload?: boolean }
  | { type: 'TOGGLE_AGENT_TEAMS'; payload?: boolean }
  | { type: 'TOGGLE_ADVANCED_PANEL'; payload?: boolean }
  | { type: 'TOGGLE_PREVIEW'; payload?: boolean }
  | { type: 'SET_COMMAND_PALETTE'; payload: { open: boolean; mode?: 'command' | 'file' } }
  
  // Panel Width Actions
  | { type: 'SET_FILE_TREE_WIDTH'; payload: number }
  | { type: 'SET_GIT_PANEL_WIDTH'; payload: number }
  | { type: 'SET_CHAT_PANEL_WIDTH'; payload: number }
  | { type: 'SET_PREVIEW_PANEL_WIDTH'; payload: number }
  
  // Editor Actions
  | { type: 'SET_CURSOR_POSITION'; payload: CursorPosition }
  | { type: 'SET_CURRENT_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_WORD_WRAP' }
  | { type: 'SET_MONACO_EDITOR'; payload: any }
  
  // Git Actions
  | { type: 'SET_GIT_BRANCH'; payload: string | undefined }
  | { type: 'SET_GIT_STATUS'; payload: GitStatus }
  
  // Navigation Actions
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_FORWARD' }
  | { type: 'ADD_TO_HISTORY'; payload: string }
  | { type: 'SET_SPLIT_VIEW'; payload: SplitView }
  | { type: 'SET_SPLIT_ACTIVE_TAB'; payload: string | null }
  
  // AI & Provider Actions
  | { type: 'SET_PROVIDER'; payload: Provider }
  | { type: 'SET_AGENT'; payload: Agent }
  | { type: 'SET_TEAMS'; payload: AgentTeam[] }
  
  // Modal Actions
  | { type: 'SET_PATCH_MODAL'; payload: PatchModalData | null }
  | { type: 'SET_INLINE_COMMENT'; payload: InlineCommentData | null }
  | { type: 'SET_RESTORE_DIALOG'; payload: boolean }
  | { type: 'SET_TRANSFER_DIALOG'; payload: boolean }
  | { type: 'SET_ARCHIVE_DIALOG'; payload: { show: boolean; data?: { projectId?: string; path: string } | null } }
  
  // Status Actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: number }
  | { type: 'SET_WARNINGS'; payload: number }
  
  // Bulk Actions
  | { type: 'RESET_STATE' }
  | { type: 'CLEAR_PROJECT' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: IDEState = {
  // File Management
  files: [],
  openFiles: new Map(),
  tabs: [],
  activeTabId: null,
  expandedFolders: new Set(),
  unsavedChanges: new Set(),
  
  // UI State
  activeView: 'files',
  showChat: true,
  showSidebar: true,
  showFileExplorer: true,
  showTerminal: false,
  showGitPanel: false,
  showSettings: false,
  showMinimap: true,
  showSearch: false,
  showAgentTeams: false,
  showAdvancedPanel: false,
  showPreview: false,
  commandPaletteOpen: false,
  commandPaletteMode: 'command',
  
  // Panel Widths
  fileTreeWidth: 240,
  gitPanelWidth: 320,
  chatPanelWidth: 350,
  previewPanelWidth: 400,
  
  // Editor State
  cursorPosition: { line: 1, column: 1 },
  currentLanguage: '',
  wordWrap: false,
  monacoEditor: null,
  
  // Git State
  gitBranch: undefined,
  gitStatus: 'clean',
  
  // Navigation
  navigationHistory: [],
  navigationIndex: -1,
  splitView: 'none',
  splitActiveTabId: null,
  
  // AI & Providers
  selectedProvider: 'auto',
  selectedAgent: 'default',
  teams: [],
  
  // Modals
  patchModal: null,
  inlineComment: null,
  showRestoreDialog: false,
  showTransferDialog: false,
  showArchiveDialog: false,
  archiveDialogData: null,
  
  // Status
  loading: false,
  running: false,
  errors: 0,
  warnings: 0,
};

// ============================================================================
// Reducer
// ============================================================================

function ideReducer(state: IDEState, action: IDEAction): IDEState {
  switch (action.type) {
    // File Actions
    case 'SET_FILES':
      return { ...state, files: action.payload };
      
    case 'SET_OPEN_FILES':
      return { ...state, openFiles: action.payload };
      
    case 'OPEN_FILE': {
      const newOpenFiles = new Map(state.openFiles);
      newOpenFiles.set(action.payload.path, action.payload.content);
      const newTabs = [...state.tabs];
      if (!newTabs.find(t => t.id === action.payload.path)) {
        newTabs.push({
          id: action.payload.path,
          path: action.payload.path,
          name: action.payload.path.split('/').pop() || action.payload.path,
          isDirty: false,
        });
      }
      return {
        ...state,
        openFiles: newOpenFiles,
        tabs: newTabs,
        activeTabId: action.payload.path,
      };
    }
    
    case 'ADD_FILE': {
      // Add new file to files array
      const newFile: FileNode = {
        name: action.payload.name,
        path: action.payload.path,
        type: 'file',
        content: action.payload.content,
      };
      // Check if file already exists
      const existingIndex = state.files.findIndex(f => f.path === action.payload.path);
      let newFiles: FileNode[];
      if (existingIndex >= 0) {
        // Update existing file
        newFiles = [...state.files];
        newFiles[existingIndex] = newFile;
      } else {
        // Add new file
        newFiles = [...state.files, newFile];
      }
      return { ...state, files: newFiles };
    }
    
    case 'DELETE_FILE': {
      // Recursively remove file/folder from nested tree structure
      const removeFromTree = (nodes: FileNode[], pathToRemove: string): FileNode[] => {
        return nodes
          .filter(node => {
            // Remove if exact match or if it's inside the folder being deleted
            if (node.path === pathToRemove || node.path.startsWith(pathToRemove + '/')) {
              return false;
            }
            return true;
          })
          .map(node => {
            if (node.children && node.children.length > 0) {
              return { ...node, children: removeFromTree(node.children, pathToRemove) };
            }
            return node;
          });
      };
      
      const newFiles = removeFromTree(state.files, action.payload);
      const newOpenFiles = new Map(state.openFiles);
      // Close all files under the deleted path
      for (const path of newOpenFiles.keys()) {
        if (path === action.payload || path.startsWith(action.payload + '/')) {
          newOpenFiles.delete(path);
        }
      }
      const newTabs = state.tabs.filter(t => 
        t.id !== action.payload && !t.id.startsWith(action.payload + '/')
      );
      const newActiveTabId = state.activeTabId === action.payload || 
        (state.activeTabId && state.activeTabId.startsWith(action.payload + '/'))
        ? (newTabs[0]?.id || null)
        : state.activeTabId;
      return {
        ...state,
        files: newFiles,
        openFiles: newOpenFiles,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    }
    
    case 'CLOSE_FILE': {
      const newOpenFiles = new Map(state.openFiles);
      newOpenFiles.delete(action.payload);
      const newTabs = state.tabs.filter(t => t.id !== action.payload);
      const newActiveTabId = state.activeTabId === action.payload
        ? (newTabs[0]?.id || null)
        : state.activeTabId;
      const newUnsavedChanges = new Set(state.unsavedChanges);
      newUnsavedChanges.delete(action.payload);
      return {
        ...state,
        openFiles: newOpenFiles,
        tabs: newTabs,
        activeTabId: newActiveTabId,
        unsavedChanges: newUnsavedChanges,
      };
    }
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload };
      
    case 'SET_TABS':
      return { ...state, tabs: action.payload };
      
    case 'TOGGLE_FOLDER': {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedFolders: newExpanded };
    }
    
    case 'MARK_UNSAVED': {
      const newUnsaved = new Set(state.unsavedChanges);
      newUnsaved.add(action.payload);
      return { ...state, unsavedChanges: newUnsaved };
    }
    
    case 'MARK_SAVED': {
      const newUnsaved = new Set(state.unsavedChanges);
      newUnsaved.delete(action.payload);
      return { ...state, unsavedChanges: newUnsaved };
    }
    
    case 'UPDATE_FILE_CONTENT': {
      const newOpenFiles = new Map(state.openFiles);
      newOpenFiles.set(action.payload.path, action.payload.content);
      // Also update the files array content if the file exists there
      const newFiles = state.files.map(f => 
        f.path === action.payload.path 
          ? { ...f, content: action.payload.content }
          : f
      );
      return { ...state, openFiles: newOpenFiles, files: newFiles };
    }
    
    // UI Actions
    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };
      
    case 'TOGGLE_CHAT':
      return { ...state, showChat: action.payload ?? !state.showChat };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, showSidebar: action.payload ?? !state.showSidebar };
      
    case 'TOGGLE_FILE_EXPLORER':
      return { ...state, showFileExplorer: action.payload ?? !state.showFileExplorer };
      
    case 'TOGGLE_TERMINAL':
      return { ...state, showTerminal: action.payload ?? !state.showTerminal };
      
    case 'TOGGLE_GIT_PANEL':
      return { ...state, showGitPanel: action.payload ?? !state.showGitPanel };
      
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: action.payload ?? !state.showSettings };
      
    case 'TOGGLE_MINIMAP':
      return { ...state, showMinimap: action.payload ?? !state.showMinimap };
      
    case 'TOGGLE_SEARCH':
      return { ...state, showSearch: action.payload ?? !state.showSearch };
      
    case 'TOGGLE_AGENT_TEAMS':
      return { ...state, showAgentTeams: action.payload ?? !state.showAgentTeams };
      
    case 'TOGGLE_ADVANCED_PANEL':
      return { ...state, showAdvancedPanel: action.payload ?? !state.showAdvancedPanel };
      
    case 'TOGGLE_PREVIEW':
      return { ...state, showPreview: action.payload ?? !state.showPreview };
      
    case 'SET_COMMAND_PALETTE':
      return {
        ...state,
        commandPaletteOpen: action.payload.open,
        commandPaletteMode: action.payload.mode ?? state.commandPaletteMode,
      };
    
    // Panel Width Actions
    case 'SET_FILE_TREE_WIDTH':
      return { ...state, fileTreeWidth: action.payload };
      
    case 'SET_GIT_PANEL_WIDTH':
      return { ...state, gitPanelWidth: action.payload };
      
    case 'SET_CHAT_PANEL_WIDTH':
      return { ...state, chatPanelWidth: action.payload };
      
    case 'SET_PREVIEW_PANEL_WIDTH':
      return { ...state, previewPanelWidth: action.payload };
    
    // Editor Actions
    case 'SET_CURSOR_POSITION':
      return { ...state, cursorPosition: action.payload };
      
    case 'SET_CURRENT_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
      
    case 'TOGGLE_WORD_WRAP':
      return { ...state, wordWrap: !state.wordWrap };
      
    case 'SET_MONACO_EDITOR':
      return { ...state, monacoEditor: action.payload };
    
    // Git Actions
    case 'SET_GIT_BRANCH':
      return { ...state, gitBranch: action.payload };
      
    case 'SET_GIT_STATUS':
      return { ...state, gitStatus: action.payload };
    
    // Navigation Actions
    case 'NAVIGATE_BACK': {
      if (state.navigationIndex <= 0) return state;
      const newIndex = state.navigationIndex - 1;
      return {
        ...state,
        navigationIndex: newIndex,
        activeTabId: state.navigationHistory[newIndex] || null,
      };
    }
    
    case 'NAVIGATE_FORWARD': {
      if (state.navigationIndex >= state.navigationHistory.length - 1) return state;
      const newIndex = state.navigationIndex + 1;
      return {
        ...state,
        navigationIndex: newIndex,
        activeTabId: state.navigationHistory[newIndex] || null,
      };
    }
    
    case 'ADD_TO_HISTORY': {
      const newHistory = [...state.navigationHistory.slice(0, state.navigationIndex + 1), action.payload];
      return {
        ...state,
        navigationHistory: newHistory,
        navigationIndex: newHistory.length - 1,
      };
    }
    
    case 'SET_SPLIT_VIEW':
      return { ...state, splitView: action.payload };
      
    case 'SET_SPLIT_ACTIVE_TAB':
      return { ...state, splitActiveTabId: action.payload };
    
    // AI & Provider Actions
    case 'SET_PROVIDER':
      return { ...state, selectedProvider: action.payload };
      
    case 'SET_AGENT':
      return { ...state, selectedAgent: action.payload };
      
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    
    // Modal Actions
    case 'SET_PATCH_MODAL':
      return { ...state, patchModal: action.payload };
      
    case 'SET_INLINE_COMMENT':
      return { ...state, inlineComment: action.payload };
      
    case 'SET_RESTORE_DIALOG':
      return { ...state, showRestoreDialog: action.payload };
      
    case 'SET_TRANSFER_DIALOG':
      return { ...state, showTransferDialog: action.payload };
      
    case 'SET_ARCHIVE_DIALOG':
      return {
        ...state,
        showArchiveDialog: action.payload.show,
        archiveDialogData: action.payload.data ?? null,
      };
    
    // Status Actions
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_RUNNING':
      return { ...state, running: action.payload };
      
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
      
    case 'SET_WARNINGS':
      return { ...state, warnings: action.payload };
    
    // Bulk Actions
    case 'RESET_STATE':
      return initialState;
      
    case 'CLEAR_PROJECT':
      return {
        ...state,
        files: [],
        openFiles: new Map(),
        tabs: [],
        activeTabId: null,
        expandedFolders: new Set(),
        unsavedChanges: new Set(),
        navigationHistory: [],
        navigationIndex: -1,
      };
    
    default:
      return state;
  }
}

// ============================================================================
// Context
// ============================================================================

interface IDEContextValue {
  state: IDEState;
  dispatch: React.Dispatch<IDEAction>;
  
  // Convenience methods
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveTab: (tabId: string | null) => void;
  toggleFolder: (path: string) => void;
  setActiveView: (view: ActiveView) => void;
  toggleChat: (show?: boolean) => void;
  setLoading: (loading: boolean) => void;
}

const IDEContext = createContext<IDEContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface IDEProviderProps {
  children: ReactNode;
  initialProjectId?: string;
}

export function IDEProvider({ children, initialProjectId }: IDEProviderProps) {
  const [state, dispatch] = useReducer(ideReducer, initialState);
  
  // Convenience methods
  const openFile = useCallback((path: string, content: string) => {
    dispatch({ type: 'OPEN_FILE', payload: { path, content } });
  }, []);
  
  const closeFile = useCallback((path: string) => {
    dispatch({ type: 'CLOSE_FILE', payload: path });
  }, []);
  
  const setActiveTab = useCallback((tabId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  }, []);
  
  const toggleFolder = useCallback((path: string) => {
    dispatch({ type: 'TOGGLE_FOLDER', payload: path });
  }, []);
  
  const setActiveView = useCallback((view: ActiveView) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: view });
  }, []);
  
  const toggleChat = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_CHAT', payload: show });
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  
  const value = useMemo(() => ({
    state,
    dispatch,
    openFile,
    closeFile,
    setActiveTab,
    toggleFolder,
    setActiveView,
    toggleChat,
    setLoading,
  }), [state, openFile, closeFile, setActiveTab, toggleFolder, setActiveView, toggleChat, setLoading]);
  
  return (
    <IDEContext.Provider value={value}>
      {children}
    </IDEContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useIDE() {
  const context = useContext(IDEContext);
  if (!context) {
    throw new Error('useIDE must be used within an IDEProvider');
  }
  return context;
}

// Types are already exported above
