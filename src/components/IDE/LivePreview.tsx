// ============== LIVE PREVIEW ==============
// Real-time code preview with hot reload and responsive testing

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './LivePreview.module.css';

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: string;
}

interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  content: string;
  timestamp: Date;
}

interface LivePreviewProps {
  code: string;
  language: string;
  html?: string;
  css?: string;
  onError?: (error: string) => void;
  onConsole?: (message: ConsoleMessage) => void;
  autoRefresh?: boolean;
  refreshDelay?: number;
  className?: string;
}

const devicePresets: DevicePreset[] = [
  { id: 'desktop', name: 'Desktop', width: 1920, height: 1080, icon: '🖥️' },
  { id: 'laptop', name: 'Laptop', width: 1366, height: 768, icon: '💻' },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: '📱' },
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: '📱' },
  { id: 'mobile-lg', name: 'Mobile LG', width: 414, height: 896, icon: '📱' },
];

const LivePreviewComponent: React.FC<LivePreviewProps> = ({
  code,
  language,
  html = '',
  css = '',
  onError,
  onConsole,
  autoRefresh = true,
  refreshDelay = 500,
  className,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(devicePresets[0]);
  const [scale, setScale] = useState(0.5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRotated, setIsRotated] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], content: string) => {
    const message: ConsoleMessage = {
      id: `msg-${Date.now()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setConsoleMessages(prev => [...prev.slice(-99), message]);
    onConsole?.(message);
  }, [onConsole]);

  const buildPreviewContent = useCallback(() => {
    let jsCode = code;
    
    // Transform JSX if needed
    if (language === 'tsx' || language === 'jsx') {
      jsCode = transformJSX(code);
    }
    
    const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${css}
  </style>
</head>
<body>
  <div id="root">${html}</div>
  <script>
    // Console proxy
    const originalConsole = { ...console };
    ['log', 'info', 'warn', 'error'].forEach(method => {
      console[method] = (...args) => {
        originalConsole[method](...args);
        window.parent.postMessage({
          type: 'console',
          method,
          args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))
        }, '*');
      };
    });
    
    // Error handler
    window.onerror = (msg, url, line, col, error) => {
      window.parent.postMessage({
        type: 'error',
        message: msg,
        line,
        col
      }, '*');
    };
    
    try {
      ${jsCode}
    } catch (e) {
      window.parent.postMessage({
        type: 'error',
        message: e.message
      }, '*');
    }
  </script>
</body>
</html>`;
    
    return previewHtml;
  }, [code, language, html, css]);

  const refreshPreview = useCallback(() => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const content = buildPreviewContent();
      
      if (iframeRef.current) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;
        
        // Cleanup old blob URL
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Preview error';
      setError(errorMsg);
      onError?.(errorMsg);
    }
    
    setTimeout(() => setIsRefreshing(false), 300);
  }, [buildPreviewContent, onError]);

  useEffect(() => {
    if (!autoRefresh) return;
    
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      refreshPreview();
    }, refreshDelay);
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [code, html, css, autoRefresh, refreshDelay, refreshPreview]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addConsoleMessage(event.data.method, event.data.args.join(' '));
      } else if (event.data.type === 'error') {
        setError(event.data.message);
        onError?.(event.data.message);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addConsoleMessage, onError]);

  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  const getDeviceSize = () => {
    if (isRotated) {
      return { width: selectedDevice.height, height: selectedDevice.width };
    }
    return { width: selectedDevice.width, height: selectedDevice.height };
  };

  const deviceSize = getDeviceSize();

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>👁️</span>
          <span>Live Preview</span>
          {isRefreshing && <span className={styles.spinner} />}
        </div>
        <div className={styles.controls}>
          <button className={styles.refreshBtn} onClick={refreshPreview} title="Refresh">
            🔄
          </button>
          <button 
            className={`${styles.controlBtn} ${showGrid ? styles.active : ''}`}
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Grid"
          >
            #
          </button>
          <button 
            className={styles.controlBtn}
            onClick={() => setIsRotated(!isRotated)}
            title="Rotate"
          >
            🔄
          </button>
          <button 
            className={`${styles.controlBtn} ${showConsole ? styles.active : ''}`}
            onClick={() => setShowConsole(!showConsole)}
            title="Toggle Console"
          >
            🖥️
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.devices}>
          {devicePresets.map(device => (
            <button
              key={device.id}
              className={`${styles.deviceBtn} ${selectedDevice.id === device.id ? styles.active : ''}`}
              onClick={() => setSelectedDevice(device)}
              title={`${device.name} (${device.width}x${device.height})`}
            >
              {device.icon}
            </button>
          ))}
        </div>
        <div className={styles.zoom}>
          <button onClick={() => setScale(s => Math.max(0.25, s - 0.1))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))}>+</button>
        </div>
        <div className={styles.dimensions}>
          {deviceSize.width} × {deviceSize.height}
        </div>
      </div>

      <div className={styles.previewArea}>
        {error && (
          <div className={styles.errorOverlay}>
            <span className={styles.errorIcon}>❌</span>
            <span className={styles.errorText}>{error}</span>
          </div>
        )}
        
        <div 
          className={`${styles.deviceFrame} ${showGrid ? styles.withGrid : ''}`}
          style={{
            width: deviceSize.width * scale,
            height: deviceSize.height * scale,
          }}
        >
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: deviceSize.width,
              height: deviceSize.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      {showConsole && (
        <div className={styles.console}>
          <div className={styles.consoleHeader}>
            <span>Console</span>
            <button className={styles.clearBtn} onClick={clearConsole}>Clear</button>
          </div>
          <div className={styles.consoleLog}>
            {consoleMessages.length === 0 ? (
              <div className={styles.consoleEmpty}>No console output</div>
            ) : (
              consoleMessages.map(msg => (
                <div key={msg.id} className={`${styles.consoleMsg} ${styles[msg.type]}`}>
                  <span className={styles.msgType}>{msg.type}</span>
                  <span className={styles.msgContent}>{msg.content}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple JSX transformer (for demo - production would use Babel)
function transformJSX(code: string): string {
  // Basic JSX to createElement transformation
  return code
    .replace(/<(\w+)([^>]*)\/>/g, 'React.createElement("$1", null)')
    .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/g, 'React.createElement("$1", null, "$3")');
}

export const LivePreview = memo(LivePreviewComponent);
export default LivePreview;
