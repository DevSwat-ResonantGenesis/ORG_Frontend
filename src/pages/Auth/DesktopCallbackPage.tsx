import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth-cookies';
import fastapiClient from '@/api/fastapiClient';

/**
 * Desktop IDE Login Callback
 * 
 * Flow:
 * 1. IDE opens https://domain/auth/desktop-callback?port=19200
 * 2. If user is logged in → get token via /auth/refresh → redirect to localhost:<port>/auth-callback?token=...
 * 3. If user is NOT logged in → redirect to /login?redirect=/auth/desktop-callback?port=<port>
 * 4. After login, LoginPageNew redirects back here, and step 2 runs
 */
export default function DesktopCallbackPage() {
  const [searchParams] = useSearchParams();
  const port = searchParams.get('port');
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'success' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!port) {
      setStatus('error');
      setErrorMsg('Missing port parameter. Please try signing in again from Resonant IDE.');
      return;
    }

    const run = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Not logged in — redirect to login with return URL
        const returnUrl = `/auth/desktop-callback?port=${port}`;
        window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
        return;
      }

      // User is logged in — get a fresh access token
      setStatus('redirecting');
      try {
        const res = await fastapiClient.post('/auth/refresh', {}, { withCredentials: true });
        const token = res.data?.access_token;

        if (!token) {
          // Fallback: try /auth/verify to get token from cookie
          setStatus('error');
          setErrorMsg('Could not retrieve access token. Please try signing in again from Resonant IDE.');
          return;
        }

        // Redirect to IDE's local callback server
        const callbackUrl = `http://127.0.0.1:${port}/auth-callback?token=${encodeURIComponent(token)}`;
        setStatus('success');
        window.location.href = callbackUrl;
      } catch (err: any) {
        console.error('[DesktopCallback] Token refresh failed:', err);
        // Session might be expired — redirect to login
        const returnUrl = `/auth/desktop-callback?port=${port}`;
        window.location.href = `/login?redirect=${encodeURIComponent(returnUrl)}`;
      }
    };

    run();
  }, [port]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '48px 64px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        maxWidth: '480px',
      }}>
        {status === 'checking' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Checking authentication...</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Please wait</p>
          </>
        )}
        {status === 'redirecting' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Signing you in to Resonant IDE...</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Redirecting back to the desktop app</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.15)', margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Signed In!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              You can close this tab and return to Resonant IDE.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Sign In Failed</h2>
            <p style={{ color: 'rgba(255,100,100,0.8)', fontSize: '14px', marginBottom: '16px' }}>{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
