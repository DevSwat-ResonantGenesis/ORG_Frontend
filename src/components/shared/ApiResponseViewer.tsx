import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ResponseStatus = 'success' | 'error' | 'pending';

interface ApiResponse {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  body?: unknown;
  duration?: number;
}

interface ApiResponseViewerProps {
  method: HttpMethod;
  url: string;
  response?: ApiResponse;
  requestBody?: unknown;
  loading?: boolean;
  error?: string;
  showHeaders?: boolean;
  showRequest?: boolean;
  className?: string;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  PATCH: '#8b5cf6',
  DELETE: '#ef4444',
};

const STATUS_RANGES: Record<string, { color: string; label: string }> = {
  '2': { color: '#10b981', label: 'Success' },
  '3': { color: '#3b82f6', label: 'Redirect' },
  '4': { color: '#f59e0b', label: 'Client Error' },
  '5': { color: '#ef4444', label: 'Server Error' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  requestInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  methodBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    flexShrink: 0,
  },
  url: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    fontFamily: "'JetBrains Mono', monospace",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexShrink: 0,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  duration: {
    fontSize: '0.75rem',
    color: '#888',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  tab: {
    padding: '0.625rem 1rem',
    fontSize: '0.8125rem',
    color: '#888',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#fff',
    borderBottomColor: '#6366f1',
  },
  body: {
    padding: '1rem 1.25rem',
  },
  section: {
    marginBottom: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  headersGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '0.25rem 1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
  },
  headerKey: {
    color: '#7ee787',
  },
  headerValue: {
    color: '#e4e4e7',
    wordBreak: 'break-all',
  },
  codeBlock: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#e4e4e7',
    overflow: 'auto',
    maxHeight: '300px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  copyButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem',
    color: '#888',
    fontSize: '0.875rem',
  },
  error: {
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.8125rem',
  },
};

const CollapsibleSection: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown size={14} color="#666" /> : <ChevronRight size={14} color="#666" />}
        <span style={styles.sectionTitle}>{title}</span>
      </div>
      {isOpen && children}
    </div>
  );
};

const CodeWithCopy: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={{
          ...styles.copyButton,
          color: copied ? '#10b981' : '#888',
        }}
        onClick={handleCopy}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre style={styles.codeBlock}>{code}</pre>
    </div>
  );
};

export const ApiResponseViewer: React.FC<ApiResponseViewerProps> = ({
  method,
  url,
  response,
  requestBody,
  loading = false,
  error,
  showHeaders = true,
  showRequest = true,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'response' | 'request' | 'headers'>('response');

  const getStatusColor = (status: number) => {
    const range = String(status)[0];
    return STATUS_RANGES[range]?.color || '#888';
  };

  const formatBody = (body: unknown) => {
    if (typeof body === 'string') return body;
    return JSON.stringify(body, null, 2);
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.requestInfo}>
          <span
            style={{
              ...styles.methodBadge,
              background: `${METHOD_COLORS[method]}20`,
              color: METHOD_COLORS[method],
            }}
          >
            {method}
          </span>
          <span style={styles.url} title={url}>
            {url}
          </span>
        </div>

        <div style={styles.statusInfo}>
          {loading && (
            <span style={styles.statusBadge}>
              <Clock size={14} />
              Loading...
            </span>
          )}
          {response && !loading && (
            <>
              <span
                style={{
                  ...styles.statusBadge,
                  background: `${getStatusColor(response.status)}15`,
                  color: getStatusColor(response.status),
                }}
              >
                {response.status >= 200 && response.status < 300 ? (
                  <CheckCircle size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                {response.status} {response.statusText}
              </span>
              {response.duration && (
                <span style={styles.duration}>{response.duration}ms</span>
              )}
            </>
          )}
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'response' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('response')}
        >
          Response
        </button>
        {showRequest && requestBody && (
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'request' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('request')}
          >
            Request
          </button>
        )}
        {showHeaders && response?.headers && (
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'headers' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </button>
        )}
      </div>

      <div style={styles.body}>
        {loading && (
          <div style={styles.loading}>
            <Clock size={18} />
            Waiting for response...
          </div>
        )}

        {error && !loading && <div style={styles.error}>{error}</div>}

        {!loading && !error && activeTab === 'response' && response?.body && (
          <CodeWithCopy code={formatBody(response.body)} />
        )}

        {!loading && !error && activeTab === 'request' && requestBody && (
          <CodeWithCopy code={formatBody(requestBody)} />
        )}

        {!loading && !error && activeTab === 'headers' && response?.headers && (
          <div style={styles.headersGrid}>
            {Object.entries(response.headers).map(([key, value]) => (
              <React.Fragment key={key}>
                <span style={styles.headerKey}>{key}:</span>
                <span style={styles.headerValue}>{value}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Compact API status indicator
interface ApiStatusProps {
  method: HttpMethod;
  status?: number;
  loading?: boolean;
  className?: string;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({
  method,
  status,
  loading = false,
  className,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}
    className={className}
  >
    <span
      style={{
        padding: '0.125rem 0.375rem',
        borderRadius: '3px',
        fontSize: '0.625rem',
        fontWeight: '700',
        background: `${METHOD_COLORS[method]}20`,
        color: METHOD_COLORS[method],
      }}
    >
      {method}
    </span>
    {loading ? (
      <Clock size={12} color="#888" />
    ) : status ? (
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: status >= 200 && status < 300 ? '#10b981' : '#ef4444',
        }}
      >
        {status}
      </span>
    ) : null}
  </div>
);

export default ApiResponseViewer;
