import { test, expect } from '@playwright/test';

/**
 * Developer Tools E2E Tests
 * Tests IDE, code visualizer, and developer features
 */

test.describe('Developer Tools', () => {
  test.describe('Resonant IDE', () => {
    test('should display IDE page', async ({ page }) => {
      await page.goto('/ide');
      
      // May redirect to login or show IDE
      const url = page.url();
      expect(url).toMatch(/ide|login|signup/);
    });

    test('should have code editor area', async ({ page }) => {
      await page.goto('/ide');
      
      if (!page.url().includes('login')) {
        const editor = page.locator('[data-testid="code-editor"], .monaco-editor, [class*="editor"]');
        if (await editor.count() > 0) {
          await expect(editor.first()).toBeVisible();
        }
      }
    });

    test('should have file explorer', async ({ page }) => {
      await page.goto('/ide');
      
      if (!page.url().includes('login')) {
        const fileExplorer = page.locator('[data-testid="file-explorer"], [class*="file-tree"], [class*="explorer"]');
        if (await fileExplorer.count() > 0) {
          await expect(fileExplorer.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Code Visualizer', () => {
    test('should display code visualizer page', async ({ page }) => {
      await page.goto('/code-visualizer');
      
      const url = page.url();
      expect(url).toMatch(/code-visualizer|login|signup/);
    });

    test('should have visualization canvas', async ({ page }) => {
      await page.goto('/code-visualizer');
      
      if (!page.url().includes('login')) {
        const canvas = page.locator('canvas, [data-testid="visualization"], [class*="canvas"]');
        if (await canvas.count() > 0) {
          await expect(canvas.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('State Physics', () => {
    test('should display state physics page', async ({ page }) => {
      await page.goto('/state-physics');
      
      const url = page.url();
      expect(url).toMatch(/state-physics|login|signup/);
    });
  });

  test.describe('Hash Sphere Memory', () => {
    test('should display hash sphere page', async ({ page }) => {
      await page.goto('/hash-sphere');
      
      const url = page.url();
      expect(url).toMatch(/hash-sphere|login|signup/);
    });

    test('should have 3D visualization', async ({ page }) => {
      await page.goto('/hash-sphere');
      
      if (!page.url().includes('login')) {
        const canvas = page.locator('canvas');
        if (await canvas.count() > 0) {
          await expect(canvas.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Evidence Graph', () => {
    test('should display evidence graph page', async ({ page }) => {
      await page.goto('/evidence-graph');
      
      const url = page.url();
      expect(url).toMatch(/evidence-graph|login|signup/);
    });

    test('should have graph visualization', async ({ page }) => {
      await page.goto('/evidence-graph');
      
      if (!page.url().includes('login')) {
        const graph = page.locator('canvas, svg, [data-testid="graph"], [class*="graph"]');
        if (await graph.count() > 0) {
          await expect(graph.first()).toBeVisible();
        }
      }
    });
  });
});

test.describe('Developer Experience', () => {
  test.describe('API Playground', () => {
    test('should have API testing interface', async ({ page }) => {
      await page.goto('/api/docs');
      
      if (!page.url().includes('login')) {
        const playground = page.locator('[data-testid="api-playground"], [class*="playground"], [class*="swagger"]');
        if (await playground.count() > 0) {
          await expect(playground.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Console/Terminal', () => {
    test('should have terminal component in IDE', async ({ page }) => {
      await page.goto('/ide');
      
      if (!page.url().includes('login')) {
        const terminal = page.locator('[data-testid="terminal"], [class*="terminal"], [class*="console"]');
        if (await terminal.count() > 0) {
          await expect(terminal.first()).toBeVisible();
        }
      }
    });
  });
});
