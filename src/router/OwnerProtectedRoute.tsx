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
      // SECURITY FIX: Tokens are now in HttpOnly cookies
      // No longer reading from localStorage (XSS vulnerable)
      // Backend will validate the rg_access_token cookie
      
      try {
        // Call validation endpoint - cookies sent automatically
        const response = await fastapiClient.get('/owner/auth/validate', {
          credentials: 'include',  // Ensure cookies are sent
        });
        
        // Check if response indicates owner role
        if (response.data && response.data.role === 'owner') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Owner token validation failed:', error);
        // Clean up any legacy localStorage tokens
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
