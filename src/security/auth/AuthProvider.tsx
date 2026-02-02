// ============== AUTH PROVIDER ==============

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useSessionStore } from '../../stores/sessionStore';
import { initPermissionChecker } from '../permissions';
import { auditTrail } from '../../observability';
import type { Permission } from '../../types';

// Proactive token refresh interval (50 minutes - before 60 min expiry)
// Increased from 45 to 50 minutes to give more buffer time
const TOKEN_REFRESH_INTERVAL_MS = 50 * 60 * 1000;

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

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize permission checker when permissions change
  useEffect(() => {
    if (permissions.length > 0) {
      initPermissionChecker(permissions);
    }
  }, [permissions]);

  // Proactive token refresh - refresh before expiry to prevent logout
  useEffect(() => {
    const isAuthenticated = authStatus === 'authenticated';
    
    if (isAuthenticated) {
      // Start proactive refresh interval
      const refreshTokenProactively = async () => {
        try {
          console.log('[AuthProvider] 🔄 Attempting proactive token refresh...');
          const { refreshToken } = await import('../../api/auth');
          const newToken = await refreshToken();
          if (newToken) {
            console.log('[AuthProvider] ✅ Proactive token refresh successful at', new Date().toLocaleTimeString());
          } else {
            console.warn('[AuthProvider] ⚠️ Proactive token refresh returned null');
          }
        } catch (error) {
          console.warn('[AuthProvider] ⚠️ Proactive token refresh failed:', error);
          // Don't logout on proactive refresh failure - let the 401 handler deal with it
        }
      };

      // Clear any existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Do an immediate refresh on mount to ensure token is fresh
      refreshTokenProactively();

      // Set up new interval for proactive refresh
      refreshIntervalRef.current = setInterval(refreshTokenProactively, TOKEN_REFRESH_INTERVAL_MS);
      console.log('[AuthProvider] 🔄 Proactive token refresh scheduled every 50 minutes');

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval when logged out
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }
  }, [authStatus]);

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
