/**
 * Module 6: Enterprise Mode API
 * Multi-tenant, SSO, role-based access
 */
import { getApiUrl } from '@/utils/apiUrl';

export interface Tenant {
  tenant_id: string;
  name: string;
  domain: string;
  sso_enabled: boolean;
  sso_type?: string;
  max_users?: number;
  compute_quota_cpu_hours?: number;
  compute_quota_ram_gb?: number;
  storage_quota_gb?: number;
}

export interface SSOConfig {
  tenant_id: string;
  sso_type: string;
  config: Record<string, any>;
}

export interface UserRole {
  user_id: string;
  tenant_id: string;
  role: string;
  permissions: string[];
}

/**
 * Create tenant
 */
export async function createTenant(tenant: Tenant): Promise<{ tenant_id: string; status: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/tenant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(tenant),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create tenant' }));
    throw new Error(error.detail || 'Failed to create tenant');
  }

  return response.json();
}

/**
 * Get tenant
 */
export async function getTenant(tenantId: string): Promise<Tenant> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/tenant/${tenantId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get tenant' }));
    throw new Error(error.detail || 'Failed to get tenant');
  }

  return response.json();
}

/**
 * Configure SSO
 */
export async function configureSSO(config: SSOConfig): Promise<{ status: string; tenant_id: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/sso/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to configure SSO' }));
    throw new Error(error.detail || 'Failed to configure SSO');
  }

  return response.json();
}

/**
 * Get SSO config
 */
export async function getSSOConfig(tenantId: string): Promise<SSOConfig> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/sso/config/${tenantId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get SSO config' }));
    throw new Error(error.detail || 'Failed to get SSO config');
  }

  return response.json();
}

/**
 * Assign user role
 */
export async function assignUserRole(role: UserRole): Promise<{ status: string; user_id: string; role: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/user/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(role),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to assign role' }));
    throw new Error(error.detail || 'Failed to assign role');
  }

  return response.json();
}

/**
 * Get tenant users
 */
export async function getTenantUsers(tenantId: string): Promise<{ tenant_id: string; users: UserRole[] }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/users/${tenantId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get users' }));
    throw new Error(error.detail || 'Failed to get users');
  }

  return response.json();
}

/**
 * Get tenant quota
 */
export async function getTenantQuota(tenantId: string): Promise<{
  tenant_id: string;
  quotas: Record<string, any>;
  usage: Record<string, any>;
}> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/enterprise/quota/${tenantId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get quota' }));
    throw new Error(error.detail || 'Failed to get quota');
  }

  return response.json();
}

