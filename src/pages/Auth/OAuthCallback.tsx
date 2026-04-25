import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleOAuthCallback, handleSAMLCallback, completeGoogleServiceConnection, type SSOCallbackRequest } from '@/api/sso';
import { getCurrentUser } from '@/api/auth';
import { saveSessionData } from '@/utils/auth-cookies';
import { logger } from '@/utils/logger';
import { goToDashboard } from '@/utils/navigation';
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
        const providerParam = searchParams.get('provider');
        let provider = providerParam || 'oauth';

        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing required parameters (code or state)');
        }

        // Check if this is a Google service connection callback (Drive/Calendar/Gmail)
        // Check BOTH sessionStorage and localStorage — sessionStorage can be lost during cross-origin redirects
        const pendingService = sessionStorage.getItem('google_service_pending') || localStorage.getItem('google_service_pending');
        if (pendingService) {
          try {
            const result = await completeGoogleServiceConnection(code, state, pendingService);
            // Clean up BOTH storages
            sessionStorage.removeItem('google_service_pending');
            localStorage.removeItem('google_service_pending');
            for (const storage of [sessionStorage, localStorage]) {
              for (let i = storage.length - 1; i >= 0; i--) {
                const key = storage.key(i);
                if (key && key.startsWith('sso_state_google-service-')) {
                  storage.removeItem(key);
                }
              }
            }
            // Redirect to connect-profiles with success
            navigate(`/connect-profiles?service=${pendingService}&status=${result.status}`, { replace: true });
            return;
          } catch (serviceError: any) {
            sessionStorage.removeItem('google_service_pending');
            localStorage.removeItem('google_service_pending');
            logger.error('Google service connection failed', serviceError, { component: 'OAuthCallback' });
            navigate(`/connect-profiles?service=${pendingService}&status=error&message=${encodeURIComponent(serviceError?.response?.data?.detail || 'Connection failed')}`, { replace: true });
            return;
          }
        }

        const storages: Storage[] = [];
        try {
          storages.push(sessionStorage);
        } catch {
        }
        try {
          storages.push(localStorage);
        } catch {
        }

        const getStoredState = (p: string) => {
          for (const s of storages) {
            try {
              const v = s.getItem(`sso_state_${p}`);
              if (v) return v;
            } catch {
            }
          }
          return null;
        };

        const providerCandidates = new Set<string>([provider]);
        if (getStoredState(provider) !== state) {
          let matchedProvider: string | null = null;
          for (const s of storages) {
            for (let i = 0; i < s.length; i++) {
              const key = s.key(i);
              if (!key || !key.startsWith('sso_state_')) continue;
              const candidateProvider = key.replace('sso_state_', '');
              providerCandidates.add(candidateProvider);
              const candidateState = s.getItem(key);
              if (candidateState === state) {
                matchedProvider = candidateProvider;
              }
            }
          }

          if (!matchedProvider) {
            logger.warn('OAuth callback state mismatch; continuing without sessionStorage match', {
              component: 'OAuthCallback',
            });
          } else {
            provider = matchedProvider;
          }
        }

        const providersToTry = [
          provider,
          ...Array.from(providerCandidates).filter((p) => p !== provider),
        ];
        let response: Awaited<ReturnType<typeof handleOAuthCallback>> | null = null;
        let successfulProvider: string | null = null;
        let lastError: any = null;

        for (const providerToTry of providersToTry) {
          try {
            const isSAML = providerToTry.toLowerCase().includes('saml');
            const request: SSOCallbackRequest = {
              code,
              state,
              provider: providerToTry,
            };

            response = isSAML
              ? await handleSAMLCallback(request)
              : await handleOAuthCallback(request);
            successfulProvider = providerToTry;
            break;
          } catch (e: any) {
            lastError = e;
          }
        }

        if (!response || !successfulProvider) {
          throw lastError || new Error('Authentication failed');
        }

        for (const s of storages) {
          try {
            s.removeItem(`sso_state_${successfulProvider}`);
          } catch {
          }
        }

        if (!response.user.email || !response.user.role) {
          throw new Error('Invalid response: missing user data');
        }

        saveSessionData(
          response.user.email,
          response.user.role as any,
          response.user.org_id || ''
        );

        // Check for pending desktop-callback redirect (miner app / IDE login)
        const desktopRedirect = sessionStorage.getItem('rg_desktop_redirect');
        if (desktopRedirect) {
          sessionStorage.removeItem('rg_desktop_redirect');
          window.location.href = desktopRedirect;
          return;
        }

        try {
          sessionStorage.setItem(
            'rg-post-login-target',
            JSON.stringify({ path: '/', ts: Date.now(), remaining: 5 })
          );
          document.cookie = `rg_post_login_target=${encodeURIComponent('/')}; Max-Age=60; Path=/`;
        } catch {
        }

        navigate('/');
      } catch (error: any) {
        logger.error('OAuth callback error', error, { component: 'OAuthCallback' });

        try {
          const user = await getCurrentUser();
          if (user) {
            navigate('/');
            return;
          }
        } catch {
        }

        const backendMessage =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message;
        const message =
          typeof backendMessage === 'string' &&
          (/csrf/i.test(backendMessage) || /state/i.test(backendMessage))
            ? 'Login session expired. Please try again.'
            : (backendMessage || 'Authentication failed');

        setError(message);
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
