import { APIEndpoint } from './APIEndpointsPanel';

// User Dashboard Endpoints
export const userEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/predictions',
    description: 'List all predictions with optional filters (date range, risk level, validity)',
    authRequired: true,
    exampleRequest: { start_date: '2025-01-01', limit: 50 },
    exampleResponse: { items: [], total: 0, limit: 50, offset: 0 }
  },
  {
    method: 'GET',
    path: '/predictions/{id}',
    description: 'Get detailed prediction by ID including validity, risk scores, and anchors',
    authRequired: true,
    exampleResponse: { id: 'pred-uuid', validity: 0.85, risk_level: 'medium', anchors: [] }
  },
  {
    method: 'POST',
    path: '/predictions',
    description: 'Create a new prediction from input text',
    authRequired: true,
    exampleRequest: { input_text: 'Text to analyze', context: {} },
    exampleResponse: { id: 'pred-uuid', validity: 0.85, created_at: '2025-01-15T10:00:00Z' }
  },
  {
    method: 'GET',
    path: '/evidence/{id}',
    description: 'Get evidence graph visualization data for a prediction',
    authRequired: true,
    exampleResponse: { nodes: [], edges: [] }
  }
];

// Org Admin Dashboard Endpoints
export const orgAdminEndpoints: APIEndpoint[] = [
  ...userEndpoints,
  {
    method: 'GET',
    path: '/orgs/{id}',
    description: 'Get organization details and settings',
    authRequired: true,
    roleRequired: ['org_admin', 'admin']
  },
  {
    method: 'POST',
    path: '/orgs/{id}/users',
    description: 'Invite a new user to the organization',
    authRequired: true,
    roleRequired: ['org_admin', 'admin'],
    exampleRequest: { email: 'user@example.com', role: 'user' },
    exampleResponse: { id: 'user-uuid', email: 'user@example.com', role: 'user' }
  },
  {
    method: 'PUT',
    path: '/orgs/{id}/users/{user_id}',
    description: 'Update user role or status',
    authRequired: true,
    roleRequired: ['org_admin', 'admin'],
    exampleRequest: { role: 'compliance' }
  },
  {
    method: 'POST',
    path: '/orgs/{id}/api-keys',
    description: 'Create a new API key for the organization',
    authRequired: true,
    roleRequired: ['org_admin', 'admin'],
    exampleRequest: { name: 'Production API Key' },
    exampleResponse: { id: 'key-uuid', name: 'Production API Key', key: 'sk-...' }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/api-keys',
    description: 'List all API keys for the organization',
    authRequired: true,
    roleRequired: ['org_admin', 'admin']
  },
  {
    method: 'DELETE',
    path: '/orgs/{id}/api-keys/{key_id}',
    description: 'Revoke an API key',
    authRequired: true,
    roleRequired: ['org_admin', 'admin']
  }
];

// ML Engineer Dashboard Endpoints (MLOps API - Complete)
export const mlEngineerEndpoints: APIEndpoint[] = [
  ...userEndpoints,
  {
    method: 'GET',
    path: '/ml/training-jobs',
    description: 'List all training jobs with status and metrics',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'GET',
    path: '/ml/training-jobs/{id}',
    description: 'Get training job details and progress',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'POST',
    path: '/ml/training-jobs',
    description: 'Create a new training job',
    authRequired: true,
    roleRequired: ['ml_engineer'],
    exampleRequest: { dataset_hash_id: 'dataset-123', notes: 'Retraining with new data' },
    exampleResponse: { id: 'job-uuid', status: 'queued', created_at: '2025-01-15T10:00:00Z' }
  },
  {
    method: 'POST',
    path: '/ml/training-jobs/{id}/stop',
    description: 'Stop a running training job',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'GET',
    path: '/ml/model-versions',
    description: 'List all model versions with performance metrics',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'POST',
    path: '/ml/model-versions/{id}/promote',
    description: 'Promote a model version to production',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'POST',
    path: '/ml/model-versions/{id}/rollback',
    description: 'Rollback to a previous model version',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'GET',
    path: '/ml/worker/metrics',
    description: 'Get ML worker metrics and performance',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'GET',
    path: '/ml/worker/logs',
    description: 'Get ML worker logs for debugging',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'GET',
    path: '/ml/evaluations',
    description: 'List all model evaluations',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'POST',
    path: '/ml/evaluations',
    description: 'Run a new model evaluation',
    authRequired: true,
    roleRequired: ['ml_engineer'],
    exampleRequest: { model_version_id: 'model-123', test_dataset: 'test-dataset-456' },
    exampleResponse: { id: 'eval-uuid', status: 'running', created_at: '2025-01-15T10:00:00Z' }
  },
  {
    method: 'GET',
    path: '/ml/drift-detections',
    description: 'List all drift detection results',
    authRequired: true,
    roleRequired: ['ml_engineer']
  },
  {
    method: 'POST',
    path: '/ml/drift-detections',
    description: 'Run drift detection on a model',
    authRequired: true,
    roleRequired: ['ml_engineer'],
    exampleRequest: { model_version_id: 'model-123', reference_data: 'ref-data-456' },
    exampleResponse: { id: 'drift-uuid', drift_score: 0.15, status: 'completed' }
  }
];

// Compliance Dashboard Endpoints (Policy Management API - Complete)
export const complianceEndpoints: APIEndpoint[] = [
  ...userEndpoints,
  {
    method: 'GET',
    path: '/compliance/violations',
    description: 'List all compliance violations with filters',
    authRequired: true,
    roleRequired: ['compliance']
  },
  {
    method: 'GET',
    path: '/compliance/summary',
    description: 'Get compliance summary statistics',
    authRequired: true,
    roleRequired: ['compliance']
  },
  {
    method: 'GET',
    path: '/policies',
    description: 'List all AI governance policies',
    authRequired: true,
    roleRequired: ['compliance', 'org_admin']
  },
  {
    method: 'POST',
    path: '/policies',
    description: 'Create a new AI governance policy',
    authRequired: true,
    roleRequired: ['compliance', 'org_admin'],
    exampleRequest: { name: 'GDPR Compliance', rule_type: 'pii_detection', threshold: 0.8 },
    exampleResponse: { id: 'policy-uuid', name: 'GDPR Compliance', status: 'active' }
  },
  {
    method: 'PUT',
    path: '/policies/{id}',
    description: 'Update an existing AI governance policy',
    authRequired: true,
    roleRequired: ['compliance', 'org_admin'],
    exampleRequest: { threshold: 0.9, enabled: true }
  },
  {
    method: 'DELETE',
    path: '/policies/{id}',
    description: 'Delete an AI governance policy',
    authRequired: true,
    roleRequired: ['compliance', 'admin']
  }
];

// Finance Dashboard Endpoints
export const financeEndpoints: APIEndpoint[] = [
  ...userEndpoints,
  {
    method: 'GET',
    path: '/finance/invoices',
    description: 'List all invoices for the organization',
    authRequired: true,
    roleRequired: ['finance']
  },
  {
    method: 'GET',
    path: '/finance/invoices/{id}',
    description: 'Get invoice details and download PDF',
    authRequired: true,
    roleRequired: ['finance']
  },
  {
    method: 'GET',
    path: '/finance/reports',
    description: 'Get financial reports and analytics',
    authRequired: true,
    roleRequired: ['finance']
  },
  {
    method: 'GET',
    path: '/finance/credits',
    description: 'Get credit balance and transaction history',
    authRequired: true,
    roleRequired: ['finance']
  },
  {
    method: 'POST',
    path: '/finance/refunds',
    description: 'Request a refund for a transaction',
    authRequired: true,
    roleRequired: ['finance']
  }
];

// Platform Dev Dashboard Endpoints
export const platformDevEndpoints: APIEndpoint[] = [
  ...orgAdminEndpoints,
  {
    method: 'GET',
    path: '/admin/system',
    description: 'Get system-wide metrics and status',
    authRequired: true,
    roleRequired: ['platform_dev']
  },
  {
    method: 'GET',
    path: '/admin/feature-flags',
    description: 'List all feature flags',
    authRequired: true,
    roleRequired: ['platform_dev']
  },
  {
    method: 'POST',
    path: '/admin/feature-flags',
    description: 'Create or update a feature flag',
    authRequired: true,
    roleRequired: ['platform_dev']
  },
  {
    method: 'GET',
    path: '/admin/users',
    description: 'List all users across all organizations',
    authRequired: true,
    roleRequired: ['platform_dev']
  },
  {
    method: 'GET',
    path: '/admin/logs',
    description: 'Get system logs and audit trails',
    authRequired: true,
    roleRequired: ['platform_dev']
  }
];

// Viewer Dashboard Endpoints (Read-only)
export const viewerEndpoints: APIEndpoint[] = [
  {
    method: 'GET',
    path: '/predictions',
    description: 'View predictions (read-only)',
    authRequired: true,
    roleRequired: ['viewer']
  },
  {
    method: 'GET',
    path: '/predictions/{id}',
    description: 'View prediction details (read-only)',
    authRequired: true,
    roleRequired: ['viewer']
  },
  {
    method: 'GET',
    path: '/compliance/summary',
    description: 'View compliance summary (read-only)',
    authRequired: true,
    roleRequired: ['viewer']
  }
];


