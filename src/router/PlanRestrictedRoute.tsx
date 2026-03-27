/**
 * Plan-Restricted Route Component
 * Restricts access to routes based on user's subscription plan
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '../utils/auth-cookies';

interface PlanRestrictedRouteProps {
  children: React.ReactNode;
  requiredPlan: 'free' | 'developer' | 'plus' | 'enterprise';
  redirectTo?: string;
}

type PlanLevel = 'guest' | 'free' | 'developer' | 'plus' | 'enterprise';

const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  guest: 0,
  free: 1,
  developer: 2,
  plus: 3,
  enterprise: 4,
};

const getUserPlan = (): PlanLevel => {
  if (!isAuthenticated()) return 'guest';
  
  const sessionData = getSessionData();
  
  // Superusers and platform owners always have enterprise access
  if (sessionData?.is_superuser || sessionData?.role === 'platform_owner') {
    console.log('[PlanRestrictedRoute] Superuser/platform_owner detected - granting enterprise access');
    return 'enterprise';
  }
  
  const plan = sessionData?.plan || sessionData?.subscription_tier || 'free';
  
  // Map legacy plan names to new names
  if (plan === 'plus' || plan === 'starter' || plan === 'pro' || plan === 'professional') return 'plus';
  if (plan === 'enterprise') return 'enterprise';
  if (plan === 'developer') return 'developer';
  
  // free or any other value defaults to free
  return 'free';
};

const hasAccess = (requiredPlan: PlanLevel): boolean => {
  const userPlan = getUserPlan();
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
};

const UpgradePrompt: React.FC<{ requiredPlan: string }> = ({ requiredPlan }) => {
  const userPlan = getUserPlan();
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
          color: 'var(--text-primary)',
        }}>
          {isGuest ? 'Sign In Required' : 'Upgrade Required'}
        </h2>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          lineHeight: '1.6',
        }}>
          {isGuest 
            ? 'Please sign in to access this feature.'
            : `This feature requires a ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan or higher.`
          }
        </p>

        {isGuest ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a
              href="/login"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Sign In
            </a>
            <a
              href="/signup"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#6366f1',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                border: '1px solid #6366f1',
              }}
            >
              Create Account
            </a>
          </div>
        ) : (
          <a
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            View Plans & Upgrade
          </a>
        )}

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
        }}>
          {requiredPlan === 'plus' && 'Plus plan starts at $499/month'}
          {requiredPlan === 'enterprise' && 'Contact us for Enterprise pricing'}
        </p>
      </div>
    </div>
  );
};

const PlanRestrictedRoute: React.FC<PlanRestrictedRouteProps> = ({
  children,
  requiredPlan,
  redirectTo,
}) => {
  const userPlan = getUserPlan();
  const hasRequiredAccess = hasAccess(requiredPlan);
  
  console.log('[PlanRestrictedRoute] User plan:', userPlan);
  console.log('[PlanRestrictedRoute] Required plan:', requiredPlan);
  console.log('[PlanRestrictedRoute] Has access:', hasRequiredAccess);
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    console.log('[PlanRestrictedRoute] User not authenticated');
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <UpgradePrompt requiredPlan={requiredPlan} />;
  }

  // Check if user has required plan
  if (!hasRequiredAccess) {
    console.log('[PlanRestrictedRoute] User does not have required plan, showing upgrade prompt');
    return <UpgradePrompt requiredPlan={requiredPlan} />;
  }

  console.log('[PlanRestrictedRoute] User has access, rendering children');
  return <>{children}</>;
};

export default PlanRestrictedRoute;
export { getUserPlan, hasAccess };
