import React, { useState } from 'react';
import { Book, Search, ChevronRight, ChevronDown, Copy, Check, Code, Lock, Globe, Zap, Tag, ExternalLink } from 'lucide-react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type AuthType = 'none' | 'api_key' | 'bearer' | 'oauth2';

interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string;
  enum?: string[];
}

interface ApiResponse {
  status: number;
  description: string;
  example?: string;
}

interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  tags: string[];
  auth: AuthType;
  parameters: ApiParameter[];
  requestBody?: {
    type: string;
    example: string;
  };
  responses: ApiResponse[];
  deprecated?: boolean;
}

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
  endpoints: ApiEndpoint[];
}

interface ApiDocumentationProps {
  categories: ApiCategory[];
  baseUrl: string;
  version: string;
  onTryEndpoint?: (endpointId: string) => void;
  className?: string;
}

interface EndpointCardProps {
  endpoint: ApiEndpoint;
  baseUrl: string;
  onTry?: () => void;
}

const METHOD_CONFIG: Record<HttpMethod, { color: string; bgColor: string }> = {
  GET: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  POST: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  PUT: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  PATCH: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  DELETE: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

const AUTH_CONFIG: Record<AuthType, { label: string; icon: React.ReactNode }> = {
  none: { label: 'None', icon: <Globe size={12} /> },
  api_key: { label: 'API Key', icon: <Lock size={12} /> },
  bearer: { label: 'Bearer', icon: <Lock size={12} /> },
  oauth2: { label: 'OAuth 2.0', icon: <Lock size={12} /> },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    minHeight: '100vh',
  },
  sidebar: {
    width: '280px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    flexShrink: 0,
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 2rem)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    marginBottom: '1rem',
  },
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '100%',
  },
  categoryItem: {
    marginBottom: '0.5rem',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#e4e4e7',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  categoryHeaderActive: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  endpointList: {
    paddingLeft: '1rem',
    marginTop: '0.25rem',
  },
  endpointItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  endpointItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  methodBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  versionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  baseUrl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  baseUrlLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  baseUrlValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.875rem',
    color: '#10b981',
  },
  endpointCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  endpointHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  endpointTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  endpointMethod: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
  },
  endpointPath: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.9375rem',
    color: '#fff',
  },
  endpointActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  authBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  tryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  endpointBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.875rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  parametersTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  paramTh: {
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  paramTd: {
    padding: '0.625rem 0.75rem',
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  paramName: {
    fontFamily: "'JetBrains Mono', monospace",
    color: '#fff',
  },
  paramType: {
    fontSize: '0.75rem',
    color: '#888',
  },
  requiredBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    marginLeft: '0.375rem',
  },
  codeBlock: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    color: '#e4e4e7',
    overflow: 'auto',
    position: 'relative',
  },
  copyButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  responseItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  statusCode: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '1rem',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  deprecatedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.8125rem',
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  if (status >= 400 && status < 500) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  if (status >= 500) return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  return { color: '#888', bg: 'rgba(255, 255, 255, 0.05)' };
};

const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  baseUrl,
  onTry,
}) => {
  const [copied, setCopied] = useState(false);

  const methodConfig = METHOD_CONFIG[endpoint.method];
  const authConfig = AUTH_CONFIG[endpoint.auth];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={styles.endpointCard}>
      <div style={styles.endpointHeader}>
        <div style={styles.endpointTitle}>
          <span
            style={{
              ...styles.endpointMethod,
              background: methodConfig.bgColor,
              color: methodConfig.color,
            }}
          >
            {endpoint.method}
          </span>
          <span style={styles.endpointPath}>{endpoint.path}</span>
        </div>
        <div style={styles.endpointActions}>
          <span style={styles.authBadge}>
            {authConfig.icon}
            {authConfig.label}
          </span>
          {onTry && (
            <button style={styles.tryButton} onClick={onTry}>
              <Zap size={12} />
              Try it
            </button>
          )}
        </div>
      </div>

      <div style={styles.endpointBody}>
        {endpoint.deprecated && (
          <div style={styles.deprecatedBanner}>
            <Code size={14} />
            This endpoint is deprecated and may be removed in future versions.
          </div>
        )}

        {endpoint.tags.length > 0 && (
          <div style={styles.tags}>
            {endpoint.tags.map((tag) => (
              <span key={tag} style={styles.tag}>
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

        <p style={styles.description}>
          {endpoint.description || endpoint.summary}
        </p>

        {endpoint.parameters.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Parameters</h4>
            <table style={styles.parametersTable}>
              <thead>
                <tr>
                  <th style={styles.paramTh}>Name</th>
                  <th style={styles.paramTh}>Type</th>
                  <th style={styles.paramTh}>Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.parameters.map((param) => (
                  <tr key={param.name}>
                    <td style={styles.paramTd}>
                      <span style={styles.paramName}>{param.name}</span>
                      {param.required && (
                        <span style={styles.requiredBadge}>Required</span>
                      )}
                    </td>
                    <td style={styles.paramTd}>
                      <span style={styles.paramType}>{param.type}</span>
                    </td>
                    <td style={styles.paramTd}>{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {endpoint.requestBody && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Request Body</h4>
            <div style={styles.codeBlock}>
              <button
                style={styles.copyButton}
                onClick={() => handleCopy(endpoint.requestBody!.example)}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <pre style={{ margin: 0 }}>{endpoint.requestBody.example}</pre>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Responses</h4>
          {endpoint.responses.map((response) => {
            const statusColor = getStatusColor(response.status);
            return (
              <div key={response.status} style={styles.responseItem}>
                <span
                  style={{
                    ...styles.statusCode,
                    background: statusColor.bg,
                    color: statusColor.color,
                  }}
                >
                  {response.status}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', color: '#e4e4e7', marginBottom: '0.5rem' }}>
                    {response.description}
                  </div>
                  {response.example && (
                    <div style={{ ...styles.codeBlock, padding: '0.75rem' }}>
                      <pre style={{ margin: 0, fontSize: '0.6875rem' }}>{response.example}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ApiDocumentation: React.FC<ApiDocumentationProps> = ({
  categories,
  baseUrl,
  version,
  onTryEndpoint,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    endpoints: category.endpoints.filter(e =>
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(c => c.endpoints.length > 0);

  const allEndpoints = filteredCategories.flatMap(c => c.endpoints);
  const displayedEndpoints = selectedEndpoint
    ? allEndpoints.filter(e => e.id === selectedEndpoint)
    : allEndpoints;

  return (
    <div style={styles.container} className={className}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Book size={18} style={{ color: '#818cf8' }} />
          <span style={styles.sidebarTitle}>API Reference</span>
        </div>

        <div style={styles.searchInput}>
          <Search size={14} style={{ color: '#888' }} />
          <input
            type="text"
            placeholder="Search endpoints..."
            style={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredCategories.map((category) => (
          <div key={category.id} style={styles.categoryItem}>
            <button
              style={{
                ...styles.categoryHeader,
                ...(expandedCategories.has(category.id) ? styles.categoryHeaderActive : {}),
              }}
              onClick={() => toggleCategory(category.id)}
            >
              {expandedCategories.has(category.id) ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              {category.name}
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#666' }}>
                {category.endpoints.length}
              </span>
            </button>
            {expandedCategories.has(category.id) && (
              <div style={styles.endpointList}>
                {category.endpoints.map((endpoint) => {
                  const methodConfig = METHOD_CONFIG[endpoint.method];
                  return (
                    <button
                      key={endpoint.id}
                      style={{
                        ...styles.endpointItem,
                        ...(selectedEndpoint === endpoint.id ? styles.endpointItemActive : {}),
                      }}
                      onClick={() => setSelectedEndpoint(
                        selectedEndpoint === endpoint.id ? null : endpoint.id
                      )}
                    >
                      <span
                        style={{
                          ...styles.methodBadge,
                          background: methodConfig.bgColor,
                          color: methodConfig.color,
                        }}
                      >
                        {endpoint.method}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {endpoint.path}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Book size={22} />
            API Documentation
          </h1>
          <span style={styles.versionBadge}>v{version}</span>
        </div>

        <div style={styles.baseUrl}>
          <span style={styles.baseUrlLabel}>Base URL:</span>
          <span style={styles.baseUrlValue}>{baseUrl}</span>
        </div>

        {displayedEndpoints.length === 0 ? (
          <div style={styles.empty}>
            <Book size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No endpoints found</span>
          </div>
        ) : (
          displayedEndpoints.map((endpoint) => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              baseUrl={baseUrl}
              onTry={onTryEndpoint ? () => onTryEndpoint(endpoint.id) : undefined}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default ApiDocumentation;
