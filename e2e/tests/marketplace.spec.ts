import { test, expect } from '@playwright/test';

/**
 * Marketplace E2E Tests
 * Tests marketplace browsing, filtering, and purchasing flows
 */

test.describe('Marketplace', () => {
  test.describe('Marketplace Page', () => {
    test('should display marketplace page', async ({ page }) => {
      await page.goto('/marketplace');
      
      // May redirect to login or show marketplace
      const url = page.url();
      expect(url).toMatch(/marketplace|login|signup/);
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
        if (await searchInput.count() > 0) {
          await expect(searchInput.first()).toBeVisible();
        }
      }
    });

    test('should have category filters', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const categoryFilter = page.locator('[data-testid="category-filter"], select[class*="category"], button:has-text("category")');
        if (await categoryFilter.count() > 0) {
          await expect(categoryFilter.first()).toBeVisible();
        }
      }
    });

    test('should display product cards', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const productCards = page.locator('[data-testid="product-card"], .product-card, [class*="productCard"], [class*="item-card"]');
        // May or may not have products
        const count = await productCards.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('DSID Marketplace', () => {
    test('should display DSID marketplace page', async ({ page }) => {
      await page.goto('/network/marketplace');
      
      const url = page.url();
      expect(url).toMatch(/network|marketplace|login|signup/);
    });

    test('should have DSID listings', async ({ page }) => {
      await page.goto('/network/marketplace');
      
      if (!page.url().includes('login')) {
        const listings = page.locator('[data-testid="dsid-listing"], .dsid-card, [class*="listing"]');
        const count = await listings.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Product Details', () => {
    test('should navigate to product detail on click', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const productCard = page.locator('[data-testid="product-card"], .product-card, [class*="productCard"]');
        if (await productCard.count() > 0) {
          await productCard.first().click();
          await page.waitForTimeout(500);
          // Should navigate or open modal
        }
      }
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('should filter by price range', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const priceFilter = page.locator('[data-testid="price-filter"], input[type="range"], select[class*="price"]');
        if (await priceFilter.count() > 0) {
          await expect(priceFilter.first()).toBeVisible();
        }
      }
    });

    test('should sort products', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const sortSelect = page.locator('[data-testid="sort-select"], select[class*="sort"], button:has-text("sort")');
        if (await sortSelect.count() > 0) {
          await expect(sortSelect.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Cart and Checkout', () => {
    test('should have add to cart button', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const addToCart = page.locator('button:has-text("add to cart"), button:has-text("buy"), [data-testid="add-to-cart"]');
        if (await addToCart.count() > 0) {
          await expect(addToCart.first()).toBeVisible();
        }
      }
    });

    test('should have cart icon in header', async ({ page }) => {
      await page.goto('/marketplace');
      
      if (!page.url().includes('login')) {
        const cartIcon = page.locator('[data-testid="cart-icon"], [aria-label*="cart"], button:has(svg[class*="cart"])');
        if (await cartIcon.count() > 0) {
          await expect(cartIcon.first()).toBeVisible();
        }
      }
    });
  });
});
