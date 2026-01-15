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
        body: JSON.stringify({ name, email, password, plan }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Signup failed');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
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
          <div style={styles.success}>
            <Check size={16} />
            Account created! Redirecting to login...
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
      </div>
    </div>
  );
}
