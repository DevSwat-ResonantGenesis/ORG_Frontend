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
      ? 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)'
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
      
      saveSessionData(email.trim(), data.role, data.org_id, data.user?.id);
      
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
      </div>
    </div>
  );
}
