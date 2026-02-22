# E2E Testing with Playwright

This directory contains end-to-end tests using [Playwright](https://playwright.dev/).

## Setup

Install Playwright and browsers:

```bash
npm install -D @playwright/test
npx playwright install
```

## Running Tests

```bash
# Run all tests
npm run test:playwright

# Run tests with UI
npm run test:playwright:ui

# Run tests in headed mode (see browser)
npm run test:playwright:headed

# Debug tests
npm run test:playwright:debug

# Run specific test file
npx playwright test e2e/tests/auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── fixtures/           # Test fixtures and helpers
│   └── test-fixtures.ts
├── pages/              # Page object models (future)
├── tests/              # Test specifications
│   ├── auth.spec.ts          # Authentication tests
│   ├── navigation.spec.ts    # Navigation tests
│   ├── agents.spec.ts        # Agent CRUD tests
│   ├── control-center.spec.ts # Control Center tests
│   └── homepage.spec.ts      # Homepage tests
└── README.md
```

## Test Categories

### Authentication Tests (`auth.spec.ts`)
- Login page display
- Invalid credentials handling
- Signup flow
- Protected route redirects
- Public route access

### Navigation Tests (`navigation.spec.ts`)
- Header navigation
- Mobile hamburger menu
- Footer links
- Dropdown menus
- 404 handling

### Agent Tests (`agents.spec.ts`)
- Agent list page
- Agent browser
- Agent templates
- Workflow designer
- Agent teams

### Control Center Tests (`control-center.spec.ts`)
- Overview page
- Monitoring section
- Analysis section
- Governance section
- Tools section

### Homepage Tests (`homepage.spec.ts`)
- Hero section
- Features display
- Page performance
- Responsive design
- SEO elements
- Accessibility

## Configuration

See `playwright.config.ts` in the project root for:
- Browser configurations
- Base URL settings
- Screenshot/video on failure
- Parallel execution settings
- Web server configuration

## Writing New Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes

Set `PLAYWRIGHT_BASE_URL` environment variable for different environments:

```bash
PLAYWRIGHT_BASE_URL=https://staging.example.com npx playwright test
```

## Reports

HTML reports are generated in `playwright-report/` directory after test runs.

```bash
npx playwright show-report
```
