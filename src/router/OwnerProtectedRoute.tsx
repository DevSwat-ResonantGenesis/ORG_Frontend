import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import fastapiClient from '../api/fastapiClient';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner/Superuser authentication.
 * Now accepts both:
 * 1. Regular superusers (is_superuser=true in session)
 * 2. Legacy owner_token authentication
 * Redirects to /login if not authenticated.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAccess = async () => {
      // First check: Regular session with superuser flag
      const sessionData = getSessionData();
      if (isAuthenticated() && sessionData?.is_superuser) {
        console.log('Superuser access granted via session');
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Second check: Legacy owner token
      const token = localStorage.getItem('owner_token');
      const tokenExpires = localStorage.getItem('owner_token_expires');
      
      if (!token) {
        // No owner token, check if regular user is logged in
        if (isAuthenticated()) {
          // Regular user trying to access owner page - redirect to dashboard
          console.log('Regular user - no owner access');
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }
      
      // Check expiration
      if (tokenExpires && Date.now() > parseInt(tokenExpires, 10)) {
        console.log('Owner token expired');
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        localStorage.removeItem('owner_email');
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }
      
      try {
        const response = await fastapiClient.get('/owner/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.data && response.data.role === 'owner') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Owner token validation failed:', error);
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        localStorage.removeItem('owner_email');
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAccess();
  }, []);

  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: 'var(--text-secondary)',
      }}>
        Validating owner access...
      </div>
    );
  }

  if (!isAuthorized) {
    // Redirect to regular login (not owner-login which doesn't exist)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OwnerProtectedRoute;
