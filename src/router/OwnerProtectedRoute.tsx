import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import fastapiClient from '../api/fastapiClient';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner authentication.
 * SECURITY FIX: Now uses HttpOnly cookies for tokens (no localStorage)
 * Validates via cookie-based API call to prevent XSS token theft.
 * Redirects to /owner-login if not authenticated.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateOwnerToken = async () => {
      // Check for owner token in localStorage
      const token = localStorage.getItem('owner_token');
      const tokenExpires = localStorage.getItem('owner_token_expires');
      
      // Check if token exists and is not expired
      if (!token) {
        console.log('No owner token found');
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }
      
      // Check expiration
      if (tokenExpires && Date.now() > parseInt(tokenExpires, 10)) {
        console.log('Owner token expired');
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        localStorage.removeItem('owner_email');
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }
      
      try {
        // Call validation endpoint with Bearer token
        const response = await fastapiClient.get('/owner/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        // Check if response indicates owner role
        if (response.data && response.data.role === 'owner') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Owner token validation failed:', error);
        // Clean up invalid tokens
        localStorage.removeItem('owner_token');
        localStorage.removeItem('owner_token_expires');
        localStorage.removeItem('owner_email');
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
