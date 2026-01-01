/**
 * Module B: One-Click Serverless Deploy API
 * Vercel and DigitalOcean deployment endpoints
 */
import { getApiUrl } from '@/utils/apiUrl';

export interface VercelDeployRequest {
  project_id: string;
  name: string;
  framework?: string;
  vercel_token?: string;
}

export interface DigitalOceanDeployRequest {
  project_id: string;
  name: string;
  region?: string;
  do_token?: string;
}

export interface DeploymentResponse {
  deployment_id: string;
  status: string;
  url?: string;
  logs_url?: string;
}

export interface DeploymentStatus {
  deployment_id: string;
  status: string;
  provider: string;
}

/**
 * Deploy to Vercel
 */
export async function deployToVercel(request: VercelDeployRequest): Promise<DeploymentResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/deploy/vercel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to deploy to Vercel' }));
    throw new Error(error.detail || 'Failed to deploy to Vercel');
  }

  return response.json();
}

/**
 * Deploy to DigitalOcean
 */
export async function deployToDigitalOcean(request: DigitalOceanDeployRequest): Promise<DeploymentResponse> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/deploy/digitalocean`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to deploy to DigitalOcean' }));
    throw new Error(error.detail || 'Failed to deploy to DigitalOcean');
  }

  return response.json();
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(
  deploymentId: string,
  provider: 'vercel' | 'digitalocean' = 'vercel'
): Promise<DeploymentStatus> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/deploy/${deploymentId}/status?provider=${provider}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get deployment status' }));
    throw new Error(error.detail || 'Failed to get deployment status');
  }

  return response.json();
}

/**
 * Get deployment logs
 */
export async function getDeploymentLogs(
  deploymentId: string,
  provider: 'vercel' | 'digitalocean' = 'vercel'
): Promise<{ deployment_id: string; logs: string; provider: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/deploy/${deploymentId}/logs?provider=${provider}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to get deployment logs' }));
    throw new Error(error.detail || 'Failed to get deployment logs');
  }

  return response.json();
}

