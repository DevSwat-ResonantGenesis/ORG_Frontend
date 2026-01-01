# Testing Guide

This directory contains the testing infrastructure for the ResonantGraphAI frontend.

## Structure

```
src/test/
├── setup.ts           # Vitest setup and global mocks
├── utils.tsx          # Custom render function with providers
├── helpers/           # Test utilities
│   ├── mocks.ts      # Mock helpers (localStorage, fetch, etc.)
│   ├── factories.ts  # Test data factories
│   ├── assertions.ts # Custom assertions
│   └── index.ts      # Central export
└── mocks/            # MSW mocks
    ├── server.ts     # MSW server setup
    └── handlers.ts   # API mock handlers
```

## Usage

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

### Using Test Factories

```tsx
import { createUser, createOrganization } from '@/test/helpers';

const user = createUser({ email: 'custom@example.com' });
const org = createOrganization({ name: 'Custom Org' });
```

### Using Mock Helpers

```tsx
import { mockLocalStorage, mockFetch } from '@/test/helpers';

beforeEach(() => {
  const localStorage = mockLocalStorage();
  Object.defineProperty(window, 'localStorage', { value: localStorage });
  
  mockFetch({ data: 'test' });
});
```

### Using Custom Assertions

```tsx
import { expectToBeAccessible, expectLoadingState } from '@/test/helpers';

it('renders accessible button', () => {
  const { container } = render(<Button>Click</Button>);
  const button = screen.getByRole('button');
  expectToBeAccessible(button);
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Coverage Goals

- **Current:** ~2% (5 test files)
- **Target:** 60%+ coverage
- **Priority:** Critical components first (Button, API client, auth)

## Best Practices

1. **Use custom render** - Always use `render` from `@/test/utils` instead of `@testing-library/react`
2. **Use factories** - Generate test data with factories instead of hardcoding
3. **Test accessibility** - Use `expectToBeAccessible` for UI components
4. **Mock external dependencies** - Use MSW for API mocking
5. **Clean up** - Mocks are automatically cleaned up after each test

## Writing New Tests

1. Create test file: `ComponentName.test.tsx`
2. Import utilities: `import { render, screen } from '@/test/utils';`
3. Use factories: `import { createUser } from '@/test/helpers';`
4. Write tests following AAA pattern (Arrange, Act, Assert)
5. Aim for 80%+ coverage on new components

