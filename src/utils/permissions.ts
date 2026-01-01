/**
 * Role-based permission checking utilities.
 * Maps to backend RBAC system.
 */

export type Role = 
  | 'user' 
  | 'org_admin' 
  | 'platform_dev' 
  | 'finance' 
  | 'compliance' 
  | 'ml_engineer' 
  | 'viewer'
  | 'admin' // Legacy: maps to org_admin
  | 'security' // Legacy: maps to compliance
  | 'analyst'; // Legacy: maps to user

/**
 * Check if a role has permission to access a resource/action.
 */
export const hasPermission = (role: Role | null, resource: string, action: string): boolean => {
  if (!role) return false;
  
  // Map legacy roles to new roles
  const normalizedRole = normalizeRole(role);
  
  // Platform dev has all permissions
  if (normalizedRole === 'platform_dev') return true;
  
  // Permission matrix
  const permissions: Record<string, string[]> = {
    'dashboard:view': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'dashboard:manage': ['org_admin', 'platform_dev'],
    
    'predictions:create': ['user', 'org_admin', 'platform_dev'],
    'predictions:view': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'predictions:view_all': ['org_admin', 'platform_dev'],
    'predictions:delete': ['org_admin', 'platform_dev'],
    
    'policies:read': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'policies:crud': ['org_admin', 'platform_dev'],
    
    'compliance:view': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'compliance:manage': ['org_admin', 'platform_dev'],
    
    'audit:view_own': ['user', 'org_admin', 'platform_dev'],
    'audit:view_org': ['org_admin', 'platform_dev'],
    'audit:view_all': ['compliance', 'platform_dev'],
    
    'users:view': ['org_admin', 'platform_dev'],
    'users:manage': ['org_admin', 'platform_dev'],
    
    'billing:view': ['user', 'org_admin', 'finance', 'platform_dev'],
    'billing:full': ['org_admin', 'finance', 'platform_dev'],
    
    'settings:view': ['user', 'org_admin', 'platform_dev'],
    'settings:manage': ['org_admin', 'platform_dev'],
    
    'ml:view': ['org_admin', 'ml_engineer', 'compliance', 'platform_dev'],
    'ml:manage': ['ml_engineer', 'platform_dev'],
    
    'admin:system': ['platform_dev'],
  };
  
  const permission = `${resource}:${action}`;
  const allowedRoles = permissions[permission] || [];
  return allowedRoles.includes(normalizedRole);
};

/**
 * Normalize legacy roles to new role system.
 */
export const normalizeRole = (role: Role): Role => {
  const mapping: Record<string, Role> = {
    'admin': 'org_admin',
    'owner': 'org_admin',  // Organization owners get admin dashboard
    'security': 'compliance',
    'analyst': 'user',
  };
  return mapping[role] || role;
};

/**
 * Check if role can access a feature category.
 */
export const canAccess = (role: Role | null, category: string): boolean => {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  
  // Platform dev can access everything
  if (normalizedRole === 'platform_dev') return true;
  
  const categoryAccess: Record<string, Role[]> = {
    'dashboard': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'predictions': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'policies': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'compliance': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'audit': ['user', 'org_admin', 'compliance', 'platform_dev'],
    'users': ['org_admin', 'platform_dev'],
    'settings': ['user', 'org_admin', 'platform_dev'],
    'billing': ['user', 'org_admin', 'finance', 'platform_dev'],
    'organization': ['org_admin', 'platform_dev'],
    'ml_ops': ['ml_engineer', 'platform_dev'],
    'admin': ['platform_dev'],
    'finance': ['finance', 'platform_dev'],
    'viewer': ['viewer', 'platform_dev'], // Viewer can access viewer category
  };
  
  const allowedRoles = categoryAccess[category] || [];
  return allowedRoles.includes(normalizedRole);
};

/**
 * Check if role is admin (org_admin or platform_dev).
 */
export const isAdmin = (role: Role | null): boolean => {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return normalizedRole === 'org_admin' || normalizedRole === 'platform_dev';
};

/**
 * Check if role is platform developer.
 */
export const isPlatformDev = (role: Role | null): boolean => {
  if (!role) return false;
  return normalizeRole(role) === 'platform_dev';
};

