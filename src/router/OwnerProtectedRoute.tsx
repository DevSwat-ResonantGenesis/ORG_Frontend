import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner/Superuser authentication.
 * Trusts gateway's x-is-superuser header (injected from auth service).
 * No API calls - immediate validation from session data.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  const sessionData = getSessionData();
  const isSuperuser = sessionData?.is_superuser === true;

  if (!isAuthenticated() || !isSuperuser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default OwnerProtectedRoute;
