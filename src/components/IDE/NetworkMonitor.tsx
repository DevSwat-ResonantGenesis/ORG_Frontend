// ============== NETWORK MONITOR ==============
// API request/response viewer with real-time monitoring

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './NetworkMonitor.module.css';

interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
  url: string;
  status: number;
  statusText: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  startTime: Date;
  duration: number;
  size: number;
  type: 'xhr' | 'fetch' | 'websocket';
  initiator?: string;
}

interface NetworkMonitorProps {
  requests?: NetworkRequest[];
  onClear?: () => void;
  onReplay?: (request: NetworkRequest) => void;
  className?: string;
}

const mockRequests: NetworkRequest[] = [
  { id: '1', method: 'GET', url: '/api/users', status: 200, statusText: 'OK', requestHeaders: { 'Authorization': 'Bearer ***' }, responseHeaders: { 'Content-Type': 'application/json' }, responseBody: '{"users": [...]}', startTime: new Date(Date.now() - 5000), duration: 120, size: 2450, type: 'fetch', initiator: 'UserList.tsx' },
  { id: '2', method: 'POST', url: '/api/projects', status: 201, statusText: 'Created', requestHeaders: { 'Content-Type': 'application/json' }, responseHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"name": "New Project"}', responseBody: '{"id": "123"}', startTime: new Date(Date.now() - 4000), duration: 250, size: 180, type: 'fetch' },
  { id: '3', method: 'GET', url: '/api/tasks?limit=10', status: 200, statusText: 'OK', requestHeaders: {}, responseHeaders: { 'Content-Type': 'application/json' }, startTime: new Date(Date.now() - 3000), duration: 85, size: 5200, type: 'fetch' },
  { id: '4', method: 'PUT', url: '/api/settings', status: 200, statusText: 'OK', requestHeaders: { 'Content-Type': 'application/json' }, responseHeaders: {}, requestBody: '{"theme": "dark"}', startTime: new Date(Date.now() - 2000), duration: 95, size: 120, type: 'xhr' },
  { id: '5', method: 'DELETE', url: '/api/cache', status: 204, statusText: 'No Content', requestHeaders: {}, responseHeaders: {}, startTime: new Date(Date.now() - 1000), duration: 45, size: 0, type: 'fetch' },
  { id: '6', method: 'GET', url: '/api/health', status: 500, statusText: 'Internal Server Error', requestHeaders: {}, responseHeaders: {}, responseBody: '{"error": "Database connection failed"}', startTime: new Date(), duration: 1500, size: 85, type: 'fetch' },
];

const NetworkMonitorComponent: React.FC<NetworkMonitorProps> = ({
  requests: initialRequests = mockRequests,
  onClear,
  onReplay,
  className,
}) => {
  const [requests, setRequests] = useState<NetworkRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [isRecording, setIsRecording] = useState(true);
  const [activeTab, setActiveTab] = useState<'headers' | 'request' | 'response' | 'timing'>('headers');
  const requestListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      const newRequest = generateRandomRequest();
      setRequests(prev => [...prev.slice(-99), newRequest]);
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const clearRequests = useCallback(() => {
    setRequests([]);
    setSelectedRequest(null);
    onClear?.();
  }, [onClear]);

  const replayRequest = useCallback((request: NetworkRequest) => {
    onReplay?.(request);
  }, [onReplay]);

  const getMethodColor = (method: string) => styles[method.toLowerCase()] || '';

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return styles.success;
    if (status >= 400) return styles.error;
    if (status >= 300) return styles.redirect;
    return styles.pending;
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const filteredRequests = requests.filter(req => {
    if (filter && !req.url.toLowerCase().includes(filter.toLowerCase())) return false;
    if (methodFilter !== 'all' && req.method !== methodFilter) return false;
    if (statusFilter === 'success' && (req.status < 200 || req.status >= 400)) return false;
    if (statusFilter === 'error' && req.status < 400) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    success: requests.filter(r => r.status >= 200 && r.status < 400).length,
    errors: requests.filter(r => r.status >= 400).length,
    totalSize: requests.reduce((sum, r) => sum + r.size, 0),
    avgDuration: requests.length > 0 
      ? Math.round(requests.reduce((sum, r) => sum + r.duration, 0) / requests.length)
      : 0,
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🌐</span>
          <span>Network Monitor</span>
          {isRecording && <span className={styles.recordingDot}>●</span>}
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.recordBtn} ${isRecording ? styles.active : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? '⏸️' : '⏺️'}
          </button>
          <button className={styles.clearBtn} onClick={clearRequests}>
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Requests</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.success}`}>{stats.success}</span>
          <span className={styles.statLabel}>Success</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${styles.error}`}>{stats.errors}</span>
          <span className={styles.statLabel}>Errors</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatSize(stats.totalSize)}</span>
          <span className={styles.statLabel}>Size</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.avgDuration}ms</span>
          <span className={styles.statLabel}>Avg Time</span>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Filter by URL..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className={styles.filterInput}
        />
        <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
          <option value="all">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">All Status</option>
          <option value="success">Success (2xx)</option>
          <option value="error">Errors (4xx/5xx)</option>
        </select>
      </div>

      <div className={styles.content}>
        <div className={styles.requestList} ref={requestListRef}>
          {filteredRequests.length === 0 ? (
            <div className={styles.empty}>No requests captured</div>
          ) : (
            filteredRequests.map(req => (
              <div
                key={req.id}
                className={`${styles.requestItem} ${selectedRequest?.id === req.id ? styles.selected : ''} ${getStatusColor(req.status)}`}
                onClick={() => setSelectedRequest(req)}
              >
                <span className={`${styles.method} ${getMethodColor(req.method)}`}>
                  {req.method}
                </span>
                <span className={styles.url}>{req.url}</span>
                <span className={`${styles.status} ${getStatusColor(req.status)}`}>
                  {req.status}
                </span>
                <span className={styles.duration}>{formatDuration(req.duration)}</span>
                <span className={styles.size}>{formatSize(req.size)}</span>
              </div>
            ))
          )}
        </div>

        {selectedRequest && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitle}>
                <span className={`${styles.method} ${getMethodColor(selectedRequest.method)}`}>
                  {selectedRequest.method}
                </span>
                <span className={styles.detailUrl}>{selectedRequest.url}</span>
              </div>
              <button className={styles.replayBtn} onClick={() => replayRequest(selectedRequest)}>
                🔄 Replay
              </button>
            </div>

            <div className={styles.detailTabs}>
              {(['headers', 'request', 'response', 'timing'] as const).map(tab => (
                <button
                  key={tab}
                  className={`${styles.detailTab} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.detailContent}>
              {activeTab === 'headers' && (
                <div className={styles.headersPanel}>
                  <div className={styles.headerSection}>
                    <h4>Request Headers</h4>
                    {Object.entries(selectedRequest.requestHeaders).map(([key, value]) => (
                      <div key={key} className={styles.headerRow}>
                        <span className={styles.headerKey}>{key}:</span>
                        <span className={styles.headerValue}>{value}</span>
                      </div>
                    ))}
                    {Object.keys(selectedRequest.requestHeaders).length === 0 && (
                      <span className={styles.noData}>No headers</span>
                    )}
                  </div>
                  <div className={styles.headerSection}>
                    <h4>Response Headers</h4>
                    {Object.entries(selectedRequest.responseHeaders).map(([key, value]) => (
                      <div key={key} className={styles.headerRow}>
                        <span className={styles.headerKey}>{key}:</span>
                        <span className={styles.headerValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'request' && (
                <div className={styles.bodyPanel}>
                  {selectedRequest.requestBody ? (
                    <pre>{selectedRequest.requestBody}</pre>
                  ) : (
                    <span className={styles.noData}>No request body</span>
                  )}
                </div>
              )}

              {activeTab === 'response' && (
                <div className={styles.bodyPanel}>
                  {selectedRequest.responseBody ? (
                    <pre>{selectedRequest.responseBody}</pre>
                  ) : (
                    <span className={styles.noData}>No response body</span>
                  )}
                </div>
              )}

              {activeTab === 'timing' && (
                <div className={styles.timingPanel}>
                  <div className={styles.timingRow}>
                    <span>Started:</span>
                    <span>{selectedRequest.startTime.toLocaleTimeString()}</span>
                  </div>
                  <div className={styles.timingRow}>
                    <span>Duration:</span>
                    <span>{formatDuration(selectedRequest.duration)}</span>
                  </div>
                  <div className={styles.timingRow}>
                    <span>Size:</span>
                    <span>{formatSize(selectedRequest.size)}</span>
                  </div>
                  <div className={styles.timingBar}>
                    <div style={{ width: `${Math.min(100, selectedRequest.duration / 10)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function generateRandomRequest(): NetworkRequest {
  const methods: NetworkRequest['method'][] = ['GET', 'POST', 'PUT', 'DELETE'];
  const urls = ['/api/users', '/api/projects', '/api/tasks', '/api/settings', '/api/health'];
  const statuses = [200, 200, 200, 201, 204, 400, 404, 500];
  
  const method = methods[Math.floor(Math.random() * methods.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `req-${Date.now()}`,
    method,
    url: urls[Math.floor(Math.random() * urls.length)],
    status,
    statusText: status >= 400 ? 'Error' : 'OK',
    requestHeaders: { 'Content-Type': 'application/json' },
    responseHeaders: { 'Content-Type': 'application/json' },
    startTime: new Date(),
    duration: 50 + Math.floor(Math.random() * 500),
    size: Math.floor(Math.random() * 10000),
    type: 'fetch',
  };
}

export const NetworkMonitor = memo(NetworkMonitorComponent);
export default NetworkMonitor;
