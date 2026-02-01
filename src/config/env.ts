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
}

function getRequiredEnv(key: string, varName: string): string {
  const value = import.meta.env[varName];
  
  if (!value) {
    const error = `❌ FATAL: Missing required environment variable: ${varName}`;
    console.error(error);
    console.error(`Set ${varName} in .env.production file`);

    console.warn(`⚠️  ${varName} not set; continuing with safe defaults`);
    return '';
  }
  
  return value;
}

// Validate and export environment configuration
export const ENV: EnvironmentConfig = {
  apiUrl: getApiUrl(),
  wsUrl: getRequiredEnv('WS_URL', 'VITE_WS_URL'),
  grafanaUrl: getRequiredEnv('GRAFANA_URL', 'VITE_GRAFANA_URL'),
  prometheusUrl: getRequiredEnv('PROMETHEUS_URL', 'VITE_PROMETHEUS_URL'),
  alertmanagerUrl: getRequiredEnv('ALERTMANAGER_URL', 'VITE_ALERTMANAGER_URL'),
  agentEngineUrl: getRequiredEnv('AGENT_ENGINE_URL', 'VITE_AGENT_ENGINE_URL'),
  raraUrl: getRequiredEnv('RARA_URL', 'VITE_RARA_URL'),
  hashSphereUrl: getRequiredEnv('HASH_SPHERE_URL', 'VITE_HASH_SPHERE_URL'),
};

// Log configuration on startup (non-sensitive info only)
console.log('🔧 Environment Configuration Loaded:', {
  mode: import.meta.env.MODE,
  prod: import.meta.env.PROD,
  apiConfigured: !!ENV.apiUrl,
  wsConfigured: !!ENV.wsUrl,
});

export default ENV;
