// ============== API HEALTH CHECK SERVICE ==============
// Comprehensive health checking for all backend services

import client from './client';

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latency: number;
  message?: string;
  lastChecked: Date;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  timestamp: Date;
}

const SERVICES = [
  { name: 'Gateway', endpoint: '/health' },
  { name: 'Auth', endpoint: '/auth/health' },
  { name: 'Chat', endpoint: '/resonant-chat/health' },
  { name: 'Memory', endpoint: '/memory/health' },
  { name: 'Agents', endpoint: '/agents/health' },
  { name: 'ML', endpoint: '/ml/health' },
  { name: 'LLM', endpoint: '/llm/health' },
  { name: 'Workflow', endpoint: '/workflow/health' },
  { name: 'IDE', endpoint: '/ide/health' },
  { name: 'Billing', endpoint: '/billing/health' },
  { name: 'Blockchain', endpoint: '/blockchain/health' },
];

async function checkService(name: string, endpoint: string): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    const response = await client.get(endpoint, { timeout: 5000 });
    const latency = performance.now() - startTime;
    
    return {
      service: name,
      status: response.status === 200 ? 'healthy' : 'degraded',
      latency: Math.round(latency),
      message: response.data?.message || 'OK',
      lastChecked: new Date(),
    };
  } catch (error: any) {
    const latency = performance.now() - startTime;
    
    if (error.code === 'ECONNABORTED') {
      return {
        service: name,
        status: 'unhealthy',
        latency: Math.round(latency),
        message: 'Request timeout',
        lastChecked: new Date(),
      };
    }
    
    if (error.response?.status === 404) {
      return {
        service: name,
        status: 'unknown',
        latency: Math.round(latency),
        message: 'Health endpoint not found',
        lastChecked: new Date(),
      };
    }
    
    return {
      service: name,
      status: 'unhealthy',
      latency: Math.round(latency),
      message: error.message || 'Connection failed',
      lastChecked: new Date(),
    };
  }
}

export async function checkAllServices(): Promise<HealthCheckResult> {
  const results = await Promise.all(
    SERVICES.map(s => checkService(s.name, s.endpoint))
  );
  
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
  
  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (unhealthyCount === 0 && healthyCount === results.length) {
    overall = 'healthy';
  } else if (unhealthyCount > results.length / 2) {
    overall = 'unhealthy';
  } else {
    overall = 'degraded';
  }
  
  return {
    overall,
    services: results,
    timestamp: new Date(),
  };
}

export async function checkGateway(): Promise<boolean> {
  try {
    const response = await client.get('/health', { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

// ============== ENDPOINT TESTING ==============

export interface EndpointTestResult {
  endpoint: string;
  method: string;
  status: 'pass' | 'fail' | 'skip';
  statusCode?: number;
  latency: number;
  error?: string;
}

export interface EndpointTest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  requiresAuth?: boolean;
  expectedStatus?: number;
}

const ENDPOINT_TESTS: EndpointTest[] = [
  // Auth endpoints
  { name: 'Auth Health', method: 'GET', endpoint: '/auth/health', expectedStatus: 200 },
  { name: 'Get Current User', method: 'GET', endpoint: '/auth/me', requiresAuth: true, expectedStatus: 200 },
  
  // Chat endpoints
  { name: 'Chat Health', method: 'GET', endpoint: '/resonant-chat/health', expectedStatus: 200 },
  { name: 'List Chats', method: 'GET', endpoint: '/resonant-chat/chats', requiresAuth: true },
  
  // Agents endpoints
  { name: 'Agents Health', method: 'GET', endpoint: '/agents/health', expectedStatus: 200 },
  { name: 'List Agents', method: 'GET', endpoint: '/agents/', requiresAuth: true },
  { name: 'List Tools', method: 'GET', endpoint: '/agents/tools', requiresAuth: true },
  
  // Memory endpoints
  { name: 'Memory Health', method: 'GET', endpoint: '/memory/health', expectedStatus: 200 },
  { name: 'Memory Stats', method: 'GET', endpoint: '/memory/stats', requiresAuth: true },
  
  // LLM endpoints
  { name: 'LLM Health', method: 'GET', endpoint: '/llm/health', expectedStatus: 200 },
  { name: 'List Providers', method: 'GET', endpoint: '/llm/providers', requiresAuth: true },
  { name: 'List Models', method: 'GET', endpoint: '/llm/models', requiresAuth: true },
  
  // ML endpoints
  { name: 'ML Health', method: 'GET', endpoint: '/ml/health', expectedStatus: 200 },
  { name: 'List Models', method: 'GET', endpoint: '/ml/models', requiresAuth: true },
  
  // Workflow endpoints
  { name: 'Workflow Health', method: 'GET', endpoint: '/workflow/health', expectedStatus: 200 },
  { name: 'List Workflows', method: 'GET', endpoint: '/workflow/workflows', requiresAuth: true },
  
  // IDE endpoints
  { name: 'IDE Health', method: 'GET', endpoint: '/ide/health', expectedStatus: 200 },
  
  // Billing endpoints
  { name: 'Billing Health', method: 'GET', endpoint: '/billing/health', expectedStatus: 200 },
  { name: 'List Plans', method: 'GET', endpoint: '/billing/plans' },
  
  // Marketplace endpoints
  { name: 'List Plugins', method: 'GET', endpoint: '/marketplace/plugins' },
  { name: 'List Templates', method: 'GET', endpoint: '/marketplace/templates' },
];

export async function testEndpoint(test: EndpointTest, isAuthenticated: boolean): Promise<EndpointTestResult> {
  const startTime = performance.now();
  
  // Skip auth-required tests if not authenticated
  if (test.requiresAuth && !isAuthenticated) {
    return {
      endpoint: test.endpoint,
      method: test.method,
      status: 'skip',
      latency: 0,
      error: 'Requires authentication',
    };
  }
  
  try {
    let response;
    
    switch (test.method) {
      case 'GET':
        response = await client.get(test.endpoint, { timeout: 10000 });
        break;
      case 'POST':
        response = await client.post(test.endpoint, test.body || {}, { timeout: 10000 });
        break;
      case 'PUT':
        response = await client.put(test.endpoint, test.body || {}, { timeout: 10000 });
        break;
      case 'DELETE':
        response = await client.delete(test.endpoint, { timeout: 10000 });
        break;
    }
    
    const latency = performance.now() - startTime;
    const expectedStatus = test.expectedStatus || 200;
    
    return {
      endpoint: test.endpoint,
      method: test.method,
      status: response.status === expectedStatus ? 'pass' : 'fail',
      statusCode: response.status,
      latency: Math.round(latency),
    };
  } catch (error: any) {
    const latency = performance.now() - startTime;
    
    return {
      endpoint: test.endpoint,
      method: test.method,
      status: 'fail',
      statusCode: error.response?.status,
      latency: Math.round(latency),
      error: error.message || 'Request failed',
    };
  }
}

export async function runAllEndpointTests(isAuthenticated: boolean = false): Promise<{
  passed: number;
  failed: number;
  skipped: number;
  results: EndpointTestResult[];
}> {
  const results: EndpointTestResult[] = [];
  
  for (const test of ENDPOINT_TESTS) {
    const result = await testEndpoint(test, isAuthenticated);
    results.push(result);
    console.log(
      `${result.status === 'pass' ? '✅' : result.status === 'skip' ? '⏭️' : '❌'} ${test.name}: ${result.statusCode || result.error} (${result.latency}ms)`
    );
  }
  
  return {
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    skipped: results.filter(r => r.status === 'skip').length,
    results,
  };
}

export default {
  checkAllServices,
  checkGateway,
  testEndpoint,
  runAllEndpointTests,
  SERVICES,
  ENDPOINT_TESTS,
};
