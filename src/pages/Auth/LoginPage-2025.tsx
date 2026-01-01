import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSessionData, clearSessionData, type UserRole } from '../../utils/auth-cookies';
import { clearSession } from '../../utils/auth';
import fastapiClient from '../../api/fastapiClient';
import { validateEmail } from '../../utils/signupLogic';
import { logger } from '../../utils/logger';
import { goToDashboard, goToSignup } from '../../utils/navigation';
import { SSOButtons } from '@/components/auth/SSOButtons';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './LoginPage-2025.module.css';

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

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [org, setOrg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    clearSessionData();
    clearSession();
  }, []);

  const handleLogin = async () => {
    setError('');
    setErrors({});

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.error || 'Invalid email' });
      return;
    }

    if (!password.trim()) {
      setErrors({ password: 'Password is required' });
      return;
    }

    try {
      setSubmitting(true);
      const payload: { email: string; password: string; org_id?: string } = {
        email: email.trim(),
        password,
      };
      if (org.trim()) {
        payload.org_id = org.trim();
      }

      const { data } = await fastapiClient.post<LoginResponse>('/auth/login', payload, {
        withCredentials: true,
        timeout: 15000,
      });
      
      // Pass user.id from backend response for proper user identification
      saveSessionData(email.trim(), data.role, data.org_id, data.user?.id);
      goToDashboard(navigate);
    } catch (err: any) {
      logger.error('Login error', err);
      let message = 'Unable to sign in. Please check your credentials and try again.';
      
      if (err?.response?.status === 401) {
        message = 'Invalid email or password. Please try again.';
      } else if (err?.response?.status === 429) {
        message = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err?.response?.status >= 500) {
        message = 'Server error. Please try again in a moment.';
      }
      
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.publicPage}>
      <div className={layoutStyles.publicContainer}>
        <div className={styles.loginContainer}>
          <div className={cardStyles.card + ' ' + cardStyles.cardElevated + ' ' + styles.loginCard}>
            {/* Header */}
            <header className={styles.header}>
                  <h1 className="typography-page-title">Sign In</h1>
                  <p className={`typography-body-small ${styles.subtitle}`}>
                Sign in to your account to continue
              </p>
            </header>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Form */}
            <form 
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              <div className={styles.formGroup}>
                <label htmlFor="email" className={inputStyles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={inputStyles.input + (errors.email ? ' ' + inputStyles.inputError : '')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  autoComplete="email"
                />
                {errors.email && (
                  <span className={inputStyles.errorMessage}>{errors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={inputStyles.label}>Password</label>
                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={inputStyles.input + (errors.password ? ' ' + inputStyles.inputError : '')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <span className={inputStyles.errorMessage}>{errors.password}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="org" className={inputStyles.label}>Organization ID (Optional)</label>
                <input
                  id="org"
                  type="text"
                  className={inputStyles.input}
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Your organization ID"
                  autoComplete="organization"
                />
              </div>

              <button
                type="submit"
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary + ' ' + buttonStyles.buttonFullWidth}
                disabled={submitting}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* SSO Buttons */}
            <div className={styles.ssoSection}>
              <SSOButtons />
            </div>

            {/* Footer Links */}
            <div className={styles.footer}>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
              <span className="typography-body-small">
                Don't have an account?{' '}
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                  onClick={() => goToSignup(navigate)}
                >
                  Sign up
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

