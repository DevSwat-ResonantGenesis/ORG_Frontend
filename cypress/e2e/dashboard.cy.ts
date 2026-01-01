describe('Dashboard Flow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
  });

  it('should display dashboard after login', () => {
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should navigate to predictions', () => {
    cy.visit('/dashboard');
    cy.contains('Predictions').click();
    cy.url().should('include', '/predictions');
  });

  it('should display user menu', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});

