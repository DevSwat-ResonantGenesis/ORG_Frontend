/**
 * Sign Up Logic
 * Comprehensive sign up flow with plan selection, validation, and payment setup
 */

import fastapiClient from '../api/fastapiClient';
import { saveSession, type UserRole } from './auth';
import { logger } from './logger';

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  orgName: string;
  plan?: string;
  billingPeriod?: 'monthly' | 'yearly';
  agreeToTerms: boolean;
}

export interface SignUpStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface PlanLimits {
  tokens: number;           // Monthly token limit
  agents: number;           // Max agents
  teams: number;            // Max teams created
  users: number;            // Max users
  memoryAnchors: number;    // Hash Sphere memory anchors
  providers: string[];      // Available AI providers
  // Decentralized Network limits
  agentExecutions: number;  // Monthly agent executions
  workflowRuns: number;     // Monthly workflow runs
  publishedAgents: number;  // Max agents published to marketplace
  storage: number;          // Storage in MB
  apiRateLimit: number;     // Requests per minute
  executionTimeout: number; // Max execution time in seconds
}

export interface PlanOption {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: PlanLimits;
  recommended?: boolean;
  category?: 'platform';
  contactSales?: boolean;   // Requires contact sales flow
  bestFor?: string;         // Target audience description
  isTrial?: boolean;        // Is this a trial plan
  trialDays?: number;       // Number of trial days
  requiresApiKey?: boolean; // Requires user's own API key (BYOK)
}

export const SIGNUP_STEPS: SignUpStep[] = [
  {
    id: 'account',
    title: 'Create Account',
    description: 'Email and password',
    completed: false,
  },
  {
    id: 'setup',
    title: 'Quick Setup',
    description: 'Tell us about yourself',
    completed: false,
  },
];

// Legacy 5-step flow for reference
export const SIGNUP_STEPS_LEGACY: SignUpStep[] = [
  {
    id: 'account',
    title: 'Create Account',
    description: 'Enter your personal information',
    completed: false,
  },
  {
    id: 'organization',
    title: 'Organization',
    description: 'Set up your organization',
    completed: false,
  },
  {
    id: 'plan',
    title: 'Choose Plan',
    description: 'Select your subscription plan',
    completed: false,
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Add payment method (if required)',
    completed: false,
  },
  {
    id: 'verify',
    title: 'Review & Terms',
    description: 'Review your information and agree to terms',
    completed: false,
  },
];

/**
 * ResonantGenesis Pricing Tiers - Source of Truth
 * All plans include: Hash Sphere, Resonant Chat, Agent Console, IDE & Compute, Workflows, RARA Governance, Blockchain Audit, Code Visualizer, Marketplace
 * Usage is metered via Resonant Credits (1 credit ≈ $0.001)
 */
export const PLANS: PlanOption[] = [
  // Developer - Free Forever
  {
    id: 'developer',
    name: 'Developer',
    category: 'platform',
    price: { monthly: 0, yearly: 0 },
    bestFor: 'Solo builders exploring ResonantGenesis',
    isTrial: false,
    requiresApiKey: false,
    limits: {
      tokens: 10000,         // 10,000 credits/month (no rollover, top-ups available)
      agents: -1,            // Unlimited - we bill by credits only
      teams: -1,             // Unlimited - we bill by credits only
      users: 1,
      memoryAnchors: 10,
      providers: ['openai', 'gemini', 'claude'],
      agentExecutions: 100,
      workflowRuns: 10,
      publishedAgents: 0,
      storage: 100,          // 100 MB
      apiRateLimit: 10,
      executionTimeout: 30,
    },
    features: [
      'Free forever',
      '10,000 credits/month',
      'Unlimited agents (billed by credits)',
      'Unlimited conversations (limited by credits only)',
      '100 MB storage, 5 RAG documents',
      '10 compute hours/month',
      'Manual kill switch, 5 basic invariants',
      'No Hash Sphere Memory standalone',
      'No Code Visualizer',
      'Community support only',
    ],
  },
  // Plus - $49/month (RECOMMENDED)
  {
    id: 'plus',
    name: 'Plus',
    category: 'platform',
    price: { monthly: 49, yearly: 490 },
    recommended: true,
    bestFor: 'Serious builders and power users',
    limits: {
      tokens: 75000,         // 75,000 credits/month (rollover up to 37.5K, top-ups $8/10K)
      agents: -1,            // Unlimited agents (credits-only billing)
      agentTeams: -1,        // Unlimited agent teams (agents working together)
      userTeams: 0,          // No user teams (single user only)
      users: 1,              // Single user only
      memoryAnchors: -1,     // Unlimited (credits-only)
      providers: ['openai', 'gemini', 'claude', 'mistral', 'groq'],
      agentExecutions: -1,   // Unlimited (credits-only)
      workflowRuns: -1,      // Unlimited (credits-only)
      publishedAgents: -1,   // Unlimited (credits-only)
      storage: 5000,         // 5 GB
      apiRateLimit: 100,
      executionTimeout: 120,
    },
    features: [
      '75,000 credits/month',
      'Rollover up to 37.5K credits',
      'Top-ups: $8/10K credits',
      'Unlimited agents (credits-only)',
      'Unlimited agent teams (agents working together)',
      'Individual account (no user teams)',
      'Unlimited conversations (credits-only)',
      'Evidence graph access',
      'Hash Sphere Memory: 1 Universe',
      'Code Visualizer: graphs + dependency analysis',
      'Email + Slack support',
    ],
  },
  // Enterprise - Custom Pricing
  {
    id: 'enterprise',
    name: 'Enterprise',
    category: 'platform',
    price: { monthly: 0, yearly: 0 },  // Custom pricing
    contactSales: true,
    bestFor: 'Organizations running AI as critical infrastructure',
    limits: {
      tokens: -1,            // Custom
      agents: -1,            // Unlimited
      teams: -1,             // Unlimited with hierarchies
      users: -1,             // Unlimited
      memoryAnchors: -1,     // Unlimited
      providers: ['openai', 'gemini', 'claude', 'mistral', 'groq', 'local', 'custom'],
      agentExecutions: -1,   // Unlimited
      workflowRuns: -1,      // Unlimited
      publishedAgents: -1,   // Unlimited
      storage: -1,           // 100 GB+
      apiRateLimit: -1,      // Custom
      executionTimeout: -1,  // Custom
    },
    features: [
      'Custom credits (tailored to your needs)',
      'Unlimited agents with full autonomous mode',
      'Agent team hierarchies',
      'Unlimited conversations, custom models',
      '100 GB+ storage, unlimited RAG documents',
      'Unlimited compute hours, custom runtimes',
      'Full + Custom AI assistance',
      'SLA-backed kill switch, custom invariants, unlimited snapshots',
      'Hash Sphere Memory: Multi Universe + Multi-layer',
      'Code Visualizer: full access + CI integration',
      'Hash Sphere API access',
      'Dedicated engineers, architecture guidance',
      '99.9% SLA guarantee',
      'SOC2, HIPAA, GDPR compliance',
      'On-premise/hybrid deployment option',
    ],
  },
];

/**
 * Token pack add-ons available for all tiers
 * New pricing: Better value at scale
 */
export const TOKEN_PACKS = [
  { id: 'starter', tokens: 5000, price: 5, label: '5K credits', perK: 1.00, name: 'Starter Pack', popular: false },
  { id: 'basic', tokens: 10000, price: 8, label: '10K credits', perK: 0.80, name: 'Basic Pack', popular: false },
  { id: 'growth', tokens: 50000, price: 35, label: '50K credits', perK: 0.70, name: 'Growth Pack', popular: true },
  { id: 'scale', tokens: 100000, price: 60, label: '100K credits', perK: 0.60, name: 'Scale Pack', popular: false },
  { id: 'enterprise', tokens: 500000, price: 250, label: '500K credits', perK: 0.50, name: 'Enterprise Pack', popular: false },
];

/**
 * Feature add-ons available for paid plans
 * Can be added to Pro, Team, or Enterprise
 */
export const FEATURE_ADDONS = [
  // Capacity add-ons
  { id: 'addon-agents-10', category: 'capacity', name: '+10 Agents', price: 10, unit: 'month', description: 'Add 10 more agents to your plan' },
  { id: 'addon-agents-50', category: 'capacity', name: '+50 Agents', price: 40, unit: 'month', description: 'Add 50 more agents to your plan' },
  { id: 'addon-users-5', category: 'capacity', name: '+5 Users', price: 25, unit: 'month', description: 'Add 5 more team members' },
  { id: 'addon-users-20', category: 'capacity', name: '+20 Users', price: 80, unit: 'month', description: 'Add 20 more team members' },
  { id: 'addon-teams-5', category: 'capacity', name: '+5 Teams', price: 15, unit: 'month', description: 'Add 5 more teams' },
  { id: 'addon-storage-10gb', category: 'capacity', name: '+10GB Storage', price: 5, unit: 'month', description: 'Add 10GB storage' },
  { id: 'addon-storage-100gb', category: 'capacity', name: '+100GB Storage', price: 40, unit: 'month', description: 'Add 100GB storage' },
  
  // Feature add-ons
  { id: 'addon-priority-queue', category: 'feature', name: 'Priority Execution', price: 20, unit: 'month', description: 'Priority execution queue for faster agent runs' },
  { id: 'addon-sso', category: 'feature', name: 'SSO/SAML', price: 50, unit: 'month', description: 'Single sign-on with your identity provider' },
  { id: 'addon-audit-logs', category: 'feature', name: 'Advanced Audit Logs', price: 30, unit: 'month', description: '90-day audit log retention with export' },
  { id: 'addon-custom-domain', category: 'feature', name: 'Custom Domain', price: 25, unit: 'month', description: 'Use your own domain for agent URLs' },
  { id: 'addon-webhook-pro', category: 'feature', name: 'Advanced Webhooks', price: 15, unit: 'month', description: 'Webhook retries, filtering, and transformations' },
  { id: 'addon-api-unlimited', category: 'feature', name: 'Unlimited API Rate', price: 100, unit: 'month', description: 'Remove API rate limits' },
  
  // Governance add-ons
  { id: 'addon-blockchain-audit', category: 'governance', name: 'Blockchain Audit Trail', price: 75, unit: 'month', description: 'Immutable audit trail on blockchain' },
  { id: 'addon-compliance-reports', category: 'governance', name: 'Compliance Reports', price: 50, unit: 'month', description: 'SOC2, HIPAA, GDPR compliance reports' },
  { id: 'addon-rara-enforcement', category: 'governance', name: 'RARA Governance', price: 100, unit: 'month', description: 'Full RARA governance enforcement' },
];

/**
 * Personal domains for auto-org naming
 */
export const PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'protonmail.com', 'mail.com', 'aol.com',
  'live.com', 'msn.com', 'ymail.com', 'me.com'
];

/**
 * Auto-create organization name from email
 */
export const createDefaultOrgName = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  const username = email.split('@')[0] || 'user';
  
  if (PERSONAL_DOMAINS.includes(domain)) {
    // Personal email: use username's workspace
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    return `${cleanUsername}'s Workspace`;
  }
  
  // Business email: use company name
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1) + ' Team';
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  // Check password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  if (strength === 'weak') {
    return { valid: false, error: 'Password is too weak. Use a mix of letters, numbers, and special characters', strength };
  }
  
  return { valid: true, strength };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): { valid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { valid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  
  return { valid: true };
};

/**
 * Validate organization name
 */
export const validateOrgName = (orgName: string): { valid: boolean; error?: string } => {
  if (!orgName.trim()) {
    return { valid: false, error: 'Organization name is required' };
  }
  
  if (orgName.trim().length < 2) {
    return { valid: false, error: 'Organization name must be at least 2 characters' };
  }
  
  if (orgName.trim().length > 255) {
    return { valid: false, error: 'Organization name must be less than 255 characters' };
  }
  
  // Check for valid characters (alphanumeric, spaces, hyphens, underscores)
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validPattern.test(orgName.trim())) {
    return { valid: false, error: 'Organization name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  
  return { valid: true };
};

/**
 * Validate full sign up data
 */
export const validateSignUpData = (data: SignUpData): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error || 'Invalid email';
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || 'Invalid password';
  }
  
  // Validate password confirmation
  const confirmValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  if (!confirmValidation.valid) {
    errors.confirmPassword = confirmValidation.error || 'Passwords do not match';
  }
  
  // Validate organization name
  const orgValidation = validateOrgName(data.orgName);
  if (!orgValidation.valid) {
    errors.orgName = orgValidation.error || 'Invalid organization name';
  }
  
  // Validate terms agreement
  if (!data.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms of service and privacy policy';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Check if email already exists
 */
export const checkEmailExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
  try {
    // Try to login to check if account exists
    // If login fails with 401, account doesn't exist (or wrong password)
    // If login fails with 404, account doesn't exist
    // We'll use a different approach - try signup and catch the error
    
    // Actually, better to create a dedicated endpoint for this
    // For now, we'll handle it during signup
    return { exists: false };
  } catch (error: any) {
    logger.error('Error checking email', error);
    return { exists: false };
  }
};

/**
 * Create user account and organization
 */
export const createAccount = async (data: SignUpData): Promise<{
  success: boolean;
  user_id?: string;
  org_id?: string;
  error?: string;
}> => {
  try {
    const response = await fastapiClient.post(
      '/auth/register',
      {
        email: data.email.trim(),
        password: data.password,
        full_name: data.fullName.trim() || undefined,
        org_name: data.orgName.trim(),
      },
      {
        withCredentials: true,
        timeout: 15000,
      }
    );
    
    return {
      success: true,
      user_id: response.data.user_id,
      org_id: response.data.org_id,
    };
  } catch (error: any) {
    logger.error('Account creation error', error);
    
    if (error?.response?.status === 400) {
      const detail = error?.response?.data?.detail || 'Invalid signup data';
      return {
        success: false,
        error: typeof detail === 'string' ? detail : 'Invalid signup data. Please check your information.',
      };
    }
    
    if (error?.response?.status === 409) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }
    
    if (error?.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout. Please try again.',
      };
    }
    
    return {
      success: false,
      error: error?.response?.data?.detail || error?.message || 'Account creation failed. Please try again.',
    };
  }
};

/**
 * Auto-login after signup
 */
export const autoLoginAfterSignup = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  access_token?: string;
  role?: string;
  org_id?: string;
  error?: string;
}> => {
  try {
    const response = await fastapiClient.post(
      '/auth/login',
      {
        email: email.trim(),
        password,
      },
      {
        withCredentials: true,
        timeout: 10000,
      }
    );
    
    if (response.data?.access_token && response.data?.role && response.data?.org_id) {
      return {
        success: true,
        access_token: response.data.access_token,
        role: response.data.role,
        org_id: response.data.org_id,
      };
    }
    
    return {
      success: false,
      error: 'Login response missing required data',
    };
  } catch (error: any) {
    logger.error('Auto-login error', error);
    
    return {
      success: false,
      error: error?.response?.data?.detail || error?.message || 'Auto-login failed',
    };
  }
};

/**
 * Complete sign up flow
 */
export const completeSignUp = async (
  data: SignUpData,
  onProgress?: (step: string, progress: number) => void
): Promise<{
  success: boolean;
  user_id?: string;
  org_id?: string;
  access_token?: string;
  role?: string;
  error?: string;
  step?: string;
}> => {
  // Step 1: Validate data
  onProgress?.('validate', 10);
  const validation = validateSignUpData(data);
  if (!validation.valid) {
    return {
      success: false,
      error: Object.values(validation.errors)[0] || 'Validation failed',
    };
  }
  
  // Step 2: Create account
  onProgress?.('create', 30);
  const accountResult = await createAccount(data);
  if (!accountResult.success) {
    return {
      success: false,
      error: accountResult.error || 'Account creation failed',
      step: 'create',
    };
  }
  
  // Step 3: Auto-login
  onProgress?.('login', 60);
  const loginResult = await autoLoginAfterSignup(data.email, data.password);
  if (!loginResult.success) {
    return {
      success: false,
      error: loginResult.error || 'Auto-login failed. Please try logging in manually.',
      step: 'login',
      user_id: accountResult.user_id,
      org_id: accountResult.org_id,
    };
  }
  
  // Step 4: Save session
  onProgress?.('session', 80);
  if (loginResult.access_token && loginResult.role && loginResult.org_id) {
    saveSession(
      loginResult.access_token,
      data.email.trim(),
      loginResult.role as UserRole,
      loginResult.org_id
    );
  }
  
  // Step 5: Plan selection and assignment (optional - non-blocking)
  onProgress?.('plan', 90);
  const planDetails = data.plan ? getPlanDetails(data.plan) : undefined;
  const isContactSalesPlan = planDetails?.contactSales || data.plan === 'enterprise' || data.plan === 'private-cloud';
  
  if (data.plan && !isContactSalesPlan) {
    try {
      // Assign plan to organization using billing API
      // This is optional - if it fails, user can set plan later in settings
      const { changePlan } = await import('@/api/billing');
      const billingPeriod = data.billingPeriod || 'monthly';
      
      // Send plan info with limits
      const planData: any = {};
      if (planDetails?.limits) {
        planData.limits = planDetails.limits;
      }
      
      await changePlan(data.plan, billingPeriod, planData);
      
      logger.info('Plan assigned successfully', { 
        plan: data.plan, 
        billingPeriod,
        limits: planDetails?.limits,
        org_id: accountResult.org_id 
      });
    } catch (error: any) {
      // Plan assignment is optional - don't fail signup
      // User can set up billing/plan later in settings
      logger.warn('Plan assignment skipped (optional)', { 
        plan: data.plan,
        error: error?.response?.data?.detail || error?.message || 'Unknown error',
        org_id: accountResult.org_id 
      });
      // Continue signup - plan can be set up later
    }
  } else if (isContactSalesPlan) {
    // Enterprise/Private Cloud plans require manual setup - redirect to contact
    logger.info('Enterprise plan selected - requires contact sales', { 
      plan: data.plan,
      org_id: accountResult.org_id 
    });
  }
  
  onProgress?.('complete', 100);
  
  return {
    success: true,
    user_id: accountResult.user_id,
    org_id: accountResult.org_id,
    access_token: loginResult.access_token,
    role: loginResult.role,
  };
};

/**
 * Get plan details
 */
export const getPlanDetails = (planId: string): PlanOption | undefined => {
  return PLANS.find(plan => plan.id === planId);
};

/**
 * Get user access based on plan
 * Returns access permissions and limits for the selected plan
 */
export const getPlanAccess = (planId: string): {
  maxUsers: number;
  maxTokens: number;
  maxAgents: number;
  maxTeams: number;
  maxAnchors: number;
  features: string[];
  providers: string[];
  limits: PlanLimits | null;
} => {
  const plan = getPlanDetails(planId);
  
  if (!plan) {
    // Default access for unknown plans
    return {
      maxUsers: 1,
      maxTokens: 0,
      maxAgents: 0,
      maxTeams: 0,
      maxAnchors: 0,
      features: [],
      providers: [],
      limits: null,
    };
  }

  // Use plan limits directly
  const limits = plan.limits;
  const isUnlimited = (value: number) => value === -1;

  return {
    maxUsers: isUnlimited(limits.users) ? Infinity : limits.users,
    maxTokens: isUnlimited(limits.tokens) ? Infinity : limits.tokens,
    maxAgents: isUnlimited(limits.agents) ? Infinity : limits.agents,
    maxTeams: isUnlimited(limits.teams) ? Infinity : limits.teams,
    maxAnchors: isUnlimited(limits.memoryAnchors) ? Infinity : limits.memoryAnchors,
    features: plan.features,
    providers: limits.providers,
    limits: limits,
  };
};

/**
 * Calculate annual savings
 */
export const calculateAnnualSavings = (monthlyPrice: number): number => {
  const yearlyPrice = monthlyPrice * 12;
  const discountedYearly = yearlyPrice * 0.83; // 17% discount
  return yearlyPrice - discountedYearly;
};

/**
 * Format price for display
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  if (price === 0) return 'Free';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

/**
 * Check if plan requires payment
 */
export const requiresPayment = (planId: string): boolean => {
  return planId !== 'enterprise';
};

/**
 * Get signup redirect path based on plan
 */
export const getSignupRedirectPath = (planId: string, role: string): string => {
  // If enterprise plan, redirect to contact for manual setup
  if (planId === 'enterprise') {
    return '/contact?plan=enterprise';
  }
  
  // All other plans need payment setup - redirect to billing
  return '/billing?setup=payment';
};

/**
 * Usage-based pricing for pay-as-you-go features
 */
export const USAGE_PRICING = {
  tokens: { perK: 0.002, unit: '1K tokens' },
  agentExecutions: { perUnit: 0.01, unit: 'execution' },
  agentExecution: 0.01, // Simple number for display
  workflowRuns: { perUnit: 0.05, unit: 'run' },
  workflowRun: 0.05, // Simple number for display
  storage: { perGB: 0.10, unit: 'GB/month' },
  storagePerGB: 0.10, // Simple number for display
  apiCalls: { perK: 0.001, unit: '1K calls' },
  computePerSecond: 0.0001, // Simple number for display
};

/**
 * Marketplace commission rates
 */
export const MARKETPLACE_COMMISSION = {
  standard: 0.15, // 15% commission
  premium: 0.10,  // 10% for premium sellers
  enterprise: 0.05, // 5% for enterprise partners
  oneTimePurchase: 0.20, // 20% for one-time purchases
  subscription: 0.15, // 15% for subscriptions
  perExecution: 0.10, // 10% for per-execution pricing
  enterpriseLicense: 0.05, // 5% for enterprise licenses
};

/**
 * Compute credits for agent execution
 */
export const COMPUTE_CREDITS = [
  { id: 'basic', credits: 1000, price: 5, savings: '17%', description: 'Basic agent execution' },
  { id: 'standard', credits: 5000, price: 20, savings: '20%', description: 'Standard agent with tools' },
  { id: 'advanced', credits: 25000, price: 75, savings: '25%', description: 'Advanced multi-step agent' },
  { id: 'enterprise', credits: 100000, price: 250, savings: '30%', description: 'Enterprise agent with full capabilities' },
];

