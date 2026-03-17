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
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.75rem',
    color: '#888',
    cursor: 'pointer',
    lineHeight: '1.4',
  },
  checkboxInput: {
    width: '14px',
    height: '14px',
    minWidth: '14px',
    minHeight: '14px',
    maxWidth: '14px',
    maxHeight: '14px',
    accentColor: '#6366f1',
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: '2px',
    appearance: 'auto' as const,
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

        {plan !== 'free' && (
          <div style={{ ...styles.planBadge, marginBottom: '1.5rem' }}>
            <Check size={12} />
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </div>
        )}

        {plan === 'free' && <div style={{ marginBottom: '1rem' }} />}

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
              <input
                type="checkbox"
                style={styles.checkboxInput}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" style={styles.link}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={styles.link}>Privacy Policy</Link>
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
