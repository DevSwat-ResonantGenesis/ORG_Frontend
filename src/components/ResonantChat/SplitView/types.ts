// SplitView Types and Interfaces

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  explanation?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  idx: number;
}

export interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  file?: ProjectFile;
}

export interface TerminalOutput {
  id: string;
  content: string;
  type: 'command' | 'stdout' | 'stderr' | 'info';
  timestamp: Date;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
}

export interface TerminalCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface PreviewConfig {
  url: string | null;
  port?: number;
  processId?: string;
}

export type TabType = 'code' | 'preview' | 'terminal' | 'visualizer' | 'agents';

export interface SplitViewState {
  width: number;
  activeTab: TabType;
  selectedFile: ProjectFile | null;
  expandedFolders: Set<string>;
  terminalOutput: TerminalOutput[];
  terminalInput: string;
  isRunning: boolean;
  previewConfig: PreviewConfig;
  showNewFileDialog: boolean;
  newFileName: string;
  newFileLanguage: string;
  showDeleteConfirm: string | null;
}

export interface SplitViewActions {
  setWidth: (width: number) => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedFile: (file: ProjectFile | null) => void;
  toggleFolder: (path: string) => void;
  addTerminalOutput: (output: Omit<TerminalOutput, 'id' | 'timestamp'>) => void;
  clearTerminal: () => void;
  setTerminalInput: (input: string) => void;
  setIsRunning: (running: boolean) => void;
  setPreviewConfig: (config: PreviewConfig) => void;
  setShowNewFileDialog: (show: boolean) => void;
  setNewFileName: (name: string) => void;
  setNewFileLanguage: (lang: string) => void;
  setShowDeleteConfirm: (path: string | null) => void;
}

export interface SplitViewContextValue {
  state: SplitViewState;
  actions: SplitViewActions;
}
