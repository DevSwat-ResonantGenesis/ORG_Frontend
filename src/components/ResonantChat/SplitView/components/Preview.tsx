import React, { useRef, useState, useEffect, useMemo } from 'react';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';
import styles from '../EnhancedSplitView.module.css';
import { PreviewIcon } from '@/components/Icons/ResonantChatIcons';

interface PreviewConfig {
  url?: string;
  port?: number;
  processId?: string;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

interface PreviewProps {
  config: PreviewConfig;
  codeBlocks?: CodeBlock[];
  isActive?: boolean;
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
  const [customUrl, setCustomUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Only render iframe when tab is active
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShouldRender(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    }
  }, [isActive]);

  // Generate preview HTML from code blocks
  const generatedPreview = useMemo(() => {
    if (!codeBlocks || codeBlocks.length === 0) return null;

    const htmlBlock = codeBlocks.find(b => b.language === 'html' || b.language === 'htm');
    const cssBlocks = codeBlocks.filter(b => b.language === 'css');
    const jsBlocks = codeBlocks.filter(b => b.language === 'javascript' || b.language === 'js');
    const jsxBlocks = codeBlocks.filter(b => b.language === 'jsx' || b.language === 'tsx' || b.language === 'react');

    if (jsxBlocks.length > 0) {
      const css = cssBlocks.map(b => b.code).join('\n');
      const jsxCode = jsxBlocks.map(b => b.code).join('\n');
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; background: #0a0a0f; color: #fff; } ${css}</style></head><body><div id="root"></div><script type="text/babel">${jsxCode} const components = [typeof App !== 'undefined' && App, typeof Grid !== 'undefined' && Grid, typeof Component !== 'undefined' && Component].filter(Boolean); if (components.length > 0) { const root = ReactDOM.createRoot(document.getElementById('root')); root.render(React.createElement(components[0])); }</script></body></html>`;
    }

    if (htmlBlock) {
      const css = cssBlocks.map(b => b.code).join('\n');
      const js = jsBlocks.map(b => b.code).join('\n');
      const isFullDoc = htmlBlock.code.includes('<html') || htmlBlock.code.includes('<!DOCTYPE');
      if (isFullDoc) {
        let html = htmlBlock.code;
        if (css) html = html.replace('</head>', `<style>${css}</style></head>`);
        if (js) html = html.replace('</body>', `<script>${js}</script></body>`);
        return html;
      }
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; } ${css}</style></head><body>${htmlBlock.code}<script>${js}</script></body></html>`;
    }

    return null;
  }, [codeBlocks]);

  useEffect(() => {
    if (generatedPreview) {
      const timeoutId = setTimeout(() => setPreviewHtml(generatedPreview), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [generatedPreview]);

  useEffect(() => {
    return () => {
      if (iframeRef.current) iframeRef.current.src = 'about:blank';
    };
  }, []);

  const handleRefresh = () => {
    if (iframeRef.current) {
      if (activeUrl) {
        iframeRef.current.src = activeUrl;
      } else if (config.url) {
        iframeRef.current.src = config.url;
      } else if (previewHtml) {
        const html = previewHtml;
        setPreviewHtml('');
        setTimeout(() => setPreviewHtml(html), 50);
      }
    }
    onRefresh?.();
  };

  const handleOpenExternal = () => {
    const url = activeUrl || config.url;
    if (url) {
      window.open(url, '_blank');
    } else if (previewHtml) {
      const blob = new Blob([previewHtml], { type: 'text/html' });
      window.open(URL.createObjectURL(blob), '_blank');
    }
    onOpenExternal?.();
  };

  const handleLoadUrl = () => {
    if (customUrl.trim()) {
      let url = customUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      setActiveUrl(url);
      setShowUrlInput(false);
    }
  };

  const handleClearUrl = () => {
    setActiveUrl(null);
    setCustomUrl('');
  };

  const currentUrl = activeUrl || config.url;

  if (!currentUrl && !previewHtml) {
    return (
      <div className={styles.previewEmpty}>
        <span className={styles.previewEmptyIcon}><PreviewIcon /></span>
        <h3>Preview</h3>
        <p>Run your project to see a live preview here</p>
        
        {/* URL Input Section */}
        <div style={{ marginTop: '20px', width: '100%', maxWidth: '400px' }}>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Or open any website:</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter URL (e.g., google.com)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleLoadUrl}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Globe size={14} /> Open
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewTabContent}>
      <span className={styles.previewLiveIndicator}>
        <span className={styles.previewLiveIcon}><PreviewIcon /></span>
        {activeUrl ? 'Browser' : 'Live Preview'}
      </span>
      
      {/* URL Bar */}
      {showUrlInput ? (
        <div style={{ 
          position: 'absolute', 
          top: '40px', 
          left: '10px', 
          right: '10px', 
          zIndex: 100,
          display: 'flex',
          gap: '8px',
          background: 'rgba(0,0,0,0.9)',
          padding: '8px',
          borderRadius: '8px',
        }}>
          <input
            type="text"
            placeholder="Enter URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
            autoFocus
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button onClick={handleLoadUrl} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>Go</button>
          <button onClick={() => setShowUrlInput(false)} style={{ padding: '8px 12px', background: '#666', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
        </div>
      ) : null}
      
      <div className={styles.previewOverlayControls}>
        <button
          type="button"
          className={styles.previewOverlayButton}
          onClick={() => setShowUrlInput(!showUrlInput)}
          aria-label="Open URL"
          title="Open URL"
        >
          <Globe size={16} />
        </button>
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
        {activeUrl && (
          <button
            type="button"
            className={styles.previewOverlayButton}
            onClick={handleClearUrl}
            aria-label="Close browser"
            title="Close browser"
            style={{ background: '#ef4444' }}
          >
            ✕
          </button>
        )}
      </div>
      {shouldRender && (
        <iframe
          ref={iframeRef}
          src={currentUrl || undefined}
          srcDoc={!currentUrl ? previewHtml || undefined : undefined}
          className={styles.previewIframe}
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      )}
      {!shouldRender && (
        <div className={styles.previewLoading}>Loading preview...</div>
      )}
    </div>
  );
};

export default Preview;
