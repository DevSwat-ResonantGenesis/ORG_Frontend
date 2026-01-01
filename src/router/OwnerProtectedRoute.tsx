import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import fastapiClient from '../api/fastapiClient';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner authentication.
 * Uses separate owner token stored in localStorage.
 * Redirects to /owner-login if not authenticated.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateOwnerToken = async () => {
      const token = localStorage.getItem('owner_token');
      const expiresAt = localStorage.getItem('owner_token_expires');

      // Check if token exists and not expired
      if (!token || !expiresAt) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Check if token is expired locally
      if (Date.now() > parseInt(expiresAt)) {
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token with server
      try {
        await fastapiClient.get('/owner/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Owner token validation failed:', error);
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateOwnerToken();
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

  if (!isAuthenticated) {
    // Redirect to owner login, preserving the intended destination
    return <Navigate to="/owner-login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OwnerProtectedRoute;
