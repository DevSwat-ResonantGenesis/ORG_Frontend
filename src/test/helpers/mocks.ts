/**
 * Mock Helpers
 * Reusable mock functions and factories for testing
 */

import { vi } from 'vitest';

/**
 * Create a mock function with type safety
 */
export const createMockFn = <T extends (...args: any[]) => any>() => {
  return vi.fn<T>();
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = () => {
  return mockLocalStorage(); // Same implementation
};

/**
 * Mock window.location
 */
export const mockWindowLocation = (overrides: Partial<Location> = {}) => {
  const mockLocation = {
    href: 'http://localhost:5175/',
    origin: 'http://localhost:5175',
    protocol: 'http:',
    host: 'localhost:5175',
    hostname: 'localhost',
    port: '5175',
    pathname: '/',
    search: '',
    hash: '',
    ...overrides,
  };

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  return mockLocation;
};

/**
 * Mock fetch
 */
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
      redirected: false,
      type: 'default' as ResponseType,
      url: '',
      clone: vi.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: vi.fn(),
      blob: vi.fn(),
      formData: vi.fn(),
    } as Response)
  ) as any;
};

/**
 * Mock IntersectionObserver
 */
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
};

/**
 * Mock ResizeObserver
 */
export const mockResizeObserver = () => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;
};

/**
 * Mock matchMedia
 */
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

/**
 * Setup all common mocks
 */
export const setupMocks = () => {
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia();
};

