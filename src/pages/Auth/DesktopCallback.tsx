import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth-cookies';
import client from '@/api/client';

/**
 * Desktop App Auth Callback
 * 
 * Flow:
 * 1. Electron app opens system browser to /auth/desktop-callback?port=XXXXX
 * 2. If user is logged in → fetch token → redirect to localhost callback
 * 3. If not logged in → redirect to /login with return URL
 */
const DesktopCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Connecting to Resonant IDE...');

  useEffect(() => {
    const port = searchParams.get('port');

    if (!port) {
      setError('Missing port parameter. Please try signing in again from Resonant IDE.');
      return;
    }

    // Not logged in → redirect to login, then come back
    if (!isAuthenticated()) {
      const returnUrl = `/auth/desktop-callback?port=${port}`;
      navigate(`/login?return=${encodeURIComponent(returnUrl)}`, { replace: true });
      return;
    }

    // Logged in → get the token and redirect to localhost
    const sendToken = async () => {
      try {
        setStatus('Retrieving authentication token...');
        const res = await client.get('/auth/desktop-token', { withCredentials: true });
        const token = res.data?.token;

        if (!token) {
          throw new Error('No token received from server');
        }

        setStatus('Signing you into Resonant IDE...');
        // Redirect to the Electron app's local HTTP server
        window.location.href = `http://localhost:${port}/auth-callback?token=${encodeURIComponent(token)}`;
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to get token';
        if (err?.response?.status === 401) {
          // Token expired — redirect to login
          const returnUrl = `/auth/desktop-callback?port=${port}`;
          navigate(`/login?return=${encodeURIComponent(returnUrl)}`, { replace: true });
        } else {
          setError(msg);
        }
      }
    };

    sendToken();
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚡</div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
          Resonant IDE
        </h1>

        {error ? (
          <>
            <p style={{ color: '#ef4444', marginTop: '16px', lineHeight: 1.6 }}>{error}</p>
            <button
              onClick={() => window.close()}
              style={{
                marginTop: '20px', padding: '8px 24px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)',
                color: '#fff', cursor: 'pointer', fontSize: '14px',
              }}
            >
              Close
            </button>
          </>
        ) : (
          <>
            {/* Spinner */}
            <div style={{
              width: '36px', height: '36px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderTop: '3px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '20px auto 16px',
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#888', fontSize: '14px' }}>{status}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DesktopCallback;
