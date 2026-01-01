import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import fastapiClient from '../../api/fastapiClient';
import { goToLogin } from '../../utils/navigation';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './ResetPasswordPage-2025.module.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Password and confirmation are required.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await fastapiClient.post('/auth/reset-password', {
        token,
        new_password: password,
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        goToLogin(navigate);
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.error || 'Failed to reset password. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.publicPage}>
        <div className={layoutStyles.publicContainer}>
          <div className={styles.container}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated + ' ' + styles.card}>
              <header className={styles.header}>
                <h1 className="typography-page-title">Invalid Reset Link</h1>
                <p className={`typography-body-small ${styles.subtitle}`}>
                  This password reset link is invalid or has expired
                </p>
              </header>
              <p className={`typography-body ${styles.message}`}>
                Please request a new password reset link.
              </p>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary + ' ' + buttonStyles.buttonFullWidth}
                onClick={() => navigate('/forgot-password')}
              >
                Request New Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.publicPage}>
      <div className={layoutStyles.publicContainer}>
        <div className={styles.container}>
          <div className={cardStyles.card + ' ' + cardStyles.cardElevated + ' ' + styles.card}>
            <header className={styles.header}>
              <h1 className="typography-page-title">Reset Password</h1>
              <p className={`typography-body-small ${styles.subtitle}`}>
                Enter your new password below
              </p>
            </header>

            {message && (
              <div className={styles.successMessage}>
                {message}
              </div>
            )}

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={inputStyles.label}>New Password</label>
                <input
                  type="password"
                  id="password"
                  className={inputStyles.input + (error ? ' ' + inputStyles.inputError : '')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={inputStyles.label}>Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={inputStyles.input + (error ? ' ' + inputStyles.inputError : '')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary + ' ' + buttonStyles.buttonFullWidth}
                disabled={submitting}
              >
                {submitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className={styles.footer}>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                onClick={() => goToLogin(navigate)}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

