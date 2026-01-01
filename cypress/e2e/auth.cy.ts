describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Sign in').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('invalid@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    // Wait for error message
    cy.contains('Invalid', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to forgot password', () => {
    cy.visit('/login');
    cy.contains('Forgot password').click();
    cy.url().should('include', '/forgot-password');
  });
});

