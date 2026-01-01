import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useIDE } from './context/IDEContext';
import styles from './CursorPreviewPanel.module.css';

interface CursorPreviewPanelProps {
  className?: string;
}

export const CursorPreviewPanel: React.FC<CursorPreviewPanelProps> = ({ className }) => {
  const { state } = useIDE();
  const { files, openFiles } = state;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Collect all file contents from the IDE state
  const fileContents = useMemo(() => {
    const contents: Record<string, string> = {};
    
    // Get content from openFiles (edited content)
    openFiles.forEach((content, path) => {
      contents[path] = content;
    });
    
    // Also get content from files tree (for files not yet opened)
    const collectFromTree = (nodes: typeof files) => {
      for (const node of nodes) {
        if (node.type === 'file' && (node as any).content && !contents[node.path]) {
          contents[node.path] = (node as any).content;
        }
        if (node.children) {
          collectFromTree(node.children);
        }
      }
    };
    collectFromTree(files);
    
    return contents;
  }, [files, openFiles]);

  // Generate preview HTML
  const previewHtml = useMemo(() => {
    const htmlFile = Object.keys(fileContents).find(p => p.endsWith('.html') || p.endsWith('index.html'));
    const cssFiles = Object.keys(fileContents).filter(p => p.endsWith('.css'));
    const jsFiles = Object.keys(fileContents).filter(p => p.endsWith('.js'));

    if (!htmlFile) {
      return null;
    }

    let html = fileContents[htmlFile] || '';

    // Inject CSS into head
    const cssContent = cssFiles.map(f => fileContents[f] || '').join('\n');
    if (cssContent) {
      const styleTag = `<style>\n${cssContent}\n</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}\n</head>`);
      } else if (html.includes('<body')) {
        html = html.replace('<body', `${styleTag}\n<body`);
      } else {
        html = styleTag + '\n' + html;
      }
    }

    // Inject JS before closing body
    const jsContent = jsFiles.map(f => fileContents[f] || '').join('\n\n');
    if (jsContent) {
      const scriptTag = `<script>\n${jsContent}\n</script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        html = html + '\n' + scriptTag;
      }
    }

    return html;
  }, [fileContents]);

  // Refresh preview
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPreviewKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  }, []);

  // Open in new tab
  const handleOpenExternal = useCallback(() => {
    if (previewHtml) {
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }, [previewHtml]);

  if (!previewHtml) {
    return (
      <div className={`${styles.previewPanel} ${className || ''}`}>
        <div className={styles.header}>
          <span className={styles.title}>Preview</span>
        </div>
        <div className={styles.noPreview}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <circle cx="7" cy="6" r="1" fill="currentColor" />
            <circle cx="10" cy="6" r="1" fill="currentColor" />
          </svg>
          <p>No HTML file to preview</p>
          <span>Create an index.html file to see the preview</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.previewPanel} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.title}>Preview</span>
        <div className={styles.actions}>
          <button 
            className={styles.actionButton} 
            onClick={handleRefresh}
            title="Refresh preview"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={isRefreshing ? styles.spinning : ''}
            >
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
          <button 
            className={styles.actionButton} 
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.previewContent}>
        <iframe
          key={previewKey}
          ref={iframeRef}
          srcDoc={previewHtml}
          title="Preview"
          sandbox="allow-scripts allow-modals"
          className={styles.iframe}
        />
      </div>
    </div>
  );
};

export default CursorPreviewPanel;
