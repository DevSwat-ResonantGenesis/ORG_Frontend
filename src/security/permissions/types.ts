// ============== PERMISSION TYPES ==============

export type Permission = 
  | 'agents:read' | 'agents:write' | 'agents:delete' | 'agents:execute'
  | 'workflows:read' | 'workflows:write' | 'workflows:execute' | 'workflows:delete'
  | 'executions:read' | 'executions:write' | 'executions:cancel'
  | 'economy:read' | 'economy:transfer' | 'economy:admin'
  | 'settings:read' | 'settings:write'
  | 'audit:read' | 'audit:export'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'admin:*';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

export interface PermissionCheck {
  permission: Permission;
  granted: boolean;
  reason?: string;
}

// Predefined roles
export const SYSTEM_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['admin:*'],
    isSystem: true,
  },
  {
    id: 'operator',
    name: 'Operator',
    description: 'Can manage agents and executions',
    permissions: [
      'agents:read', 'agents:write', 'agents:execute',
      'workflows:read', 'workflows:write', 'workflows:execute',
      'executions:read', 'executions:write', 'executions:cancel',
      'economy:read',
      'audit:read',
    ],
    isSystem: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      'agents:read',
      'workflows:read',
      'executions:read',
      'economy:read',
      'audit:read',
    ],
    isSystem: true,
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Can create and modify agents and workflows',
    permissions: [
      'agents:read', 'agents:write',
      'workflows:read', 'workflows:write',
      'executions:read',
      'settings:read',
    ],
    isSystem: true,
  },
];

// Permission hierarchy for wildcard matching
export const PERMISSION_HIERARCHY: Record<string, Permission[]> = {
  'admin:*': [
    'agents:read', 'agents:write', 'agents:delete', 'agents:execute',
    'workflows:read', 'workflows:write', 'workflows:execute', 'workflows:delete',
    'executions:read', 'executions:write', 'executions:cancel',
    'economy:read', 'economy:transfer', 'economy:admin',
    'settings:read', 'settings:write',
    'audit:read', 'audit:export',
    'users:read', 'users:write', 'users:delete',
  ],
};
