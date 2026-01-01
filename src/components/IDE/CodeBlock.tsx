import React, { lazy, Suspense, memo } from 'react';
import styles from './CodeBlock.module.css';

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

interface CodeBlockProps {
  code: string;
  language?: string;
  filePath?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, filePath }) => {
  const detectLanguage = (code: string, hint?: string): string => {
    // Normalize hint
    if (hint) {
      const normalized = hint.toLowerCase().trim();
      // Map common aliases
      if (normalized === 'ts' || normalized === 'tsx') return 'typescript';
      if (normalized === 'js' || normalized === 'jsx') return 'javascript';
      if (normalized === 'py') return 'python';
      return normalized;
    }
    
    // Detect from code patterns (check first few lines)
    const firstLines = code.split('\n').slice(0, 5).join('\n');
    
    if (firstLines.match(/^(import|export|const|let|var|function|class|interface|type)\s/)) {
      return 'typescript';
    }
    if (firstLines.match(/^(def|import|from|class)\s/)) {
      return 'python';
    }
    if (firstLines.match(/^(function|const|let|var)\s.*=>/)) {
      return 'javascript';
    }
    if (firstLines.match(/^(<!DOCTYPE|<html|<div)/)) {
      return 'html';
    }
    if (firstLines.match(/(\.css|color:|background:|@media)/)) {
      return 'css';
    }
    if (firstLines.match(/^(SELECT|INSERT|UPDATE|DELETE)\s/)) {
      return 'sql';
    }
    if (firstLines.match(/^(package|import java|public class)/)) {
      return 'java';
    }
    if (firstLines.match(/^(#include|int main|void main)/)) {
      return 'cpp';
    }
    
    return 'plaintext';
  };

  const detectedLang = detectLanguage(code, language);
  
  // Ensure code is not empty
  if (!code || !code.trim()) {
    return null;
  }

  return (
    <div className={styles.codeBlockWrapper}>
      {filePath && (
        <div className={styles.codeBlockHeader}>
          <span className={styles.codeBlockPath}>{filePath}</span>
        </div>
      )}
      <div className={styles.codeBlock}>
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading editor...</div>}>
          <Editor
            height={`${Math.min(code.split('\n').length * 20 + 40, 400)}px`}
            language={detectedLang}
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'off',
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
