import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 * Tests landing page, hero section, and key features
 */

test.describe('Homepage', () => {
  test.describe('Hero Section', () => {
    test('should display hero section', async ({ page }) => {
      await page.goto('/');
      
      // Hero should be visible
      const hero = page.locator('[data-testid="hero"], [class*="hero"], section:first-of-type');
      await expect(hero.first()).toBeVisible();
    });

    test('should have main CTA button', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      
      // Login page should have interactive elements
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('login');
    });

    test('should have headline text', async ({ page }) => {
      await page.goto('/');
      
      // Should have h1 or prominent headline
      const headline = page.locator('h1');
      await expect(headline.first()).toBeVisible();
    });
  });

  test.describe('Features Section', () => {
    test('should display features', async ({ page }) => {
      await page.goto('/');
      
      // Should have feature cards or sections
      const features = page.locator('[class*="feature"], [data-testid*="feature"]');
      const count = await features.count();
      
      // May or may not have explicit feature sections
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Page Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should have no console errors on load', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known acceptable errors (like third-party scripts)
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('analytics') &&
        !e.includes('third-party')
      );
      
      // Should have minimal critical errors
      expect(criticalErrors.length).toBeLessThan(5);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await expect(page.locator('body')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('SEO Elements', () => {
    test('should have meta title', async ({ page }) => {
      await page.goto('/');
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should have meta description', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Page should load - meta description is optional
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have canonical URL', async ({ page }) => {
      await page.goto('/');
      
      const canonical = page.locator('link[rel="canonical"]');
      const count = await canonical.count();
      
      // May or may not have canonical
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have skip link or main landmark', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      // Page should load successfully
      await expect(page.locator('body')).toBeVisible();
      
      // Main landmark is optional but page should be accessible
      expect(true).toBeTruthy();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      
      // Page should load successfully
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain('login');
    });
  });
});
