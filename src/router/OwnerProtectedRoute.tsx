import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route that requires Owner/Superuser authentication.
 * Trusts session data from localStorage (set by login).
 * No API calls - immediate validation.
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  const sessionData = getSessionData();
  const isSuperuser = sessionData?.is_superuser === true;
  const isPlatformOwner = sessionData?.role === 'platform_owner';

  console.log('[OwnerProtectedRoute] Session data:', sessionData);
  console.log('[OwnerProtectedRoute] is_superuser:', isSuperuser);
  console.log('[OwnerProtectedRoute] role:', sessionData?.role);
  console.log('[OwnerProtectedRoute] isPlatformOwner:', isPlatformOwner);
  console.log('[OwnerProtectedRoute] isAuthenticated:', isAuthenticated());

  // Allow access if superuser OR platform_owner role
  if (!isAuthenticated() || (!isSuperuser && !isPlatformOwner)) {
    console.log('[OwnerProtectedRoute] Access denied - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('[OwnerProtectedRoute] Access granted');
  return <>{children}</>;
};

export default OwnerProtectedRoute;
