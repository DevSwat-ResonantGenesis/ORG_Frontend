/**
 * Quick Signup Page - 2-Step Onboarding
 * Simplified signup flow for faster conversion
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import { saveSessionData, clearSessionData, type UserRole } from '../../utils/auth-cookies';
import {
  SIGNUP_STEPS,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  completeSignUp,
  createDefaultOrgName,
  type SignUpData,
} from '../../utils/signupLogic';
import { logger } from '../../utils/logger';
import { goToDashboard, goToLogin } from '../../utils/navigation';
import '../../theme/pages.css';
import styles from './SignupPageEnhanced-2025.module.css';

// Google Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

type UsageType = 'personal' | 'team' | 'exploring';

const SignupPageQuick = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    orgName: '',
    plan: 'free-trial',
    billingPeriod: 'monthly',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [usageType, setUsageType] = useState<UsageType | null>(null);

  // Clear stale session on mount
  useEffect(() => {
    clearSessionData();
    // Restore from localStorage if available
    const saved = localStorage.getItem('signup_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < 30 * 60 * 1000) { // 30 min expiry
          setSignUpData(data.signUpData);
          setCurrentStep(data.currentStep);
        } else {
          localStorage.removeItem('signup_progress');
        }
      } catch (e) {
        localStorage.removeItem('signup_progress');
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (signUpData.email) {
      localStorage.setItem('signup_progress', JSON.stringify({
        signUpData,
        currentStep,
        timestamp: Date.now()
      }));
    }
  }, [signUpData, currentStep]);

  // Handle plan from navigation state
  useEffect(() => {
    if (location.state && typeof location.state === 'object') {
      const state = location.state as any;
      if (state.plan) {
        setSignUpData(prev => ({ 
          ...prev, 
          plan: state.plan,
          billingPeriod: state.billingPeriod || 'monthly'
        }));
      }
    }
  }, [location.state]);

  // Validate step 1
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(signUpData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || 'Invalid email';
    }

    const passwordValidation = validatePassword(signUpData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || 'Invalid password';
    }

    if (!signUpData.agreeToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle OAuth (placeholder - needs backend implementation)
  const handleOAuth = async (provider: 'google' | 'github') => {
    // TODO: Implement OAuth flow
    logger.info(`OAuth ${provider} clicked - not yet implemented`);
    setErrors({ oauth: `${provider} login coming soon! Use email for now.` });
  };

  // Handle step 1 submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // Auto-generate org name from email
    const autoOrgName = createDefaultOrgName(signUpData.email);
    setSignUpData(prev => ({ ...prev, orgName: autoOrgName }));
    setCurrentStep(1);
  };

  // Handle final submit
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setProgress(0);

    try {
      // If no org name provided, use auto-generated
      const finalData = {
        ...signUpData,
        orgName: signUpData.orgName || createDefaultOrgName(signUpData.email),
      };

      const result = await completeSignUp(finalData, (step, progressValue) => {
        setProgress(progressValue);
      });

      if (result.success) {
        localStorage.removeItem('signup_progress');
        goToDashboard(navigate);
      } else {
        setErrors({ submit: result.error || 'Sign up failed. Please try again.' });
        setSubmitting(false);
      }
    } catch (error: any) {
      logger.error('Sign up error', error);
      setErrors({ submit: error?.message || 'An unexpected error occurred.' });
      setSubmitting(false);
    }
  };

  // Handle skip setup
  const handleSkipSetup = () => {
    handleFinalSubmit();
  };

  // Update field
  const updateField = (field: keyof SignUpData, value: any) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Render Step 1: Account Creation
  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Create Your Account</h3>
      <p className={styles.stepDescription}>
        Get started with AI that works autonomously — safely.
      </p>

      {/* OAuth Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          onClick={() => handleOAuth('google')}
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          onClick={() => handleOAuth('github')}
        >
          <GitHubIcon /> Continue with GitHub
        </Button>
      </div>

      {errors.oauth && (
        <div style={{ color: 'var(--color-warning-500)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
          {errors.oauth}
        </div>
      )}

      {/* Divider */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        margin: '24px 0',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        <span style={{ fontSize: '14px' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
      </div>

      {/* Email */}
      <div className={styles.formGroup}>
        <Input
          label="Email"
          type="email"
          value={signUpData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="you@company.com"
          required
          error={errors.email}
          autoFocus
        />
      </div>

      {/* Password */}
      <div className={styles.formGroup}>
        <Input
          label="Password"
          type="password"
          value={signUpData.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="At least 8 characters"
          required
          error={errors.password}
        />
        {signUpData.password && (
          <div className={`${styles.passwordStrength} ${styles[`strength-${validatePassword(signUpData.password).strength || 'weak'}`]}`}>
            <span className={styles.strengthLabel}>Strength:</span>
            <span className={styles.strengthValue}>{validatePassword(signUpData.password).strength || 'weak'}</span>
          </div>
        )}
      </div>

      {/* Terms Checkbox - Inline */}
      <div className={styles.formGroup} style={{ marginTop: '16px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          <input
            type="checkbox"
            checked={signUpData.agreeToTerms}
            onChange={(e) => updateField('agreeToTerms', e.target.checked)}
            style={{ marginTop: '2px' }}
          />
          <span>
            I agree to the{' '}
            <a href="/public/legal/terms" target="_blank" style={{ color: 'var(--color-primary-500)' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/public/legal/privacy" target="_blank" style={{ color: 'var(--color-primary-500)' }}>
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && (
          <Text variant="body-sm" color="error" style={{ marginTop: '4px', marginLeft: '28px' }}>
            {errors.terms}
          </Text>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        style={{ width: '100%', marginTop: '24px' }}
        disabled={submitting}
      >
        Create Account
      </Button>

      {/* Login Link */}
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Text variant="body-sm" color="secondary">
          Already have an account?{' '}
          <a 
            href="/login" 
            onClick={(e) => { e.preventDefault(); goToLogin(navigate); }}
            style={{ color: 'var(--color-primary-500)' }}
          >
            Sign in
          </a>
        </Text>
      </div>
    </form>
  );

  // Render Step 2: Quick Setup
  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <h3 className={styles.stepTitle}>Quick Setup</h3>
      <p className={styles.stepDescription}>
        Help us personalize your experience (optional)
      </p>

      {/* Name (Optional) */}
      <div className={styles.formGroup}>
        <Input
          label="What should we call you? (Optional)"
          type="text"
          value={signUpData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          placeholder="Your name"
        />
      </div>

      {/* Usage Type */}
      <div className={styles.formGroup} style={{ marginTop: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
          What will you use ResonantGenesis for?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'personal', label: 'Personal projects', icon: '👤' },
            { value: 'team', label: 'Team / company work', icon: '👥' },
            { value: 'exploring', label: 'Just exploring', icon: '🔍' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setUsageType(option.value as UsageType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: usageType === option.value 
                  ? '2px solid var(--color-primary-500)' 
                  : '1px solid var(--border-color)',
                background: usageType === option.value 
                  ? 'var(--color-primary-50)' 
                  : 'var(--bg-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '16px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '24px' }}>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Name */}
      <div className={styles.formGroup} style={{ marginTop: '24px' }}>
        <Input
          label="Workspace name (Optional)"
          type="text"
          value={signUpData.orgName}
          onChange={(e) => updateField('orgName', e.target.value)}
          placeholder={createDefaultOrgName(signUpData.email)}
        />
        <Text variant="body-sm" color="secondary" style={{ marginTop: '4px' }}>
          You can change this later in settings
        </Text>
      </div>

      {/* Progress */}
      {submitting && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ 
            height: '4px', 
            background: 'var(--bg-secondary)', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: 'var(--color-primary-500)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <Text variant="body-sm" color="secondary" style={{ marginTop: '8px', textAlign: 'center' }}>
            Setting up your workspace...
          </Text>
        </div>
      )}

      {/* Error */}
      {errors.submit && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'var(--color-danger-50)', 
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-danger-600)'
        }}>
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '32px',
        flexDirection: 'column'
      }}>
        <Button
          variant="primary"
          size="lg"
          style={{ width: '100%' }}
          onClick={handleFinalSubmit}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Continue to Dashboard'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          style={{ width: '100%' }}
          onClick={handleSkipSetup}
          disabled={submitting}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.signupPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Get Started Free</h1>
          <p className={styles.subtitle}>1,000 free credits. No credit card required.</p>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              <Card variant="elevated" padding="lg">
                {/* Progress Indicator */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginBottom: '32px' 
                }}>
                  {SIGNUP_STEPS.map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: index <= currentStep ? '32px' : '8px',
                        height: '8px',
                        borderRadius: '4px',
                        background: index <= currentStep 
                          ? 'var(--color-primary-500)' 
                          : 'var(--bg-secondary)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Step Content */}
                {currentStep === 0 ? renderStep1() : renderStep2()}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPageQuick;
