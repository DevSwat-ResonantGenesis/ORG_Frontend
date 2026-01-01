/**
 * Module E: Plugin System API
 * Plugin management endpoints
 */
import { getApiUrl } from '@/utils/apiUrl';

export interface PluginInfo {
  plugin_id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  permissions: string[];
}

export interface PluginInstallResponse {
  plugin_id: string;
  name: string;
  version: string;
  status: string;
}

/**
 * Install a plugin from ZIP file
 */
export async function installPlugin(file: File): Promise<PluginInstallResponse> {
  const apiUrl = getApiUrl();
  const formData = new FormData();
  formData.append('plugin_file', file);

  const response = await fetch(`${apiUrl}/api/plugins/install`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to install plugin' }));
    throw new Error(error.detail || 'Failed to install plugin');
  }

  return response.json();
}

/**
 * List all installed plugins
 */
export async function listPlugins(): Promise<PluginInfo[]> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/plugins`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to list plugins' }));
    throw new Error(error.detail || 'Failed to list plugins');
  }

  return response.json();
}

/**
 * Enable a plugin
 */
export async function enablePlugin(pluginId: string): Promise<{ plugin_id: string; status: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/plugins/${pluginId}/enable`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to enable plugin' }));
    throw new Error(error.detail || 'Failed to enable plugin');
  }

  return response.json();
}

/**
 * Disable a plugin
 */
export async function disablePlugin(pluginId: string): Promise<{ plugin_id: string; status: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/plugins/${pluginId}/disable`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to disable plugin' }));
    throw new Error(error.detail || 'Failed to disable plugin');
  }

  return response.json();
}

/**
 * Uninstall a plugin
 */
export async function uninstallPlugin(pluginId: string): Promise<{ plugin_id: string; status: string }> {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/plugins/${pluginId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to uninstall plugin' }));
    throw new Error(error.detail || 'Failed to uninstall plugin');
  }

  return response.json();
}

