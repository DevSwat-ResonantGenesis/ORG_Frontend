import React, { useState } from 'react';
import { Button } from '@/components/ui';
import './apiEndpointsPanel.css';

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authRequired: boolean;
  roleRequired?: string[];
  exampleRequest?: any;
  exampleResponse?: any;
}

interface APIEndpointsPanelProps {
  title?: string;
  endpoints: APIEndpoint[];
  apiBaseUrl?: string;
}

export const APIEndpointsPanel: React.FC<APIEndpointsPanelProps> = ({
  title = 'API Endpoints',
  endpoints,
  apiBaseUrl = '/api'
}) => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpointPath: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpointPath);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#10B981';
      case 'POST': return '#3B82F6';
      case 'PUT': return '#F59E0B';
      case 'DELETE': return '#EF4444';
      case 'PATCH': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getCurlCommand = (endpoint: APIEndpoint) => {
    const url = `${apiBaseUrl}${endpoint.path}`;
    let curl = `curl -X ${endpoint.method} ${url}`;
    
    if (endpoint.authRequired) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    }
    
    if (endpoint.method !== 'GET' && endpoint.exampleRequest) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${JSON.stringify(endpoint.exampleRequest, null, 2)}'`;
    }
    
    return curl;
  };

  return (
    <div className="api-endpoints-panel">
      <div className="api-endpoints-header">
        <h3 className="api-endpoints-title">{title}</h3>
        <a 
          href="/help/developers/api-reference" 
          className="api-docs-link"
          onClick={(e) => {
            e.preventDefault();
            window.open('/help/developers/api-reference', '_blank');
          }}
        >
          View Full Docs →
        </a>
      </div>

      <div className="api-endpoints-list">
        {endpoints.map((endpoint, index) => (
          <div key={index} className="api-endpoint-item">
            <div 
              className="api-endpoint-header"
              onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.path ? null : endpoint.path)}
            >
              <div className="api-endpoint-method" style={{ backgroundColor: getMethodColor(endpoint.method) }}>
                {endpoint.method}
              </div>
              <div className="api-endpoint-path">{endpoint.path}</div>
              <div className="api-endpoint-auth">
                {endpoint.authRequired ? '🔒 Auth' : '🌐 Public'}
              </div>
              <button className="api-endpoint-toggle">
                {expandedEndpoint === endpoint.path ? '−' : '+'}
              </button>
            </div>

            <div className="api-endpoint-description">
              {endpoint.description}
            </div>

            {endpoint.roleRequired && (
              <div className="api-endpoint-roles">
                Roles: {endpoint.roleRequired.join(', ')}
              </div>
            )}

            {expandedEndpoint === endpoint.path && (
              <div className="api-endpoint-details">
                <div className="api-endpoint-section">
                  <label>Full URL:</label>
                  <div className="api-endpoint-url">
                    <code>{apiBaseUrl}{endpoint.path}</code>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(`${apiBaseUrl}${endpoint.path}`, endpoint.path)}
                    >
                      {copiedEndpoint === endpoint.path ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="api-endpoint-section">
                  <label>cURL Example:</label>
                  <div className="api-endpoint-code">
                    <pre>{getCurlCommand(endpoint)}</pre>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(getCurlCommand(endpoint), `${endpoint.path}-curl`)}
                    >
                      {copiedEndpoint === `${endpoint.path}-curl` ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {endpoint.exampleRequest && (
                  <div className="api-endpoint-section">
                    <label>Request Body:</label>
                    <div className="api-endpoint-code">
                      <pre>{JSON.stringify(endpoint.exampleRequest, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {endpoint.exampleResponse && (
                  <div className="api-endpoint-section">
                    <label>Response:</label>
                    <div className="api-endpoint-code">
                      <pre>{JSON.stringify(endpoint.exampleResponse, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="api-endpoints-footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open('/help/developers/api-reference', '_blank')}
        >
          View Complete API Reference
        </Button>
      </div>
    </div>
  );
};


