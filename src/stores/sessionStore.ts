import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SessionState, Permission } from '../types';

// ============== SESSION DOMAIN STORE ==============

interface SessionStoreState extends SessionState {
  // Actions
  login: (userId: string, roles: string[], permissions: Permission[]) => void;
  logout: () => void;
  refreshSession: (expiry: Date) => void;
  setOrganization: (orgId: string) => void;
  addPermission: (permission: Permission) => void;
  removePermission: (permission: Permission) => void;
  setAuthStatus: (status: 'authenticated' | 'unauthenticated' | 'loading') => void;
  hasPermission: (permission: Permission) => boolean;
  reset: () => void;
}

const initialState: SessionState = {
  userId: null,
  roles: [],
  permissions: [],
  sessionExpiry: null,
  activeOrganization: null,
  authStatus: 'unauthenticated',
};

export const useSessionStore = create<SessionStoreState>()(
  devtools(
    (set, get) => ({
        ...initialState,
        
        login: (userId: string, roles: string[], permissions: Permission[]) => set({
          userId,
          roles,
          permissions,
          authStatus: 'authenticated',
          sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }),
        
        logout: () => set({
          ...initialState,
          authStatus: 'unauthenticated',
        }),
        
        refreshSession: (expiry: Date) => set({ sessionExpiry: expiry }),
        
        setOrganization: (orgId: string) => set({ activeOrganization: orgId }),
        
        addPermission: (permission: Permission) => set((state) => ({
          permissions: state.permissions.includes(permission) 
            ? state.permissions 
            : [...state.permissions, permission]
        })),
        
        removePermission: (permission: Permission) => set((state) => ({
          permissions: state.permissions.filter((p: Permission) => p !== permission)
        })),
        
        setAuthStatus: (status: 'authenticated' | 'unauthenticated' | 'loading') => set({ authStatus: status }),
        
        hasPermission: (permission: Permission) => {
          const state = get();
          if (state.permissions.includes('admin:*')) return true;
          return state.permissions.includes(permission);
        },
        
        reset: () => set(initialState),
      }),
    { name: 'SessionStore' }
  )
);

// Selectors
export const selectUserId = (state: SessionStoreState) => state.userId;
export const selectIsAuthenticated = (state: SessionStoreState) => state.authStatus === 'authenticated';
export const selectRoles = (state: SessionStoreState) => state.roles;
export const selectPermissions = (state: SessionStoreState) => state.permissions;
export const selectActiveOrganization = (state: SessionStoreState) => state.activeOrganization;
