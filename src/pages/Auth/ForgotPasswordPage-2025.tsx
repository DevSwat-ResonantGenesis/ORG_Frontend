import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fastapiClient from '../../api/fastapiClient';
import { goToLogin } from '../../utils/navigation';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './ForgotPasswordPage-2025.module.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    try {
      setSubmitting(true);
      await fastapiClient.post('/public/forgot-password', {
        email: email.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send password reset email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.publicPage}>
      <div className={layoutStyles.publicContainer}>
        <div className={styles.container}>
          <div className={cardStyles.card + ' ' + cardStyles.cardElevated + ' ' + styles.card}>
            {submitted ? (
              <>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>Check Your Email</h1>
                <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  If an account with that email exists, we've sent a password reset link.
                </p>
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary + ' ' + buttonStyles.buttonFullWidth}
                  onClick={() => goToLogin(navigate)}
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>Reset Password</h1>
                <p style={{ color: '#888', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  Enter your email to receive a password reset link
                </p>

                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={inputStyles.label}>Email Address</label>
                    <input
                      type="email"
                      id="email"
                      className={inputStyles.input + (error ? ' ' + inputStyles.inputError : '')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <button
                    type="submit"
                    className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary + ' ' + buttonStyles.buttonFullWidth}
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Reset Link'}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

