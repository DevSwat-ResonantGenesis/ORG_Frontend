/**
 * Modern Login Page - Matches SignupPageNew style
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { clearSessionData, type UserRole } from '../../utils/auth-cookies';
import { clearSession } from '../../utils/auth';
import { useThemeStore } from '../../store/themeStore';
import { initiateSSO } from '../../api/sso';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/login'];

const getStyles = (theme: 'light' | 'dark'): Record<string, React.CSSProperties> => ({
  container: {
    minHeight: '100vh',
    background: 'transparent',
    color: theme === 'dark' ? '#fff' : '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1rem 2rem 1rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: theme === 'dark' 
      ? 'rgba(255,255,255,0.03)' 
      : 'rgba(255,255,255,0.95)',
    border: theme === 'dark' 
      ? '1px solid rgba(255,255,255,0.1)' 
      : '1px solid rgba(0,0,0,0.1)',
    borderRadius: '16px',
    padding: '2rem',
    marginTop: '0',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: theme === 'dark' ? '#888' : '#666',
    fontSize: '0.8rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
  },
  btn: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #000',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    transition: 'all 0.2s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#666',
    fontSize: '0.75rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.8rem',
    color: '#888',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#f87171',
  },
});


export default function LoginPageNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useThemeStore();
  
  // Desktop IDE login flow ONLY: ?redirect=/auth/desktop-callback?port=PORT
  const postLoginRedirect = useMemo(() => {
    const r = searchParams.get('redirect');
    // Only honor redirect for desktop IDE callback — all other logins go to chat
    return r && r.startsWith('/auth/desktop-callback') ? r : null;
  }, [searchParams]);
  
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    clearSessionData();
    clearSession();
  }, []);


  const handleOAuthLogin = async (provider: string) => {
    setOauthLoading(provider);
    try {
      // Persist desktop-callback redirect through the OAuth round-trip
      if (postLoginRedirect) {
        sessionStorage.setItem('rg_desktop_redirect', postLoginRedirect);
      }
      const authUrl = await initiateSSO(provider, postLoginRedirect || undefined);
      window.location.href = authUrl;
    } catch (err: any) {
      setOauthLoading(null);
    }
  };

  const styles = getStyles(theme);
  
  return (
    <div style={styles.container}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/login" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/login" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>
      <div style={styles.card}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' as const, paddingTop: '0.5rem' }}>Welcome back</h1>

        <div style={{ ...styles.form, gap: '1.25rem' }}>
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span>Sign in with</span>
            <div style={styles.dividerLine} />
          </div>

          <button 
            type="button" 
            style={{ ...styles.btn, opacity: oauthLoading === 'google' ? 0.6 : 1 }}
            onClick={() => handleOAuthLogin('google')}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
          </button>
        </div>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </div>

      </div>
    </div>
  );
}
