import React, { lazy, Suspense, memo } from 'react';
import styles from './FilePreviewCard.module.css';

// Fallback component for when Monaco Editor fails to load
const EditorFallback = memo(() => (
  <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
    Editor loading...
  </div>
));
EditorFallback.displayName = 'EditorFallback';

// Lazy load Monaco Editor
const Editor = lazy(() => 
  import('@monaco-editor/react').catch(() => {
    return { default: EditorFallback };
  })
);

interface FilePreviewCardProps {
  filePath: string;
  content: string;
  language?: string;
  onOpenFile?: (filePath: string) => void;
  isModified?: boolean;
}

export const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  filePath,
  content,
  language,
  onOpenFile,
  isModified = false,
}) => {
  const detectLanguage = (path: string): string => {
    if (language) return language;
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
  };

  const handleClick = () => {
    if (onOpenFile) {
      onOpenFile(filePath);
    }
  };

  return (
    <div className={styles.filePreviewCard} onClick={handleClick}>
      <div className={styles.fileHeader}>
        <div className={styles.fileInfo}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fileIcon}>
            <path d="M4 2C4 1.44772 4.44772 1 5 1H9.58579C9.851 1 10.1054 1.10536 10.2929 1.29289L13.7071 4.70711C13.8946 4.89464 14 5.149 14 5.41421V12C14 12.5523 13.5523 13 13 13H5C4.44772 13 4 12.5523 4 12V2Z" />
          </svg>
          <span className={styles.filePath}>{filePath}</span>
          {isModified && <span className={styles.modifiedBadge}>Modified</span>}
        </div>
        <button className={styles.openButton} onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2L12 7L7 12M2 7H12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Open in Editor
        </button>
      </div>
      <div className={styles.codePreview}>
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading editor...</div>}>
          <Editor
            height="200px"
            language={detectLanguage(filePath)}
            value={content}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              folding: false,
              wordWrap: 'on',
              renderLineHighlight: 'none',
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              overviewRulerLanes: 0,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                useShadows: false,
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};

