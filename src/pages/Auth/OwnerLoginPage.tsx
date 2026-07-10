/**
 * Owner Login Page - Separate authentication for platform owner
 * Premium dark theme with security-focused design
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
const CrownIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

import { ENV } from '../../config/env';

// API Configuration
const API_BASE = ENV.apiUrl;

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #0a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '24px',
    padding: '48px 40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  logoIcon: {
    width: '72px',
    height: '72px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: '#fff',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  },
  securityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '20px',
    fontSize: '11px',
    color: '#ef4444',
    marginTop: '16px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    position: 'relative' as const,
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
  },
  error: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '10px',
    color: '#f87171',
    fontSize: '13px',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '32px',
    fontSize: '12px',
    color: '#64748b',
  },
  apiInfo: {
    marginTop: '24px',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'center' as const,
  },
  backLink: {
    marginTop: '24px',
    textAlign: 'center' as const,
  },
  link: {
    color: '#ef4444',
    textDecoration: 'none',
    fontSize: '13px',
  },
};

const OwnerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Owner login form submitted');
    setError('');

    if (!email || !password) {
      console.log('❌ Validation failed: missing email or password');
      setError('Please enter both email and password');
      return;
    }

    console.log('📧 Email:', email);
    console.log('🌐 API_BASE:', API_BASE);
    console.log('🔗 Login URL:', `${API_BASE}/owner/auth/login`);
    
    setLoading(true);

    try {
      console.log('📡 Sending login request...');
      const response = await fetch(`${API_BASE}/owner/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const data = await response.json();
        console.log('❌ Login failed:', data);
        throw new Error(data.detail || 'Authentication failed');
      }

      const data = await response.json();
      console.log('✅ Login successful!', { token_type: data.token_type, expires_in: data.expires_in });

      // Store owner token for dashboard access
      // Note: For production, consider using HttpOnly cookies set by backend
      if (data.access_token) {
        localStorage.setItem('owner_token', data.access_token);
        localStorage.setItem('owner_token_expires', String(Date.now() + data.expires_in * 1000));
        localStorage.setItem('owner_email', email);
        console.log('💾 Token stored in localStorage');
      }

      console.log('🔄 Redirecting to /chat...');
      navigate('/chat');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div style={styles.logoIcon}>
            <CrownIcon />
          </div>
          <h1 style={styles.title}>Owner Access</h1>
          <p style={styles.subtitle}>DevSwat Platform Control Center</p>
          <div style={styles.securityBadge}>
            <LockIcon /> Secure Authentication
          </div>
        </header>

        <form style={styles.form} onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Owner Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="owner@dev-swat.com"
                style={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Master Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                style={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <div style={styles.backLink}>
          <a href="/login" style={styles.link}>
            ← Back to User Login
          </a>
        </div>

        <div style={styles.footer}>
          This is a restricted area. Unauthorized access attempts are logged.
        </div>
      </div>
    </div>
  );
};

export default OwnerLoginPage;
