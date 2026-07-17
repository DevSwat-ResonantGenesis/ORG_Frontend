/**
 * Modern Signup Page - Compact, minimal design
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useThemeStore } from "../../store/themeStore";
import { initiateSSO } from '../../api/sso';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/signup'];

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
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '8px',
    padding: '0.5rem',
    display: 'flex',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.8rem',
  },
  planBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(99,102,241,0.2)',
    color: '#a5b4fc',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    marginTop: '0.5rem',
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
});

export default function SignupPageNew() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuthSignup = async (provider: string) => {
    setOauthLoading(provider);
    try {
      const authUrl = await initiateSSO(provider);
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
        <link rel="canonical" href="https://dev-swat.com/signup" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/signup" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>
      <div style={styles.card}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' as const, paddingTop: '0.5rem' }}>Create your account</h1>

        <div style={{ marginBottom: '1rem' }} />

        <div style={{ ...styles.form, gap: '1.25rem' }}>
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span>Sign up with</span>
            <div style={styles.dividerLine} />
          </div>

          <button 
            type="button" 
            style={{ ...styles.btn, opacity: oauthLoading === 'google' ? 0.6 : 1 }}
            onClick={() => handleOAuthSignup('google')}
            disabled={!!oauthLoading}
          >
            {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
          </button>
        </div>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}
