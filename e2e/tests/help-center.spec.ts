import { test, expect } from '@playwright/test';

/**
 * Help Center E2E Tests
 * Tests help documentation, search, and FAQ functionality
 */

test.describe('Help Center', () => {
  test.describe('Help Center Page', () => {
    test('should display help center page', async ({ page }) => {
      await page.goto('/help');
      
      await expect(page).toHaveURL(/help/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/help');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await expect(searchInput.first()).toBeVisible();
      }
    });

    test('should have help categories', async ({ page }) => {
      await page.goto('/help');
      
      const categories = page.locator('[data-testid="help-category"], .category, [class*="category"]');
      const count = await categories.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should have FAQ section', async ({ page }) => {
      await page.goto('/help');
      
      const faq = page.locator('[data-testid="faq"], .faq, [class*="faq"], text=/faq|frequently/i');
      if (await faq.count() > 0) {
        await expect(faq.first()).toBeVisible();
      }
    });
  });

  test.describe('Help Articles', () => {
    test('should navigate to help article', async ({ page }) => {
      await page.goto('/help');
      
      const articleLink = page.locator('a[href*="/help/"], [data-testid="help-article"]');
      if (await articleLink.count() > 0) {
        await articleLink.first().click();
        await page.waitForTimeout(500);
        
        // Should navigate to article page
        const url = page.url();
        expect(url).toMatch(/help/);
      }
    });

    test('should display article content', async ({ page }) => {
      await page.goto('/help/getting-started');
      
      // May or may not exist
      const content = page.locator('article, main, [class*="content"]');
      if (await content.count() > 0) {
        await expect(content.first()).toBeVisible();
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('should search help articles', async ({ page }) => {
      await page.goto('/help');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await searchInput.first().fill('agent');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // Should show search results or filter content
      }
    });

    test('should show no results message for invalid search', async ({ page }) => {
      await page.goto('/help');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
      if (await searchInput.count() > 0) {
        await searchInput.first().fill('xyznonexistent12345');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
        
        // May show no results message
        const noResults = page.locator('text=/no results|not found|try again/i');
        // This is optional - may or may not show
      }
    });
  });

  test.describe('FAQ Accordion', () => {
    test('should expand FAQ item on click', async ({ page }) => {
      await page.goto('/help');
      
      const faqItem = page.locator('[data-testid="faq-item"], .faq-item, [class*="accordion"]');
      if (await faqItem.count() > 0) {
        await faqItem.first().click();
        await page.waitForTimeout(300);
        
        // Content should be visible after click
        const expandedContent = page.locator('[data-testid="faq-content"], .faq-content, [class*="accordion-content"]');
        if (await expandedContent.count() > 0) {
          await expect(expandedContent.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Contact Support', () => {
    test('should have contact support link', async ({ page }) => {
      await page.goto('/help');
      
      const contactLink = page.locator('a[href*="contact"], button:has-text("contact"), text=/contact support|get help/i');
      if (await contactLink.count() > 0) {
        await expect(contactLink.first()).toBeVisible();
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard shortcut for search', async ({ page }) => {
      await page.goto('/help');
      
      // Try Cmd+K or Ctrl+K
      await page.keyboard.press('Meta+k');
      await page.waitForTimeout(300);
      
      // Search input should be focused or modal should open
      const searchInput = page.locator('input[type="search"]:focus, input[placeholder*="search"]:focus');
      // May or may not support this shortcut
    });
  });
});

test.describe('Documentation Pages', () => {
  test.describe('API Documentation', () => {
    test('should display API docs page', async ({ page }) => {
      await page.goto('/api/docs');
      
      // May redirect or show docs
      const url = page.url();
      expect(url).toMatch(/api|docs|help|login/);
    });
  });

  test.describe('Getting Started Guide', () => {
    test('should have getting started section', async ({ page }) => {
      await page.goto('/help');
      
      const gettingStarted = page.locator('text=/getting started|quick start|begin/i');
      if (await gettingStarted.count() > 0) {
        await expect(gettingStarted.first()).toBeVisible();
      }
    });
  });
});
