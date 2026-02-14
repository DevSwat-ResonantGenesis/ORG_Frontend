// Preview Component - Live preview iframe for web projects

import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { PreviewConfig } from '../types';
import { PreviewIcon } from '@/components/Icons/ResonantChatIcons';
import { RefreshCw, ExternalLink } from 'lucide-react';
import styles from '../EnhancedSplitView.module.css';

interface PreviewProps {
  config: PreviewConfig;
  codeBlocks?: Array<{ language: string; code: string }>;
  isActive?: boolean; // Whether the preview tab is currently visible
  onRefresh?: () => void;
  onOpenExternal?: () => void;
}

export const Preview: React.FC<PreviewProps> = ({
  config,
  codeBlocks,
  isActive = true,
  onRefresh,
  onOpenExternal,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  // Only render iframe when tab is active - prevents CPU usage from game loops
  useEffect(() => {
    if (isActive) {
      // Small delay before rendering to prevent flicker
      const timer = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timer);
    } else {
      // Immediately stop rendering when tab becomes inactive
      setShouldRender(false);
      // Clear iframe to stop any running scripts
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    }
  }, [isActive]);

  // Generate preview HTML from code blocks
  const generatedPreview = useMemo(() => {
    if (!codeBlocks || codeBlocks.length === 0) return null;

    // Find HTML, CSS, JS, and JSX code blocks
    const htmlBlock = codeBlocks.find(b => 
      b.language === 'html' || b.language === 'htm'
    );
    const cssBlocks = codeBlocks.filter(b => b.language === 'css');
    const jsBlocks = codeBlocks.filter(b => 
      b.language === 'javascript' || b.language === 'js'
    );
    const jsxBlocks = codeBlocks.filter(b => 
      b.language === 'jsx' || b.language === 'tsx' || b.language === 'react'
    );

    // If we have JSX/React code, render with React runtime
    if (jsxBlocks.length > 0) {
      const css = cssBlocks.map(b => b.code).join('\n');
      const jsxCode = jsxBlocks.map(b => b.code).join('\n');
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; background: #0a0a0f; color: #fff; }
    ${css}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${jsxCode}
    
    // Try to find and render the main component
    const components = [typeof App !== 'undefined' && App, typeof Grid !== 'undefined' && Grid, typeof Component !== 'undefined' && Component].filter(Boolean);
    if (components.length > 0) {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(components[0]));
    } else {
      document.getElementById('root').innerHTML = '<div style="text-align:center;padding:40px;"><h3>React Preview</h3><p>Code loaded. Define an App, Grid, or Component function to render.</p></div>';
    }
  </script>
</body>
</html>`;
    }

    // If we have HTML, build a complete preview
    if (htmlBlock) {
      const css = cssBlocks.map(b => b.code).join('\n');
      const js = jsBlocks.map(b => b.code).join('\n');
      
      // Check if HTML is a full document or just a fragment
      const isFullDoc = htmlBlock.code.includes('<html') || htmlBlock.code.includes('<!DOCTYPE');
      
      if (isFullDoc) {
        // Inject CSS and JS into existing document
        let html = htmlBlock.code;
        if (css && !html.includes('<style>')) {
          html = html.replace('</head>', `<style>${css}</style></head>`);
        }
        if (js && !html.includes('<script>')) {
          html = html.replace('</body>', `<script>${js}</script></body>`);
        }
        return html;
      } else {
        // Build a complete HTML document
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; }
    ${css}
  </style>
</head>
<body>
  ${htmlBlock.code}
  <script>${js}</script>
</body>
</html>`;
      }
    }

    // If only CSS/JS (no JSX), create a simple preview
    if (cssBlocks.length > 0 || jsBlocks.length > 0) {
      const css = cssBlocks.map(b => b.code).join('\n');
      const js = jsBlocks.map(b => b.code).join('\n');
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #0a0a0a; color: #fff; }
    .preview-info { text-align: center; padding: 40px; }
    ${css}
  </style>
</head>
<body>
  <div class="preview-info">
    <h3>Code Preview</h3>
    <p>CSS and JavaScript loaded. Add HTML to see visual output.</p>
  </div>
  <script>${js}</script>
</body>
</html>`;
    }

    return null;
  }, [codeBlocks]);

  // Update preview when code changes - debounced to prevent excessive renders
  useEffect(() => {
    if (generatedPreview) {
      // Debounce preview updates to prevent performance issues
      const timeoutId = setTimeout(() => {
        setPreviewHtml(generatedPreview);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedPreview]);

  // Cleanup iframe on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  const handleRefresh = () => {
    if (iframeRef.current) {
      if (config.url) {
        iframeRef.current.src = config.url;
      } else if (previewHtml) {
        // Force refresh by re-setting srcdoc
        const html = previewHtml;
        setPreviewHtml('');
        setTimeout(() => setPreviewHtml(html), 50);
      }
    }
    onRefresh?.();
  };

  const handleOpenExternal = () => {
    if (config.url) {
      window.open(config.url, '_blank');
    } else if (previewHtml) {
      // Open generated HTML in new tab
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
    onOpenExternal?.();
  };

  // Show empty state if no preview available
  if (!config.url && !previewHtml) {
    return (
      <div className={styles.previewEmpty}>
        <span className={styles.previewEmptyIcon}><PreviewIcon /></span>
        <h3>Preview</h3>
        <p>Run your project to see a live preview here</p>
        <p className={styles.previewHint}>
          Supports React, HTML, and other web projects
        </p>
      </div>
    );
  }

  return (
    <div className={styles.previewTabContent}>
      <span className={styles.previewLiveIndicator}>
        <span className={styles.previewLiveIcon}><PreviewIcon /></span>
        Live Preview
      </span>
      <div className={styles.previewOverlayControls}>
        <button
          type="button"
          className={styles.previewOverlayButton}
          onClick={handleRefresh}
          aria-label="Reload preview"
        >
          <RefreshCw size={16} />
        </button>
        <button
          type="button"
          className={styles.previewOverlayButton}
          onClick={handleOpenExternal}
          aria-label="Open preview in new tab"
        >
          <ExternalLink size={16} />
        </button>
      </div>
      {shouldRender && (
        <iframe
          ref={iframeRef}
          src={config.url || undefined}
          srcDoc={!config.url ? previewHtml || undefined : undefined}
          className={styles.previewIframe}
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      )}
      {!shouldRender && (
        <div className={styles.previewLoading}>
          Loading preview...
        </div>
      )}
    </div>
  );
};

export default Preview;
