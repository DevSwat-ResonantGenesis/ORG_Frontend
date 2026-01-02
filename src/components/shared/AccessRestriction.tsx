/**
 * Access Restriction Component
 * Shows upgrade prompts for features that require higher tier plans
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';

interface AccessRestrictionProps {
  feature: string;
  requiredPlan: 'plus' | 'pro' | 'enterprise';
  children: React.ReactNode;
}

// User plan levels
type PlanLevel = 'guest' | 'free' | 'plus' | 'pro' | 'enterprise';

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  guest: 0,
  free: 1,
  plus: 2,
  pro: 3,
  enterprise: 4,
};

const PLAN_NAMES: Record<PlanLevel, string> = {
  guest: 'Guest',
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const PLAN_PRICES: Record<PlanLevel, string> = {
  guest: '$0',
  free: '$0',
  plus: '$29/mo',
  pro: '$99/mo',
  enterprise: 'Custom',
};

export const getUserPlan = (): PlanLevel => {
  const isLoggedIn = isAuthenticated();
  if (!isLoggedIn) return 'guest';
  
  const sessionData = getSessionData();
  const plan = sessionData?.plan || sessionData?.subscription_tier || 'free';
  
  if (plan === 'plus' || plan === 'starter') return 'plus';
  if (plan === 'pro' || plan === 'professional') return 'pro';
  if (plan === 'enterprise') return 'enterprise';
  
  return 'free';
};

export const hasAccess = (requiredPlan: PlanLevel): boolean => {
  const userPlan = getUserPlan();
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
};

export const AccessRestriction: React.FC<AccessRestrictionProps> = ({
  feature,
  requiredPlan,
  children,
}) => {
  const navigate = useNavigate();
  const userPlan = getUserPlan();
  const hasFeatureAccess = hasAccess(requiredPlan);

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  const isGuest = userPlan === 'guest';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '500px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}>
        {/* Lock Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: 'var(--text-primary, #fff)',
        }}>
          {isGuest ? 'Sign In Required' : 'Upgrade Required'}
        </h2>

        <p style={{
          color: 'var(--text-secondary, #a1a1aa)',
          marginBottom: '1.5rem',
          lineHeight: '1.6',
        }}>
          {isGuest ? (
            <>
              <strong>{feature}</strong> requires a ResonantGenesis account.
              Sign in or create a free account to continue.
            </>
          ) : (
            <>
              <strong>{feature}</strong> is available on the{' '}
              <strong>{PLAN_NAMES[requiredPlan]}</strong> plan ({PLAN_PRICES[requiredPlan]}).
              <br />
              You're currently on the <strong>{PLAN_NAMES[userPlan]}</strong> plan.
            </>
          )}
        </p>

        {/* Feature highlights */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: 'var(--text-primary, #fff)',
          }}>
            {PLAN_NAMES[requiredPlan]} Plan includes:
          </p>
          <ul style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #a1a1aa)',
            paddingLeft: '1.25rem',
            margin: 0,
          }}>
            {requiredPlan === 'plus' && (
              <>
                <li>Full Control Plane access</li>
                <li>Advanced analytics & metrics</li>
                <li>Priority support</li>
                <li>10,000 API calls/month</li>
              </>
            )}
            {requiredPlan === 'pro' && (
              <>
                <li>Everything in Plus</li>
                <li>Unlimited agents</li>
                <li>Custom integrations</li>
                <li>100,000 API calls/month</li>
              </>
            )}
            {requiredPlan === 'enterprise' && (
              <>
                <li>Everything in Pro</li>
                <li>Dedicated support</li>
                <li>Custom SLA</li>
                <li>Unlimited API calls</li>
              </>
            )}
          </ul>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}>
          {isGuest ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  background: 'transparent',
                  color: 'var(--text-primary, #fff)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/pricing')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Upgrade to {PLAN_NAMES[requiredPlan]}
              </button>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary, #a1a1aa)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Go Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessRestriction;
