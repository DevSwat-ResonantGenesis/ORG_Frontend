// ============== PERFORMANCE OVERLAY (DEV ONLY) ==============
// Shows real-time performance metrics during development

import React, { useState, useEffect, useCallback, memo } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  domNodes: number;
  jsHeapSize: number;
  renderTime: number;
}

const SHOW_IN_DEV = process.env.NODE_ENV === 'development';

const PerformanceOverlayComponent: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    domNodes: 0,
    jsHeapSize: 0,
    renderTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // FPS counter
  useEffect(() => {
    if (!SHOW_IN_DEV || !isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // Get memory info if available
        const memory = (performance as any).memory;
        const jsHeapSize = memory ? Math.round(memory.usedJSHeapSize / 1048576) : 0;
        const totalHeap = memory ? Math.round(memory.totalJSHeapSize / 1048576) : 0;
        
        // Count DOM nodes
        const domNodes = document.querySelectorAll('*').length;

        setMetrics(prev => ({
          ...prev,
          fps,
          jsHeapSize,
          memory: totalHeap,
          domNodes,
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isVisible]);

  // Keyboard shortcut to toggle (Ctrl+Shift+P)
  useEffect(() => {
    if (!SHOW_IN_DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!SHOW_IN_DEV || !isVisible) return null;

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#22c55e';
    if (fps >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const getMemoryColor = (mb: number) => {
    if (mb < 100) return '#22c55e';
    if (mb < 300) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: isMinimized ? '8px 12px' : 16,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#fff',
        zIndex: 99999,
        minWidth: isMinimized ? 'auto' : 200,
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setIsMinimized(m => !m)}
    >
      {isMinimized ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: getFPSColor(metrics.fps) }}>{metrics.fps} FPS</span>
          <span style={{ color: getMemoryColor(metrics.jsHeapSize) }}>{metrics.jsHeapSize}MB</span>
          <span style={{ color: '#888' }}>{metrics.domNodes} nodes</span>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#888' }}>
            Performance Monitor
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>
              <span style={{ color: '#888' }}>FPS: </span>
              <span style={{ color: getFPSColor(metrics.fps) }}>{metrics.fps}</span>
            </div>
            <div>
              <span style={{ color: '#888' }}>JS Heap: </span>
              <span style={{ color: getMemoryColor(metrics.jsHeapSize) }}>
                {metrics.jsHeapSize}MB / {metrics.memory}MB
              </span>
            </div>
            <div>
              <span style={{ color: '#888' }}>DOM Nodes: </span>
              <span>{metrics.domNodes}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#666' }}>
              Press Ctrl+Shift+P to toggle
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const PerformanceOverlay = memo(PerformanceOverlayComponent);

// ============== RENDER PROFILER ==============

interface ProfilerData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

const profilerData: ProfilerData[] = [];
const MAX_PROFILER_ENTRIES = 100;

export const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  if (process.env.NODE_ENV !== 'development') return;

  profilerData.push({
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });

  // Keep only last N entries
  if (profilerData.length > MAX_PROFILER_ENTRIES) {
    profilerData.shift();
  }

  // Log slow renders
  if (actualDuration > 16) {
    console.warn(
      `⚠️ Slow render: ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`
    );
  }
};

export const getProfilerReport = () => {
  const byComponent = new Map<string, { count: number; totalTime: number; maxTime: number }>();

  for (const entry of profilerData) {
    const existing = byComponent.get(entry.id) || { count: 0, totalTime: 0, maxTime: 0 };
    byComponent.set(entry.id, {
      count: existing.count + 1,
      totalTime: existing.totalTime + entry.actualDuration,
      maxTime: Math.max(existing.maxTime, entry.actualDuration),
    });
  }

  return Array.from(byComponent.entries())
    .map(([id, data]) => ({
      id,
      ...data,
      avgTime: data.totalTime / data.count,
    }))
    .sort((a, b) => b.totalTime - a.totalTime);
};

// ============== NETWORK MONITOR ==============

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  size?: number;
  timestamp: number;
}

const networkRequests: NetworkRequest[] = [];
const MAX_NETWORK_ENTRIES = 50;

export const initNetworkMonitor = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    const method = typeof args[1]?.method === 'string' ? args[1].method : 'GET';
    const startTime = performance.now();

    const request: NetworkRequest = {
      url,
      method,
      timestamp: Date.now(),
    };

    try {
      const response = await originalFetch(...args);
      request.status = response.status;
      request.duration = performance.now() - startTime;
      
      // Try to get response size
      const clone = response.clone();
      try {
        const blob = await clone.blob();
        request.size = blob.size;
      } catch {}

      networkRequests.push(request);
      if (networkRequests.length > MAX_NETWORK_ENTRIES) {
        networkRequests.shift();
      }

      // Log slow requests
      if (request.duration > 1000) {
        console.warn(
          `⚠️ Slow request: ${method} ${url} took ${request.duration.toFixed(0)}ms`
        );
      }

      return response;
    } catch (error) {
      request.duration = performance.now() - startTime;
      networkRequests.push(request);
      throw error;
    }
  };
};

export const getNetworkReport = () => {
  return networkRequests
    .slice()
    .sort((a, b) => (b.duration || 0) - (a.duration || 0));
};

// ============== BUNDLE SIZE REPORTER ==============

export const reportBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('📦 Bundle Report');
  
  console.log('Scripts:');
  scripts.forEach(script => {
    console.log(`  ${(script as HTMLScriptElement).src.split('/').pop()}`);
  });

  console.log('Styles:');
  styles.forEach(style => {
    console.log(`  ${(style as HTMLLinkElement).href.split('/').pop()}`);
  });

  console.groupEnd();
};

export default PerformanceOverlay;
