/**
 * Test Data Factories
 * Generate test data for components and API responses
 */

/**
 * User factory
 */
export const createUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'viewer',
  org: 'org-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Organization factory
 */
export const createOrganization = (overrides = {}) => ({
  id: 'org-123',
  name: 'Test Organization',
  plan: 'free',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Prediction factory
 */
export const createPrediction = (overrides = {}) => ({
  id: 'pred-123',
  title: 'Test Prediction',
  description: 'Test description',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Compliance summary factory
 */
export const createComplianceSummary = (overrides = {}) => ({
  score: 85,
  total_checks: 100,
  passed: 85,
  failed: 10,
  warning: 5,
  last_updated: '2024-01-01T00:00:00Z',
  ...overrides,
});

/**
 * API Error factory
 */
export const createApiError = (message = 'An error occurred', status = 500) => ({
  detail: message,
  status,
  timestamp: new Date().toISOString(),
});

/**
 * Paginated response factory
 */
export const createPaginatedResponse = <T,>(
  items: T[],
  overrides = {}
) => ({
  items,
  total: items.length,
  page: 1,
  page_size: 20,
  pages: Math.ceil(items.length / 20),
  ...overrides,
});

