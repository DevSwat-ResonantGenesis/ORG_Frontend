/**
 * Modern Signup Page - Compact, minimal design
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useThemeStore } from "../../store/themeStore";
import { initiateSSO } from '../../api/sso';

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
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: theme === 'dark' ? '#fff' : '#666',
    cursor: 'pointer',
    padding: '4px',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
    width: '24px',
  },
  checkbox: {
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.75rem',
    color: theme === 'dark' ? '#aaa' : '#666',
    cursor: 'pointer',
    lineHeight: '1.4',
  },
  checkboxInput: {
    WebkitAppearance: 'none' as any,
    appearance: 'none' as any,
    width: '16px',
    height: '16px',
    minWidth: '16px',
    minHeight: '16px',
    border: theme === 'dark' ? '1.5px solid rgba(255,255,255,0.3)' : '1.5px solid rgba(0,0,0,0.3)',
    borderRadius: '3px',
    background: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    margin: 0,
    marginTop: '1px',
    position: 'relative' as const,
  },
  checkboxText: {
    flex: 1,
    minWidth: 0,
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
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    gap: '0.5rem',
  },
  socialBtn: {
    flex: 1,
    padding: '0.6rem',
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
    gap: '0.5rem',
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
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
});

export default function SignupPageNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme } = useThemeStore();
  // Support both URL params (?plan=plus) and location state ({ plan: 'plus' })
  const plan = searchParams.get('plan') || (location.state as any)?.plan || 'developer';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuthSignup = async (provider: string) => {
    setError('');
    setOauthLoading(provider);
    try {
      const authUrl = await initiateSSO(provider);
      window.location.href = authUrl;
    } catch (err: any) {
      setError(`${provider} signup is not available. Please use email/password.`);
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms of service');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/public/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: name,
          username: email.split('@')[0],
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.message || 'Signup failed');
      }
      
      const data = await response.json();
      
      // Check if email verification is required (new flow)
      if (data.email_verification_required) {
        setSuccess(true);
        setError(''); // Clear any errors
        // Don't redirect - user needs to verify email first
        return;
      }
      
      // Legacy flow: Save session data from response (if auto-login is enabled)
      if (data.user && data.org_id && data.access_token) {
        import('../../utils/auth-cookies').then(({ saveSessionData }) => {
          saveSessionData({
            email: data.user.email,
            role: data.role || 'owner',
            org: data.org_id,
            userId: data.user.id,
          });
        });
        setSuccess(true);
        // Only redirect to dashboard if we got tokens (auto-login)
        try {
          sessionStorage.setItem(
            'rg-post-login-target',
            JSON.stringify({ path: '/', ts: Date.now(), remaining: 5 })
          );
          document.cookie = `rg_post_login_target=${encodeURIComponent('/')}; Max-Age=60; Path=/`;
        } catch {
        }
        setTimeout(() => navigate('/'), 1000);
      } else {
        // No tokens = email verification required
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' as const, paddingTop: '0.5rem' }}>Create your account</h1>

        <div style={{ marginBottom: '1rem' }} />

        {success ? (
          <div style={{ ...styles.success, flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} />
              <strong>Account created successfully!</strong>
            </div>
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              Please check your email inbox and click the verification link to activate your account.
            </p>
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'underline', marginTop: '0.5rem' }}>
              Go to Login →
            </Link>
          </div>
        ) : (
          <form style={styles.form} onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}
            
            <div style={styles.inputGroup}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full name"
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email address"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (8+ characters)"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <label style={styles.checkbox}>
              <div style={{ position: 'relative' as const, flexShrink: 0, width: '16px', height: '16px', marginTop: '1px' }}>
                <input
                  type="checkbox"
                  style={{
                    ...styles.checkboxInput,
                    ...(agreeTerms ? {
                      background: '#6366f1',
                      borderColor: '#6366f1',
                    } : {}),
                  }}
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                {agreeTerms && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" style={{ position: 'absolute' as const, left: '3px', top: '4px', pointerEvents: 'none' as const }}>
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={styles.checkboxText}>
                I agree to the{' '}
                <Link to="/terms-of-service" style={styles.link}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" style={styles.link}>Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
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
                onClick={() => handleOAuthSignup('google')}
                disabled={!!oauthLoading}
              >
                {oauthLoading === 'google' ? 'Connecting...' : 'Google'}
              </button>
              <button 
                type="button" 
                style={{ ...styles.socialBtn, opacity: oauthLoading === 'github' ? 0.6 : 1 }}
                onClick={() => handleOAuthSignup('github')}
                disabled={!!oauthLoading}
              >
                {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
              </button>
            </div>
          </form>
        )}

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </div>

      </div>
    </div>
  );
}
