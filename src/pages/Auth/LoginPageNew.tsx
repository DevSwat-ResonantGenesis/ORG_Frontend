/**
 * Modern Login Page - Matches SignupPageNew style
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { saveSessionData, clearSessionData, type UserRole } from '../../utils/auth-cookies';
import { clearSession } from '../../utils/auth';
import fastapiClient from '../../api/fastapiClient';
import { goToResonantChat } from '../../utils/navigation';
import { useThemeStore } from '../../store/themeStore';
import { initiateSSO } from '../../api/sso';

const getStyles = (theme: 'light' | 'dark'): Record<string, React.CSSProperties> => ({
  container: {
    minHeight: '100vh',
    background: theme === 'dark' 
      ? 'linear-gradient(180deg, #0a0a0a 0%, #121212 100%)'
      : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
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
  inputGroup: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme === 'dark' ? '#666' : '#999',
  },
  input: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
    background: theme === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(255,255,255,0.8)',
    border: theme === 'dark' 
      ? '1px solid rgba(255,255,255,0.1)' 
      : '1px solid rgba(0,0,0,0.2)',
    borderRadius: '8px',
    color: theme === 'dark' ? '#fff' : '#1a1a1a',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: theme === 'dark' ? '#666' : '#999',
    cursor: 'pointer',
    padding: '4px',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
    width: '24px',
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
  socialBtns: {
    display: 'flex',
    gap: '0.5rem',
  },
  socialBtn: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #000',
    background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.8rem',
    color: '#888',
  },
  forgotPassword: {
    textAlign: 'right' as const,
    marginTop: '-0.5rem',
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

type LoginResponse = {
  access_token: string;
  org_id: string;
  role: UserRole;
  user?: {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    is_superuser?: boolean;
  };
};

export default function LoginPageNew() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  useEffect(() => {
    clearSessionData();
    clearSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await fastapiClient.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      }, {
        withCredentials: true,
        timeout: 15000,
      });
      
      saveSessionData(email.trim(), data.role, data.org_id, data.user?.id, data.is_superuser || data.role === 'platform_owner');
      
      // Platform owners go to owner dashboard, regular users to resonant-chat
      if (data.role === 'platform_owner') {
        navigate('/owner-dashboard');
      } else {
        try {
          sessionStorage.setItem(
            'rg-post-login-target',
            JSON.stringify({ path: '/resonant-chat', ts: Date.now(), remaining: 5 })
          );
          document.cookie = `rg_post_login_target=${encodeURIComponent('/resonant-chat')}; Max-Age=60; Path=/`;
        } catch {
          // ignore
        }
        goToResonantChat(navigate);
      }
    } catch (err: any) {
      let message = 'Unable to sign in. Please check your credentials.';
      if (err?.response?.status === 401) {
        message = 'Invalid email or password.';
      } else if (err?.response?.status === 429) {
        message = 'Too many attempts. Please wait and try again.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setError('');
    setOauthLoading(provider);
    try {
      const authUrl = await initiateSSO(provider);
      window.location.href = authUrl;
    } catch (err: any) {
      setError(`${provider} login is not available. Please use email/password.`);
      setOauthLoading(null);
    }
  };

  const styles = getStyles(theme);
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' as const, paddingTop: '0.5rem' }}>Welcome back</h1>

        <form style={{ ...styles.form, gap: '1.25rem' }} onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <Mail size={16} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email address"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <Lock size={16} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              style={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={styles.forgotPassword}>
            <Link to="/forgot-password" style={{ ...styles.link, fontSize: '0.75rem' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span>or continue with</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.socialBtns}>
            <button 
              type="button" 
              style={{ ...styles.socialBtn, opacity: oauthLoading === 'google' ? 0.6 : 1 }}
              onClick={() => handleOAuthLogin('google')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
            </button>
            <button 
              type="button" 
              style={{ ...styles.socialBtn, opacity: oauthLoading === 'github' ? 0.6 : 1 }}
              onClick={() => handleOAuthLogin('github')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
            </button>
          </div>
        </form>

        <div style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '1.2rem' }}>
          <a href="https://www.linkedin.com/company/resonantgenesis/" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }} aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://www.youtube.com/@ResonantGenesis" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }} aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://x.com/resonantgenesis" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }} aria-label="X">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.reddit.com/u/ResonantGenesis/" target="_blank" rel="noopener noreferrer" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }} aria-label="Reddit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          </a>
          <a href="mailto:contact@resonantgenesis.xyz" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', transition: 'color 0.2s' }} aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
