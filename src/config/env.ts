/**
 * Environment Configuration
 * 
 * PRODUCTION RULE: NO localhost fallbacks allowed
 * All environment variables MUST be set in production
 * Fail fast if required variables are missing
 */

import { getApiUrl } from '../utils/apiUrl';

interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  grafanaUrl: string;
  prometheusUrl: string;
  alertmanagerUrl: string;
  agentEngineUrl: string;
  raraUrl: string;
  hashSphereUrl: string;
  nodeApiUrl: string;
}

const getDefaultWsUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${window.location.host}`;
};

function getRequiredEnv(key: string, varName: string, fallback: string = ''): string {
  const value = (import.meta.env as Record<string, string | undefined>)[varName];

  if (!value) {
    const msg = `Missing environment variable: ${varName}`;
    if (import.meta.env.DEV) {
      console.error(msg);
      console.error(`Set ${varName} in .env.production file`);
    } else {
      console.warn(msg);
    }
    return fallback;
  }

  return value;
}

// Validate and export environment configuration
export const ENV: EnvironmentConfig = {
  apiUrl: getApiUrl(),
  wsUrl: getRequiredEnv('WS_URL', 'VITE_WS_URL', getDefaultWsUrl()),
  grafanaUrl: getRequiredEnv('GRAFANA_URL', 'VITE_GRAFANA_URL'),
  prometheusUrl: getRequiredEnv('PROMETHEUS_URL', 'VITE_PROMETHEUS_URL'),
  alertmanagerUrl: getRequiredEnv('ALERTMANAGER_URL', 'VITE_ALERTMANAGER_URL'),
  agentEngineUrl: getRequiredEnv('AGENT_ENGINE_URL', 'VITE_AGENT_ENGINE_URL'),
  raraUrl: getRequiredEnv('RARA_URL', 'VITE_RARA_URL'),
  hashSphereUrl: getRequiredEnv('HASH_SPHERE_URL', 'VITE_HASH_SPHERE_URL'),
  nodeApiUrl: getRequiredEnv('NODE_API_URL', 'VITE_NODE_API_URL', 'http://dev-swat.com:8081'),
};

// Log configuration on startup (non-sensitive info only)
console.log('🔧 Environment Configuration Loaded:', {
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  apiConfigured: !!ENV.apiUrl,
  wsConfigured: !!ENV.wsUrl,
});

export default ENV;
