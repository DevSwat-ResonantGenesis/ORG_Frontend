import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '../utils/auth-cookies';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  // Check if user is authenticated (session data exists)
  // Note: Tokens are in HttpOnly cookies and cannot be checked directly
  // Backend will return 401 if cookies are invalid/missing
  const sessionData = getSessionData();
  
  // Only require basic authentication - role and org can be optional
  // Some pages may work without full session data
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // If session data exists but is incomplete, still allow access
  // The backend will handle authorization
  return <>{children}</>;
};

export default ProtectedRoute;
