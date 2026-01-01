/**
 * Custom Assertions
 * Reusable assertion helpers for common test patterns
 */

import { expect } from 'vitest';

/**
 * Assert that an element is accessible
 */
export const expectToBeAccessible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
  
  // Check for basic accessibility attributes
  if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
    expect(element).not.toHaveAttribute('aria-disabled', 'true');
  }
};

/**
 * Assert that a component handles loading state
 */
export const expectLoadingState = (container: HTMLElement) => {
  // Look for common loading indicators
  const loadingIndicators = [
    container.querySelector('[data-testid="loading"]'),
    container.querySelector('.loading'),
    container.querySelector('.spinner'),
    container.querySelector('[aria-busy="true"]'),
  ].filter(Boolean);

  expect(loadingIndicators.length).toBeGreaterThan(0);
};

/**
 * Assert that a component handles error state
 */
export const expectErrorState = (container: HTMLElement, errorMessage?: string) => {
  const errorElements = [
    container.querySelector('[data-testid="error"]'),
    container.querySelector('.error'),
    container.querySelector('[role="alert"]'),
  ].filter(Boolean);

  expect(errorElements.length).toBeGreaterThan(0);

  if (errorMessage) {
    expect(container).toHaveTextContent(errorMessage);
  }
};

/**
 * Assert that a component handles empty state
 */
export const expectEmptyState = (container: HTMLElement) => {
  const emptyIndicators = [
    container.querySelector('[data-testid="empty"]'),
    container.querySelector('.empty-state'),
    container.querySelector('[data-empty="true"]'),
  ].filter(Boolean);

  expect(emptyIndicators.length).toBeGreaterThan(0);
};

/**
 * Assert form validation
 */
export const expectFormValidation = (
  form: HTMLFormElement,
  fieldName: string,
  shouldBeValid: boolean
) => {
  const field = form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
  expect(field).toBeInTheDocument();

  if (shouldBeValid) {
    expect(field).toBeValid();
  } else {
    expect(field).toBeInvalid();
  }
};

/**
 * Assert navigation occurred
 */
export const expectNavigation = (path: string) => {
  expect(window.location.pathname).toBe(path);
};

