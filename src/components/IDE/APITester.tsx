// ============== API TESTER ==============
// REST API testing tool with request builder and response viewer

import React, { memo, useState, useCallback } from 'react';
import styles from './APITester.module.css';

interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: RequestHeader[];
  body: string;
}

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

interface APITesterProps {
  savedRequests?: SavedRequest[];
  onSaveRequest?: (request: SavedRequest) => void;
  baseUrl?: string;
  className?: string;
}

const defaultHeaders: RequestHeader[] = [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true },
];

const APITesterComponent: React.FC<APITesterProps> = ({
  savedRequests = [],
  onSaveRequest,
  baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000',
  className,
}) => {
  const [method, setMethod] = useState<string>('GET');
  const [url, setUrl] = useState<string>('');
  const [headers, setHeaders] = useState<RequestHeader[]>(defaultHeaders);
  const [body, setBody] = useState<string>('{\n  \n}');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth'>('headers');
  const [responseTab, setResponseTab] = useState<'body' | 'headers' | 'cookies'>('body');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ method: string; url: string; status: number; time: number }[]>([]);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET': return styles.get;
      case 'POST': return styles.post;
      case 'PUT': return styles.put;
      case 'PATCH': return styles.patch;
      case 'DELETE': return styles.delete;
      default: return '';
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: keyof RequestHeader, value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const sendRequest = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = Date.now();
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    try {
      const requestHeaders: Record<string, string> = {};
      headers.filter(h => h.enabled && h.key).forEach(h => {
        requestHeaders[h.key] = h.value;
      });

      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const res = await fetch(fullUrl, options);
      const responseTime = Date.now() - startTime;

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody = '';
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const json = await res.json();
        responseBody = JSON.stringify(json, null, 2);
      } else {
        responseBody = await res.text();
      }

      const apiResponse: APIResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        time: responseTime,
        size: new Blob([responseBody]).size,
      };

      setResponse(apiResponse);
      setHistory(prev => [
        { method, url: fullUrl, status: res.status, time: responseTime },
        ...prev.slice(0, 9)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  }, [method, url, headers, body, baseUrl]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return styles.success;
    if (status >= 400) return styles.error;
    return styles.warning;
  };

  const copyResponse = () => {
    if (response?.body) {
      navigator.clipboard.writeText(response.body);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🔌</span>
          <span>API Tester</span>
        </div>
      </div>

      <div className={styles.requestBar}>
        <select
          className={`${styles.methodSelect} ${getMethodColor(method)}`}
          value={method}
          onChange={e => setMethod(e.target.value)}
        >
          {methods.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          className={styles.urlInput}
          placeholder="Enter request URL or path..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendRequest()}
        />
        <button
          className={styles.sendBtn}
          onClick={sendRequest}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>

      <div className={styles.tabs}>
        {(['headers', 'body', 'auth'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'headers' && `Headers (${headers.filter(h => h.enabled).length})`}
            {tab === 'body' && 'Body'}
            {tab === 'auth' && 'Auth'}
          </button>
        ))}
      </div>

      <div className={styles.requestPanel}>
        {activeTab === 'headers' && (
          <div className={styles.headersPanel}>
            {headers.map((header, i) => (
              <div key={i} className={styles.headerRow}>
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={e => updateHeader(i, 'enabled', e.target.checked)}
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={header.key}
                  onChange={e => updateHeader(i, 'key', e.target.value)}
                  className={styles.headerKey}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={e => updateHeader(i, 'value', e.target.value)}
                  className={styles.headerValue}
                />
                <button className={styles.removeBtn} onClick={() => removeHeader(i)}>×</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={addHeader}>+ Add Header</button>
          </div>
        )}

        {activeTab === 'body' && (
          <div className={styles.bodyPanel}>
            <textarea
              className={styles.bodyEditor}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Request body (JSON)"
              spellCheck={false}
            />
          </div>
        )}

        {activeTab === 'auth' && (
          <div className={styles.authPanel}>
            <div className={styles.authType}>
              <label>Type:</label>
              <select>
                <option>No Auth</option>
                <option>Bearer Token</option>
                <option>Basic Auth</option>
                <option>API Key</option>
              </select>
            </div>
            <input type="text" placeholder="Token or credentials..." className={styles.authInput} />
          </div>
        )}
      </div>

      <div className={styles.responseSection}>
        <div className={styles.responseHeader}>
          <span className={styles.responseTitle}>Response</span>
          {response && (
            <div className={styles.responseMeta}>
              <span className={`${styles.status} ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
              <span className={styles.time}>{response.time}ms</span>
              <span className={styles.size}>{formatSize(response.size)}</span>
              <button className={styles.copyBtn} onClick={copyResponse}>📋 Copy</button>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorPanel}>
            <span className={styles.errorIcon}>❌</span>
            <span>{error}</span>
          </div>
        )}

        {response && (
          <>
            <div className={styles.responseTabs}>
              {(['body', 'headers'] as const).map(tab => (
                <button
                  key={tab}
                  className={`${styles.responseTab} ${responseTab === tab ? styles.active : ''}`}
                  onClick={() => setResponseTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className={styles.responseBody}>
              {responseTab === 'body' && (
                <pre>{response.body}</pre>
              )}
              {responseTab === 'headers' && (
                <div className={styles.responseHeaders}>
                  {Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} className={styles.responseHeaderRow}>
                      <span className={styles.headerName}>{key}:</span>
                      <span className={styles.headerVal}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!response && !error && !isLoading && (
          <div className={styles.emptyResponse}>
            <span className={styles.emptyIcon}>📤</span>
            <p>Send a request to see the response</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className={styles.history}>
          <div className={styles.historyTitle}>Recent Requests</div>
          <div className={styles.historyList}>
            {history.map((item, i) => (
              <div key={i} className={styles.historyItem} onClick={() => setUrl(item.url)}>
                <span className={`${styles.historyMethod} ${getMethodColor(item.method)}`}>
                  {item.method}
                </span>
                <span className={styles.historyUrl}>{item.url}</span>
                <span className={`${styles.historyStatus} ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const APITester = memo(APITesterComponent);
export default APITester;
