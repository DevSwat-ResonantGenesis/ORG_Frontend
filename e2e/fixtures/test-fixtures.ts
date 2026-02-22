import { test as base, expect } from '@playwright/test';

/**
 * Test fixtures for E2E tests
 * Provides reusable test context and utilities
 */

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

// Test agent data
export const TEST_AGENT = {
  name: 'Test Agent',
  description: 'A test agent for E2E testing',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful test assistant.',
};

// Extended test fixture with authentication helpers
export const test = base.extend<{
  authenticatedPage: typeof base;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', TEST_USER.email);
    await page.fill('[data-testid="password-input"]', TEST_USER.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|agents|home)/);
    
    await use(base);
  },
});

export { expect };

// Page object helpers
export class AuthPage {
  constructor(private page: any) {}

  async login(email: string, password: string) {
    await this.page.goto('/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async signup(email: string, password: string, name: string) {
    await this.page.goto('/signup');
    await this.page.fill('[data-testid="name-input"]', name);
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="signup-button"]');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
  }
}

export class AgentPage {
  constructor(private page: any) {}

  async navigateToAgents() {
    await this.page.goto('/agents');
  }

  async createAgent(name: string, description: string) {
    await this.page.click('[data-testid="create-agent-button"]');
    await this.page.fill('[data-testid="agent-name-input"]', name);
    await this.page.fill('[data-testid="agent-description-input"]', description);
    await this.page.click('[data-testid="save-agent-button"]');
  }

  async deleteAgent(agentName: string) {
    await this.page.click(`[data-testid="agent-card-${agentName}"] [data-testid="delete-button"]`);
    await this.page.click('[data-testid="confirm-delete-button"]');
  }
}

export class NavigationHelper {
  constructor(private page: any) {}

  async goToHome() {
    await this.page.goto('/');
  }

  async goToAgents() {
    await this.page.goto('/agents');
  }

  async goToControlCenter() {
    await this.page.goto('/control-plane');
  }

  async goToNetwork() {
    await this.page.goto('/network/marketplace');
  }

  async goToMarketplace() {
    await this.page.goto('/marketplace');
  }

  async goToHelp() {
    await this.page.goto('/help');
  }

  async clickNavItem(itemText: string) {
    await this.page.click(`text=${itemText}`);
  }
}
