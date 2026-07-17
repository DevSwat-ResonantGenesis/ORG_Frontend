/**
 * LLM Error Notification Component
 * Shows user-friendly error when AI services are unavailable
 * Guides users to connect their provider API
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LLMErrorNotificationProps {
  error?: string;
  service?: 'chat' | 'builder' | 'agent' | 'workflow' | 'code';
  requiredProvider?: string; // If service requires specific provider
  onDismiss?: () => void;
  inline?: boolean; // Show inline vs modal style
  showModal?: boolean; // Force show as modal
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  chat: 'AI Chat',
  builder: 'Project Builder',
  agent: 'AI Agents',
  workflow: 'Workflow Automation',
  code: 'Code Generation',
};

export const LLMErrorNotification: React.FC<LLMErrorNotificationProps> = ({
  error,
  service = 'chat',
  requiredProvider,
  onDismiss,
  inline = false,
  showModal = false,
}) => {
  const navigate = useNavigate();
  
  const serviceName = SERVICE_DESCRIPTIONS[service] || 'AI Service';
  const isModal = showModal || !inline;

  const handleGoToIntegrations = () => {
    navigate('/dashboard?tab=integrations');
    if (onDismiss) onDismiss();
  };

  // Modal style with backdrop
  if (isModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}>
        <div style={{
          background: '#18181b',
          border: '1px solid #3f3f46',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Icon */}
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(59, 130, 246, 0.15)', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Content */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '20px', 
                fontWeight: 600, 
                color: '#fafafa' 
              }}>
                AI Providers Unavailable
              </h3>
              
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '15px', 
                color: '#a1a1aa',
                lineHeight: 1.6,
              }}>
                All system AI providers are currently unavailable. To continue using {serviceName}, please connect your own provider API keys.
              </p>

              <p style={{ 
                margin: '0', 
                fontSize: '13px', 
                color: '#71717a',
                lineHeight: 1.5,
              }}>
                This ensures uninterrupted service and gives you full control over your AI usage.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleGoToIntegrations}
                style={{
                  padding: '12px 20px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Connect Provider API
              </button>
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  style={{
                    padding: '12px 20px',
                    background: 'transparent',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#a1a1aa',
                    fontSize: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#52525b';
                    e.currentTarget.style.color = '#fafafa';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#3f3f46';
                    e.currentTarget.style.color = '#a1a1aa';
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
  }

  // Inline style
  return (
    <div style={{
      padding: '16px 20px',
      background: 'rgba(59, 130, 246, 0.08)',
      borderLeft: '3px solid #3b82f6',
      borderRadius: '0 8px 8px 0',
      margin: '12px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: 'rgba(59, 130, 246, 0.15)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
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
            AI Providers Unavailable
          </h4>
          
          <p style={{ 
            margin: '0 0 12px 0', 
            fontSize: '13px', 
            color: '#a1a1aa',
            lineHeight: 1.5,
          }}>
            LLM Provider currently unavailable. Please add your provider API key to continue.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={handleGoToIntegrations}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
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
              Connect Provider API
            </button>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid #3f3f46',
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
