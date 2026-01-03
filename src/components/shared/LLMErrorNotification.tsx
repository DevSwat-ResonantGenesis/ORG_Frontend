/**
 * LLM Error Notification Component
 * Shows user-friendly error when AI services are unavailable
 * Guides users to add their own API key
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_KEY_PROVIDERS } from '@/api/userApiKeys';

interface LLMErrorNotificationProps {
  error?: string;
  service?: 'chat' | 'builder' | 'agent' | 'workflow' | 'code';
  requiredProvider?: string; // If service requires specific provider
  onDismiss?: () => void;
  inline?: boolean; // Show inline vs modal style
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  chat: 'AI Chat',
  builder: 'Project Builder',
  agent: 'AI Agents',
  workflow: 'Workflow Automation',
  code: 'Code Generation',
};

const PROVIDER_RECOMMENDATIONS: Record<string, string[]> = {
  chat: ['openai', 'anthropic', 'groq', 'google'],
  builder: ['openai', 'anthropic'],
  agent: ['openai', 'anthropic', 'google'],
  workflow: ['openai', 'anthropic'],
  code: ['openai', 'anthropic', 'deepseek'],
};

export const LLMErrorNotification: React.FC<LLMErrorNotificationProps> = ({
  error,
  service = 'chat',
  requiredProvider,
  onDismiss,
  inline = false,
}) => {
  const navigate = useNavigate();
  
  const serviceName = SERVICE_DESCRIPTIONS[service] || 'AI Service';
  const recommendedProviders = PROVIDER_RECOMMENDATIONS[service] || ['openai', 'anthropic'];
  
  const getProviderInfo = (providerId: string) => {
    return API_KEY_PROVIDERS.find(p => p.id === providerId);
  };

  const handleAddKey = () => {
    navigate('/profile');
  };

  const containerStyle: React.CSSProperties = inline ? {
    padding: '16px 20px',
    background: 'rgba(239, 68, 68, 0.08)',
    borderLeft: '3px solid #ef4444',
    borderRadius: '0 8px 8px 0',
    margin: '12px 0',
  } : {
    padding: '24px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    maxWidth: '500px',
    margin: '20px auto',
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: 'rgba(239, 68, 68, 0.15)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '15px', 
            fontWeight: 600, 
            color: '#fafafa' 
          }}>
            API Key Required for {serviceName}
          </h4>
          
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: '13px', 
            color: '#a1a1aa',
            lineHeight: 1.5,
          }}>
            To use {serviceName}, please add your own API key. This ensures uninterrupted service and gives you full control over your AI usage.
          </p>

          {requiredProvider ? (
            <div style={{ 
              padding: '10px 12px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: '6px',
              marginBottom: '12px',
            }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#a1a1aa' }}>
                <strong style={{ color: '#818cf8' }}>Required:</strong>{' '}
                {getProviderInfo(requiredProvider)?.name || requiredProvider} API key
              </p>
              {getProviderInfo(requiredProvider)?.helpUrl && (
                <a 
                  href={getProviderInfo(requiredProvider)?.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '12px', 
                    color: '#6366f1',
                    textDecoration: 'none',
                  }}
                >
                  Get your key →
                </a>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '12px', 
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Recommended providers:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recommendedProviders.map(providerId => {
                  const provider = getProviderInfo(providerId);
                  return provider ? (
                    <a
                      key={providerId}
                      href={provider.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 10px',
                        background: '#27272a',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#a1a1aa',
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#3f3f46';
                        e.currentTarget.style.color = '#fafafa';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#27272a';
                        e.currentTarget.style.color = '#a1a1aa';
                      }}
                    >
                      {provider.name}
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={handleAddKey}
              style={{
                padding: '8px 16px',
                background: '#6366f1',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add API Key
            </button>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#a1a1aa',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Check if an error is an LLM-related error that requires user API key
 */
export const isLLMError = (error: any): boolean => {
  if (!error) return false;
  
  const errorStr = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error?.message || error?.detail || JSON.stringify(error)).toLowerCase();
  
  return (
    errorStr.includes('quota') ||
    errorStr.includes('rate limit') ||
    errorStr.includes('insufficient') ||
    errorStr.includes('credit') ||
    errorStr.includes('api key') ||
    errorStr.includes('authentication') ||
    errorStr.includes('unauthorized') ||
    errorStr.includes('llm') ||
    errorStr.includes('failed to generate') ||
    errorStr.includes('model') ||
    errorStr.includes('openai') ||
    errorStr.includes('anthropic') ||
    errorStr.includes('provider')
  );
};

/**
 * Get user-friendly error message for LLM errors
 */
export const getLLMErrorMessage = (error: any, service?: string): string => {
  const serviceName = service ? SERVICE_DESCRIPTIONS[service] || service : 'this service';
  
  if (!error) {
    return `To use ${serviceName}, please add your own API key in your Profile.`;
  }
  
  const errorStr = typeof error === 'string' 
    ? error.toLowerCase() 
    : (error?.message || error?.detail || '').toLowerCase();
  
  if (errorStr.includes('quota') || errorStr.includes('credit') || errorStr.includes('insufficient')) {
    return `To continue using ${serviceName}, please add your own API key. Go to Profile to add your OpenAI, Anthropic, or other provider key.`;
  }
  
  if (errorStr.includes('rate limit')) {
    return `Rate limit reached. Add your own API key in your Profile for uninterrupted service.`;
  }
  
  if (errorStr.includes('failed to generate')) {
    return `AI generation failed. Please add your own API key in your Profile to use ${serviceName}.`;
  }
  
  return `To use ${serviceName}, please add your own API key in your Profile.`;
};

export default LLMErrorNotification;
