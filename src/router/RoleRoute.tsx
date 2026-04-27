import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { canAccess, normalizeRole, type Role } from '../utils/permissions';

type RoleRouteProps = {
  allowed?: string[]; // Legacy: list of roles
  category?: string; // New: category-based access
  children: React.ReactNode;
};

const RoleRoute = ({ allowed, category, children }: RoleRouteProps) => {
  const { role } = getSession();
  const userRole = role as Role | null;
  
  // New category-based check
  if (category) {
    if (!canAccess(userRole, category)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }
  
  // Legacy role list check (backward compatible)
  if (allowed) {
    const normalizedUserRole = userRole ? normalizeRole(userRole) : null;
    if (!normalizedUserRole || !allowed.some(r => normalizeRole(r as Role) === normalizedUserRole)) {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

export default RoleRoute;
