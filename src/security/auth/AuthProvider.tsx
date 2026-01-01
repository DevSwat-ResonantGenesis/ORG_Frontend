// ============== AUTH PROVIDER ==============

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSessionStore } from '../../stores';
import { initPermissionChecker } from '../permissions';
import { auditTrail } from '../../observability';
import type { Permission } from '../../types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  roles: string[];
  permissions: Permission[];
  login: (userId: string, roles: string[], permissions: Permission[]) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    userId,
    roles,
    permissions,
    authStatus,
    login: storeLogin,
    logout: storeLogout,
    hasPermission,
  } = useSessionStore();

  // Initialize permission checker when permissions change
  useEffect(() => {
    if (permissions.length > 0) {
      initPermissionChecker(permissions);
    }
  }, [permissions]);

  const login = (newUserId: string, newRoles: string[], newPermissions: Permission[]) => {
    storeLogin(newUserId, newRoles, newPermissions);
    initPermissionChecker(newPermissions);
    
    auditTrail.log(
      'auth.login',
      { userId: newUserId },
      { type: 'user', id: newUserId },
      { roles: newRoles, permissionCount: newPermissions.length }
    );
  };

  const logout = () => {
    const currentUserId = userId;
    storeLogout();
    
    if (currentUserId) {
      auditTrail.log(
        'auth.logout',
        { userId: currentUserId },
        { type: 'user', id: currentUserId },
        {}
      );
    }
  };

  const value: AuthContextValue = {
    isAuthenticated: authStatus === 'authenticated',
    isLoading: authStatus === 'loading',
    userId,
    roles,
    permissions,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
