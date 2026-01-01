import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import { saveSessionData, clearSessionData, type UserRole } from '../../utils/auth-cookies';
import { ScrollReveal } from '@/components/features/landing/ScrollReveal';
import {
  SIGNUP_STEPS,
  PLANS,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateOrgName,
  validateSignUpData,
  completeSignUp,
  formatPrice,
  requiresPayment,
  getSignupRedirectPath,
  type SignUpData,
} from '../../utils/signupLogic';
import { validateApiKey, API_KEY_PROVIDERS } from '../../api/userApiKeys';
import { logger } from '../../utils/logger';
import { goToDashboard, goToLogin } from '../../utils/navigation';
// CSS Import Order: Global theme CSS first, then CSS Module
// This ensures base styles load before scoped form styles
// CSS Module prevents style conflicts with other forms on the platform
import '../../theme/pages.css';                    // Global page layout styles (base styles)
import styles from './SignupPageEnhanced-2025.module.css';  // Scoped form styles (prevents conflicts)

const SignupPageEnhanced = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    orgName: '',
    plan: 'free-trial',  // Default to free trial
    billingPeriod: 'monthly',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // API Key state for free trial
  const [apiKeyProvider, setApiKeyProvider] = useState('openai');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);
  
  // Check if selected plan requires API key
  const selectedPlan = PLANS.find(p => p.id === signUpData.plan);
  const requiresApiKey = selectedPlan?.requiresApiKey || false;

  // Clear any stale session data on signup page load
  useEffect(() => {
    clearSessionData();
  }, []);

  // Handle plan selection from pricing page navigation state
  useEffect(() => {
    if (location.state && typeof location.state === 'object') {
      const state = location.state as any;
      if (state.plan) {
        // Map pricing page plan format to signup plan format
        const planMap: Record<string, string> = {
          // Platform plans (direct match)
          'starter': 'starter',
          'professional': 'professional',
          'business': 'business',
          'enterprise': 'enterprise',
          // Resonant Chat plans
          'chat-starter': 'chat-starter',
          'chat-pro': 'chat-pro',
          'chat-team': 'chat-team',
          'chat-business': 'chat-business',
          'chat-enterprise': 'chat-enterprise',
          // Legacy mappings
          'personal-starter': 'chat-starter',
          'personal-pro': 'chat-pro',
          'business-team': 'chat-team',
          'business-business': 'chat-business',
          'business-enterprise': 'chat-enterprise',
        };
        const mappedPlan = planMap[state.plan] || state.plan;
        const foundPlan = PLANS.find(p => p.id === mappedPlan);
        if (foundPlan) {
          setSignUpData(prev => ({ 
            ...prev, 
            plan: mappedPlan,
            billingPeriod: state.billingPeriod || 'monthly'
          }));
          // Set billing period if provided
          if (state.billingPeriod) {
            setBillingPeriod(state.billingPeriod);
          }
          // Auto-advance to plan selection step
          setCurrentStep(2);
        } else {
          // If plan not found, still set it and advance (might be a new plan)
          setSignUpData(prev => ({ 
            ...prev, 
            plan: state.plan,
            billingPeriod: state.billingPeriod || 'monthly'
          }));
          if (state.billingPeriod) {
            setBillingPeriod(state.billingPeriod);
          }
          setCurrentStep(2);
        }
      }
    }
  }, [location.state]);

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      // Account step
      const emailValidation = validateEmail(signUpData.email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.error || 'Invalid email';
      }

      const passwordValidation = validatePassword(signUpData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.error || 'Invalid password';
      }

      const confirmValidation = validatePasswordConfirmation(
        signUpData.password,
        signUpData.confirmPassword
      );
      if (!confirmValidation.valid) {
        newErrors.confirmPassword = confirmValidation.error || 'Passwords do not match';
      }
    } else if (currentStep === 1) {
      // Organization step
      const orgValidation = validateOrgName(signUpData.orgName);
      if (!orgValidation.valid) {
        newErrors.orgName = orgValidation.error || 'Invalid organization name';
      }
    } else if (currentStep === 2) {
      // Plan step - validate API key if free trial selected
      if (signUpData.plan === 'free-trial' && requiresApiKey) {
        if (!apiKeyInput.trim()) {
          newErrors.apiKey = 'API key is required for free trial. Please enter your provider API key.';
        } else if (!apiKeyValid) {
          newErrors.apiKey = 'Please validate your API key before continuing.';
        }
      }
    } else if (currentStep === 3) {
      // Payment step - handled separately
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Skip payment step if enterprise plan
    if (currentStep === 2 && signUpData.plan === 'enterprise') {
      setCurrentStep(4); // Skip to verify step
      return;
    }

    // Skip payment step if already on verify
    if (currentStep === 3 && signUpData.plan === 'enterprise') {
      setCurrentStep(4);
      return;
    }

    if (currentStep < SIGNUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDevSignup = async () => {
    if (!import.meta.env.DEV) return;

    // Clear previous errors
    setErrors({});

    // Basic validation for email/password
    const emailValidation = validateEmail(signUpData.email);
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.error || 'Invalid email' });
      return;
    }

    // For dev mode, just check password is at least 6 chars
    if (!signUpData.password || signUpData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    // Check passwords match (if confirm password is provided)
    if (signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        email: signUpData.email.trim(),
        password: signUpData.password,
        full_name: signUpData.fullName || 'Dev User',
        org_name: signUpData.orgName || 'Dev Organization',
      };

      const { data } = await fastapiClient.post<{
        access_token: string;
        org_id: string;
        role: UserRole;
      }>('/auth/dev-create-user', payload, { withCredentials: true });

      saveSessionData(signUpData.email.trim(), data.role, data.org_id);
      goToDashboard(navigate);
    } catch (error: any) {
      logger.error('Dev signup error', error);
      setErrors({ submit: error?.message || 'Dev signup failed. Check backend logs.' });
      setSubmitting(false);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    // Final validation
    const validation = validateSignUpData(signUpData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    setProgress(0);

    try {
      const result = await completeSignUp(signUpData, (step, progressValue) => {
        setProgress(progressValue);
      });

      if (result.success) {
        // Redirect based on plan
        const redirectPath = getSignupRedirectPath(signUpData.plan || 'starter', result.role || 'user');
        navigate(redirectPath);
      } else {
        setErrors({ submit: result.error || 'Sign up failed. Please try again.' });
        setSubmitting(false);
      }
    } catch (error: any) {
      logger.error('Sign up error', error);
      setErrors({ submit: error?.message || 'An unexpected error occurred. Please try again.' });
      setSubmitting(false);
    }
  };

  // Update sign up data
  const updateField = (field: keyof SignUpData, value: any) => {
    setSignUpData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Account
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Create Your Account</h3>
            <p className={styles.stepDescription}>
              Enter your personal information to get started
            </p>

            <div className={styles.formGroup}>
              <Input
                label="Full Name (Optional)"
                type="text"
                value={signUpData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
                error={errors.fullName}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Email *"
                type="email"
                value={signUpData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="you@example.com"
                required
                error={errors.email}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Password *"
                type="password"
                value={signUpData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters"
                required
                error={errors.password}
              />
              {signUpData.password && (
                <div className={`${styles.passwordStrength} ${styles[`strength-${validatePassword(signUpData.password).strength || 'weak'}`]}`}>
                  <span className={styles.strengthLabel}>Password strength:</span>
                  <span className={styles.strengthValue}>{validatePassword(signUpData.password).strength || 'weak'}</span>
                  {validatePassword(signUpData.password).strength === 'weak' && (
                    <span className={styles.strengthHint}> - Use a mix of letters, numbers, and special characters</span>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Confirm Password *"
                type="password"
                value={signUpData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Re-enter your password"
                required
                error={errors.confirmPassword}
              />
            </div>

            {/* Dev-only quick signup (local testing) */}
            {import.meta.env.DEV && (
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDevSignup}
                  disabled={submitting}
                >
                  Dev: Create local account and sign in
                </Button>
              </div>
            )}
          </div>
        );

      case 1: // Organization
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Set Up Your Organization</h3>
            <p className={styles.stepDescription}>
              Create your organization to get started
            </p>

            <div className={styles.formGroup}>
              <Input
                label="Organization Name *"
                type="text"
                value={signUpData.orgName}
                onChange={(e) => updateField('orgName', e.target.value)}
                placeholder="My Company"
                required
                error={errors.orgName}
              />
              <Text variant="body-sm" color="secondary" style={{ marginTop: '8px' }}>
                This will be your workspace name. You can change it later.
              </Text>
            </div>
          </div>
        );

      case 2: // Plan
        // Helper to format limits
        const formatLimit = (value: number) => {
          if (value === -1) return 'Unlimited';
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
          return `${value}`;
        };
        
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Choose Your Plan</h3>
            <p className={styles.stepDescription}>
              All plans include cryptographic login, dual-encrypted memory, and DSID-P governance.
            </p>

            <div className={styles.billingToggle}>
              <button
                className={billingPeriod === 'monthly' ? styles.active : ''}
                onClick={() => {
                  setBillingPeriod('monthly');
                  updateField('billingPeriod', 'monthly');
                }}
              >
                Monthly
              </button>
              <button
                className={billingPeriod === 'yearly' ? styles.active : ''}
                onClick={() => {
                  setBillingPeriod('yearly');
                  updateField('billingPeriod', 'yearly');
                }}
              >
                Yearly
                <span className={styles.savingsBadge}>Save 17%</span>
              </button>
            </div>

            {/* Platform Plans */}
            <div className={styles.plansGrid}>
              {PLANS.map((plan) => {
                const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
                const isSelected = signUpData.plan === plan.id;
                const isContactSales = plan.contactSales;

                return (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${isSelected ? styles.selected : ''} ${plan.recommended ? styles.recommended : ''}`}
                    onClick={() => updateField('plan', plan.id)}
                  >
                    {plan.recommended && (
                      <div className={styles.recommendedBadge}>Recommended</div>
                    )}
                    <h4 className={styles.planName}>{plan.name}</h4>
                    <div className={styles.planPrice}>
                      {isContactSales ? (
                        <span>Starting at {formatPrice(price)}</span>
                      ) : (
                        <>
                          {formatPrice(price)}
                          <span className={styles.planPeriod}>
                            {billingPeriod === 'monthly' ? '/month' : '/year'}
                          </span>
                        </>
                      )}
                    </div>
                    {plan.bestFor && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {plan.bestFor}
                      </p>
                    )}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      flexWrap: 'wrap', 
                      marginBottom: '12px',
                      fontSize: '11px'
                    }}>
                      <span style={{ 
                        background: 'var(--bg-secondary)', 
                        padding: '4px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {formatLimit(plan.limits.tokens)} tokens
                      </span>
                      <span style={{ 
                        background: 'var(--bg-secondary)', 
                        padding: '4px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {formatLimit(plan.limits.agents)} agents
                      </span>
                      <span style={{ 
                        background: 'var(--bg-secondary)', 
                        padding: '4px 8px', 
                        borderRadius: '4px' 
                      }}>
                        {formatLimit(plan.limits.teams)} teams
                      </span>
                    </div>
                    <ul className={styles.planFeatures}>
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                      {plan.features.length > 5 && (
                        <li style={{ color: 'var(--color-primary-500)' }}>
                          +{plan.features.length - 5} more
                        </li>
                      )}
                    </ul>
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="md"
                      style={{ width: '100%', marginTop: '16px' }}
                    >
                      {isSelected ? 'Selected' : isContactSales ? 'Contact Sales' : 'Select Plan'}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* API Key Input for Free Trial */}
            {requiresApiKey && signUpData.plan === 'free-trial' && (
              <div style={{ 
                marginTop: '32px', 
                padding: '24px', 
                background: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-primary-500)'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  🔑 Add Your API Key
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Free trial requires your own API key. Your key is encrypted and only used for your requests.
                </p>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    Provider
                  </label>
                  <select
                    value={apiKeyProvider}
                    onChange={(e) => {
                      setApiKeyProvider(e.target.value);
                      setApiKeyValid(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  >
                    {API_KEY_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setApiKeyValid(false);
                    }}
                    placeholder={API_KEY_PROVIDERS.find(p => p.id === apiKeyProvider)?.placeholder || 'Enter your API key'}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${apiKeyValid ? 'var(--color-success-500)' : 'var(--border-color)'}`,
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                  <a
                    href={API_KEY_PROVIDERS.find(p => p.id === apiKeyProvider)?.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: 'var(--color-primary-500)', marginTop: '4px', display: 'inline-block' }}
                  >
                    Get your {API_KEY_PROVIDERS.find(p => p.id === apiKeyProvider)?.name} API key →
                  </a>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    if (!apiKeyInput.trim()) {
                      setErrors({ ...errors, apiKey: 'Please enter an API key' });
                      return;
                    }
                    setApiKeyValidating(true);
                    try {
                      const result = await validateApiKey(apiKeyProvider, apiKeyInput.trim());
                      if (result.valid) {
                        setApiKeyValid(true);
                        setErrors({ ...errors, apiKey: '' });
                      } else {
                        setErrors({ ...errors, apiKey: result.error || 'Invalid API key' });
                      }
                    } catch (err: any) {
                      setErrors({ ...errors, apiKey: err?.message || 'Validation failed' });
                    } finally {
                      setApiKeyValidating(false);
                    }
                  }}
                  disabled={apiKeyValidating || !apiKeyInput.trim()}
                >
                  {apiKeyValidating ? 'Validating...' : apiKeyValid ? '✓ Valid' : 'Validate Key'}
                </Button>

                {errors.apiKey && (
                  <div style={{ color: 'var(--color-danger-500)', fontSize: '12px', marginTop: '8px' }}>
                    {errors.apiKey}
                  </div>
                )}

                {apiKeyValid && (
                  <div style={{ color: 'var(--color-success-500)', fontSize: '12px', marginTop: '8px' }}>
                    ✓ API key validated successfully
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3: // Payment
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Payment Information</h3>
            <p className={styles.stepDescription}>
              Add your payment method to complete signup
            </p>

            <div className={styles.paymentInfo}>
              <Text variant="body" color="secondary">
                Payment setup will be handled after account creation. You can add your payment
                method in the billing settings.
              </Text>
            </div>
          </div>
        );

      case 4: // Verify & Terms
        const selectedPlan = PLANS.find(p => p.id === signUpData.plan);
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Almost Done!</h3>
            <p className={styles.stepDescription}>
              Review your information and agree to our terms
            </p>

            <div className={styles.reviewSection}>
              <div className={styles.reviewItem}>
                <strong>Email:</strong> {signUpData.email}
              </div>
              <div className={styles.reviewItem}>
                <strong>Organization:</strong> {signUpData.orgName}
              </div>
              <div className={styles.reviewItem}>
                <strong>Plan:</strong> {selectedPlan?.name || 'Starter'}
                {selectedPlan && (
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    ({signUpData.billingPeriod === 'yearly' ? 'Yearly' : 'Monthly'})
                  </span>
                )}
              </div>
            </div>

            <div className={styles.termsSection}>
              <div className={styles.termsCard}>
                <div className={styles.termsHeader}>
                  <h4 className={styles.termsTitle}>Terms & Conditions</h4>
                </div>
                <div className={styles.termsContent}>
                  <p className={styles.termsText}>
                    By creating an account, you agree to our Terms of Service and Privacy Policy. 
                    Please review these documents carefully before proceeding.
                  </p>
                  <div className={styles.termsLinks}>
                    <a 
                      href="/public/legal/terms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.termsLink}
                    >
                      Read Terms of Service
                    </a>
                    <a 
                      href="/public/legal/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.termsLink}
                    >
                      Read Privacy Policy
                    </a>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={signUpData.agreeToTerms}
                    onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>
                    I have read and agree to the{' '}
                    <a href="/public/legal/terms" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/public/legal/privacy" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <Text variant="body-sm" color="error" style={{ marginTop: '8px', marginLeft: '26px' }}>
                    {errors.agreeToTerms}
                  </Text>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Create Your Account</h1>
          <p className={styles.subtitle}>Sign up to get started with ResonantGenesis</p>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              <Card variant="elevated" padding="lg">
            {/* Progress Steps */}
            <div className={styles.progressSteps}>
              {SIGNUP_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`${styles.progressStep} ${index <= currentStep ? styles.completed : ''} ${index === currentStep ? styles.active : ''}`}
                >
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div className={styles.stepDescription}>{step.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {submitting && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className={styles.errorMessage}>
                {errors.submit}
              </div>
            )}

            {/* Step Content */}
            <div className={styles.stepContainer}>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className={styles.navigationButtons}>
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handlePrevious}
                  disabled={submitting}
                >
                  Previous
                </Button>
              )}
              <div className={styles.spacer} />
              {currentStep < SIGNUP_STEPS.length - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={submitting || !signUpData.agreeToTerms}
                >
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className={styles.loginLink}>
              <Text variant="body-sm" color="secondary">
                Already have an account?{' '}
                <a href="/login" onClick={(e) => { e.preventDefault(); goToLogin(navigate); }}>
                  Sign in
                </a>
              </Text>
            </div>
          </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPageEnhanced;

