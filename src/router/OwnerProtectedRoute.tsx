import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import fastapiClient from '../api/fastapiClient';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner/Superuser authentication.
 * Checks session data first, then validates via API if needed.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAccess = async () => {
      // First check: Session data (fast path)
      const sessionData = getSessionData();
      if (isAuthenticated() && sessionData?.is_superuser) {
        console.log('[OwnerProtectedRoute] Superuser access granted via session');
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Second check: API validation (fallback)
      try {
        const response = await fastapiClient.get('/auth/me', {
          withCredentials: true,
        });
        
        if (response.data?.is_superuser) {
          console.log('[OwnerProtectedRoute] Superuser access granted via API');
          setIsAuthorized(true);
        } else {
          console.log('[OwnerProtectedRoute] Not a superuser');
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('[OwnerProtectedRoute] API validation failed:', error);
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OwnerProtectedRoute;
