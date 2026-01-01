describe('Billing Flow', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
  });

  it('should display billing page', () => {
    cy.visit('/billing');
    cy.contains('Billing').should('be.visible');
  });

  it('should display pricing plans', () => {
    cy.visit('/billing');
    cy.contains('Team').should('be.visible');
    cy.contains('Enterprise').should('be.visible');
  });

  it('should navigate to payment methods', () => {
    cy.visit('/billing');
    cy.contains('Payment Methods').click();
    cy.url().should('include', '/billing');
  });
});

