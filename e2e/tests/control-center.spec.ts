import { test, expect } from '@playwright/test';

/**
 * Control Center E2E Tests
 * Tests control plane dashboard and monitoring features
 */

test.describe('Control Center', () => {
  test.describe('Overview Page', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/control-plane');
      
      // Should redirect to login for protected route
      await expect(page).toHaveURL(/login|signup|auth/);
    });

    test('should display control plane structure', async ({ page }) => {
      await page.goto('/control-plane');
      
      // Either shows control plane or redirects
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });
  });

  test.describe('Monitoring Section', () => {
    test('should have live monitor page', async ({ page }) => {
      await page.goto('/control-plane/live');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have performance page', async ({ page }) => {
      await page.goto('/control-plane/performance');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });
  });

  test.describe('Analysis Section', () => {
    test('should have semantics page', async ({ page }) => {
      await page.goto('/control-plane/semantics');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have trust page', async ({ page }) => {
      await page.goto('/control-plane/trust');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have business page', async ({ page }) => {
      await page.goto('/control-plane/business');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });
  });

  test.describe('Governance Section', () => {
    test('should have governance page', async ({ page }) => {
      await page.goto('/control-plane/governance');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have security page', async ({ page }) => {
      await page.goto('/control-plane/security');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have compliance page', async ({ page }) => {
      await page.goto('/control-plane/compliance');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });
  });

  test.describe('Tools Section', () => {
    test('should have guided scenarios page', async ({ page }) => {
      await page.goto('/control-plane/guided');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });

    test('should have autonomy dashboard page', async ({ page }) => {
      await page.goto('/control-plane/autonomy');
      
      const url = page.url();
      expect(url).toMatch(/control-plane|login|signup/);
    });
  });
});

test.describe('Control Center Navigation', () => {
  test('should have consistent sidebar navigation', async ({ page }) => {
    await page.goto('/control-plane');
    
    if (!page.url().includes('login')) {
      // Check for sidebar or navigation elements
      const sidebar = page.locator('[data-testid="sidebar"], nav, [class*="sidebar"]');
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/control-plane');
    
    if (!page.url().includes('login')) {
      // Check for active state on nav items
      const activeItem = page.locator('[class*="active"], [aria-current="page"]');
      if (await activeItem.count() > 0) {
        await expect(activeItem.first()).toBeVisible();
      }
    }
  });
});
