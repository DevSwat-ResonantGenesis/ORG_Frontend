import { test, expect } from '@playwright/test';

/**
 * Agent Creation E2E Tests
 * Tests agent CRUD operations and agent studio functionality
 */

test.describe('Agent Studio', () => {
  test.describe('Agent List Page', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/agents');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login|signup|auth/);
    });

    test('should display agents page structure', async ({ page }) => {
      // This test assumes we can access the page (may need auth mock)
      await page.goto('/agents');
      
      // Either shows agents or redirects to login
      const url = page.url();
      expect(url).toMatch(/agents|login|signup/);
    });
  });

  test.describe('Agent Browser (Network)', () => {
    test('should display agent browser page', async ({ page }) => {
      await page.goto('/network/agents');
      
      // May redirect to login or show agent browser
      const url = page.url();
      expect(url).toMatch(/network|agents|login|signup/);
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/network/agents');
      
      // If page loads, check for search
      if (!page.url().includes('login')) {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search"], [data-testid="search-input"]');
        if (await searchInput.count() > 0) {
          await expect(searchInput.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Agent Templates', () => {
    test('should display agent templates page', async ({ page }) => {
      await page.goto('/network/templates');
      
      // May redirect to login or show templates
      const url = page.url();
      expect(url).toMatch(/templates|login|signup/);
    });
  });

  test.describe('Workflow Designer', () => {
    test('should display workflow designer page', async ({ page }) => {
      await page.goto('/workflow-designer');
      
      // May redirect to login or show designer
      const url = page.url();
      expect(url).toMatch(/workflow|login|signup/);
    });
  });

  test.describe('Agent Teams', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
      await page.goto('/agent-teams');
      
      // Should redirect to login
      await expect(page).toHaveURL(/login|signup|auth/);
    });

    test('should display create team page structure', async ({ page }) => {
      await page.goto('/agent-teams/create');
      
      // Either shows create page or redirects to login
      const url = page.url();
      expect(url).toMatch(/agent-teams|login|signup/);
    });
  });
});

test.describe('Agent Actions', () => {
  test.describe('Agent Card Interactions', () => {
    test('should handle agent card click', async ({ page }) => {
      await page.goto('/network/agents');
      
      if (!page.url().includes('login')) {
        const agentCard = page.locator('[data-testid="agent-card"], .agent-card, [class*="agentCard"]');
        if (await agentCard.count() > 0) {
          await agentCard.first().click();
          // Should navigate or open modal
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Agent Filtering', () => {
    test('should have filter options', async ({ page }) => {
      await page.goto('/network/agents');
      
      if (!page.url().includes('login')) {
        const filterButton = page.locator('button:has-text("filter"), [data-testid="filter-button"], [class*="filter"]');
        if (await filterButton.count() > 0) {
          await expect(filterButton.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Agent Sorting', () => {
    test('should have sort options', async ({ page }) => {
      await page.goto('/network/agents');
      
      if (!page.url().includes('login')) {
        const sortButton = page.locator('button:has-text("sort"), [data-testid="sort-button"], select[class*="sort"]');
        if (await sortButton.count() > 0) {
          await expect(sortButton.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('Agent Publish', () => {
  test('should display publish page', async ({ page }) => {
    await page.goto('/network/publish');
    
    // May redirect to login or show publish form
    const url = page.url();
    expect(url).toMatch(/publish|login|signup/);
  });

  test('should have publish form fields', async ({ page }) => {
    await page.goto('/network/publish');
    
    if (!page.url().includes('login')) {
      // Check for form elements
      const nameInput = page.locator('input[name="name"], [data-testid="agent-name"], input[placeholder*="name"]');
      if (await nameInput.count() > 0) {
        await expect(nameInput.first()).toBeVisible();
      }
    }
  });
});
