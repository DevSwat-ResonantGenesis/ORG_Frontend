import React, { useState } from 'react';
import { Play, Code, Copy, Download, RefreshCw, ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, AlertTriangle, Settings, History, Save, Trash2, Plus } from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ResponseStatus = 'success' | 'error' | 'pending' | 'idle';
type ContentType = 'application/json' | 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';

interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestParam {
  key: string;
  value: string;
  enabled: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  method: HttpMethod;
  endpoint: string;
  headers: RequestHeader[];
  params: RequestParam[];
  body?: string;
  createdAt: Date;
}

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
  size: number;
}

interface APIPlaygroundProps {
  baseUrl: string;
  savedRequests?: SavedRequest[];
  onSaveRequest?: (request: Omit<SavedRequest, 'id' | 'createdAt'>) => void;
  onDeleteRequest?: (requestId: string) => void;
  onExecuteRequest?: (request: {
    method: HttpMethod;
    endpoint: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    body?: string;
  }) => Promise<ResponseData>;
  className?: string;
}

const METHOD_CONFIG: Record<HttpMethod, {
  color: string;
  bgColor: string;
}> = {
  GET: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  POST: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  PUT: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  PATCH: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  DELETE: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  savedList: {
    flex: 1,
    overflow: 'auto',
    padding: '0.5rem',
  },
  savedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginBottom: '0.25rem',
  },
  savedItemHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  savedItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  methodBadge: {
    fontSize: '0.5625rem',
    fontWeight: '700',
    padding: '0.25rem 0.375rem',
    borderRadius: '4px',
    minWidth: '40px',
    textAlign: 'center',
  },
  savedName: {
    flex: 1,
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  requestPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  methodSelect: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
  },
  endpointInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
  },
  sendButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    width: 'fit-content',
  },
  tab: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minHeight: 0,
  },
  keyValueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  keyValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  keyValueInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#6366f1',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#ef4444',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    width: 'fit-content',
  },
  bodyEditor: {
    flex: 1,
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', monospace",
    resize: 'none',
    outline: 'none',
    minHeight: '150px',
  },
  responseSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  responseTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  responseTitleText: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  responseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  responseBody: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
  },
  codeBlock: {
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#e4e4e7',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
  },
  responseActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  emptyResponse: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#666',
    padding: '2rem',
  },
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
};

const getStatusColor = (status: number): { color: string; bgColor: string } => {
  if (status >= 200 && status < 300) return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' };
  if (status >= 300 && status < 400) return { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' };
  if (status >= 400 && status < 500) return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' };
  return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' };
};

export const APIPlayground: React.FC<APIPlaygroundProps> = ({
  baseUrl,
  savedRequests = [],
  onSaveRequest,
  onDeleteRequest,
  onExecuteRequest,
  className,
}) => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [endpoint, setEndpoint] = useState('/api/v1/');
  const [headers, setHeaders] = useState<RequestHeader[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Authorization', value: 'Bearer ', enabled: true },
  ]);
  const [params, setParams] = useState<RequestParam[]>([]);
  const [body, setBody] = useState('{\n  \n}');
  const [activeTab, setActiveTab] = useState<'headers' | 'params' | 'body'>('headers');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>('idle');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!onExecuteRequest) return;

    setResponseStatus('pending');
    setResponse(null);

    try {
      const enabledHeaders = headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});

      const enabledParams = params
        .filter(p => p.enabled && p.key)
        .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});

      const result = await onExecuteRequest({
        method,
        endpoint,
        headers: enabledHeaders,
        params: enabledParams,
        body: method !== 'GET' ? body : undefined,
      });

      setResponse(result);
      setResponseStatus(result.status >= 200 && result.status < 400 ? 'success' : 'error');
    } catch (error) {
      setResponseStatus('error');
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const handleAddParam = () => {
    setParams([...params, { key: '', value: '', enabled: true }]);
  };

  const handleRemoveParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const handleUpdateParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...params];
    newParams[index] = { ...newParams[index], [field]: value };
    setParams(newParams);
  };

  const handleLoadRequest = (request: SavedRequest) => {
    setSelectedRequestId(request.id);
    setMethod(request.method);
    setEndpoint(request.endpoint);
    setHeaders(request.headers);
    setParams(request.params);
    if (request.body) setBody(request.body);
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.body);
    }
  };

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Code size={22} />
          API Playground
        </h2>
        <div style={styles.headerActions}>
          {onSaveRequest && (
            <button
              style={styles.actionButton}
              onClick={() => onSaveRequest({ name: endpoint, method, endpoint, headers, params, body })}
            >
              <Save size={14} />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar - Saved Requests */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Saved Requests</span>
          </div>
          <div style={styles.savedList}>
            {savedRequests.map((request) => {
              const methodConfig = METHOD_CONFIG[request.method];
              return (
                <div
                  key={request.id}
                  style={{
                    ...styles.savedItem,
                    ...(selectedRequestId === request.id ? styles.savedItemActive : {}),
                  }}
                  onClick={() => handleLoadRequest(request)}
                >
                  <span
                    style={{
                      ...styles.methodBadge,
                      background: methodConfig.bgColor,
                      color: methodConfig.color,
                    }}
                  >
                    {request.method}
                  </span>
                  <span style={styles.savedName}>{request.name}</span>
                </div>
              );
            })}
            {savedRequests.length === 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666', fontSize: '0.75rem' }}>
                No saved requests
              </div>
            )}
          </div>
        </div>

        {/* Request Panel */}
        <div style={styles.requestPanel}>
          {/* Request Bar */}
          <div style={styles.requestBar}>
            <select
              style={{
                ...styles.methodSelect,
                color: METHOD_CONFIG[method].color,
              }}
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
            >
              {Object.keys(METHOD_CONFIG).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              style={styles.endpointInput}
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/v1/endpoint"
            />
            <button style={styles.sendButton} onClick={handleSend} disabled={responseStatus === 'pending'}>
              {responseStatus === 'pending' ? (
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Play size={14} />
              )}
              Send
            </button>
          </div>

          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'headers' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('headers')}
            >
              Headers ({headers.filter(h => h.enabled).length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'params' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('params')}
            >
              Params ({params.filter(p => p.enabled).length})
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'body' ? styles.tabActive : {}) }}
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
          </div>

          {/* Tab Content */}
          <div style={styles.tabContent}>
            {activeTab === 'headers' && (
              <>
                <div style={styles.keyValueList}>
                  {headers.map((header, index) => (
                    <div key={index} style={styles.keyValueRow}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={header.enabled}
                        onChange={(e) => handleUpdateHeader(index, 'enabled', e.target.checked)}
                      />
                      <input
                        type="text"
                        style={styles.keyValueInput}
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => handleUpdateHeader(index, 'key', e.target.value)}
                      />
                      <input
                        type="text"
                        style={styles.keyValueInput}
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => handleUpdateHeader(index, 'value', e.target.value)}
                      />
                      <button style={styles.removeButton} onClick={() => handleRemoveHeader(index)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button style={styles.addButton} onClick={handleAddHeader}>
                  <Plus size={12} />
                  Add Header
                </button>
              </>
            )}

            {activeTab === 'params' && (
              <>
                <div style={styles.keyValueList}>
                  {params.map((param, index) => (
                    <div key={index} style={styles.keyValueRow}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={param.enabled}
                        onChange={(e) => handleUpdateParam(index, 'enabled', e.target.checked)}
                      />
                      <input
                        type="text"
                        style={styles.keyValueInput}
                        placeholder="Key"
                        value={param.key}
                        onChange={(e) => handleUpdateParam(index, 'key', e.target.value)}
                      />
                      <input
                        type="text"
                        style={styles.keyValueInput}
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => handleUpdateParam(index, 'value', e.target.value)}
                      />
                      <button style={styles.removeButton} onClick={() => handleRemoveParam(index)}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <button style={styles.addButton} onClick={handleAddParam}>
                  <Plus size={12} />
                  Add Parameter
                </button>
              </>
            )}

            {activeTab === 'body' && (
              <textarea
                style={styles.bodyEditor}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Request body (JSON)"
              />
            )}
          </div>

          {/* Response Section */}
          <div style={styles.responseSection}>
            <div style={styles.responseHeader}>
              <div style={styles.responseTitle}>
                <span style={styles.responseTitleText}>Response</span>
                {response && (
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusColor(response.status),
                    }}
                  >
                    {response.status} {response.statusText}
                  </span>
                )}
              </div>
              {response && (
                <div style={styles.responseMeta}>
                  <span style={styles.metaItem}>
                    <Clock size={12} />
                    {response.duration}ms
                  </span>
                  <span style={styles.metaItem}>
                    {formatSize(response.size)}
                  </span>
                  <div style={styles.responseActions}>
                    <button style={styles.iconButton} onClick={handleCopyResponse} title="Copy">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={styles.responseBody}>
              {responseStatus === 'idle' && (
                <div style={styles.emptyResponse}>
                  <Play size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <span>Send a request to see the response</span>
                </div>
              )}
              {responseStatus === 'pending' && (
                <div style={styles.emptyResponse}>
                  <RefreshCw size={32} style={{ marginBottom: '0.75rem', opacity: 0.5, animation: 'spin 1s linear infinite' }} />
                  <span>Sending request...</span>
                </div>
              )}
              {response && (
                <pre style={styles.codeBlock}>
                  {response.body}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIPlayground;
