import { http, HttpResponse } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          full_name: 'Test User',
        },
      });
    }
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Predictions
  http.get('/api/predictions', () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
    });
  }),

  // Organizations
  http.get('/api/orgs', () => {
    return HttpResponse.json({
      id: 'org-123',
      name: 'Test Org',
      plan: 'free',
      status: 'active',
    });
  }),
];

