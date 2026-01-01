// ============== PERMISSION CHECKER ==============

import type { Permission, PermissionCheck } from './types';
import { PERMISSION_HIERARCHY } from './types';

export class PermissionChecker {
  private userPermissions: Set<Permission> = new Set();

  constructor(permissions: Permission[] = []) {
    this.setPermissions(permissions);
  }

  setPermissions(permissions: Permission[]): void {
    this.userPermissions = new Set(permissions);
    
    // Expand wildcard permissions
    permissions.forEach(p => {
      const expanded = PERMISSION_HIERARCHY[p];
      if (expanded) {
        expanded.forEach(ep => this.userPermissions.add(ep));
      }
    });
  }

  has(permission: Permission): boolean {
    // Check for admin wildcard
    if (this.userPermissions.has('admin:*')) {
      return true;
    }
    
    return this.userPermissions.has(permission);
  }

  hasAll(permissions: Permission[]): boolean {
    return permissions.every(p => this.has(p));
  }

  hasAny(permissions: Permission[]): boolean {
    return permissions.some(p => this.has(p));
  }

  check(permission: Permission): PermissionCheck {
    const granted = this.has(permission);
    return {
      permission,
      granted,
      reason: granted ? undefined : `Missing permission: ${permission}`,
    };
  }

  checkAll(permissions: Permission[]): PermissionCheck[] {
    return permissions.map(p => this.check(p));
  }

  // Get all current permissions
  getPermissions(): Permission[] {
    return Array.from(this.userPermissions);
  }

  // Check if user can perform action on resource
  canAccess(resource: string, action: 'read' | 'write' | 'delete' | 'execute'): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.has(permission);
  }
}

// Singleton for current user
let currentChecker: PermissionChecker | null = null;

export function initPermissionChecker(permissions: Permission[]): PermissionChecker {
  currentChecker = new PermissionChecker(permissions);
  return currentChecker;
}

export function getPermissionChecker(): PermissionChecker {
  if (!currentChecker) {
    currentChecker = new PermissionChecker([]);
  }
  return currentChecker;
}

export function hasPermission(permission: Permission): boolean {
  return getPermissionChecker().has(permission);
}

export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export default PermissionChecker;
