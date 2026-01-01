import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupMocks } from './helpers/mocks';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup mocks before all tests
beforeAll(() => {
  setupMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Clear all mocks
  vi.clearAllMocks();
});

// Mock window.matchMedia (also done in setupMocks, but keeping for compatibility)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver (also done in setupMocks, but keeping for compatibility)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (also done in setupMocks, but keeping for compatibility)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Suppress console errors in tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   error: vi.fn(),
//   warn: vi.fn(),
// };

