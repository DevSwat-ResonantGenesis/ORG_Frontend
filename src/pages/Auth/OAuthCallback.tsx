import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback, handleSAMLCallback, type SSOCallbackRequest } from '@/api/sso';
import { saveSessionData } from '@/utils/auth-cookies';
import { logger } from '@/utils/logger';
import { Button } from '@/components/ui/Button';
import pageStyles from '../../components/ui/Page.module.css';
import containerStyles from '../../components/ui/Container.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';

/**
 * OAuth/SAML Callback Page
 * Handles the redirect from SSO providers after authentication
 */
const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        // Derive provider: prefer query param, otherwise find matching state in stored providers
        let provider = searchParams.get('provider') || '';
        if (!provider && state) {
          // Look for a stored state that matches across all providers
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('sso_state_')) {
              const stored = sessionStorage.getItem(key);
              if (stored === state) {
                provider = key.replace('sso_state_', '');
                break;
              }
            }
          }
        }
        if (!provider) {
          provider = 'oauth';
        }

        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing required parameters (code or state)');
        }

        const storedState = sessionStorage.getItem(`sso_state_${provider}`);
        if (storedState !== state) {
          throw new Error('Invalid state parameter - possible CSRF attack');
        }

        sessionStorage.removeItem(`sso_state_${provider}`);

        const isSAML = provider.toLowerCase().includes('saml');
        const request: SSOCallbackRequest = {
          code,
          state,
          provider,
        };

        const response = isSAML
          ? await handleSAMLCallback(request)
          : await handleOAuthCallback(request);

        if (!response.user.email || !response.user.role) {
          throw new Error('Invalid response: missing user data');
        }

        saveSessionData(
          response.user.email,
          response.user.role as any,
          response.user.org_id || ''
        );

        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        logger.error('OAuth callback error', error, { component: 'OAuthCallback' });
        setError(error.message || 'Authentication failed');
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className={pageStyles.page}>
        <div className={containerStyles.container + ' ' + containerStyles.containerNarrow}>
          <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div className={cardStyles.card}>
              <div style={{ padding: 'var(--space-8)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--gray-200)',
                  borderTop: '3px solid var(--accent-500)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto var(--space-4)'
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <h1 style={{ 
                  fontSize: 'var(--font-2xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-3)',
                  color: 'var(--text-primary)'
                }}>
                  Completing authentication...
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Please wait while we complete your sign-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageStyles.page}>
        <div className={containerStyles.container + ' ' + containerStyles.containerNarrow}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className={cardStyles.card}>
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <h1 style={{ 
                  fontSize: 'var(--font-2xl)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--space-3)',
                  color: '#ef4444'
                }}>
                  Authentication Failed
                </h1>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--space-5)',
                  lineHeight: 'var(--leading-relaxed)'
                }}>
                  {error}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                  <Button onClick={() => navigate('/login')}>
                    Return to Login
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/')}>
                    Go to Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallbackPage;
