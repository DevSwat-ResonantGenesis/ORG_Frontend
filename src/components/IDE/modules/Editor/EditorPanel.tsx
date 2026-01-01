import React from 'react';
import { CursorEditorView } from '../../CursorEditorView';
import { CursorTabsBar } from '../../CursorTabsBar';
import styles from './EditorPanel.module.css';
import type { Tab } from './useEditorState';

export interface EditorPanelProps {
    // Tab state
    tabs: Tab[];
    activeTabId: string | null;

    // File content
    activeFileContent: string;
    activeFilePath: string | null;

    // Tab handlers
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string, e: React.MouseEvent) => void;

    // Editor handlers
    onEditorChange: (value: string | undefined) => void;
    onEditorMount?: (editor: any) => void;

    // Editor actions
    onSave?: () => void;
    onFindReplace?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onFormatDocument?: () => void;
    onGoToLine?: () => void;

    // UI state
    loading?: boolean;
    showMinimap?: boolean;
    wordWrap?: boolean;

    // Empty state
    emptyStateMessage?: string;
}

/**
 * EditorPanel - Main code editor panel with tabs
 * 
 * This component provides:
 * - Tab bar for open files
 * - Monaco editor for code editing
 * - Empty state when no files are open
 * - Loading overlay
 */
export const EditorPanel: React.FC<EditorPanelProps> = ({
    tabs,
    activeTabId,
    activeFileContent,
    activeFilePath,
    onTabClick,
    onTabClose,
    onEditorChange,
    onEditorMount,
    onSave,
    onFindReplace,
    onUndo,
    onRedo,
    onFormatDocument,
    onGoToLine,
    loading = false,
    showMinimap = true,
    wordWrap = false,
    emptyStateMessage = 'No file selected. Open a file from the explorer to start editing.',
}) => {
    return (
        <div className={styles.editorPanel}>
            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}

            {/* Tabs Bar */}
            {tabs.length > 0 && (
                <CursorTabsBar
                    tabs={tabs}
                    activeTabId={activeTabId}
                    onTabClick={onTabClick}
                    onTabClose={onTabClose}
                />
            )}

            {/* Editor or Empty State */}
            {activeTabId && activeFilePath ? (
                <CursorEditorView
                    value={activeFileContent}
                    onChange={onEditorChange}
                    onMount={onEditorMount}
                    language={getLanguageFromPath(activeFilePath)}
                    path={activeFilePath}
                    options={{
                        minimap: { enabled: showMinimap },
                        wordWrap: wordWrap ? 'on' : 'off',
                        fontSize: 14,
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </div>
                    <p className={styles.emptyStateMessage}>{emptyStateMessage}</p>
                    <p className={styles.emptyStateHint}>
                        💡 Tip: Double-click a file in the explorer to open it
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Get Monaco language from file path
 */
function getLanguageFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase() || '';

    const languageMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'json': 'json',
        'md': 'markdown',
        'css': 'css',
        'scss': 'scss',
        'less': 'less',
        'html': 'html',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'txt': 'plaintext',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'php': 'php',
        'rb': 'ruby',
    };

    return languageMap[extension] || 'plaintext';
}
