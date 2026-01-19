/**
 * Environment Configuration
 * 
 * PRODUCTION RULE: NO localhost fallbacks allowed
 * All environment variables MUST be set in production
 * Fail fast if required variables are missing
 */

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
    
    // In production, throw error immediately - NO FALLBACKS
    if (import.meta.env.PROD) {
      throw new Error(error);
    }
    
    // In development, warn but allow (for local dev only)
    console.warn(`⚠️  Using development mode - ${varName} not set`);
    return '';
  }
  
  return value;
}

// Validate and export environment configuration
export const ENV: EnvironmentConfig = {
  apiUrl: getRequiredEnv('API_URL', 'VITE_API_URL'),
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

// Validate all required variables are set in production
if (import.meta.env.PROD) {
  const missing: string[] = [];
  
  Object.entries(ENV).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    const error = `❌ PRODUCTION BUILD FAILED: Missing environment variables: ${missing.join(', ')}`;
    console.error(error);
    throw new Error(error);
  }
  
  console.log('✅ All required environment variables configured for production');
}

export default ENV;
