import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '../utils/auth-cookies';

type Props = {
  children: React.ReactNode;
};

const SubscriptionRequiredRoute = ({ children }: Props) => {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated()) {
        setHasSubscription(false);
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('owner_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('/api/billing/subscription', {
          credentials: 'include',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          // Check if user has an active subscription
          const isActiveSubscription = data.plan && data.status === 'active';
          setHasSubscription(isActiveSubscription);
        } else {
          // If we can't check subscription (404 or other error), assume no subscription
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
        // On any error, assume no subscription to be safe
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'transparent',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hasSubscription) {
    return <Navigate to="/new-user-pricing" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRequiredRoute;
