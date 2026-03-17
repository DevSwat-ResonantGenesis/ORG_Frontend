// SplitView State Management Hook

import { useState, useCallback } from 'react';
import type { 
  SplitViewState, 
  SplitViewActions, 
  ProjectFile, 
  TabType, 
  TerminalOutput,
  PreviewConfig 
} from '../types';
import { DEFAULT_SPLIT_WIDTH } from '../constants';

export const useSplitViewState = (initialWidth = DEFAULT_SPLIT_WIDTH) => {
  const [width, setWidth] = useState(initialWidth);
  const [activeTab, setActiveTab] = useState<TabType>('agents');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig>({ url: null });
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('typescript');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }, []);

  const addTerminalOutput = useCallback((output: Omit<TerminalOutput, 'id' | 'timestamp'>) => {
    const newOutput: TerminalOutput = {
      ...output,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setTerminalOutput(prev => [...prev, newOutput]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

  const state: SplitViewState = {
    width,
    activeTab,
    selectedFile,
    expandedFolders,
    terminalOutput,
    terminalInput,
    isRunning,
    previewConfig,
    showNewFileDialog,
    newFileName,
    newFileLanguage,
    showDeleteConfirm,
  };

  const actions: SplitViewActions = {
    setWidth,
    setActiveTab,
    setSelectedFile,
    toggleFolder,
    addTerminalOutput,
    clearTerminal,
    setTerminalInput,
    setIsRunning,
    setPreviewConfig,
    setShowNewFileDialog,
    setNewFileName,
    setNewFileLanguage,
    setShowDeleteConfirm,
  };

  return { state, actions };
};

export default useSplitViewState;
