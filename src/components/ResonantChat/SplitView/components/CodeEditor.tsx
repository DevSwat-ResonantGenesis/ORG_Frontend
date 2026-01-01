// CodeEditor Component - Monaco Editor wrapper for file editing

import React from 'react';
import { Editor } from '@monaco-editor/react';
import { CopyIcon } from '@/components/Icons/ResonantChatIcons';
import type { ProjectFile } from '../types';
import { getLanguageFromPath } from '../constants';
import styles from '../EnhancedSplitView.module.css';

interface CodeEditorProps {
  file: ProjectFile | null;
  onFileChange?: (path: string, content: string) => void;
  onCopyCode: (code: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  file,
  onFileChange,
  onCopyCode,
  readOnly = false,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (file && value !== undefined && onFileChange) {
      onFileChange(file.path, value);
    }
  };

  if (!file) {
    return (
      <div className={styles.noSelection}>
        <span>📄</span>
        <p>Select a file to view</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.editorHeader}>
        <span className={styles.editorPath}>{file.path}</span>
        <div className={styles.editorActions}>
          <button
            className={styles.copyButton}
            onClick={() => onCopyCode(file.content)}
            title="Copy code"
          >
            <CopyIcon />
          </button>
        </div>
      </div>
      <div className={styles.editorContainer}>
        <Editor
          height="100%"
          theme="vs-dark"
          language={getLanguageFromPath(file.path)}
          value={file.content}
          onChange={handleEditorChange}
          options={{
            readOnly: readOnly || !onFileChange,
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </>
  );
};

export default CodeEditor;
